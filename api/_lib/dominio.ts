import { BUCKET_INFORMES, db, kvGet, kvPorPrefijo, kvSet } from './db.js';
import { HttpError, fecha, hora, numero, opcion, texto, type Integrador } from './http.js';

// ---------------------------------------------------------------------------
// Especialistas
// ---------------------------------------------------------------------------

export async function obtenerEspecialista(id: string): Promise<any> {
  const esp = await kvGet(`especialistas:${id}`);
  if (!esp || esp.activo === false) {
    throw new HttpError(404, 'especialista_no_encontrado', 'Especialista no encontrado');
  }
  return esp;
}

export async function especialistaPorEmail(email: string): Promise<any | null> {
  const buscado = email.trim().toLowerCase();
  const todos = await kvPorPrefijo('especialistas:');
  return todos.find((e) => String(e.email ?? '').toLowerCase() === buscado) ?? null;
}

export function formatearEspecialista(esp: any, afiliacion?: string) {
  return {
    id: String(esp.id),
    nombre: [esp.nombre, esp.apellido].filter(Boolean).join(' '),
    especialidad: esp.especialidad ?? null,
    ciudad: esp.ciudad ?? null,
    modalidad: esp.modalidad ?? [],
    tarifaBase: esp.tarifa ?? null,
    verificado: esp.verificacion?.estado === 'verificado',
    ...(afiliacion ? { afiliacion } : {}),
  };
}

// ---------------------------------------------------------------------------
// Clínicas del integrador
// ---------------------------------------------------------------------------

