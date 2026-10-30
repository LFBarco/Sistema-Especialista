import { useState } from 'react';
import { Check, X, Clock, MapPin, Calendar, User, FileText, ChevronDown, Activity, Plus, AlertCircle, Eye } from 'lucide-react';
import { useApp } from '../App';
import { toast } from 'sonner';
import { ClinicaFilter, getClinicaColor } from './ClinicaFilter';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { TimelineProgreso } from './TimelineProgreso';

type ViewMode = 'compact' | 'expanded';

export function SolicitudesV2() {
  const { solicitudes, aceptarSolicitud, rechazarSolicitud, darkMode, userClinicas, getClinicaByNombre, crearSolicitud, rolActivo, navegarA, configServicios } = useApp();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedClinica, setSelectedClinica] = useState('todas');
  const [showNuevaSolicitudModal, setShowNuevaSolicitudModal] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('expanded');
  const [filtroUrgencia, setFiltroUrgencia] = useState<string>('todas');
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');

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
    if (!formData.clinica || !formData.tipo || !formData.paciente || !formData.especie || 
        !formData.fechaSolicitada || !formData.horaSolicitada || !formData.tarifa) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const clinicaObj = userClinicas.find(c => c.id === formData.clinica);
    if (!clinicaObj) return;

    const nuevaSolicitud = {
      clinica: clinicaObj.nombre,
      clinicaId: clinicaObj.id,
      especialistaId: 1, // TODO: Obtener del contexto o selector
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

  const handleAceptarSolicitud = async (id: number, paciente: string, _fecha: string) => {
    await aceptarSolicitud(id);
    toast.success(`«${paciente}» en tu agenda`, {
      action: {
        label: 'Ver agenda',
        onClick: () => navegarA('agenda'),
      },
    });
  };

  const handleRechazarSolicitud = (id: number) => {
    rechazarSolicitud(id);
  };

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

  const enEspera = solicitudes.filter(s => s.estado === 'pendiente').length;
  const confirmadas = solicitudes.filter(s => s.estado === 'aceptada').length;
  const completadas = 12; // Simulado - debería venir del backend

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      {/* ============ HEADER REDISEÑADO ============ */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
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
            <div>
              <h1 
                className="text-3xl font-bold tracking-tight"
                style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
              >
                📥 Mis Solicitudes
              </h1>
              <p 
                className="text-sm mt-1"
                style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
              >
                Seguimiento completo de servicios solicitados a especialistas
              </p>
            </div>
          </div>

          {/* Mini resumen visual INLINE */}
          <div className="flex items-center gap-4 ml-[52px] mt-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: '#F97316' }} />
              <span className="text-sm font-semibold" style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}>
                En espera: <span style={{ color: '#F97316' }}>{enEspera}</span>
              </span>
            </div>
            <div className="w-px h-4" style={{ backgroundColor: darkMode ? '#374151' : '#E2E8F0' }} />
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" style={{ color: '#22C55E' }} />
              <span className="text-sm font-semibold" style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}>
                Confirmadas: <span style={{ color: '#22C55E' }}>{confirmadas}</span>
              </span>
            </div>
            <div className="w-px h-4" style={{ backgroundColor: darkMode ? '#374151' : '#E2E8F0' }} />
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: '#3B82F6' }} />
              <span className="text-sm font-semibold" style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}>
                Completadas: <span style={{ color: '#3B82F6' }}>{completadas}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Botón Nueva Solicitud (Solo visible para clínica) */}
        {rolActivo === 'clinica' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNuevaSolicitudModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 text-white"
            style={{ 
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' 
            }}
          >
            <Plus className="w-5 h-5" />
            Nueva Solicitud
          </motion.button>
        )}
      </div>

      {/* ============ FILTROS ============ */}
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
          </select>

          <ClinicaFilter
            clinicas={userClinicas}
            selectedClinica={selectedClinica}
            onSelectClinica={setSelectedClinica}
          />
        </div>
      </div>

      {/* ============ CARDS DE SOLICITUDES - REDISEÑO ULTRA PRO ============ */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {solicitudesFiltradas.map((solicitud) => {
            const urgencia = urgenciaConfig[solicitud.urgencia] || urgenciaConfig.media;
            const estado = estadoConfig[solicitud.estado] || estadoConfig.pendiente;
            const isExpanded = expandedId === solicitud.id;
            const isHovered = hoveredId === solicitud.id;
            const clinica = getClinicaByNombre(solicitud.clinica);

            // Estado narrativo
            let estadoNarrativo = '';
            if (solicitud.estado === 'pendiente') estadoNarrativo = '🕒 Esperando confirmación del especialista';
            if (solicitud.estado === 'aceptada') estadoNarrativo = '✅ Servicio confirmado y agendado';
            if (solicitud.estado === 'rechazada') estadoNarrativo = '❌ Especialista no disponible';

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
                  borderColor: darkMode ? '#1F2937' : '#E2E8F0',
                  boxShadow: isHovered 
                    ? darkMode 
                      ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
                      : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    : 'none'
                }}
              >
                {/* ============ ZONA 1: IDENTIDAD ============ */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 space-y-3">
                      {/* Badge grande tipo de servicio */}
                      <div className="inline-flex items-center px-4 py-2.5 rounded-xl border-2 shadow-sm" style={{
                        backgroundColor: darkMode ? 'rgba(249, 115, 22, 0.15)' : 'rgba(249, 115, 22, 0.08)',
                        borderColor: '#F97316'
                      }}>
                        <FileText className="w-5 h-5 mr-2.5" style={{ color: '#F97316' }} />
                        <span className="font-bold text-lg" style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}>
                          {solicitud.tipo}
                        </span>
                      </div>

                      {/* Badge urgencia */}
                      <div className="flex items-center gap-2">
                        <div 
                          className="px-3 py-1.5 rounded-lg text-sm font-bold border-2 inline-flex items-center gap-2"
                          style={{
                            backgroundColor: urgencia.bg,
                            borderColor: urgencia.color,
                            color: urgencia.color
                          }}
                        >
                          <AlertCircle className="w-4 h-4" />
                          Urgencia {urgencia.label}
                        </div>
                      </div>

                      {/* ESTADO NARRATIVO - EL CAMBIO CLAVE */}
                      <div 
                        className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 shadow-sm"
                        style={{
                          backgroundColor: estado.bg,
                          borderColor: estado.border
                        }}
                      >
                        {solicitud.estado === 'pendiente' && <Clock className="w-5 h-5" style={{ color: estado.color }} />}
                        {solicitud.estado === 'aceptada' && <Check className="w-5 h-5" style={{ color: estado.color }} />}
                        {solicitud.estado === 'rechazada' && <X className="w-5 h-5" style={{ color: estado.color }} />}
                        <span className="font-bold text-sm" style={{ color: estado.color }}>
                          {estadoNarrativo}
                        </span>
                      </div>
                    </div>

                    {/* Tarifa */}
                    <div className="text-right ml-6">
                      <p 
                        className="text-4xl font-black mb-1"
                        style={{ color: '#F97316' }}
                      >
                        S/ {solicitud.tarifa.toLocaleString()}
                      </p>
                      <p 
                        className="text-xs font-medium"
                        style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}
                      >
                        {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Separador */}
                <div 
                  className="w-full h-px"
                  style={{ backgroundColor: darkMode ? '#1F2937' : '#E2E8F0' }}
                />

                {/* ============ ZONA 2: CONTENIDO CLÍNICO ============ */}
                <div className="px-6 py-5">
                  {/* Clínica con color identificador */}
                  <div className="flex items-center gap-2 mb-4">
                    {clinica && (
                      <div 
                        className="w-3 h-3 rounded-full ring-2 ring-offset-2"
                        style={{ 
                          backgroundColor: getClinicaColor(clinica.color),
                          ringColor: getClinicaColor(clinica.color),
                          ringOffsetColor: darkMode ? '#111827' : '#FFFFFF'
                        }}
                      />
                    )}
                    <p 
                      className="text-sm font-bold"
                      style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                    >
                      {solicitud.clinica}
                    </p>
                  </div>

                  {/* Grid de información clínica */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* PACIENTE (destacado) */}
                    <div className="col-span-2 sm:col-span-1">
                      <div className="flex items-start gap-3">
                        <div 
                          className="p-2.5 rounded-xl"
                          style={{
                            backgroundColor: darkMode ? 'rgba(249, 115, 22, 0.15)' : 'rgba(249, 115, 22, 0.08)',
                            border: `1px solid ${darkMode ? 'rgba(249, 115, 22, 0.3)' : 'rgba(249, 115, 22, 0.2)'}`
                          }}
                        >
                          <User className="w-5 h-5" style={{ color: '#F97316' }} />
                        </div>
                        <div className="flex-1">
                          <p 
                            className="text-xs font-bold uppercase tracking-wider mb-1"
                            style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}
                          >
                            Paciente
                          </p>
                          <p 
                            className="text-lg font-black"
                            style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
                          >
                            {solicitud.paciente}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-start gap-2">
                        <FileText 
                          className="w-4 h-4 mt-1" 
                          style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} 
                        />
                        <div>
                          <p 
                            className="text-xs font-bold uppercase tracking-wider mb-0.5"
                            style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}
                          >
                            Especie
                          </p>
                          <p 
                            className="text-sm font-semibold"
                            style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}
                          >
                            {solicitud.especie}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-start gap-2">
                        <Calendar 
                          className="w-4 h-4 mt-1" 
                          style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} 
                        />
                        <div>
                          <p 
                            className="text-xs font-bold uppercase tracking-wider mb-0.5"
                            style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}
                          >
                            Fecha
                          </p>
                          <p 
                            className="text-sm font-semibold"
                            style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}
                          >
                            {new Date(solicitud.fechaSolicitada).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-start gap-2">
                        <Clock 
                          className="w-4 h-4 mt-1" 
                          style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} 
                        />
                        <div>
                          <p 
                            className="text-xs font-bold uppercase tracking-wider mb-0.5"
                            style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}
                          >
                            Hora
                          </p>
                          <p 
                            className="text-sm font-semibold"
                            style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}
                          >
                            {solicitud.horaSolicitada}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandir detalles */}
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => setExpandedId(isExpanded ? null : solicitud.id)}
                    className="flex items-center text-sm font-bold transition-colors mt-4"
                    style={{ color: '#F97316' }}
                  >
                    Ver más detalles
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
                              className="text-xs font-bold uppercase tracking-wider mb-2"
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
                          <div className="flex items-start gap-2">
                            <MapPin 
                              className="w-4 h-4 mt-0.5" 
                              style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} 
                            />
                            <div>
                              <p 
                                className="text-xs font-bold uppercase tracking-wider mb-1"
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

                {/* ============ ZONA 3: TIMELINE VISUAL - SOLO CLÍNICA ============ */}
                {rolActivo === 'clinica' && (
                  <>
                    <div 
                      className="w-full h-px"
                      style={{ backgroundColor: darkMode ? '#1F2937' : '#E2E8F0' }}
                    />
                    <div className="px-6 pb-4 pt-2">
                      <TimelineProgreso 
                        estado={solicitud.estado} 
                        darkMode={darkMode}
                        servicioRealizado={false}
                        facturaEmitida={false}
                      />
                    </div>

                    {/* Acciones contextuales */}
                    <div 
                      className="px-6 py-3 border-t flex items-center justify-end gap-3"
                      style={{
                        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.3)' : '#F8FAFC',
                        borderColor: darkMode ? '#1F2937' : '#E2E8F0'
                      }}
                    >
                      {solicitud.estado === 'pendiente' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setExpandedId(solicitud.id)}
                          className="px-4 py-2.5 text-sm rounded-lg transition-all flex items-center gap-2 font-bold border-2"
                          style={{
                            backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#FFFFFF',
                            borderColor: darkMode ? '#374151' : '#E2E8F0',
                            color: darkMode ? '#E5E7EB' : '#0F172A'
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          Ver detalle
                        </motion.button>
                      )}
                      {solicitud.estado === 'aceptada' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navegarA('agenda')}
                          className="px-4 py-2.5 text-sm rounded-lg transition-all flex items-center gap-2 font-bold border-2 shadow-sm"
                          style={{
                            backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.08)',
                            borderColor: '#22C55E',
                            color: '#22C55E'
                          }}
                        >
                          <Calendar className="w-4 h-4" />
                          Ver en agenda
                        </motion.button>
                      )}
                    </div>
                  </>
                )}

                {/* ============ VISTA ESPECIALISTA ============ */}
                {rolActivo === 'especialista' && solicitud.estado === 'pendiente' && (
                  <div 
                    className="px-6 py-4 border-t flex items-center justify-end gap-3"
                    style={{
                      backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.3)' : '#F8FAFC',
                      borderColor: darkMode ? '#1F2937' : '#E2E8F0'
                    }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRechazarSolicitud(solicitud.id)}
                      className="px-5 py-2.5 text-sm rounded-lg flex items-center gap-2 font-bold border-2"
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
                      onClick={() => handleAceptarSolicitud(solicitud.id, solicitud.paciente, solicitud.fechaSolicitada)}
                      className="px-5 py-2.5 text-sm text-white rounded-lg shadow-lg flex items-center gap-2 font-bold"
                      style={{ backgroundColor: '#22C55E' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16A34A'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22C55E'}
                    >
                      <Check className="w-4 h-4" />
                      Aceptar y agendar
                    </motion.button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {/* ============ MODAL NUEVA SOLICITUD ============ */}
      <AnimatePresence>
        {showNuevaSolicitudModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl`}
            >
              <div className={`p-6 border-b ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-gray-50'} flex justify-between items-center`}>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                  <Plus className="w-6 h-6 text-orange-500" />
                  Nueva Solicitud de Servicio
                </h2>
                <button
                  onClick={() => setShowNuevaSolicitudModal(false)}
                  className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Clínica (Selector) */}
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Clínica Solicitante
                    </label>
                    <select
                      value={formData.clinica}
                      onChange={(e) => handleInputChange('clinica', e.target.value)}
                      className={`w-full p-2.5 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="">Seleccione una clínica</option>
                      {userClinicas.map(clinica => (
                        <option key={clinica.id} value={clinica.id}>{clinica.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Paciente */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nombre del Paciente
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.paciente}
                        onChange={(e) => handleInputChange('paciente', e.target.value)}
                        className={`w-full pl-10 p-2.5 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        placeholder="Nombre de la mascota"
                      />
                    </div>
                  </div>

                  {/* Especie */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Especie
                    </label>
                    <select
                      value={formData.especie}
                      onChange={(e) => handleInputChange('especie', e.target.value)}
                      className={`w-full p-2.5 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="">Seleccione especie</option>
                      <option value="Canino">Canino</option>
                      <option value="Felino">Felino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  {/* Tipo de Servicio - AHORA DINÁMICO */}
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tipo de Servicio
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => handleInputChange('tipo', e.target.value)}
                      className={`w-full p-2.5 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="">Seleccione un servicio</option>
                      {configServicios.filter(s => s.activo).map((servicio) => (
                        <option key={servicio.id} value={servicio.nombre}>
                          {servicio.nombre} {servicio.metadata?.precio ? `(S/ ${servicio.metadata.precio.toLocaleString()})` : ''}
                        </option>
                      ))}
                    </select>
                    {formData.tipo && (
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {configServicios.find(s => s.nombre === formData.tipo)?.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Fecha y Hora */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fecha Solicitada
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.fechaSolicitada}
                        onChange={(e) => handleInputChange('fechaSolicitada', e.target.value)}
                        className={`w-full pl-10 p-2.5 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Hora Preferida
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                      <input
                        type="time"
                        value={formData.horaSolicitada}
                        onChange={(e) => handleInputChange('horaSolicitada', e.target.value)}
                        className={`w-full pl-10 p-2.5 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    </div>
                  </div>

                  {/* Tarifa (Automática pero editable) */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tarifa Estimada ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400 font-bold">S/</span>
                      <input
                        type="number"
                        value={formData.tarifa}
                        onChange={(e) => handleInputChange('tarifa', e.target.value)}
                        className={`w-full pl-8 p-2.5 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        placeholder="0.00"
                      />
                    </div>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      * Precio sugerido según configuración
                    </p>
                  </div>

                  {/* Urgencia */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nivel de Urgencia
                    </label>
                    <select
                      value={formData.urgencia}
                      onChange={(e) => handleInputChange('urgencia', e.target.value)}
                      className={`w-full p-2.5 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="baja">Baja (Rutinaria)</option>
                      <option value="media">Media (Próximos días)</option>
                      <option value="alta">Alta (Prioritaria)</option>
                      <option value="critica">Crítica (Inmediata)</option>
                    </select>
                  </div>

                  {/* Descripción */}
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Motivo de consulta / Detalles clínicos
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      rows={3}
                      className={`w-full p-2.5 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      placeholder="Describa brevemente el caso clínico..."
                    />
                  </div>
                </div>
              </div>

              <div className={`p-6 border-t ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-gray-50'} flex justify-end gap-3`}>
                <button
                  onClick={() => setShowNuevaSolicitudModal(false)}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearSolicitud}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-bold shadow-lg shadow-orange-500/20 transition-all transform active:scale-95"
                >
                  Enviar Solicitud
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}