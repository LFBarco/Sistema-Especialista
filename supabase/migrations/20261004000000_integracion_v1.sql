-- Integración con sistemas de gestión veterinaria (PMS) — API v1
-- Ejecutar completo en Supabase > SQL Editor. Es idempotente: se puede volver a ejecutar.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Integradores (por ejemplo, Veterinari) y sus API keys
-- ---------------------------------------------------------------------------
create table if not exists public.integradores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  webhook_url text,
  webhook_secret text not null default encode(gen_random_bytes(32), 'hex'),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.integrador_api_keys (
  id uuid primary key default gen_random_uuid(),
  integrador_id uuid not null references public.integradores(id) on delete cascade,
  prefijo text not null,
  key_hash text not null unique,
  activo boolean not null default true,
  ultimo_uso timestamptz,
  created_at timestamptz not null default now(),
  revocada_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Clínicas del integrador vinculadas a clínicas de VetSpecialist
-- clinica_id = id del registro "clinicas:<id>" en kv_store_91d1f360
-- ---------------------------------------------------------------------------
create table if not exists public.integracion_clinicas (
  id uuid primary key default gen_random_uuid(),
  integrador_id uuid not null references public.integradores(id) on delete cascade,
  clinica_externa_id text not null,
  clinica_id text not null,
  nombre text not null,
  ruc text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (integrador_id, clinica_externa_id)
);

-- ---------------------------------------------------------------------------
-- Afiliación clínica <-> especialista (el especialista aprueba)
-- ---------------------------------------------------------------------------
create table if not exists public.afiliaciones (
  id uuid primary key default gen_random_uuid(),
  especialista_id text not null,
  clinica_id text not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'aprobada', 'rechazada', 'revocada')),
  origen text not null default 'portal',
  integrador_id uuid references public.integradores(id) on delete set null,
  mensaje text,
  created_at timestamptz not null default now(),
  respondida_at timestamptz,
  unique (especialista_id, clinica_id)
);

-- ---------------------------------------------------------------------------
-- Solicitudes creadas por un integrador
-- solicitud_id = id del registro "solicitudes:<id>" en kv_store_91d1f360
-- ---------------------------------------------------------------------------
create table if not exists public.integracion_solicitudes (
  solicitud_id text primary key,
  integrador_id uuid not null references public.integradores(id) on delete cascade,
  clinica_id text not null,
  especialista_id text not null,
  clinica_externa_id text not null,
  sede_externa_id text,
  paciente_externo_id text,
  referencia_externa text,
  idempotency_key text,
  servicio_id text,
  estado text not null default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (integrador_id, idempotency_key)
);

create index if not exists integracion_solicitudes_ref_idx
  on public.integracion_solicitudes (integrador_id, referencia_externa);
create index if not exists integracion_solicitudes_servicio_idx
  on public.integracion_solicitudes (servicio_id);

-- ---------------------------------------------------------------------------
-- Borradores para el botón "Solicitar especialista" (enlace de un solo uso)
-- ---------------------------------------------------------------------------
create table if not exists public.integracion_borradores (
  token text primary key,
  integrador_id uuid not null references public.integradores(id) on delete cascade,
  clinica_id text not null,
  clinica_externa_id text not null,
  datos jsonb not null,
  expira_at timestamptz not null,
  usado_at timestamptz,
  solicitud_id text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Cola de avisos (webhooks) hacia el integrador
-- ---------------------------------------------------------------------------
create table if not exists public.webhook_eventos (
  id uuid primary key default gen_random_uuid(),
  integrador_id uuid not null references public.integradores(id) on delete cascade,
  tipo text not null,
  solicitud_id text,
  payload jsonb not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'procesando', 'enviado', 'fallido')),
  intentos int not null default 0,
  proximo_intento timestamptz not null default now(),
  ultimo_error text,
  created_at timestamptz not null default now(),
  enviado_at timestamptz
);

create index if not exists webhook_eventos_cola_idx
  on public.webhook_eventos (estado, proximo_intento);

-- Solo el backend (service_role) accede a estas tablas.
alter table public.integradores enable row level security;
alter table public.integrador_api_keys enable row level security;
alter table public.integracion_clinicas enable row level security;
alter table public.afiliaciones enable row level security;
alter table public.integracion_solicitudes enable row level security;
alter table public.integracion_borradores enable row level security;
alter table public.webhook_eventos enable row level security;

-- ---------------------------------------------------------------------------
-- Toma un lote de eventos para enviar sin que dos procesos envíen el mismo
-- ---------------------------------------------------------------------------
create or replace function public.integracion_tomar_eventos(p_limite int default 50)
returns setof public.webhook_eventos
language sql
security definer
set search_path = public
as $$
  update public.webhook_eventos e
     set estado = 'procesando',
         proximo_intento = now() + interval '5 minutes'
   where e.id in (
     select id from public.webhook_eventos
      where estado in ('pendiente', 'procesando')
        and proximo_intento <= now()
      order by created_at
      limit p_limite
      for update skip locked
   )
  returning e.*;
$$;

