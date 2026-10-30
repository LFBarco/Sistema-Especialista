import { randomBytes, randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import { autenticarIntegrador } from '../auth.js';
import { db, kvGet, kvSet } from '../db.js';
import {
  calcularDisponibilidad,
  actualizarAccesoHistoria,
  cancelarSolicitud,
  clinicaDelIntegrador,
  crearSolicitud,
  enlaceInforme,
  especialistaPorEmail,
  especialistasAfiliados,
  estadoSolicitud,
  exigirAfiliacion,
  formatearEspecialista,
  listarSolicitudes,
  obtenerEspecialista,
  validarPaciente,
} from '../dominio.js';
import { HttpError, leerJson, opcion, texto, type AppEnv } from '../http.js';
import { encolarEvento } from '../webhooks.js';

const v1 = new Hono<AppEnv>();
v1.use('*', autenticarIntegrador);

v1.get('/ping', (c) => {
  const integrador = c.get('integrador');
  return c.json({ ok: true, integrador: { id: integrador.id, nombre: integrador.nombre }, hora: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Clínicas
// ---------------------------------------------------------------------------

v1.put('/clinicas/:clinicaExternaId', async (c) => {
  const integrador = c.get('integrador');
  const ext = texto(c.req.param('clinicaExternaId'), 'clinicaExternaId', { requerido: true, max: 100 })!;
  const body = await leerJson(c);
  const datos = {
    nombre: texto(body.nombre, 'nombre', { requerido: true, max: 150 })!,
    ruc: texto(body.ruc, 'ruc', { max: 20 }),
    direccion: texto(body.direccion, 'direccion', { max: 300 }),
    ciudad: texto(body.ciudad, 'ciudad', { max: 100 }),
    telefono: texto(body.telefono, 'telefono', { max: 30 }),
    email: texto(body.email, 'email', { max: 150 }),
  };

  const { data: existente, error } = await db()
    .from('integracion_clinicas')
    .select('*')
    .eq('integrador_id', integrador.id)
    .eq('clinica_externa_id', ext)
    .maybeSingle();
  if (error) throw error;

  const clinicaId = existente?.clinica_id ?? randomUUID();
  const previa = existente ? await kvGet(`clinicas:${clinicaId}`) : null;
  await kvSet(`clinicas:${clinicaId}`, {
    ...(previa ?? { color: 'blue', tipo: 'veterinaria' }),
    id: clinicaId,
    nombre: datos.nombre,
    razonSocial: datos.nombre,
    ruc: datos.ruc ?? previa?.ruc ?? '',
    direccion: datos.direccion ?? previa?.direccion ?? '',
    ciudad: datos.ciudad ?? previa?.ciudad ?? '',
    telefono: datos.telefono ?? previa?.telefono ?? '',
    contacto: datos.email ?? previa?.contacto ?? '',
    origen: { tipo: 'integracion', integradorId: integrador.id, clinicaExternaId: ext },
  });

  if (existente) {
    const { error: e } = await db()
      .from('integracion_clinicas')
      .update({ nombre: datos.nombre, ruc: datos.ruc ?? null, updated_at: new Date().toISOString() })
      .eq('id', existente.id);
    if (e) throw e;
  } else {
    const { error: e } = await db().from('integracion_clinicas').insert({
      integrador_id: integrador.id,
      clinica_externa_id: ext,
      clinica_id: clinicaId,
      nombre: datos.nombre,
      ruc: datos.ruc ?? null,
    });
    if (e) throw e;
  }

  return c.json({ clinicaExternaId: ext, nombre: datos.nombre, creada: !existente }, existente ? 200 : 201);
});

v1.get('/clinicas/:clinicaExternaId', async (c) => {
  const clinica = await clinicaDelIntegrador(c.get('integrador').id, c.req.param('clinicaExternaId'));
  return c.json({
    clinicaExternaId: clinica.clinica_externa_id,
    nombre: clinica.nombre,
    ruc: clinica.ruc,
    registradaEn: clinica.created_at,
  });
});

// ---------------------------------------------------------------------------
// Afiliaciones
// ---------------------------------------------------------------------------

v1.post('/afiliaciones', async (c) => {
  const integrador = c.get('integrador');
  const body = await leerJson(c);
  const clinica = await clinicaDelIntegrador(integrador.id, body.clinicaExternaId);
  const email = texto(body.especialistaEmail, 'especialistaEmail', { requerido: true, max: 150 })!;
  const mensaje = texto(body.mensaje, 'mensaje', { max: 500 });

  const esp = await especialistaPorEmail(email);
  if (!esp) {
    throw new HttpError(404, 'especialista_no_encontrado', 'No hay un especialista registrado con ese email en VetSpecialist');
  }

  const { data: existente, error } = await db()
    .from('afiliaciones')
    .select('*')
    .eq('especialista_id', String(esp.id))
    .eq('clinica_id', clinica.clinica_id)
    .maybeSingle();
  if (error) throw error;

  let afiliacion = existente;
  if (!existente) {
    const { data, error: e } = await db()
      .from('afiliaciones')
      .insert({
        especialista_id: String(esp.id),
        clinica_id: clinica.clinica_id,
        origen: 'integracion',
        integrador_id: integrador.id,
        mensaje: mensaje ?? null,
      })
      .select('*')
      .single();
    if (e) throw e;
    afiliacion = data;
  } else if (['rechazada', 'revocada'].includes(existente.estado)) {
    const { data, error: e } = await db()
      .from('afiliaciones')
      .update({ estado: 'pendiente', mensaje: mensaje ?? null, respondida_at: null })
      .eq('id', existente.id)
      .select('*')
      .single();
    if (e) throw e;
    afiliacion = data;
  }

  return c.json(
    {
      id: afiliacion.id,
      clinicaExternaId: clinica.clinica_externa_id,
      especialista: formatearEspecialista(esp),
      estado: afiliacion.estado,
      solicitadaEn: afiliacion.created_at,
    },
    existente ? 200 : 201,
  );
});

v1.get('/afiliaciones', async (c) => {
  const clinica = await clinicaDelIntegrador(c.get('integrador').id, c.req.query('clinicaExternaId'));
  const { data, error } = await db()
    .from('afiliaciones')
    .select('*')
    .eq('clinica_id', clinica.clinica_id)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const lista = await Promise.all(
    (data ?? []).map(async (a) => {
      const esp = await kvGet(`especialistas:${a.especialista_id}`);
      return {
        id: a.id,
        especialista: esp ? formatearEspecialista(esp) : { id: a.especialista_id },
        estado: a.estado,
        solicitadaEn: a.created_at,
        respondidaEn: a.respondida_at,
      };
    }),
  );
  return c.json({ data: lista });
});

// ---------------------------------------------------------------------------
// Especialistas y disponibilidad
// ---------------------------------------------------------------------------

v1.get('/especialistas', async (c) => {
  const clinica = await clinicaDelIntegrador(c.get('integrador').id, c.req.query('clinicaExternaId'));
  return c.json({ data: await especialistasAfiliados(clinica.clinica_id) });
});

v1.get('/especialistas/:id/disponibilidad', async (c) => {
  const clinica = await clinicaDelIntegrador(c.get('integrador').id, c.req.query('clinicaExternaId'));
  const esp = await obtenerEspecialista(c.req.param('id'));
  await exigirAfiliacion(String(esp.id), clinica.clinica_id);
  return c.json(await calcularDisponibilidad(esp, c.req.query('desde'), c.req.query('hasta'), c.req.query('duracion')));
});

// ---------------------------------------------------------------------------
// Solicitudes
// ---------------------------------------------------------------------------

v1.post('/solicitudes', async (c) => {
  const integrador = c.get('integrador');
  const body = await leerJson(c);
  const clinica = await clinicaDelIntegrador(integrador.id, body.clinicaExternaId);
  const { solicitud, repetida } = await crearSolicitud(integrador, clinica, body, c.req.header('Idempotency-Key'));
  return c.json(solicitud, repetida ? 200 : 201);
});

v1.get('/solicitudes', async (c) => {
  const limite = Math.min(Math.max(Number(c.req.query('limite')) || 50, 1), 100);
  const estado = c.req.query('estado');
  if (estado) opcion(estado, 'estado', ['pendiente', 'aceptada', 'rechazada', 'completada', 'cancelada'] as const);
  const data = await listarSolicitudes(c.get('integrador').id, {
    referenciaExterna: c.req.query('referenciaExterna'),
    clinicaExternaId: c.req.query('clinicaExternaId'),
    estado,
    limite,
  });
  return c.json({ data });
});

v1.get('/solicitudes/:id', async (c) => {
  return c.json(await estadoSolicitud(c.get('integrador').id, c.req.param('id')));
});

v1.post('/solicitudes/:id/cancelar', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const motivo = texto((body as any)?.motivo, 'motivo', { max: 500 });
  return c.json(await cancelarSolicitud(c.get('integrador').id, c.req.param('id'), motivo));
});

/** Publica o actualiza el enlace temporal a la historia clínica (acceso del especialista al caso). */
v1.put('/solicitudes/:id/acceso-historia', async (c) => {
  const body = await leerJson(c);
  return c.json(await actualizarAccesoHistoria(c.get('integrador').id, c.req.param('id'), body));
});

v1.get('/solicitudes/:id/informe', async (c) => {
  return c.json(await enlaceInforme(c.get('integrador').id, c.req.param('id')));
});

// ---------------------------------------------------------------------------
// Enlaces para el botón "Solicitar especialista"
// ---------------------------------------------------------------------------

v1.post('/enlaces', async (c) => {
  const integrador = c.get('integrador');
  const body = await leerJson(c);
  const clinica = await clinicaDelIntegrador(integrador.id, body.clinicaExternaId);
  const datos = {
    sedeExternaId: texto(body.sedeExternaId, 'sedeExternaId', { max: 100 }),
    referenciaExterna: texto(body.referenciaExterna, 'referenciaExterna', { max: 100 }),
    tipoServicio: texto(body.tipoServicio, 'tipoServicio', { max: 150 }),
    motivo: texto(body.motivo, 'motivo', { max: 2000 }),
    urgencia: body.urgencia ? opcion(body.urgencia, 'urgencia', ['baja', 'media', 'alta'] as const) : undefined,
    direccion: texto(body.direccion, 'direccion', { max: 300 }),
    paciente: validarPaciente(body.paciente),
    antecedentes: body.antecedentes ?? null,
  };

  const minutos = 30;
  const token = randomBytes(32).toString('base64url');
  const expira = new Date(Date.now() + minutos * 60_000).toISOString();
  const { error } = await db().from('integracion_borradores').insert({
    token,
    integrador_id: integrador.id,
    clinica_id: clinica.clinica_id,
    clinica_externa_id: clinica.clinica_externa_id,
    datos,
    expira_at: expira,
  });
  if (error) throw error;

  const base = process.env.PORTAL_URL || new URL(c.req.url).origin;
  return c.json({ url: `${base}/integracion/solicitar?t=${token}`, expiraEn: expira }, 201);
});

// ---------------------------------------------------------------------------
// Webhooks y eventos
// ---------------------------------------------------------------------------

v1.put('/webhook', async (c) => {
  const integrador = c.get('integrador');
  const body = await leerJson(c);
  const url = texto(body.url, 'url', { requerido: true, max: 500 })!;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new HttpError(422, 'campo_invalido', 'La URL del webhook no es válida');
  }
  if (parsed.protocol !== 'https:') {
    throw new HttpError(422, 'campo_invalido', 'La URL del webhook debe usar https');
  }
  const { error } = await db().from('integradores').update({ webhook_url: url }).eq('id', integrador.id);
  if (error) throw error;
  return c.json({ url });
});

v1.post('/webhook/rotar-secreto', async (c) => {
  const secreto = randomBytes(32).toString('hex');
  const { error } = await db().from('integradores').update({ webhook_secret: secreto }).eq('id', c.get('integrador').id);
  if (error) throw error;
  return c.json({ secreto });
});

v1.post('/webhook/prueba', async (c) => {
  const integrador = c.get('integrador');
  const id = await encolarEvento(integrador.id, 'ping', { mensaje: 'Evento de prueba de VetSpecialist' });
  return c.json({ eventoId: id, mensaje: 'Evento encolado. Se enviará en menos de 1 minuto.' }, 202);
});

v1.get('/eventos', async (c) => {
  const estado = c.req.query('estado');
  let q = db()
    .from('webhook_eventos')
    .select('id, tipo, solicitud_id, payload, estado, intentos, ultimo_error, created_at, enviado_at')
    .eq('integrador_id', c.get('integrador').id)
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(Number(c.req.query('limite')) || 50, 1), 200));
  if (estado) q = q.eq('estado', opcion(estado, 'estado', ['pendiente', 'procesando', 'enviado', 'fallido'] as const));
  const desde = c.req.query('desde');
  if (desde) q = q.gte('created_at', desde);
  const { data, error } = await q;
  if (error) throw error;
  return c.json({
    data: (data ?? []).map((e) => ({
      id: e.id,
      tipo: e.tipo,
      solicitudId: e.solicitud_id,
      data: e.payload,
      estadoEntrega: e.estado,
      intentos: e.intentos,
      ultimoError: e.ultimo_error,
      creadoEn: e.created_at,
      enviadoEn: e.enviado_at,
    })),
  });
});

export default v1;
