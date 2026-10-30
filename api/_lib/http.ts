import type { Context } from 'hono';

export class HttpError extends Error {
  constructor(
    public status: 400 | 401 | 403 | 404 | 409 | 410 | 413 | 422 | 500 | 503,
    public codigo: string,
    mensaje: string,
    public detalles?: unknown,
  ) {
    super(mensaje);
  }
}

export type Integrador = { id: string; nombre: string; webhookUrl: string | null };
export type Usuario = { id: string; email: string };

export type AppEnv = {
  Variables: {
    integrador: Integrador;
    usuario: Usuario;
  };
};

export async function leerJson<T = any>(c: Context): Promise<T> {
  try {
    const body = await c.req.json();
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      throw new Error();
    }
    return body as T;
  } catch {
    throw new HttpError(400, 'json_invalido', 'El cuerpo debe ser un objeto JSON válido');
  }
}

export function texto(
  valor: unknown,
  campo: string,
  opciones: { requerido?: boolean; max?: number } = {},
): string | undefined {
  const { requerido = false, max = 500 } = opciones;
  if (valor === undefined || valor === null || valor === '') {
    if (requerido) throw new HttpError(422, 'campo_requerido', `El campo "${campo}" es obligatorio`);
    return undefined;
  }
  if (typeof valor !== 'string' && typeof valor !== 'number') {
    throw new HttpError(422, 'campo_invalido', `El campo "${campo}" debe ser texto`);
  }
  const s = String(valor).trim();
  if (requerido && !s) throw new HttpError(422, 'campo_requerido', `El campo "${campo}" es obligatorio`);
  if (s.length > max) {
    throw new HttpError(422, 'campo_invalido', `El campo "${campo}" supera ${max} caracteres`);
  }
  return s || undefined;
}

export function fecha(valor: unknown, campo: string, requerido = true): string | undefined {
  const s = texto(valor, campo, { requerido, max: 10 });
  if (s === undefined) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(`${s}T00:00:00Z`))) {
    throw new HttpError(422, 'campo_invalido', `El campo "${campo}" debe tener formato AAAA-MM-DD`);
  }
  return s;
}

export function hora(valor: unknown, campo: string, requerido = true): string | undefined {
  const s = texto(valor, campo, { requerido, max: 5 });
  if (s === undefined) return undefined;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s)) {
    throw new HttpError(422, 'campo_invalido', `El campo "${campo}" debe tener formato HH:MM (24 h)`);
  }
  return s;
}

export function opcion<T extends string>(
  valor: unknown,
  campo: string,
  permitidos: readonly T[],
  porDefecto?: T,
): T {
  if (valor === undefined || valor === null || valor === '') {
    if (porDefecto !== undefined) return porDefecto;
    throw new HttpError(422, 'campo_requerido', `El campo "${campo}" es obligatorio`);
  }
  if (!permitidos.includes(valor as T)) {
    throw new HttpError(422, 'campo_invalido', `El campo "${campo}" debe ser uno de: ${permitidos.join(', ')}`);
  }
  return valor as T;
}

export function numero(valor: unknown, campo: string): number | undefined {
  if (valor === undefined || valor === null || valor === '') return undefined;
  const n = Number(valor);
  if (!Number.isFinite(n) || n < 0) {
    throw new HttpError(422, 'campo_invalido', `El campo "${campo}" debe ser un número positivo`);
  }
  return n;
}
