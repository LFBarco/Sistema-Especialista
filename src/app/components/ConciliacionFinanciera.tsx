import { useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Search, Filter, FileText, Eye, Zap, CreditCard, X } from 'lucide-react';
import { useApp } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { motion } from 'motion/react';
import { PagosMasivosModal } from './PagosMasivosModal';
import { toast } from 'sonner';

export function ConciliacionFinanciera() {
  const { darkMode, facturas, pagos, navegarA, registrarPagoFactura } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'all' | 'pendiente' | 'conciliado' | 'parcial' | 'con_diferencia'>('all');
  const [showPagosMasivosModal, setShowPagosMasivosModal] = useState(false);

  // Estado para pago individual
  const [showPagoIndividualModal, setShowPagoIndividualModal] = useState(false);
  const [selectedFacturaPago, setSelectedFacturaPago] = useState<any>(null);
  const [datosPago, setDatosPago] = useState({
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
    metodoPago: 'transferencia',
    referencia: '',
    comprobante: ''
  });

  const handleAbrirPago = (conciliacion: any) => {
    setSelectedFacturaPago(conciliacion);
    // Sugerir el monto restante
    setDatosPago({
      monto: conciliacion.diferencia > 0 ? conciliacion.diferencia : 0,
      fecha: new Date().toISOString().split('T')[0],
      metodoPago: 'transferencia',
      referencia: '',
      comprobante: ''
    });
    setShowPagoIndividualModal(true);
  };

  const handleRegistrarPago = () => {
    if (!selectedFacturaPago) return;
    if (datosPago.monto <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    registrarPagoFactura(selectedFacturaPago.facturaNumero, datosPago);
    toast.success('Pago registrado correctamente');
    setShowPagoIndividualModal(false);
    setSelectedFacturaPago(null);
  };

  // Calcular conciliaciones reales basadas en Facturas y Pagos
  const conciliaciones = facturas.map(factura => {
      const pagosFactura = pagos.filter(p => p.facturaId === factura.id);
      const montoPagado = pagosFactura.reduce((sum, p) => sum + p.monto, 0);
      const diferencia = factura.total - montoPagado; // Positivo: falta pago. Negativo: sobra pago.

      let estado: 'pendiente' | 'conciliado' | 'parcial' | 'con_diferencia' = 'pendiente';
      
      if (Math.abs(diferencia) < 0.01) {
          estado = 'conciliado';
      } else if (montoPagado === 0) {
          estado = 'pendiente';
      } else if (montoPagado < factura.total) {
          estado = 'parcial';
      } else {
          estado = 'con_diferencia'; // Sobrepago
      }

      // Si la factura ya está marcada como pagada en el sistema, forzamos conciliado visualmente?
      // Mejor confiar en los cálculos reales.
      if (factura.estado === 'pagada' && estado !== 'conciliado' && estado !== 'con_diferencia') {
           // Fallback si el estado de la factura dice pagada pero los montos no cuadran (no debería pasar)
      }

      return {
          id: parseInt(factura.id), // Asumiendo ID numérico o string
          facturaId: factura.id,
          facturaNumero: factura.numero,
          clinica: factura.clinica,
          montoFactura: factura.total,
          montoPagado: montoPagado,
          diferencia: diferencia,
          estado: estado,
          pagos: pagosFactura,
          fechaEmision: factura.fecha,
          fechaVencimiento: factura.vencimiento,
          fechaConciliacion: estado === 'conciliado' ? pagosFactura[pagosFactura.length - 1]?.fecha : undefined
      };
  });

  // KPIs
  const totalFacturado = conciliaciones.reduce((acc, c) => acc + c.montoFactura, 0);
  const totalRecibido = conciliaciones.reduce((acc, c) => acc + c.montoPagado, 0);
  const totalPendiente = conciliaciones
    .filter(c => c.estado !== 'conciliado')
    .reduce((acc, c) => acc + c.diferencia, 0);
  const totalConciliado = conciliaciones.filter(c => c.estado === 'conciliado').length;
  const totalPendienteConciliacion = conciliaciones.filter(c => c.estado !== 'conciliado').length;

  // Filtrar conciliaciones
  const conciliacionesFiltradas = conciliaciones.filter(c => {
    const matchSearch = c.clinica.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       c.facturaNumero.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterEstado === 'all' || c.estado === filterEstado;
    return matchSearch && matchFilter;
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'conciliado':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Conciliado
          </Badge>
        );
      case 'parcial':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
            <Clock className="w-3 h-3 mr-1" />
            Pago Parcial
          </Badge>
        );
      case 'pendiente':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'con_diferencia':
        return (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
            <AlertCircle className="w-3 h-3 mr-1" />
            Con Diferencia
          </Badge>
        );
      default:
        return null;
    }
  };

  const stats = [
    {
      title: 'Total Facturado',
      value: `S/ ${totalFacturado.toLocaleString()}`,
      icon: FileText,
      color: '#3B82F6',
      bgColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
      change: `${conciliaciones.length} facturas`
    },
    {
      title: 'Total Recibido',
      value: `S/ ${totalRecibido.toLocaleString()}`,
      icon: DollarSign,
      color: '#10B981',
      bgColor: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)',
      change: `${Math.round((totalRecibido / totalFacturado) * 100)}% del total`
    },
    {
      title: 'Pendiente de Pago',
      value: `S/ ${totalPendiente.toLocaleString()}`,
      icon: AlertCircle,
      color: '#EF4444',
      bgColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      change: `${totalPendienteConciliacion} facturas`
    },
    {
      title: 'Tasa de Conciliación',
      value: `${Math.round((totalConciliado / conciliaciones.length) * 100)}%`,
      icon: TrendingUp,
      color: '#8B5CF6',
      bgColor: darkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
      change: `${totalConciliado}/${conciliaciones.length} conciliadas`
    }
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Conciliación Financiera
            </h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Estado de pagos y facturación
            </p>
          </div>
        </div>

        {/* Botón prominente para pagos masivos */}
        <button
          onClick={() => setShowPagosMasivosModal(true)}
          className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
          }}
        >
          <Zap className="w-5 h-5" />
          Pagos Masivos
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
            Registro de Conciliaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Buscar por clínica o factura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
              />
            </div>

            {/* Filter */}
            <div className="sm:w-64 relative">
              <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value as any)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
              >
                <option value="all">Todos los estados</option>
                <option value="conciliado">Conciliado</option>
                <option value="parcial">Pago Parcial</option>
                <option value="pendiente">Pendiente</option>
                <option value="con_diferencia">Con Diferencia</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Factura
                  </th>
                  <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Clínica
                  </th>
                  <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Monto Factura
                  </th>
                  <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Monto Pagado
                  </th>
                  <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Diferencia
                  </th>
                  <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Estado
                  </th>
                  <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Vencimiento
                  </th>
                  <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {conciliacionesFiltradas.map((conciliacion) => (
                  <motion.tr
                    key={conciliacion.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {conciliacion.facturaNumero}
                        </span>
                      </div>
                    </td>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {conciliacion.clinica}
                    </td>
                    <td className={`p-4 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      S/ {conciliacion.montoFactura.toLocaleString()}
                    </td>
                    <td className={`p-4 font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      S/ {conciliacion.montoPagado.toLocaleString()}
                    </td>
                    <td className={`p-4 font-semibold ${
                      conciliacion.diferencia === 0 
                        ? darkMode ? 'text-gray-400' : 'text-gray-600'
                        : conciliacion.diferencia > 0
                          ? darkMode ? 'text-red-400' : 'text-red-600'
                          : darkMode ? 'text-orange-400' : 'text-orange-600'
                    }`}>
                      {conciliacion.diferencia === 0 ? '-' : `S/ ${Math.abs(conciliacion.diferencia).toLocaleString()}`}
                    </td>
                    <td className="p-4">
                      {getEstadoBadge(conciliacion.estado)}
                    </td>
                    <td className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {conciliacion.fechaVencimiento}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {conciliacion.estado !== 'conciliado' && (
                          <button
                            onClick={() => handleAbrirPago(conciliacion)}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode ? 'hover:bg-green-900/30 text-green-400' : 'hover:bg-green-100 text-green-600'
                            }`}
                            title="Registrar Pago"
                          >
                            <CreditCard className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => navegarA('estado-cuenta', { clinica: conciliacion.clinica })}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                          }`}
                          title="Ver Detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {conciliacionesFiltradas.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No se encontraron conciliaciones
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert de diferencias */}
      {conciliaciones.some(c => c.estado === 'con_diferencia') && (
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${
          darkMode ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'
        }`}>
          <AlertCircle className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
          <div>
            <p className={`text-sm font-medium ${darkMode ? 'text-orange-300' : 'text-orange-800'}`}>
              Atención: Se detectaron diferencias en pagos
            </p>
            <p className={`text-sm ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>
              Hay facturas con pagos que no coinciden con el monto facturado. Revisa los detalles para resolver.
            </p>
          </div>
        </div>
      )}

      {/* Modal de pagos masivos */}
      <PagosMasivosModal
        isOpen={showPagosMasivosModal}
        onClose={() => setShowPagosMasivosModal(false)}
      />

      {/* Modal de Pago Individual */}
      {showPagoIndividualModal && selectedFacturaPago && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Registrar Pago - {selectedFacturaPago.facturaNumero}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPagoIndividualModal(false)}
                  className={darkMode ? 'text-gray-400 hover:text-white' : ''}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-sm space-y-1`}>
                <div className="flex justify-between">
                   <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Monto Factura:</span>
                   <span className="font-semibold">S/ {selectedFacturaPago.montoFactura.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                   <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Pagado:</span>
                   <span className="font-semibold text-green-500">S/ {selectedFacturaPago.montoPagado.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                   <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Pendiente:</span>
                   <span className="font-bold text-red-500">S/ {selectedFacturaPago.diferencia.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className={darkMode ? 'text-gray-300' : ''}>Monto a Pagar</Label>
                  <div className="relative mt-1">
                    <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <Input
                      type="number"
                      value={datosPago.monto}
                      onChange={(e) => setDatosPago({ ...datosPago, monto: parseFloat(e.target.value) || 0 })}
                      className={`pl-9 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}`}
                    />
                  </div>
                </div>

                <div>
                  <Label className={darkMode ? 'text-gray-300' : ''}>Fecha de Pago</Label>
                  <Input
                    type="date"
                    value={datosPago.fecha}
                    onChange={(e) => setDatosPago({ ...datosPago, fecha: e.target.value })}
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>

                <div>
                  <Label className={darkMode ? 'text-gray-300' : ''}>Método de Pago</Label>
                  <Select 
                    value={datosPago.metodoPago} 
                    onValueChange={(value) => setDatosPago({ ...datosPago, metodoPago: value })}
                  >
                    <SelectTrigger className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className={darkMode ? 'text-gray-300' : ''}>Referencia / # Transacción</Label>
                  <Input
                    value={datosPago.referencia}
                    onChange={(e) => setDatosPago({ ...datosPago, referencia: e.target.value })}
                    placeholder="Ej. SPEI-123456"
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPagoIndividualModal(false)}
                  className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-900' : ''}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleRegistrarPago}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={datosPago.monto <= 0}
                >
                  Registrar Pago
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}