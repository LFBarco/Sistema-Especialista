import { useState, useMemo } from 'react';
import { ArrowLeft, Building2, DollarSign, FileText, Download, Calendar, CheckCircle, Clock, Filter, X, Search, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { RegistroPagosModal } from './RegistroPagosModal';
import { toast } from 'sonner';

export function EstadoCuentaClinicaV2() {
  const { darkMode, navegarA, facturas, servicios, especialistas, sedes: sedesContext, selectedSedeId, userClinicas } = useApp();
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<any>(null);
  const [showFiltros, setShowFiltros] = useState(false);
  const [facturasSeleccionadas, setFacturasSeleccionadas] = useState<string[]>([]);
  const [showPagoMasivo, setShowPagoMasivo] = useState(false);
  
  // Determinar rol
  const isModoCorporativo = selectedSedeId === 'all';
  
  // Estados de filtros
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroEspecialista, setFiltroEspecialista] = useState('todos');
  const [filtroSede, setFiltroSede] = useState('todos');

  // Obtener clínica del contexto (primera clínica del usuario)
  const clinicaData = userClinicas[0];
  const clinica = {
    nombre: clinicaData?.nombre || '',
    contacto: clinicaData?.contacto || '',
    telefono: clinicaData?.telefono || '',
    direccion: clinicaData?.direccion || '',
    email: clinicaData?.contacto || ''
  };

  // Sedes disponibles (en producción vendría de la clínica)
  const sedes = sedesContext;

  // Facturas de la clínica con información adicional
  const facturasClinicaExtendidas = facturas
    .filter(f => f.clinica === clinica.nombre)
    // Filtro global de sede
    .filter(f => selectedSedeId === 'all' || f.sedeId === selectedSedeId || (!f.sedeId && selectedSedeId === 'all'))
    .map(f => {
      // Buscar servicios relacionados para obtener información del paciente y especialista
      const servicioRelacionado = servicios.find(s => s.id === f.servicioId);
      
      // Buscar el especialista correspondiente
      let nombreEspecialista = 'Sin asignar';
      if (servicioRelacionado?.especialistaId) {
        const especialista = especialistas.find(e => e.id === servicioRelacionado.especialistaId);
        if (especialista) {
          nombreEspecialista = `${especialista.nombre} ${especialista.apellido}`;
        }
      }

      // Obtener nombre de la sede
      const sedeNombre = sedes.find(s => s.id === f.sedeId)?.nombre || 'Sede Principal - Centro';
      
      return {
        ...f,
        paciente: servicioRelacionado?.paciente || 'N/A',
        especialista: nombreEspecialista,
        sede: sedeNombre
      };
    });

  // Obtener lista única de especialistas que han prestado servicios a esta clínica
  const especialistasConServicios = useMemo(() => {
    const especialistasUnicos = new Set<string>();
    facturasClinicaExtendidas.forEach(factura => {
      especialistasUnicos.add(factura.especialista);
    });
    return Array.from(especialistasUnicos).sort();
  }, [facturasClinicaExtendidas]);

  // Aplicar filtros
  const facturasFiltradas = useMemo(() => {
    return facturasClinicaExtendidas.filter(factura => {
      // Filtro por fecha inicio
      if (filtroFechaInicio && factura.fecha < filtroFechaInicio) return false;
      
      // Filtro por fecha fin
      if (filtroFechaFin && factura.fecha > filtroFechaFin) return false;
      
      // Filtro por estado
      if (filtroEstado !== 'todos' && factura.estado !== filtroEstado) return false;
      
      // Filtro por especialista
      if (filtroEspecialista !== 'todos' && !factura.especialista.toLowerCase().includes(filtroEspecialista.toLowerCase())) return false;
      
      // Filtro por sede
      if (filtroSede !== 'todos' && factura.sede !== filtroSede) return false;
      
      return true;
    });
  }, [facturasClinicaExtendidas, filtroFechaInicio, filtroFechaFin, filtroEstado, filtroEspecialista, filtroSede]);

  // Desglose por sede (solo si estamos viendo todas)
  const desgloseSedes = useMemo(() => {
    if (selectedSedeId !== 'all') return [];

    const sedesMap = new Map();

    facturasFiltradas.forEach(f => {
       const sedeName = f.sede || 'Sin Sede Asignada';
       if (!sedesMap.has(sedeName)) {
         sedesMap.set(sedeName, { total: 0, pagado: 0, pendiente: 0, count: 0 });
       }
       const current = sedesMap.get(sedeName);
       current.total += f.total;
       if (f.estado === 'pagada') current.pagado += f.total;
       else current.pendiente += f.total;
       current.count++;
    });

    return Array.from(sedesMap.entries()).map(([nombre, stats]) => ({ nombre, ...stats }));
  }, [facturasFiltradas, selectedSedeId]);

  // Calcular totales con facturas filtradas
  const totalFacturado = facturasFiltradas.reduce((acc, f) => acc + f.total, 0);
  const totalPagado = facturasFiltradas.filter(f => f.estado === 'pagada').reduce((acc, f) => acc + f.total, 0);
  const totalPendiente = totalFacturado - totalPagado;

  // Obtener facturas seleccionadas
  const facturasParaPago = facturasFiltradas.filter(f => facturasSeleccionadas.includes(f.id));
  const totalSeleccionado = facturasParaPago.reduce((acc, f) => acc + f.total, 0);

  // Estados de facturas para el filtro
  const estadosFactura = [
    { value: 'todos', label: 'Todos los estados', count: facturasFiltradas.length },
    { value: 'borrador', label: 'Borrador', count: facturasFiltradas.filter(f => f.estado === 'borrador').length },
    { value: 'enviada', label: 'Enviada/Pendiente', count: facturasFiltradas.filter(f => f.estado === 'enviada').length },
    { value: 'validada_por_sede', label: 'Validada por Sede', count: facturasFiltradas.filter(f => f.estado === 'validada_por_sede').length },
    { value: 'pagada', label: 'Pagada', count: facturasFiltradas.filter(f => f.estado === 'pagada').length },
    { value: 'vencida', label: 'Vencida', count: facturasFiltradas.filter(f => f.estado === 'vencida').length }
  ];

  const toggleFacturaSeleccion = (facturaId: string) => {
    setFacturasSeleccionadas(prev => {
      if (prev.includes(facturaId)) {
        return prev.filter(id => id !== facturaId);
      } else {
        return [...prev, facturaId];
      }
    });
  };

  const seleccionarTodas = () => {
    // Solo seleccionar las que están validadas por sede y pendientes de pago
    const facturasCandidatas = facturasFiltradas
      .filter(f => f.estado === 'validada_por_sede')
      .map(f => f.id);
      
    if (facturasCandidatas.length === 0) {
      toast.info("No hay facturas validadas listas para pago masivo");
      return;
    }
    
    setFacturasSeleccionadas(facturasCandidatas);
    toast.success(`${facturasCandidatas.length} facturas validadas seleccionadas`);
  };

  const limpiarSeleccion = () => {
    setFacturasSeleccionadas([]);
  };

  const handleRegistrarPago = (factura: any) => {
    if (factura.estado !== 'validada_por_sede') {
        toast.warning("Solo se pueden pagar facturas validadas por la sede operativa");
        return;
    }
    setFacturaSeleccionada(factura);
    setShowPagoModal(true);
  };

  const handlePagoMasivo = () => {
    if (facturasSeleccionadas.length === 0) {
      toast.error('Selecciona al menos una factura');
      return;
    }
    setShowPagoMasivo(true);
  };

  const procesarPagoMasivo = (datosPago: any) => {
    // Aquí se procesaría el pago masivo
    console.log('Procesando pago masivo:', {
      facturas: facturasParaPago,
      total: totalSeleccionado,
      ...datosPago
    });
    
    toast.success(`Pago masivo registrado: $${totalSeleccionado.toLocaleString()} por ${facturasSeleccionadas.length} facturas`);
    setShowPagoMasivo(false);
    setFacturasSeleccionadas([]);
  };

  const limpiarFiltros = () => {
    setFiltroFechaInicio('');
    setFiltroFechaFin('');
    setFiltroEstado('todos');
    setFiltroEspecialista('todos');
    setFiltroSede('todos');
  };

  const exportarEstadoCuenta = () => {
    toast.info('Generando PDF del estado de cuenta...');
    console.log('Exportando estado de cuenta con filtros aplicados');
  };

  const filtrosActivos = [
    filtroFechaInicio,
    filtroFechaFin,
    filtroEstado !== 'todos',
    filtroEspecialista !== 'todos',
    filtroSede !== 'todos'
  ].filter(Boolean).length;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navegarA('conciliacion')}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Estado de Cuenta
            </h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              {clinica.nombre}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFiltros(!showFiltros)}
            className={`relative ${
              darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5 mr-2" />
            Filtros
            {filtrosActivos > 0 && (
              <Badge className="ml-2 bg-blue-500 text-white">
                {filtrosActivos}
              </Badge>
            )}
          </Button>

          <Button
            onClick={exportarEstadoCuenta}
            variant="outline"
            className={darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700' : ''}
          >
            <Download className="w-5 h-5 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Panel de Filtros */}
      <AnimatePresence>
        {showFiltros && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Filtros Avanzados
                  </h3>
                  {filtrosActivos > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={limpiarFiltros}
                      className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpiar filtros
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Fecha Inicio */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fecha Inicio
                    </label>
                    <Input
                      type="date"
                      value={filtroFechaInicio}
                      onChange={(e) => setFiltroFechaInicio(e.target.value)}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    />
                  </div>

                  {/* Fecha Fin */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fecha Fin
                    </label>
                    <Input
                      type="date"
                      value={filtroFechaFin}
                      onChange={(e) => setFiltroFechaFin(e.target.value)}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    />
                  </div>

                  {/* Estado */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Estado
                    </label>
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-900 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {estadosFactura.map(estado => (
                        <option key={estado.value} value={estado.value}>
                          {estado.label} ({estado.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Especialista */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Especialista
                    </label>
                    <select
                      value={filtroEspecialista}
                      onChange={(e) => setFiltroEspecialista(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-900 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="todos">Todos los especialistas</option>
                      {especialistasConServicios.map(especialista => (
                        <option key={especialista} value={especialista.toLowerCase()}>
                          {especialista}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sede */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sede
                    </label>
                    <select
                      value={filtroSede}
                      onChange={(e) => setFiltroSede(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-900 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="todos">Todas las sedes</option>
                      {sedes.map(sede => (
                        <option key={sede.id} value={sede.nombre}>
                          {sede.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Resultados del filtro */}
                <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Mostrando <span className="font-bold text-blue-500">{facturasFiltradas.length}</span> de {facturasClinicaExtendidas.length} facturas
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Facturado
                </p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${totalFacturado.toLocaleString()}
                </p>
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {facturasFiltradas.length} facturas
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Pagado
                </p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  ${totalPagado.toLocaleString()}
                </p>
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {totalFacturado > 0 ? Math.round((totalPagado / totalFacturado) * 100) : 0}% del total
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Saldo Pendiente
                </p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  ${totalPendiente.toLocaleString()}
                </p>
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Por cobrar
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desglose por Sede (Vista Corporativa) */}
      {desgloseSedes.length > 0 && (
        <div>
          <h3 className={`font-bold mb-4 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Desglose Financiero por Sede
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {desgloseSedes.map((sede) => (
              <Card key={sede.nombre} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} hover:shadow-lg transition-all`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Building2 className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {sede.nombre}
                      </h4>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {sede.count} facturas procesadas
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Facturado</span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${sede.total.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full" 
                        style={{ width: '100%' }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Pagado</span>
                      <span className="font-bold text-green-500">
                        ${sede.pagado.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Pendiente</span>
                      <span className="font-bold text-red-500">
                        ${sede.pendiente.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Barra de Acciones de Selección Múltiple */}
      <AnimatePresence>
        {facturasSeleccionadas.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-2xl`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {facturasSeleccionadas.length} factura{facturasSeleccionadas.length !== 1 ? 's' : ''} seleccionada{facturasSeleccionadas.length !== 1 ? 's' : ''}
                    </p>
                    <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Total: ${totalSeleccionado.toLocaleString()}
                    </p>
                  </div>

                  <Button
                    onClick={handlePagoMasivo}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    Registrar Pago Masivo
                  </Button>

                  <Button
                    variant="outline"
                    onClick={limpiarSeleccion}
                    className={darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-700' : ''}
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Facturas Detalladas */}
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
              Facturas Detalladas
            </CardTitle>
            <div className="flex items-center gap-2">
              {facturasFiltradas.filter(f => f.estado === 'validada_por_sede').length > 0 && isModoCorporativo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={seleccionarTodas}
                  className={`${darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-700' : ''} border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700`}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Seleccionar validadas para pago
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {facturasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <FileText className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No se encontraron facturas con los filtros aplicados
              </p>
              {filtrosActivos > 0 && (
                <Button
                  variant="outline"
                  onClick={limpiarFiltros}
                  className={`mt-4 ${darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-700' : ''}`}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="p-4 w-12">
                      {/* Checkbox header */}
                    </th>
                    <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Número
                    </th>
                    <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Fecha
                    </th>
                    <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Paciente
                    </th>
                    <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Sede
                    </th>
                    <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Servicios
                    </th>
                    <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total
                    </th>
                    <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Estado
                    </th>
                    <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {facturasFiltradas.map((factura) => {
                    const isSelected = facturasSeleccionadas.includes(factura.id);
                    const isPagada = factura.estado === 'pagada';
                    const isValidada = factura.estado === 'validada_por_sede';

                    return (
                      <motion.tr
                        key={factura.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`border-b ${
                          darkMode ? 'border-gray-700' : 'border-gray-200'
                        } ${
                          isSelected
                            ? darkMode
                              ? 'bg-blue-500/10'
                              : 'bg-blue-50'
                            : darkMode
                            ? 'hover:bg-gray-700/50'
                            : 'hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <td className="p-4">
                          {isValidada && isModoCorporativo && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleFacturaSeleccion(factura.id)}
                              className="w-5 h-5 rounded border-2 border-blue-500 text-blue-500 cursor-pointer"
                            />
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {factura.numero}
                            </span>
                          </div>
                        </td>
                        <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(factura.fecha).toLocaleDateString('es-ES')}
                        </td>
                        <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {factura.paciente}
                        </td>
                        <td className={`p-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {factura.sede}
                        </td>
                        <td className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                          {factura.servicios.length} servicio{factura.servicios.length !== 1 ? 's' : ''}
                        </td>
                        <td className={`p-4 font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${factura.total.toLocaleString()}
                        </td>
                        <td className="p-4">
                          {factura.estado === 'pagada' ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Pagada
                            </Badge>
                          ) : factura.estado === 'validada_por_sede' ? (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Validada (Sede)
                            </Badge>
                          ) : factura.estado === 'enviada' ? (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                              <Clock className="w-3 h-3 mr-1" />
                              Pendiente
                            </Badge>
                          ) : factura.estado === 'vencida' ? (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                              Vencida
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
                              {factura.estado}
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          {isValidada && isModoCorporativo && !isSelected && (
                            <button
                              onClick={() => handleRegistrarPago(factura)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all text-sm"
                            >
                              Pagar
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Pago Individual */}
      <RegistroPagosModal
        isOpen={showPagoModal}
        onClose={() => setShowPagoModal(false)}
        factura={facturaSeleccionada}
      />

      {/* Modal de Pago Masivo */}
      <AnimatePresence>
        {showPagoMasivo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPagoMasivo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-3xl rounded-2xl shadow-2xl ${
                darkMode ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white'
              }`}
            >
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Pago Masivo
                    </h2>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Registrar pago para {facturasSeleccionadas.length} factura{facturasSeleccionadas.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPagoMasivo(false)}
                    className={`p-2 rounded-lg transition-all ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Resumen de Facturas */}
                <div>
                  <h3 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Facturas a Pagar
                  </h3>
                  <div className="space-y-2">
                    {facturasParaPago.map(factura => (
                      <div
                        key={factura.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          darkMode ? 'bg-gray-900' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {factura.numero}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                              {factura.paciente} - {factura.sede}
                            </p>
                          </div>
                        </div>
                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${factura.total.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total a Pagar */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-500/10 border-2 border-blue-500/50' : 'bg-blue-50 border-2 border-blue-200'}`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Total a Pagar
                    </p>
                    <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      ${totalSeleccionado.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Formulario de Pago */}
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Método de Pago
                    </label>
                    <select
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'
                      }`}
                    >
                      <option>Transferencia Bancaria</option>
                      <option>Efectivo</option>
                      <option>Tarjeta de Crédito</option>
                      <option>Tarjeta de Débito</option>
                      <option>Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Referencia de Pago
                    </label>
                    <Input
                      type="text"
                      placeholder="Ej: TRANS-2025-001"
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fecha de Pago
                    </label>
                    <Input
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Notas (Opcional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Agregar notas sobre el pago..."
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex gap-3">
                  <Button
                    onClick={() => procesarPagoMasivo({})}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 text-lg font-bold"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirmar Pago de ${totalSeleccionado.toLocaleString()}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPagoMasivo(false)}
                    className={`${darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-700' : ''}`}
                  >
                    Cancelar
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