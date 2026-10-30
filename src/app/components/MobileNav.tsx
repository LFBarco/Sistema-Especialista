import { 
  LayoutDashboard, 
  Calendar, 
  Inbox, 
  Menu, 
  Stethoscope, 
  FileText, 
  DollarSign, 
  Building2, 
  User, 
  Settings, 
  Award,
  Activity,
  BarChart3,
} from 'lucide-react';
import { useApp } from '../App';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useState } from 'react';

interface MobileNavProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export function MobileNav({ activeModule, setActiveModule }: MobileNavProps) {
  const { solicitudes, darkMode, usuarioActual } = useApp();
  const [open, setOpen] = useState(false);
  
  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente').length;

  const mainTabs = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'solicitudes', label: 'Solicitudes', icon: Inbox, badge: solicitudesPendientes },
    { id: 'servicios', label: 'Servicios', icon: Stethoscope },
  ];

  const menuItems = [
    { id: 'facturacion', label: 'Honorarios', icon: FileText },
    { id: 'conciliacion', label: 'Conciliación', icon: DollarSign },
    { id: 'finanzas', label: 'Finanzas', icon: Activity },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
    { id: 'clinicas', label: 'Clínicas', icon: Building2 },
    { id: 'perfil-profesional', label: 'Perfil', icon: Award },
    { id: 'configuraciones', label: 'Configuración', icon: Settings },
  ];

  const handleTabClick = (id: string) => {
    setActiveModule(id);
  };

  const handleMenuClick = (id: string) => {
    setActiveModule(id);
    setOpen(false);
  };

  return (
    <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} pb-safe`}>
      <div className="flex items-center justify-around h-16">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModule === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive 
                  ? 'text-brand' 
                  : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
              }`}
              style={isActive ? { color: 'var(--brand)' } : undefined}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                menuItems.some(item => item.id === activeModule)
                  ? '' 
                  : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
              }`}
              style={menuItems.some(item => item.id === activeModule) ? { color: 'var(--brand)' } : undefined}
            >
              <Menu className="w-6 h-6" strokeWidth={2} />
              <span className="text-[10px] font-medium">Más</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className={`rounded-t-xl h-[80vh] ${darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <SheetHeader className="text-left border-b pb-4" style={{ borderColor: darkMode ? '#1F2937' : '#E5E7EB' }}>
              <SheetTitle className={darkMode ? 'text-white' : 'text-gray-900'}>Portal especialista</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-4 py-6">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                      isActive
                        ? 'ring-1'
                        : darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                    style={isActive ? {
                      backgroundColor: 'var(--brand-muted)',
                      color: 'var(--brand)',
                      ['--tw-ring-color' as string]: 'var(--brand)',
                    } : undefined}
                  >
                    <Icon className="w-8 h-8 mb-2" />
                    <span className="text-xs text-center font-medium leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
            
            <div className={`mt-auto p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
               <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full brand-mark flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{usuarioActual?.nombre || 'Especialista'}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{usuarioActual?.especialidad || 'Portal especialista'}</p>
                  </div>
                </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
