import { useEffect, useState } from 'react';
import { Calendar, RefreshCw, CheckCircle, Unlink, Download, Upload, Link2, AlertCircle, Clock } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { toast } from 'sonner';
import { useApp } from '../App';
import {
  borrarToken,
  conectarGoogleCalendar,
  descargarIcs,
  empujarServicioAGoogle,
  googleClientId,
  leerToken,
  listarEventosGoogle,
} from '../utils/googleCalendar';
import { servicioAIcs } from './AgendaCalendarioPro';

type EventoGoogle = {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
};

export function GoogleCalendarSync() {
  const { darkMode, servicios, navegarA, crearServicio, userClinicas, actualizarServicio } = useApp();
  const [conectado, setConectado] = useState(!!leerToken());
  const [cargando, setCargando] = useState(false);
  const [eventos, setEventos] = useState<EventoGoogle[]>([]);
  const [ultimaSync, setUltimaSync] = useState<string | null>(null);
  const clientId = googleClientId();

  const proximos = servicios
    .filter((s) => s.estado !== 'cancelado' && s.fecha >= format(new Date(), 'yyyy-MM-dd'))
    .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`))
    .slice(0, 40);

  useEffect(() => {
    if (conectado) cargarEventos().catch(() => setConectado(false));
  }, []);

  const cargarEventos = async () => {
    setCargando(true);
    try {
      const items = await listarEventosGoogle(new Date(), addDays(new Date(), 30));
      setEventos(
        items.map((e: any) => ({
          id: e.id,
          summary: e.summary || '(Sin título)',
          start: e.start?.dateTime || e.start?.date,
          end: e.end?.dateTime || e.end?.date,
          location: e.location,
          description: e.description,
        })),
      );
      setUltimaSync(new Date().toLocaleString('es-PE'));
      setConectado(true);
    } finally {
      setCargando(false);
    }
  };

  const conectar = async () => {
    setCargando(true);
    try {
      await conectarGoogleCalendar();
      setConectado(true);
      toast.success('Google Calendar conectado');
      await cargarEventos();
    } catch (e: any) {
      toast.error(e.message || 'No se pudo conectar');
    } finally {
      setCargando(false);
    }
  };

  const desconectar = () => {
    borrarToken();
    setConectado(false);
    setEventos([]);
    toast.info('Desconectado de Google Calendar');
  };

  const exportarTodosIcs = () => {
    if (!proximos.length) {
      toast.info('No hay citas próximas para exportar');
      return;
    }
    const vevents = proximos
      .map((s) => {
        const full = servicioAIcs(s);
        const m = full.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/);
        return m ? m[0] : '';
      })
      .filter(Boolean)
      .join('\r\n');
    const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//VetSpecialist//ES\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n${vevents}\r\nEND:VCALENDAR`;
    descargarIcs('vetspecialist-agenda.ics', ics);
    toast.success('Archivo .ics descargado — ábrelo en Google Calendar → Importar');
  };

  const empujarAGoogle = async () => {
    if (!conectado) {
      toast.error('Conecta Google Calendar primero');
      return;
    }
    setCargando(true);
    let ok = 0;
    try {
      for (const s of proximos.slice(0, 20)) {
        const eventId = await empujarServicioAGoogle(s);
        if (eventId && eventId !== s.googleEventId) {
          await actualizarServicio(s.id, { googleEventId: eventId });
        }
        ok++;
      }
      toast.success(`${ok} citas enviadas / actualizadas en Google Calendar`);
      await cargarEventos();
    } catch (e: any) {
      toast.error(e.message || 'Error al enviar a Google');
    } finally {
      setCargando(false);
    }
  };

  const importarComoServicio = async (ev: EventoGoogle) => {
    const start = new Date(ev.start);
    const clinica = userClinicas[0];
    try {
      await crearServicio({
        fecha: format(start, 'yyyy-MM-dd'),
        hora: format(start, 'HH:mm'),
        duracion: 60,
        clinica: clinica?.nombre || ev.location || 'Google Calendar',
        tipo: ev.summary.split('—')[0]?.trim() || ev.summary,
        paciente: ev.summary.includes('—') ? ev.summary.split('—')[1].trim() : 'Desde Google',
        especie: 'Por definir',
        estado: 'confirmado',
        tarifa: 0,
        notas: ev.description || `Importado de Google (${ev.id})`,
        direccion: ev.location,
      });
      toast.success('Cita creada en tu agenda de VetSpecialist');
      navegarA('agenda');
    } catch (e: any) {
      toast.error(e.message || 'No se pudo importar');
    }
  };

  return (
    <div className={`p-4 sm:p-6 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Google Calendar</h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Mantén tu agenda de especialista alineada con Google. Exporta, importa o sincroniza.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navegarA('agenda')}
            className="text-sm text-orange-500 hover:underline"
          >
            ← Volver a Agenda
          </button>
        </div>

        {/* Estado conexión */}
        <div className={`rounded-xl border p-5 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${conectado ? 'bg-green-500/15' : 'bg-orange-500/15'}`}>
                <Calendar className={`w-6 h-6 ${conectado ? 'text-green-500' : 'text-orange-500'}`} />
              </div>
              <div>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {conectado ? 'Conectado a Google Calendar' : 'No conectado'}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {conectado
                    ? ultimaSync
                      ? `Última sync: ${ultimaSync}`
                      : 'Listo para sincronizar'
                    : clientId
                      ? 'Conecta tu cuenta de Google para sync bidireccional'
                      : 'OAuth aún no configurado — usa exportar .ics mientras tanto'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {conectado ? (
                <>
                  <button
                    type="button"
                    disabled={cargando}
                    onClick={() => cargarEventos()}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
                    Sincronizar
                  </button>
                  <button
                    type="button"
                    onClick={desconectar}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 ${
                      darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <Unlink className="w-4 h-4" />
                    Desconectar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={cargando || !clientId}
                  onClick={conectar}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                >
                  <Link2 className="w-4 h-4" />
                  Conectar Google
                </button>
              )}
            </div>
          </div>

          {!clientId && (
            <div className={`mt-4 flex gap-2 text-sm rounded-lg p-3 ${darkMode ? 'bg-amber-500/10 text-amber-200' : 'bg-amber-50 text-amber-800'}`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                Para OAuth en vivo, agrega <code className="font-mono text-xs">VITE_GOOGLE_CLIENT_ID</code> en Vercel
                (Google Cloud Console → OAuth 2.0 Client ID, origen {typeof window !== 'undefined' ? window.location.origin : ''})
                y vuelve a desplegar. Mientras tanto puedes exportar .ics.
              </div>
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={exportarTodosIcs}
            className={`rounded-xl border p-5 text-left transition hover:border-orange-500 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <Download className="w-5 h-5 text-orange-500 mb-2" />
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Exportar agenda (.ics)</p>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Descarga tus próximas {proximos.length} citas e impórtalas en Google Calendar (funciona ya).
            </p>
          </button>
          <button
            type="button"
            onClick={empujarAGoogle}
            disabled={!conectado || cargando}
            className={`rounded-xl border p-5 text-left transition hover:border-orange-500 disabled:opacity-50 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <Upload className="w-5 h-5 text-orange-500 mb-2" />
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Enviar citas a Google</p>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Crea eventos en tu calendario primary a partir de los servicios confirmados (hasta 20).
            </p>
          </button>
        </div>

        {/* Eventos Google */}
        {conectado && (
          <div className={`rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-5 py-3 border-b flex items-center justify-between ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Próximos en Google ({eventos.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[420px] overflow-y-auto">
              {eventos.length === 0 && (
                <p className={`p-5 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay eventos en los próximos 30 días, o aún no sincronizaste.
                </p>
              )}
              {eventos.map((ev) => (
                <div key={ev.id} className="px-5 py-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{ev.summary}</p>
                    <p className={`text-xs flex items-center gap-1 mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Clock className="w-3 h-3" />
                      {new Date(ev.start).toLocaleString('es-PE')}
                      {ev.location ? ` · ${ev.location}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => importarComoServicio(ev)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-500 font-medium hover:bg-orange-500/25"
                  >
                    Traer a VetSpecialist
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Citas locales */}
        <div className={`rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`px-5 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              En tu portal ({proximos.length} próximas)
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {proximos.slice(0, 8).map((s) => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {s.paciente} · {s.tipo}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {s.fecha} {s.hora} · {s.clinica}
                  </p>
                </div>
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              </div>
            ))}
            {proximos.length === 0 && (
              <p className={`p-5 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No hay citas próximas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
