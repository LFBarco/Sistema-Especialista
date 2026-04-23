import { useState, useEffect } from 'react';
import { FileText, Download, Send, Eye, Plus, Printer, Settings, Mail, CheckCircle, Building2, User, Calendar, DollarSign, X, RefreshCw, Percent, Globe, TrendingUp, Clock, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { useApp } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ClinicaFilter, getClinicaColor } from './ClinicaFilter';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import jsPDF from 'jspdf';
import * as API from '../utils/api';

// Interfaces
interface ConfiguracionFiscal {
  nombreEmpresa: string;
  nif: string;
  direccionFiscal: string;
  ciudad: string;
  codigoPostal: string;
  pais: string;
  telefono: string;
  email: string;
  web?: string;
  logoUrl?: string;
  terminosCondiciones: string;
  notasPago: string;
  moneda: 'USD' | 'EUR' | 'COP' | 'MXN' | 'ARS';
  simboloMoneda: string;
}

interface SerieFacturacion {
  id: number;
  clinicaId: string;
  clinicaNombre: string;
  prefijo: string;
  siguienteNumero: number;
  activa: boolean;
}

interface FacturacionRecurrente {
  id: number;
  clinicaId: string;
  clinicaNombre: string;
  concepto: string;
  monto: number;
  frecuencia: 'semanal' | 'quincenal' | 'mensual' | 'trimestral';
  diaGeneracion: number;
  activa: boolean;
  proximaFactura: string;
  servicios: {
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
  }[];
}

interface Descuento {
  id: number;
  clinicaId: string;
  clinicaNombre: string;
  nombre: string;
  tipo: 'porcentaje' | 'fijo' | 'volumen';
  valor: number;
  condicion: string;
  serviciosMinimos?: number;
  montoMinimo?: number;
  activo: boolean;
}

const MONEDAS = [
  { codigo: 'USD', nombre: 'Dólar (USD)', simbolo: '$' },
  { codigo: 'EUR', nombre: 'Euro (EUR)', simbolo: '€' },
  { codigo: 'COP', nombre: 'Peso Colombiano (COP)', simbolo: '$' },
  { codigo: 'MXN', nombre: 'Peso Mexicano (MXN)', simbolo: '$' },
  { codigo: 'ARS', nombre: 'Peso Argentino (ARS)', simbolo: '$' },
];

