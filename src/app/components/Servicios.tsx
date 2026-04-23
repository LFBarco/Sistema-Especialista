import { useState } from 'react';
import { Search, Filter, Download, Eye, FileText, Calendar, MapPin, DollarSign } from 'lucide-react';
import { useApp } from '../App';
import { ClinicaFilter, getClinicaColor } from './ClinicaFilter';
import { toast } from 'sonner@2.0.3';

export function Servicios() {
  const { servicios, darkMode, userClinicas, getClinicaByNombre, navegarA } = useApp();
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [selectedClinica, setSelectedClinica] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [servicioDetalle, setServicioDetalle] = useState<any>(null);

  const estadoColors = {
    confirmado: { bg: darkMode ? 'bg-blue-900/50' : 'bg-blue-100', text: darkMode ? 'text-blue-400' : 'text-blue-600', border: darkMode ? 'border-blue-700' : 'border-blue-300', label: 'Confirmado' },
    completado: { bg: darkMode ? 'bg-purple-900/50' : 'bg-purple-100', text: darkMode ? 'text-purple-400' : 'text-purple-600', border: darkMode ? 'border-purple-700' : 'border-purple-300', label: 'Completado' },
    facturado: { bg: darkMode ? 'bg-yellow-900/50' : 'bg-yellow-100', text: darkMode ? 'text-yellow-400' : 'text-yellow-600', border: darkMode ? 'border-yellow-700' : 'border-yellow-300', label: 'Facturado' },
    pagado: { bg: darkMode ? 'bg-green-900/50' : 'bg-green-100', text: darkMode ? 'text-green-400' : 'text-green-600', border: darkMode ? 'border-green-700' : 'border-green-300', label: 'Pagado' },
    cancelado: { bg: darkMode ? 'bg-red-900/50' : 'bg-red-100', text: darkMode ? 'text-red-400' : 'text-red-600', border: darkMode ? 'border-red-700' : 'border-red-300', label: 'Cancelado' }
  };

  const serviciosFiltrados = servicios.filter(s => {
    const cumpleFiltro = filtroEstado === 'todos' || s.estado === filtroEstado;
    const cumpleBusqueda = busqueda === '' || 
      s.clinica.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.tipo.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.paciente.toLowerCase().includes(busqueda.toLowerCase());
    const cumpleClinica = selectedClinica === 'todas' || (() => {
      const clinica = getClinicaByNombre(s.clinica);
      return clinica?.id === selectedClinica;
    })();
    return cumpleFiltro && cumpleBusqueda && cumpleClinica;
  });

  const totalIngresos = serviciosFiltrados
    .filter(s => s.estado === 'pagado')
    .reduce((acc, s) => acc + s.tarifa, 0);
  const totalServicios = serviciosFiltrados.length;

  const handleVerDetalle = (servicio: any) => {
    setServicioDetalle(servicio);
  };

  const handleVerFactura = (facturaId: string) => {
    if (facturaId) {
      navegarA('facturacion', { facturaId });
      toast.success('Navegando a la factura...');
    } else {
      toast.error('Este servicio no tiene factura asociada');
    }
  };

  const handleIrAFacturar = () => {
    navegarA('facturacion');
    toast.success('Yendo a facturación para procesar cobro...');
  };

  const handleExportar = () => {
    try {
      const rows: string[] = [
        'Fecha,Hora,Clínica,Tipo de Servicio,Paciente,Especie,Estado,Tarifa,Factura',
        ...serviciosFiltrados.map(s =>
          `${s.fecha},${s.hora || 'N/A'},${s.clinica},${s.tipo},${s.paciente},${s.especie},${s.estado},$${s.tarifa},${s.facturaId || 'N/A'}`
        )
      ];
      const csvContent = rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `servicios_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`${serviciosFiltrados.length} servicios exportados a CSV`);
    } catch (error) {
      console.error('Error al exportar servicios:', error);
      toast.error('Error al exportar los servicios');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Historial de Servicios</h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Registro completo de todos tus servicios prestados</p>
        </div>
        <button 
          onClick={handleExportar}
          className="px-4 py-2 text-sm text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg transition-all flex items-center shadow-lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar a Excel
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Servicios</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{totalServicios}</p>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>En el período seleccionado</p>
        </div>
        <div className={`rounded-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ingresos Totales</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>${totalIngresos.toLocaleString()}</p>
          <p className={`text-sm mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Servicios pagados</p>
        </div>
        <div className={`rounded-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tarifa Promedio</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>${totalServicios > 0 ? Math.round(totalIngresos / totalServicios) : 0}</p>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Por servicio</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={`rounded-xl border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Buscar por clínica, tipo de servicio o paciente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  darkMode 
                    ? 'bg-gray-900 border-gray-700 text-gray-200 placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode 
                      ? 'bg-gray-900 border-gray-700 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="confirmado">Confirmados</option>
                  <option value="completado">Completados</option>
                  <option value="facturado">Facturados</option>
                  <option value="pagado">Pagados</option>
                  <option value="cancelado">Cancelados</option>
                </select>
              </div>
              
              <input
                type="month"
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  darkMode 
                    ? 'bg-gray-900 border-gray-700 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
          
          {/* Filtro de Clínicas */}
          <div>
            <label className={`text-sm mb-2 block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Filtrar por clínica:</label>
            <ClinicaFilter
              clinicas={userClinicas}
              selectedClinica={selectedClinica}
              onSelectClinica={setSelectedClinica}
            />
          </div>
        </div>
      </div>

      {/* Services List - Responsive */}
      <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {serviciosFiltrados.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              No se encontraron servicios
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View (Cards) */}
            <div className={`lg:hidden ${darkMode ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
              {serviciosFiltrados.map((servicio) => {
                const estado = estadoColors[servicio.estado as keyof typeof estadoColors] || estadoColors.completado;
                return (
                  <div key={servicio.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{servicio.tipo}</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{servicio.clinica}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded border ${estado.bg} ${estado.text} ${estado.border}`}>
                        {estado.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className={`flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(servicio.fecha).toLocaleDateString('es-ES')}
                      </div>
                      <div className="flex items-center">
                        <p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>${servicio.tarifa}</p>
                      </div>
                      <div className="col-span-2">
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {servicio.paciente} <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>({servicio.especie})</span>
                        </p>
                      </div>
                    </div>

                    {servicio.facturaId && (
                       <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Factura: {servicio.facturaId}</p>
                    )}
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      {!servicio.facturaId && servicio.estado === 'completado' && (
                         <button 
                           onClick={handleIrAFacturar}
                           className={`p-2 rounded-lg transition-colors ${
                             darkMode 
                              ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400' 
                              : 'bg-green-50 hover:bg-green-100 text-green-600'
                           }`}
                           title="Ir a Facturar"
                         >
                           <DollarSign className="w-4 h-4" />
                         </button>
                      )}
                      <button 
                        onClick={() => handleVerDetalle(servicio)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode 
                            ? 'text-blue-400 hover:bg-blue-900/30 bg-gray-900/50' 
                            : 'text-blue-600 hover:bg-blue-50 bg-gray-50'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {servicio.facturaId && (
                        <button 
                          onClick={() => handleVerFactura(servicio.facturaId!)}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode 
                              ? 'text-gray-400 hover:bg-gray-700 bg-gray-900/50' 
                              : 'text-gray-600 hover:bg-gray-100 bg-gray-50'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Fecha
                    </th>
                    <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Clínica
                    </th>
                    <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Tipo de Servicio
                    </th>
                    <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Paciente
                    </th>
                    <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Estado
                    </th>
                    <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Tarifa
                    </th>
                    <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Factura
                    </th>
                    <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
                  {serviciosFiltrados.map((servicio) => {
                    const estado = estadoColors[servicio.estado as keyof typeof estadoColors] || estadoColors.completado;
                    return (
                      <tr key={servicio.id} className={darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {new Date(servicio.fecha).toLocaleDateString('es-ES')}
                        </td>
                        <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <div className="flex items-center">
                            <div 
                              className="w-2 h-2 rounded-full mr-2" 
                              style={{ backgroundColor: getClinicaColor(servicio.clinica) }}
                            />
                            {servicio.clinica}
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {servicio.tipo}
                        </td>
                        <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <div>
                            <div className="font-medium">{servicio.paciente}</div>
                            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{servicio.especie}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs px-2 py-1 rounded border ${estado.bg} ${estado.text} ${estado.border}`}>
                            {estado.label}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          ${servicio.tarifa.toLocaleString()}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {servicio.facturaId || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {!servicio.facturaId && servicio.estado === 'completado' && (
                             <button 
                               onClick={handleIrAFacturar}
                               className={`p-2 rounded-lg transition-colors ${
                                 darkMode 
                                  ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400' 
                                  : 'bg-green-50 hover:bg-green-100 text-green-600'
                               }`}
                               title="Ir a Facturar"
                             >
                               <DollarSign className="w-4 h-4" />
                             </button>
                          )}
                          <button 
                            onClick={() => handleVerDetalle(servicio)}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode 
                                ? 'text-blue-400 hover:bg-blue-900/30' 
                                : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {servicio.facturaId && (
                            <button 
                              onClick={() => handleVerFactura(servicio.facturaId!)}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode 
                                  ? 'text-gray-400 hover:bg-gray-700' 
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                              title="Ver factura"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal de Detalle */}
      {servicioDetalle && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setServicioDetalle(null)}
        >
          <div 
            className={`rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Detalle del Servicio
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ID: {servicioDetalle.id}
                </p>
              </div>
              <button
                onClick={() => setServicioDetalle(null)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <FileText className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fecha</label>
                  <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {new Date(servicioDetalle.fecha).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hora</label>
                  <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {servicioDetalle.hora || 'No especificada'}
                  </p>
                </div>
              </div>

              <div>
                <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Clínica</label>
                <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{servicioDetalle.clinica}</p>
              </div>

              <div>
                <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tipo de Servicio</label>
                <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{servicioDetalle.tipo}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Paciente</label>
                  <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{servicioDetalle.paciente}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Especie</label>
                  <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{servicioDetalle.especie}</p>
                </div>
              </div>

              {servicioDetalle.notas && (
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Notas del Servicio</label>
                  <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{servicioDetalle.notas}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estado</label>
                  <p className="mt-1">
                    <span className={`text-xs px-2 py-1 rounded border ${
                      estadoColors[servicioDetalle.estado as keyof typeof estadoColors]?.bg || ''
                    } ${
                      estadoColors[servicioDetalle.estado as keyof typeof estadoColors]?.text || ''
                    } ${
                      estadoColors[servicioDetalle.estado as keyof typeof estadoColors]?.border || ''
                    }`}>
                      {estadoColors[servicioDetalle.estado as keyof typeof estadoColors]?.label || servicioDetalle.estado}
                    </span>
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tarifa</label>
                  <p className={`mt-1 text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    ${servicioDetalle.tarifa.toLocaleString()}
                  </p>
                </div>
              </div>

              {servicioDetalle.facturaId && (
                <div>
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Factura Asociada</label>
                  <p className={`mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{servicioDetalle.facturaId}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setServicioDetalle(null)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  darkMode 
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cerrar
              </button>
              {servicioDetalle.facturaId && (
                <button
                  onClick={() => {
                    handleVerFactura(servicioDetalle.facturaId);
                    setServicioDetalle(null);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-lg"
                >
                  Ver Factura
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}