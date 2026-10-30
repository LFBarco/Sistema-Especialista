import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { MiddlewareHandler } from 'hono';
import { db } from './db.js';
import { HttpError, type AppEnv } from './http.js';

export const sha256 = (valor: string) => createHash('sha256').update(valor).digest('hex');

export function generarApiKey() {
  const key = `vsk_live_${randomBytes(24).toString('base64url')}`;
  return { key, prefijo: key.slice(0, 16), hash: sha256(key) };
}

export function secretosIguales(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

function bearer(header: string | undefined): string {
  return header?.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

export const autenticarIntegrador: MiddlewareHandler<AppEnv> = async (c, next) => {
  const key = bearer(c.req.header('Authorization'));
  if (!key.startsWith('vsk_')) {
    throw new HttpError(401, 'no_autorizado', 'Falta la API key en la cabecera Authorization: Bearer <api_key>');
  }

  const { data, error } = await db()
    .from('integrador_api_keys')
    .select('id, activo, integradores!inner(id, nombre, activo, webhook_url)')
    .eq('key_hash', sha256(key))
    .maybeSingle();
  if (error) throw error;

  const integrador = (data as any)?.integradores;
  if (!data || !data.activo || !integrador?.activo) {
    throw new HttpError(401, 'no_autorizado', 'API key inválida o revocada');
  }

  c.set('integrador', { id: integrador.id, nombre: integrador.nombre, webhookUrl: integrador.webhook_url });
  await db().from('integrador_api_keys').update({ ultimo_uso: new Date().toISOString() }).eq('id', data.id);
  await next();
};

export const autenticarUsuario: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = bearer(c.req.header('Authorization'));
  if (!token) throw new HttpError(401, 'no_autorizado', 'Sesión requerida');

  const { data, error } = await db().auth.getUser(token);
  if (error || !data.user?.email) throw new HttpError(401, 'no_autorizado', 'Sesión inválida o expirada');

  c.set('usuario', { id: data.user.id, email: data.user.email });
  await next();
};

function exigirSecreto(variable: 'ADMIN_SECRET' | 'CRON_SECRET', recibido: string) {
  const esperado = process.env[variable];
  if (!esperado || esperado.length < 16) {
    throw new HttpError(503, 'configuracion_incompleta', `Falta configurar ${variable} en el servidor`);
  }
  if (!recibido || !secretosIguales(recibido, esperado)) {
    throw new HttpError(401, 'no_autorizado', 'Credencial inválida');
  }
}

export const autenticarAdmin: MiddlewareHandler<AppEnv> = async (c, next) => {
  exigirSecreto('ADMIN_SECRET', c.req.header('X-Admin-Secret') ?? '');
  await next();
};

export const autenticarCron: MiddlewareHandler<AppEnv> = async (c, next) => {
  exigirSecreto('CRON_SECRET', bearer(c.req.header('Authorization')));
  await next();
};
