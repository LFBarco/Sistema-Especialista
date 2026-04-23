import { useState, useEffect } from 'react';
import { ArrowLeft, Building2, DollarSign, FileText, Download, Calendar, CheckCircle, Clock, Eye } from 'lucide-react';
import { useApp } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { RegistroPagosModal } from './RegistroPagosModal';
import { storageAPI } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export function EstadoCuentaClinica() {
  const { darkMode, navegarA, facturas, pagos, userClinicas } = useApp();
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<any>(null);
  
  // Obtener clínica del contexto (primera clínica del usuario)
  const clinicaData = userClinicas[0];
  const clinica = {
    nombre: clinicaData?.nombre || '',
    contacto: clinicaData?.contacto || '',
    telefono: clinicaData?.telefono || '',
    direccion: clinicaData?.direccion || '',
    email: clinicaData?.contacto || ''
  };

  // Facturas de la clínica (filtradas)
  const facturasClinica = facturas.filter(f => f.clinica === clinica.nombre);

  // Calcular totales
  const totalFacturado = facturasClinica.reduce((acc, f) => acc + f.total, 0);
  const totalPagado = facturasClinica.filter(f => f.estado === 'pagada').reduce((acc, f) => acc + f.total, 0);
  const totalPendiente = totalFacturado - totalPagado;

  // Filtrar pagos relacionados con las facturas de esta clínica
  const pagosClinica = pagos.filter(p => p.clinica === clinica.nombre);

  const handleRegistrarPago = (factura: any) => {
    setFacturaSeleccionada(factura);
    setShowPagoModal(true);
  };

  const exportarEstadoCuenta = () => {
    try {
      const rows: string[] = [
        `Estado de Cuenta - ${clinica.nombre || 'Todas las Clínicas'}`,
        `Generado: ${new Date().toLocaleDateString('es-MX')}`,
        '',
        'RESUMEN FINANCIERO',
        `Total Facturado,$${totalFacturado.toLocaleString()}`,
        `Total Pagado,$${totalPagado.toLocaleString()}`,
        `Saldo Pendiente,$${totalPendiente.toLocaleString()}`,
        '',
        'DETALLE DE FACTURAS',
        'Número,Fecha,Vencimiento,Clínica,Estado,Subtotal,Impuestos,Total',
        ...facturasClinica.map(f =>
          `${f.numero},${f.fecha},${f.vencimiento},${f.clinica},${f.estado},$${f.subtotal},$${f.impuestos},$${f.total}`
        ),
        '',
        'HISTORIAL DE PAGOS',
        'Fecha,Clínica,Monto,Método,Referencia,Estado',
        ...pagosClinica.map(p =>
          `${p.fecha},${p.clinica},$${p.monto},${p.metodoPago},${p.referencia},${p.estado}`
        ),
      ];

      const csvContent = rows.join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `estado_cuenta_${(clinica.nombre || 'general').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Estado de cuenta exportado (${facturasClinica.length} facturas, ${pagosClinica.length} pagos)`);
    } catch (error) {
      console.error('Error al exportar estado de cuenta:', error);
      toast.error('Error al exportar el estado de cuenta');
    }
  };

  const verComprobante = async (path: string) => {
    try {
        const { url } = await storageAPI.getSignedUrl('comprobantes', path);
        if (url) {
            window.open(url, '_blank');
        } else {
            toast.error('No se pudo obtener el enlace del comprobante');
        }
    } catch (error) {
        console.error("Error al obtener URL del comprobante:", error);
        toast.error('Error al abrir el comprobante');
    }
  };

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

        <button
          onClick={exportarEstadoCuenta}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
            darkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Download className="w-5 h-5" />
          Exportar CSV
        </button>
      </div>

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
                  {facturasClinica.length} facturas
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
                  {Math.round((totalPagado / totalFacturado) * 100)}% del total
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

      {/* Facturas Detalladas */}
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
            Facturas Detalladas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Número
                  </th>
                  <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Fecha Emisión
                  </th>
                  <th className={`text-left p-4 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Vencimiento
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
                {facturasClinica.map((factura) => (
                  <motion.tr
                    key={factura.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {factura.numero}
                        </span>
                      </div>
                    </td>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {factura.fecha}
                    </td>
                    <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {factura.vencimiento}
                    </td>
                    <td className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                      {factura.servicios.map(s => s.descripcion).join(', ')}
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
                      ) : factura.estado === 'enviada' ? (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendiente
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
                          {factura.estado}
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      {factura.estado !== 'pagada' && (
                        <button
                          onClick={() => handleRegistrarPago(factura)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all"
                        >
                          Registrar Pago
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Historial de Pagos */}
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
            Historial de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pagosClinica.map((pago) => {
              // Encontrar número de factura si no está en el objeto pago (depende de cómo se guarde)
              const factura = facturas.find(f => f.id === pago.facturaId);
              const numeroFactura = factura ? factura.numero : 'Desconocida';

              return (
              <div
                key={pago.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Pago - {numeroFactura}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {pago.metodoPago} • Ref: {pago.referencia}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ${pago.monto.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {pago.fecha}
                    </p>
                    {pago.comprobante && (
                        <button 
                            onClick={() => verComprobante(pago.comprobante!)}
                            className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Ver Comprobante"
                        >
                            <Eye className="w-4 h-4 text-blue-500" />
                        </button>
                    )}
                  </div>
                </div>
              </div>
            )})}

            {pagosClinica.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No hay pagos registrados aún
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