import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, FileText, DollarSign, Calendar, Building2, Zap, TrendingUp, AlertTriangle, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../App';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface PagosMasivosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PagoExcel {
  numeroFactura: string;
  monto: number;
  fecha: string;
  referencia: string;
  metodoPago: string;
  fila: number; // Para tracking de errores
}

interface MatchResult {
  tipo: 'exito' | 'advertencia' | 'error';
  numeroFactura: string;
  montoExcel: number;
  montoFactura?: number;
  clinica?: string;
  diferencia?: number;
  mensaje: string;
  fila?: number;
  datosCompletos?: PagoExcel;
}

interface ValidationError {
  fila: number;
  campo: string;
  error: string;
}

export function PagosMasivosModal({ isOpen, onClose }: PagosMasivosModalProps) {
  const { darkMode, facturas, registrarPagoFactura } = useApp();
  const [step, setStep] = useState<'upload' | 'preview' | 'resultado'>('upload');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [pagosExcel, setPagosExcel] = useState<PagoExcel[]>([]);
  const [resultados, setResultados] = useState<MatchResult[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Validación de formato de fecha (YYYY-MM-DD)
  const validarFecha = (fecha: string): boolean => {
    if (!fecha) return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(fecha)) return false;
    
    const date = new Date(fecha);
    return date instanceof Date && !isNaN(date.getTime());
  };

  // Validación de monto
  const validarMonto = (monto: any): number | null => {
    const montoNum = typeof monto === 'number' ? monto : parseFloat(String(monto).replace(/[^0-9.-]/g, ''));
    
    if (isNaN(montoNum) || montoNum <= 0) return null;
    if (montoNum > 1000000) return null; // Máximo 1 millón
    
    return montoNum;
  };

  // Validar duplicados en el Excel
  const validarDuplicados = (pagos: PagoExcel[]): string[] => {
    const facturas = pagos.map(p => p.numeroFactura);
    const duplicados = facturas.filter((factura, index) => facturas.indexOf(factura) !== index);
    return [...new Set(duplicados)];
  };

  // Parsing real de Excel con XLSX
  const parseExcelFile = async (file: File) => {
    setProcessing(true);
    const errors: ValidationError[] = [];
    const pagos: PagoExcel[] = [];

    try {
      // Leer archivo
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Obtener primera hoja
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convertir a JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        raw: false,
        dateNF: 'yyyy-mm-dd'
      }) as any[][];

      // Validar que tenga datos
      if (jsonData.length < 2) {
        toast.error('El archivo está vacío o no tiene datos');
        setProcessing(false);
        return;
      }

      // Obtener headers (primera fila)
      const headers = jsonData[0].map((h: any) => String(h).toLowerCase().trim());
      
      // Validar headers requeridos
      const requiredHeaders = ['numero factura', 'monto', 'fecha', 'referencia', 'metodo de pago'];
      const missingHeaders = requiredHeaders.filter(h => !headers.some(header => header.includes(h)));
      
      if (missingHeaders.length > 0) {
        toast.error(`Faltan columnas requeridas: ${missingHeaders.join(', ')}`);
        setProcessing(false);
        return;
      }

      // Encontrar índices de columnas
      const getColumnIndex = (keywords: string[]) => {
        return headers.findIndex(h => keywords.some(keyword => h.includes(keyword)));
      };

      const colNumeroFactura = getColumnIndex(['numero', 'factura', 'número']);
      const colMonto = getColumnIndex(['monto', 'valor', 'total']);
      const colFecha = getColumnIndex(['fecha']);
      const colReferencia = getColumnIndex(['referencia', 'ref', 'transaction']);
      const colMetodoPago = getColumnIndex(['metodo', 'método', 'forma', 'pago']);

      // Procesar filas (empezando desde la segunda)
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const fila = i + 1; // Número de fila en Excel (1-based)

        // Skip filas vacías
        if (!row || row.every(cell => !cell)) continue;

        // Extraer datos
        const numeroFactura = row[colNumeroFactura]?.toString().trim() || '';
        const montoRaw = row[colMonto];
        const fechaRaw = row[colFecha]?.toString().trim() || '';
        const referencia = row[colReferencia]?.toString().trim() || '';
        const metodoPago = row[colMetodoPago]?.toString().trim() || '';

        // Validaciones
        let hasError = false;

        if (!numeroFactura) {
          errors.push({ fila, campo: 'Número Factura', error: 'Campo vacío' });
          hasError = true;
        }

        const monto = validarMonto(montoRaw);
        if (monto === null) {
          errors.push({ fila, campo: 'Monto', error: `Valor inválido: "${montoRaw}"` });
          hasError = true;
        }

        if (!validarFecha(fechaRaw)) {
          errors.push({ fila, campo: 'Fecha', error: `Formato inválido: "${fechaRaw}" (usar YYYY-MM-DD)` });
          hasError = true;
        }

        if (!referencia) {
          errors.push({ fila, campo: 'Referencia', error: 'Campo vacío' });
          hasError = true;
        }

        if (!metodoPago) {
          errors.push({ fila, campo: 'Método de Pago', error: 'Campo vacío' });
          hasError = true;
        }

        // Si tiene errores, continuar a la siguiente fila
        if (hasError) continue;

        // Agregar pago válido
        pagos.push({
          numeroFactura,
          monto: monto!,
          fecha: fechaRaw,
          referencia,
          metodoPago,
          fila
        });
      }

      // Validar duplicados
      const duplicados = validarDuplicados(pagos);
      if (duplicados.length > 0) {
        toast.error(`⚠️ Se encontraron facturas duplicadas: ${duplicados.join(', ')}`);
        // No bloqueamos el proceso, solo advertimos
      }

      // Mostrar errores de validación
      if (errors.length > 0) {
        setValidationErrors(errors);
        toast.error(`Se encontraron ${errors.length} error(es) de validación`);
      }

      // Si no hay pagos válidos
      if (pagos.length === 0) {
        toast.error('No se encontraron registros válidos para procesar');
        setProcessing(false);
        return;
      }

      // Éxito
      toast.success(`✅ ${pagos.length} registro(s) válido(s) encontrado(s)`);
      setPagosExcel(pagos);
      realizarMatch(pagos);
      setStep('preview');

    } catch (error) {
      console.error('Error parsing Excel:', error);
      toast.error('Error al leer el archivo. Verifica que sea un Excel válido.');
    } finally {
      setProcessing(false);
    }
  };

  // Match inteligente: compara pagos de Excel con facturas pendientes
  const realizarMatch = (pagos: PagoExcel[]) => {
    const matches: MatchResult[] = [];

    pagos.forEach(pago => {
      const factura = facturas.find(f => f.numero === pago.numeroFactura);

      if (!factura) {
        // No se encontró la factura
        matches.push({
          tipo: 'error',
          numeroFactura: pago.numeroFactura,
          montoExcel: pago.monto,
          mensaje: 'Factura no encontrada en el sistema',
          fila: pago.fila,
          datosCompletos: pago
        });
      } else if (factura.estado === 'pagada') {
        // Factura ya está pagada
        matches.push({
          tipo: 'advertencia',
          numeroFactura: pago.numeroFactura,
          montoExcel: pago.monto,
          montoFactura: factura.total,
          clinica: factura.clinica,
          mensaje: 'Esta factura ya está marcada como pagada',
          fila: pago.fila,
          datosCompletos: pago
        });
      } else if (Math.abs(pago.monto - factura.total) > 0.01) {
        // Hay diferencia en el monto
        const diferencia = pago.monto - factura.total;
        matches.push({
          tipo: 'advertencia',
          numeroFactura: pago.numeroFactura,
          montoExcel: pago.monto,
          montoFactura: factura.total,
          clinica: factura.clinica,
          diferencia,
          mensaje: `Diferencia de $${Math.abs(diferencia).toLocaleString()} (${diferencia > 0 ? 'sobrepago' : 'pago parcial'})`,
          fila: pago.fila,
          datosCompletos: pago
        });
      } else {
        // Match perfecto
        matches.push({
          tipo: 'exito',
          numeroFactura: pago.numeroFactura,
          montoExcel: pago.monto,
          montoFactura: factura.total,
          clinica: factura.clinica,
          mensaje: 'Match perfecto - Listo para aplicar',
          fila: pago.fila,
          datosCompletos: pago
        });
      }
    });

    setResultados(matches);
  };

  // Aplicar pagos masivos
  const aplicarPagosMasivos = () => {
    const exitosos = resultados.filter(r => r.tipo === 'exito');
    
    try {
      exitosos.forEach(resultado => {
        const pago = resultado.datosCompletos;
        if (pago) {
          registrarPagoFactura(resultado.numeroFactura, {
            monto: pago.monto,
            fecha: pago.fecha,
            metodoPago: pago.metodoPago,
            referencia: pago.referencia
          });
        }
      });

      toast.success(`🎉 ${exitosos.length} pago(s) aplicado(s) exitosamente`);
      setStep('resultado');
    } catch (error) {
      console.error('Error aplicando pagos:', error);
      toast.error('Error al aplicar los pagos. Intenta nuevamente.');
    }
  };

  // Descargar template Excel
  const descargarTemplate = () => {
    const template = [
      ['Numero Factura', 'Monto', 'Fecha', 'Referencia', 'Metodo de Pago'],
      ['FAC-001247', 200, '2025-01-30', 'TRANS-20250130-001', 'Transferencia Bancaria'],
      ['FAC-001246', 180, '2025-01-30', 'TRANS-20250130-002', 'Transferencia Bancaria'],
      ['FAC-001248', 350, '2025-01-30', 'TRANS-20250130-003', 'Transferencia Bancaria']
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pagos');
    
    // Establecer anchos de columna
    ws['!cols'] = [
      { wch: 15 },
      { wch: 10 },
      { wch: 12 },
      { wch: 20 },
      { wch: 25 }
    ];

    XLSX.writeFile(wb, 'template_pagos_masivos.xlsx');
    toast.success('📄 Template descargado exitosamente');
  };

  // Exportar reporte de resultados
  const exportarReporte = () => {
    const reporte = [
      ['Tipo', 'Fila Excel', 'Numero Factura', 'Clinica', 'Monto Excel', 'Monto Factura', 'Diferencia', 'Resultado', 'Referencia'],
      ...resultados.map(r => [
        r.tipo === 'exito' ? '✅ Exitoso' : r.tipo === 'advertencia' ? '⚠️ Advertencia' : '❌ Error',
        r.fila || '-',
        r.numeroFactura,
        r.clinica || '-',
        r.montoExcel,
        r.montoFactura || '-',
        r.diferencia || 0,
        r.mensaje,
        r.datosCompletos?.referencia || '-'
      ])
    ];

    // Agregar errores de validación
    if (validationErrors.length > 0) {
      reporte.push([]);
      reporte.push(['ERRORES DE VALIDACIÓN']);
      reporte.push(['Fila', 'Campo', 'Error']);
      validationErrors.forEach(err => {
        reporte.push([err.fila, err.campo, err.error]);
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(reporte);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    
    ws['!cols'] = [
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 30 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 40 },
      { wch: 25 }
    ];

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    XLSX.writeFile(wb, `reporte_pagos_masivos_${timestamp}.xlsx`);
    toast.success('📊 Reporte exportado exitosamente');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        setArchivo(file);
        parseExcelFile(file);
      } else {
        toast.error('❌ Formato de archivo no soportado. Usa .xlsx, .xls o .csv');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArchivo(file);
      parseExcelFile(file);
    }
  };

  const resetModal = () => {
    setStep('upload');
    setArchivo(null);
    setPagosExcel([]);
    setResultados([]);
    setValidationErrors([]);
    setDragActive(false);
    setProcessing(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const countByType = {
    exito: resultados.filter(r => r.tipo === 'exito').length,
    advertencia: resultados.filter(r => r.tipo === 'advertencia').length,
    error: resultados.filter(r => r.tipo === 'error').length
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {/* Header */}
          <div 
            className="sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between"
            style={{
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              borderColor: darkMode ? '#374151' : '#E5E7EB'
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Pagos Masivos
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Conciliación automática mediante archivo Excel
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Steps indicator */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    step === 'upload' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-green-500/20 text-green-500'
                  }`}
                >
                  {step !== 'upload' ? <CheckCircle className="w-5 h-5" /> : '1'}
                </div>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Subir Archivo
                </span>
              </div>
              <div className={`w-12 h-0.5 ${step !== 'upload' ? 'bg-green-500' : (darkMode ? 'bg-gray-700' : 'bg-gray-300')}`} />
              <div className="flex items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    step === 'preview' 
                      ? 'bg-green-500 text-white' 
                      : step === 'resultado'
                      ? 'bg-green-500/20 text-green-500'
                      : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step === 'resultado' ? <CheckCircle className="w-5 h-5" /> : '2'}
                </div>
                <span className={`font-semibold ${step !== 'upload' ? (darkMode ? 'text-white' : 'text-gray-900') : (darkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                  Revisar Coincidencias
                </span>
              </div>
              <div className={`w-12 h-0.5 ${step === 'resultado' ? 'bg-green-500' : (darkMode ? 'bg-gray-700' : 'bg-gray-300')}`} />
              <div className="flex items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    step === 'resultado' 
                      ? 'bg-green-500 text-white' 
                      : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  3
                </div>
                <span className={`font-semibold ${step === 'resultado' ? (darkMode ? 'text-white' : 'text-gray-900') : (darkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                  Resultado
                </span>
              </div>
            </div>

            {/* STEP 1: UPLOAD */}
            {step === 'upload' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Instrucciones */}
                <div 
                  className={`p-4 rounded-xl border-2 ${
                    darkMode 
                      ? 'bg-blue-500/10 border-blue-500/30' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className={`font-bold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                        📋 Requisitos del Archivo Excel
                      </h3>
                      <ul className={`text-sm space-y-1 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                        <li>✅ <strong>Columnas requeridas:</strong> Numero Factura, Monto, Fecha, Referencia, Metodo de Pago</li>
                        <li>✅ <strong>Formato de fecha:</strong> YYYY-MM-DD (ej: 2025-01-30)</li>
                        <li>✅ <strong>Monto:</strong> Números positivos (máximo $1,000,000)</li>
                        <li>✅ El sistema validará automáticamente y mostrará errores específicos</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Errores de validación previos */}
                {validationErrors.length > 0 && (
                  <div 
                    className={`p-4 rounded-xl border-2 ${
                      darkMode 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className={`font-bold mb-2 ${darkMode ? 'text-red-300' : 'text-red-900'}`}>
                          ⚠️ Errores de Validación ({validationErrors.length})
                        </h3>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {validationErrors.slice(0, 5).map((err, idx) => (
                            <p key={idx} className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
                              • <strong>Fila {err.fila}</strong> - {err.campo}: {err.error}
                            </p>
                          ))}
                          {validationErrors.length > 5 && (
                            <p className={`text-sm italic ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                              ... y {validationErrors.length - 5} errores más
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Drag & Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                    dragActive
                      ? 'border-green-500 bg-green-500/10 scale-105'
                      : darkMode
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <motion.div
                    animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div 
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{
                        background: dragActive 
                          ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                          : darkMode
                          ? 'rgba(75, 85, 99, 0.5)'
                          : 'rgba(243, 244, 246, 1)'
                      }}
                    >
                      <FileSpreadsheet 
                        className="w-10 h-10" 
                        style={{ color: dragActive ? '#FFFFFF' : '#10B981' }}
                      />
                    </div>
                    <div>
                      <p className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {dragActive ? '¡Suelta el archivo aquí!' : 'Arrastra tu archivo Excel'}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        o haz clic para seleccionar
                      </p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={processing}
                      className={`px-6 py-3 rounded-xl font-bold text-white transition-all ${
                        processing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                      }`}
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        {processing ? 'Procesando...' : 'Seleccionar Archivo'}
                      </div>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileInput}
                      className="hidden"
                      disabled={processing}
                    />
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Formatos soportados: .xlsx, .xls, .csv
                    </p>
                  </motion.div>
                </div>

                {/* Descargar Template */}
                <div className="flex justify-center">
                  <button
                    onClick={descargarTemplate}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Download className="w-5 h-5" />
                    Descargar Template Excel
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PREVIEW */}
            {step === 'preview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Nombre del archivo */}
                {archivo && (
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    darkMode ? 'bg-gray-900' : 'bg-gray-100'
                  }`}>
                    <FileCheck className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {archivo.name}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {(archivo.size / 1024).toFixed(2)} KB • {pagosExcel.length} registros procesados
                      </p>
                    </div>
                    <button
                      onClick={exportarReporte}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                        darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      Exportar Reporte
                    </button>
                  </div>
                )}

                {/* Resumen de matches */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    className="p-4 rounded-xl border-2"
                    style={{
                      backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                      borderColor: darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          ✅ Coincidencias Exitosas
                        </p>
                        <p className="text-3xl font-black text-green-500 mt-2">
                          {countByType.exito}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Se aplicarán automáticamente
                        </p>
                      </div>
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                  </div>

                  <div 
                    className="p-4 rounded-xl border-2"
                    style={{
                      backgroundColor: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                      borderColor: darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          ⚠️ Con Advertencias
                        </p>
                        <p className="text-3xl font-black text-amber-500 mt-2">
                          {countByType.advertencia}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Requieren revisión manual
                        </p>
                      </div>
                      <AlertTriangle className="w-10 h-10 text-amber-500" />
                    </div>
                  </div>

                  <div 
                    className="p-4 rounded-xl border-2"
                    style={{
                      backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                      borderColor: darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          ❌ Errores
                        </p>
                        <p className="text-3xl font-black text-red-500 mt-2">
                          {countByType.error}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          No se pueden procesar
                        </p>
                      </div>
                      <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                  </div>
                </div>

                {/* Tabla de resultados */}
                <div 
                  className={`rounded-xl border-2 overflow-hidden ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full">
                      <thead className="sticky top-0">
                        <tr 
                          className={`${
                            darkMode ? 'bg-gray-900' : 'bg-gray-50'
                          }`}
                        >
                          <th className={`text-left p-4 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Estado
                          </th>
                          <th className={`text-left p-4 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Fila
                          </th>
                          <th className={`text-left p-4 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Factura
                          </th>
                          <th className={`text-left p-4 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Clínica
                          </th>
                          <th className={`text-left p-4 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Monto Excel
                          </th>
                          <th className={`text-left p-4 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Monto Factura
                          </th>
                          <th className={`text-left p-4 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Resultado
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultados.map((resultado, index) => (
                          <tr 
                            key={index}
                            className={`border-t ${
                              darkMode ? 'border-gray-700' : 'border-gray-200'
                            }`}
                          >
                            <td className="p-4">
                              {resultado.tipo === 'exito' && (
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                </div>
                              )}
                              {resultado.tipo === 'advertencia' && (
                                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                                </div>
                              )}
                              {resultado.tipo === 'error' && (
                                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                  <AlertCircle className="w-5 h-5 text-red-500" />
                                </div>
                              )}
                            </td>
                            <td className={`p-4 font-mono text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {resultado.fila}
                            </td>
                            <td className={`p-4 font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {resultado.numeroFactura}
                            </td>
                            <td className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {resultado.clinica || '-'}
                            </td>
                            <td className={`p-4 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              ${resultado.montoExcel.toLocaleString()}
                            </td>
                            <td className={`p-4 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {resultado.montoFactura ? `$${resultado.montoFactura.toLocaleString()}` : '-'}
                            </td>
                            <td className="p-4">
                              <span 
                                className={`text-sm font-semibold ${
                                  resultado.tipo === 'exito' 
                                    ? 'text-green-500' 
                                    : resultado.tipo === 'advertencia'
                                    ? 'text-amber-500'
                                    : 'text-red-500'
                                }`}
                              >
                                {resultado.mensaje}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setStep('upload')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ← Subir Otro Archivo
                  </button>
                  <button
                    onClick={aplicarPagosMasivos}
                    disabled={countByType.exito === 0}
                    className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${
                      countByType.exito === 0
                        ? 'opacity-50 cursor-not-allowed bg-gray-500'
                        : 'hover:scale-105'
                    }`}
                    style={{
                      background: countByType.exito > 0 
                        ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                        : undefined,
                      boxShadow: countByType.exito > 0 
                        ? '0 4px 16px rgba(16, 185, 129, 0.3)'
                        : undefined
                    }}
                  >
                    Aplicar {countByType.exito} Pago{countByType.exito !== 1 ? 's' : ''} →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: RESULTADO */}
            {step === 'resultado' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mx-auto"
                  style={{ boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)' }}
                >
                  <CheckCircle className="w-14 h-14 text-white" />
                </motion.div>

                <div>
                  <h3 className={`text-3xl font-black mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ¡Pagos Aplicados Exitosamente!
                  </h3>
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Se procesaron <strong className="text-green-500">{countByType.exito} pagos</strong> correctamente
                  </p>
                </div>

                {/* Resumen final */}
                <div 
                  className={`p-6 rounded-xl border-2 max-w-md mx-auto ${
                    darkMode 
                      ? 'bg-gray-900 border-gray-700' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        ✅ Pagos aplicados:
                      </span>
                      <span className="text-xl font-black text-green-500">
                        {countByType.exito}
                      </span>
                    </div>
                    {countByType.advertencia > 0 && (
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          ⚠️ Con advertencias:
                        </span>
                        <span className="text-xl font-black text-amber-500">
                          {countByType.advertencia}
                        </span>
                      </div>
                    )}
                    {countByType.error > 0 && (
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          ❌ Con errores:
                        </span>
                        <span className="text-xl font-black text-red-500">
                          {countByType.error}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón de exportar reporte final */}
                <button
                  onClick={exportarReporte}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 mx-auto ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Download className="w-5 h-5" />
                  Descargar Reporte Completo
                </button>

                <button
                  onClick={handleClose}
                  className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Finalizar
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
