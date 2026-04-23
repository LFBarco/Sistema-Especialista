import { useState } from 'react';
import { X, Send, Calendar, Clock, AlertCircle, Building2, User, Stethoscope } from 'lucide-react';
import { useApp } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface SolicitudServicioModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Props opcionales para pre-llenar el formulario desde agenda
  prefilledData?: {
    especialistaId?: number;
    fecha?: string;
    hora?: string;
  };
  // Si viene desde agenda, ocultar ciertos campos
  fromAgenda?: boolean;
}

type TipoServicio = 
  | 'ecografia' 
  | 'ecocardiograma' 
  | 'cirugia' 
  | 'consulta' 
  | 'anestesia' 
  | 'laboratorio'
  | 'otro';

type Urgencia = 'baja' | 'media' | 'alta' | 'critica';

export function SolicitudServicioModal({ isOpen, onClose, prefilledData, fromAgenda = false }: SolicitudServicioModalProps) {
  const { darkMode, crearSolicitud, userClinicas, especialistas, especialistaSeleccionado, getEspecialistaById, sedes, selectedSedeId } = useApp();

  const especialistaPreseleccionado = getEspecialistaById(
    prefilledData?.especialistaId || especialistaSeleccionado
  );

  // Filtrar sedes activas
  const sedesDisponibles = sedes.filter(s => s.activo);

  const [formData, setFormData] = useState({
    sedeId: selectedSedeId && selectedSedeId !== 'all' ? selectedSedeId : sedesDisponibles[0]?.id || '',
    especialistaId: prefilledData?.especialistaId || especialistaSeleccionado,
    paciente: '',
    especie: '',
    tipoServicio: 'consulta' as TipoServicio,
    fechaTentativa: prefilledData?.fecha || '',
    horaTentativa: prefilledData?.hora || '',
    urgencia: 'media' as Urgencia,
    observaciones: '',
    telefono: '',
    email: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener el especialista actual seleccionado en el formulario
  const especialistaActual = getEspecialistaById(formData.especialistaId);

  const tiposServicio: { value: TipoServicio; label: string; tarifa: number }[] = [
    { value: 'consulta', label: 'Consulta Cardiológica', tarifa: 200 },
    { value: 'ecocardiograma', label: 'Ecocardiograma Doppler', tarifa: 350 },
    { value: 'ecografia', label: 'Ecografía General', tarifa: 180 },
    { value: 'cirugia', label: 'Cirugía Especializada', tarifa: 800 },
    { value: 'anestesia', label: 'Anestesia General', tarifa: 250 },
    { value: 'laboratorio', label: 'Estudios de Laboratorio', tarifa: 150 },
    { value: 'otro', label: 'Otro Servicio', tarifa: 0 }
  ];

  const especies = [
    'Canino - Labrador',
    'Canino - Pastor Alemán',
    'Canino - Golden Retriever',
    'Canino - Bulldog',
    'Canino - Chihuahua',
    'Felino - Persa',
    'Felino - Siamés',
    'Felino - Maine Coon',
    'Felino - Británico',
    'Otro'
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.paciente || !formData.especie || !formData.fechaTentativa || !formData.horaTentativa) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    if (!formData.sedeId) {
      toast.error('Por favor selecciona una sede');
      return;
    }

    setIsSubmitting(true);

    try {
      const tarifaServicio = tiposServicio.find(t => t.value === formData.tipoServicio)?.tarifa || 0;

      // Obtener la sede seleccionada y su clínica asociada
      const sedeSeleccionada = sedes.find(s => s.id === formData.sedeId);
      const clinicaObj = userClinicas.find(c => c.id === sedeSeleccionada?.clinicaId);
      
      const nuevaSolicitud = {
        clinica: clinicaObj?.nombre || '',
        clinicaId: clinicaObj?.id || '',
        sedeId: formData.sedeId,
        tipo: tiposServicio.find(t => t.value === formData.tipoServicio)?.label || 'Servicio',
        paciente: formData.paciente,
        especie: formData.especie,
        fechaSolicitada: formData.fechaTentativa,
        horaSolicitada: formData.horaTentativa,
        urgencia: formData.urgencia,
        descripcion: formData.observaciones,
        tarifa: tarifaServicio,
        direccion: sedeSeleccionada?.direccion || '',
        estado: 'pendiente' as const,
        fechaSolicitud: new Date().toISOString()
      };

      const success = await crearSolicitud(nuevaSolicitud);

      if (success) {
        toast.success('Solicitud enviada correctamente', {
          description: 'El especialista revisará tu solicitud pronto'
        });

        // Reset form
        setFormData({
          sedeId: selectedSedeId && selectedSedeId !== 'all' ? selectedSedeId : sedesDisponibles[0]?.id || '',
          especialistaId: especialistaSeleccionado,
          paciente: '',
          especie: '',
          tipoServicio: 'consulta',
          fechaTentativa: '',
          horaTentativa: '',
          urgencia: 'media',
          observaciones: '',
          telefono: '',
          email: ''
        });

        onClose();
      }
    } catch (error) {
      toast.error('Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-3xl my-8 rounded-2xl shadow-2xl ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Solicitar Servicio Especialista
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Complete el formulario para enviar su solicitud
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Grid de 2 columnas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sede - Solo mostrar si NO viene desde agenda */}
                  {!fromAgenda && (
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Building2 className="w-4 h-4 inline mr-2" />
                        Sede / Clínica *
                      </label>
                      <select
                        value={formData.sedeId}
                        onChange={(e) => handleChange('sedeId', e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                        required
                      >
                        {sedesDisponibles.length === 0 ? (
                          <option value="">No hay sedes disponibles</option>
                        ) : (
                          sedesDisponibles.map((sede) => {
                            const clinica = userClinicas.find(c => c.id === sede.clinicaId);
                            return (
                              <option key={sede.id} value={sede.id}>
                                {sede.nombre} - {sede.ciudad} {clinica ? `(${clinica.nombre})` : ''}
                              </option>
                            );
                          })
                        )}
                      </select>
                      {sedesDisponibles.length > 0 && formData.sedeId && (
                        <p className={`text-xs mt-2 flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Building2 className="w-3 h-3" />
                          {sedesDisponibles.find(s => s.id === formData.sedeId)?.direccion}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Especialista - Solo mostrar si NO viene desde agenda */}
                  {!fromAgenda && (
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <User className="w-4 h-4 inline mr-2" />
                        Especialista
                      </label>
                      <select
                        value={formData.especialistaId}
                        onChange={(e) => handleChange('especialistaId', Number(e.target.value))}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                      >
                        {especialistas.map((esp) => (
                          <option key={esp.id} value={esp.id}>
                            Dr. {esp.nombre} {esp.apellido} - {esp.especialidad} (${esp.tarifa})
                          </option>
                        ))}
                      </select>
                      {especialistaActual && (
                        <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          ⭐ {especialistaActual.rating} • {especialistaActual.experiencia} años de experiencia
                        </p>
                      )}
                    </div>
                  )}

                  {/* Info del especialista cuando viene desde agenda */}
                  {fromAgenda && especialistaActual && (
                    <div className={`md:col-span-2 p-4 rounded-lg border-2 ${
                      darkMode ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          darkMode ? 'bg-orange-500/20' : 'bg-orange-100'
                        }`}>
                          <User className="w-6 h-6 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Dr. {especialistaActual.nombre} {especialistaActual.apellido}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                            {especialistaActual.especialidad}
                          </p>
                          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            ⭐ {especialistaActual.rating} • {especialistaActual.experiencia} años exp. • ${especialistaActual.tarifa}
                          </p>
                        </div>
                        {prefilledData?.fecha && prefilledData?.hora && (
                          <div className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                            <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              FECHA Y HORA SELECCIONADA
                            </p>
                            <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {new Date(prefilledData.fecha).toLocaleDateString('es-ES', { 
                                weekday: 'short', 
                                day: '2-digit', 
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                            <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {prefilledData.hora}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tipo de Servicio */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tipo de Servicio *
                    </label>
                    <select
                      value={formData.tipoServicio}
                      onChange={(e) => handleChange('tipoServicio', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                    >
                      {tiposServicio.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label} {tipo.tarifa > 0 && `- $${tipo.tarifa}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Paciente */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nombre del Paciente *
                    </label>
                    <input
                      type="text"
                      value={formData.paciente}
                      onChange={(e) => handleChange('paciente', e.target.value)}
                      placeholder="Ej: Max"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                      required
                    />
                  </div>

                  {/* Especie */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Especie / Raza *
                    </label>
                    <select
                      value={formData.especie}
                      onChange={(e) => handleChange('especie', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                      required
                    >
                      <option value="">Seleccione especie</option>
                      {especies.map((esp) => (
                        <option key={esp} value={esp}>
                          {esp}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fecha Tentativa - Solo mostrar si NO viene desde agenda */}
                  {!fromAgenda && (
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Fecha Tentativa *
                      </label>
                      <input
                        type="date"
                        value={formData.fechaTentativa}
                        onChange={(e) => handleChange('fechaTentativa', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                        required
                      />
                    </div>
                  )}

                  {/* Hora Tentativa - Solo mostrar si NO viene desde agenda */}
                  {!fromAgenda && (
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Clock className="w-4 h-4 inline mr-2" />
                        Hora Tentativa *
                      </label>
                      <input
                        type="time"
                        value={formData.horaTentativa}
                        onChange={(e) => handleChange('horaTentativa', e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                        required
                      />
                    </div>
                  )}

                  {/* Urgencia */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      Urgencia
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: 'baja', label: 'Baja', color: 'blue' },
                        { value: 'media', label: 'Media', color: 'yellow' },
                        { value: 'alta', label: 'Alta', color: 'orange' },
                        { value: 'critica', label: 'Crítica', color: 'red' }
                      ].map((urgencia) => (
                        <button
                          key={urgencia.value}
                          type="button"
                          onClick={() => handleChange('urgencia', urgencia.value)}
                          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                            formData.urgencia === urgencia.value
                              ? `bg-${urgencia.color}-500 text-white shadow-lg`
                              : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {urgencia.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Observaciones Clínicas
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => handleChange('observaciones', e.target.value)}
                    placeholder="Describa el motivo de la consulta, síntomas relevantes, historial..."
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none`}
                  />
                </div>

                {/* Info Box */}
                <div className={`flex items-start gap-3 p-4 rounded-lg border ${
                  darkMode ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'
                }`}>
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-orange-300' : 'text-orange-800'}`}>
                      ⚠️ Esta solicitud quedará pendiente de confirmación.
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                      El especialista podrá aceptar, rechazar o proponer otro horario.
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
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg'
                    } text-white`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="w-5 h-5" />
                        Solicitar horario
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