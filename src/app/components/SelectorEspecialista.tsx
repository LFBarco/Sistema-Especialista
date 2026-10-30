import { useState } from 'react';
import { useApp, type Especialista } from '../App';
import { ChevronDown, Star, Stethoscope, User, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SelectorEspecialistaProps {
  compact?: boolean; // Versión compacta para el header
  onSelect?: (especialista: Especialista) => void;
}

export function SelectorEspecialista({ compact = false, onSelect }: SelectorEspecialistaProps) {
  const { 
    especialistas, 
    especialistaSeleccionado, 
    setEspecialistaSeleccionado,
    getEspecialistaById,
    darkMode 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState<string>('todas');

  const especialistaActual = getEspecialistaById(especialistaSeleccionado);

  // Filtrar especialistas
  const especialistasFiltrados = especialistas.filter(e => {
    const matchSearch = e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.especialidad.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEspecialidad = filtroEspecialidad === 'todas' || e.especialidad === filtroEspecialidad;
    return matchSearch && matchEspecialidad && e.activo;
  });

  // Obtener todas las especialidades únicas
  const especialidades = Array.from(new Set(especialistas.map(e => e.especialidad)));

  const handleSelect = (especialista: Especialista) => {
    setEspecialistaSeleccionado(especialista.id);
    setIsOpen(false);
    if (onSelect) {
      onSelect(especialista);
    }
  };

  if (compact) {
    // Versión compacta para el header o dashboard
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all ${
            darkMode 
              ? 'bg-gray-800 border-gray-700 hover:border-orange-500/50' 
              : 'bg-white border-gray-200 hover:border-orange-400'
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-orange-500/20' : 'bg-orange-100'
          }`}>
            <Stethoscope className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1 text-left">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Especialista
            </p>
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Dr. {especialistaActual?.nombre} {especialistaActual?.apellido}
            </p>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${
            isOpen ? 'rotate-180' : ''
          } ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Overlay */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute top-full mt-2 right-0 w-96 rounded-xl border-2 shadow-2xl z-50 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="p-4 space-y-3">
                  {/* Búsqueda */}
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      placeholder="Buscar especialista..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border-2 outline-none transition-colors ${
                        darkMode 
                          ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-400'
                      }`}
                    />
                  </div>

                  {/* Filtro por especialidad */}
                  <select
                    value={filtroEspecialidad}
                    onChange={(e) => setFiltroEspecialidad(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-colors ${
                      darkMode 
                        ? 'bg-gray-900 border-gray-700 text-white focus:border-orange-500' 
                        : 'bg-white border-gray-200 text-gray-900 focus:border-orange-400'
                    }`}
                  >
                    <option value="todas">Todas las especialidades</option>
                    {especialidades.map(esp => (
                      <option key={esp} value={esp}>{esp}</option>
                    ))}
                  </select>
                </div>

                {/* Lista de especialistas */}
                <div className="max-h-96 overflow-y-auto">
                  {especialistasFiltrados.map((especialista) => (
                    <button
                      key={especialista.id}
                      onClick={() => handleSelect(especialista)}
                      className={`w-full p-4 flex items-center gap-3 transition-colors border-t ${
                        darkMode ? 'border-gray-700' : 'border-gray-200'
                      } ${
                        especialista.id === especialistaSeleccionado
                          ? darkMode 
                            ? 'bg-orange-500/10' 
                            : 'bg-orange-50'
                          : darkMode 
                            ? 'hover:bg-gray-700' 
                            : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        darkMode ? 'bg-orange-500/20' : 'bg-orange-100'
                      }`}>
                        <User className="w-6 h-6 text-orange-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Dr. {especialista.nombre} {especialista.apellido}
                          </p>
                          {especialista.id === especialistaSeleccionado && (
                            <Check className="w-5 h-5 text-orange-500" />
                          )}
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {especialista.especialidad}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {especialista.rating}
                            </span>
                          </div>
                          <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                            •
                          </span>
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            S/ {especialista.tarifa}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {especialistasFiltrados.length === 0 && (
                  <div className="p-8 text-center">
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No se encontraron especialistas
                    </p>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Versión completa para páginas
  return (
    <div className={`p-6 rounded-xl border-2 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Selecciona un Especialista
      </h3>

      {/* Búsqueda y filtros */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Buscar por nombre o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 outline-none transition-colors ${
              darkMode 
                ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-400'
            }`}
          />
        </div>

        <select
          value={filtroEspecialidad}
          onChange={(e) => setFiltroEspecialidad(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-colors ${
            darkMode 
              ? 'bg-gray-900 border-gray-700 text-white focus:border-orange-500' 
              : 'bg-white border-gray-200 text-gray-900 focus:border-orange-400'
          }`}
        >
          <option value="todas">Todas las especialidades</option>
          {especialidades.map(esp => (
            <option key={esp} value={esp}>{esp}</option>
          ))}
        </select>
      </div>

      {/* Grid de especialistas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {especialistasFiltrados.map((especialista) => (
          <motion.button
            key={especialista.id}
            onClick={() => handleSelect(especialista)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              especialista.id === especialistaSeleccionado
                ? 'border-orange-500 bg-orange-500/10'
                : darkMode 
                  ? 'border-gray-700 hover:border-gray-600' 
                  : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                darkMode ? 'bg-orange-500/20' : 'bg-orange-100'
              }`}>
                <User className="w-7 h-7 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Dr. {especialista.nombre} {especialista.apellido}
                  </h4>
                  {especialista.id === especialistaSeleccionado && (
                    <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  )}
                </div>
                <p className={`text-sm mb-2 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  {especialista.especialidad}
                </p>
                <p className={`text-xs mb-3 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {especialista.descripcion}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {especialista.rating}
                    </span>
                  </div>
                  <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {especialista.experiencia} años exp.
                  </span>
                  <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    S/ {especialista.tarifa}
                  </span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {especialistasFiltrados.length === 0 && (
        <div className="text-center py-12">
          <Stethoscope className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No se encontraron especialistas
          </p>
        </div>
      )}
    </div>
  );
}
