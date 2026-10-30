import { supabase } from './supabase/client';
import type { InformeServicio } from '../App';

async function llamar<T>(path: string, options: RequestInit = {}, conSesion = true): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (conSesion) {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.access_token) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.');
    headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  const res = await fetch(`/api${path}`, { ...options, headers: { ...headers, ...(options.headers as any) } });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error?.mensaje ?? `Error ${res.status}`);
  if (body === null) throw new Error('El servicio no está disponible en este momento. Intenta más tarde.');
  return body as T;
}

export type AfiliacionPortal = {
  id: string;
  clinica: { id: string; nombre: string; ciudad: string | null; ruc: string | null };
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'revocada';
  origen: string;
  integrador: string | null;
  mensaje: string | null;
  solicitadaEn: string;
  respondidaEn: string | null;
};

export const afiliacionesPortalAPI = {
  listar: () => llamar<{ data: AfiliacionPortal[] }>('/portal/afiliaciones').then((r) => r.data),
  responder: (id: string, accion: 'aprobar' | 'rechazar' | 'revocar') =>
    llamar(`/portal/afiliaciones/${id}/responder`, { method: 'POST', body: JSON.stringify({ accion }) }),
};

function aBase64(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result).split(',')[1] ?? '');
    lector.onerror = () => reject(lector.error);
    lector.readAsDataURL(archivo);
  });
}

export const informesAPI = {
  async subir(servicioId: number | string, archivo: File) {
    const contenidoBase64 = await aBase64(archivo);
    const r = await llamar<{ informe: InformeServicio }>(`/portal/servicios/${servicioId}/informe`, {
      method: 'POST',
      body: JSON.stringify({ nombreArchivo: archivo.name, contenidoBase64 }),
    });
    return r.informe;
  },
  enlace: (servicioId: number | string) =>
    llamar<{ url: string }>(`/portal/servicios/${servicioId}/informe`).then((r) => r.url),
};

export type BorradorPublico = {
  integrador: string;
  clinica: { nombre: string | null };
  datos: {
    tipoServicio?: string;
    motivo?: string;
    urgencia?: 'baja' | 'media' | 'alta';
    paciente: { nombre: string; especie: string; raza?: string; sexo?: string; peso?: number };
  };
  especialistas: { id: string; nombre: string; especialidad: string | null; ciudad: string | null; tarifaBase: number | null }[];
  expiraEn: string;
};

export const borradorAPI = {
  obtener: (token: string) => llamar<BorradorPublico>(`/public/borradores/${token}`, {}, false),
  disponibilidad: (token: string, especialistaId: string, desde: string, hasta: string) =>
    llamar<{ dias: { fecha: string; horas: string[] }[] }>(
      `/public/borradores/${token}/disponibilidad?especialistaId=${encodeURIComponent(especialistaId)}&desde=${desde}&hasta=${hasta}`,
      {},
      false,
    ),
  solicitar: (token: string, datos: { especialistaId: string; fecha: string; hora: string; tipoServicio: string; motivo: string; urgencia: string }) =>
    llamar<{ id: string; estado: string }>(`/public/borradores/${token}/solicitar`, { method: 'POST', body: JSON.stringify(datos) }, false),
};
