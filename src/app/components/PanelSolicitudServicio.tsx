import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, FileText, AlertCircle, Building2, Stethoscope, Send, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../App';
import { toast } from 'sonner@2.0.3';

interface PanelSolicitudServicioProps {
  isOpen: boolean;
  onClose: () => void;
  fromAgenda?: boolean;
  prefilledData?: {
    especialistaId: number;
    fecha: string;
    hora: string;
  };
}

export function PanelSolicitudServicio({ isOpen, onClose, fromAgenda = false, prefilledData }: PanelSolicitudServicioProps) {
  const { darkMode, userClinicas, crearSolicitud, getEspecialistaById, selectedSedeId, sedes } = useApp();
  
  // Obtener datos del especialista si viene de la agenda
  const especialistaActual = prefilledData ? getEspecialistaById(prefilledData.especialistaId) : null;
  
  // Filtrar sedes activas disponibles
  const sedesDisponibles = selectedSedeId && selectedSedeId !== 'all'
    ? sedes.filter(s => s.id === selectedSedeId && s.activo)
    : sedes.filter(s => s.activo);

  // Preseleccionar sede si solo hay una disponible (ej. por filtro de sede)
  useEffect(() => {
    if (sedesDisponibles.length === 1) {
      setFormData(prev => ({ ...prev, sedeId: sedesDisponibles[0].id }));
    }
  }, [sedesDisponibles]);

  const [formData, setFormData] = useState({
    sedeId: '',
    tipoServicio: '',
    mascota: '',
    especie: '',
    motivoClinico: '',
    prioridad: 'normal' as 'normal' | 'urgente',
    observaciones: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const tiposServicio = [
    'Consulta',
    'Procedimiento',
    'Cirugía',
    'Evaluación',
    'Emergencia',
    'Ecocardiograma Doppler',
    'Electrocardiograma',
    'Radiografía Torácica',
    'Ecografía Abdominal',
    'Ultrasonido Cardíaco'
  ];

  const especies = [
    'Canino',
    'Felino',
    'Exótico',
    'Ave',
    'Reptil'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!prefilledData) return;

    // Validaciones
    if (!formData.sedeId) {
      toast.error('Por favor selecciona una sede');
      return;
    }
    if (!formData.tipoServicio) {
      toast.error('Por favor selecciona el tipo de servicio');
      return;
    }
    if (!formData.mascota) {
      toast.error('Por favor ingresa el nombre de la mascota');
      return;
    }
    if (!formData.especie) {
      toast.error('Por favor selecciona la especie');
      return;
    }
    if (!formData.motivoClinico) {
      toast.error('Por favor describe el motivo clínico');
      return;
    }

    setIsSubmitting(true);

    try {
      const sedeObj = sedes.find(s => s.id === formData.sedeId);
      if (!sedeObj) return;

      const clinicaObj = userClinicas.find(c => c.id === sedeObj.clinicaId);
      if (!clinicaObj) return;

      const nuevaSolicitud = {
        clinica: clinicaObj.nombre,
        clinicaId: clinicaObj.id, // Asegurar que enviamos el ID también
        sedeId: selectedSedeId !== 'all' ? selectedSedeId : sedeObj.id, // Asignar sede seleccionada o la primera encontrada
        tipo: formData.tipoServicio,
        paciente: formData.mascota,
        especie: formData.especie,
        fechaSolicitada: prefilledData.fecha,
        horaSolicitada: prefilledData.hora,
        urgencia: formData.prioridad === 'urgente' ? 'alta' : 'media' as 'alta' | 'media',
        descripcion: formData.motivoClinico + (formData.observaciones ? `\n\nObservaciones: ${formData.observaciones}` : ''),
        direccion: clinicaObj.direccion,
        tarifa: especialistaActual?.tarifa || 0,
        estado: 'pendiente' as const,
        fechaSolicitud: new Date().toISOString(),
      };

      const success = await crearSolicitud(nuevaSolicitud);
      
      if (success) {
        toast.success(`Solicitud enviada a Dr. ${especialistaActual?.nombre} ${especialistaActual?.apellido}`);
        
        // Reset form
        setFormData({
          sedeId: '',
          tipoServicio: '',
          mascota: '',
          especie: '',
          motivoClinico: '',
          prioridad: 'normal',
          observaciones: ''
        });
        
        // Cerrar panel
        onClose();
      }
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      toast.error('Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!prefilledData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel lateral */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[500px] z-50 shadow-2xl overflow-hidden flex flex-col"
            style={{
              backgroundColor: darkMode ? '#111827' : '#FFFFFF'
            }}
          >
            {/* Header */}
            <div 
              className="px-6 py-5 border-b flex items-start justify-between"
              style={{
                borderColor: darkMode ? '#1F2937' : '#E2E8F0',
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(17, 24, 39, 0) 100%)'
                  : 'linear-gradient(135deg, rgba(249, 115, 22, 0.03) 0%, rgba(255, 255, 255, 0) 100%)'
              }}
            >
              <div className="flex-1">
                <h2 
                  className="text-2xl font-bold mb-2 flex items-center gap-2"
                  style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
                >
                  <Calendar className="w-6 h-6" style={{ color: '#F97316' }} />
                  Solicitar Servicio
                </h2>
                <div className="space-y-1">
                  <p 
                    className="text-sm font-semibold"
                    style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                  >
                    Dr. {especialistaActual?.nombre} {especialistaActual?.apellido}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4" style={{ color: '#F97316' }} />
                      <span className="text-xs font-medium" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                        {especialistaActual?.especialidad}
                      </span>
                    </div>
                    <div className="w-px h-3" style={{ backgroundColor: darkMode ? '#374151' : '#E2E8F0' }} />
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" style={{ color: '#3B82F6' }} />
                      <span className="text-xs font-medium" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                        {new Date(prefilledData.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="w-px h-3" style={{ backgroundColor: darkMode ? '#374151' : '#E2E8F0' }} />
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" style={{ color: '#10B981' }} />
                      <span className="text-xs font-medium" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                        {prefilledData.hora}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: darkMode ? 'rgba(107, 114, 128, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                  color: darkMode ? '#9CA3AF' : '#6B7280'
                }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Sede solicitante */}
              <div>
                <label 
                  className="block text-sm font-bold mb-2 flex items-center gap-1.5"
                  style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}
                >
                  <Building2 className="w-4 h-4" style={{ color: '#F97316' }} />
                  Sede Solicitante
                  <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={formData.sedeId}
                  onChange={(e) => handleInputChange('sedeId', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all text-sm font-medium"
                  style={{
                    backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                    borderColor: formData.sedeId ? '#F97316' : (darkMode ? '#374151' : '#E2E8F0'),
                    color: darkMode ? '#E5E7EB' : '#0F172A'
                  }}
                >
                  <option value="">Selecciona una sede</option>
                  {sedesDisponibles.map(sede => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Especialidad (bloqueada) */}
              <div>
                <label 
                  className="block text-sm font-bold mb-2 flex items-center gap-1.5"
                  style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}
                >
                  <Stethoscope className="w-4 h-4" style={{ color: '#6B7280' }} />
                  Especialidad
                </label>
                <div 
                  className="w-full px-4 py-3 rounded-xl border-2 text-sm font-medium flex items-center justify-between"
                  style={{
                    backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.3)' : '#F1F5F9',
                    borderColor: darkMode ? '#374151' : '#CBD5E1',
                    color: darkMode ? '#9CA3AF' : '#64748B'
                  }}
                >
                  {especialistaActual?.especialidad}
                  <span className="text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: darkMode ? '#374151' : '#E2E8F0' }}>
                    Bloqueado
                  </span>
                </div>
              </div>

              {/* Tipo de servicio */}
              <div>
                <label 
                  className="block text-sm font-bold mb-2 flex items-center gap-1.5"
                  style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}
                >
                  <FileText className="w-4 h-4" style={{ color: '#F97316' }} />
                  Tipo de Servicio
                  <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={formData.tipoServicio}
                  onChange={(e) => handleInputChange('tipoServicio', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all text-sm font-medium"
                  style={{
                    backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                    borderColor: formData.tipoServicio ? '#F97316' : (darkMode ? '#374151' : '#E2E8F0'),
                    color: darkMode ? '#E5E7EB' : '#0F172A'
                  }}
                >
                  <option value="">Selecciona el tipo</option>
                  {tiposServicio.map(tipo => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mascota */}
              <div>
                <label 
                  className="block text-sm font-bold mb-2 flex items-center gap-1.5"
                  style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}
                >
                  <User className="w-4 h-4" style={{ color: '#F97316' }} />
                  Paciente (Mascota)
                  <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.mascota}
                  onChange={(e) => handleInputChange('mascota', e.target.value)}
                  placeholder="Ej: Max, Luna, Toby..."
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all text-sm font-medium"
                  style={{
                    backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                    borderColor: formData.mascota ? '#F97316' : (darkMode ? '#374151' : '#E2E8F0'),
                    color: darkMode ? '#E5E7EB' : '#0F172A'
                  }}
                />
              </div>

              {/* Especie */}
              <div>
                <label 
                  className="block text-sm font-bold mb-2 flex items-center gap-1.5"
                  style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}
                >
                  <FileText className="w-4 h-4" style={{ color: '#3B82F6' }} />
                  Especie
                  <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={formData.especie}
                  onChange={(e) => handleInputChange('especie', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all text-sm font-medium"
                  style={{
                    backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                    borderColor: formData.especie ? '#F97316' : (darkMode ? '#374151' : '#E2E8F0'),
                    color: darkMode ? '#E5E7EB' : '#0F172A'
                  }}
                >
                  <option value="">Selecciona la especie</option>
                  {especies.map(especie => (
                    <option key={especie} value={especie}>
                      {especie}
                    </option>
                  ))}
                </select>
              </div>

              {/* Motivo clínico */}
              <div>
                <label 
                  className="block text-sm font-bold mb-2 flex items-center gap-1.5"
                  style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}
                >
                  <AlertCircle className="w-4 h-4" style={{ color: '#F97316' }} />
                  Motivo Clínico
                  <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  value={formData.motivoClinico}
                  onChange={(e) => handleInputChange('motivoClinico', e.target.value)}
                  placeholder="Motivo de la interconsulta, hallazgos relevantes, exámenes previos (sin adjuntar historia clínica)."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all text-sm font-medium resize-none"
                  style={{
                    backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                    borderColor: formData.motivoClinico ? '#F97316' : (darkMode ? '#374151' : '#E2E8F0'),
                    color: darkMode ? '#E5E7EB' : '#0F172A'
                  }}
                />
              </div>

              {/* Prioridad */}
              <div>
                <label 
                  className="block text-sm font-bold mb-3 flex items-center gap-1.5"
                  style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}
                >
                  <AlertCircle className="w-4 h-4" style={{ color: '#FACC15' }} />
                  Prioridad
                </label>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleInputChange('prioridad', 'normal')}
                    className="flex-1 px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold"
                    style={{
                      backgroundColor: formData.prioridad === 'normal' 
                        ? (darkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.08)')
                        : (darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC'),
                      borderColor: formData.prioridad === 'normal' ? '#22C55E' : (darkMode ? '#374151' : '#E2E8F0'),
                      color: formData.prioridad === 'normal' ? '#22C55E' : (darkMode ? '#9CA3AF' : '#64748B')
                    }}
                  >
                    Normal
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleInputChange('prioridad', 'urgente')}
                    className="flex-1 px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold"
                    style={{
                      backgroundColor: formData.prioridad === 'urgente' 
                        ? (darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)')
                        : (darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC'),
                      borderColor: formData.prioridad === 'urgente' ? '#EF4444' : (darkMode ? '#374151' : '#E2E8F0'),
                      color: formData.prioridad === 'urgente' ? '#EF4444' : (darkMode ? '#9CA3AF' : '#64748B')
                    }}
                  >
                    🚨 Urgente
                  </motion.button>
                </div>

                {/* Mensaje inteligente cuando es urgente */}
                <AnimatePresence>
                  {formData.prioridad === 'urgente' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mt-3"
                    >
                      <div 
                        className="rounded-xl p-3 border-2 flex items-center gap-3"
                        style={{
                          backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                          borderColor: darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'
                        }}
                      >
                        {/* Badge visual */}
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="flex-shrink-0"
                        >
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                            style={{
                              backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                              border: `2px solid #EF4444`
                            }}
                          >
                            🔥
                          </div>
                        </motion.div>
                        
                        {/* Texto */}
                        <div className="flex-1">
                          <p 
                            className="text-sm font-bold"
                            style={{ color: '#EF4444' }}
                          >
                            El especialista será notificado con prioridad
                          </p>
                          <p 
                            className="text-xs mt-0.5"
                            style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}
                          >
                            Respuesta esperada: dentro de 1 hora
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Observaciones */}
              <div>
                <label 
                  className="block text-sm font-bold mb-2 flex items-center gap-1.5"
                  style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}
                >
                  <FileText className="w-4 h-4" style={{ color: '#6B7280' }} />
                  Observaciones Adicionales
                  <span className="text-xs font-normal" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                    (opcional)
                  </span>
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  placeholder="Información adicional relevante..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all text-sm font-medium resize-none"
                  style={{
                    backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                    borderColor: darkMode ? '#374151' : '#E2E8F0',
                    color: darkMode ? '#E5E7EB' : '#0F172A'
                  }}
                />
              </div>

              {/* Mensaje de advertencia profesional */}
              <div 
                className="rounded-xl p-4 border-2 flex items-start gap-3"
                style={{
                  backgroundColor: darkMode ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.05)',
                  borderColor: darkMode ? 'rgba(249, 115, 22, 0.3)' : 'rgba(249, 115, 22, 0.2)'
                }}
              >
                <AlertCircle 
                  className="w-5 h-5 mt-0.5 flex-shrink-0" 
                  style={{ color: '#F97316' }} 
                />
                <div>
                  <p 
                    className="text-sm font-bold mb-1"
                    style={{ color: darkMode ? '#FB923C' : '#EA580C' }}
                  >
                    ⚠️ Esta solicitud quedará pendiente de confirmación.
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: darkMode ? '#FDBA74' : '#F97316' }}
                  >
                    El especialista podrá aceptar, rechazar o proponer otro horario.
                  </p>
                </div>
              </div>

              {/* Tarifa */}
              <div 
                className="rounded-xl p-4 border-2"
                style={{
                  backgroundColor: darkMode ? 'rgba(249, 115, 22, 0.05)' : 'rgba(249, 115, 22, 0.03)',
                  borderColor: darkMode ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.15)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}>
                    Tarifa del servicio
                  </span>
                  <span className="text-2xl font-black" style={{ color: '#F97316' }}>
                    ${especialistaActual?.tarifa.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer con botones */}
            <div 
              className="px-6 py-4 border-t flex items-center gap-3"
              style={{
                borderColor: darkMode ? '#1F2937' : '#E2E8F0',
                backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.8)' : '#FFFFFF'
              }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-xl text-sm font-bold border-2 transition-all"
                style={{
                  backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : '#F8FAFC',
                  borderColor: darkMode ? '#374151' : '#E2E8F0',
                  color: darkMode ? '#E5E7EB' : '#0F172A',
                  opacity: isSubmitting ? 0.5 : 1
                }}
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: isSubmitting ? '#9CA3AF' : '#F97316',
                  opacity: isSubmitting ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = '#EA580C';
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = '#F97316';
                }}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Clock className="w-5 h-5" />
                    </motion.div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Solicitar horario
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}