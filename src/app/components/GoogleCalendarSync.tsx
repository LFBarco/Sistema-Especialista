import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, CheckCircle, XCircle, AlertCircle, Settings, Link, Unlink, Clock, MapPin, User, Phone } from 'lucide-react';
import { useApp } from '../App';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
  status: 'pendiente' | 'sincronizado' | 'error';
  clinicaNombre?: string;
  errorMessage?: string;
}

export function GoogleCalendarSync() {
  const { darkMode, crearSolicitud, userClinicas } = useApp();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedClinica, setSelectedClinica] = useState<string>('');
  const [autoSync, setAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState(30); // minutos

  const apiBaseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-91d1f360`;

  // Eventos de Google Calendar (se cargan al conectar con OAuth2)
  const mockGoogleEvents: CalendarEvent[] = [];

  const handleConnectGoogle = () => {
    setIsLoading(true);
    // En producción real, esto abriría el flujo OAuth2 de Google
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
      setLastSync(new Date().toLocaleString('es-CO'));
      toast.success('Conectado a Google Calendar exitosamente');
      
      // Cargar eventos mock
      setEvents(mockGoogleEvents);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setEvents([]);
    setLastSync(null);
    setAutoSync(false);
    toast.info('Desconectado de Google Calendar');
  };

  const extractPatientInfo = (summary: string, description?: string) => {
    // Extraer nombre del paciente del summary
    const patientMatch = summary.match(/[-–]\s*([^(]+)\s*\(/);
    const paciente = patientMatch ? patientMatch[1].trim() : 'Paciente';

    // Extraer especie
    const especieMatch = summary.match(/\(([^)]+)\)/);
    const especie = especieMatch ? especieMatch[1].trim() : 'No especificado';

    // Extraer tipo de servicio
    const tipo = summary.split(/[-–]/)[0]?.trim() || 'Consulta';

    // Extraer urgencia
    let urgencia: 'baja' | 'media' | 'alta' = 'media';
    if (description?.toLowerCase().includes('urgencia: alta') || description?.toLowerCase().includes('urgente')) {
      urgencia = 'alta';
    } else if (description?.toLowerCase().includes('urgencia: baja')) {
      urgencia = 'baja';
    }

    return { paciente, especie, tipo, urgencia };
  };

  const extractClinicaFromLocation = (location?: string) => {
    if (!location) return null;
    
    // Buscar coincidencia con clínicas registradas
    const clinica = userClinicas.find(c => 
      location.toLowerCase().includes(c.nombre.toLowerCase())
    );

    return clinica?.nombre || null;
  };

  const handleSyncEvent = async (event: CalendarEvent) => {
    setEvents(prev => prev.map(e => 
      e.id === event.id ? { ...e, status: 'pendiente' as const } : e
    ));

    try {
      const { paciente, especie, tipo, urgencia } = extractPatientInfo(event.summary, event.description);
      const clinicaNombre = selectedClinica || extractClinicaFromLocation(event.location);

      if (!clinicaNombre) {
        throw new Error('No se pudo determinar la clínica. Por favor selecciona una.');
      }

      const clinica = userClinicas.find(c => c.nombre === clinicaNombre);
      
      const fechaInicio = new Date(event.start);
      const fechaSolicitada = fechaInicio.toISOString().split('T')[0];
      const horaSolicitada = fechaInicio.toTimeString().slice(0, 5);

      const nuevaSolicitud = {
        clinica: clinicaNombre,
        tipo: tipo,
        paciente: paciente,
        especie: especie,
        fechaSolicitada: fechaSolicitada,
        horaSolicitada: horaSolicitada,
        urgencia: urgencia,
        descripcion: event.description || `Sincronizado desde Google Calendar: ${event.summary}`,
        tarifa: 250, // Tarifa por defecto
        direccion: clinica?.direccion || event.location || '',
        estado: 'pendiente' as const,
        fechaSolicitud: new Date().toISOString()
      };

      const success = await crearSolicitud(nuevaSolicitud);

      if (success) {
        setEvents(prev => prev.map(e => 
          e.id === event.id ? { ...e, status: 'sincronizado' as const, clinicaNombre } : e
        ));
        toast.success(`Evento sincronizado: ${paciente}`);
      } else {
        throw new Error('Error al crear solicitud');
      }
    } catch (error: any) {
      console.error('Error sincronizando evento:', error);
      setEvents(prev => prev.map(e => 
        e.id === event.id ? { 
          ...e, 
          status: 'error' as const,
          errorMessage: error.message 
        } : e
      ));
      toast.error(`Error al sincronizar: ${error.message}`);
    }
  };

  const handleSyncAll = async () => {
    setIsLoading(true);
    
    try {
      const eventosPendientes = events.filter(e => e.status === 'pendiente');
      
      for (const event of eventosPendientes) {
        await handleSyncEvent(event);
        // Pequeña pausa entre sincronizaciones
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast.success(`${eventosPendientes.length} eventos sincronizados`);
    } catch (error) {
      console.error('Error en sincronización masiva:', error);
      toast.error('Error al sincronizar eventos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshEvents = () => {
    setIsLoading(true);
    // En producción real, esto llamaría a la API de Google Calendar
    setTimeout(() => {
      setEvents(mockGoogleEvents);
      setLastSync(new Date().toLocaleString('es-CO'));
      setIsLoading(false);
      toast.success('Eventos actualizados');
    }, 1500);
  };

  // Auto-sync interval
  useEffect(() => {
    if (autoSync && isConnected) {
      const interval = setInterval(() => {
        handleRefreshEvents();
      }, syncInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [autoSync, isConnected, syncInterval]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <Calendar className="inline w-8 h-8 text-blue-500 mr-2" />
          Sincronización Google Calendar
        </h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
          Conecta tu Google Calendar para recibir solicitudes automáticamente
        </p>
      </div>

      {/* Connection Status */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isConnected 
                ? 'bg-green-500/20 text-green-500' 
                : 'bg-gray-500/20 text-gray-500'
            }`}>
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {isConnected ? 'Conectado' : 'No conectado'}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {isConnected 
                  ? `Última sincronización: ${lastSync}` 
                  : 'Conecta tu cuenta de Google para comenzar'
                }
              </p>
            </div>
          </div>

          {!isConnected ? (
            <button
              onClick={handleConnectGoogle}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Link className="w-5 h-5" />
                  Conectar con Google
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                darkMode 
                  ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400' 
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              }`}
            >
              <Unlink className="w-5 h-5" />
              Desconectar
            </button>
          )}
        </div>
      </div>

      {isConnected && (
        <>
          {/* Settings */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Settings className="w-5 h-5 text-purple-500" />
              Configuración de Sincronización
            </h3>

            <div className="space-y-4">
              {/* Clínica por defecto */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Clínica por defecto (opcional)
                </label>
                <select
                  value={selectedClinica}
                  onChange={(e) => setSelectedClinica(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="">Detectar automáticamente</option>
                  {userClinicas.map(clinica => (
                    <option key={clinica.id} value={clinica.nombre}>
                      {clinica.nombre}
                    </option>
                  ))}
                </select>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  Si no se especifica, se intentará detectar desde la ubicación del evento
                </p>
              </div>

              {/* Auto-sync */}
              <div className="flex items-center justify-between">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sincronización automática
                  </label>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    Actualizar eventos cada {syncInterval} minutos
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Sync interval */}
              {autoSync && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Intervalo de sincronización (minutos)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(Number(e.target.value))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-purple-500`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleRefreshEvents}
              disabled={isLoading}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              } disabled:opacity-50`}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar Eventos
            </button>
            <button
              onClick={handleSyncAll}
              disabled={isLoading || events.filter(e => e.status === 'pendiente').length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              Sincronizar Todos ({events.filter(e => e.status === 'pendiente').length})
            </button>
          </div>

          {/* Events List */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border`}>
            <div className="p-6 border-b border-gray-700">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Eventos de Google Calendar
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {events.length} eventos encontrados
              </p>
            </div>

            <div className="divide-y divide-gray-700">
              {events.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No hay eventos en tu calendario
                  </p>
                </div>
              ) : (
                events.map(event => (
                  <div key={event.id} className="p-6 hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          {/* Status Icon */}
                          <div className={`mt-1 ${
                            event.status === 'sincronizado' 
                              ? 'text-green-500' 
                              : event.status === 'error' 
                                ? 'text-red-500' 
                                : 'text-gray-500'
                          }`}>
                            {event.status === 'sincronizado' ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : event.status === 'error' ? (
                              <XCircle className="w-5 h-5" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </div>

                          <div className="flex-1">
                            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {event.summary}
                            </h4>
                            
                            <div className={`flex flex-wrap gap-4 mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDate(event.start)} • {formatTime(event.start)}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {event.location.split(',')[0]}
                                </div>
                              )}
                            </div>

                            {event.description && (
                              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {event.description}
                              </p>
                            )}

                            {event.clinicaNombre && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                  {event.clinicaNombre}
                                </span>
                              </div>
                            )}

                            {event.errorMessage && (
                              <div className={`mt-2 p-2 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-100'}`}>
                                <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                                  <AlertCircle className="w-4 h-4 inline mr-1" />
                                  {event.errorMessage}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      {event.status === 'pendiente' && (
                        <button
                          onClick={() => handleSyncEvent(event)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                        >
                          Sincronizar
                        </button>
                      )}
                      {event.status === 'sincronizado' && (
                        <span className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg text-sm font-medium whitespace-nowrap">
                          ✓ Sincronizado
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className={`${darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} rounded-xl border p-6`}>
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-blue-500 mt-1" />
              <div>
                <h3 className={`font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                  ¿Cómo funciona la sincronización?
                </h3>
                <ul className={`text-sm space-y-1 ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                  <li>• Los eventos de tu Google Calendar se convierten automáticamente en solicitudes</li>
                  <li>• El sistema detecta el paciente, especie y tipo de servicio del título del evento</li>
                  <li>• La ubicación del evento se usa para identificar la clínica</li>
                  <li>• Puedes revisar y aprobar solicitudes desde el módulo "Solicitudes"</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}