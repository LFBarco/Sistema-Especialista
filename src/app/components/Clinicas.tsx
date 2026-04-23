import { useState } from 'react';
import { 
  Building2, MapPin, Phone, Mail, Star, TrendingUp, DollarSign, Calendar,
  Search, Filter, Grid3x3, List, Plus, X, Map, PhoneCall, MessageSquare,
  Users, Clock, Award, AlertCircle, Edit, Trash2, BarChart3, Eye, ExternalLink
} from 'lucide-react';
import { useApp } from '../App';

interface Clinica {
  id: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  email: string;
  whatsapp: string;
  contacto: string;
  cargo: string;
  serviciosRealizados: number;
  totalFacturado: number;
  ultimoServicio: string;
  rating: number;
  estado: 'activa' | 'inactiva';
  relacionEstado: 'nueva' | 'activa' | 'vip' | 'inactiva';
  categorias: string[];
  coordenadas: { lat: number; lng: number };
}

export function Clinicas() {
  const { userClinicas, servicios, facturas, navegarA, darkMode } = useApp();

  // Mapear clínicas del contexto al formato local del componente
  const clinicasFromContext: Clinica[] = userClinicas.map((c: any, index: number) => {
    const serviciosClinica = servicios.filter(s => s.clinica === c.nombre);
    const facturasClinica = facturas.filter(f => f.clinica === c.nombre);
    const totalFacturado = facturasClinica.reduce((acc, f) => acc + f.total, 0);
    const ultimoServicio = serviciosClinica.length > 0
      ? serviciosClinica.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0].fecha
      : '';

    return {
      id: typeof c.id === 'number' ? c.id : index + 1,
      nombre: c.nombre || '',
      direccion: c.direccion || '',
      ciudad: '',
      telefono: c.telefono || '',
      email: c.contacto || '',
      whatsapp: '',
      contacto: c.contacto || '',
      cargo: '',
      serviciosRealizados: serviciosClinica.length,
      totalFacturado,
      ultimoServicio,
      rating: 0,
      estado: 'activa' as const,
      relacionEstado: 'activa' as const,
      categorias: [],
      coordenadas: { lat: 0, lng: 0 }
    };
  });

  const [clinicas, setClinicas] = useState<Clinica[]>(clinicasFromContext);
  const [clinicaSeleccionada, setClinicaSeleccionada] = useState<Clinica | null>(null);
  const [vistaActual, setVistaActual] = useState<'grid' | 'list' | 'map'>('grid');
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [filtroCiudad, setFiltroCiudad] = useState<string>('todas');

  // Nuevo formulario de clínica
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    email: '',
    whatsapp: '',
    contacto: '',
    cargo: ''
  });

  const totalClinicas = clinicas.length;
  const totalServicios = clinicas.reduce((acc, c) => acc + c.serviciosRealizados, 0);
  const totalFacturado = clinicas.reduce((acc, c) => acc + c.totalFacturado, 0);
  const promedioRating = clinicas.reduce((acc, c) => acc + c.rating, 0) / clinicas.length;

  // Filtrar clínicas
  const clinicasFiltradas = clinicas.filter(clinica => {
    const matchBusqueda = clinica.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          clinica.direccion.toLowerCase().includes(busqueda.toLowerCase()) ||
                          clinica.contacto.toLowerCase().includes(busqueda.toLowerCase());
    
    const matchEstado = filtroEstado === 'todas' || clinica.relacionEstado === filtroEstado;
    const matchCiudad = filtroCiudad === 'todas' || clinica.ciudad === filtroCiudad;
    
    return matchBusqueda && matchEstado && matchCiudad;
  });

  // Obtener ciudades únicas
  const ciudades = Array.from(new Set(clinicas.map(c => c.ciudad)));

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
          }`}
        />
      );
    }
    return stars;
  };

  const handleAgregarClinica = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nuevaClinica: Clinica = {
      id: Math.max(...clinicas.map(c => c.id)) + 1,
      ...formData,
      serviciosRealizados: 0,
      totalFacturado: 0,
      ultimoServicio: '',
      rating: 0,
      estado: 'activa',
      relacionEstado: 'nueva',
      categorias: [],
      coordenadas: { lat: 4.7110, lng: -74.0721 }
    };

    setClinicas([...clinicas, nuevaClinica]);
    setMostrarAgregar(false);
    setFormData({
      nombre: '',
      direccion: '',
      ciudad: '',
      telefono: '',
      email: '',
      whatsapp: '',
      contacto: '',
      cargo: ''
    });
  };

  const handleEliminarClinica = (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta clínica?')) {
      setClinicas(clinicas.filter(c => c.id !== id));
      setClinicaSeleccionada(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-100">Clínicas Asociadas</h1>
          <p className="text-gray-400">Gestiona tu red de clínicas y revisa tu historial con cada una</p>
        </div>
        <button 
          onClick={() => setMostrarAgregar(true)}
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar Clínica
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-1">Clínicas Activas</p>
              <p className="text-gray-100 mb-2">{totalClinicas}</p>
              <p className="text-sm text-green-400">+2 este mes</p>
            </div>
            <div className="bg-blue-900/50 text-blue-400 p-3 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-1">Servicios Totales</p>
              <p className="text-gray-100 mb-2">{totalServicios}</p>
              <p className="text-sm text-gray-500">En todas las clínicas</p>
            </div>
            <div className="bg-green-900/50 text-green-400 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-1">Facturación Total</p>
              <p className="text-gray-100 mb-2">${totalFacturado.toLocaleString()}</p>
              <p className="text-sm text-purple-400">+12% vs mes anterior</p>
            </div>
            <div className="bg-purple-900/50 text-purple-400 p-3 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-1">Rating Promedio</p>
              <p className="text-gray-100 mb-2">{promedioRating.toFixed(1)} ⭐</p>
              <p className="text-sm text-gray-500">Satisfacción general</p>
            </div>
            <div className="bg-yellow-900/50 text-yellow-400 p-3 rounded-lg">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filters & View Toggle */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar clínica por nombre, dirección o contacto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-500"
            />
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${
              mostrarFiltros ? 'bg-blue-900/50 border-blue-600 text-blue-400' : 'border-gray-700 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>

          {/* View Toggle */}
          <div className="flex border border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setVistaActual('grid')}
              className={`p-2 ${vistaActual === 'grid' ? 'bg-blue-900/50 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setVistaActual('list')}
              className={`p-2 border-l border-r border-gray-700 ${vistaActual === 'list' ? 'bg-blue-900/50 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setVistaActual('map')}
              className={`p-2 ${vistaActual === 'map' ? 'bg-blue-900/50 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}`}
            >
              <Map className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Estado de Relación</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="todas">Todas</option>
                <option value="nueva">Nueva</option>
                <option value="activa">Activa</option>
                <option value="vip">VIP</option>
                <option value="inactiva">Inactiva</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Ciudad</label>
              <select
                value={filtroCiudad}
                onChange={(e) => setFiltroCiudad(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="todas">Todas las ciudades</option>
                {ciudades.map(ciudad => (
                  <option key={ciudad} value={ciudad}>{ciudad}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setBusqueda('');
                  setFiltroEstado('todas');
                  setFiltroCiudad('todas');
                }}
                className="px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Mostrando <span className="font-medium text-gray-200">{clinicasFiltradas.length}</span> de <span className="font-medium text-gray-200">{totalClinicas}</span> clínicas
        </p>
      </div>

      {/* Grid View */}
      {vistaActual === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinicasFiltradas.map((clinica, index) => (
            <div
              key={clinica.id}
              className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => setClinicaSeleccionada(clinica)}
            >
              {/* Header */}
              <div className="p-6 pb-4 border-b border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center flex-1">
                    <div className="bg-blue-900/50 p-3 rounded-lg mr-3">
                      <Building2 className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-100 mb-1">{clinica.nombre}</h3>
                      <div className="flex items-center gap-2">
                        {clinica.relacionEstado === 'nueva' && (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-900/50 text-blue-400 border border-blue-700">🆕 Nueva</span>
                        )}
                        {clinica.relacionEstado === 'activa' && (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-900/50 text-green-400 border border-green-700">✅ Activa</span>
                        )}
                        {clinica.relacionEstado === 'vip' && (
                          <span className="px-2 py-1 rounded-full text-xs bg-purple-900/50 text-purple-400 border border-purple-700">⭐ VIP</span>
                        )}
                        {clinica.relacionEstado === 'inactiva' && (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-900/50 text-gray-400 border border-gray-700">⏸️ Inactiva</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {renderStars(clinica.rating)}
                  <span className="ml-2 text-sm text-gray-400">{clinica.rating.toFixed(1)}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {clinica.serviciosRealizados} servicios
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-start text-gray-400">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-600 flex-shrink-0" />
                    <span className="line-clamp-2">{clinica.direccion}, {clinica.ciudad}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Users className="w-4 h-4 mr-2 text-gray-600" />
                    {clinica.contacto}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`tel:${clinica.telefono}`);
                    }}
                    className="flex-1 px-3 py-2 text-xs text-blue-400 bg-blue-900/30 border border-blue-700 rounded-lg hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Llamar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://wa.me/${clinica.whatsapp.replace(/[^0-9]/g, '')}`);
                    }}
                    className="flex-1 px-3 py-2 text-xs text-green-400 bg-green-900/30 border border-green-700 rounded-lg hover:bg-green-900/50 transition-colors flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-700">
                  <div className="text-center p-2 bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Servicios</p>
                    <p className="text-sm text-gray-200">{clinica.serviciosRealizados}</p>
                  </div>
                  <div className="text-center p-2 bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Facturado</p>
                    <p className="text-sm text-gray-200">${clinica.totalFacturado.toLocaleString()}</p>
                  </div>
                </div>

                {/* Last Service */}
                {clinica.ultimoServicio && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Último: {new Date(clinica.ultimoServicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {vistaActual === 'list' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-400">Clínica</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400">Contacto</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400">Ciudad</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400">Estado</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400">Servicios</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400">Facturado</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400">Rating</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {clinicasFiltradas.map((clinica) => (
                <tr key={clinica.id} className="hover:bg-gray-700/50 cursor-pointer" onClick={() => setClinicaSeleccionada(clinica)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="bg-blue-900/50 p-2 rounded-lg mr-3">
                        <Building2 className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-200">{clinica.nombre}</p>
                        <p className="text-xs text-gray-500">{clinica.direccion}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-200">{clinica.contacto}</p>
                    <p className="text-xs text-gray-500">{clinica.telefono}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-200">{clinica.ciudad}</p>
                  </td>
                  <td className="px-6 py-4">
                    {clinica.relacionEstado === 'nueva' && (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-900/50 text-blue-400">🆕 Nueva</span>
                    )}
                    {clinica.relacionEstado === 'activa' && (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-900/50 text-green-400">✅ Activa</span>
                    )}
                    {clinica.relacionEstado === 'vip' && (
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-900/50 text-purple-400">⭐ VIP</span>
                    )}
                    {clinica.relacionEstado === 'inactiva' && (
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-900/50 text-gray-500">⏸️ Inactiva</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-200">{clinica.serviciosRealizados}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-200">${clinica.totalFacturado.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-200">{clinica.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${clinica.telefono}`);
                        }}
                        className="p-1.5 text-blue-400 hover:bg-blue-900/30 rounded"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setClinicaSeleccionada(clinica);
                        }}
                        className="p-1.5 text-gray-400 hover:bg-gray-700 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Map View */}
      {vistaActual === 'map' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="relative h-[600px] bg-gray-900">
            {/* Simulated Map Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-80"
              style={{
                backgroundImage: 'url(https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-74.0721,4.7110,6,0/800x600?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw)'
              }}
            />
            
            {/* Map Markers */}
            {clinicasFiltradas.map((clinica, index) => (
              <div
                key={clinica.id}
                className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer group"
                style={{
                  left: `${20 + index * 15}%`,
                  top: `${30 + (index % 3) * 20}%`
                }}
                onClick={() => setClinicaSeleccionada(clinica)}
              >
                {/* Marker Pin */}
                <div className="relative">
                  <svg width="32" height="40" viewBox="0 0 24 36" className="drop-shadow-lg">
                    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="#3B82F6"/>
                    <circle cx="12" cy="12" r="6" fill="white"/>
                  </svg>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-3 whitespace-nowrap">
                      <p className="text-sm text-gray-100 mb-1">{clinica.nombre}</p>
                      <p className="text-xs text-gray-400">{clinica.ciudad}</p>
                      <p className="text-xs text-gray-500">{clinica.serviciosRealizados} servicios</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4">
              <h4 className="text-sm text-gray-200 mb-2">Leyenda</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-400">Clínicas ({clinicasFiltradas.length})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Clinic Modal */}
      {mostrarAgregar && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-blue-900/50 p-3 rounded-lg mr-3">
                    <Building2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-gray-100">Agregar Nueva Clínica</h2>
                    <p className="text-sm text-gray-400">Completa la información de la clínica</p>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarAgregar(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAgregarClinica} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">
                      Nombre de la Clínica <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-500"
                      placeholder="Clínica Veterinaria XYZ"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">
                      Dirección <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.direccion}
                      onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-500"
                      placeholder="Av. Principal 123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Ciudad <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ciudad}
                      onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-500"
                      placeholder="Bogotá"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Teléfono <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-500"
                      placeholder="+57 312 456 7890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-500"
                      placeholder="contacto@clinica.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-500"
                      placeholder="+57 312 456 7890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Nombre del Contacto <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contacto}
                      onChange={(e) => setFormData({...formData, contacto: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-500"
                      placeholder="María González"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Cargo del Contacto
                    </label>
                    <input
                      type="text"
                      value={formData.cargo}
                      onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-500"
                      placeholder="Directora Médica"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setMostrarAgregar(false)}
                    className="px-4 py-2 text-sm text-gray-400 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Agregar Clínica
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {clinicaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center flex-1">
                  <div className="bg-blue-900/50 p-4 rounded-lg mr-4">
                    <Building2 className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-gray-100">{clinicaSeleccionada.nombre}</h2>
                      {clinicaSeleccionada.relacionEstado === 'nueva' && (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-900/50 text-blue-400">🆕 Nueva</span>
                      )}
                      {clinicaSeleccionada.relacionEstado === 'activa' && (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-900/50 text-green-400">✅ Activa</span>
                      )}
                      {clinicaSeleccionada.relacionEstado === 'vip' && (
                        <span className="px-2 py-1 rounded-full text-xs bg-purple-900/50 text-purple-400">⭐ VIP</span>
                      )}
                      {clinicaSeleccionada.relacionEstado === 'inactiva' && (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-900/50 text-gray-500">⏸️ Inactiva</span>
                      )}
                    </div>
                    <div className="flex items-center mb-2">
                      {renderStars(clinicaSeleccionada.rating)}
                      <span className="ml-2 text-sm text-gray-400">
                        {clinicaSeleccionada.rating.toFixed(1)} de 5.0
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {clinicaSeleccionada.categorias.map((cat, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-900 text-gray-400 text-xs rounded border border-gray-700">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setClinicaSeleccionada(null)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Quick Actions Bar */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => window.open(`tel:${clinicaSeleccionada.telefono}`)}
                  className="px-4 py-3 text-sm text-blue-400 bg-blue-900/30 border border-blue-700 rounded-lg hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  Llamar
                </button>
                <button
                  onClick={() => window.open(`mailto:${clinicaSeleccionada.email}`)}
                  className="px-4 py-3 text-sm text-purple-400 bg-purple-900/30 border border-purple-700 rounded-lg hover:bg-purple-900/50 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <button
                  onClick={() => window.open(`https://wa.me/${clinicaSeleccionada.whatsapp.replace(/[^0-9]/g, '')}`)}
                  className="px-4 py-3 text-sm text-green-400 bg-green-900/30 border border-green-700 rounded-lg hover:bg-green-900/50 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </button>
              </div>

              {/* Contact Info */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-200 mb-3">Información de Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start text-sm text-gray-400">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-gray-200 mb-0.5">{clinicaSeleccionada.direccion}</p>
                      <p className="text-xs text-gray-500">{clinicaSeleccionada.ciudad}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    {clinicaSeleccionada.telefono}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    {clinicaSeleccionada.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    {clinicaSeleccionada.contacto} - {clinicaSeleccionada.cargo}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-200 mb-3">Estadísticas de Facturación</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <p className="text-xs text-gray-400">Servicios Realizados</p>
                    </div>
                    <p className="text-gray-100">{clinicaSeleccionada.serviciosRealizados}</p>
                    <p className="text-xs text-gray-500 mt-1">servicios completados</p>
                  </div>
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <p className="text-xs text-gray-400">Total Facturado</p>
                    </div>
                    <p className="text-gray-100">${clinicaSeleccionada.totalFacturado.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">ingreso total</p>
                  </div>
                  <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      <p className="text-xs text-gray-400">Tarifa Promedio</p>
                    </div>
                    <p className="text-gray-100">
                      ${clinicaSeleccionada.serviciosRealizados > 0 ? Math.round(clinicaSeleccionada.totalFacturado / clinicaSeleccionada.serviciosRealizados) : 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">por servicio</p>
                  </div>
                </div>
              </div>

              {/* Recent Services */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm text-gray-200">Servicios Recientes</h3>
                  <button 
                    onClick={() => {
                      navegarA('servicios');
                      setClinicaSeleccionada(null);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Ver todos →
                  </button>
                </div>
                <div className="space-y-2">
                  {(() => {
                    const serviciosClinica = servicios
                      .filter(s => s.clinica === clinicaSeleccionada.nombre)
                      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                      .slice(0, 3);
                    
                    if (serviciosClinica.length === 0) {
                      return (
                        <div className="p-4 text-center text-sm text-gray-500 bg-gray-900/50 border border-gray-700 rounded-lg">
                          No hay servicios registrados con esta clínica
                        </div>
                      );
                    }

                    const estadoColores: Record<string, string> = {
                      pagado: 'text-green-400',
                      completado: 'text-purple-400',
                      confirmado: 'text-blue-400',
                      facturado: 'text-yellow-400',
                      cancelado: 'text-red-400'
                    };
                    
                    return serviciosClinica.map(s => (
                      <div 
                        key={s.id}
                        onClick={() => navegarA('servicios', { servicioId: s.id })}
                        className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-gray-200">{s.tipo}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(s.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} • {s.paciente} ({s.especie})
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-200">${s.tarifa.toLocaleString()}</span>
                          <p className={`text-xs ${estadoColores[s.estado] || 'text-gray-400'}`}>
                            {s.estado.charAt(0).toUpperCase() + s.estado.slice(1)}
                          </p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <button
                  onClick={() => handleEliminarClinica(clinicaSeleccionada.id)}
                  className="px-4 py-2 text-sm text-red-400 bg-red-900/30 border border-red-700 rounded-lg hover:bg-red-900/50 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar Clínica
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setClinicaSeleccionada(null)}
                    className="px-4 py-2 text-sm text-gray-400 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button 
                    onClick={() => {
                      navegarA('servicios');
                      setClinicaSeleccionada(null);
                    }}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Ver Historial Completo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}