export function FacturacionEnterpriseV2() {
  const { facturas, servicios, generarFactura, userClinicas, getClinicaByNombre, darkMode, usuarioActual } = useApp();
  const [selectedClinica, setSelectedClinica] = useState('todas');
  const [activeTab, setActiveTab] = useState('facturas'); // Nueva pestaña
  const [mostrarNuevaFactura, setMostrarNuevaFactura] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<any | null>(null);
  const [mostrarModalEmail, setMostrarModalEmail] = useState(false);
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [tabConfigActual, setTabConfigActual] = useState('fiscal');
  const [itemsSeleccionados, setItemsSeleccionados] = useState<number[]>([]); // IDs de servicios seleccionados para facturar
  const [generandoFacturaId, setGenerandoFacturaId] = useState<number | null>(null);

  // Servicios pendientes de facturación
  const serviciosPorFacturar = servicios.filter(s => 
    s.estado === 'completado' && 
    !s.facturaId && 
    (selectedClinica === 'todas' || getClinicaByNombre(s.clinica)?.id === selectedClinica)
  );

  const handleGenerarFactura = async (servicioId: number) => {
    setGenerandoFacturaId(servicioId);
    await generarFactura(servicioId);
    setGenerandoFacturaId(null);
    toast.success('Factura generada y vinculada correctamente');
  };

  const totalPorFacturar = serviciosPorFacturar.reduce((acc, s) => acc + (s.tarifa || 0), 0);

  // Función para generar PDF
  const generarPDF = (factura: any) => {
    const doc = new jsPDF();
    
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

    // Información de la factura
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
    doc.text(configuracionFiscal.pais, 15, y);
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
    y += 4;
    doc.text(`Moneda: ${configuracionFiscal.moneda}`, 120, y);

    // Tabla de servicios
    y = 110;
    
    doc.setFillColor(249, 115, 22);
    doc.rect(15, y, 180, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPCIÓN', 20, y + 5);
    doc.text('CANT.', 130, y + 5);
    doc.text('PRECIO', 150, y + 5);
    doc.text('TOTAL', 175, y + 5);

    y += 12;
    doc.setTextColor(textDark);
    doc.setFont('helvetica', 'normal');
    
    factura.servicios.forEach((servicio: any) => {
      doc.text(servicio.descripcion, 20, y, { maxWidth: 100 });
      doc.text(servicio.cantidad.toString(), 133, y);
      doc.text(`${configuracionFiscal.simboloMoneda}${servicio.precioUnitario.toLocaleString()}`, 150, y);
      doc.text(`${configuracionFiscal.simboloMoneda}${(servicio.cantidad * servicio.precioUnitario).toLocaleString()}`, 175, y);
      y += 8;
    });

    y += 5;
    doc.setDrawColor(220, 220, 220);
    doc.line(15, y, 195, y);

    // Totales
    y += 10;
    doc.setTextColor(textGray);
    doc.setFontSize(10);
    doc.text('Subtotal:', 150, y);
    doc.text(`${configuracionFiscal.simboloMoneda}${factura.subtotal.toLocaleString()}`, 180, y, { align: 'right' });
    
    y += 6;
    doc.text('Impuestos:', 150, y);
    doc.text(`${configuracionFiscal.simboloMoneda}${factura.impuestos.toLocaleString()}`, 180, y, { align: 'right' });
    
    y += 10;
    doc.setFillColor(249, 115, 22);
    doc.rect(145, y - 5, 50, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', 150, y + 2);
    doc.text(`${configuracionFiscal.simboloMoneda}${factura.total.toLocaleString()}`, 185, y + 2, { align: 'right' });

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
    doc.text('VetSpecialist - Sistema Enterprise de Gestión Veterinaria', 105, 291, { align: 'center' });

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
      mensaje: `Estimado/a,\n\nAdjunto encontrará la factura ${factura.numero} correspondiente a los servicios veterinarios prestados.\n\nDetalles de la factura:\n- Fecha: ${new Date(factura.fecha).toLocaleDateString('es-ES')}\n- Total: ${configuracionFiscal.simboloMoneda}${factura.total.toLocaleString()}\n- Vencimiento: ${new Date(factura.vencimiento).toLocaleDateString('es-ES')}\n\nQuedo atento a cualquier consulta.\n\nSaludos cordiales,\n${configuracionFiscal.nombreEmpresa}`
    });
    setMostrarModalEmail(true);
  };

  // Función para enviar email
  const enviarEmail = async () => {
    try {
      setCargando(true);
      await API.facturasAPI.enviarEmail(facturaSeleccionada.id, emailData);
      toast.success(`✅ Factura ${facturaSeleccionada?.numero} enviada a ${emailData.destinatario}`);
      setMostrarModalEmail(false);
      setFacturaSeleccionada(null);
    } catch (error) {
      toast.error('Error enviando el email');
      console.error(error);
    } finally {
      setCargando(false);
    }
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
              Facturación Enterprise
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Sistema completo con series, recurrencia y descuentos
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Facturado</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {configuracionFiscal.simboloMoneda}{totalFacturado.toLocaleString()}
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
                  {configuracionFiscal.simboloMoneda}{totalPagado.toLocaleString()}
                </p>
                <p className={`text-sm text-green-500 mt-1`}>
                  {totalFacturado > 0 ? Math.round((totalPagado / totalFacturado) * 100) : 0}% cobrado
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
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pendiente</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {configuracionFiscal.simboloMoneda}{totalPendiente.toLocaleString()}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  {facturasFiltradas.filter(f => f.estado !== 'pagada').length} facturas
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)' }}>
                <Clock className="w-6 h-6" style={{ color: '#EAB308' }} />
              </div>
            </div>
          </Card>

          <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Recurrentes</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {facturacionRecurrente.filter(f => f.activa).length}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  Activas
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)' }}>
                <RefreshCw className="w-6 h-6" style={{ color: '#6366F1' }} />
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

        {/* SECTION: Servicios Pendientes de Facturar (Visible SIEMPRE si hay items) */}
        {serviciosPorFacturar.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`p-6 border-l-4 border-l-blue-500 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                   <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                     <AlertCircle className="w-6 h-6 text-blue-500" />
                     Pendientes de Facturar ({serviciosPorFacturar.length})
                   </h2>
                   <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                     Servicios completados que requieren generación de factura.
                   </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-500">Monto acumulado</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${serviciosPorFacturar.reduce((acc, s) => acc + s.tarifa, 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Fecha</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Clínica</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Servicio</th>
                      <th className={`px-6 py-3 text-right text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Tarifa</th>
                      <th className={`px-6 py-3 text-center text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>Acción</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {serviciosPorFacturar.map((servicio) => (
                      <tr key={servicio.id} className={`${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(servicio.fecha).toLocaleDateString()}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {servicio.clinica}
                        </td>
                        <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <div>{servicio.tipo}</div>
                          <div className="text-xs opacity-70">{servicio.paciente} ({servicio.especie})</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          ${servicio.tarifa.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Button 
                            size="sm"
                            onClick={() => handleGenerarFactura(servicio.id)}
                            disabled={generandoFacturaId === servicio.id}
                            className={`${generandoFacturaId === servicio.id ? 'opacity-70 cursor-not-allowed' : ''} bg-blue-600 hover:bg-blue-700 text-white`}
                          >
                             {generandoFacturaId === servicio.id ? 'Generando...' : 'Generar Factura'}
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

        {/* TABS DE FACTURACIÓN */}
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-4">
           <button
             onClick={() => setActiveTab('facturas')}
             className={`pb-2 px-4 text-sm font-medium transition-colors relative ${
               activeTab === 'facturas' 
                 ? (darkMode ? 'text-white' : 'text-gray-900') 
                 : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')
             }`}
           >
             Facturas Emitidas
             {activeTab === 'facturas' && (
               <motion.div layoutId="activeTabBilling" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
             )}
           </button>
           <button
             onClick={() => setActiveTab('por-facturar')}
             className={`pb-2 px-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${
               activeTab === 'por-facturar' 
                 ? (darkMode ? 'text-white' : 'text-gray-900') 
                 : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')
             }`}
           >
             Pendientes de Facturar
             {serviciosPorFacturar.length > 0 && (
               <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0 h-5 px-1.5 min-w-[20px]">
                 {serviciosPorFacturar.length}
               </Badge>
             )}
             {activeTab === 'por-facturar' && (
               <motion.div layoutId="activeTabBilling" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
             )}
           </button>
        </div>

        {activeTab === 'por-facturar' ? (
          <Card className={`overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
               <div>
                 <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Servicios Realizados (Sin Facturar)</h3>
                 <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                   Selecciona los servicios para generar una factura agrupada.
                 </p>
               </div>
               {itemsSeleccionados.length > 0 && (
                 <Button 
                   onClick={facturarServiciosSeleccionados}
                   className="bg-green-600 hover:bg-green-700 text-white animate-in fade-in zoom-in duration-200"
                 >
                   Generar Factura ({itemsSeleccionados.length})
                 </Button>
               )}
            </div>
            
            {serviciosPorFacturar.length === 0 ? (
               <div className="p-12 text-center">
                 <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                 <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Todo al día</h3>
                 <p className={`text-gray-500`}>No hay servicios pendientes de facturación.</p>
               </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                    <tr>
                      <th className="w-12 px-6 py-3">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Fecha</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Paciente</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Servicio</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Monto</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Detalles</th>
                    </tr>
                  </thead>
                  <tbody className={`${darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}`}>
                    {serviciosPorFacturar.map((servicio) => (
                      <tr 
                        key={servicio.id} 
                        className={`cursor-pointer transition-colors ${
                          itemsSeleccionados.includes(servicio.id) 
                            ? (darkMode ? 'bg-blue-900/20' : 'bg-blue-50') 
                            : (darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50')
                        }`}
                        onClick={() => toggleSeleccionServicio(servicio.id)}
                      >
                        <td className="px-6 py-4">
                          <input 
                            type="checkbox" 
                            checked={itemsSeleccionados.includes(servicio.id)}
                            onChange={() => {}} 
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(servicio.fecha).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{servicio.paciente}</div>
                           <div className="text-xs text-gray-500">{servicio.especie}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <Badge variant="outline" className={darkMode ? 'border-gray-600 text-gray-300' : ''}>
                             {servicio.tipo}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                          {configuracionFiscal.simboloMoneda}{servicio.tarifa?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                          {servicio.notas || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ) : (
          /* Facturas Table (Existing) */
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
                          {configuracionFiscal.simboloMoneda}{factura.total.toLocaleString()}
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
        )}
      </div>

      {/* Modal de Configuración */}
      <AnimatePresence>
        {mostrarConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border rounded-xl max-w-6xl w-full my-8`}
            >
              <div className={`p-6 ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'} sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} z-10`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Configuración Enterprise
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      Gestiona series, descuentos, facturación recurrente y más
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

              <Tabs value={tabConfigActual} onValueChange={setTabConfigActual} className="p-6">
                <TabsList className={`grid w-full grid-cols-5 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                  <TabsTrigger value="fiscal">Datos Fiscales</TabsTrigger>
                  <TabsTrigger value="series">Series</TabsTrigger>
                  <TabsTrigger value="recurrente">Recurrente</TabsTrigger>
                  <TabsTrigger value="descuentos">Descuentos</TabsTrigger>
                  <TabsTrigger value="moneda">Moneda</TabsTrigger>
                </TabsList>

                {/* Tab Datos Fiscales */}
                <TabsContent value="fiscal" className="space-y-4 mt-4">
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
                        País
                      </Label>
                      <Input
                        value={configuracionFiscal.pais}
                        onChange={(e) => setConfiguracionFiscal({...configuracionFiscal, pais: e.target.value})}
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
                        Información de Pago
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
                </TabsContent>

                {/* Tab Series de Facturación */}
                <TabsContent value="series" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Gestiona las series de numeración por clínica
                    </p>
                    <Button size="sm" style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }} className="text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Serie
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {series.map((serie) => (
                      <Card key={serie.id} className={`p-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {serie.prefijo}
                              </p>
                              <Badge className={serie.activa ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}>
                                {serie.activa ? 'Activa' : 'Inactiva'}
                              </Badge>
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                              {serie.clinicaNombre}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                              Siguiente número: {serie.siguienteNumero}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className={darkMode ? 'text-gray-400' : ''}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className={darkMode ? 'text-red-400' : 'text-red-600'}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Tab Facturación Recurrente */}
                <TabsContent value="recurrente" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Configura facturación automática periódica
                    </p>
                    <Button size="sm" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }} className="text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Recurrencia
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {facturacionRecurrente.map((recurrente) => (
                      <Card key={recurrente.id} className={`p-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {recurrente.concepto}
                              </p>
                              <Badge className={recurrente.activa ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-500/20 text-gray-500'}>
                                {recurrente.activa ? 'Activa' : 'Pausada'}
                              </Badge>
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                              {recurrente.clinicaNombre}
                            </p>
                            <div className="flex gap-4 mt-2">
                              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Frecuencia: <span className="capitalize">{recurrente.frecuencia}</span>
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Monto: {configuracionFiscal.simboloMoneda}{recurrente.monto.toLocaleString()}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Próxima: {new Date(recurrente.proximaFactura).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className={darkMode ? 'text-gray-400' : ''}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className={darkMode ? 'text-red-400' : 'text-red-600'}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Tab Descuentos */}
                <TabsContent value="descuentos" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Configura descuentos por volumen y promociones
                    </p>
                    <Button size="sm" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }} className="text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Descuento
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {descuentos.map((descuento) => (
                      <Card key={descuento.id} className={`p-4 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Percent className="w-5 h-5" style={{ color: '#10B981' }} />
                              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {descuento.nombre}
                              </p>
                              <Badge className={descuento.activo ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}>
                                {descuento.activo ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                              {descuento.clinicaNombre}
                            </p>
                            <div className="flex gap-4 mt-2">
                              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Tipo: <span className="capitalize">{descuento.tipo}</span>
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Valor: {descuento.tipo === 'porcentaje' || descuento.tipo === 'volumen' ? `${descuento.valor}%` : `${configuracionFiscal.simboloMoneda}${descuento.valor}`}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Condición: {descuento.condicion}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className={darkMode ? 'text-gray-400' : ''}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className={darkMode ? 'text-red-400' : 'text-red-600'}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Tab Moneda */}
                <TabsContent value="moneda" className="space-y-4 mt-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                    <div className="flex items-start gap-3">
                      <Globe className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                          Configuración Multi-Moneda
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-700'} mt-1`}>
                          Selecciona la moneda principal para tus facturas. Los símbolos y formatos se ajustarán automáticamente.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {MONEDAS.map((moneda) => (
                      <Card
                        key={moneda.codigo}
                        className={`p-4 cursor-pointer transition-all ${
                          configuracionFiscal.moneda === moneda.codigo
                            ? darkMode
                              ? 'bg-orange-900/30 border-orange-500'
                              : 'bg-orange-50 border-orange-300'
                            : darkMode
                            ? 'bg-gray-900 border-gray-700 hover:border-gray-600'
                            : 'bg-white hover:border-gray-400'
                        }`}
                        onClick={() => setConfiguracionFiscal({
                          ...configuracionFiscal,
                          moneda: moneda.codigo as any,
                          simboloMoneda: moneda.simbolo
                        })}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                              style={{
                                background: configuracionFiscal.moneda === moneda.codigo
                                  ? 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)'
                                  : darkMode ? '#374151' : '#E5E7EB',
                                color: configuracionFiscal.moneda === moneda.codigo ? 'white' : darkMode ? '#9CA3AF' : '#6B7280'
                              }}
                            >
                              {moneda.simbolo}
                            </div>
                            <div>
                              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {moneda.nombre}
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Código: {moneda.codigo}
                              </p>
                            </div>
                          </div>
                          {configuracionFiscal.moneda === moneda.codigo && (
                            <CheckCircle className="w-6 h-6" style={{ color: '#F97316' }} />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className={`p-6 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'} flex justify-end gap-3`}>
                <Button
                  variant="outline"
                  onClick={() => setMostrarConfig(false)}
                  className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-900' : ''}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={guardarConfiguracionFiscal}
                  disabled={cargando}
                  style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}
                  className="text-white"
                >
                  {cargando ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Email - Similar al anterior pero con integración real */}
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
                  disabled={cargando}
                  style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                  className="text-white"
                >
                  {cargando ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar Factura
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Vista Previa - Reutilizamos el código anterior */}
      <AnimatePresence>
        {facturaSeleccionada && !mostrarModalEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}
            >
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
                        <p>{configuracionFiscal.pais}</p>
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
                        <p><strong>Moneda:</strong> {configuracionFiscal.moneda}</p>
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
                            {configuracionFiscal.simboloMoneda}{servicio.precioUnitario.toLocaleString()}
                          </td>
                          <td className={`py-4 text-sm text-right font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            {configuracionFiscal.simboloMoneda}{(servicio.cantidad * servicio.precioUnitario).toLocaleString()}
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
                            {configuracionFiscal.simboloMoneda}{facturaSeleccionada.subtotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Impuestos (0%):</span>
                          <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            {configuracionFiscal.simboloMoneda}{facturaSeleccionada.impuestos.toLocaleString()}
                          </span>
                        </div>
                        <div className="pt-3 border-t-2" style={{ borderColor: '#F97316' }}>
                          <div className="flex justify-between">
                            <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              TOTAL:
                            </span>
                            <span className="text-2xl font-bold" style={{ color: '#F97316' }}>
                              {configuracionFiscal.simboloMoneda}{facturaSeleccionada.total.toLocaleString()}
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
    </div>
  );
}
