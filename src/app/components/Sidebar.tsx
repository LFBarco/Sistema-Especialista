import { LayoutDashboard, Calendar, Inbox, FileText, Activity, Building2, Users, User, Settings, Stethoscope, DollarSign, Heart, Code, Database, UserPlus, Award, ShieldCheck, Network, BarChart3, CreditCard, MessageSquare, MapPin, Smartphone } from 'lucide-react';
import { useApp } from '../App';
import { motion } from 'motion/react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

// Menú para Especialista (vista completa)
const menuItemsEspecialista = [
  { id: 'mobile-specialist', label: 'Modo App Móvil', icon: Smartphone, special: true },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'mensajes', label: 'Mensajes', icon: MessageSquare },
  { id: 'solicitudes', label: 'Solicitudes', icon: Inbox },
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'servicios', label: 'Servicios', icon: Stethoscope },
  { id: 'pacientes', label: 'Pacientes', icon: Heart },
  { id: 'interconsultas', label: 'Interconsultas', icon: Network },
  { id: 'facturacion', label: 'Facturación Electrónica', icon: FileText, description: 'Emitir facturas electrónicas o pre-facturas' },
  { id: 'conciliacion', label: 'Conciliación', icon: DollarSign },
  { id: 'estado-cuenta', label: 'Estado de Cuenta', icon: CreditCard },
  { id: 'finanzas', label: 'Finanzas', icon: Activity },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  { id: 'clinicas', label: 'Clínicas', icon: Building2 },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'configuraciones', label: 'Configuraciones', icon: Settings },
  { id: 'perfil-profesional', label: 'Perfil Profesional', icon: Award },
  { id: 'verificacion-profesional', label: 'Verificación', icon: ShieldCheck },
];

// Menú para Clínica (vista simplificada)
const menuItemsClinica = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'agenda', label: 'Disponibilidad del Dr.', icon: Calendar, description: 'Ver horarios disponibles' },
  { id: 'solicitudes', label: 'Mis Solicitudes', icon: Inbox, description: 'Solicitudes de servicio' },
  { id: 'mensajes', label: 'Mensajes', icon: MessageSquare },
  { id: 'especialistas', label: 'Especialistas Afiliados', icon: Award, description: 'Marketplace de especialistas' },
  { id: 'metricas', label: 'Métricas', icon: BarChart3, description: 'Analíticas y estadísticas' },
  { id: 'estado-cuenta', label: 'Estado de Cuenta', icon: CreditCard, description: 'Gestión de pagos y facturas' },
  { id: 'sedes', label: 'Gestión de Sedes', icon: MapPin, description: 'Administrar ubicaciones' },
  { id: 'perfil', label: 'Mi Perfil', icon: User },
];

export function Sidebar({ activeModule, setActiveModule }: SidebarProps) {
  const { solicitudes, darkMode, userClinicas, accesosClinic, rolActivo, notificaciones } = useApp();
  
  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
  const interconsultasPendientes = accesosClinic.filter(a => a.estado === 'pendiente').length;
  const mensajesNoLeidos = notificaciones.filter(n => !n.leida && n.tipo === 'mensaje').length;
  const clinicasActivas = userClinicas?.length || 0;

  // Seleccionar el menú según el rol activo
  const menuItems = rolActivo === 'clinica' ? menuItemsClinica : menuItemsEspecialista;

  return (
    <aside
      className="hidden lg:flex flex-col w-64 border-r transition-colors duration-200"
      style={{
        backgroundColor: darkMode ? '#111827' : '#FFFFFF',
        borderColor: darkMode ? '#1F2937' : '#E2E8F0'
      }}
    >
      <div className="flex flex-col h-full">
        {/* Logo mejorado */}
        <div 
          className="h-16 flex items-center px-6 border-b"
          style={{ borderColor: darkMode ? '#1F2937' : '#E2E8F0' }}
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
            className="p-2 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              boxShadow: '0 4px 12px -2px rgba(249, 115, 22, 0.4)'
            }}
          >
            <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
          </motion.div>
          <span 
            className="ml-3 text-xl font-bold tracking-tight"
            style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
          >
            VetSpecialist
          </span>
        </div>

        {/* Navigation mejorada */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            // @ts-ignore
            const isSpecial = item.special;
            const badge = item.id === 'solicitudes' ? solicitudesPendientes : item.id === 'interconsultas' ? interconsultasPendientes : item.id === 'mensajes' ? mensajesNoLeidos : 0;

            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                whileHover={{ x: isActive ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className={`relative w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-150 group ${isSpecial ? 'mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20' : ''}`}
                style={isSpecial ? {} : {
                  backgroundColor: isActive 
                    ? darkMode
                      ? 'rgba(249, 115, 22, 0.15)'
                      : 'rgba(249, 115, 22, 0.1)'
                    : 'transparent',
                  color: isActive 
                    ? '#F97316'
                    : darkMode ? '#9CA3AF' : '#64748B'
                }}
              >
                {/* Active indicator bar */}
                {isActive && !isSpecial && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                    style={{ backgroundColor: '#F97316' }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <div 
                  className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150 ${isSpecial ? 'bg-white/20' : ''}`}
                  style={isSpecial ? {} : {
                    backgroundColor: isActive 
                      ? darkMode ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.15)'
                      : 'transparent'
                  }}
                >
                  <Icon 
                    className={`w-5 h-5 transition-colors ${isSpecial ? 'text-white' : ''}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>

                {/* Label */}
                <span 
                  className={`ml-3 flex-1 text-left text-sm font-medium transition-colors ${isSpecial ? 'text-white font-bold' : ''}`}
                  style={isSpecial ? {} : {
                    color: isActive 
                      ? '#F97316'
                      : darkMode ? '#E5E7EB' : '#0F172A'
                  }}
                >
                  {item.label}
                </span>

                {/* Badge */}
                {badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: '#EF4444' }}
                  >
                    {badge > 9 ? '9+' : badge}
                  </motion.span>
                )}

                {/* Hover effect */}
                {!isActive && (
                  <div 
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={{
                      backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(248, 250, 252, 0.8)'
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer removido - ya no se muestra información del usuario */}
      </div>
    </aside>
  );
}