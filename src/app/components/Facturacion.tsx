import { useState } from 'react';
import { FileText, Download, Send, Eye, Plus, Printer, Settings, Mail, CheckCircle, Building2, User, Calendar, DollarSign, X } from 'lucide-react';
import { useApp } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ClinicaFilter, getClinicaColor } from './ClinicaFilter';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import jsPDF from 'jspdf';

interface ConfiguracionFiscal {
  nombreEmpresa: string;
  nif: string;
  direccionFiscal: string;
  ciudad: string;
  codigoPostal: string;
  telefono: string;
  email: string;
  web?: string;
  terminosCondiciones: string;
  notasPago: string;
}

export function Facturacion() {
  const { servicios, facturas, generarFactura, userClinicas, getClinicaByNombre, darkMode, usuarioActual } = useApp();
  const [selectedClinica, setSelectedClinica] = useState('todas');
  const [mostrarNuevaFactura, setMostrarNuevaFactura] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<any | null>(null);
  const [mostrarModalEmail, setMostrarModalEmail] = useState(false);
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [generandoFacturaId, setGenerandoFacturaId] = useState<number | null>(null);

  // Servicios pendientes de facturación
  const serviciosPendientes = servicios.filter(s => {
    // Filtrar por clínica si está seleccionada
    if (selectedClinica !== 'todas') {
      const clinica = getClinicaByNombre(s.clinica);
      if (clinica?.id !== selectedClinica) return false;
    }
    // Solo mostrar servicios completados que no tienen factura asociada
    return s.estado === 'completado' && !s.facturaId;
  });

  const handleGenerarFactura = async (servicioId: number) => {
    setGenerandoFacturaId(servicioId);
    await generarFactura(servicioId);
    setGenerandoFacturaId(null);
  };


  // Configuración fiscal (se carga desde la base de datos al guardar)
  const [configuracionFiscal, setConfiguracionFiscal] = useState<ConfiguracionFiscal>({
    nombreEmpresa: usuarioActual?.nombre || '',
    nif: '',
    direccionFiscal: '',
    ciudad: '',
    codigoPostal: '',
    telefono: '',
    email: '',
    web: '',
    terminosCondiciones: '',
    notasPago: ''
  });

  // Modal de envío de email
  const [emailData, setEmailData] = useState({
    destinatario: '',
    asunto: '',
    mensaje: ''
  });

  const estadoColors = {
    borrador: { 
      bg: darkMode ? 'bg-gray-900/50' : 'bg-gray-200', 
      text: darkMode ? 'text-gray-400' : 'text-gray-600', 
      border: darkMode ? 'border-gray-700' : 'border-gray-300', 
      label: 'Borrador' 
    },
    enviada: { 
      bg: darkMode ? 'bg-blue-900/50' : 'bg-blue-100', 
      text: darkMode ? 'text-blue-400' : 'text-blue-600', 
      border: darkMode ? 'border-blue-700' : 'border-blue-300', 
      label: 'Enviada' 
    },
    pagada: { 
      bg: darkMode ? 'bg-green-900/50' : 'bg-green-100', 
      text: darkMode ? 'text-green-400' : 'text-green-600', 
      border: darkMode ? 'border-green-700' : 'border-green-300', 
      label: 'Pagada' 
    },
    vencida: { 
      bg: darkMode ? 'bg-red-900/50' : 'bg-red-100', 
      text: darkMode ? 'text-red-400' : 'text-red-600', 
      border: darkMode ? 'border-red-700' : 'border-red-300', 
      label: 'Vencida' 
    }
  };

  const facturasFiltradas = facturas.filter(f => {
    if (selectedClinica === 'todas') return true;
    const clinica = getClinicaByNombre(f.clinica);
    return clinica?.id === selectedClinica;
  });

  const totalFacturado = facturasFiltradas.reduce((acc, f) => acc + f.total, 0);
  const totalPagado = facturasFiltradas.filter(f => f.estado === 'pagada').reduce((acc, f) => acc + f.total, 0);
  const totalPendiente = totalFacturado - totalPagado;

  // Función para generar PDF
  const generarPDF = (factura: any) => {
    const doc = new jsPDF();
    
    // Configuración de colores
    const primaryColor = '#F97316';
    const textDark = '#1F2937';
    const textGray = '#6B7280';

    // Header con logo/nombre
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(configuracionFiscal.nombreEmpresa, 15, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Cardiología Veterinaria Especializada', 15, 28);

    // Información de la factura (derecha)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA', 160, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(factura.numero, 160, 28);

    // Datos fiscales del emisor
    doc.setTextColor(textDark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let y = 55;
    doc.text('EMISOR:', 15, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(configuracionFiscal.nombreEmpresa, 15, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGray);
    doc.text(`NIF: ${configuracionFiscal.nif}`, 15, y);
    y += 4;
    doc.text(configuracionFiscal.direccionFiscal, 15, y);
    y += 4;
    doc.text(`${configuracionFiscal.ciudad}, ${configuracionFiscal.codigoPostal}`, 15, y);
    y += 4;
    doc.text(`Tel: ${configuracionFiscal.telefono}`, 15, y);
    y += 4;
    doc.text(configuracionFiscal.email, 15, y);

    // Datos del cliente
    doc.setTextColor(textDark);
    y = 55;
    doc.setFont('helvetica', 'normal');
    doc.text('CLIENTE:', 120, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(factura.clinica, 120, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGray);
    doc.text(`Fecha: ${new Date(factura.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, 120, y);
    y += 4;
    doc.text(`Vencimiento: ${new Date(factura.vencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, 120, y);

    // Tabla de servicios
    y = 105;
    
    // Header de tabla
    doc.setFillColor(249, 115, 22);
    doc.rect(15, y, 180, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPCIÓN', 20, y + 5);
    doc.text('CANT.', 130, y + 5);
    doc.text('PRECIO', 150, y + 5);
    doc.text('TOTAL', 175, y + 5);

    // Servicios
    y += 12;
    doc.setTextColor(textDark);
    doc.setFont('helvetica', 'normal');
    
    factura.servicios.forEach((servicio: any) => {
      doc.text(servicio.descripcion, 20, y, { maxWidth: 100 });
      doc.text(servicio.cantidad.toString(), 133, y);
      doc.text(`$${servicio.precioUnitario.toLocaleString()}`, 150, y);
      doc.text(`$${(servicio.cantidad * servicio.precioUnitario).toLocaleString()}`, 175, y);
      y += 8;
    });

    // Línea separadora
    y += 5;
    doc.setDrawColor(220, 220, 220);
    doc.line(15, y, 195, y);

    // Totales
    y += 10;
    doc.setTextColor(textGray);
    doc.setFontSize(10);
    doc.text('Subtotal:', 150, y);
    doc.text(`$${factura.subtotal.toLocaleString()}`, 180, y, { align: 'right' });
    
    y += 6;
    doc.text('Impuestos:', 150, y);
    doc.text(`$${factura.impuestos.toLocaleString()}`, 180, y, { align: 'right' });
    
    y += 10;
    doc.setFillColor(249, 115, 22);
    doc.rect(145, y - 5, 50, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', 150, y + 2);
    doc.text(`$${factura.total.toLocaleString()}`, 185, y + 2, { align: 'right' });

    // Notas de pago
    y += 20;
    doc.setTextColor(textGray);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DE PAGO:', 15, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    const notasLineas = doc.splitTextToSize(configuracionFiscal.notasPago, 180);
    doc.text(notasLineas, 15, y);
    
    // Términos y condiciones
    y += notasLineas.length * 4 + 6;
    doc.setFont('helvetica', 'bold');
    doc.text('TÉRMINOS Y CONDICIONES:', 15, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    const terminosLineas = doc.splitTextToSize(configuracionFiscal.terminosCondiciones, 180);
    doc.text(terminosLineas, 15, y);

    // Footer
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('VetSpecialist - Sistema de Gestión para Veterinarios Especialistas', 105, 291, { align: 'center' });

    // Descargar
    doc.save(`${factura.numero}.pdf`);
    toast.success('PDF generado correctamente');
  };

  // Función para abrir modal de email
  const abrirModalEmail = (factura: any) => {
    const clinica = getClinicaByNombre(factura.clinica);
    setFacturaSeleccionada(factura);
    setEmailData({
      destinatario: clinica?.email || '',
      asunto: `Factura ${factura.numero} - ${configuracionFiscal.nombreEmpresa}`,
      mensaje: `Estimado/a,\n\nAdjunto encontrará la factura ${factura.numero} correspondiente a los servicios veterinarios prestados.\n\nDetalles de la factura:\n- Fecha: ${new Date(factura.fecha).toLocaleDateString('es-ES')}\n- Total: $${factura.total.toLocaleString()}\n- Vencimiento: ${new Date(factura.vencimiento).toLocaleDateString('es-ES')}\n\nQuedo atento a cualquier consulta.\n\nSaludos cordiales,\n${configuracionFiscal.nombreEmpresa}`
    });
    setMostrarModalEmail(true);
  };

  // Función para enviar email (simulada)
  const enviarEmail = () => {
    // En producción, aquí se haría la llamada al backend para enviar el email
    toast.success(`Factura ${facturaSeleccionada?.numero} enviada a ${emailData.destinatario}`);
    setMostrarModalEmail(false);
    setFacturaSeleccionada(null);
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-3`}>
              <div 
                className="p-3 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                  boxShadow: '0 4px 12px -2px rgba(249, 115, 22, 0.4)'
                }}
              >
                <FileText className="w-8 h-8 text-white" />
              </div>
              Facturación
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Genera y gestiona tus facturas profesionales
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setMostrarConfig(true)}
              variant="outline"
              className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : ''}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
            <Button
              onClick={() => setMostrarNuevaFactura(true)}
              style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}
              className="text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Factura
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Facturado</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${totalFacturado.toLocaleString()}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  {facturasFiltradas.length} facturas
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)' }}>
                <FileText className="w-6 h-6" style={{ color: '#F97316' }} />
              </div>
            </div>
          </Card>

          <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Cobrado</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${totalPagado.toLocaleString()}
                </p>
                <p className={`text-sm text-green-500 mt-1`}>
                  {totalFacturado > 0 ? Math.round((totalPagado / totalFacturado) * 100) : 0}% del total
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                <CheckCircle className="w-6 h-6" style={{ color: '#10B981' }} />
              </div>
            </div>
          </Card>

          <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pendiente de Cobro</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${totalPendiente.toLocaleString()}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  {facturasFiltradas.filter(f => f.estado !== 'pagada').length} facturas
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)' }}>
                <DollarSign className="w-6 h-6" style={{ color: '#EAB308' }} />
              </div>
            </div>
          </Card>
        </div>

        {/* Filtro de Clínicas */}
        <Card className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 block`}>
            Filtrar por clínica:
          </label>
          <ClinicaFilter
            clinicas={userClinicas}
            selectedClinica={selectedClinica}
            onSelectClinica={setSelectedClinica}
          />
        </Card>

        {/* Servicios Pendientes de Facturación */}
        {serviciosPendientes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`p-6 mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  Servicios Pendientes de Facturar ({serviciosPendientes.length})
                </h2>
                <Badge variant="outline" className={`${darkMode ? 'text-blue-400 border-blue-400' : 'text-blue-600 border-blue-600'}`}>
                  Por facturar: ${serviciosPendientes.reduce((acc, s) => acc + s.tarifa, 0).toLocaleString()}
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Fecha</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Clínica</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Servicio / Paciente</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Monto</th>
                      <th className={`px-6 py-3 text-right text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Acción</th>
                    </tr>
                  </thead>
                  <tbody className={`${darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}`}>
                    {serviciosPendientes.map((servicio) => (
                      <tr key={servicio.id} className={`${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'} transition-colors`}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(servicio.fecha).toLocaleDateString('es-ES')}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          <div className="flex items-center gap-2">
                            {(() => {
                               const clinica = getClinicaByNombre(servicio.clinica);
                               return clinica ? <div className={`w-2 h-2 rounded-full ${getClinicaColor(clinica.color)}`} /> : null;
                            })()}
                            {servicio.clinica}
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <div className="font-medium">{servicio.tipo}</div>
                          <div className="text-xs opacity-70">{servicio.paciente} ({servicio.especie})</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          ${servicio.tarifa.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button 
                            onClick={() => handleGenerarFactura(servicio.id)}
                            disabled={generandoFacturaId === servicio.id}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          >
                            {generandoFacturaId === servicio.id ? (
                              <>
                                <span className="animate-spin mr-2">⏳</span> Generando...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" /> Generar Factura
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Facturas Table */}
        <Card className={`overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>
                    Número
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>
                    Clínica
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>
                    Fecha
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>
                    Vencimiento
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>
                    Total
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>
                    Estado
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}`}>
                {facturasFiltradas.map((factura) => {
                  const estado = estadoColors[factura.estado];
                  const clinica = getClinicaByNombre(factura.clinica);
                  
                  return (
                    <tr 
                      key={factura.id} 
                      className={`${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'} transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          <FileText className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          {factura.numero}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {clinica && (
                            <div className={`w-3 h-3 rounded-full ${getClinicaColor(clinica.color)} mr-2`} />
                          )}
                          {factura.clinica}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(factura.fecha).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(factura.vencimiento).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          ${factura.total.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={`${estado.bg} ${estado.text} border ${estado.border}`}
                        >
                          {estado.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setFacturaSeleccionada(factura)}
                            className={darkMode ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-600 hover:bg-blue-50'}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => generarPDF(factura)}
                            className={darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {factura.estado !== 'pagada' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => abrirModalEmail(factura)}
                              className={darkMode ? 'text-green-400 hover:bg-green-900/30' : 'text-green-600 hover:bg-green-50'}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal Vista Previa */}
      <AnimatePresence>
        {facturaSeleccionada && !mostrarModalEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}
            >
              {/* Header del Modal */}
              <div className={`p-6 ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'} flex items-center justify-between`}>
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Vista Previa - {facturaSeleccionada.numero}
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    Revisa el documento antes de enviar
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFacturaSeleccionada(null)}
                  className={darkMode ? 'text-gray-400 hover:text-gray-300' : ''}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Contenido de la Factura */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className={`border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} rounded-lg p-12 shadow-2xl`}>
                  
                  {/* Header Profesional */}
                  <div className="flex items-start justify-between mb-12 pb-8 border-b-2" style={{ borderColor: '#F97316' }}>
                    <div>
                      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {configuracionFiscal.nombreEmpresa}
                      </h1>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                        Cardiología Veterinaria Especializada
                      </p>
                      <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-4 space-y-1`}>
                        <p>NIF: {configuracionFiscal.nif}</p>
                        <p>{configuracionFiscal.direccionFiscal}</p>
                        <p>{configuracionFiscal.ciudad}, {configuracionFiscal.codigoPostal}</p>
                        <p>{configuracionFiscal.telefono}</p>
                        <p>{configuracionFiscal.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-block px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)' }}>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Factura
                        </p>
                        <p className="text-2xl font-bold" style={{ color: '#F97316' }}>
                          {facturaSeleccionada.numero}
                        </p>
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-4 space-y-1`}>
                        <p><strong>Fecha:</strong> {new Date(facturaSeleccionada.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        <p><strong>Vencimiento:</strong> {new Date(facturaSeleccionada.vencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cliente */}
                  <div className="mb-8">
                    <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
                      Facturado a:
                    </p>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {facturaSeleccionada.clinica}
                      </p>
                    </div>
                  </div>

                  {/* Tabla de Servicios */}
                  <table className="w-full mb-8">
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: '#F97316' }}>
                        <th className={`text-left py-3 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Descripción del Servicio
                        </th>
                        <th className={`text-center py-3 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Cant.
                        </th>
                        <th className={`text-right py-3 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Precio Unit.
                        </th>
                        <th className={`text-right py-3 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {facturaSeleccionada.servicios.map((servicio: any, index: number) => (
                        <tr key={index} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className={`py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {servicio.descripcion}
                          </td>
                          <td className={`py-4 text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {servicio.cantidad}
                          </td>
                          <td className={`py-4 text-sm text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            ${servicio.precioUnitario.toLocaleString()}
                          </td>
                          <td className={`py-4 text-sm text-right font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            ${(servicio.cantidad * servicio.precioUnitario).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totales */}
                  <div className="flex justify-end mb-8">
                    <div className="w-80">
                      <div className={`space-y-3 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Subtotal:</span>
                          <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            ${facturaSeleccionada.subtotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Impuestos (0%):</span>
                          <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            ${facturaSeleccionada.impuestos.toLocaleString()}
                          </span>
                        </div>
                        <div className="pt-3 border-t-2" style={{ borderColor: '#F97316' }}>
                          <div className="flex justify-between">
                            <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              TOTAL:
                            </span>
                            <span className="text-2xl font-bold" style={{ color: '#F97316' }}>
                              ${facturaSeleccionada.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información de Pago */}
                  <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                      Información de Pago
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                      {configuracionFiscal.notasPago}
                    </p>
                  </div>

                  {/* Términos y Condiciones */}
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    <p className="font-semibold mb-2">Términos y Condiciones:</p>
                    <p className="leading-relaxed">{configuracionFiscal.terminosCondiciones}</p>
                  </div>

                  {/* Footer */}
                  <div className="mt-12 pt-6 border-t" style={{ borderColor: '#F97316' }}>
                    <p className={`text-center text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Gracias por confiar en nuestros servicios profesionales
                    </p>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className={`p-6 ${darkMode ? 'border-t border-gray-700 bg-gray-850' : 'border-t border-gray-200 bg-gray-50'} flex items-center justify-end space-x-3`}>
                <Button
                  variant="outline"
                  onClick={() => setFacturaSeleccionada(null)}
                  className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : ''}
                >
                  Cerrar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : ''}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button
                  onClick={() => generarPDF(facturaSeleccionada)}
                  style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}
                  className="text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar PDF
                </Button>
                {facturaSeleccionada.estado !== 'pagada' && (
                  <Button
                    onClick={() => abrirModalEmail(facturaSeleccionada)}
                    style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                    className="text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar por Email
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Envío por Email */}
      <AnimatePresence>
        {mostrarModalEmail && facturaSeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border rounded-xl max-w-2xl w-full`}
            >
              <div className={`p-6 ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Enviar Factura por Email
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {facturaSeleccionada.numero} - {facturaSeleccionada.clinica}
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Destinatario
                  </Label>
                  <Input
                    type="email"
                    value={emailData.destinatario}
                    onChange={(e) => setEmailData({...emailData, destinatario: e.target.value})}
                    placeholder="email@clinica.com"
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>

                <div>
                  <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Asunto
                  </Label>
                  <Input
                    value={emailData.asunto}
                    onChange={(e) => setEmailData({...emailData, asunto: e.target.value})}
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>

                <div>
                  <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Mensaje
                  </Label>
                  <Textarea
                    value={emailData.mensaje}
                    onChange={(e) => setEmailData({...emailData, mensaje: e.target.value})}
                    rows={8}
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>

                <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                  <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                    📎 Se adjuntará automáticamente: {facturaSeleccionada.numero}.pdf
                  </p>
                </div>
              </div>

              <div className={`p-6 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'} flex justify-end gap-3`}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMostrarModalEmail(false);
                    setFacturaSeleccionada(null);
                  }}
                  className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-900' : ''}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={enviarEmail}
                  style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                  className="text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Factura
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Configuración Fiscal */}
      <AnimatePresence>
        {mostrarConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}
            >
              <div className={`p-6 ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'} sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} z-10`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Configuración de Facturación
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      Datos fiscales y configuración de facturas
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMostrarConfig(false)}
                    className={darkMode ? 'text-gray-400 hover:text-gray-300' : ''}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Nombre/Razón Social
                    </Label>
                    <Input
                      value={configuracionFiscal.nombreEmpresa}
                      onChange={(e) => setConfiguracionFiscal({...configuracionFiscal, nombreEmpresa: e.target.value})}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    />
                  </div>

                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      NIF/CIF
                    </Label>
                    <Input
                      value={configuracionFiscal.nif}
                      onChange={(e) => setConfiguracionFiscal({...configuracionFiscal, nif: e.target.value})}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Dirección Fiscal
                    </Label>
                    <Input
                      value={configuracionFiscal.direccionFiscal}
                      onChange={(e) => setConfiguracionFiscal({...configuracionFiscal, direccionFiscal: e.target.value})}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    />
                  </div>

                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Ciudad
                    </Label>
                    <Input
                      value={configuracionFiscal.ciudad}
                      onChange={(e) => setConfiguracionFiscal({...configuracionFiscal, ciudad: e.target.value})}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    />
                  </div>

                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Código Postal
                    </Label>
                    <Input
                      value={configuracionFiscal.codigoPostal}
                      onChange={(e) => setConfiguracionFiscal({...configuracionFiscal, codigoPostal: e.target.value})}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    />
                  </div>

                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Teléfono
                    </Label>
                    <Input
                      value={configuracionFiscal.telefono}
                      onChange={(e) => setConfiguracionFiscal({...configuracionFiscal, telefono: e.target.value})}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    />
                  </div>

                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={configuracionFiscal.email}
                      onChange={(e) => setConfiguracionFiscal({...configuracionFiscal, email: e.target.value})}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Información de Pago (Datos bancarios)
                    </Label>
                    <Textarea
                      value={configuracionFiscal.notasPago}
                      onChange={(e) => setConfiguracionFiscal({...configuracionFiscal, notasPago: e.target.value})}
                      rows={3}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Términos y Condiciones
                    </Label>
                    <Textarea
                      value={configuracionFiscal.terminosCondiciones}
                      onChange={(e) => setConfiguracionFiscal({...configuracionFiscal, terminosCondiciones: e.target.value})}
                      rows={4}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    />
                  </div>
                </div>
              </div>

              <div className={`p-6 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'} flex justify-end gap-3`}>
                <Button
                  variant="outline"
                  onClick={() => setMostrarConfig(false)}
                  className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-900' : ''}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    toast.success('Configuración guardada correctamente');
                    setMostrarConfig(false);
                  }}
                  style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}
                  className="text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}