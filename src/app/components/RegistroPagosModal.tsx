import { useState } from 'react';
import { X, DollarSign, Upload, Calendar, CreditCard, FileText } from 'lucide-react';
import { useApp, type Factura } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { storageAPI } from '../utils/api';

interface RegistroPagosModalProps {
  isOpen: boolean;
  onClose: () => void;
  factura?: Factura;
}

export function RegistroPagosModal({ isOpen, onClose, factura }: RegistroPagosModalProps) {
  const { darkMode, registrarPagoFactura } = useApp();

  const [formData, setFormData] = useState({
    monto: factura?.total.toString() || '',
    fecha: new Date().toISOString().split('T')[0],
    metodoPago: 'transferencia' as 'transferencia' | 'cheque' | 'efectivo' | 'tarjeta',
    referencia: '',
    comprobante: null as File | null,
    notas: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, comprobante: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.monto || !formData.fecha || !formData.metodoPago || !formData.referencia) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      let comprobantePath = '';

      if (formData.comprobante) {
        const file = formData.comprobante;
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        
        // 1. Get Upload URL
        const response = await storageAPI.getUploadUrl('comprobantes', fileName);
        // Supabase returns { signedUrl, path, token } inside response
        // But our storageAPI wrapper returns response.json(). 
        // Let's assume response structure matches createSignedUploadUrl output.
        // Wait, storageAPI.getUploadUrl returns `fetchAPI(...)`.
        // Server returns `c.json(result)`.
        
        const { signedUrl, path } = response;

        if (!signedUrl) {
            throw new Error('No se pudo obtener URL de carga');
        }
        
        // 2. Upload file
        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        });

        if (!uploadRes.ok) {
            throw new Error('Error subiendo comprobante');
        }

        comprobantePath = path;
      }

      // Registrar pago
      await registrarPagoFactura(factura.numero, {
        monto: parseFloat(formData.monto.toString()),
        fecha: formData.fecha,
        metodoPago: formData.metodoPago,
        referencia: formData.referencia,
        comprobante: comprobantePath || undefined
      });

      // Reset form
      setFormData({
        monto: factura?.total.toString() || '',
        fecha: new Date().toISOString().split('T')[0],
        metodoPago: 'transferencia',
        referencia: '',
        comprobante: null,
        notas: ''
      });

      onClose();
    } catch (error) {
      console.error('Error registrando pago:', error);
      toast.error('Error al registrar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!factura) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Registrar Pago
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Factura: {factura.numero}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              {/* Factura Info */}
              <div className={`p-6 border-b ${darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      Clínica
                    </p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {factura.clinica}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      Total
                    </p>
                    <p className={`font-bold text-lg ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      ${factura.total.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      Fecha Emisión
                    </p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {factura.fecha}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      Vencimiento
                    </p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {factura.vencimiento}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Monto */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Monto del Pago *
                    </label>
                    <input
                      type="number"
                      value={formData.monto}
                      onChange={(e) => handleChange('monto', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                      required
                    />
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      Puede ser pago parcial o total
                    </p>
                  </div>

                  {/* Fecha de Pago */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Fecha de Pago *
                    </label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => handleChange('fecha', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                      required
                    />
                  </div>

                  {/* Método de Pago */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <CreditCard className="w-4 h-4 inline mr-2" />
                      Método de Pago *
                    </label>
                    <select
                      value={formData.metodoPago}
                      onChange={(e) => handleChange('metodoPago', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                    >
                      <option value="transferencia">Transferencia Bancaria</option>
                      <option value="cheque">Cheque</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                    </select>
                  </div>

                  {/* Referencia */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <FileText className="w-4 h-4 inline mr-2" />
                      Número de Referencia *
                    </label>
                    <input
                      type="text"
                      value={formData.referencia}
                      onChange={(e) => handleChange('referencia', e.target.value)}
                      placeholder="Ej: TRANS-20250129-001"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all`}
                      required
                    />
                  </div>
                </div>

                {/* Comprobante */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Upload className="w-4 h-4 inline mr-2" />
                    Comprobante de Pago (Opcional)
                  </label>
                  <div className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    darkMode 
                      ? 'border-gray-600 hover:border-green-500 bg-gray-900/50' 
                      : 'border-gray-300 hover:border-green-500 bg-gray-50'
                  }`}>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className={`w-10 h-10 mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    {formData.comprobante ? (
                      <p className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        ✓ {formData.comprobante.name}
                      </p>
                    ) : (
                      <>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Arrastra o haz clic para subir
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          PDF, JPG, PNG (máx. 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notas Adicionales
                  </label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => handleChange('notas', e.target.value)}
                    placeholder="Información adicional sobre el pago..."
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none`}
                  />
                </div>

                {/* Info Alert */}
                <div className={`flex items-start gap-3 p-4 rounded-lg border ${
                  darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
                }`}>
                  <FileText className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                      Verificación de pago
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                      El especialista verificará tu pago en las próximas 24 horas. Recibirás una notificación.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg'
                    } text-white`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Registrando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Registrar Pago
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