export async function clinicaDelIntegrador(integradorId: string, clinicaExternaId: unknown) {
  const ext = texto(clinicaExternaId, 'clinicaExternaId', { requerido: true, max: 100 })!;
  const { data, error } = await db()
    .from('integracion_clinicas')
    .select('*')
    .eq('integrador_id', integradorId)
    .eq('clinica_externa_id', ext)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new HttpError(404, 'clinica_no_registrada', `La clínica "${ext}" no está registrada. Regístrala con PUT /v1/clinicas/{clinicaExternaId}`);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Afiliaciones
// ---------------------------------------------------------------------------

export async function estadoAfiliacion(especialistaId: string, clinicaId: string): Promise<string | null> {
  const { data, error } = await db()
    .from('afiliaciones')
    .select('estado')
    .eq('especialista_id', especialistaId)
    .eq('clinica_id', clinicaId)
    .maybeSingle();
  if (error) throw error;
  return data?.estado ?? null;
}

export async function exigirAfiliacion(especialistaId: string, clinicaId: string) {
  const estado = await estadoAfiliacion(especialistaId, clinicaId);
  if (estado !== 'aprobada') {
    throw new HttpError(403, 'especialista_no_afiliado', 'El especialista no tiene afiliada a esta clínica. Solicita la afiliación con POST /v1/afiliaciones');
  }
}

export async function especialistasAfiliados(clinicaId: string) {
  const { data, error } = await db()
    .from('afiliaciones')
    .select('especialista_id')
    .eq('clinica_id', clinicaId)
    .eq('estado', 'aprobada');
  if (error) throw error;

  const ids = new Set((data ?? []).map((a) => a.especialista_id));
  if (ids.size === 0) return [];
  const todos = await kvPorPrefijo('especialistas:');
  return todos
    .filter((e) => ids.has(String(e.id)) && e.activo !== false)
    .map((e) => formatearEspecialista(e, 'aprobada'));
}

// ---------------------------------------------------------------------------
// Disponibilidad
// ---------------------------------------------------------------------------

const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const;

const HORARIO_POR_DEFECTO: Record<string, { inicio: string; fin: string }[]> = {
  lunes: [{ inicio: '09:00', fin: '18:00' }],
  martes: [{ inicio: '09:00', fin: '18:00' }],
  miercoles: [{ inicio: '09:00', fin: '18:00' }],
  jueves: [{ inicio: '09:00', fin: '18:00' }],
  viernes: [{ inicio: '09:00', fin: '18:00' }],
  sabado: [{ inicio: '09:00', fin: '13:00' }],
  domingo: [],
};

const aMinutos = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
const aHora = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

/** Fecha y hora actuales en Perú (UTC-5, sin horario de verano). */
function ahoraLima() {
  const iso = new Date(Date.now() - 5 * 3600_000).toISOString();
  return { fecha: iso.slice(0, 10), minutos: aMinutos(iso.slice(11, 16)) };
}

async function ocupacion(especialistaId: string) {
  const [servicios, solicitudes] = await Promise.all([
    kvPorPrefijo('servicios:'),
    kvPorPrefijo('solicitudes:'),
  ]);
  const ocupados: { fecha: string; inicio: number; fin: number }[] = [];
  for (const s of servicios) {
    if (String(s.especialistaId) !== especialistaId || s.estado === 'cancelado' || !s.fecha || !s.hora) continue;
    const inicio = aMinutos(s.hora);
    ocupados.push({ fecha: s.fecha, inicio, fin: inicio + (Number(s.duracion) || 60) });
  }
  for (const s of solicitudes) {
    if (String(s.especialistaId) !== especialistaId || s.estado !== 'pendiente') continue;
    if (!s.fechaSolicitada || !s.horaSolicitada) continue;
    const inicio = aMinutos(s.horaSolicitada);
    ocupados.push({ fecha: s.fechaSolicitada, inicio, fin: inicio + 60 });
  }
  return ocupados;
}

export async function calcularDisponibilidad(
  esp: any,
  desdeRaw: unknown,
  hastaRaw: unknown,
  duracionRaw: unknown,
) {
  const hoy = ahoraLima();
  const desde = fecha(desdeRaw, 'desde', false) ?? hoy.fecha;
  const hasta = fecha(hastaRaw, 'hasta', false) ?? desde;
  const duracion = Math.min(Math.max(numero(duracionRaw, 'duracion') ?? 60, 15), 480);

  const dias = Math.round((Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86_400_000);
  if (dias < 0) throw new HttpError(422, 'rango_invalido', '"hasta" debe ser igual o posterior a "desde"');
  if (dias > 30) throw new HttpError(422, 'rango_invalido', 'El rango máximo es de 31 días');

  const horario =
    esp.disponibilidad && Object.values(esp.disponibilidad).some((f: any) => Array.isArray(f) && f.length > 0)
      ? esp.disponibilidad
      : HORARIO_POR_DEFECTO;
  const ocupados = await ocupacion(String(esp.id));

  const resultado: { fecha: string; horas: string[] }[] = [];
  for (let i = 0; i <= dias; i++) {
    const d = new Date(Date.parse(`${desde}T00:00:00Z`) + i * 86_400_000);
    const f = d.toISOString().slice(0, 10);
    if (f < hoy.fecha) continue;
    const franjas: { inicio: string; fin: string }[] = horario[DIAS[d.getUTCDay()]] ?? [];
    const horas: string[] = [];
    for (const franja of franjas) {
      if (!franja?.inicio || !franja?.fin) continue;
      for (let m = aMinutos(franja.inicio); m + duracion <= aMinutos(franja.fin); m += duracion) {
        if (f === hoy.fecha && m <= hoy.minutos) continue;
        const choca = ocupados.some((o) => o.fecha === f && m < o.fin && m + duracion > o.inicio);
        if (!choca) horas.push(aHora(m));
      }
    }
    resultado.push({ fecha: f, horas });
  }
  return { especialistaId: String(esp.id), duracion, dias: resultado };
}

async function horarioOcupado(especialistaId: string, f: string, h: string, duracion = 60) {
  const inicio = aMinutos(h);
  const ocupados = await ocupacion(especialistaId);
  return ocupados.some((o) => o.fecha === f && inicio < o.fin && inicio + duracion > o.inicio);
}

// ---------------------------------------------------------------------------
// Solicitudes
// ---------------------------------------------------------------------------

const URGENCIAS = ['baja', 'media', 'alta'] as const;

export function validarPaciente(p: any) {
  if (!p || typeof p !== 'object') {
    throw new HttpError(422, 'campo_requerido', 'El campo "paciente" es obligatorio');
  }
  const propietario = p.propietario && typeof p.propietario === 'object'
    ? {
        nombre: texto(p.propietario.nombre, 'paciente.propietario.nombre', { max: 150 }),
        telefono: texto(p.propietario.telefono, 'paciente.propietario.telefono', { max: 30 }),
        email: texto(p.propietario.email, 'paciente.propietario.email', { max: 150 }),
      }
    : undefined;
  return {
    externoId: texto(p.externoId, 'paciente.externoId', { max: 100 }),
    nombre: texto(p.nombre, 'paciente.nombre', { requerido: true, max: 100 })!,
    especie: texto(p.especie, 'paciente.especie', { requerido: true, max: 50 })!,
    raza: texto(p.raza, 'paciente.raza', { max: 80 }),
    sexo: texto(p.sexo, 'paciente.sexo', { max: 20 }),
    fechaNacimiento: fecha(p.fechaNacimiento, 'paciente.fechaNacimiento', false),
    peso: numero(p.peso, 'paciente.peso'),
    propietario,
  };
}

function validarAntecedentes(a: any) {
  if (a === undefined || a === null) return null;
  if (typeof a !== 'object' || Array.isArray(a)) {
    throw new HttpError(422, 'campo_invalido', 'El campo "antecedentes" debe ser un objeto');
  }
  if (JSON.stringify(a).length > 20_000) {
    throw new HttpError(413, 'antecedentes_muy_grandes', 'Los antecedentes superan 20 KB. Envía enlaces a los archivos en lugar del contenido.');
  }
  return a;
}

type DatosSolicitud = {
  clinicaExternaId?: unknown;
  sedeExternaId?: unknown;
  especialistaId?: unknown;
  referenciaExterna?: unknown;
  tipoServicio?: unknown;
  fecha?: unknown;
  hora?: unknown;
  urgencia?: unknown;
  motivo?: unknown;
  tarifa?: unknown;
  direccion?: unknown;
  paciente?: any;
  antecedentes?: unknown;
  accesoHistoria?: unknown;
};

/** URL temporal a la ficha en el PMS. El especialista la abre desde su portal. */
export function validarAccesoHistoria(raw: unknown) {
  if (raw == null) return null;
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new HttpError(422, 'campo_invalido', 'accesoHistoria debe ser un objeto');
  }
  const o = raw as Record<string, unknown>;
  const url = texto(o.url, 'accesoHistoria.url', { requerido: true, max: 1000 })!;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new HttpError(422, 'campo_invalido', 'accesoHistoria.url no es una URL válida');
  }
  if (parsed.protocol !== 'https:') {
    throw new HttpError(422, 'campo_invalido', 'accesoHistoria.url debe usar https');
  }
  const expiraEn = texto(o.expiraEn, 'accesoHistoria.expiraEn', { max: 40 });
  if (expiraEn && Number.isNaN(Date.parse(expiraEn))) {
    throw new HttpError(422, 'campo_invalido', 'accesoHistoria.expiraEn debe ser una fecha ISO 8601');
  }
  let pacientes: string[] | null = null;
  if (o.pacientes != null) {
    if (!Array.isArray(o.pacientes)) {
      throw new HttpError(422, 'campo_invalido', 'accesoHistoria.pacientes debe ser un arreglo');
    }
    pacientes = o.pacientes.slice(0, 20).map((p, i) => texto(p, `accesoHistoria.pacientes[${i}]`, { requerido: true, max: 100 })!);
  }
  return { url, expiraEn: expiraEn ?? null, pacientes };
}

