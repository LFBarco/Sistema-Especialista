import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import { HttpError, type AppEnv } from './_lib/http.js';
import { admin, interno } from './_lib/rutas/admin.js';
import portal from './_lib/rutas/portal.js';
import publico from './_lib/rutas/publico.js';
import v1 from './_lib/rutas/v1.js';

const app = new Hono<AppEnv>().basePath('/api');

app.use(
  '/v1/*',
  cors({
    origin: '*',
    allowHeaders: ['Authorization', 'Content-Type', 'Idempotency-Key'],
    allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  }),
);

app.get('/health', (c) => c.json({ ok: true, version: 'v1', hora: new Date().toISOString() }));

app.route('/v1', v1);
app.route('/public', publico);
app.route('/portal', portal);
app.route('/admin', admin);
app.route('/internal', interno);

app.notFound((c) => c.json({ error: { codigo: 'ruta_no_encontrada', mensaje: 'Ruta no encontrada' } }, 404));

app.onError((err, c) => {
  if (err instanceof HttpError) {
    return c.json(
      { error: { codigo: err.codigo, mensaje: err.message, ...(err.detalles ? { detalles: err.detalles } : {}) } },
      err.status,
    );
  }
  console.error('[api] error no controlado', err);
  return c.json({ error: { codigo: 'error_interno', mensaje: 'Error interno del servidor' } }, 500);
});

const handler = handle(app);
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
