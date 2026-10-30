import { useEffect, useState } from 'react';
import { FileText, Download, Send, Eye, Plus, Printer, Settings, Mail, CheckCircle, Building2, User, Calendar, DollarSign, X, Shield, Zap, FileCheck, Clock } from 'lucide-react';
import { useApp } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select } from './ui/select';
import { ClinicaFilter, getClinicaColor } from './ClinicaFilter';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { configuracionFiscalAPI } from '../utils/api';

interface ConfiguracionFiscal {
  nombreEmpresa: string;
  nif: string;
  direccionFiscal: string;
  ciudad: string;
  codigoPostal: string;
  telefono: string;
  email: string;
  web?: string;
  logoUrl?: string;
  terminosCondiciones: string;
  notasPago: string;
  // Configuración de facturación electrónica
  facturaElectronicaHabilitada: boolean;
  proveedorFacturacion: 'DIAN' | 'SAT' | 'SRI' | 'SUNAT' | 'Ninguno';
  folioActual: number;
  serieFactura: string;
  certificadoDigital?: string;
  clavePrivada?: string;
}

type EstadoFactura = 'borrador' | 'pre-factura' | 'enviada' | 'factura-electronica' | 'timbrada' | 'pagada' | 'vencida';

const esFacturaElectronica = (factura: any) =>
  factura?.estado === 'factura-electronica' || factura?.estado === 'timbrada' || factura?.tipo === 'electronica';

// Campos que no se guardan en la base de datos.
const CAMPOS_FISCALES_SENSIBLES: (keyof ConfiguracionFiscal)[] = ['certificadoDigital', 'clavePrivada'];

