import { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter, Star, MapPin, Calendar, DollarSign, CheckCircle, Clock, Heart, Video, Building2, Award, TrendingUp, X, ChevronRight, ChevronDown, MessageSquare, Sparkles } from 'lucide-react';
import { useApp } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function EspecialistasAfiliados() {
  const { darkMode, navegarA, especialistas, servicios } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);
  const [soloDisponiblesHoy, setSoloDisponiblesHoy] = useState(false);
  const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState<any>(null);
  const [showPerfilDetalle, setShowPerfilDetalle] = useState(false);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  
  // Filtros avanzados
  const [filtroEspecialidades, setFiltroEspecialidades] = useState<string[]>([]);
  const [filtroModalidad, setFiltroModalidad] = useState<string[]>([]);
  const [filtroCiudad, setFiltroCiudad] = useState('todos');
  const [filtroTarifaMin, setFiltroTarifaMin] = useState(0);
  const [filtroTarifaMax, setFiltroTarifaMax] = useState(1000);
  const [filtroRatingMin, setFiltroRatingMin] = useState(0);
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('todos');
  const [filtroExperiencia, setFiltroExperiencia] = useState('todos');

  // Especialidades disponibles
  const especialidadesDisponibles = [
    'Cardiología',
    'Anestesiología',
    'Cirugía',
    'Ecografía',
    'Odontología',
    'Dermatología',
    'Nutrición',
    'Etología',
    'Medicina Interna',
    'Oftalmología'
  ];

  // Ciudades disponibles
  const ciudades = ['Medellín', 'Bogotá', 'Cali', 'Barranquilla', 'Cartagena'];

  // Extender datos de especialistas con información calculada
  const especialistasExtendidos = useMemo(() => {
    return especialistas.map(esp => {
      // Calcular servicios realizados desde datos reales
      const serviciosRealizados = servicios.filter(s => s.especialistaId === esp.id).length;
      
      // Usar rating real del especialista (del backend)
      const rating = esp.rating || 0;
      
      // Calcular disponibilidad desde los datos de disponibilidad del especialista
      const hoy = new Date();
      const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const;
      const diaHoy = diasSemana[hoy.getDay()];
      const horariosHoy = esp.disponibilidad?.[diaHoy] || [];
      const disponibleHoy = horariosHoy.length > 0;
      const proximoSlot = disponibleHoy 
        ? `Hoy · ${horariosHoy[0]?.inicio || ''}` 
        : 'Sin disponibilidad hoy';
      
      // Estado de verificación (en producción vendría de la BD)
      // Para demo: asumimos que todos están verificados, pero puedes agregar el campo 'estadoVerificacion' al mock
      const estadoVerificacion = (esp as any).estadoVerificacion || 'verified';
      
      // Determinar badge según estado de verificación Y desempeño
      let estado: 'verificado' | 'nuevo' | 'top' | 'draft' | 'pending' = 'verificado';
      
      // Regla 1: Si no está verificado, no determinar badge (será filtrado)
      if (estadoVerificacion === 'draft' || estadoVerificacion === 'pending') {
        estado = estadoVerificacion;
      } 
      // Regla 2: Si tiene verificación parcial, mostrar como "Nuevo"
      else if (estadoVerificacion === 'partial') {
        estado = 'nuevo';
      }
      // Regla 3: Si está completamente verificado
      else if (estadoVerificacion === 'verified') {
        // Badge "Top" si tiene excelente desempeño
        if (serviciosRealizados > 50 && rating > 4.7) {
          estado = 'top';
        } 
        // Badge "Nuevo" si tiene pocos servicios (pero está verificado)
        else if (serviciosRealizados < 5) {
          estado = 'nuevo';
        }
        // Badge "Verificado" por defecto
        else {
          estado = 'verificado';
        }
      }
      
      // Modalidades (derivar de datos del especialista si existen)
      const modalidades = esp.modalidad 
        ? (Array.isArray(esp.modalidad) ? esp.modalidad : [esp.modalidad])
        : ['Presencial'];
      
      // Tarifa base (usar tarifa del especialista si existe)
      const tarifaBase = esp.tarifa || 0;
      
      // Ciudad (usar del especialista si existe)
      const ciudad = (esp as any).ciudad || '';
      
      // Años de experiencia (usar del especialista si existe)
      const anosExperiencia = esp.experiencia || 0;
      
      // Bio profesional
      const bio = esp.descripcion || (esp.especialidad ? `Especialista en ${esp.especialidad}.` : '');
      
      // Certificaciones simuladas
      const certificaciones = [
        `Diplomado en ${esp.especialidad} Avanzada`,
        'Certificación Internacional en Ultrasonografía',
        'Especialización en Medicina de Pequeños Animales'
      ];
      
      return {
        ...esp,
        serviciosRealizados,
        rating: parseFloat(rating.toFixed(1)),
        disponibleHoy,
        proximoSlot,
        estado,
        modalidades,
        tarifaBase,
        ciudad,
        anosExperiencia,
        bio,
        certificaciones
      };
    });
  }, [especialistas, servicios]);

  // Aplicar filtros
  const especialistasFiltrados = useMemo(() => {
    return especialistasExtendidos.filter(esp => {
      // REGLA CRÍTICA: Solo mostrar especialistas verificados o con verificación parcial
      // NO mostrar DRAFT o PENDING
      if (esp.estado === 'draft' || esp.estado === 'pending') {
        return false;
      }
      
      // Búsqueda global
      if (busqueda) {
        const searchLower = busqueda.toLowerCase();
        const nombreCompleto = `${esp.nombre} ${esp.apellido}`.toLowerCase();
        const especialidad = esp.especialidad.toLowerCase();
        
        if (!nombreCompleto.includes(searchLower) && !especialidad.includes(searchLower)) {
          return false;
        }
      }
      
      // Solo disponibles hoy
      if (soloDisponiblesHoy && !esp.disponibleHoy) return false;
      
      // Especialidades
      if (filtroEspecialidades.length > 0 && !filtroEspecialidades.includes(esp.especialidad)) {
        return false;
      }
      
      // Modalidad
      if (filtroModalidad.length > 0) {
        const tieneModalidad = filtroModalidad.some(m => esp.modalidades.includes(m));
        if (!tieneModalidad) return false;
      }
      
      // Ciudad
      if (filtroCiudad !== 'todos' && esp.ciudad !== filtroCiudad) return false;
      
      // Tarifa
      if (esp.tarifaBase < filtroTarifaMin || esp.tarifaBase > filtroTarifaMax) return false;
      
      // Rating
      if (esp.rating < filtroRatingMin) return false;
      
      // Disponibilidad
      if (filtroDisponibilidad === 'hoy' && !esp.disponibleHoy) return false;
      
      // Experiencia
      if (filtroExperiencia === '+3' && esp.anosExperiencia < 3) return false;
      if (filtroExperiencia === '+5' && esp.anosExperiencia < 5) return false;
      if (filtroExperiencia === '+10' && esp.anosExperiencia < 10) return false;
      
      return true;
    });
  }, [especialistasExtendidos, busqueda, soloDisponiblesHoy, filtroEspecialidades, filtroModalidad, filtroCiudad, filtroTarifaMin, filtroTarifaMax, filtroRatingMin, filtroDisponibilidad, filtroExperiencia]);

  const toggleEspecialidad = (especialidad: string) => {
    setFiltroEspecialidades(prev => 
      prev.includes(especialidad)
        ? prev.filter(e => e !== especialidad)
        : [...prev, especialidad]
    );
  };

  const toggleModalidad = (modalidad: string) => {
    setFiltroModalidad(prev =>
      prev.includes(modalidad)
        ? prev.filter(m => m !== modalidad)
        : [...prev, modalidad]
    );
  };

  const toggleFavorito = (especialistaId: string) => {
    setFavoritos(prev => {
      if (prev.includes(especialistaId)) {
        toast.info('Eliminado de favoritos');
        return prev.filter(id => id !== especialistaId);
      } else {
        toast.success('Agregado a favoritos');
        return [...prev, especialistaId];
      }
    });
  };

  const limpiarFiltros = () => {
    setFiltroEspecialidades([]);
    setFiltroModalidad([]);
    setFiltroCiudad('todos');
    setFiltroTarifaMin(0);
    setFiltroTarifaMax(1000);
    setFiltroRatingMin(0);
    setFiltroDisponibilidad('todos');
    setFiltroExperiencia('todos');
  };

  const verPerfil = (especialista: any) => {
    setEspecialistaSeleccionado(especialista);
    setShowPerfilDetalle(true);
  };

  const solicitarServicio = (especialista: any) => {
    toast.success(`Abriendo solicitud de servicio para ${especialista.nombre} ${especialista.apellido}`);
    // En producción: navegarA('solicitudes') con datos pre-cargados
  };

  const filtrosActivos = [
    filtroEspecialidades.length > 0,
    filtroModalidad.length > 0,
    filtroCiudad !== 'todos',
    filtroTarifaMin > 0 || filtroTarifaMax < 1000,
    filtroRatingMin > 0,
    filtroDisponibilidad !== 'todos',
    filtroExperiencia !== 'todos'
  ].filter(Boolean).length;

  // Badge de estado
  const getBadgeEstado = (estado: string) => {
    switch (estado) {
      case 'verificado':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verificado
          </Badge>
        );
      case 'nuevo':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
            <Sparkles className="w-3 h-3 mr-1" />
            Nuevo
          </Badge>
        );
      case 'top':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
            <Award className="w-3 h-3 mr-1" />
            Top VetSpecialist
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* HEADER STICKY */}
      <div className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all ${
        darkMode 
          ? 'bg-gray-900/90 border-gray-800' 
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="p-4 lg:p-6">
          {/* Título y navegación */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navegarA('dashboard')}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Especialistas Afiliados
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Especialistas verificados disponibles para tu clínica
              </p>
            </div>
          </div>

          {/* Buscador y controles */}
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Buscador global */}
            <div className="flex-1 relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Buscar por nombre, especialidad o procedimiento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 font-medium transition-all focus:ring-2 focus:ring-orange-500 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {/* Botón filtros */}
            <Button
              onClick={() => setShowFiltros(!showFiltros)}
              variant="outline"
              className={`relative ${
                darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5 mr-2" />
              Filtros Avanzados
              {filtrosActivos > 0 && (
                <Badge className="ml-2 bg-orange-500 text-white">
                  {filtrosActivos}
                </Badge>
              )}
            </Button>

            {/* Toggle disponibilidad */}
            <button
              onClick={() => setSoloDisponiblesHoy(!soloDisponiblesHoy)}
              className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                soloDisponiblesHoy
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
                  : darkMode
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-2 border-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <Clock className="w-5 h-5 inline mr-2" />
              Solo disponibles hoy
            </button>
          </div>

          {/* Contador de resultados */}
          <div className="mt-3">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {especialistasFiltrados.length} especialista{especialistasFiltrados.length !== 1 ? 's' : ''} encontrado{especialistasFiltrados.length !== 1 ? 's' : ''}
              {favoritos.length > 0 && (
                <span className="ml-2">
                  • <Heart className="w-4 h-4 inline text-red-500" /> {favoritos.length} favorito{favoritos.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex">
        {/* PANEL DE FILTROS LATERAL */}
        <AnimatePresence>
          {showFiltros && (
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              className={`w-80 border-r flex-shrink-0 ${
                darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                {/* Header del panel */}
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Filtros Avanzados
                  </h3>
                  <button
                    onClick={() => setShowFiltros(false)}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                  >
                    <X className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>

                {/* Especialidad */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Especialidad
                  </label>
                  <div className="space-y-2">
                    {especialidadesDisponibles.map(esp => (
                      <label
                        key={esp}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={filtroEspecialidades.includes(esp)}
                          onChange={() => toggleEspecialidad(esp)}
                          className="w-4 h-4 rounded border-2 border-orange-500 text-orange-500"
                        />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {esp}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Modalidad */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Modalidad
                  </label>
                  <div className="space-y-2">
                    {['Presencial', 'Remoto'].map(mod => (
                      <label
                        key={mod}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={filtroModalidad.includes(mod)}
                          onChange={() => toggleModalidad(mod)}
                          className="w-4 h-4 rounded border-2 border-orange-500 text-orange-500"
                        />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {mod === 'Presencial' ? '🏥 Presencial' : '📹 Remoto'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Zona / Ciudad */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Zona / Ciudad
                  </label>
                  <select
                    value={filtroCiudad}
                    onChange={(e) => setFiltroCiudad(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="todos">Todas las ciudades</option>
                    {ciudades.map(ciudad => (
                      <option key={ciudad} value={ciudad}>{ciudad}</option>
                    ))}
                  </select>
                </div>

                {/* Rango de tarifa */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rango de Tarifa
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={filtroTarifaMin}
                        onChange={(e) => setFiltroTarifaMin(Number(e.target.value))}
                        placeholder="Min"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>-</span>
                      <input
                        type="number"
                        value={filtroTarifaMax}
                        onChange={(e) => setFiltroTarifaMax(Number(e.target.value))}
                        placeholder="Max"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      ${filtroTarifaMin} - ${filtroTarifaMax}
                    </p>
                  </div>
                </div>

                {/* Rating mínimo */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rating Mínimo
                  </label>
                  <div className="flex gap-2">
                    {[0, 3, 4, 4.5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setFiltroRatingMin(rating)}
                        className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-all ${
                          filtroRatingMin === rating
                            ? 'bg-orange-500 text-white'
                            : darkMode
                            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {rating === 0 ? 'Todos' : `${rating}★`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Disponibilidad */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Disponibilidad
                  </label>
                  <select
                    value={filtroDisponibilidad}
                    onChange={(e) => setFiltroDisponibilidad(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="todos">Cualquier día</option>
                    <option value="hoy">Hoy</option>
                    <option value="3dias">Próximos 3 días</option>
                    <option value="semana">Esta semana</option>
                  </select>
                </div>

                {/* Experiencia */}
                <div>
                  <label className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Experiencia
                  </label>
                  <select
                    value={filtroExperiencia}
                    onChange={(e) => setFiltroExperiencia(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="todos">Cualquier nivel</option>
                    <option value="+3">+3 años</option>
                    <option value="+5">+5 años</option>
                    <option value="+10">+10 años</option>
                  </select>
                </div>

                {/* Botones */}
                <div className="pt-4 space-y-2">
                  <Button
                    onClick={() => setShowFiltros(false)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    Aplicar Filtros
                  </Button>
                  <Button
                    variant="outline"
                    onClick={limpiarFiltros}
                    className={`w-full ${
                      darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : ''
                    }`}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GRID DE ESPECIALISTAS */}
        <div className="flex-1 p-4 lg:p-8">
          {especialistasFiltrados.length === 0 ? (
            <div className="text-center py-20">
              <Award className={`w-20 h-20 mx-auto mb-4 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No se encontraron especialistas
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Intenta ajustar los filtros de búsqueda
              </p>
              {filtrosActivos > 0 && (
                <Button
                  variant="outline"
                  onClick={limpiarFiltros}
                  className={`mt-4 ${darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : ''}`}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {especialistasFiltrados.map((especialista, index) => (
                <motion.div
                  key={especialista.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 hover:border-orange-500/50 hover:shadow-orange-500/20'
                        : 'bg-white hover:border-orange-500/50 hover:shadow-orange-500/10'
                    }`}
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent" />
                    </div>

                    <CardContent className="p-6 relative">
                      {/* Header con avatar y badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {especialista.nombre[0]}{especialista.apellido[0]}
                          </div>
                          <div>
                            {getBadgeEstado(especialista.estado)}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleFavorito(especialista.id)}
                          className={`p-2 rounded-lg transition-all ${
                            favoritos.includes(especialista.id)
                              ? 'text-red-500 bg-red-500/20'
                              : darkMode
                              ? 'text-gray-400 hover:text-red-500 hover:bg-gray-700'
                              : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${favoritos.includes(especialista.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Nombre y especialidad */}
                      <div className="mb-4">
                        <button
                          onClick={() => verPerfil(especialista)}
                          className="text-left"
                        >
                          <h3 className={`text-xl font-bold mb-1 group-hover:text-orange-500 transition-colors ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            Dr. {especialista.nombre} {especialista.apellido}
                          </h3>
                        </button>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {especialista.especialidad}
                        </p>
                      </div>

                      {/* Rating y servicios */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {especialista.rating}
                          </span>
                        </div>
                        <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          ({especialista.serviciosRealizados} servicios)
                        </span>
                      </div>

                      {/* Info adicional */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Award className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {especialista.anosExperiencia} años de experiencia
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {especialista.ciudad}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {especialista.modalidades.includes('Remoto') ? (
                            <Video className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          ) : (
                            <Building2 className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          )}
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {especialista.modalidades.join(' • ')}
                          </span>
                        </div>
                      </div>

                      {/* Disponibilidad */}
                      <div className={`p-3 rounded-lg mb-4 ${
                        especialista.disponibleHoy
                          ? darkMode
                            ? 'bg-green-500/10 border border-green-500/30'
                            : 'bg-green-50 border border-green-200'
                          : darkMode
                          ? 'bg-gray-900 border border-gray-700'
                          : 'bg-gray-50 border border-gray-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${
                            especialista.disponibleHoy ? 'text-green-500' : darkMode ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                          <div>
                            <p className={`text-xs font-semibold ${
                              especialista.disponibleHoy ? 'text-green-500' : darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {especialista.disponibleHoy ? 'Disponible hoy' : 'Próximo slot'}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {especialista.proximoSlot}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tarifa */}
                      <div className={`p-3 rounded-lg mb-4 ${
                        darkMode ? 'bg-gray-900' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                              Desde
                            </p>
                            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              S/ {especialista.tarifaBase}
                            </p>
                          </div>
                          <DollarSign className={`w-6 h-6 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                        </div>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
                          Tarifa puede variar según complejidad
                        </p>
                      </div>

                      {/* Botones eliminados - ya no se muestran "Solicitar Servicio" ni "Ver Disponibilidad" */}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL PERFIL DETALLADO */}
      <AnimatePresence>
        {showPerfilDetalle && especialistaSeleccionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPerfilDetalle(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
                darkMode ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white'
              }`}
            >
              {/* Header */}
              <div className={`sticky top-0 z-10 backdrop-blur-xl border-b p-6 ${
                darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                      {especialistaSeleccionado.nombre[0]}{especialistaSeleccionado.apellido[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Dr. {especialistaSeleccionado.nombre} {especialistaSeleccionado.apellido}
                        </h2>
                        {getBadgeEstado(especialistaSeleccionado.estado)}
                      </div>
                      <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {especialistaSeleccionado.especialidad}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {especialistaSeleccionado.rating}
                          </span>
                          <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            ({especialistaSeleccionado.serviciosRealizados} servicios)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {especialistaSeleccionado.ciudad}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPerfilDetalle(false)}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Bio Profesional */}
                <div>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Perfil Profesional
                  </h3>
                  <p className={`text-base leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {especialistaSeleccionado.bio}
                  </p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className={darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}>
                    <CardContent className="p-4">
                      <Award className={`w-8 h-8 mb-2 ${darkMode ? 'text-orange-500' : 'text-orange-600'}`} />
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {especialistaSeleccionado.anosExperiencia} años
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        Experiencia
                      </p>
                    </CardContent>
                  </Card>

                  <Card className={darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}>
                    <CardContent className="p-4">
                      <CheckCircle className={`w-8 h-8 mb-2 ${darkMode ? 'text-green-500' : 'text-green-600'}`} />
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {especialistaSeleccionado.serviciosRealizados}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        Casos Atendidos
                      </p>
                    </CardContent>
                  </Card>

                  <Card className={darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}>
                    <CardContent className="p-4">
                      <Star className={`w-8 h-8 mb-2 ${darkMode ? 'text-yellow-500' : 'text-yellow-600'}`} />
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {especialistaSeleccionado.rating}/5.0
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        Rating Promedio
                      </p>
                    </CardContent>
                  </Card>

                  <Card className={darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}>
                    <CardContent className="p-4">
                      <DollarSign className={`w-8 h-8 mb-2 ${darkMode ? 'text-blue-500' : 'text-blue-600'}`} />
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        S/ {especialistaSeleccionado.tarifaBase}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        Desde
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Certificaciones */}
                <div>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Certificaciones y Estudios
                  </h3>
                  <div className="space-y-3">
                    {especialistaSeleccionado.certificaciones.map((cert: string, index: number) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-4 rounded-xl ${
                          darkMode ? 'bg-gray-900' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          darkMode ? 'bg-orange-500/20' : 'bg-orange-100'
                        }`}>
                          <Award className="w-5 h-5 text-orange-500" />
                        </div>
                        <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {cert}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modalidades */}
                <div>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Modalidades de Atención
                  </h3>
                  <div className="flex gap-3">
                    {especialistaSeleccionado.modalidades.map((mod: string) => (
                      <div
                        key={mod}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                          darkMode ? 'bg-blue-500/20 border-2 border-blue-500/50' : 'bg-blue-50 border-2 border-blue-200'
                        }`}
                      >
                        {mod === 'Remoto' ? (
                          <Video className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Building2 className="w-5 h-5 text-blue-500" />
                        )}
                        <span className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {mod}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agenda Semanal */}
                <div>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Disponibilidad - Próximos 7 Días
                  </h3>
                  <div className="grid grid-cols-7 gap-2">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia, index) => {
                      // Verificar disponibilidad real del especialista para este día
                      const diasKey = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] as const;
                      const horariosDelDia = especialistaSeleccionado.disponibilidad?.[diasKey[index]] || [];
                      const disponible = horariosDelDia.length > 0;
                      const slots = horariosDelDia.length;
                      
                      return (
                        <button
                          key={dia}
                          className={`p-3 rounded-xl text-center transition-all ${
                            disponible
                              ? darkMode
                                ? 'bg-green-500/20 border-2 border-green-500/50 hover:bg-green-500/30'
                                : 'bg-green-50 border-2 border-green-200 hover:bg-green-100'
                              : darkMode
                              ? 'bg-gray-900 border-2 border-gray-700 opacity-50'
                              : 'bg-gray-100 border-2 border-gray-200 opacity-50'
                          }`}
                          disabled={!disponible}
                        >
                          <p className={`text-xs font-semibold mb-1 ${
                            disponible
                              ? 'text-green-500'
                              : darkMode ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {dia}
                          </p>
                          <p className={`text-lg font-bold ${
                            disponible
                              ? darkMode ? 'text-white' : 'text-gray-900'
                              : darkMode ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {2 + index}
                          </p>
                          {disponible && (
                            <p className={`text-xs mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                              {slots} slot{slots !== 1 ? 's' : ''}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className={`text-sm mt-3 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    💡 Haz clic en un día para ver los horarios disponibles
                  </p>
                </div>

                {/* Reputación y Comentarios */}
                <div>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Reputación y Comentarios
                  </h3>
                  
                  {/* Distribución de ratings */}
                  <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map(stars => {
                        const porcentaje = stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 7 : stars === 2 ? 2 : 1;
                        return (
                          <div key={stars} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-20">
                              <span className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {stars}
                              </span>
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            </div>
                            <div className={`flex-1 h-2 rounded-full overflow-hidden ${
                              darkMode ? 'bg-gray-800' : 'bg-gray-200'
                            }`}>
                              <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                                style={{ width: `${porcentaje}%` }}
                              />
                            </div>
                            <span className={`text-sm font-semibold w-12 text-right ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {porcentaje}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comentarios destacados (simulados) */}
                  <div className="space-y-3">
                    {[
                      { texto: 'Excelente profesional. Muy detallado en sus diagnósticos y explica todo claramente.', rating: 5 },
                      { texto: 'Muy recomendado. Salvó la vida de mi paciente con un diagnóstico preciso.', rating: 5 },
                      { texto: 'Profesional y puntual. Gran calidad de atención.', rating: 4 }
                    ].map((comentario, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {Array.from({ length: comentario.rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                            ))}
                          </div>
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                            Clínica verificada
                          </span>
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {comentario.texto}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Aviso Legal */}
                <div className={`p-4 rounded-xl border-2 ${
                  darkMode
                    ? 'bg-blue-500/10 border-blue-500/50'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className={`font-bold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                        Privacidad y Confidencialidad
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                        El historial clínico solo será accesible previa aprobación del especialista. 
                        Todos los datos están protegidos bajo normativas de confidencialidad médica.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer con botones de acción */}
              <div className={`sticky bottom-0 backdrop-blur-xl border-t p-6 ${
                darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'
              }`}>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowPerfilDetalle(false);
                      solicitarServicio(especialistaSeleccionado);
                    }}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 text-lg"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Solicitar Servicio
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toggleFavorito(especialistaSeleccionado.id)}
                    className={`px-6 ${
                      favoritos.includes(especialistaSeleccionado.id)
                        ? 'bg-red-500/20 text-red-500 border-red-500'
                        : darkMode
                        ? 'border-gray-700 text-gray-400 hover:bg-gray-700'
                        : ''
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favoritos.includes(especialistaSeleccionado.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}