import { useState } from 'react';
import { Share2, Filter, Search, X, CheckCircle, XCircle, Clock, Eye, UserCheck, AlertCircle, FileText, Calendar, User, Heart, Activity, Droplet, Wind, Thermometer, Pill, Brain, Utensils } from 'lucide-react';
import { useApp } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { TimelineDerivaciones } from './TimelineDerivaciones';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { 
  PanelCardiologia, 
  PanelCirugia, 
  PanelAnestesia, 
  PanelEcografia, 
  PanelOdontologia, 
  PanelNeumologia, 
  PanelDermatologia, 
  PanelNutricion, 
  PanelEtologia 
} from './PanelesClinicosEspecialidad';

// Interfaces de datos clínicos por especialidad
interface DatosCardiologia {
  frecuenciaCardiaca: number;
  soplo?: {
    presente: boolean;
    grado?: string;
    localizacion?: string;
  };
  presionArterial?: {
    sistolica: number;
    diastolica: number;
  };
  diagnostico: string;
  riesgoQuirurgico: 'Bajo' | 'Moderado' | 'Alto' | 'Crítico';
  ecgMock?: boolean;
}

interface DatosCirugia {
  diagnosticoQuirurgico: string;
  tipoCirugia: string;
  riesgoASA: 'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'ASA V';
  recomendacionesPreop: string[];
  indicacionesPostop: string[];
  estado: 'Programada' | 'Realizada' | 'Cancelada';
  fechaProgramada?: string;
}

interface DatosAnestesia {
  evaluacionASA: 'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'ASA V';
  pesoAnestesico: number;
  protocoloAnestesico: string;
  riesgosDetectados: string[];
  aprobacionAnestesica: boolean;
  observacionesCriticas?: string;
}

interface DatosEcografia {
  tipoEstudio: string;
  fecha: string;
  hallazgosPrincipales: string[];
  conclusion: string;
  recomendacionClinica: string;
  imagenesMock?: number;
}

interface DatosOdontologia {
  indicePeriodontal: number;
  piezasAfectadas: string[];
  diagnostico: string;
  procedimientoSugerido: string;
  necesitaAnestesia: boolean;
}

interface DatosNeumologia {
  frecuenciaRespiratoria: number;
  saturacionO2: number;
  sonidosPulmonares: string[];
  diagnosticoRespiratorio: string;
  tratamientoSugerido: string;
}

interface DatosDermatologia {
  lesiones: {
    tipo: string;
    localizacion: string[];
  }[];
  diagnosticoPresuntivo: string;
  tratamientoTopico?: string;
  tratamientoSistemico?: string;
  seguimiento: string;
  fotosMock?: number;
}

interface DatosNutricion {
  pesoActual: number;
  pesoIdeal: number;
  condicionCorporal: number;
  dietaRecomendada: string;
  suplementos?: string[];
  seguimientoMensual: boolean;
}

interface DatosEtologia {
  motivoConductual: string;
  evaluacionEtologica: string;
  diagnostico: string;
  planConductual: string[];
  recomendacionesPropietario: string[];
}

interface Solicitud {
  id: number;
  paciente: {
    id: number;
    nombre: string;
    especie: string;
    raza: string;
    edad: string;
    sexo?: string;
    foto?: string;
    propietario?: {
      nombre: string;
      telefono: string;
    };
    alergias?: string[];
  };
  doctorSolicitante: {
    id: number;
    nombre: string;
    especialidad: string;
    foto?: string;
    clinica?: string;
  };
  doctorPropietario: {
    id: number;
    nombre: string;
    especialidad: string;
  };
  especialidadSolicitada: string;
  motivoClinico: string;
  permisos: {
    verDiagnosticos: boolean;
    verEstudios: boolean;
    verMedicacion: boolean;
    verHistoriaCompleta: boolean;
  };
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fechaSolicitud: string;
  fechaRespuesta?: string;
  motivoRespuesta?: string;
  esYoPropietario: boolean; // Si el usuario actual es el propietario
  esYoSolicitante: boolean; // Si el usuario actual es el solicitante
  timeline?: {
    fecha: string;
    accion: string;
    medico: string;
    comentario?: string;
  }[];
  // Datos clínicos específicos por especialidad
  datosCardiologia?: DatosCardiologia;
  datosCirugia?: DatosCirugia;
  datosAnestesia?: DatosAnestesia;
  datosEcografia?: DatosEcografia;
  datosOdontologia?: DatosOdontologia;
  datosNeumologia?: DatosNeumologia;
  datosDermatologia?: DatosDermatologia;
  datosNutricion?: DatosNutricion;
  datosEtologia?: DatosEtologia;
}

