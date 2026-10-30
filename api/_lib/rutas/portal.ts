import { Hono } from 'hono';
import { autenticarUsuario } from '../auth.js';
import { BUCKET_INFORMES, asegurarBucket, db, kvGet, kvSet } from '../db.js';
import { especialistaPorEmail, firmarInforme } from '../dominio.js';
import { HttpError, leerJson, texto, type AppEnv } from '../http.js';

/** Rutas para el especialista con sesión iniciada en el portal. */
const portal = new Hono<AppEnv>();
portal.use('*', autenticarUsuario);

const MAX_PDF_BYTES = 3 * 1024 * 1024;

async function especialistaActual(email: string) {
  const esp = await especialistaPorEmail(email);
  if (!esp) throw new HttpError(403, 'no_es_especialista', 'Tu usuario no está asociado a un especialista');
  return esp;
}

portal.get('/afiliaciones', async (c) => {
  const esp = await especialistaActual(c.get('usuario').email);
  const { data, error } = await db()
    .from('afiliaciones')
    .select('*, integradores(nombre)')
    .eq('especialista_id', String(esp.id))
    .order('created_at', { ascending: false });
  if (error) throw error;

  const lista = await Promise.all(
    (data ?? []).map(async (a: any) => {
      const clinica = await kvGet(`clinicas:${a.clinica_id}`);
      return {
        id: a.id,
        clinica: { id: a.clinica_id, nombre: clinica?.nombre ?? 'Clínica', ciudad: clinica?.ciudad ?? null, ruc: clinica?.ruc ?? null },
        estado: a.estado,
        origen: a.origen,
        integrador: a.integradores?.nombre ?? null,
        mensaje: a.mensaje,
        solicitadaEn: a.created_at,
        respondidaEn: a.respondida_at,
      };
    }),
  );
  return c.json({ data: lista });
});

portal.post('/afiliaciones/:id/responder', async (c) => {
  const esp = await especialistaActual(c.get('usuario').email);
  const body = await leerJson(c);
  if (!['aprobar', 'rechazar', 'revocar'].includes(body.accion)) {
    throw new HttpError(422, 'campo_invalido', 'El campo "accion" debe ser aprobar, rechazar o revocar');
  }
  const estado = { aprobar: 'aprobada', rechazar: 'rechazada', revocar: 'revocada' }[body.accion as 'aprobar'];

  const { data, error } = await db()
    .from('afiliaciones')
    .update({ estado, respondida_at: new Date().toISOString() })
    .eq('id', c.req.param('id'))
    .eq('especialista_id', String(esp.id))
    .select('id, estado')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, 'afiliacion_no_encontrada', 'Afiliación no encontrada');
  return c.json(data);
});

async function servicioPropio(servicioId: string, esp: any) {
  const servicio = await kvGet(`servicios:${servicioId}`);
  if (!servicio) throw new HttpError(404, 'servicio_no_encontrado', 'Servicio no encontrado');
  if (servicio.especialistaId !== undefined && String(servicio.especialistaId) !== String(esp.id)) {
    throw new HttpError(403, 'servicio_ajeno', 'Este servicio pertenece a otro especialista');
  }
  return servicio;
}

portal.post('/servicios/:id/informe', async (c) => {
  const esp = await especialistaActual(c.get('usuario').email);
  const servicioId = c.req.param('id');
  const servicio = await servicioPropio(servicioId, esp);
  const body = await leerJson(c);
  const nombre = texto(body.nombreArchivo, 'nombreArchivo', { max: 150 }) ?? 'informe.pdf';
  const base64 = texto(body.contenidoBase64, 'contenidoBase64', { requerido: true, max: 6_000_000 })!;

  const bytes = Buffer.from(base64.replace(/^data:application\/pdf;base64,/, ''), 'base64');
  if (bytes.length > MAX_PDF_BYTES) throw new HttpError(413, 'archivo_muy_grande', 'El informe no puede superar 3 MB');
  if (bytes.subarray(0, 4).toString() !== '%PDF') throw new HttpError(422, 'archivo_invalido', 'El archivo debe ser un PDF');

  await asegurarBucket(BUCKET_INFORMES);
  const path = `servicios/${servicioId}/${Date.now()}-informe.pdf`;
  const { error } = await db().storage.from(BUCKET_INFORMES).upload(path, bytes, { contentType: 'application/pdf' });
  if (error) throw error;

  const informe = { path, nombre, tamano: bytes.length, subidoEn: new Date().toISOString() };
  await kvSet(`servicios:${servicioId}`, { ...servicio, informe });
  return c.json({ informe }, 201);
});

portal.get('/servicios/:id/informe', async (c) => {
  const esp = await especialistaActual(c.get('usuario').email);
  const servicio = await servicioPropio(c.req.param('id'), esp);
  if (!servicio.informe?.path) throw new HttpError(404, 'informe_no_disponible', 'Este servicio no tiene informe');
  return c.json(await firmarInforme(servicio.informe));
});

export default portal;
