import { Hono } from 'hono';
import { db } from '../db.js';
import {
  calcularDisponibilidad,
  crearSolicitud,
  especialistasAfiliados,
  exigirAfiliacion,
  obtenerEspecialista,
} from '../dominio.js';
import { HttpError, leerJson, type AppEnv } from '../http.js';

/** Rutas usadas por la página del botón "Solicitar especialista" (autenticadas por el token del enlace). */
const publico = new Hono<AppEnv>();

async function borradorVigente(token: string) {
  const { data, error } = await db()
    .from('integracion_borradores')
    .select('*, integradores!inner(id, nombre, activo, webhook_url)')
    .eq('token', token)
    .maybeSingle();
  if (error) throw error;
  if (!data || !(data as any).integradores?.activo) {
    throw new HttpError(404, 'enlace_invalido', 'El enlace no es válido');
  }
  if (data.usado_at) throw new HttpError(410, 'enlace_usado', 'Este enlace ya fue utilizado');
  if (new Date(data.expira_at).getTime() < Date.now()) {
    throw new HttpError(410, 'enlace_expirado', 'El enlace expiró. Vuelve a abrirlo desde tu sistema.');
  }
  return data as any;
}

publico.get('/borradores/:token', async (c) => {
  const b = await borradorVigente(c.req.param('token'));
  const { data: clinica } = await db()
    .from('integracion_clinicas')
    .select('nombre')
    .eq('integrador_id', b.integrador_id)
    .eq('clinica_externa_id', b.clinica_externa_id)
    .maybeSingle();

  return c.json({
    integrador: b.integradores.nombre,
    clinica: { nombre: clinica?.nombre ?? null },
    datos: b.datos,
    especialistas: await especialistasAfiliados(b.clinica_id),
    expiraEn: b.expira_at,
  });
});

publico.get('/borradores/:token/disponibilidad', async (c) => {
  const b = await borradorVigente(c.req.param('token'));
  const esp = await obtenerEspecialista(c.req.query('especialistaId') ?? '');
  await exigirAfiliacion(String(esp.id), b.clinica_id);
  return c.json(await calcularDisponibilidad(esp, c.req.query('desde'), c.req.query('hasta'), c.req.query('duracion')));
});

publico.post('/borradores/:token/solicitar', async (c) => {
  const token = c.req.param('token');
  const b = await borradorVigente(token);
  const body = await leerJson(c);

  const { data: tomado, error } = await db()
    .from('integracion_borradores')
    .update({ usado_at: new Date().toISOString() })
    .eq('token', token)
    .is('usado_at', null)
    .select('token')
    .maybeSingle();
  if (error) throw error;
  if (!tomado) throw new HttpError(410, 'enlace_usado', 'Este enlace ya fue utilizado');

  try {
    const integrador = { id: b.integrador_id, nombre: b.integradores.nombre, webhookUrl: b.integradores.webhook_url };
    const clinica = { clinica_id: b.clinica_id, clinica_externa_id: b.clinica_externa_id, nombre: '' };
    const { solicitud } = await crearSolicitud(
      integrador,
      clinica,
      {
        ...b.datos,
        especialistaId: body.especialistaId,
        fecha: body.fecha,
        hora: body.hora,
        tipoServicio: body.tipoServicio ?? b.datos.tipoServicio,
        motivo: body.motivo ?? b.datos.motivo,
        urgencia: body.urgencia ?? b.datos.urgencia,
      },
      `borrador:${token}`,
    );
    await db().from('integracion_borradores').update({ solicitud_id: solicitud.id }).eq('token', token);
    return c.json(solicitud, 201);
  } catch (e) {
    await db().from('integracion_borradores').update({ usado_at: null }).eq('token', token);
    throw e;
  }
});

export default publico;
