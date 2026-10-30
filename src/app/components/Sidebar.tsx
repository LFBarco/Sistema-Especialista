import { LayoutDashboard, Calendar, Inbox, FileText, Activity, Building2, Settings, Stethoscope, DollarSign, Award, ShieldCheck, BarChart3, MessageSquare, Smartphone, RefreshCw } from 'lucide-react';
import { useApp } from '../App';
import { motion } from 'motion/react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

/** Menú del portal del especialista. La clínica opera en Veterinari. */
const menuItemsEspecialista = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard, grupo: 'principal' },
  { id: 'solicitudes', label: 'Solicitudes', icon: Inbox, grupo: 'principal' },
  { id: 'agenda', label: 'Agenda', icon: Calendar, grupo: 'principal' },
  { id: 'google-calendar', label: 'Google Calendar', icon: RefreshCw, grupo: 'principal' },
  { id: 'servicios', label: 'Servicios', icon: Stethoscope, grupo: 'principal' },
  { id: 'facturacion', label: 'Honorarios', icon: FileText, grupo: 'finanzas', description: 'Pre-facturas y recibos para clínicas' },
  { id: 'conciliacion', label: 'Conciliación', icon: DollarSign, grupo: 'finanzas' },
  { id: 'finanzas', label: 'Finanzas', icon: Activity, grupo: 'finanzas' },
  { id: 'reportes', label: 'Reportes', icon: BarChart3, grupo: 'finanzas' },
  { id: 'clinicas', label: 'Clínicas', icon: Building2, grupo: 'red', description: 'Afiliaciones con clínicas conectadas' },
  { id: 'mensajes', label: 'Mensajes', icon: MessageSquare, grupo: 'red' },
  { id: 'perfil-profesional', label: 'Perfil profesional', icon: Award, grupo: 'cuenta' },
  { id: 'verificacion-profesional', label: 'Verificación', icon: ShieldCheck, grupo: 'cuenta' },
  { id: 'configuraciones', label: 'Configuración', icon: Settings, grupo: 'cuenta' },
  { id: 'mobile-specialist', label: 'Vista móvil', icon: Smartphone, grupo: 'cuenta', special: true },
];

const titulosGrupo: Record<string, string> = {
  principal: 'Operación',
  finanzas: 'Cobros',
  red: 'Red',
  cuenta: 'Cuenta',
};

export function Sidebar({ activeModule, setActiveModule }: SidebarProps) {
  const { solicitudes, darkMode, notificaciones, brandColor } = useApp();

  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
  const mensajesNoLeidos = notificaciones.filter(n => !n.leida && n.tipo === 'mensaje').length;

  const grupos = ['principal', 'finanzas', 'red', 'cuenta'];

  return (
    <aside
      className="hidden lg:flex flex-col w-64 border-r transition-colors duration-200"
      style={{
        backgroundColor: darkMode ? '#111827' : '#FFFFFF',
        borderColor: darkMode ? '#1F2937' : '#E2E8F0'
      }}
    >
      <div className="flex flex-col h-full">
        <div
          className="h-16 flex items-center px-6 border-b"
          style={{ borderColor: darkMode ? '#1F2937' : '#E2E8F0' }}
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
            className="p-2 rounded-xl brand-mark"
          >
            <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
          </motion.div>
          <div className="ml-3">
            <span
              className="text-lg font-bold tracking-tight block leading-tight"
              style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
            >
              VetSpecialist
            </span>
            <span className="text-[10px] uppercase tracking-wider" style={{ color: darkMode ? '#6B7280' : '#94A3B8' }}>
              Portal especialista
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {grupos.map((grupo) => {
            const items = menuItemsEspecialista.filter(i => i.grupo === grupo);
            return (
              <div key={grupo}>
                <p
                  className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: darkMode ? '#6B7280' : '#94A3B8' }}
                >
                  {titulosGrupo[grupo]}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeModule === item.id;
                    const isSpecial = !!(item as any).special;
                    const badge =
                      item.id === 'solicitudes' ? solicitudesPendientes :
                      item.id === 'mensajes' ? mensajesNoLeidos : 0;

                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => setActiveModule(item.id)}
                        whileHover={{ x: isActive ? 0 : 4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        title={(item as any).description}
                        className={`relative w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-150 ${isSpecial ? 'mt-1 text-white shadow-lg' : ''}`}
                        style={isSpecial ? {
                          background: `linear-gradient(135deg, var(--brand-soft), var(--brand))`,
                          boxShadow: `0 8px 20px -8px var(--brand-glow)`,
                        } : {
                          backgroundColor: isActive ? 'var(--brand-muted)' : 'transparent',
                          color: isActive
                            ? brandColor
                            : darkMode ? '#9CA3AF' : '#64748B'
                        }}
                      >
                        {isActive && !isSpecial && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                            style={{ backgroundColor: 'var(--brand)' }}
                          />
                        )}
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="ml-3 text-sm font-medium truncate">{item.label}</span>
                        {badge > 0 && (
                          <span
                            className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: 'var(--brand)', color: 'var(--brand-foreground)' }}
                          >
                            {badge > 99 ? '99+' : badge}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div
          className="px-4 py-3 border-t text-[11px] leading-snug"
          style={{
            borderColor: darkMode ? '#1F2937' : '#E2E8F0',
            color: darkMode ? '#6B7280' : '#94A3B8'
          }}
        >
          Historia clínica y venta al cliente viven en el sistema de la clínica.
        </div>
      </div>
    </aside>
  );
}