export async function crearSolicitud(
  integrador: Integrador,
  clinica: any,
  datos: DatosSolicitud,
  idempotencyKey?: string,
) {
  const clave = texto(idempotencyKey, 'Idempotency-Key', { max: 200 });
  if (clave) {
    const previa = await solicitudPorIdempotencia(integrador.id, clave);
    if (previa) return { solicitud: await estadoSolicitud(integrador.id, previa.solicitud_id), repetida: true };
  }

  const especialistaId = texto(datos.especialistaId, 'especialistaId', { requerido: true, max: 50 })!;
  const tipo = texto(datos.tipoServicio, 'tipoServicio', { requerido: true, max: 150 })!;
  const f = fecha(datos.fecha, 'fecha')!;
  const h = hora(datos.hora, 'hora')!;
  const urgencia = opcion(datos.urgencia, 'urgencia', URGENCIAS, 'media');
  const motivo = texto(datos.motivo, 'motivo', { requerido: true, max: 2000 })!;
  const referenciaExterna = texto(datos.referenciaExterna, 'referenciaExterna', { max: 100 });
  const sedeExternaId = texto(datos.sedeExternaId, 'sedeExternaId', { max: 100 });
  const paciente = validarPaciente(datos.paciente);
  const antecedentes = validarAntecedentes(datos.antecedentes);
  const accesoHistoria = validarAccesoHistoria(datos.accesoHistoria);
  const tarifa = numero(datos.tarifa, 'tarifa');
  const direccion = texto(datos.direccion, 'direccion', { max: 300 });

  if (f < ahoraLima().fecha) throw new HttpError(422, 'fecha_pasada', 'La fecha solicitada ya pasó');

  const esp = await obtenerEspecialista(especialistaId);
  await exigirAfiliacion(String(esp.id), clinica.clinica_id);
  if (await horarioOcupado(String(esp.id), f, h)) {
    throw new HttpError(409, 'horario_no_disponible', 'El especialista ya tiene ocupado ese horario. Consulta GET /v1/especialistas/{id}/disponibilidad');
  }

  const clinicaKv = await kvGet(`clinicas:${clinica.clinica_id}`);
  const id = Date.now() * 100 + Math.floor(Math.random() * 100);

  const { error: errorVinculo } = await db().from('integracion_solicitudes').insert({
    solicitud_id: String(id),
    integrador_id: integrador.id,
    clinica_id: clinica.clinica_id,
    especialista_id: String(esp.id),
    clinica_externa_id: clinica.clinica_externa_id,
    sede_externa_id: sedeExternaId ?? null,
    paciente_externo_id: paciente.externoId ?? null,
    referencia_externa: referenciaExterna ?? null,
    idempotency_key: clave ?? null,
    estado: 'pendiente',
  });
  if (errorVinculo) {
    if (errorVinculo.code === '23505' && clave) {
      const previa = await solicitudPorIdempotencia(integrador.id, clave);
      if (previa) return { solicitud: await estadoSolicitud(integrador.id, previa.solicitud_id), repetida: true };
    }
    throw errorVinculo;
  }

  try {
    await kvSet(`solicitudes:${id}`, {
      id,
      clinica: clinicaKv?.nombre ?? clinica.nombre,
      clinicaId: clinica.clinica_id,
      especialistaId: esp.id,
      tipo,
      paciente: paciente.nombre,
      especie: [paciente.especie, paciente.raza].filter(Boolean).join(' - '),
      fechaSolicitada: f,
      horaSolicitada: h,
      urgencia,
      descripcion: motivo,
      tarifa: tarifa ?? (Number(esp.tarifa) || 0),
      direccion: direccion ?? clinicaKv?.direccion ?? '',
      estado: 'pendiente',
      fechaSolicitud: new Date().toISOString(),
      origen: {
        tipo: 'integracion',
        integradorId: integrador.id,
        integradorNombre: integrador.nombre,
        referenciaExterna: referenciaExterna ?? null,
        sedeExternaId: sedeExternaId ?? null,
      },
      pacienteDetalle: paciente,
      antecedentes,
      accesoHistoria,
    });
  } catch (e) {
    await db().from('integracion_solicitudes').delete().eq('solicitud_id', String(id));
    throw e;
  }

  return { solicitud: await estadoSolicitud(integrador.id, String(id)), repetida: false };
}

