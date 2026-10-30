import { Hono } from 'hono';
import { autenticarAdmin, autenticarCron, generarApiKey } from '../auth.js';
import { db } from '../db.js';
import { HttpError, leerJson, texto, type AppEnv } from '../http.js';
import { despacharEventos } from '../webhooks.js';

/** Administración de integradores (cabecera X-Admin-Secret). */
export const admin = new Hono<AppEnv>();
admin.use('*', autenticarAdmin);

async function crearApiKey(integradorId: string) {
  const { key, prefijo, hash } = generarApiKey();
  const { data, error } = await db()
    .from('integrador_api_keys')
    .insert({ integrador_id: integradorId, prefijo, key_hash: hash })
    .select('id')
    .single();
  if (error) throw error;
  return { id: data.id as string, apiKey: key, prefijo };
}

admin.post('/integradores', async (c) => {
  const body = await leerJson(c);
  const nombre = texto(body.nombre, 'nombre', { requerido: true, max: 100 })!;
  const webhookUrl = texto(body.webhookUrl, 'webhookUrl', { max: 500 });
  if (webhookUrl && !webhookUrl.startsWith('https://')) {
    throw new HttpError(422, 'campo_invalido', 'webhookUrl debe usar https');
  }

  const { data, error } = await db()
    .from('integradores')
    .insert({ nombre, webhook_url: webhookUrl ?? null })
    .select('id, nombre, webhook_url, webhook_secret')
    .single();
  if (error) throw error;

  const clave = await crearApiKey(data.id);
  return c.json(
    {
      integrador: { id: data.id, nombre: data.nombre, webhookUrl: data.webhook_url },
      apiKey: clave.apiKey,
      webhookSecret: data.webhook_secret,
      aviso: 'Guarda la API key y el secreto del webhook ahora: la API key no se vuelve a mostrar.',
    },
    201,
  );
});

admin.get('/integradores', async (c) => {
  const { data, error } = await db()
    .from('integradores')
    .select('id, nombre, webhook_url, activo, created_at, integrador_api_keys(id, prefijo, activo, ultimo_uso, created_at, revocada_at)')
    .order('created_at');
  if (error) throw error;
  return c.json({ data });
});

admin.post('/integradores/:id/api-keys', async (c) => {
  const clave = await crearApiKey(c.req.param('id'));
  return c.json({ ...clave, aviso: 'Guarda la API key ahora: no se vuelve a mostrar.' }, 201);
});

admin.post('/api-keys/:id/revocar', async (c) => {
  const { data, error } = await db()
    .from('integrador_api_keys')
    .update({ activo: false, revocada_at: new Date().toISOString() })
    .eq('id', c.req.param('id'))
    .select('id, prefijo, activo')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, 'api_key_no_encontrada', 'API key no encontrada');
  return c.json(data);
});

/** Despachador de webhooks, llamado cada minuto por pg_cron. */
export const interno = new Hono<AppEnv>();
interno.use('*', autenticarCron);

interno.post('/webhooks/dispatch', async (c) => c.json(await despacharEventos()));
