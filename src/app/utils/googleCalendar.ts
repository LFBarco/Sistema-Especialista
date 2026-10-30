/**
 * Cliente ligero de Google Calendar (GIS + Calendar API v3).
 * Requiere VITE_GOOGLE_CLIENT_ID en el entorno de Vite.
 * Sin Client ID: el portal ofrece exportar .ics (compatible con Google).
 */

const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const STORAGE_KEY = 'vs_google_calendar_token';

export type GoogleToken = {
  access_token: string;
  expires_at: number;
  email?: string;
};

declare global {
  interface Window {
    google?: any;
  }
}

export function googleClientId() {
  return (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
}

export function leerToken(): GoogleToken | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const t = JSON.parse(raw) as GoogleToken;
    if (!t.access_token || t.expires_at < Date.now() + 60_000) return null;
    return t;
  } catch {
    return null;
  }
}

export function guardarToken(t: GoogleToken) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
}

export function borrarToken() {
  localStorage.removeItem(STORAGE_KEY);
}

function loadGis(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
    document.head.appendChild(s);
  });
}

/** Abre el consentimiento de Google y guarda el token. */
export async function conectarGoogleCalendar(): Promise<GoogleToken> {
  const clientId = googleClientId();
  if (!clientId) {
    throw new Error('Falta VITE_GOOGLE_CLIENT_ID. Configúralo en Vercel / .env.local para activar OAuth.');
  }
  await loadGis();
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (resp: any) => {
        if (resp.error) {
          reject(new Error(resp.error_description || resp.error));
          return;
        }
        const token: GoogleToken = {
          access_token: resp.access_token,
          expires_at: Date.now() + (resp.expires_in || 3600) * 1000,
        };
        guardarToken(token);
        resolve(token);
      },
    });
    client.requestAccessToken({ prompt: 'consent' });
  });
}

export async function listarEventosGoogle(desde: Date, hasta: Date) {
  const token = leerToken();
  if (!token) throw new Error('No hay sesión de Google Calendar');
  const params = new URLSearchParams({
    timeMin: desde.toISOString(),
    timeMax: hasta.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '100',
  });
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!res.ok) {
    if (res.status === 401) borrarToken();
    throw new Error(`Google Calendar: ${res.status}`);
  }
  const data = await res.json();
  return (data.items || []) as any[];
}

export type GoogleEventoInput = {
  summary: string;
  description?: string;
  location?: string;
  start: string; // ISO
  end: string;
};

function bodyEvento(evento: GoogleEventoInput) {
  return {
    summary: evento.summary,
    description: evento.description,
    location: evento.location,
    start: { dateTime: evento.start, timeZone: 'America/Lima' },
    end: { dateTime: evento.end, timeZone: 'America/Lima' },
  };
}

export async function crearEventoGoogle(evento: GoogleEventoInput) {
  const token = leerToken();
  if (!token) throw new Error('No hay sesión de Google Calendar');
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyEvento(evento)),
  });
  if (!res.ok) {
    if (res.status === 401) borrarToken();
    throw new Error(`No se pudo crear el evento (${res.status})`);
  }
  return res.json();
}

export async function actualizarEventoGoogle(eventId: string, evento: GoogleEventoInput) {
  const token = leerToken();
  if (!token) throw new Error('No hay sesión de Google Calendar');
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyEvento(evento)),
    },
  );
  if (!res.ok) {
    if (res.status === 401) borrarToken();
    // Evento borrado en Google → recrear
    if (res.status === 404) return crearEventoGoogle(evento);
    throw new Error(`No se pudo actualizar el evento (${res.status})`);
  }
  return res.json();
}

export type ServicioGoogle = {
  tipo: string;
  paciente: string;
  clinica: string;
  estado: string;
  direccion?: string;
  fecha: string;
  hora?: string;
  duracion?: number;
  googleEventId?: string;
};

/**
 * Crea o actualiza el evento en Google.
 * Devuelve el eventId (para guardarlo en el servicio) o null si no hay sesión.
 */
export async function empujarServicioAGoogle(s: ServicioGoogle): Promise<string | null> {
  if (!leerToken()) return null;
  const start = new Date(`${s.fecha}T${s.hora || '09:00'}:00`);
  const end = new Date(start.getTime() + (s.duracion || 60) * 60_000);
  const payload: GoogleEventoInput = {
    summary: `${s.tipo} — ${s.paciente}`,
    description: `Clínica: ${s.clinica}\nEstado: ${s.estado}\nOrigen: VetSpecialist`,
    location: s.direccion || s.clinica,
    start: start.toISOString(),
    end: end.toISOString(),
  };
  const ev = s.googleEventId
    ? await actualizarEventoGoogle(s.googleEventId, payload)
    : await crearEventoGoogle(payload);
  return (ev?.id as string) || s.googleEventId || null;
}

export function descargarIcs(nombre: string, contenido: string) {
  const blob = new Blob([contenido], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}
