import { Bell, Search, Moon, Sun, LogOut, Activity, TrendingUp, Building2, UserCircle, MapPin, Shield, UserCog } from 'lucide-react';
import { useApp } from '../App';
import { motion } from 'motion/react';
import { useState } from 'react';
import { NotificacionesMedicas } from './NotificacionesMedicas';
import { RealtimeStatus } from './RealtimeStatus';
import { ThemePicker } from './ThemePicker';

interface HeaderProps {
  activeModule?: string;
}

export function Header({ activeModule = 'dashboard' }: HeaderProps) {
  const { 
    darkMode, 
    toggleDarkMode, 
    brandColor,
    solicitudes, 
    handleLogout,
    notificaciones,
    marcarNotificacionLeida,
    marcarTodasNotificacionesLeidas,
    eliminarNotificacion,
    rolActivo,
    sedes,
    selectedSedeId,
    setSelectedSedeId,
    usuarioActual,
    simularUsuario
  } = useApp();
  const [searchFocused, setSearchFocused] = useState(false);

  // Filtrar sedes según permisos del usuario
  const sedesFiltradas = sedes.filter(s => {
    if (!s.activo) return false;
    // Si no hay restricciones (undefined) o lista vacía, mostrar todas
    if (!usuarioActual?.sedesIds || usuarioActual.sedesIds.length === 0) return true;
    return usuarioActual.sedesIds.includes(s.id);
  });

  // Contexto dinámico según módulo activo
  const getModuleContext = () => {
    switch(activeModule) {
      case 'solicitudes':
        return {
          placeholder: 'Buscar solicitudes...',
          icon: Activity,
          color: brandColor
        };
      case 'servicios':
        return {
          placeholder: 'Buscar servicios...',
          icon: Activity,
          color: 'var(--success)'
        };
      case 'finanzas':
        return {
          placeholder: 'Buscar facturas...',
          icon: TrendingUp,
          color: brandColor
        };
      case 'pacientes':
        return {
          placeholder: 'Buscar pacientes...',
          icon: Activity,
          color: 'var(--info)'
        };
      default:
        return {
          placeholder: 'Buscar en el sistema...',
          icon: Search,
          color: brandColor
        };
    }
  };

  const context = getModuleContext();

  return (
    <header 
      className="h-16 border-b flex items-center justify-between px-4 lg:px-6 transition-colors duration-200"
      style={{
        backgroundColor: darkMode ? '#111827' : '#FFFFFF',
        borderColor: darkMode ? '#1F2937' : '#E2E8F0'
      }}
    >
      {/* Search bar - Elemento principal mejorado */}
      <div className="flex-1 max-w-2xl mr-4">
        <motion.div 
          className="relative"
          animate={{
            scale: searchFocused ? 1.01 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <context.icon 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200" 
            style={{ 
              color: searchFocused ? context.color : (darkMode ? '#6B7280' : '#94A3B8')
            }}
          />
          <input
            type="text"
            placeholder={context.placeholder}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none transition-all duration-200 text-sm font-medium"
            style={{
              backgroundColor: darkMode 
                ? searchFocused ? '#1F2937' : 'rgba(31, 41, 55, 0.5)'
                : searchFocused ? '#FFFFFF' : '#F8FAFC',
              borderColor: searchFocused 
                ? context.color 
                : (darkMode ? '#374151' : '#E2E8F0'),
              color: darkMode ? '#E5E7EB' : '#0F172A',
              boxShadow: searchFocused 
                ? darkMode
                  ? `0 0 0 3px ${context.color}20`
                  : `0 0 0 3px ${context.color}15`
                : 'none'
            }}
          />
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Selector de Simulación de Usuario (DEMO UX ADAPTATIVA) */}
        {rolActivo === 'clinica' && (
          <div className="mr-2 hidden lg:block">
            <div className="relative group">
              <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
                <UserCog className="w-3.5 h-3.5" />
                {usuarioActual?.nombre?.includes('Admin') ? 'Modo: Admin Global' : 'Modo: Sede Limitada'}
              </button>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl overflow-hidden z-50 transform scale-0 group-hover:scale-100 transition-transform origin-top-right border-2"
                style={{
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  borderColor: darkMode ? '#374151' : '#E2E8F0'
                }}
              >
                <div className="p-2 space-y-1">
                  <div className={`text-xs font-bold px-2 py-1 mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    SIMULAR PERMISOS
                  </div>
                  <button 
                    onClick={() => simularUsuario('admin')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                      usuarioActual?.nombre?.includes('Admin')
                        ? 'bg-orange-500/10 text-orange-500'
                        : (darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700')
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    Admin Corporativo (Todo)
                  </button>
                  <button 
                    onClick={() => simularUsuario('sede_norte')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                      !usuarioActual?.nombre?.includes('Admin')
                        ? 'bg-orange-500/10 text-orange-500'
                        : (darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700')
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    Encargado Sede Norte
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sede Selector - Solo visible para clínicas */}
        {rolActivo === 'clinica' && sedesFiltradas.length > 0 && (
          <div className="mr-2 hidden md:block">
            <div className="relative">
              <MapPin className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <select
                value={selectedSedeId}
                onChange={(e) => setSelectedSedeId(e.target.value)}
                className={`pl-8 pr-8 py-1.5 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer appearance-none ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {/* Solo mostrar opción "Todas" si el usuario tiene acceso global (sedesIds undefined/empty) */}
                {(!usuarioActual?.sedesIds || usuarioActual.sedesIds.length === 0) && (
                  <option value="all">Todas las Sedes</option>
                )}
                
                {sedesFiltradas.map(sede => (
                  <option key={sede.id} value={sede.id}>
                    {sede.nombre}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Este portal es solo del especialista; la clínica opera en Veterinari. */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{
            backgroundColor: darkMode ? 'rgba(249, 115, 22, 0.12)' : 'rgba(249, 115, 22, 0.08)',
            color: '#EA580C',
          }}
        >
          <UserCircle className="w-3.5 h-3.5" />
          Especialista
        </div>

        {/* Separator */}
        <div 
          className="w-px h-8 mx-1"
          style={{ backgroundColor: darkMode ? '#374151' : '#E2E8F0' }}
        />

        {/* Temas de marca + claro/oscuro */}
        <div
          className="hidden sm:flex items-center px-2 py-1.5 rounded-lg"
          style={{ backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC' }}
        >
          <ThemePicker variant="compact" />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className="sm:hidden p-2.5 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
            color: darkMode ? '#FACC15' : '#64748B'
          }}
          title="Modo claro/oscuro"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>

        {/* Notifications - Sistema Médico Enterprise */}
        <NotificacionesMedicas
          notificaciones={notificaciones}
          onMarcarLeida={marcarNotificacionLeida}
          onMarcarTodasLeidas={marcarTodasNotificacionesLeidas}
          onEliminar={eliminarNotificacion}
        />

        {/* Realtime Sync Status */}
        <RealtimeStatus />

        {/* Separator */}
        <div 
          className="w-px h-8 mx-1"
          style={{ backgroundColor: darkMode ? '#374151' : '#E2E8F0' }}
        />

        {/* Logout - Mejorado */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 group"
          style={{
            backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
            color: darkMode ? '#E5E7EB' : '#64748B'
          }}
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5 group-hover:text-red-500 transition-colors" />
          <span className="text-sm font-medium hidden lg:inline group-hover:text-red-500 transition-colors">
            Salir
          </span>
        </motion.button>
      </div>
    </header>
  );
}