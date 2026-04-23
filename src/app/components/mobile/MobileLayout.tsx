import { useState } from 'react';
import { Outlet } from 'react-router-dom'; // Assuming we might use router later, but for now specific implementation
import { Home, Calendar, Users, Bell, User, Menu, Stethoscope } from 'lucide-react';
import { useApp } from '../../App';
import { motion, AnimatePresence } from 'motion/react';

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileLayout({ children, activeTab, onTabChange }: MobileLayoutProps) {
  const { darkMode } = useApp();

  const navItems = [
    { id: 'inicio', icon: Home, label: 'Inicio' },
    { id: 'pacientes', icon: Users, label: 'Pacientes' },
    { id: 'agenda', icon: Calendar, label: 'Agenda' },
    { id: 'notificaciones', icon: Bell, label: 'Alertas' },
    { id: 'perfil', icon: User, label: 'Perfil' },
  ];

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Top Bar - App Header */}
      <div className={`px-4 py-3 flex items-center justify-between shadow-sm z-20 ${darkMode ? 'bg-gray-900 border-b border-gray-800' : 'bg-white border-b border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Vet<span className="text-blue-500">App</span></span>
        </div>
        <button className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full pb-20" // Padding bottom for nav bar
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Bar - Fixed */}
      <div className={`fixed bottom-0 left-0 right-0 px-2 py-2 pb-safe z-30 ${darkMode ? 'bg-gray-900 border-t border-gray-800' : 'bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'}`}>
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 w-16 ${
                  isActive 
                    ? (darkMode ? 'text-blue-400' : 'text-blue-600') 
                    : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')
                }`}
              >
                <div className={`relative p-1.5 rounded-full transition-all ${isActive ? (darkMode ? 'bg-blue-500/10' : 'bg-blue-50') : ''}`}>
                  <item.icon className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
                  {item.id === 'notificaciones' && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
                  )}
                </div>
                <span className={`text-[10px] font-medium mt-1 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}