export function Interconsultas() {
  const { darkMode } = useApp();
  const [vistaActual, setVistaActual] = useState<'lista' | 'detalle'>('lista');
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [busquedaPaciente, setBusquedaPaciente] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('todas');
  const [mostrarModalRespuesta, setMostrarModalRespuesta] = useState(false);
  const [accionRespuesta, setAccionRespuesta] = useState<'aprobar' | 'rechazar'>('aprobar');
  const [motivoRespuesta, setMotivoRespuesta] = useState('');

  // Datos cargados del backend (inicialmente vacíos)
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  const solicitudesFiltradas = solicitudes.filter(s => {
    // Filtro por paciente
    if (busquedaPaciente && !s.paciente.nombre.toLowerCase().includes(busquedaPaciente.toLowerCase())) {
      return false;
    }

    // Filtro por estado
    if (filtroEstado !== 'todos' && s.estado !== filtroEstado) {
      return false;
    }

    // Filtro por especialidad
    if (filtroEspecialidad !== 'todas' && s.especialidadSolicitada !== filtroEspecialidad) {
      return false;
    }

    return true;
  });

  const contadorEstados = {
    pendiente: solicitudes.filter(s => s.estado === 'pendiente').length,
    aprobada: solicitudes.filter(s => s.estado === 'aprobada').length,
    rechazada: solicitudes.filter(s => s.estado === 'rechazada').length,
  };

  const handleVerDetalle = (solicitud: Solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setVistaActual('detalle');
  };

  const handleAprobarRechazar = (solicitud: Solicitud, accion: 'aprobar' | 'rechazar') => {
    setSolicitudSeleccionada(solicitud);
    setAccionRespuesta(accion);
    setMostrarModalRespuesta(true);
  };

  const confirmarRespuesta = () => {
    if (!solicitudSeleccionada) return;

    // Actualizar el estado de la solicitud
    setSolicitudes(solicitudes.map(s => {
      if (s.id === solicitudSeleccionada.id) {
        return {
          ...s,
          estado: accionRespuesta === 'aprobar' ? 'aprobada' : 'rechazada',
          fechaRespuesta: new Date().toISOString(),
          motivoRespuesta: motivoRespuesta || undefined,
        };
      }
      return s;
    }));

    // Toast de confirmación
    if (accionRespuesta === 'aprobar') {
      toast.success('✅ Solicitud aprobada correctamente', {
        description: `${solicitudSeleccionada.doctorSolicitante.nombre} ahora tiene acceso a ${solicitudSeleccionada.paciente.nombre}`,
        duration: 4000,
      });
    } else {
      toast.success('Solicitud rechazada', {
        description: `${solicitudSeleccionada.doctorSolicitante.nombre} ha sido notificado`,
        duration: 4000,
      });
    }

    // Cerrar modal y limpiar
    setMostrarModalRespuesta(false);
    setMotivoRespuesta('');
    setSolicitudSeleccionada(null);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/50 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'aprobada':
        return (
          <Badge className="bg-green-500/20 text-green-600 border-green-500/50 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobada
          </Badge>
        );
      case 'rechazada':
        return (
          <Badge className="bg-red-500/20 text-red-600 border-red-500/50 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazada
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diff = ahora.getTime() - date.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 60) return `Hace ${minutos} minutos`;
    if (horas < 24) return `Hace ${horas} horas`;
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Función para renderizar el panel clínico según especialidad
  const renderPanelClinico = (especialidad: string, solicitud: any) => {
    const especialidadNormalizada = especialidad.toLowerCase();
    
    if (especialidadNormalizada.includes('cardiolog')) {
      return <PanelCardiologia darkMode={darkMode} data={solicitud.datosCardiologia} />;
    }
    if (especialidadNormalizada.includes('cirug')) {
      return <PanelCirugia darkMode={darkMode} data={solicitud.datosCirugia} />;
    }
    if (especialidadNormalizada.includes('aneste')) {
      return <PanelAnestesia darkMode={darkMode} data={solicitud.datosAnestesia} />;
    }
    if (especialidadNormalizada.includes('ecograf') || especialidadNormalizada.includes('imagen')) {
      return <PanelEcografia darkMode={darkMode} data={solicitud.datosEcografia} />;
    }
    if (especialidadNormalizada.includes('odonto') || especialidadNormalizada.includes('dental')) {
      return <PanelOdontologia darkMode={darkMode} data={solicitud.datosOdontologia} />;
    }
    if (especialidadNormalizada.includes('neumolog') || especialidadNormalizada.includes('respirator')) {
      return <PanelNeumologia darkMode={darkMode} data={solicitud.datosNeumologia} />;
    }
    if (especialidadNormalizada.includes('dermatolog')) {
      return <PanelDermatologia darkMode={darkMode} data={solicitud.datosDermatologia} />;
    }
    if (especialidadNormalizada.includes('nutricio')) {
      return <PanelNutricion darkMode={darkMode} data={solicitud.datosNutricion} />;
    }
    if (especialidadNormalizada.includes('etolog') || especialidadNormalizada.includes('conductual')) {
      return <PanelEtologia darkMode={darkMode} data={solicitud.datosEtologia} />;
    }
    
    return null; // No hay panel específico para esta especialidad
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-[1600px] mx-auto">
        
        {vistaActual === 'lista' ? (
          // VISTA LISTA
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-3`}>
                  <div 
                    className="p-3 rounded-xl text-white"
                    style={{
                      background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                    }}
                  >
                    <Share2 className="w-8 h-8" />
                  </div>
                  Interconsultas
                </h1>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                  Accesos clínicos entre especialistas
                </p>
              </div>

              {/* Botón filtros */}
              <Button
                variant="outline"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={darkMode ? 'border-gray-700 text-gray-300' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {(filtroEstado !== 'todos' || filtroEspecialidad !== 'todas' || busquedaPaciente) && (
                  <Badge className="ml-2 bg-orange-500 text-white">
                    {[filtroEstado !== 'todos', filtroEspecialidad !== 'todas', busquedaPaciente].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pendientes
                    </p>
                    <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                      {contadorEstados.pendiente}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </Card>

              <Card className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Aprobadas
                    </p>
                    <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                      {contadorEstados.aprobada}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </Card>

              <Card className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Rechazadas
                    </p>
                    <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                      {contadorEstados.rechazada}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Panel de filtros */}
            <AnimatePresence>
              {mostrarFiltros && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Filtros Avanzados
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFiltroEstado('todos');
                          setFiltroEspecialidad('todas');
                          setBusquedaPaciente('');
                        }}
                        className={darkMode ? 'text-gray-400 hover:text-white' : ''}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Limpiar
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Filtro por paciente */}
                      <div>
                        <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          Buscar Paciente
                        </Label>
                        <div className="relative mt-1">
                          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          <Input
                            value={busquedaPaciente}
                            onChange={(e) => setBusquedaPaciente(e.target.value)}
                            placeholder="Nombre del paciente..."
                            className={`pl-10 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}`}
                          />
                        </div>
                      </div>

                      {/* Filtro por estado */}
                      <div>
                        <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          Estado
                        </Label>
                        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                          <SelectTrigger className={`mt-1 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={darkMode ? 'bg-gray-900 border-gray-700' : ''}>
                            <SelectItem value="todos" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                              Todos los estados
                            </SelectItem>
                            <SelectItem value="pendiente" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                              Pendientes
                            </SelectItem>
                            <SelectItem value="aprobada" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                              Aprobadas
                            </SelectItem>
                            <SelectItem value="rechazada" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                              Rechazadas
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Filtro por especialidad */}
                      <div>
                        <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          Especialidad
                        </Label>
                        <Select value={filtroEspecialidad} onValueChange={setFiltroEspecialidad}>
                          <SelectTrigger className={`mt-1 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={darkMode ? 'bg-gray-900 border-gray-700' : ''}>
                            <SelectItem value="todas" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                              Todas las especialidades
                            </SelectItem>
                            <SelectItem value="Cardiología Veterinaria" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                              Cardiología Veterinaria
                            </SelectItem>
                            <SelectItem value="Neurología Veterinaria" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                              Neurología Veterinaria
                            </SelectItem>
                            <SelectItem value="Oncología Veterinaria" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                              Oncología Veterinaria
                            </SelectItem>
                            <SelectItem value="Dermatología Veterinaria" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                              Dermatología Veterinaria
                            </SelectItem>
                            <SelectItem value="Medicina Interna" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                              Medicina Interna
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lista de solicitudes */}
            <div className="space-y-4">
              {solicitudesFiltradas.length === 0 ? (
                <Card className={`p-12 text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <Share2 className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    No hay solicitudes
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {busquedaPaciente || filtroEstado !== 'todos' || filtroEspecialidad !== 'todas'
                      ? 'No se encontraron solicitudes con los filtros aplicados'
                      : 'Aún no hay solicitudes de acceso clínico'}
                  </p>
                </Card>
              ) : (
                solicitudesFiltradas.map((solicitud) => (
                  <motion.div
                    key={solicitud.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={`p-6 hover:shadow-lg transition-shadow ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        
                        {/* Información del paciente */}
                        <div className="flex items-center gap-4 flex-1">
                          <div 
                            className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl ${
                              darkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}
                          >
                            {solicitud.paciente.especie === 'Canino' ? '🐕' : '🐱'}
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {solicitud.paciente.nombre}
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {solicitud.paciente.especie} • {solicitud.paciente.raza} • {solicitud.paciente.edad}
                            </p>
                          </div>
                        </div>

                        {/* Doctor solicitante */}
                        <div className="flex-1">
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>
                            {solicitud.esYoSolicitante ? 'Mi solicitud a:' : 'Solicitado por:'}
                          </p>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {solicitud.esYoSolicitante ? solicitud.doctorPropietario.nombre : solicitud.doctorSolicitante.nombre}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {solicitud.especialidadSolicitada}
                          </p>
                        </div>

                        {/* Estado y fecha */}
                        <div className="flex-1">
                          {getEstadoBadge(solicitud.estado)}
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                            {formatFecha(solicitud.fechaSolicitud)}
                          </p>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerDetalle(solicitud)}
                            className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : ''}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalle
                          </Button>

                          {solicitud.esYoPropietario && solicitud.estado === 'pendiente' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAprobarRechazar(solicitud, 'aprobar')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAprobarRechazar(solicitud, 'rechazar')}
                                className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Rechazar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ) : (
          // VISTA DETALLE
          <div className="space-y-6">
            {solicitudSeleccionada && (
              <>
                {/* Header Completo Enterprise */}
                <div className="space-y-4">
                  {/* Botón Volver */}
                  <Button
                    variant="ghost"
                    onClick={() => setVistaActual('lista')}
                    className={darkMode ? 'text-gray-300 hover:bg-gray-800' : ''}
                  >
                    ← Volver a interconsultas
                  </Button>

                  {/* Título + Badge + Fecha */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Interconsulta Clínica
                      </h1>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      {getEstadoBadge(solicitudSeleccionada.estado)}
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Solicitado {formatFecha(solicitudSeleccionada.fechaSolicitud)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* COLUMNA PRINCIPAL (2/3) */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* 1. INFORMACIÓN DEL PACIENTE */}
                    <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                      <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                        Información del Paciente
                      </h2>
                      
                      <div className="flex items-start gap-6 mb-4">
                        {/* Avatar grande del animal */}
                        <div className={`w-24 h-24 flex-shrink-0 rounded-xl flex items-center justify-center text-6xl ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          {solicitudSeleccionada.paciente.especie === 'Canino' ? '🐕' : '🐱'}
                        </div>
                        
                        {/* Info Paciente */}
                        <div className="flex-1 space-y-3">
                          {/* Nombre + Especie | Raza | Edad | Sexo */}
                          <div>
                            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {solicitudSeleccionada.paciente.nombre}
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                              {solicitudSeleccionada.paciente.especie} | {solicitudSeleccionada.paciente.raza} | {solicitudSeleccionada.paciente.edad}
                              {solicitudSeleccionada.paciente.sexo && ` | ${solicitudSeleccionada.paciente.sexo}`}
                            </p>
                          </div>

                          {/* Propietario */}
                          {solicitudSeleccionada.paciente.propietario && (
                            <div className={`pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>
                                Propietario
                              </p>
                              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {solicitudSeleccionada.paciente.propietario.nombre}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {solicitudSeleccionada.paciente.propietario.telefono}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Alergias (si existen) */}
                      {solicitudSeleccionada.paciente.alergias && solicitudSeleccionada.paciente.alergias.length > 0 && (
                        <div className={`p-3 rounded-lg flex items-start gap-2 ${
                          darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
                        }`}>
                          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                              ⚠️ Alergias Registradas
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'} mt-1`}>
                              {solicitudSeleccionada.paciente.alergias.join(', ')}
                            </p>
                          </div>
                        </div>
                      )}
                    </Card>

                    {/* 2. DOCTOR SOLICITANTE */}
                    <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                      <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                        Doctor Solicitante
                      </h2>
                      
                      <div className="flex items-start gap-4">
                        {/* Avatar del doctor */}
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white flex-shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                          }}
                        >
                          <User className="w-8 h-8" />
                        </div>
                        
                        {/* Datos del doctor */}
                        <div className="flex-1">
                          <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {solicitudSeleccionada.doctorSolicitante.nombre}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {solicitudSeleccionada.doctorSolicitante.especialidad}
                          </p>
                          {solicitudSeleccionada.doctorSolicitante.clinica && (
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mt-1`}>
                              {solicitudSeleccionada.doctorSolicitante.clinica}
                            </p>
                          )}
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2 flex items-center gap-1`}>
                            <Calendar className="w-3 h-3" />
                            Solicitado {formatFecha(solicitudSeleccionada.fechaSolicitud)}
                          </p>
                        </div>
                      </div>
                    </Card>

                    {/* 3. MOTIVO CLÍNICO */}
                    <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                      <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center justify-between gap-2`}>
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-orange-500" />
                          Motivo Clínico de la Interconsulta
                        </div>
                        <span className={`text-xs font-normal ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {solicitudSeleccionada.motivoClinico.length} caracteres
                        </span>
                      </h2>
                      
                      <div className={`p-4 rounded-lg ${
                        darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                      }`}>
                        <p className={`text-base leading-relaxed whitespace-pre-wrap ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {solicitudSeleccionada.motivoClinico}
                        </p>
                      </div>
                    </Card>

                    {/* BANNER: ACCESO CONCEDIDO POR INTERCONSULTA */}
                    {solicitudSeleccionada.estado === 'aprobada' && (
                      <div className={`p-4 rounded-lg flex items-center gap-3 ${
                        darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                      }`}>
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20">
                          <UserCheck className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                            ✓ Acceso Concedido por Interconsulta
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            Tienes acceso a la información clínica especializada compartida
                          </p>
                        </div>
                      </div>
                    )}

                    {/* PANEL CLÍNICO ESPECIALIZADO */}
                    {renderPanelClinico(solicitudSeleccionada.especialidadSolicitada, solicitudSeleccionada)}

                    {/* 4. HISTORIAL DE SOLICITUDES */}
                    <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                      <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
                        <Clock className="w-5 h-5 text-blue-500" />
                        Historial de Solicitudes
                      </h2>
                      
                      {(() => {
                        // Filtrar solicitudes del mismo paciente, excluyendo la actual
                        const solicitudesPrevias = solicitudes.filter(s => 
                          s.paciente.id === solicitudSeleccionada.paciente.id && 
                          s.id !== solicitudSeleccionada.id
                        );
                        
                        if (solicitudesPrevias.length === 0) {
                          return (
                            <div className="text-center py-8">
                              <Clock className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                No hay solicitudes previas
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                para este paciente
                              </p>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="space-y-3">
                            {solicitudesPrevias.map((solicitud) => (
                              <div 
                                key={solicitud.id}
                                className={`p-4 rounded-lg border ${
                                  darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                      {solicitud.doctorSolicitante.nombre}
                                    </p>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {solicitud.doctorSolicitante.especialidad}
                                    </p>
                                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                                      {formatFecha(solicitud.fechaSolicitud)}
                                    </p>
                                  </div>
                                  {getEstadoBadge(solicitud.estado)}
                                </div>
                                
                                {solicitud.motivoRespuesta && (
                                  <div className={`mt-3 pt-3 border-t ${
                                    darkMode ? 'border-gray-700' : 'border-gray-200'
                                  }`}>
                                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>
                                      Respuesta:
                                    </p>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {solicitud.motivoRespuesta}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </Card>

                    {/* 5. TIMELINE DE DERIVACIONES */}
                    {(() => {
                      // Derivaciones reales del paciente (en producción vendrían del backend)
                      const derivacionesMock: any[] = [];

                      if (derivacionesMock.length > 0) {
                        return (
                          <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                              Timeline de Derivaciones Clínicas
                            </h2>
                            <TimelineDerivaciones
                              darkMode={darkMode}
                              derivaciones={derivacionesMock}
                              paciente={{
                                nombre: solicitudSeleccionada.paciente.nombre,
                                especie: solicitudSeleccionada.paciente.especie
                              }}
                            />
                          </Card>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* SIDEBAR (1/3) */}
                  <div className="space-y-6">
                    
                    {/* 5. PERMISOS SOLICITADOS */}
                    <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                      <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                        Permisos Solicitados
                      </h2>
                      
                      <div className="space-y-3">
                        {/* Permiso 1: Ver diagnósticos */}
                        <div className="flex items-start gap-3">
                          {solicitudSeleccionada.permisos.verDiagnosticos ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                          )}
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              Ver diagnósticos
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              Acceso a diagnósticos activos y pasados
                            </p>
                          </div>
                        </div>
                        
                        {/* Permiso 2: Ver estudios */}
                        <div className="flex items-start gap-3">
                          {solicitudSeleccionada.permisos.verEstudios ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                          )}
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              Ver estudios
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              Imágenes, laboratorios y resultados
                            </p>
                          </div>
                        </div>
                        
                        {/* Permiso 3: Ver medicación */}
                        <div className="flex items-start gap-3">
                          {solicitudSeleccionada.permisos.verMedicacion ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                          )}
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              Ver medicación activa
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              Tratamientos actuales y dosis
                            </p>
                          </div>
                        </div>
                        
                        {/* Permiso 4: Historia completa */}
                        <div className="flex items-start gap-3">
                          {solicitudSeleccionada.permisos.verHistoriaCompleta ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                          )}
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              Historia clínica completa
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              Todas las consultas y procedimientos
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* 6. ACCIONES (solo si esYoPropietario && pendiente) */}
                    {solicitudSeleccionada.esYoPropietario && solicitudSeleccionada.estado === 'pendiente' && (
                      <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                          Acciones
                        </h2>
                        
                        <div className="space-y-3">
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAprobarRechazar(solicitudSeleccionada, 'aprobar')}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprobar Solicitud
                          </Button>
                          
                          <Button
                            variant="outline"
                            className="w-full border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleAprobarRechazar(solicitudSeleccionada, 'rechazar')}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazar Solicitud
                          </Button>
                        </div>
                        
                        <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
                          darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            darkMode ? 'text-gray-500' : 'text-gray-500'
                          }`} />
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                            Esta acción enviará una notificación automática al doctor solicitante.
                          </p>
                        </div>
                      </Card>
                    )}

                    {/* 7. RESPUESTA (solo si existe fechaRespuesta) */}
                    {solicitudSeleccionada.fechaRespuesta && (
                      <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                          Respuesta
                        </h2>
                        
                        <div className="space-y-3">
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>
                              Fecha de respuesta
                            </p>
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {formatFecha(solicitudSeleccionada.fechaRespuesta)}
                            </p>
                          </div>
                          
                          {solicitudSeleccionada.motivoRespuesta && (
                            <div>
                              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
                                Comentario
                              </p>
                              <div className={`p-3 rounded-lg ${
                                darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                              }`}>
                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {solicitudSeleccionada.motivoRespuesta}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal de aprobar/rechazar */}
      <AnimatePresence>
        {mostrarModalRespuesta && solicitudSeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border rounded-xl max-w-2xl w-full`}
            >
              <div className={`p-6 ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {accionRespuesta === 'aprobar' ? '✅ Aprobar Solicitud' : '❌ Rechazar Solicitud'}
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {solicitudSeleccionada.paciente.nombre} - {solicitudSeleccionada.doctorSolicitante.nombre}
                </p>
              </div>

              <div className="p-6 space-y-4">
                {accionRespuesta === 'aprobar' && (
                  <div className={`p-4 rounded-lg ${
                    darkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
                  }`}>
                    <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                      <strong>El doctor solicitante tendrá acceso a:</strong>
                    </p>
                    <ul className={`text-sm mt-2 space-y-1 ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                      {solicitudSeleccionada.permisos.verDiagnosticos && <li>• Diagnósticos</li>}
                      {solicitudSeleccionada.permisos.verEstudios && <li>• Estudios e imágenes</li>}
                      {solicitudSeleccionada.permisos.verMedicacion && <li>• Medicación activa</li>}
                      {solicitudSeleccionada.permisos.verHistoriaCompleta && <li>• Historia clínica completa</li>}
                    </ul>
                  </div>
                )}

                <div>
                  <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Mensaje (opcional)
                  </Label>
                  <Textarea
                    value={motivoRespuesta}
                    onChange={(e) => setMotivoRespuesta(e.target.value)}
                    placeholder={
                      accionRespuesta === 'aprobar'
                        ? 'Ejemplo: Acceso aprobado. Adjunto también última resonancia para tu evaluación.'
                        : 'Ejemplo: Necesito más información antes de aprobar el acceso. Por favor contacta conmigo.'
                    }
                    rows={3}
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                  />
                </div>
              </div>

              <div className={`p-6 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'} flex justify-end gap-3`}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMostrarModalRespuesta(false);
                    setMotivoRespuesta('');
                  }}
                  className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-900' : ''}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmarRespuesta}
                  className={
                    accionRespuesta === 'aprobar'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }
                >
                  {accionRespuesta === 'aprobar' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprobar Solicitud
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Rechazar Solicitud
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}