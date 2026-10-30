import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Check, CheckCheck, Calendar, User, Building2, CreditCard, AlertCircle, Clock, FileText, Filter, Trash2, MoreVertical } from 'lucide-react';
import { useApp } from '../App';

export type NotificacionPrioridad = 'critica' | 'importante' | 'informativa';
export type NotificacionTipo = 'solicitud' | 'cita' | 'paciente' | 'facturacion' | 'sistema' | 'urgencia' | 'interconsulta' | 'mensaje';

export interface Notificacion {
  id: number;
  tipo: NotificacionTipo;
  prioridad: NotificacionPrioridad;
  titulo: string;
  descripcion: string;
  timestamp: Date;
  leida: boolean;
  accionUrl?: string;
  metadata?: any;
}

interface NotificacionesMedicasProps {
  notificaciones: Notificacion[];
  onMarcarLeida: (id: number) => void;
  onMarcarTodasLeidas: () => void;
  onEliminar: (id: number) => void;
  onNavegar?: (url: string) => void;
}

export function NotificacionesMedicas({
  notificaciones,
  onMarcarLeida,
  onMarcarTodasLeidas,
  onEliminar,
  onNavegar
}: NotificacionesMedicasProps) {
  const { darkMode } = useApp();
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<NotificacionTipo | 'todas'>('todas');
  const [filtroPrioridad, setFiltroPrioridad] = useState<NotificacionPrioridad | 'todas'>('todas');
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Click outside para cerrar panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setMostrarPanel(false);
      }
    };

    if (mostrarPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarPanel]);

  // Configuración de prioridades
  const prioridadConfig = {
    critica: {
      label: 'Crítica',
      color: '#EF4444',
      bg: darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
      border: darkMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)'
    },
    importante: {
      label: 'Importante',
      color: '#F59E0B',
      bg: darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
      border: darkMode ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.3)'
    },
    informativa: {
      label: 'Informativa',
      color: '#10B981',
      bg: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
      border: darkMode ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'
    }
  };

  // Iconos por tipo
  const getIconoTipo = (tipo: NotificacionTipo) => {
    const iconClass = "w-5 h-5";
    switch (tipo) {
      case 'solicitud':
        return <FileText className={iconClass} />;
      case 'cita':
        return <Calendar className={iconClass} />;
      case 'paciente':
        return <User className={iconClass} />;
      case 'facturacion':
        return <CreditCard className={iconClass} />;
      case 'urgencia':
        return <AlertCircle className={iconClass} />;
      case 'sistema':
        return <Bell className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  // Calcular tiempo relativo
  const getTiempoRelativo = (fecha: Date) => {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Justo ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Filtrar notificaciones
  const notificacionesFiltradas = notificaciones.filter(n => {
    const cumpleTipo = filtroTipo === 'todas' || n.tipo === filtroTipo;
    const cumplePrioridad = filtroPrioridad === 'todas' || n.prioridad === filtroPrioridad;
    return cumpleTipo && cumplePrioridad;
  });

  // Agrupar por fecha
  const agruparPorFecha = (notifs: Notificacion[]) => {
    const grupos: { [key: string]: Notificacion[] } = {
      'Hoy': [],
      'Ayer': [],
      'Esta semana': [],
      'Anteriores': []
    };

    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    const semanaAtras = new Date(hoy);
    semanaAtras.setDate(semanaAtras.getDate() - 7);

    notifs.forEach(n => {
      const fechaNotif = new Date(n.timestamp);
      const fechaNotifSinHora = new Date(fechaNotif.getFullYear(), fechaNotif.getMonth(), fechaNotif.getDate());

      if (fechaNotifSinHora.getTime() === hoy.getTime()) {
        grupos['Hoy'].push(n);
      } else if (fechaNotifSinHora.getTime() === ayer.getTime()) {
        grupos['Ayer'].push(n);
      } else if (fechaNotif > semanaAtras) {
        grupos['Esta semana'].push(n);
      } else {
        grupos['Anteriores'].push(n);
      }
    });

    return grupos;
  };

  const notificacionesAgrupadas = agruparPorFecha(notificacionesFiltradas);

  // Contar no leídas
  const noLeidas = notificaciones.filter(n => !n.leida).length;

  // Manejar click en notificación
  const handleClickNotificacion = (notif: Notificacion) => {
    if (!notif.leida) {
      onMarcarLeida(notif.id);
    }
    if (notif.accionUrl && onNavegar) {
      onNavegar(notif.accionUrl);
      setMostrarPanel(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Icon con Badge */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMostrarPanel(!mostrarPanel)}
        className="relative p-2 rounded-lg transition-colors"
        style={{
          backgroundColor: mostrarPanel 
            ? darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'
            : darkMode ? 'rgba(30, 41, 55, 0.5)' : 'rgba(241, 245, 249, 0.5)',
          color: darkMode ? '#E2E8F0' : '#475569'
        }}
      >
        <Bell className="w-5 h-5" />
        
        {/* Badge de notificaciones no leídas */}
        <AnimatePresence>
          {noLeidas > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: '#EF4444' }}
            >
              {noLeidas > 9 ? '9+' : noLeidas}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel de Notificaciones */}
      <AnimatePresence>
        {mostrarPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-[420px] max-h-[600px] rounded-xl shadow-2xl border overflow-hidden z-50"
            style={{
              backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
              borderColor: darkMode ? '#334155' : '#E2E8F0'
            }}
          >
            {/* Header del Panel */}
            <div 
              className="px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10"
              style={{
                backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
                borderColor: darkMode ? '#334155' : '#E2E8F0'
              }}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" style={{ color: '#3B82F6' }} />
                <h3 
                  className="font-semibold text-lg"
                  style={{ color: darkMode ? '#F8FAFC' : '#0F172A' }}
                >
                  Notificaciones
                </h3>
                {noLeidas > 0 && (
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                      color: '#EF4444'
                    }}
                  >
                    {noLeidas} nuevas
                  </span>
                )}
              </div>

              {noLeidas > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onMarcarTodasLeidas}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  style={{
                    backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                    color: '#3B82F6'
                  }}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar todas
                </motion.button>
              )}
            </div>

            {/* Filtros */}
            <div 
              className="px-4 py-3 border-b flex items-center gap-2"
              style={{
                backgroundColor: darkMode ? '#0F172A' : '#F8FAFC',
                borderColor: darkMode ? '#334155' : '#E2E8F0'
              }}
            >
              <Filter className="w-4 h-4" style={{ color: darkMode ? '#64748B' : '#94A3B8' }} />
              
              {/* Filtro por prioridad */}
              <select
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value as any)}
                className="px-2 py-1 text-xs rounded border transition-all"
                style={{
                  backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
                  borderColor: darkMode ? '#334155' : '#E2E8F0',
                  color: darkMode ? '#E2E8F0' : '#0F172A'
                }}
              >
                <option value="todas">Todas</option>
                <option value="critica">Críticas</option>
                <option value="importante">Importantes</option>
                <option value="informativa">Informativas</option>
              </select>

              {/* Filtro por tipo */}
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as any)}
                className="px-2 py-1 text-xs rounded border transition-all"
                style={{
                  backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
                  borderColor: darkMode ? '#334155' : '#E2E8F0',
                  color: darkMode ? '#E2E8F0' : '#0F172A'
                }}
              >
                <option value="todas">Todos</option>
                <option value="urgencia">Urgencias</option>
                <option value="solicitud">Solicitudes</option>
                <option value="cita">Citas</option>
                <option value="paciente">Pacientes</option>
                <option value="facturacion">Facturación</option>
              </select>
            </div>

            {/* Lista de Notificaciones */}
            <div className="overflow-y-auto max-h-[450px]">
              {notificacionesFiltradas.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <Bell 
                    className="w-12 h-12 mx-auto mb-3"
                    style={{ color: darkMode ? '#334155' : '#CBD5E1' }}
                  />
                  <p 
                    className="text-sm"
                    style={{ color: darkMode ? '#64748B' : '#94A3B8' }}
                  >
                    No hay notificaciones
                  </p>
                </div>
              ) : (
                Object.entries(notificacionesAgrupadas).map(([grupo, notifs]) => {
                  if (notifs.length === 0) return null;

                  return (
                    <div key={grupo}>
                      {/* Encabezado de grupo */}
                      <div 
                        className="px-4 py-2 sticky top-0 z-10"
                        style={{
                          backgroundColor: darkMode ? '#0F172A' : '#F8FAFC'
                        }}
                      >
                        <p 
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: darkMode ? '#64748B' : '#94A3B8' }}
                        >
                          {grupo}
                        </p>
                      </div>

                      {/* Notificaciones del grupo */}
                      <div>
                        {notifs.map((notif) => {
                          const prioridad = prioridadConfig[notif.prioridad];
                          const isHovered = hoveredId === notif.id;

                          return (
                            <motion.div
                              key={notif.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              whileHover={{ x: 4 }}
                              onHoverStart={() => setHoveredId(notif.id)}
                              onHoverEnd={() => setHoveredId(null)}
                              onClick={() => handleClickNotificacion(notif)}
                              className="px-4 py-3 border-b cursor-pointer transition-all"
                              style={{
                                backgroundColor: notif.leida 
                                  ? (darkMode ? '#1E293B' : '#FFFFFF')
                                  : (darkMode ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.03)'),
                                borderColor: darkMode ? '#334155' : '#E2E8F0',
                                borderLeftWidth: '3px',
                                borderLeftColor: prioridad.color
                              }}
                            >
                              <div className="flex items-start gap-3">
                                {/* Icono */}
                                <div 
                                  className="p-2 rounded-lg flex-shrink-0"
                                  style={{
                                    backgroundColor: prioridad.bg,
                                    color: prioridad.color
                                  }}
                                >
                                  {getIconoTipo(notif.tipo)}
                                </div>

                                {/* Contenido */}
                                <div className="flex-1 min-w-0">
                                  {/* Título + Badge prioridad */}
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 
                                      className="font-semibold text-sm"
                                      style={{ 
                                        color: darkMode ? '#F8FAFC' : '#0F172A',
                                        fontWeight: notif.leida ? 500 : 600
                                      }}
                                    >
                                      {notif.titulo}
                                    </h4>
                                    
                                    {notif.prioridad !== 'informativa' && (
                                      <span 
                                        className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                                        style={{
                                          backgroundColor: prioridad.bg,
                                          color: prioridad.color,
                                          border: `1px solid ${prioridad.border}`
                                        }}
                                      >
                                        {prioridad.label}
                                      </span>
                                    )}
                                  </div>

                                  {/* Descripción */}
                                  <p 
                                    className="text-xs mb-2 line-clamp-2"
                                    style={{ color: darkMode ? '#94A3B8' : '#64748B' }}
                                  >
                                    {notif.descripcion}
                                  </p>

                                  {/* Footer: tiempo + acciones */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" style={{ color: darkMode ? '#64748B' : '#94A3B8' }} />
                                      <span 
                                        className="text-xs"
                                        style={{ color: darkMode ? '#64748B' : '#94A3B8' }}
                                      >
                                        {getTiempoRelativo(notif.timestamp)}
                                      </span>
                                    </div>

                                    {/* Acciones rápidas en hover */}
                                    <AnimatePresence>
                                      {isHovered && (
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.8 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.8 }}
                                          transition={{ duration: 0.15 }}
                                          className="flex items-center gap-1"
                                        >
                                          {!notif.leida && (
                                            <motion.button
                                              whileHover={{ scale: 1.1 }}
                                              whileTap={{ scale: 0.9 }}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onMarcarLeida(notif.id);
                                              }}
                                              className="p-1 rounded transition-colors"
                                              style={{
                                                backgroundColor: darkMode ? '#334155' : '#F1F5F9',
                                                color: '#10B981'
                                              }}
                                              title="Marcar como leída"
                                            >
                                              <Check className="w-3 h-3" />
                                            </motion.button>
                                          )}

                                          <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onEliminar(notif.id);
                                            }}
                                            className="p-1 rounded transition-colors"
                                            style={{
                                              backgroundColor: darkMode ? '#334155' : '#F1F5F9',
                                              color: '#EF4444'
                                            }}
                                            title="Eliminar"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </motion.button>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>

                                {/* Indicador no leída */}
                                {!notif.leida && (
                                  <div 
                                    className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                                    style={{ backgroundColor: '#3B82F6' }}
                                  />
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
