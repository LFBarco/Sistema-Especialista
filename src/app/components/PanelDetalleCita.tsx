import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, MapPin, AlertCircle, User, Building2, FileText, Save, CheckCircle, Edit2, Trash2, RefreshCw, CheckCheck, XCircle, History } from 'lucide-react';
import { useApp } from '../App';
import { getClinicaColor } from './ClinicaFilter';
import type { Servicio } from '../App';

interface PanelDetalleCitaProps {
  cita: Servicio | null;
  onClose: () => void;
  onCambiarEstado?: (id: number, nuevoEstado: Servicio['estado']) => void;
  onEliminar?: (id: number) => void;
  onReprogramar?: (id: number, nuevaFecha: string, nuevaHora: string) => void;
  onVerPaciente?: (pacienteNombre: string) => void;
}

export function PanelDetalleCita({ cita, onClose, onCambiarEstado, onEliminar, onReprogramar, onVerPaciente }: PanelDetalleCitaProps) {
  const { darkMode, getClinicaByNombre, generarFactura, navegarA } = useApp();
  const [notas, setNotas] = useState('');
  const [guardandoNotas, setGuardandoNotas] = useState(false);
  const [notasGuardadas, setNotasGuardadas] = useState(false);
  const [mostrarMotivoCompleto, setMostrarMotivoCompleto] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarReprogramar, setMostrarReprogramar] = useState(false);
  const [nuevaFechaReprogramar, setNuevaFechaReprogramar] = useState('');
  const [nuevaHoraReprogramar, setNuevaHoraReprogramar] = useState('');
  const [generandoFactura, setGenerandoFactura] = useState(false);

  // Resetear estado al cambiar de cita
  useEffect(() => {
    if (cita) {
      setNotas(cita.notas || '');
      setNotasGuardadas(false);
      setMostrarMotivoCompleto(false);
      setMostrarHistorial(false);
      setMostrarReprogramar(false);
      setNuevaFechaReprogramar(cita.fecha);
      setNuevaHoraReprogramar(cita.hora || '');
      setGenerandoFactura(false);
    }
  }, [cita?.id]);

  // Guardado automático de notas (debounced)
  useEffect(() => {
    if (!cita) return;
    
    const timer = setTimeout(() => {
      if (notas !== cita.notas) {
        setGuardandoNotas(true);
        // Simular guardado (aquí iría la llamada API)
        setTimeout(() => {
          setGuardandoNotas(false);
          setNotasGuardadas(true);
          setTimeout(() => setNotasGuardadas(false), 2000);
        }, 500);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [notas, cita]);

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!cita) return null;

  const clinica = getClinicaByNombre(cita.clinica);

  // Configuración de estados
  const estadoConfig = {
    pendiente: {
      label: 'Pendiente',
      color: '#F59E0B',
      bg: darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
      border: darkMode ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.3)',
      icon: AlertCircle
    },
    confirmado: {
      label: 'Confirmada',
      color: '#3B82F6',
      bg: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
      border: darkMode ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)',
      icon: CheckCircle
    },
    completado: {
      label: 'Completada',
      color: '#10B981',
      bg: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
      border: darkMode ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)',
      icon: CheckCheck
    },
    facturado: {
      label: 'Facturada',
      color: '#06B6D4',
      bg: darkMode ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.1)',
      border: darkMode ? 'rgba(6, 182, 212, 0.4)' : 'rgba(6, 182, 212, 0.3)',
      icon: FileText
    },
    pagado: {
      label: 'Pagada',
      color: '#8B5CF6',
      bg: darkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
      border: darkMode ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.3)',
      icon: CheckCheck
    },
    cancelado: {
      label: 'Cancelada',
      color: '#EF4444',
      bg: darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
      border: darkMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)',
      icon: XCircle
    },
    reprogramada: {
      label: 'Reprogramada',
      color: '#F59E0B',
      bg: darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
      border: darkMode ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.3)',
      icon: RefreshCw
    }
  };

  const estadoActual = estadoConfig[cita.estado] || estadoConfig.confirmado;
  const EstadoIcon = estadoActual.icon;

  // Historial simulado
  const historialCita = [
    {
      evento: 'Cita creada',
      fecha: new Date(cita.fecha + ' 08:00'),
      usuario: 'Sistema'
    },
    {
      evento: 'Cita confirmada',
      fecha: new Date(cita.fecha + ' 09:30'),
      usuario: 'Dr. Luis Barco'
    }
  ];

  // Acciones disponibles según estado
  const getAccionesDisponibles = () => {
    const acciones = [];

    if (cita.estado === 'pendiente' || cita.estado === 'confirmado') {
      acciones.push({
        label: 'Marcar como completada',
        action: () => onCambiarEstado?.(cita.id, 'completado'),
        color: '#10B981',
        bg: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
        icon: CheckCheck
      });
    }

    // FLUJO DE FACTURACIÓN: Si está completada pero no facturada
    if (cita.estado === 'completado' && !cita.facturaId) {
       acciones.push({
        label: generandoFactura ? 'Generando...' : 'Generar Factura',
        action: async () => {
          setGenerandoFactura(true);
          await generarFactura(cita.id);
          setGenerandoFactura(false);
          // Opcional: Cerrar panel o navegar
          // onClose();
        },
        color: '#06B6D4', // Cyan
        bg: darkMode ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.1)',
        icon: FileText
      });
    }

    // Ver Factura si ya existe
    if (cita.facturaId) {
      acciones.push({
        label: `Ver Factura (${cita.facturaId})`,
        action: () => {
          navegarA('facturacion', { facturaId: cita.facturaId });
          onClose();
        },
        color: '#8B5CF6', // Purple
        bg: darkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
        icon: FileText
      });
    }

    if (cita.estado === 'confirmado') {
      acciones.push({
        label: 'Reprogramar',
        action: () => setMostrarReprogramar(true),
        color: '#F59E0B',
        bg: darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
        icon: RefreshCw,
        outlined: true
      });
    }

    if (cita.estado !== 'cancelado' && cita.estado !== 'completado') {
      acciones.push({
        label: 'Cancelar cita',
        action: () => onCambiarEstado?.(cita.id, 'cancelado'),
        color: '#EF4444',
        bg: darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
        icon: XCircle,
        outlined: true
      });
    }

    return acciones;
  };

  const acciones = getAccionesDisponibles();

  // Calcular duración legible
  const getDuracion = () => {
    const duracion = cita.duracion || 60;
    if (duracion >= 60) {
      const horas = Math.floor(duracion / 60);
      const minutos = duracion % 60;
      return minutos > 0 ? `${horas}h ${minutos}m` : `${horas}h`;
    }
    return `${duracion}m`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed right-0 top-0 h-screen w-[480px] shadow-2xl border-l overflow-hidden flex flex-col z-50"
        style={{
          backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
          borderColor: darkMode ? '#334155' : '#E2E8F0'
        }}
      >
        {/* HEADER FIJO */}
        <div 
          className="px-6 py-4 border-b flex-shrink-0"
          style={{
            backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
            borderColor: darkMode ? '#334155' : '#E2E8F0'
          }}
        >
          {/* Título + Cerrar */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-4">
              <h2 
                className="text-xl font-bold leading-tight"
                style={{ color: darkMode ? '#F8FAFC' : '#0F172A' }}
              >
                {cita.tipo}
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg transition-colors flex-shrink-0"
              style={{
                backgroundColor: darkMode ? '#334155' : '#F1F5F9',
                color: darkMode ? '#E2E8F0' : '#475569'
              }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Badge Estado */}
          <div className="mb-3">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm"
              style={{
                backgroundColor: estadoActual.bg,
                border: `2px solid ${estadoActual.border}`,
                color: estadoActual.color
              }}
            >
              <EstadoIcon className="w-4 h-4" />
              {estadoActual.label}
            </div>
          </div>

          {/* Fecha + Hora + Duración */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" style={{ color: darkMode ? '#64748B' : '#94A3B8' }} />
              <span 
                className="text-sm font-medium"
                style={{ color: darkMode ? '#E2E8F0' : '#475569' }}
              >
                {new Date(cita.fecha).toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
            {cita.hora && (
              <>
                <div 
                  className="w-px h-4"
                  style={{ backgroundColor: darkMode ? '#334155' : '#E2E8F0' }}
                />
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" style={{ color: darkMode ? '#64748B' : '#94A3B8' }} />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: darkMode ? '#E2E8F0' : '#475569' }}
                  >
                    {cita.hora} ({getDuracion()})
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CONTENIDO CON SCROLL */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* SECCIÓN: INFORMACIÓN RÁPIDA */}
            <section>
              <h3 
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: darkMode ? '#94A3B8' : '#64748B' }}
              >
                Información rápida
              </h3>
              
              <div 
                className="p-4 rounded-lg space-y-3"
                style={{
                  backgroundColor: darkMode ? '#0F172A' : '#F8FAFC',
                  border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`
                }}
              >
                {/* Clínica */}
                <div className="flex items-center justify-between">
                  <span 
                    className="text-xs font-medium"
                    style={{ color: darkMode ? '#64748B' : '#94A3B8' }}
                  >
                    Clínica
                  </span>
                  <div className="flex items-center gap-2">
                    {clinica && (
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getClinicaColor(clinica.color) }}
                      />
                    )}
                    <span 
                      className="text-sm font-semibold"
                      style={{ color: darkMode ? '#E2E8F0' : '#0F172A' }}
                    >
                      {cita.clinica}
                    </span>
                  </div>
                </div>

                {/* Modalidad */}
                <div className="flex items-center justify-between">
                  <span 
                    className="text-xs font-medium"
                    style={{ color: darkMode ? '#64748B' : '#94A3B8' }}
                  >
                    Modalidad
                  </span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} />
                    <span 
                      className="text-sm font-semibold"
                      style={{ color: darkMode ? '#E2E8F0' : '#0F172A' }}
                    >
                      {cita.direccion ? 'En clínica' : 'Domicilio'}
                    </span>
                  </div>
                </div>

                {/* Tarifa */}
                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: darkMode ? '#334155' : '#E2E8F0' }}>
                  <span 
                    className="text-xs font-medium"
                    style={{ color: darkMode ? '#64748B' : '#94A3B8' }}
                  >
                    Tarifa
                  </span>
                  <span 
                    className="text-lg font-bold"
                    style={{ color: '#3B82F6' }}
                  >
                    ${cita.tarifa}
                  </span>
                </div>
              </div>
            </section>

            {/* SECCIÓN: PACIENTE */}
            <section>
              <h3 
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: darkMode ? '#94A3B8' : '#64748B' }}
              >
                Paciente
              </h3>
              
              <div 
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: darkMode ? '#0F172A' : '#F8FAFC',
                  border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                    style={{
                      backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                      color: '#3B82F6'
                    }}
                  >
                    {cita.paciente.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p 
                      className="font-bold text-lg leading-tight"
                      style={{ color: darkMode ? '#F8FAFC' : '#0F172A' }}
                    >
                      {cita.paciente}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: darkMode ? '#94A3B8' : '#64748B' }}
                    >
                      {cita.especie}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onVerPaciente?.(cita.paciente)}
                  className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                    color: '#3B82F6',
                    border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`
                  }}
                >
                  <User className="w-4 h-4" />
                  Ver historial del paciente
                </motion.button>
              </div>
            </section>

            {/* SECCIÓN: MOTIVO CLÍNICO */}
            {cita.notas && (
              <section>
                <h3 
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: darkMode ? '#94A3B8' : '#64748B' }}
                >
                  Motivo clínico
                </h3>
                
                <div 
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: darkMode ? '#0F172A' : '#F8FAFC',
                    border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`
                  }}
                >
                  <p 
                    className={`text-sm leading-relaxed ${!mostrarMotivoCompleto ? 'line-clamp-3' : ''}`}
                    style={{ color: darkMode ? '#E2E8F0' : '#475569' }}
                  >
                    {cita.notas}
                  </p>
                  {cita.notas.length > 150 && (
                    <button
                      onClick={() => setMostrarMotivoCompleto(!mostrarMotivoCompleto)}
                      className="text-xs font-medium mt-2 transition-colors"
                      style={{ color: '#3B82F6' }}
                    >
                      {mostrarMotivoCompleto ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* SECCIÓN: ACCIONES CLÍNICAS */}
            {acciones.length > 0 && (
              <section>
                <h3 
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: darkMode ? '#94A3B8' : '#64748B' }}
                >
                  Acciones
                </h3>
                
                <div className="space-y-2">
                  {acciones.map((accion, index) => {
                    const AccionIcon = accion.icon;
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={accion.action}
                        className="w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                        style={
                          accion.outlined
                            ? {
                                backgroundColor: 'transparent',
                                color: accion.color,
                                border: `2px solid ${accion.color}`
                              }
                            : {
                                backgroundColor: accion.color,
                                color: '#FFFFFF'
                              }
                        }
                      >
                        <AccionIcon className="w-4 h-4" />
                        {accion.label}
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* SECCIÓN: NOTAS DEL ESPECIALISTA */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: darkMode ? '#94A3B8' : '#64748B' }}
                >
                  Notas del especialista
                </h3>
                <AnimatePresence>
                  {guardandoNotas && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1 text-xs"
                      style={{ color: darkMode ? '#64748B' : '#94A3B8' }}
                    >
                      <Save className="w-3 h-3 animate-pulse" />
                      Guardando...
                    </motion.div>
                  )}
                  {notasGuardadas && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1 text-xs"
                      style={{ color: '#10B981' }}
                    >
                      <CheckCircle className="w-3 h-3" />
                      Guardado
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Agregar notas sobre la consulta..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg text-sm border transition-all resize-none"
                style={{
                  backgroundColor: darkMode ? '#0F172A' : '#F8FAFC',
                  borderColor: darkMode ? '#334155' : '#E2E8F0',
                  color: darkMode ? '#E2E8F0' : '#0F172A'
                }}
              />
              
              {notas && (
                <p 
                  className="text-xs mt-2"
                  style={{ color: darkMode ? '#64748B' : '#94A3B8' }}
                >
                  Última edición: {new Date().toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              )}
            </section>

            {/* SECCIÓN: HISTORIAL */}
            <section>
              <button
                onClick={() => setMostrarHistorial(!mostrarHistorial)}
                className="flex items-center justify-between w-full mb-3"
              >
                <h3 
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: darkMode ? '#94A3B8' : '#64748B' }}
                >
                  Historial de la cita
                </h3>
                <History 
                  className={`w-4 h-4 transition-transform ${mostrarHistorial ? 'rotate-180' : ''}`}
                  style={{ color: darkMode ? '#64748B' : '#94A3B8' }}
                />
              </button>

              <AnimatePresence>
                {mostrarHistorial && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div 
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: darkMode ? '#0F172A' : '#F8FAFC',
                        border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`
                      }}
                    >
                      <div className="space-y-4">
                        {historialCita.map((evento, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: '#3B82F6' }}
                              />
                              {index < historialCita.length - 1 && (
                                <div 
                                  className="w-px flex-1 mt-1"
                                  style={{ backgroundColor: darkMode ? '#334155' : '#E2E8F0' }}
                                />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <p 
                                className="text-sm font-semibold"
                                style={{ color: darkMode ? '#E2E8F0' : '#0F172A' }}
                              >
                                {evento.evento}
                              </p>
                              <p 
                                className="text-xs mt-1"
                                style={{ color: darkMode ? '#64748B' : '#94A3B8' }}
                              >
                                {evento.fecha.toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })} • {evento.usuario}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* SECCIÓN: REPROGRAMAR */}
            <section>
              <AnimatePresence>
                {mostrarReprogramar && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div 
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: darkMode ? '#0F172A' : '#F8FAFC',
                        border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`
                      }}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4" style={{ color: darkMode ? '#64748B' : '#94A3B8' }} />
                          <input
                            type="date"
                            value={nuevaFechaReprogramar}
                            onChange={(e) => setNuevaFechaReprogramar(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg text-sm border transition-all"
                            style={{
                              backgroundColor: darkMode ? '#0F172A' : '#F8FAFC',
                              borderColor: darkMode ? '#334155' : '#E2E8F0',
                              color: darkMode ? '#E2E8F0' : '#0F172A'
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4" style={{ color: darkMode ? '#64748B' : '#94A3B8' }} />
                          <input
                            type="time"
                            value={nuevaHoraReprogramar}
                            onChange={(e) => setNuevaHoraReprogramar(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg text-sm border transition-all"
                            style={{
                              backgroundColor: darkMode ? '#0F172A' : '#F8FAFC',
                              borderColor: darkMode ? '#334155' : '#E2E8F0',
                              color: darkMode ? '#E2E8F0' : '#0F172A'
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-end">
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => {
                              onReprogramar?.(cita.id, nuevaFechaReprogramar, nuevaHoraReprogramar);
                              setMostrarReprogramar(false);
                            }}
                            className="px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                            style={{
                              backgroundColor: '#F59E0B',
                              color: '#FFFFFF'
                            }}
                          >
                            <RefreshCw className="w-4 h-4" />
                            Reprogramar
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}