/** Veterinari publica o actualiza el enlace temporal a la historia clínica del caso. */
export async function actualizarAccesoHistoria(integradorId: string, solicitudId: string, raw: unknown) {
  const v = await vinculoSolicitud(integradorId, solicitudId);
  const sol = await kvGet(`solicitudes:${v.solicitud_id}`);
  if (!sol) throw new HttpError(404, 'solicitud_no_encontrada', 'Solicitud no encontrada');

  const accesoHistoria = validarAccesoHistoria(raw);
  await kvSet(`solicitudes:${v.solicitud_id}`, {
    ...sol,
    accesoHistoria,
  });
  await db()
    .from('integracion_solicitudes')
    .update({ updated_at: new Date().toISOString() })
    .eq('solicitud_id', v.solicitud_id);

  return estadoSolicitud(integradorId, solicitudId, v);
}

async function solicitudPorIdempotencia(integradorId: string, clave: string) {
  const { data, error } = await db()
    .from('integracion_solicitudes')
    .select('solicitud_id')
    .eq('integrador_id', integradorId)
    .eq('idempotency_key', clave)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function vinculoSolicitud(integradorId: string, solicitudId: string) {
  const { data, error } = await db()
    .from('integracion_solicitudes')
    .select('*')
    .eq('integrador_id', integradorId)
    .eq('solicitud_id', solicitudId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, 'solicitud_no_encontrada', 'Solicitud no encontrada');
  return data;
}

function estadoCalculado(sol: any, servicio: any): string {
  if (sol?.estado === 'cancelada' || servicio?.estado === 'cancelado') return 'cancelada';
  if (servicio && ['completado', 'facturado', 'pagado'].includes(servicio.estado)) return 'completada';
  if (sol?.estado === 'rechazada') return 'rechazada';
  if (sol?.estado === 'aceptada' || servicio) return 'aceptada';
  return 'pendiente';
}

export async function estadoSolicitud(integradorId: string, solicitudId: string, vinculo?: any) {
  const v = vinculo ?? (await vinculoSolicitud(integradorId, solicitudId));
  const sol = await kvGet(`solicitudes:${v.solicitud_id}`);
  const servicio = v.servicio_id ? await kvGet(`servicios:${v.servicio_id}`) : null;
  const esp = await kvGet(`especialistas:${v.especialista_id}`);

  return {
    id: v.solicitud_id,
    referenciaExterna: v.referencia_externa,
    clinicaExternaId: v.clinica_externa_id,
    sedeExternaId: v.sede_externa_id,
    pacienteExternoId: v.paciente_externo_id,
    especialista: esp ? formatearEspecialista(esp) : { id: v.especialista_id },
    tipoServicio: sol?.tipo ?? null,
    paciente: sol?.paciente ?? null,
    urgencia: sol?.urgencia ?? null,
    fecha: servicio?.fecha ?? sol?.fechaSolicitada ?? null,
    hora: servicio?.hora ?? sol?.horaSolicitada ?? null,
    tarifa: servicio?.tarifa ?? sol?.tarifa ?? null,
    estado: estadoCalculado(sol, servicio),
    motivoRechazo: sol?.estado === 'rechazada' ? sol?.motivoRechazo ?? null : null,
    informeDisponible: Boolean(servicio?.informe?.path),
    accesoHistoria: sol?.accesoHistoria ?? null,
    creadaEn: v.created_at,
    actualizadaEn: v.updated_at,
  };
}

export async function listarSolicitudes(
  integradorId: string,
  filtros: { referenciaExterna?: string; clinicaExternaId?: string; estado?: string; limite: number },
) {
  let q = db()
    .from('integracion_solicitudes')
    .select('*')
    .eq('integrador_id', integradorId)
    .order('created_at', { ascending: false })
    .limit(filtros.limite);
  if (filtros.referenciaExterna) q = q.eq('referencia_externa', filtros.referenciaExterna);
  if (filtros.clinicaExternaId) q = q.eq('clinica_externa_id', filtros.clinicaExternaId);
  const { data, error } = await q;
  if (error) throw error;

  const lista = await Promise.all((data ?? []).map((v) => estadoSolicitud(integradorId, v.solicitud_id, v)));
  return filtros.estado ? lista.filter((s) => s.estado === filtros.estado) : lista;
}

export async function cancelarSolicitud(integradorId: string, solicitudId: string, motivo?: string) {
  const v = await vinculoSolicitud(integradorId, solicitudId);
  const actual = await estadoSolicitud(integradorId, solicitudId, v);
  if (['completada', 'cancelada', 'rechazada'].includes(actual.estado)) {
    throw new HttpError(409, 'estado_no_permite_cancelar', `No se puede cancelar una solicitud ${actual.estado}`);
  }

  const marca = { canceladoPor: 'integrador', motivoCancelacion: motivo ?? null, canceladoEn: new Date().toISOString() };
  const sol = await kvGet(`solicitudes:${v.solicitud_id}`);
  if (sol) await kvSet(`solicitudes:${v.solicitud_id}`, { ...sol, estado: 'cancelada', ...marca });
  if (v.servicio_id) {
    const servicio = await kvGet(`servicios:${v.servicio_id}`);
    if (servicio) await kvSet(`servicios:${v.servicio_id}`, { ...servicio, estado: 'cancelado', ...marca });
  }
  await db()
    .from('integracion_solicitudes')
    .update({ estado: 'cancelada', updated_at: new Date().toISOString() })
    .eq('solicitud_id', v.solicitud_id);

  return estadoSolicitud(integradorId, solicitudId);
}

export async function enlaceInforme(integradorId: string, solicitudId: string) {
  const v = await vinculoSolicitud(integradorId, solicitudId);
  const servicio = v.servicio_id ? await kvGet(`servicios:${v.servicio_id}`) : null;
  if (!servicio?.informe?.path) {
    throw new HttpError(404, 'informe_no_disponible', 'El especialista todavía no ha cargado el informe');
  }
  return firmarInforme(servicio.informe);
}

export async function firmarInforme(informe: { path: string; nombre?: string; subidoEn?: string }) {
  const segundos = 3600;
  const { data, error } = await db().storage.from(BUCKET_INFORMES).createSignedUrl(informe.path, segundos);
  if (error || !data) throw error ?? new Error('No se pudo firmar el enlace del informe');
  return {
    url: data.signedUrl,
    expiraEn: new Date(Date.now() + segundos * 1000).toISOString(),
    nombreArchivo: informe.nombre ?? 'informe.pdf',
    subidoEn: informe.subidoEn ?? null,
  };
}
