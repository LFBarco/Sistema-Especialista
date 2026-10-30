import { useState } from 'react';
import { Check, X, Clock, MapPin, Calendar, User, FileText, ChevronDown, Activity, Plus, AlertCircle, Info, Search, LayoutGrid, List, RefreshCw, ArrowRight, Eye, ExternalLink } from 'lucide-react';
import { useApp } from '../App';
import { toast } from 'sonner';
import { ClinicaFilter, getClinicaColor } from './ClinicaFilter';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { TimelineProgreso } from './TimelineProgreso';

type ViewMode = 'compact' | 'expanded';

export function Solicitudes() {
  const { solicitudes, aceptarSolicitud, rechazarSolicitud, darkMode, userClinicas, getClinicaByNombre, crearSolicitud, rolActivo, configServicios, especialistas, usuarioActual, navegarA } = useApp();
  const miEspecialista = especialistas.find(
    e => !!usuarioActual?.email && e.email?.toLowerCase() === usuarioActual.email.toLowerCase()
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedClinica, setSelectedClinica] = useState('todas');
  const [showNuevaSolicitudModal, setShowNuevaSolicitudModal] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  
  // Nuevos estados para optimización
  const [viewMode, setViewMode] = useState<ViewMode>('expanded');
  const [searchQuery, setSearchQuery] = useState('');
  const [rechazandoId, setRechazandoId] = useState<number | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [reprogramandoId, setReprogramandoId] = useState<number | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    clinica: '',
    tipo: '',
    paciente: '',
    especie: '',
    fechaSolicitada: '',
    horaSolicitada: '',
    urgencia: 'media' as 'baja' | 'media' | 'alta' | 'critica',
    descripcion: '',
    direccion: '',
    tarifa: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-set tarifa based on service type configuration
      if (field === 'tipo') {
        const servicioConfig = configServicios.find(s => s.nombre === value);
        if (servicioConfig?.metadata?.precio) {
          newData.tarifa = servicioConfig.metadata.precio.toString();
        }
      }
      
      return newData;
    });
  };

  const handleCrearSolicitud = async () => {
    // Validaciones
    if (!formData.clinica) {
      toast.error('Debes seleccionar una clínica');
      return;
    }
    if (!formData.tipo) {
      toast.error('Debes seleccionar un tipo de servicio');
      return;
    }
    if (!formData.paciente) {
      toast.error('Debes ingresar el nombre del paciente');
      return;
    }
    if (!formData.especie) {
      toast.error('Debes ingresar la especie del paciente');
      return;
    }
    if (!formData.fechaSolicitada) {
      toast.error('Debes seleccionar una fecha');
      return;
    }
    if (!formData.horaSolicitada) {
      toast.error('Debes seleccionar una hora');
      return;
    }
    if (!formData.tarifa || isNaN(Number(formData.tarifa)) || Number(formData.tarifa) <= 0) {
      toast.error('Debes ingresar una tarifa válida');
      return;
    }

    // Validar fecha no sea pasada
    const fechaSeleccionada = new Date(formData.fechaSolicitada);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaSeleccionada < hoy) {
      toast.error('No puedes crear una solicitud en una fecha pasada');
      return;
    }

    // Obtener nombre de clínica
    const clinicaObj = userClinicas.find(c => c.id === formData.clinica);
    if (!clinicaObj) {
      toast.error('Clínica no encontrada');
      return;
    }

    // Crear solicitud
    const nuevaSolicitud = {
      clinica: clinicaObj.nombre,
      clinicaId: String(clinicaObj.id),
      especialistaId: miEspecialista?.id as number,
      tipo: formData.tipo,
      paciente: formData.paciente,
      especie: formData.especie,
      fechaSolicitada: formData.fechaSolicitada,
      horaSolicitada: formData.horaSolicitada,
      urgencia: formData.urgencia,
      descripcion: formData.descripcion || 'Sin descripción adicional',
      direccion: formData.direccion || clinicaObj.direccion,
      tarifa: Number(formData.tarifa),
      estado: 'pendiente' as const,
      fechaSolicitud: new Date().toISOString(),
    };

    const success = await crearSolicitud(nuevaSolicitud);
    
    if (success) {
      toast.success(`Solicitud creada para ${formData.paciente}`);

      // Resetear formulario
      setFormData({
        clinica: '',
        tipo: '',
        paciente: '',
        especie: '',
        fechaSolicitada: '',
        horaSolicitada: '',
        urgencia: 'media',
        descripcion: '',
        direccion: '',
        tarifa: '',
      });

      setShowNuevaSolicitudModal(false);
    }
  };

  const handleAceptarSolicitud = async (id: number) => {
    const sol = solicitudes.find((s) => s.id === id);
    await aceptarSolicitud(id);
    toast.success(sol ? `«${sol.paciente}» agendada` : 'Solicitud aceptada', {
      description: sol ? `${sol.fechaSolicitada} ${sol.horaSolicitada} · ${sol.clinica}` : undefined,
      action: {
        label: 'Ver agenda',
        onClick: () => navegarA('agenda'),
      },
    });
  };

  const abrirRechazo = (id: number) => {
    setRechazandoId(id);
    setMotivoRechazo('');
  };

  const confirmarRechazo = () => {
    if (rechazandoId === null) return;
    rechazarSolicitud(rechazandoId, motivoRechazo);
    setRechazandoId(null);
    setMotivoRechazo('');
  };

  const [filtroUrgencia, setFiltroUrgencia] = useState<string>('todas');
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');

  const urgenciaConfig = {
    baja: { 
      label: 'Baja',
      color: '#22C55E',
      bg: darkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
      border: darkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'
    },
    media: { 
      label: 'Media',
      color: '#FACC15',
      bg: darkMode ? 'rgba(250, 204, 21, 0.15)' : 'rgba(250, 204, 21, 0.1)',
      border: darkMode ? 'rgba(250, 204, 21, 0.3)' : 'rgba(250, 204, 21, 0.2)'
    },
    alta: { 
      label: 'Alta',
      color: '#EF4444',
      bg: darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
      border: darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'
    },
    critica: { 
      label: 'Crítica',
      color: '#DC2626',
      bg: darkMode ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.15)',
      border: darkMode ? 'rgba(220, 38, 38, 0.4)' : 'rgba(220, 38, 38, 0.3)'
    }
  };

  const estadoConfig = {
    pendiente: { 
      label: 'Pendiente',
      color: '#F97316',
      bg: darkMode ? 'rgba(249, 115, 22, 0.15)' : 'rgba(249, 115, 22, 0.1)',
      border: darkMode ? 'rgba(249, 115, 22, 0.3)' : 'rgba(249, 115, 22, 0.2)'
    },
    aceptada: { 
      label: 'Aceptada',
      color: '#22C55E',
      bg: darkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
      border: darkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'
    },
    rechazada: { 
      label: 'Rechazada',
      color: darkMode ? '#6B7280' : '#9CA3AF',
      bg: darkMode ? 'rgba(107, 114, 128, 0.15)' : 'rgba(156, 163, 175, 0.1)',
      border: darkMode ? 'rgba(107, 114, 128, 0.3)' : 'rgba(156, 163, 175, 0.2)'
    },
    cancelada: { 
      label: 'Cancelada',
      color: '#EF4444',
      bg: darkMode ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
      border: darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'
    }
  };

  const solicitudesFiltradas = solicitudes.filter(s => {
    const cumpleFiltroUrgencia = filtroUrgencia === 'todas' || s.urgencia === filtroUrgencia;
    const cumpleFiltroEstado = filtroEstado === 'todas' || s.estado === filtroEstado;
    const cumpleFiltroClinica = selectedClinica === 'todas' || (() => {
      const clinica = getClinicaByNombre(s.clinica);
      return clinica?.id === selectedClinica;
    })();
    return cumpleFiltroUrgencia && cumpleFiltroEstado && cumpleFiltroClinica;
  });

  const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
  const aceptadas = solicitudes.filter(s => s.estado === 'aceptada').length;
  const urgentes = solicitudes.filter(s => s.urgencia === 'alta' && s.estado === 'pendiente').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      {/* Header mejorado - Texto dinámico según rol */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="p-2.5 rounded-xl"
              style={{ 
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)',
                border: darkMode ? '1px solid rgba(249, 115, 22, 0.2)' : '1px solid rgba(249, 115, 22, 0.15)'
              }}
            >
              <Activity className="w-6 h-6" style={{ color: '#F97316' }} />
            </div>
            <h1 
              className="text-3xl font-bold tracking-tight"
              style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
            >
              {rolActivo === 'clinica' ? 'Mis Solicitudes Enviadas' : 'Solicitudes'}
            </h1>
          </div>
          <p 
            className="text-sm ml-[52px]"
            style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
          >
            {rolActivo === 'clinica' 
              ? 'Seguimiento de servicios solicitados a especialistas'
              : 'Gestiona las peticiones recibidas de las clínicas'
            }
          </p>
        </div>

        {/* Stats rápidos */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="px-3 py-2 rounded-lg border flex items-center gap-2"
                  style={{
                    backgroundColor: estadoConfig.pendiente.bg,
                    borderColor: estadoConfig.pendiente.border
                  }}
                >
                  <Clock className="w-4 h-4" style={{ color: estadoConfig.pendiente.color }} />
                  <span className="text-sm font-semibold" style={{ color: estadoConfig.pendiente.color }}>
                    {pendientes}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Solicitudes pendientes</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="px-3 py-2 rounded-lg border flex items-center gap-2"
                  style={{
                    backgroundColor: estadoConfig.aceptada.bg,
                    borderColor: estadoConfig.aceptada.border
                  }}
                >
                  <Check className="w-4 h-4" style={{ color: estadoConfig.aceptada.color }} />
                  <span className="text-sm font-semibold" style={{ color: estadoConfig.aceptada.color }}>
                    {aceptadas}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Solicitudes aceptadas</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {urgentes > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="px-3 py-2 rounded-lg border flex items-center gap-2"
                    style={{
                      backgroundColor: urgenciaConfig.alta.bg,
                      borderColor: urgenciaConfig.alta.border
                    }}
                  >
                    <AlertCircle className="w-4 h-4" style={{ color: urgenciaConfig.alta.color }} />
                    <span className="text-sm font-semibold" style={{ color: urgenciaConfig.alta.color }}>
                      {urgentes}
                    </span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>Urgentes pendientes</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Botón Nueva Solicitud */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowNuevaSolicitudModal(true)}
          className="px-4 py-2 text-sm text-white rounded-lg transition-all shadow-lg flex items-center gap-2 font-medium"
          style={{ backgroundColor: '#F97316' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EA580C'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F97316'}
        >
          <Plus className="w-4 h-4" />
          Nueva
        </motion.button>
      </div>

      {/* Filters mejorados */}
      <div 
        className="rounded-xl border p-4"
        style={{
          backgroundColor: darkMode ? '#111827' : '#FFFFFF',
          borderColor: darkMode ? '#1F2937' : '#E2E8F0'
        }}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select 
            value={filtroUrgencia}
            onChange={(e) => setFiltroUrgencia(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none transition-all text-sm font-medium"
            style={{
              backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
              borderColor: darkMode ? '#374151' : '#E2E8F0',
              color: darkMode ? '#E5E7EB' : '#0F172A'
            }}
          >
            <option value="todas">Todas las urgencias</option>
            <option value="alta">Alta prioridad</option>
            <option value="media">Media prioridad</option>
            <option value="baja">Baja prioridad</option>
            <option value="critica">Crítica</option>
          </select>

          <select 
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none transition-all text-sm font-medium"
            style={{
              backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
              borderColor: darkMode ? '#374151' : '#E2E8F0',
              color: darkMode ? '#E5E7EB' : '#0F172A'
            }}
          >
            <option value="todas">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="aceptada">Aceptadas</option>
            <option value="rechazada">Rechazadas</option>
            <option value="cancelada">Canceladas</option>
          </select>

          <ClinicaFilter
            clinicas={userClinicas}
            selectedClinica={selectedClinica}
            onSelectClinica={setSelectedClinica}
          />
        </div>
      </div>

      {/* Solicitudes List - Completamente rediseñado */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {solicitudesFiltradas.map((solicitud) => {
            const urgencia = urgenciaConfig[solicitud.urgencia] || urgenciaConfig.media;
            const estado = estadoConfig[solicitud.estado] || estadoConfig.pendiente;
            const isExpanded = expandedId === solicitud.id;
            const isHovered = hoveredId === solicitud.id;
            const clinica = getClinicaByNombre(solicitud.clinica);

            return (
              <motion.div
                key={solicitud.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onHoverStart={() => setHoveredId(solicitud.id)}
                onHoverEnd={() => setHoveredId(null)}
                className="rounded-xl border overflow-hidden transition-all duration-200"
                style={{
                  backgroundColor: darkMode ? '#111827' : '#FFFFFF',
                  borderColor: solicitud.urgencia === 'alta' && solicitud.estado === 'pendiente'
                    ? urgenciaConfig.alta.color
                    : darkMode ? '#1F2937' : '#E2E8F0',
                  borderWidth: solicitud.urgencia === 'alta' && solicitud.estado === 'pendiente' ? '2px' : '1px',
                  boxShadow: isHovered 
                    ? darkMode 
                      ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
                      : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    : 'none'
                }}
              >
                {/* Main Content */}
                <div className="p-6">
                  {/* Header: Tipo de servicio + Estados */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {/* Tipo de servicio - FOCO PRINCIPAL */}
                      <h3 
                        className="text-xl font-bold mb-3"
                        style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
                      >
                        {solicitud.tipo}
                      </h3>

                      {/* Clínica con color identificador */}
                      <div className="flex items-center gap-2 mb-3">
                        {clinica && (
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getClinicaColor(clinica.color) }}
                          />
                        )}
                        <p 
                          className="text-sm font-medium"
                          style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                        >
                          {solicitud.clinica}
                        </p>
                      </div>

                      {/* Badges: Estado + Urgencia */}
                      <div className="flex items-center gap-2">
                        <div 
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold border"
                          style={{
                            backgroundColor: estado.bg,
                            borderColor: estado.border,
                            color: estado.color
                          }}
                        >
                          {estado.label}
                        </div>
                        <div 
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold border"
                          style={{
                            backgroundColor: urgencia.bg,
                            borderColor: urgencia.border,
                            color: urgencia.color
                          }}
                        >
                          Urgencia {urgencia.label}
                        </div>
                        {solicitud.origen?.tipo === 'integracion' && (
                          <div
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1"
                            style={{
                              backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
                              borderColor: darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
                              color: '#3B82F6'
                            }}
                            title={solicitud.origen.referenciaExterna ? `Referencia: ${solicitud.origen.referenciaExterna}` : undefined}
                          >
                            <ExternalLink className="w-3 h-3" />
                            vía {solicitud.origen.integradorNombre}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tarifa + Fecha recibida */}
                    <div className="text-right">
                      <p 
                        className="text-2xl font-bold mb-1"
                        style={{ color: '#F97316' }}
                      >
                        S/ {solicitud.tarifa.toLocaleString()}
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}
                      >
                        Recibida {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>

                  {/* Separador visual sutil */}
                  <div 
                    className="w-full h-px mb-4"
                    style={{ backgroundColor: darkMode ? '#1F2937' : '#E2E8F0' }}
                  />

                  {/* Datos del paciente - Diseño mejorado */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <User 
                        className="w-4 h-4 mt-0.5 flex-shrink-0" 
                        style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} 
                      />
                      <div className="min-w-0">
                        <p 
                          className="text-xs font-semibold uppercase tracking-wider mb-0.5"
                          style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}
                        >
                          Paciente
                        </p>
                        <p 
                          className="text-sm font-medium truncate"
                          style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}
                        >
                          {solicitud.paciente}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <FileText 
                        className="w-4 h-4 mt-0.5 flex-shrink-0" 
                        style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} 
                      />
                      <div className="min-w-0">
                        <p 
                          className="text-xs font-semibold uppercase tracking-wider mb-0.5"
                          style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}
                        >
                          Especie
                        </p>
                        <p 
                          className="text-sm font-medium truncate"
                          style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}
                        >
                          {solicitud.especie}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar 
                        className="w-4 h-4 mt-0.5 flex-shrink-0" 
                        style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} 
                      />
                      <div className="min-w-0">
                        <p 
                          className="text-xs font-semibold uppercase tracking-wider mb-0.5"
                          style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}
                        >
                          Fecha
                        </p>
                        <p 
                          className="text-sm font-medium"
                          style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}
                        >
                          {new Date(solicitud.fechaSolicitada).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock 
                        className="w-4 h-4 mt-0.5 flex-shrink-0" 
                        style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} 
                      />
                      <div className="min-w-0">
                        <p 
                          className="text-xs font-semibold uppercase tracking-wider mb-0.5"
                          style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}
                        >
                          Hora
                        </p>
                        <p 
                          className="text-sm font-medium"
                          style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}
                        >
                          {solicitud.horaSolicitada}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Section */}
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => setExpandedId(isExpanded ? null : solicitud.id)}
                    className="flex items-center text-sm font-medium transition-colors"
                    style={{ color: '#F97316' }}
                  >
                    Ver detalles
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div 
                          className="mt-4 pt-4 border-t space-y-3"
                          style={{ borderColor: darkMode ? '#1F2937' : '#E2E8F0' }}
                        >
                          <div>
                            <p 
                              className="text-xs font-semibold uppercase tracking-wider mb-2"
                              style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}
                            >
                              Descripción del caso
                            </p>
                            <p 
                              className="text-sm leading-relaxed"
                              style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                            >
                              {solicitud.descripcion}
                            </p>
                          </div>

                          {solicitud.pacienteDetalle?.propietario && (
                            <div
                              className="rounded-lg border p-3 text-sm"
                              style={{
                                borderColor: darkMode ? '#1F2937' : '#E2E8F0',
                                backgroundColor: darkMode ? 'rgba(31,41,55,0.4)' : '#F8FAFC',
                                color: darkMode ? '#E5E7EB' : '#0F172A',
                              }}
                            >
                              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                                Tutor
                              </p>
                              <p className="font-medium">{solicitud.pacienteDetalle.propietario.nombre || '—'}</p>
                              {(solicitud.pacienteDetalle.propietario.telefono || solicitud.pacienteDetalle.propietario.email) && (
                                <p className="text-xs mt-0.5" style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}>
                                  {[solicitud.pacienteDetalle.propietario.telefono, solicitud.pacienteDetalle.propietario.email].filter(Boolean).join(' · ')}
                                </p>
                              )}
                            </div>
                          )}

                          {solicitud.accesoHistoria?.url && (() => {
                            const expirado = solicitud.accesoHistoria.expiraEn
                              && new Date(solicitud.accesoHistoria.expiraEn).getTime() < Date.now();
                            return (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <a
                                  href={expirado ? undefined : solicitud.accesoHistoria!.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => {
                                    if (expirado) {
                                      e.preventDefault();
                                      toast.error('El acceso a la historia clínica expiró. Pide a la clínica que lo renueve.');
                                    }
                                  }}
                                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white"
                                  style={{
                                    backgroundColor: expirado ? '#9CA3AF' : '#2563EB',
                                    pointerEvents: expirado ? 'none' : 'auto',
                                    opacity: expirado ? 0.7 : 1,
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  {expirado ? 'Acceso a ficha expirado' : 'Ver historia clínica'}
                                </a>
                                {solicitud.accesoHistoria.expiraEn && !expirado && (
                                  <span className="text-xs" style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}>
                                    Válido hasta {new Date(solicitud.accesoHistoria.expiraEn).toLocaleString('es-PE')}
                                  </span>
                                )}
                              </div>
                            );
                          })()}

                          <div className="flex items-start gap-2">
                            <MapPin 
                              className="w-4 h-4 mt-0.5 flex-shrink-0" 
                              style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} 
                            />
                            <div>
                              <p 
                                className="text-xs font-semibold uppercase tracking-wider mb-1"
                                style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}
                              >
                                Ubicación
                              </p>
                              <p 
                                className="text-sm"
                                style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}
                              >
                                {solicitud.direccion}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Actions - Solo visible en hover para pendientes Y solo si es ESPECIALISTA */}
                {rechazandoId === solicitud.id && solicitud.estado === 'pendiente' && rolActivo === 'especialista' && (
                  <div
                    className="px-6 py-4 border-t space-y-3"
                    style={{
                      backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                      borderColor: darkMode ? '#1F2937' : '#E2E8F0'
                    }}
                  >
                    <label
                      className="text-xs font-semibold uppercase tracking-wider block"
                      style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                    >
                      Motivo del rechazo (la clínica lo verá)
                    </label>
                    <textarea
                      rows={2}
                      autoFocus
                      maxLength={500}
                      placeholder="Ej: No tengo disponibilidad ese día, propongo el jueves por la tarde"
                      value={motivoRechazo}
                      onChange={(e) => setMotivoRechazo(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none text-sm resize-none"
                      style={{
                        backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.8)' : '#FFFFFF',
                        borderColor: darkMode ? '#374151' : '#E2E8F0',
                        color: darkMode ? '#E5E7EB' : '#0F172A'
                      }}
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setRechazandoId(null)}
                        className="px-4 py-2 text-sm rounded-lg font-medium border"
                        style={{
                          backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#FFFFFF',
                          borderColor: darkMode ? '#374151' : '#E2E8F0',
                          color: darkMode ? '#E5E7EB' : '#0F172A'
                        }}
                      >
                        Volver
                      </button>
                      <button
                        type="button"
                        onClick={confirmarRechazo}
                        className="px-4 py-2 text-sm text-white rounded-lg font-medium flex items-center gap-2"
                        style={{ backgroundColor: '#EF4444' }}
                      >
                        <X className="w-4 h-4" />
                        Confirmar rechazo
                      </button>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {solicitud.estado === 'pendiente' && rolActivo === 'especialista' && rechazandoId !== solicitud.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: isHovered || isExpanded ? 'auto' : 0, 
                        opacity: isHovered || isExpanded ? 1 : 0 
                      }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden px-6 py-4 border-t flex items-center justify-end gap-3"
                      style={{
                        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                        borderColor: darkMode ? '#1F2937' : '#E2E8F0'
                      }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => abrirRechazo(solicitud.id)}
                        className="px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2 font-medium border"
                        style={{
                          backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#FFFFFF',
                          borderColor: darkMode ? '#374151' : '#E2E8F0',
                          color: darkMode ? '#E5E7EB' : '#0F172A'
                        }}
                      >
                        <X className="w-4 h-4" />
                        Rechazar
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAceptarSolicitud(solicitud.id)}
                        className="px-4 py-2 text-sm text-white rounded-lg transition-all shadow-lg flex items-center gap-2 font-medium"
                        style={{ backgroundColor: '#22C55E' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16A34A'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22C55E'}
                      >
                        <Check className="w-4 h-4" />
                        Aceptar y agendar
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Estado pendiente - Vista CLINICA */}
                {solicitud.estado === 'pendiente' && rolActivo === 'clinica' && (
                  <div 
                    className="px-6 py-3 border-t"
                    style={{
                      backgroundColor: darkMode ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.05)',
                      borderColor: darkMode ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.15)'
                    }}
                  >
                    <p 
                      className="text-sm font-medium flex items-center gap-2"
                      style={{ color: '#F97316' }}
                    >
                      <Clock className="w-4 h-4" />
                      En espera de respuesta del especialista
                    </p>
                  </div>
                )}

                {/* Estado aceptada */}
                {solicitud.estado === 'aceptada' && (
                  <div 
                    className="px-6 py-3 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    style={{
                      backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
                      borderColor: darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)'
                    }}
                  >
                    <p 
                      className="text-sm font-medium flex items-center gap-2"
                      style={{ color: '#22C55E' }}
                    >
                      <Check className="w-4 h-4" />
                      Aceptada y en tu agenda
                    </p>
                    {solicitud.accesoHistoria?.url && (
                      <a
                        href={solicitud.accesoHistoria.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver historia clínica
                      </a>
                    )}
                  </div>
                )}

                {/* Estado rechazada */}
                {solicitud.estado === 'rechazada' && (
                  <div 
                    className="px-6 py-3 border-t"
                    style={{
                      backgroundColor: darkMode ? 'rgba(107, 114, 128, 0.1)' : 'rgba(156, 163, 175, 0.05)',
                      borderColor: darkMode ? 'rgba(107, 114, 128, 0.2)' : 'rgba(156, 163, 175, 0.15)'
                    }}
                  >
                    <p 
                      className="text-sm font-medium flex items-center gap-2"
                      style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}
                    >
                      <X className="w-4 h-4" />
                      Solicitud rechazada
                    </p>
                    {solicitud.motivoRechazo && (
                      <p
                        className="text-sm mt-1 ml-6"
                        style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}
                      >
                        Motivo: {solicitud.motivoRechazo}
                      </p>
                    )}
                  </div>
                )}

                {solicitud.estado === 'cancelada' && (
                  <div 
                    className="px-6 py-3 border-t"
                    style={{
                      backgroundColor: estadoConfig.cancelada.bg,
                      borderColor: estadoConfig.cancelada.border
                    }}
                  >
                    <p 
                      className="text-sm font-medium flex items-center gap-2"
                      style={{ color: estadoConfig.cancelada.color }}
                    >
                      <X className="w-4 h-4" />
                      La clínica canceló esta solicitud
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {solicitudesFiltradas.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border p-12 text-center"
            style={{
              backgroundColor: darkMode ? '#111827' : '#FFFFFF',
              borderColor: darkMode ? '#1F2937' : '#E2E8F0'
            }}
          >
            <Activity 
              className="w-12 h-12 mx-auto mb-4 opacity-40"
              style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}
            />
            <p 
              className="text-sm font-medium"
              style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
            >
              No hay solicitudes que coincidan con los filtros aplicados
            </p>
          </motion.div>
        )}
      </div>

      {/* Modal Nueva Solicitud */}
      <AnimatePresence>
        {showNuevaSolicitudModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowNuevaSolicitudModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-xl border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: darkMode ? '#111827' : '#FFFFFF',
                borderColor: darkMode ? '#1F2937' : '#E2E8F0'
              }}
            >
              <h2 
                className="text-xl font-bold mb-6"
                style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
              >
                Nueva Solicitud de Servicio
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label 
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                    >
                      Clínica *
                    </label>
                    <select
                      value={formData.clinica}
                      onChange={(e) => handleInputChange('clinica', e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:outline-none transition-all text-sm"
                      style={{
                        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                        borderColor: darkMode ? '#374151' : '#E2E8F0',
                        color: darkMode ? '#E5E7EB' : '#0F172A'
                      }}
                    >
                      <option value="">Selecciona una clínica</option>
                      {userClinicas.map(clinica => (
                        <option key={clinica.id} value={clinica.id}>{clinica.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label 
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                    >
                      Tipo de Servicio *
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => handleInputChange('tipo', e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:outline-none transition-all text-sm"
                      style={{
                        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                        borderColor: darkMode ? '#374151' : '#E2E8F0',
                        color: darkMode ? '#E5E7EB' : '#0F172A'
                      }}
                    >
                      <option value="">Selecciona un tipo de servicio</option>
                      {configServicios.filter(s => s.activo).map((servicio) => (
                        <option key={servicio.id} value={servicio.nombre}>
                          {servicio.nombre} {servicio.metadata?.precio ? `(S/ ${servicio.metadata.precio.toLocaleString()})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label 
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                    >
                      Paciente *
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre del paciente"
                      value={formData.paciente}
                      onChange={(e) => handleInputChange('paciente', e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:outline-none transition-all text-sm"
                      style={{
                        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                        borderColor: darkMode ? '#374151' : '#E2E8F0',
                        color: darkMode ? '#E5E7EB' : '#0F172A'
                      }}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label 
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                    >
                      Especie *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Canino - Labrador"
                      value={formData.especie}
                      onChange={(e) => handleInputChange('especie', e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:outline-none transition-all text-sm"
                      style={{
                        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                        borderColor: darkMode ? '#374151' : '#E2E8F0',
                        color: darkMode ? '#E5E7EB' : '#0F172A'
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label 
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                    >
                      Fecha Solicitada *
                    </label>
                    <input
                      type="date"
                      value={formData.fechaSolicitada}
                      onChange={(e) => handleInputChange('fechaSolicitada', e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:outline-none transition-all text-sm"
                      style={{
                        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                        borderColor: darkMode ? '#374151' : '#E2E8F0',
                        color: darkMode ? '#E5E7EB' : '#0F172A'
                      }}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label 
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                    >
                      Hora Solicitada *
                    </label>
                    <input
                      type="time"
                      value={formData.horaSolicitada}
                      onChange={(e) => handleInputChange('horaSolicitada', e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:outline-none transition-all text-sm"
                      style={{
                        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                        borderColor: darkMode ? '#374151' : '#E2E8F0',
                        color: darkMode ? '#E5E7EB' : '#0F172A'
                      }}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label 
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                    >
                      Urgencia *
                    </label>
                    <select
                      value={formData.urgencia}
                      onChange={(e) => handleInputChange('urgencia', e.target.value as 'baja' | 'media' | 'alta' | 'critica')}
                      className="px-4 py-2 border rounded-lg focus:outline-none transition-all text-sm"
                      style={{
                        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                        borderColor: darkMode ? '#374151' : '#E2E8F0',
                        color: darkMode ? '#E5E7EB' : '#0F172A'
                      }}
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label 
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                  >
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detalles adicionales del caso..."
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none transition-all text-sm resize-none"
                    style={{
                      backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                      borderColor: darkMode ? '#374151' : '#E2E8F0',
                      color: darkMode ? '#E5E7EB' : '#0F172A'
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label 
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                    >
                      Dirección
                    </label>
                    <input
                      type="text"
                      placeholder="Dirección de la clínica"
                      value={formData.direccion}
                      onChange={(e) => handleInputChange('direccion', e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:outline-none transition-all text-sm"
                      style={{
                        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                        borderColor: darkMode ? '#374151' : '#E2E8F0',
                        color: darkMode ? '#E5E7EB' : '#0F172A'
                      }}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label 
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                    >
                      Tarifa *
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.tarifa}
                      onChange={(e) => handleInputChange('tarifa', e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:outline-none transition-all text-sm"
                      style={{
                        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                        borderColor: darkMode ? '#374151' : '#E2E8F0',
                        color: darkMode ? '#E5E7EB' : '#0F172A'
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowNuevaSolicitudModal(false)}
                    className="px-4 py-2 text-sm rounded-lg transition-all font-medium border"
                    style={{
                      backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#FFFFFF',
                      borderColor: darkMode ? '#374151' : '#E2E8F0',
                      color: darkMode ? '#E5E7EB' : '#0F172A'
                    }}
                  >
                    Cancelar
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleCrearSolicitud}
                    className="px-4 py-2 text-sm text-white rounded-lg transition-all shadow-lg font-medium"
                    style={{ backgroundColor: '#F97316' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EA580C'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F97316'}
                  >
                    Crear Solicitud
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}