revoke all on function public.integracion_tomar_eventos(int) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Trigger: detecta cambios en solicitudes y servicios (kv_store_91d1f360)
-- y encola los avisos para el integrador que originó la solicitud.
-- ---------------------------------------------------------------------------
create or replace function public.integracion_encolar(
  p_sol public.integracion_solicitudes,
  p_tipo text,
  p_extra jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.webhook_eventos (integrador_id, tipo, solicitud_id, payload)
  values (
    p_sol.integrador_id,
    p_tipo,
    p_sol.solicitud_id,
    jsonb_build_object(
      'solicitudId', p_sol.solicitud_id,
      'referenciaExterna', p_sol.referencia_externa,
      'clinicaExternaId', p_sol.clinica_externa_id,
      'sedeExternaId', p_sol.sede_externa_id,
      'pacienteExternoId', p_sol.paciente_externo_id,
      'especialistaId', p_sol.especialista_id
    ) || coalesce(p_extra, '{}'::jsonb)
  );
end;
$$;

create or replace function public.integracion_detectar_cambios()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sol public.integracion_solicitudes;
  v_new jsonb := new.value;
  v_old jsonb := case when tg_op = 'UPDATE' then old.value else null end;
begin
  if new.key like 'solicitudes:%' then
    select * into v_sol from public.integracion_solicitudes
     where solicitud_id = v_new->>'id';
    if not found then
      return new;
    end if;
    if v_old is not null and (v_old->>'estado') is not distinct from (v_new->>'estado') then
      return new;
    end if;
    if coalesce(v_new->>'canceladoPor', '') = 'integrador' then
      return new;
    end if;

    if v_new->>'estado' = 'aceptada' then
      update public.integracion_solicitudes set estado = 'aceptada', updated_at = now()
       where solicitud_id = v_sol.solicitud_id;
      perform public.integracion_encolar(v_sol, 'solicitud.aceptada', jsonb_build_object(
        'estado', 'aceptada',
        'fecha', v_new->>'fechaSolicitada',
        'hora', v_new->>'horaSolicitada'
      ));
    elsif v_new->>'estado' = 'rechazada' then
      update public.integracion_solicitudes set estado = 'rechazada', updated_at = now()
       where solicitud_id = v_sol.solicitud_id;
      perform public.integracion_encolar(v_sol, 'solicitud.rechazada', jsonb_build_object(
        'estado', 'rechazada',
        'motivo', v_new->>'motivoRechazo'
      ));
    end if;
    return new;
  end if;

  if new.key like 'servicios:%' then
    if (v_new->>'solicitudId') is null then
      return new;
    end if;
    select * into v_sol from public.integracion_solicitudes
     where solicitud_id = v_new->>'solicitudId';
    if not found then
      return new;
    end if;

    if v_sol.servicio_id is distinct from (v_new->>'id') then
      update public.integracion_solicitudes set servicio_id = v_new->>'id', updated_at = now()
       where solicitud_id = v_sol.solicitud_id;
    end if;

    if v_old is null then
      return new;
    end if;
    if coalesce(v_new->>'canceladoPor', '') = 'integrador' then
      return new;
    end if;

    if (v_new->>'fecha', v_new->>'hora') is distinct from (v_old->>'fecha', v_old->>'hora')
       and coalesce(v_new->>'estado', '') not in ('cancelado') then
      perform public.integracion_encolar(v_sol, 'servicio.reprogramado', jsonb_build_object(
        'fecha', v_new->>'fecha',
        'hora', v_new->>'hora',
        'fechaAnterior', v_old->>'fecha',
        'horaAnterior', v_old->>'hora'
      ));
    end if;

    if v_new->>'estado' = 'completado' and (v_old->>'estado') is distinct from 'completado' then
      update public.integracion_solicitudes set estado = 'completada', updated_at = now()
       where solicitud_id = v_sol.solicitud_id;
      perform public.integracion_encolar(v_sol, 'servicio.completado', jsonb_build_object(
        'estado', 'completada',
        'fecha', v_new->>'fecha',
        'hora', v_new->>'hora'
      ));
    end if;

    if v_new->>'estado' = 'cancelado' and (v_old->>'estado') is distinct from 'cancelado' then
      update public.integracion_solicitudes set estado = 'cancelada', updated_at = now()
       where solicitud_id = v_sol.solicitud_id;
      perform public.integracion_encolar(v_sol, 'servicio.cancelado', jsonb_build_object(
        'estado', 'cancelada'
      ));
    end if;

    if (v_new->'informe'->>'path') is not null
       and (v_new->'informe'->>'path') is distinct from (v_old->'informe'->>'path') then
      perform public.integracion_encolar(v_sol, 'informe.disponible', jsonb_build_object(
        'nombreArchivo', v_new->'informe'->>'nombre',
        'subidoEn', v_new->'informe'->>'subidoEn'
      ));
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists integracion_detectar_cambios on public.kv_store_91d1f360;
create trigger integracion_detectar_cambios
  after insert or update on public.kv_store_91d1f360
  for each row execute function public.integracion_detectar_cambios();
