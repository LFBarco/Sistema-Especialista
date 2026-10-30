import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from './http.js';

const KV_TABLE = 'kv_store_91d1f360';
export const BUCKET_INFORMES = 'make-91d1f360-informes';

let cliente: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!cliente) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new HttpError(503, 'configuracion_incompleta', 'El servidor no tiene configurada la conexión a la base de datos');
    }
    cliente = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return cliente;
}

export async function kvGet<T = any>(key: string): Promise<T | null> {
  const { data, error } = await db().from(KV_TABLE).select('value').eq('key', key).maybeSingle();
  if (error) throw error;
  return (data?.value as T) ?? null;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const { error } = await db().from(KV_TABLE).upsert({ key, value });
  if (error) throw error;
}

export async function kvPorPrefijo<T = any>(prefijo: string): Promise<T[]> {
  const { data, error } = await db().from(KV_TABLE).select('value').like('key', `${prefijo}%`);
  if (error) throw error;
  return (data ?? []).map((fila) => fila.value as T);
}

export async function asegurarBucket(nombre: string): Promise<void> {
  const { data } = await db().storage.getBucket(nombre);
  if (!data) {
    const { error } = await db().storage.createBucket(nombre, { public: false });
    if (error && !/already exists/i.test(error.message)) throw error;
  }
}