export function FacturacionElectronica() {
  const { servicios, facturas, generarFactura, userClinicas, getClinicaByNombre, darkMode, usuarioActual, especialistas } = useApp();
  const especialidadEmisor = especialistas.find(
    e => !!usuarioActual?.email && e.email?.toLowerCase() === usuarioActual.email.toLowerCase()
  )?.especialidad || 'Especialista Veterinario';
  const [selectedClinica, setSelectedClinica] = useState('todas');
  const [mostrarNuevaFactura, setMostrarNuevaFactura] = useState(false);
  const [tipoFactura, setTipoFactura] = useState<'pre-factura' | 'electronica'>('pre-factura');
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<any | null>(null);
  const [mostrarModalEmail, setMostrarModalEmail] = useState(false);
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [mostrarConfigFactElec, setMostrarConfigFactElec] = useState(false);
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
    notasPago: '',
    // Configuración de facturación electrónica
    facturaElectronicaHabilitada: false,
    proveedorFacturacion: 'Ninguno',
    folioActual: 1,
    serieFactura: 'FE',
    certificadoDigital: '',
    clavePrivada: ''
  });
  const [guardandoConfig, setGuardandoConfig] = useState(false);

  useEffect(() => {
    let activo = true;
    configuracionFiscalAPI.get().then((guardada: any) => {
      if (!activo || !guardada || typeof guardada !== 'object' || Array.isArray(guardada)) return;
      const { userId: _userId, ...datos } = guardada;
      setConfiguracionFiscal(prev => ({ ...prev, ...datos }));
    });
    return () => { activo = false; };
  }, []);

  const guardarConfiguracionFiscal = async (onExito: () => void) => {
    setGuardandoConfig(true);
    try {
      const datos: Partial<ConfiguracionFiscal> = { ...configuracionFiscal };
      CAMPOS_FISCALES_SENSIBLES.forEach(campo => delete datos[campo]);
      await configuracionFiscalAPI.update(datos);
      toast.success('Configuración guardada correctamente');
      onExito();
    } catch (error) {
      console.error('Error guardando configuración fiscal:', error);
      toast.error('No se pudo guardar la configuración. Intenta de nuevo.');
    } finally {
      setGuardandoConfig(false);
    }
  };

  const [emailData, setEmailData] = useState({
    destinatario: '',
    asunto: '',
    mensaje: ''
  });

  const estadoColors: Record<EstadoFactura, any> = {
    borrador: { 
      bg: darkMode ? 'bg-gray-900/50' : 'bg-gray-200', 
      text: darkMode ? 'text-gray-400' : 'text-gray-600', 
      border: darkMode ? 'border-gray-700' : 'border-gray-300', 
      label: 'Borrador',
      icon: Clock
    },
    'pre-factura': { 
      bg: darkMode ? 'bg-purple-900/50' : 'bg-purple-100', 
      text: darkMode ? 'text-purple-400' : 'text-purple-600', 
      border: darkMode ? 'border-purple-700' : 'border-purple-300', 
      label: 'Pre-factura',
      icon: FileText
    },
    enviada: { 
      bg: darkMode ? 'bg-blue-900/50' : 'bg-blue-100', 
      text: darkMode ? 'text-blue-400' : 'text-blue-600', 
      border: darkMode ? 'border-blue-700' : 'border-blue-300', 
      label: 'Enviada',
      icon: Send
    },
    'factura-electronica': { 
      bg: darkMode ? 'bg-cyan-900/50' : 'bg-cyan-100', 
      text: darkMode ? 'text-cyan-400' : 'text-cyan-600', 
      border: darkMode ? 'border-cyan-700' : 'border-cyan-300', 
      label: 'Factura Electrónica',
      icon: Zap
    },
    timbrada: { 
      bg: darkMode ? 'bg-indigo-900/50' : 'bg-indigo-100', 
      text: darkMode ? 'text-indigo-400' : 'text-indigo-600', 
      border: darkMode ? 'border-indigo-700' : 'border-indigo-300', 
      label: 'Timbrada',
      icon: Shield
    },
    pagada: { 
      bg: darkMode ? 'bg-green-900/50' : 'bg-green-100', 
      text: darkMode ? 'text-green-400' : 'text-green-600', 
      border: darkMode ? 'border-green-700' : 'border-green-300', 
      label: 'Pagada',
      icon: CheckCircle
    },
    vencida: { 
      bg: darkMode ? 'bg-red-900/50' : 'bg-red-100', 
      text: darkMode ? 'text-red-400' : 'text-red-600', 
      border: darkMode ? 'border-red-700' : 'border-red-300', 
      label: 'Vencida',
      icon: Clock
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

  // Función para generar PDF de PRE-FACTURA
  const generarPreFacturaPDF = (factura: any) => {
    const doc = new jsPDF();
    
    const primaryColor = '#F97316';
    const textDark = '#1F2937';
    const textGray = '#6B7280';
    const watermarkColor = '#9CA3AF';

    // MARCA DE AGUA "PRE-FACTURA"
    doc.setTextColor(watermarkColor);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
    doc.text('PRE-FACTURA', 105, 150, { 
      align: 'center',
      angle: 45
    });
    doc.restoreGraphicsState();

    // Header con logo/nombre
    doc.setFillColor(147, 51, 234); // Purple para pre-factura
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(configuracionFiscal.nombreEmpresa, 15, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(especialidadEmisor, 15, 28);

    // Información de la pre-factura (derecha)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PRE-FACTURA', 150, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(factura.numero, 150, 28);
    doc.text('(Solo para control interno)', 150, 34);

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
    doc.text(`RUC: ${configuracionFiscal.nif}`, 15, y);
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

    // AVISO DE PRE-FACTURA
    y += 10;
    doc.setFillColor(147, 51, 234, 0.1);
    doc.rect(120, y, 75, 15, 'F');
    doc.setTextColor(147, 51, 234);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠️ DOCUMENTO SIN VALIDEZ FISCAL', 123, y + 5);
    doc.text('Solo para control interno del especialista', 123, y + 10);

    // Tabla de servicios
    y = 115;
    
    // Header de tabla
    doc.setFillColor(147, 51, 234);
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
    
    factura.servicios?.forEach((servicio: any) => {
      doc.text(servicio.descripcion || 'Servicio', 20, y, { maxWidth: 100 });
      doc.text(servicio.cantidad?.toString() || '1', 133, y);
      doc.text(`S/ ${(servicio.precioUnitario || 0).toLocaleString()}`, 150, y);
      doc.text(`S/ ${((servicio.cantidad || 1) * (servicio.precioUnitario || 0)).toLocaleString()}`, 175, y);
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
    doc.text(`S/ ${(factura.subtotal || 0).toLocaleString()}`, 180, y, { align: 'right' });
    
    y += 6;
    doc.text('Impuestos:', 150, y);
    doc.text(`S/ ${(factura.impuestos || 0).toLocaleString()}`, 180, y, { align: 'right' });
    
    y += 10;
    doc.setFillColor(147, 51, 234);
    doc.rect(145, y - 5, 50, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', 150, y + 2);
    doc.text(`S/ ${factura.total.toLocaleString()}`, 185, y + 2, { align: 'right' });

    // Nota de pre-factura
    y += 20;
    doc.setTextColor(147, 51, 234);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTA IMPORTANTE:', 15, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textGray);
    doc.text('Este documento es una PRE-FACTURA y NO tiene validez fiscal. Es solo para control interno del especialista.', 15, y, { maxWidth: 180 });
    doc.text('Para solicitar la factura oficial, contacte con el emisor.', 15, y + 10, { maxWidth: 180 });

    // Footer
    doc.setFillColor(147, 51, 234);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('VetSpecialist - Pre-factura para Control Interno', 105, 291, { align: 'center' });

    // Descargar
    doc.save(`PRE_${factura.numero}.pdf`);
    toast.success('Pre-factura generada correctamente');
  };

  // Función para generar PDF de FACTURA ELECTRÓNICA
  const generarFacturaElectronicaPDF = (factura: any) => {
    const doc = new jsPDF();
    
    const primaryColor = '#F97316';
    const textDark = '#1F2937';
    const textGray = '#6B7280';

    // Header con logo/nombre
    doc.setFillColor(6, 182, 212); // Cyan para factura electrónica
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(configuracionFiscal.nombreEmpresa, 15, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(especialidadEmisor, 15, 28);
    
    // Sello de factura electrónica
    doc.setFillColor(255, 255, 255);
    doc.circle(175, 22, 15, 'F');
    doc.setTextColor(6, 182, 212);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA', 175, 20, { align: 'center' });
    doc.text('ELECTRÓNICA', 175, 24, { align: 'center' });

    // Información de la factura (derecha)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA ELECTRÓNICA', 145, 38);

    // Datos fiscales del emisor
    doc.setTextColor(textDark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let y = 58;
    doc.text('EMISOR:', 15, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(configuracionFiscal.nombreEmpresa, 15, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGray);
    doc.text(`RUC: ${configuracionFiscal.nif}`, 15, y);
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
    y = 58;
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

    // Datos de facturación electrónica
    y += 8;
    doc.setFillColor(6, 182, 212, 0.1);
    doc.rect(120, y, 75, 25, 'F');
    doc.setTextColor(6, 182, 212);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS FISCALES ELECTRÓNICOS', 123, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGray);
    doc.text(`Serie: ${configuracionFiscal.serieFactura}`, 123, y + 9);
    doc.text(`Folio: ${configuracionFiscal.folioActual}`, 123, y + 13);
    doc.text(`UUID: ${generateUUID()}`, 123, y + 17);
    doc.text(`Proveedor: ${configuracionFiscal.proveedorFacturacion}`, 123, y + 21);

    // Tabla de servicios
    y = 115;
    
    // Header de tabla
    doc.setFillColor(6, 182, 212);
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
    
    factura.servicios?.forEach((servicio: any) => {
      doc.text(servicio.descripcion || 'Servicio', 20, y, { maxWidth: 100 });
      doc.text(servicio.cantidad?.toString() || '1', 133, y);
      doc.text(`S/ ${(servicio.precioUnitario || 0).toLocaleString()}`, 150, y);
      doc.text(`S/ ${((servicio.cantidad || 1) * (servicio.precioUnitario || 0)).toLocaleString()}`, 175, y);
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
    doc.text(`S/ ${(factura.subtotal || 0).toLocaleString()}`, 180, y, { align: 'right' });
    
    y += 6;
    doc.text('Impuestos:', 150, y);
    doc.text(`S/ ${(factura.impuestos || 0).toLocaleString()}`, 180, y, { align: 'right' });
    
    y += 10;
    doc.setFillColor(6, 182, 212);
    doc.rect(145, y - 5, 50, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', 150, y + 2);
    doc.text(`S/ ${factura.total.toLocaleString()}`, 185, y + 2, { align: 'right' });

    // Código QR simulado (representación visual)
    y += 25;
    doc.setFillColor(0, 0, 0);
    for (let i = 0; i < 30; i++) {
      for (let j = 0; j < 30; j++) {
        if (Math.random() > 0.5) {
          doc.rect(15 + i * 1.5, y + j * 1.5, 1.5, 1.5, 'F');
        }
      }
    }
    doc.setFontSize(7);
    doc.setTextColor(textGray);
    doc.text('Escanea para verificar', 20, y + 48);

    // Sello digital
    y += 5;
    doc.setFontSize(7);
    doc.setTextColor(textGray);
    doc.text('SELLO DIGITAL:', 70, y);
    doc.setFontSize(6);
    doc.text('A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6...', 70, y + 4, { maxWidth: 120 });
    doc.text('Este documento es una representación impresa de una CFDI', 70, y + 12);

    // Notas de pago
    y += 25;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DE PAGO:', 15, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    const notasLineas = doc.splitTextToSize(configuracionFiscal.notasPago, 180);
    doc.text(notasLineas, 15, y);

    // Footer
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(`Factura Electrónica emitida vía ${configuracionFiscal.proveedorFacturacion} - VetSpecialist`, 105, 291, { align: 'center' });

    // Descargar
    doc.save(`${configuracionFiscal.serieFactura}_${configuracionFiscal.folioActual}_${factura.numero}.pdf`);
    toast.success('Factura electrónica generada correctamente');
  };

  // Función auxiliar para generar UUID simulado
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // La emisión ante SUNAT no está conectada: el comprobante válido (recibo por honorarios)
  // se emite en SUNAT Operaciones en Línea y la pre-factura sirve de detalle para la clínica.
  const emitirFacturaElectronica = (_factura: any) => {
    toast.info('La emisión ante SUNAT aún no está conectada', {
      description: 'Emite tu recibo por honorarios en SUNAT Operaciones en Línea y envíalo a la clínica junto con la pre-factura.',
      duration: 9000,
    });
  };

  // Función para abrir modal de email
  const abrirModalEmail = (factura: any) => {
    const clinica = getClinicaByNombre(factura.clinica);
    setFacturaSeleccionada(factura);
    setEmailData({
      destinatario: clinica?.email || '',
      asunto: `Factura ${factura.numero} - ${configuracionFiscal.nombreEmpresa}`,
      mensaje: `Estimado/a,\n\nAdjunto encontrará la factura ${factura.numero} correspondiente a los servicios veterinarios prestados.\n\nDetalles de la factura:\n- Fecha: ${new Date(factura.fecha).toLocaleDateString('es-ES')}\n- Total: S/ ${factura.total.toLocaleString()}\n- Vencimiento: ${new Date(factura.vencimiento).toLocaleDateString('es-ES')}\n\nQuedo atento a cualquier consulta.\n\nSaludos cordiales,\n${configuracionFiscal.nombreEmpresa}`
    });
    setMostrarModalEmail(true);
  };

  // Abre el cliente de correo del usuario con el mensaje listo; el PDF se adjunta a mano.
  const enviarEmail = () => {
    if (!emailData.destinatario) {
      toast.error('Ingresa el correo del destinatario');
      return;
    }
    const enlace = `mailto:${encodeURIComponent(emailData.destinatario)}` +
      `?subject=${encodeURIComponent(emailData.asunto)}&body=${encodeURIComponent(emailData.mensaje)}`;
    window.location.href = enlace;
    toast.info('Se abrió tu correo con el mensaje listo', {
      description: 'Adjunta el PDF de la factura antes de enviarlo.'
    });
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
                  boxShadow: '0 4px 12px -2px rgba(249, 115, 22, 0.35)'
                }}
              >
                <FileText className="w-8 h-8 text-white" />
              </div>
              Honorarios
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Pre-facturas y recibos para clínicas. La venta al cliente final la registra la clínica en Veterinari.
              {configuracionFiscal.facturaElectronicaHabilitada
                ? ` · Electrónica vía ${configuracionFiscal.proveedorFacturacion}`
                : ''}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setMostrarConfigFactElec(true)}
              variant="outline"
              className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : ''}
            >
              <Shield className="w-4 h-4 mr-2" />
              Config. Fact. Electrónica
            </Button>
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
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva pre-factura
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={`p-5 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} ${serviciosPorFacturar.length ? 'ring-1 ring-orange-500/40' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Por facturar</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {serviciosPorFacturar.length}
                </p>
                <p className={`text-sm text-orange-500 mt-1`}>
                  S/ {serviciosPorFacturar.reduce((a, s) => a + s.tarifa, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)' }}>
                <Zap className="w-6 h-6" style={{ color: '#F97316' }} />
              </div>
            </div>
          </Card>

          <Card className={`p-5 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Emitido</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  S/ {totalFacturado.toLocaleString()}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  {facturasFiltradas.length} documentos
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(249, 115, 22, 0.12)' }}>
                <FileText className="w-6 h-6" style={{ color: '#F97316' }} />
              </div>
            </div>
          </Card>

          <Card className={`p-5 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cobrado</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  S/ {totalPagado.toLocaleString()}
                </p>
                <p className={`text-sm text-green-500 mt-1`}>
                  {totalFacturado > 0 ? Math.round((totalPagado / totalFacturado) * 100) : 0}% del emitido
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}>
                <CheckCircle className="w-6 h-6" style={{ color: '#10B981' }} />
              </div>
            </div>
          </Card>

          <Card className={`p-5 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Por cobrar</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  S/ {totalPendiente.toLocaleString()}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  {facturasFiltradas.filter(f => f.estado !== 'pagada').length} pendientes
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

        {/* SECTION: Servicios Pendientes de Facturar (Visible SIEMPRE si hay items) */}
        {serviciosPorFacturar.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`p-6 border-l-4 border-l-orange-500 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <div>
                   <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                     <FileCheck className="w-6 h-6 text-orange-500" />
                     Listos para honorario ({serviciosPorFacturar.length})
                   </h2>
                   <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                     Servicios completados — genera la pre-factura hacia la clínica.
                   </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-500">Monto acumulado</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    S/ {serviciosPorFacturar.reduce((acc, s) => acc + s.tarifa, 0).toLocaleString()}
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
                          S/ {servicio.tarifa.toLocaleString()}
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
                    Tipo/Estado
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className={`${darkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}`}>
                {facturasFiltradas.map((factura) => {
                  const estado = estadoColors[factura.estado as EstadoFactura] || estadoColors.borrador;
                  const clinica = getClinicaByNombre(factura.clinica);
                  const EstadoIcon = estado.icon;
                  
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
                          S/ {factura.total.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={`${estado.bg} ${estado.text} border ${estado.border} flex items-center gap-1 w-fit`}
                        >
                          <EstadoIcon className="w-3 h-3" />
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
                            title="Ver"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!esFacturaElectronica(factura) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => generarPreFacturaPDF(factura)}
                              className={darkMode ? 'text-purple-400 hover:bg-purple-900/30' : 'text-purple-600 hover:bg-purple-50'}
                              title="Descargar Pre-factura"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {esFacturaElectronica(factura) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => generarFacturaElectronicaPDF(factura)}
                              className={darkMode ? 'text-cyan-400 hover:bg-cyan-900/30' : 'text-cyan-600 hover:bg-cyan-50'}
                              title="Descargar Factura Electrónica"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {factura.estado === 'borrador' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => emitirFacturaElectronica(factura)}
                              className={darkMode ? 'text-cyan-400 hover:bg-cyan-900/30' : 'text-cyan-600 hover:bg-cyan-50'}
                              title="Recibo por honorarios (SUNAT)"
                            >
                              <Zap className="w-4 h-4" />
                            </Button>
                          )}
                          {factura.estado !== 'pagada' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => abrirModalEmail(factura)}
                              className={darkMode ? 'text-green-400 hover:bg-green-900/30' : 'text-green-600 hover:bg-green-50'}
                              title="Enviar"
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

      {/* Modal Configuración General */}
      <AnimatePresence>
        {mostrarConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col`}
            >
              <div className={`p-6 ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'} flex items-center justify-between`}>
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                    <Settings className="w-6 h-6 text-orange-500" />
                    Configuración Fiscal
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    Configure sus datos fiscales generales
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

              <div className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Nombre de la Empresa / Profesional
                  </Label>
                  <Input
                    value={configuracionFiscal.nombreEmpresa}
                    onChange={(e) => setConfiguracionFiscal({
                      ...configuracionFiscal,
                      nombreEmpresa: e.target.value
                    })}
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    placeholder="Dr. Juan Pérez"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      RUC
                    </Label>
                    <Input
                      value={configuracionFiscal.nif}
                      onChange={(e) => setConfiguracionFiscal({
                        ...configuracionFiscal,
                        nif: e.target.value
                      })}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                      placeholder="A12345678"
                    />
                  </div>

                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Teléfono
                    </Label>
                    <Input
                      value={configuracionFiscal.telefono}
                      onChange={(e) => setConfiguracionFiscal({
                        ...configuracionFiscal,
                        telefono: e.target.value
                      })}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Dirección Fiscal
                  </Label>
                  <Input
                    value={configuracionFiscal.direccionFiscal}
                    onChange={(e) => setConfiguracionFiscal({
                      ...configuracionFiscal,
                      direccionFiscal: e.target.value
                    })}
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    placeholder="Av. Veterinaria 123, Oficina 4B"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Ciudad
                    </Label>
                    <Input
                      value={configuracionFiscal.ciudad}
                      onChange={(e) => setConfiguracionFiscal({
                        ...configuracionFiscal,
                        ciudad: e.target.value
                      })}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                      placeholder="Bogotá"
                    />
                  </div>

                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Código Postal
                    </Label>
                    <Input
                      value={configuracionFiscal.codigoPostal}
                      onChange={(e) => setConfiguracionFiscal({
                        ...configuracionFiscal,
                        codigoPostal: e.target.value
                      })}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                      placeholder="110111"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Email de Facturación
                    </Label>
                    <Input
                      type="email"
                      value={configuracionFiscal.email}
                      onChange={(e) => setConfiguracionFiscal({
                        ...configuracionFiscal,
                        email: e.target.value
                      })}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                      placeholder="facturacion@vetspecialist.com"
                    />
                  </div>

                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Sitio Web (opcional)
                    </Label>
                    <Input
                      value={configuracionFiscal.web || ''}
                      onChange={(e) => setConfiguracionFiscal({
                        ...configuracionFiscal,
                        web: e.target.value
                      })}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                      placeholder="www.vetspecialist.com"
                    />
                  </div>
                </div>

                <div>
                  <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Información de Pago
                  </Label>
                  <Textarea
                    value={configuracionFiscal.notasPago}
                    onChange={(e) => setConfiguracionFiscal({
                      ...configuracionFiscal,
                      notasPago: e.target.value
                    })}
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    placeholder="Transferencia bancaria: Banco XYZ | Cuenta: 1234567890"
                    rows={3}
                  />
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                    Esta información aparecerá en las facturas
                  </p>
                </div>

                <div>
                  <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Términos y Condiciones
                  </Label>
                  <Textarea
                    value={configuracionFiscal.terminosCondiciones}
                    onChange={(e) => setConfiguracionFiscal({
                      ...configuracionFiscal,
                      terminosCondiciones: e.target.value
                    })}
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    placeholder="Pago a 15 días. Intereses de mora del 1.5% mensual..."
                    rows={3}
                  />
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                    Condiciones de pago y penalizaciones
                  </p>
                </div>
              </div>

              <div className="p-6 border-t flex justify-end gap-3" style={{ borderColor: darkMode ? '#374151' : '#E5E7EB' }}>
                <Button
                  variant="outline"
                  onClick={() => setMostrarConfig(false)}
                  className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : ''}
                >
                  Cancelar
                </Button>
                <Button
                  disabled={guardandoConfig}
                  onClick={() => guardarConfiguracionFiscal(() => setMostrarConfig(false))}
                  style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}
                  className="text-white"
                >
                  Guardar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Config Facturación Electrónica */}
      <AnimatePresence>
        {mostrarConfigFactElec && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col`}
            >
              <div className={`p-6 ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'} flex items-center justify-between`}>
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                    <Shield className="w-6 h-6 text-cyan-500" />
                    Configuración de Facturación Electrónica
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    Configure su proveedor de facturación electrónica
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrarConfigFactElec(false)}
                  className={darkMode ? 'text-gray-400 hover:text-gray-300' : ''}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={configuracionFiscal.facturaElectronicaHabilitada}
                      onChange={(e) => setConfiguracionFiscal({
                        ...configuracionFiscal,
                        facturaElectronicaHabilitada: e.target.checked
                      })}
                      className="w-5 h-5 text-cyan-600"
                    />
                    <Label className={`text-base font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Habilitar Facturación Electrónica
                    </Label>
                  </div>

                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Proveedor de Facturación
                    </Label>
                    <select
                      value={configuracionFiscal.proveedorFacturacion}
                      onChange={(e) => setConfiguracionFiscal({
                        ...configuracionFiscal,
                        proveedorFacturacion: e.target.value as any
                      })}
                      className={`w-full mt-1 px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-900 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      disabled={!configuracionFiscal.facturaElectronicaHabilitada}
                    >
                      <option value="Ninguno">Seleccione un proveedor</option>
                      <option value="SUNAT">🇵🇪 SUNAT (Perú)</option>
                      <option value="DIAN">🇨🇴 DIAN (Colombia)</option>
                      <option value="SAT">🇲🇽 SAT (México)</option>
                      <option value="SRI">🇪🇨 SRI (Ecuador)</option>
                    </select>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                      Seleccione el organismo fiscal de su país
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Serie de Factura
                      </Label>
                      <Input
                        value={configuracionFiscal.serieFactura}
                        onChange={(e) => setConfiguracionFiscal({
                          ...configuracionFiscal,
                          serieFactura: e.target.value
                        })}
                        disabled={!configuracionFiscal.facturaElectronicaHabilitada}
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                        placeholder="FE"
                      />
                    </div>

                    <div>
                      <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Folio Actual
                      </Label>
                      <Input
                        type="number"
                        value={configuracionFiscal.folioActual}
                        onChange={(e) => setConfiguracionFiscal({
                          ...configuracionFiscal,
                          folioActual: parseInt(e.target.value) || 0
                        })}
                        disabled={!configuracionFiscal.facturaElectronicaHabilitada}
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Certificado Digital (.cer)
                    </Label>
                    <Input
                      value={configuracionFiscal.certificadoDigital || ''}
                      onChange={(e) => setConfiguracionFiscal({
                        ...configuracionFiscal,
                        certificadoDigital: e.target.value
                      })}
                      disabled={!configuracionFiscal.facturaElectronicaHabilitada}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                      placeholder="CERT_DEMO_2024.cer"
                    />
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                      Archivo de certificado digital proporcionado por su autoridad fiscal
                    </p>
                  </div>

                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Clave Privada (.key)
                    </Label>
                    <Input
                      type="password"
                      value={configuracionFiscal.clavePrivada || ''}
                      onChange={(e) => setConfiguracionFiscal({
                        ...configuracionFiscal,
                        clavePrivada: e.target.value
                      })}
                      disabled={!configuracionFiscal.facturaElectronicaHabilitada}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                      placeholder="••••"
                    />
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                      Clave privada para firmar digitalmente las facturas
                    </p>
                  </div>

                  {configuracionFiscal.facturaElectronicaHabilitada && (
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-cyan-900/20 border border-cyan-800' : 'bg-cyan-50 border border-cyan-200'}`}>
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className={`text-sm font-medium ${darkMode ? 'text-cyan-300' : 'text-cyan-900'}`}>
                            Facturación Electrónica Configurada
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-cyan-400' : 'text-cyan-700'} mt-1`}>
                            Todas las facturas se emitirán a través de {configuracionFiscal.proveedorFacturacion} con validez fiscal.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: darkMode ? '#374151' : '#E5E7EB' }}>
                  <Button
                    variant="outline"
                    onClick={() => setMostrarConfigFactElec(false)}
                    className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : ''}
                  >
                    Cancelar
                  </Button>
                  <Button
                    disabled={guardandoConfig}
                    onClick={() => guardarConfiguracionFiscal(() => setMostrarConfigFactElec(false))}
                    style={{ background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)' }}
                    className="text-white"
                  >
                    Guardar Configuración
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Nueva Factura */}
      <AnimatePresence>
        {mostrarNuevaFactura && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col`}
            >
              <div className={`p-6 ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Nueva Factura
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMostrarNuevaFactura(false)}
                    className={darkMode ? 'text-gray-400 hover:text-gray-300' : ''}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Selector de tipo de factura */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTipoFactura('pre-factura')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tipoFactura === 'pre-factura'
                        ? 'border-purple-500 bg-purple-500/10'
                        : darkMode
                        ? 'border-gray-700 hover:border-gray-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className={`w-6 h-6 ${tipoFactura === 'pre-factura' ? 'text-purple-500' : darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <div className="text-left">
                        <p className={`font-medium ${tipoFactura === 'pre-factura' ? 'text-purple-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Pre-factura
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                          Para control interno
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setTipoFactura('electronica')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tipoFactura === 'electronica'
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : darkMode
                        ? 'border-gray-700 hover:border-gray-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={!configuracionFiscal.facturaElectronicaHabilitada}
                  >
                    <div className="flex items-center gap-3">
                      <Zap className={`w-6 h-6 ${tipoFactura === 'electronica' ? 'text-cyan-500' : darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <div className="text-left">
                        <p className={`font-medium ${tipoFactura === 'electronica' ? 'text-cyan-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Factura Electrónica
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                          {configuracionFiscal.facturaElectronicaHabilitada ? 'Con validez fiscal' : 'No configurada'}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {!configuracionFiscal.facturaElectronicaHabilitada && (
                  <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <p className={`text-xs ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                      ⚠️ Configure primero la facturación electrónica para emitir facturas con validez fiscal
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 overflow-y-auto">
                <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Formulario de creación de {tipoFactura === 'pre-factura' ? 'Pre-factura' : 'Factura Electrónica'}
                </p>
                <p className={`text-xs text-center mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  (Formulario completo se implementaría aquí con todos los campos necesarios)
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Detalle de Factura */}
      <AnimatePresence>
        {facturaSeleccionada && !mostrarModalEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl`}
            >
              {/* Header */}
              <div className={`p-6 ${darkMode ? 'border-b border-gray-700 bg-gray-900' : 'border-b border-gray-100 bg-gray-50'} flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    facturaSeleccionada.estado === 'pagada' ? 'bg-green-100 text-green-600' : 
                    facturaSeleccionada.estado === 'vencida' ? 'bg-red-100 text-red-600' : 
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Factura {facturaSeleccionada.numero}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`${
                        facturaSeleccionada.estado === 'pagada' ? 'bg-green-100 text-green-700 border-green-200' : 
                        facturaSeleccionada.estado === 'vencida' ? 'bg-red-100 text-red-700 border-red-200' : 
                        'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        {facturaSeleccionada.estado.toUpperCase()}
                      </Badge>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(facturaSeleccionada.fecha).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFacturaSeleccionada(null)}
                  className={`rounded-full ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Contenido */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Info Cliente y Emisor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Cliente
                    </h3>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'} shadow-sm`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {facturaSeleccionada.clinica}
                      </p>
                    </div>
                    {facturaSeleccionada.razonSocial && (
                      <p className={`text-sm ml-11 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {facturaSeleccionada.razonSocial}
                      </p>
                    )}
                    {facturaSeleccionada.rfc && (
                      <p className={`text-sm ml-11 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        RUT/RFC: {facturaSeleccionada.rfc}
                      </p>
                    )}
                  </div>

                  <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Detalles de Pago
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vencimiento:</span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {new Date(facturaSeleccionada.vencimiento).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Método:</span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Transferencia Bancaria
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabla de Servicios */}
                <div>
                  <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Servicios Facturados
                  </h3>
                  <div className={`overflow-hidden rounded-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <table className="w-full">
                      <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                        <tr>
                          <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Descripción</th>
                          <th className={`px-4 py-3 text-center text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cant.</th>
                          <th className={`px-4 py-3 text-right text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Precio</th>
                          <th className={`px-4 py-3 text-right text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {facturaSeleccionada.servicios?.map((servicio: any, idx: number) => (
                          <tr key={idx}>
                            <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {servicio.descripcion}
                            </td>
                            <td className={`px-4 py-3 text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {servicio.cantidad}
                            </td>
                            <td className={`px-4 py-3 text-sm text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              S/ {servicio.precioUnitario.toLocaleString()}
                            </td>
                            <td className={`px-4 py-3 text-sm text-right font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              S/ {(servicio.cantidad * servicio.precioUnitario).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totales */}
                <div className="flex justify-end">
                  <div className="w-full md:w-1/3 space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Subtotal</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        S/ {(facturaSeleccionada.subtotal || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Impuestos</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        S/ {(facturaSeleccionada.impuestos || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Total</span>
                      <span className={`text-lg font-bold text-blue-600`}>
                        S/ {facturaSeleccionada.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className={`p-6 border-t ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'} flex justify-end gap-3`}>
                <Button 
                  variant="outline" 
                  onClick={() => setFacturaSeleccionada(null)}
                  className={darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : ''}
                >
                  Cerrar
                </Button>
                
                {!esFacturaElectronica(facturaSeleccionada) && (
                  <Button 
                    variant="outline"
                    onClick={() => generarPreFacturaPDF(facturaSeleccionada)}
                    className={darkMode ? 'border-purple-500 text-purple-400 hover:bg-purple-900/20' : 'border-purple-200 text-purple-600 hover:bg-purple-50'}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Pre-factura
                  </Button>
                )}

                {esFacturaElectronica(facturaSeleccionada) && (
                  <Button 
                    variant="outline"
                    onClick={() => generarFacturaElectronicaPDF(facturaSeleccionada)}
                    className={darkMode ? 'border-cyan-500 text-cyan-400 hover:bg-cyan-900/20' : 'border-cyan-200 text-cyan-600 hover:bg-cyan-50'}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar XML/PDF
                  </Button>
                )}

                <Button 
                  onClick={() => abrirModalEmail(facturaSeleccionada)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar por Email
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Enviar Email */}
      <AnimatePresence>
        {mostrarModalEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border rounded-xl max-w-lg w-full overflow-hidden shadow-2xl`}
            >
              <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                  <Mail className="w-5 h-5 text-blue-500" />
                  Enviar Factura por Email
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrarModalEmail(false)}
                  className={darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500'}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Para:</Label>
                  <Input
                    value={emailData.destinatario}
                    onChange={(e) => setEmailData({ ...emailData, destinatario: e.target.value })}
                    className={`mt-1 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}`}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Asunto:</Label>
                  <Input
                    value={emailData.asunto}
                    onChange={(e) => setEmailData({ ...emailData, asunto: e.target.value })}
                    className={`mt-1 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}`}
                  />
                </div>
                <div>
                  <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Mensaje:</Label>
                  <Textarea
                    value={emailData.mensaje}
                    onChange={(e) => setEmailData({ ...emailData, mensaje: e.target.value })}
                    className={`mt-1 h-32 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}`}
                  />
                </div>
              </div>

              <div className={`p-6 border-t ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-gray-50'} flex justify-end gap-3`}>
                <Button
                  variant="outline"
                  onClick={() => setMostrarModalEmail(false)}
                  className={darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : ''}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={enviarEmail}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Factura
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
