import { CheckCircle, XCircle, Clock, ArrowRight, Heart, Activity, Droplet, Wind, Thermometer, Pill, Brain, Utensils, FileText, User, Calendar, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface Derivacion {
  id: number;
  fecha: string;
  especialidad: string;
  doctorSolicitante: {
    nombre: string;
    especialidad: string;
  };
  doctorDestino?: {
    nombre: string;
    especialidad: string;
  };
  motivo: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'en-proceso' | 'completada';
  urgencia: 'baja' | 'media' | 'alta' | 'critica';
  autorizadoPor?: string;
  fechaAutorizacion?: string;
  interconsultaId?: number;
}

interface TimelineDerivacionesProps {
  darkMode: boolean;
  derivaciones: Derivacion[];
  paciente: {
    nombre: string;
    especie: string;
  };
}

const especialidadIcons: { [key: string]: any } = {
  'Cardiología': Heart,
  'Cirugía': Activity,
  'Anestesiología': Thermometer,
  'Ecografía': Activity,
  'Odontología': Pill,
  'Neumología': Wind,
  'Dermatología': Pill,
  'Nutrición': Utensils,
  'Etología': Brain,
  'Neurología': Brain,
  'Oncología': Activity,
  'Medicina Interna': FileText,
};

const especialidadColors: { [key: string]: string } = {
  'Cardiología': 'from-red-500 to-pink-600',
  'Cirugía': 'from-purple-500 to-indigo-600',
  'Anestesiología': 'from-cyan-500 to-blue-600',
  'Ecografía': 'from-teal-500 to-cyan-600',
  'Odontología': 'from-pink-500 to-rose-600',
  'Neumología': 'from-sky-500 to-blue-600',
  'Dermatología': 'from-amber-500 to-orange-600',
  'Nutrición': 'from-emerald-500 to-teal-600',
  'Etología': 'from-violet-500 to-purple-600',
  'Neurología': 'from-indigo-500 to-purple-600',
  'Oncología': 'from-rose-500 to-red-600',
  'Medicina Interna': 'from-blue-500 to-indigo-600',
};

export function TimelineDerivaciones({ darkMode, derivaciones, paciente }: TimelineDerivacionesProps) {
  const getEstadoBadge = (estado: string) => {
    const config = {
      'pendiente': { 
        label: 'Pendiente', 
        color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Clock 
      },
      'aprobada': { 
        label: 'Aprobada', 
        color: 'bg-green-500/20 text-green-600 border-green-500/50 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle 
      },
      'rechazada': { 
        label: 'Rechazada', 
        color: 'bg-red-500/20 text-red-600 border-red-500/50 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle 
      },
      'en-proceso': { 
        label: 'En Proceso', 
        color: 'bg-blue-500/20 text-blue-600 border-blue-500/50 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Activity 
      },
      'completada': { 
        label: 'Completada', 
        color: 'bg-green-500/20 text-green-600 border-green-500/50 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle 
      },
    };
    return config[estado as keyof typeof config] || config.pendiente;
  };

  const getUrgenciaBadge = (urgencia: string) => {
    const config = {
      'baja': 'bg-green-500/20 text-green-600 border-green-500/50 dark:bg-green-900/30 dark:text-green-400',
      'media': 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50 dark:bg-yellow-900/30 dark:text-yellow-400',
      'alta': 'bg-orange-500/20 text-orange-600 border-orange-500/50 dark:bg-orange-900/30 dark:text-orange-400',
      'critica': 'bg-red-500/20 text-red-600 border-red-500/50 dark:bg-red-900/30 dark:text-red-400',
    };
    return config[urgencia as keyof typeof config] || config.media;
  };

  const getEspecialidadIcon = (especialidad: string) => {
    const key = Object.keys(especialidadIcons).find(k => especialidad.includes(k));
    return key ? especialidadIcons[key] : FileText;
  };

  const getEspecialidadColor = (especialidad: string) => {
    const key = Object.keys(especialidadColors).find(k => especialidad.includes(k));
    return key ? especialidadColors[key] : 'from-gray-500 to-gray-600';
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (derivaciones.length === 0) {
    return (
      <Card className={`p-8 text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <FileText className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
        <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Sin derivaciones clínicas
        </p>
        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
          Este paciente aún no ha sido derivado a ninguna especialidad
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={`p-6 ${darkMode ? 'bg-gradient-to-r from-orange-900/20 to-orange-800/20 border-orange-800' : 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Timeline de Derivaciones Clínicas
            </h3>
            <p className={`text-sm ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
              {paciente.nombre} • {paciente.especie} • {derivaciones.length} derivación{derivaciones.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <div className="relative">
        {/* Línea vertical del timeline */}
        <div className={`absolute left-8 top-0 bottom-0 w-0.5 ${
          darkMode ? 'bg-gray-700' : 'bg-gray-300'
        }`} />

        <div className="space-y-8">
          {derivaciones.map((derivacion, index) => {
            const estadoConfig = getEstadoBadge(derivacion.estado);
            const EstadoIcon = estadoConfig.icon;
            const EspecialidadIcon = getEspecialidadIcon(derivacion.especialidad);
            const especialidadColor = getEspecialidadColor(derivacion.especialidad);

            return (
              <div key={derivacion.id} className="relative">
                {/* Nodo del timeline */}
                <div className="absolute left-0 top-0 flex items-center justify-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${especialidadColor} flex items-center justify-center shadow-lg border-4 ${
                    darkMode ? 'border-gray-900' : 'border-white'
                  }`}>
                    <EspecialidadIcon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Flecha de conexión (si no es el último) */}
                {index < derivaciones.length - 1 && (
                  <div className={`absolute left-7 top-20 flex flex-col items-center ${
                    darkMode ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    <ArrowRight className="w-5 h-5 rotate-90" />
                  </div>
                )}

                {/* Contenido */}
                <div className="ml-24">
                  <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                    {/* Header de la derivación */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {derivacion.especialidad}
                          </h4>
                          <Badge className={estadoConfig.color}>
                            <EstadoIcon className="w-3 h-3 mr-1" />
                            {estadoConfig.label}
                          </Badge>
                          <Badge className={getUrgenciaBadge(derivacion.urgencia)}>
                            {derivacion.urgencia.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className={`flex items-center gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatFecha(derivacion.fecha)}
                          </span>
                          {derivacion.interconsultaId && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              Interconsulta #{derivacion.interconsultaId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Médicos involucrados */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className={`p-3 rounded-lg ${
                        darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                      }`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>
                          Doctor Solicitante
                        </p>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {derivacion.doctorSolicitante.nombre}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {derivacion.doctorSolicitante.especialidad}
                        </p>
                      </div>

                      {derivacion.doctorDestino && (
                        <div className={`p-3 rounded-lg ${
                          darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>
                            Doctor Destino
                          </p>
                          <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {derivacion.doctorDestino.nombre}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {derivacion.doctorDestino.especialidad}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Motivo */}
                    <div className={`p-4 rounded-lg ${
                      darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-2 font-medium`}>
                        Motivo de Derivación
                      </p>
                      <p className={`text-sm leading-relaxed ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                        {derivacion.motivo}
                      </p>
                    </div>

                    {/* Autorización (si aplica) */}
                    {derivacion.autorizadoPor && derivacion.fechaAutorizacion && (
                      <div className={`mt-4 p-3 rounded-lg flex items-center gap-3 ${
                        darkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
                      }`}>
                        <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                        <div>
                          <p className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                            Autorizado por {derivacion.autorizadoPor}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                            {formatFecha(derivacion.fechaAutorizacion)}
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer de auditoría */}
      <Card className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Timeline de auditoría clínica • Todas las derivaciones e interconsultas quedan registradas • 
            El acceso a información clínica requiere autorización explícita del médico propietario del caso
          </p>
        </div>
      </Card>
    </div>
  );
}
