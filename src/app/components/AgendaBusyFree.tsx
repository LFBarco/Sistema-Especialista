import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { SelectorEspecialista } from './SelectorEspecialista';
import { PanelSolicitudServicio } from './PanelSolicitudServicio';
import { motion } from 'motion/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { toast } from 'sonner';

interface BloqueAgenda {
  hora: string;
  estado: 'libre' | 'ocupado' | 'bloqueado' | 'tentativo';
}

// Estado para trackear solicitudes pendientes por slot
interface SolicitudPendiente {
  fecha: string;
  hora: string;
}

export function AgendaBusyFree() {
  const { darkMode, servicios, especialistaSeleccionado, getEspecialistaById } = useApp();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [showPanelSolicitud, setShowPanelSolicitud] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ fecha: string; hora: string } | null>(null);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<SolicitudPendiente[]>([]);

  const especialistaActual = getEspecialistaById(especialistaSeleccionado);

  // Generar array de días para la semana seleccionada
  const getWeekDays = (date: Date) => {
    const days = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Ir al domingo

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(fechaSeleccionada);

  // Generar bloques de horarios (8:00 AM - 6:00 PM)
  const generarBloques = (): string[] => {
    const bloques = [];
    for (let hora = 8; hora <= 18; hora++) {
      bloques.push(`${hora.toString().padStart(2, '0')}:00`);
    }
    return bloques;
  };

  const bloques = generarBloques();

  // Función para obtener el estado de un bloque específico
  const getEstadoBloque = (fecha: Date, hora: string): 'libre' | 'ocupado' | 'bloqueado' | 'tentativo' => {
    const fechaStr = fecha.toISOString().split('T')[0];
    
    // Verificar si hay un servicio en ese horario
    const servicioEnHorario = servicios.find(s => 
      s.fecha === fechaStr && 
      s.hora === hora && 
      ['confirmado', 'completado'].includes(s.estado)
    );

    if (servicioEnHorario) {
      return 'ocupado';
    }

    // Fines de semana después de las 2pm se consideran bloqueados por defecto
    if ((fecha.getDay() === 0 || fecha.getDay() === 6) && parseInt(hora) >= 14) {
      return 'bloqueado';
    }

    // Verificar si hay servicios pendientes/tentativos en ese horario
    const servicioTentativo = servicios.find(s => 
      s.fecha === fechaStr && 
      s.hora === hora && 
      s.estado === 'pendiente'
    );

    if (servicioTentativo) {
      return 'tentativo';
    }

    return 'libre';
  };

  // Navegar semanas
  const navegarSemana = (direccion: 'prev' | 'next') => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(fechaSeleccionada.getDate() + (direccion === 'next' ? 7 : -7));
    setFechaSeleccionada(nuevaFecha);
  };

  // Función para obtener color según estado
  const getColorEstado = (estado: BloqueAgenda['estado']) => {
    switch (estado) {
      case 'libre':
        return {
          bg: darkMode ? 'bg-green-900/30' : 'bg-green-100',
          border: darkMode ? 'border-green-700' : 'border-green-300',
          text: darkMode ? 'text-green-400' : 'text-green-700',
          hover: darkMode ? 'hover:bg-green-900/50' : 'hover:bg-green-200'
        };
      case 'ocupado':
        return {
          bg: darkMode ? 'bg-red-900/30' : 'bg-red-100',
          border: darkMode ? 'border-red-700' : 'border-red-300',
          text: darkMode ? 'text-red-400' : 'text-red-700',
          hover: ''
        };
      case 'bloqueado':
        return {
          bg: darkMode ? 'bg-gray-800' : 'bg-gray-200',
          border: darkMode ? 'border-gray-700' : 'border-gray-400',
          text: darkMode ? 'text-gray-500' : 'text-gray-600',
          hover: ''
        };
      case 'tentativo':
        return {
          bg: darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100',
          border: darkMode ? 'border-yellow-700' : 'border-yellow-300',
          text: darkMode ? 'text-yellow-400' : 'text-yellow-700',
          hover: darkMode ? 'hover:bg-yellow-900/50' : 'hover:bg-yellow-200'
        };
    }
  };

  // Función para obtener texto según estado
  const getTextoEstado = (estado: BloqueAgenda['estado']) => {
    switch (estado) {
      case 'libre':
        return 'Disponible';
      case 'ocupado':
        return 'Ocupado';
      case 'bloqueado':
        return 'No disponible';
      case 'tentativo':
        return 'Tentativo';
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header con Selector de Especialista */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Agenda Especialista
            </h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Disponibilidad de {especialistaActual ? `Dr. ${especialistaActual.nombre} ${especialistaActual.apellido}` : 'Especialista'}
            </p>
          </div>
        </div>

        {/* Selector de Especialista */}
        <div className="w-full lg:w-auto">
          <SelectorEspecialista compact />
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${darkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-100 border border-green-300'}`}></div>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${darkMode ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-100 border border-yellow-300'}`}></div>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tentativo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${darkMode ? 'bg-red-900/30 border border-red-700' : 'bg-red-100 border border-red-300'}`}></div>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-200 border border-gray-400'}`}></div>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No disponible</span>
        </div>
      </div>

      {/* Aviso de privacidad */}
      <div className={`flex items-start gap-3 p-4 rounded-lg border ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
        <AlertCircle className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
            Vista de disponibilidad
          </p>
          <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
            Por privacidad, solo se muestra la disponibilidad del especialista, sin detalles de otros pacientes o motivos clínicos.
          </p>
        </div>
      </div>

      {/* Navegación de semana */}
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <Calendar className="w-5 h-5 text-blue-500" />
              Semana del {weekDays[0].toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} al {weekDays[6].toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
            </CardTitle>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navegarSemana('prev')}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                <ChevronLeft className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFechaSeleccionada(new Date())}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium transition-colors`}
              >
                Hoy
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navegarSemana('next')}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
              </motion.button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Grid de agenda */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Encabezados de días */}
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className={`p-3 text-center font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Hora
                </div>
                {weekDays.map((day, index) => {
                  const esHoy = day.toDateString() === new Date().toDateString();
                  return (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg text-center ${
                        esHoy 
                          ? 'bg-blue-500 text-white font-bold'
                          : darkMode 
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="text-xs font-medium">
                        {day.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}
                      </div>
                      <div className="text-lg font-bold">
                        {day.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bloques de horarios */}
              <div className="space-y-2">
                {bloques.map((hora) => (
                  <div key={hora} className="grid grid-cols-8 gap-2">
                    {/* Columna de hora */}
                    <div className={`flex items-center justify-center p-3 rounded-lg ${darkMode ? 'bg-gray-900/50 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">{hora}</span>
                    </div>

                    {/* Bloques para cada día */}
                    {weekDays.map((day, dayIndex) => {
                      const estado = getEstadoBloque(day, hora);
                      const colores = getColorEstado(estado);
                      const esClickeable = estado === 'libre';

                      return (
                        <motion.div
                          key={dayIndex}
                          whileHover={esClickeable ? { scale: 1.03 } : {}}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            colores.bg
                          } ${colores.border} ${esClickeable ? colores.hover + ' cursor-pointer' : 'cursor-not-allowed opacity-75'}`}
                          onClick={() => {
                            if (esClickeable) {
                              setSelectedSlot({ fecha: day.toISOString().split('T')[0], hora });
                              setShowPanelSolicitud(true);
                            }
                          }}
                        >
                          <div className={`text-xs font-semibold ${colores.text}`}>
                            {getTextoEstado(estado)}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de disponibilidad */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Espacios Disponibles
                </p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {bloques.length * 3}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Espacios Ocupados
                </p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {servicios.filter(s => s.estado === 'confirmado').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tasa de Ocupación
                </p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {Math.round((servicios.filter(s => s.estado === 'confirmado').length / (bloques.length * 7)) * 100)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel de solicitud de servicio */}
      {showPanelSolicitud && selectedSlot && (
        <PanelSolicitudServicio
          isOpen={showPanelSolicitud}
          onClose={() => {
            setShowPanelSolicitud(false);
            setSelectedSlot(null);
          }}
          fromAgenda={true}
          prefilledData={{
            especialistaId: especialistaSeleccionado,
            fecha: selectedSlot.fecha,
            hora: selectedSlot.hora
          }}
        />
      )}
    </div>
  );
}