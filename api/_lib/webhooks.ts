import { createHmac } from 'node:crypto';
import { db } from './db.js';

const MAX_INTENTOS = 12;
const TIMEOUT_MS = 5000;
const LOTE_PARALELO = 10;

export function firmar(secreto: string, timestamp: number, cuerpo: string): string {
  return createHmac('sha256', secreto).update(`${timestamp}.${cuerpo}`).digest('hex');
}

export async function encolarEvento(integradorId: string, tipo: string, payload: Record<string, unknown>) {
  const { data, error } = await db()
    .from('webhook_eventos')
    .insert({ integrador_id: integradorId, tipo, payload })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

type Evento = {
  id: string;
  integrador_id: string;
  tipo: string;
  payload: unknown;
  intentos: number;
  created_at: string;
};

async function enviar(evento: Evento, destino: { webhook_url: string | null; webhook_secret: string; activo: boolean } | undefined) {
  if (!destino?.activo || !destino.webhook_url) {
    await db()
      .from('webhook_eventos')
      .update({
        estado: 'pendiente',
        proximo_intento: new Date(Date.now() + 10 * 60_000).toISOString(),
        ultimo_error: 'El integrador no tiene una URL de webhook configurada',
      })
      .eq('id', evento.id);
    return 'sin_destino' as const;
  }

  const cuerpo = JSON.stringify({
    id: evento.id,
    tipo: evento.tipo,
    creadoEn: evento.created_at,
    data: evento.payload,
  });
  const timestamp = Math.floor(Date.now() / 1000);
  const intentos = evento.intentos + 1;

  let error: string | null = null;
  try {
    const res = await fetch(destino.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VetSpecialist-Webhooks/1.0',
        'X-VetSpecialist-Evento': evento.tipo,
        'X-VetSpecialist-Entrega': evento.id,
        'X-VetSpecialist-Firma': `t=${timestamp},v1=${firmar(destino.webhook_secret, timestamp, cuerpo)}`,
      },
      body: cuerpo,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) error = `HTTP ${res.status}`;
  } catch (e: any) {
    error = e?.name === 'TimeoutError' ? `Sin respuesta en ${TIMEOUT_MS / 1000} s` : String(e?.message ?? e);
  }

  if (!error) {
    await db()
      .from('webhook_eventos')
      .update({ estado: 'enviado', intentos, enviado_at: new Date().toISOString(), ultimo_error: null })
      .eq('id', evento.id);
    return 'enviado' as const;
  }

  const agotado = intentos >= MAX_INTENTOS;
  const esperaMin = Math.min(2 ** intentos, 360);
  await db()
    .from('webhook_eventos')
    .update({
      estado: agotado ? 'fallido' : 'pendiente',
      intentos,
      ultimo_error: error.slice(0, 500),
      proximo_intento: new Date(Date.now() + esperaMin * 60_000).toISOString(),
    })
    .eq('id', evento.id);
  return agotado ? ('fallido' as const) : ('reintento' as const);
}

export async function despacharEventos(limite = 50) {
  const { data, error } = await db().rpc('integracion_tomar_eventos', { p_limite: limite });
  if (error) throw error;
  const eventos = (data ?? []) as Evento[];
  const resumen = { procesados: eventos.length, enviados: 0, reintentos: 0, fallidos: 0, sinDestino: 0 };
  if (eventos.length === 0) return resumen;

  const ids = [...new Set(eventos.map((e) => e.integrador_id))];
  const { data: integradores, error: errorInt } = await db()
    .from('integradores')
    .select('id, webhook_url, webhook_secret, activo')
    .in('id', ids);
  if (errorInt) throw errorInt;
  const porId = new Map((integradores ?? []).map((i) => [i.id, i]));

  for (let i = 0; i < eventos.length; i += LOTE_PARALELO) {
    const lote = eventos.slice(i, i + LOTE_PARALELO);
    const resultados = await Promise.all(lote.map((e) => enviar(e, porId.get(e.integrador_id))));
    for (const r of resultados) {
      if (r === 'enviado') resumen.enviados++;
      else if (r === 'reintento') resumen.reintentos++;
      else if (r === 'fallido') resumen.fallidos++;
      else resumen.sinDestino++;
    }
  }
  return resumen;
}
