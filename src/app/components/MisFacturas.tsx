import { useState } from 'react';
import { FileText, DollarSign, Clock, Download, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { RegistroPagosModal } from './RegistroPagosModal';

export function MisFacturas() {
  const { darkMode, facturas, navegarA, selectedSedeId, validarFacturaSede } = useApp();
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<any>(null);
  const [filtroEstado, setFiltroEstado] = useState<'all' | 'pendiente' | 'validada' | 'pagada'>('all');

  // Determinar el Rol basado en el contexto de selección
  const isModoSede = selectedSedeId !== 'all';
  const isModoCorporativo = selectedSedeId === 'all';

  // Filtrar facturas por sede primero
  const facturasDeSede = selectedSedeId === 'all' 
    ? facturas 
    : facturas.filter(f => !f.sedeId || f.sedeId === selectedSedeId);

  // Filtrar facturas por estado
  const facturasFiltradas = facturasDeSede.filter(f => {
    if (filtroEstado === 'all') return true;
    if (filtroEstado === 'pagada') return f.estado === 'pagada';
    if (filtroEstado === 'validada') return f.estado === 'validada_por_sede';
    if (filtroEstado === 'pendiente') return f.estado === 'borrador' || f.estado === 'enviada';
    return true;
  });

  // KPIs dinámicos según el rol
  const totalAccionable = facturasDeSede
    .filter(f => {
      if (isModoSede) return f.estado === 'borrador' || f.estado === 'enviada'; // Pendientes de validar
      return f.estado === 'validada_por_sede'; // Pendientes de pago (Corporativo)
    })
    .reduce((acc, f) => acc + f.total, 0);
  
  const totalPagado = facturasDeSede
    .filter(f => f.estado === 'pagada')
    .reduce((acc, f) => acc + f.total, 0);

  const facturasPendientesValidacion = facturasDeSede.filter(f => f.estado === 'borrador' || f.estado === 'enviada').length;
  const facturasListasPago = facturasDeSede.filter(f => f.estado === 'validada_por_sede').length;

  const handleRegistrarPago = (factura: any) => {
    setFacturaSeleccionada(factura);
    setShowPagoModal(true);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pagada':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Pagada
          </Badge>
        );
      case 'validada_por_sede':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Validada (Sede)
          </Badge>
        );
      case 'enviada':
      case 'borrador':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente Validación
          </Badge>
        );
      case 'vencida':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
            <AlertCircle className="w-3 h-3 mr-1" />
            Vencida
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
            {estado}
          </Badge>
        );
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Mis Facturas
            </h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Gestiona tus facturas pendientes
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isModoSede ? 'Por Validar (Operativo)' : 'Por Pagar (Tesorería)'}
                </p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  ${totalAccionable.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
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
                  Pendientes de Validación
                </p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {facturasPendientesValidacion}
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
                  Listas para Pago
                </p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {facturasListasPago}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
              {isModoSede ? 'Gestión Operativa de Facturas' : 'Tesorería Corporativa'}
            </CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltroEstado('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filtroEstado === 'all'
                    ? 'bg-blue-500 text-white'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFiltroEstado('pendiente')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filtroEstado === 'pendiente'
                    ? 'bg-yellow-500 text-white'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Por Validar
              </button>
              <button
                onClick={() => setFiltroEstado('validada')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filtroEstado === 'validada'
                    ? 'bg-purple-500 text-white'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Listas para Pago
              </button>
              <button
                onClick={() => setFiltroEstado('pagada')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filtroEstado === 'pagada'
                    ? 'bg-green-500 text-white'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pagadas
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {facturasFiltradas.map((factura) => (
              <motion.div
                key={factura.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl border ${
                  darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white'
                } transition-all hover:shadow-lg`}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {factura.numero}
                        </h3>
                        {getEstadoBadge(factura.estado)}
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {factura.clinica}
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Emitida: {factura.fecha} • Vencimiento: {factura.vencimiento}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total
                      </p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${factura.total.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navegarA('facturacion')}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Ver detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Descargar"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      
                      {(factura.estado === 'borrador' || factura.estado === 'enviada') && isModoSede && (
                        <button
                          onClick={() => validarFacturaSede(factura.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Validar
                        </button>
                      )}

                      {factura.estado === 'validada_por_sede' && isModoCorporativo && (
                        <button
                          onClick={() => handleRegistrarPago(factura)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          <DollarSign className="w-4 h-4" />
                          Pagar
                        </button>
                      )}

                      {/* Fallback de Pagar para demos: Si estamos en modo corporativo, permitimos pagar directos si es urgente, pero con warning (opcional) */}
                    </div>
                  </div>
                </div>

                {/* Servicios */}
                <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Servicios incluidos:
                  </p>
                  <ul className="space-y-1">
                    {factura.servicios.map((servicio: any, index: number) => (
                      <li
                        key={index}
                        className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        • {servicio.descripcion}
                      </li>
                    ))}
                  </ul>
                  {isModoCorporativo && factura.estado === 'borrador' && (
                    <p className="text-xs text-yellow-500 mt-2 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Requiere validación de sede antes de pagar
                    </p>
                  )}
                </div>
              </motion.div>
            ))}

            {facturasFiltradas.length === 0 && (
              <div className="text-center py-12">
                <FileText className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No hay facturas {
                    filtroEstado === 'all' ? '' : 
                    filtroEstado === 'pendiente' ? 'pendientes de validación' : 
                    filtroEstado === 'validada' ? 'listas para pago' : 'pagadas'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Registro de Pago */}
      <RegistroPagosModal
        isOpen={showPagoModal}
        onClose={() => setShowPagoModal(false)}
        factura={facturaSeleccionada}
      />
    </div>
  );
}