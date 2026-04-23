import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  ClipboardList, 
  Pill, 
  Syringe, 
  Save, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Activity, 
  Thermometer, 
  Weight, 
  HeartPulse, 
  FileText,
  UserPlus,
  CalendarClock
} from 'lucide-react';
import { useApp } from '../App';
import { toast } from 'sonner@2.0.3';

interface ConsultaClinicaWizardProps {
  paciente: any;
  citaId?: number;
  onClose: () => void;
  onFinalizar: (datosConsulta: any) => void;
}

export function ConsultaClinicaWizard({ paciente, citaId, onClose, onFinalizar }: ConsultaClinicaWizardProps) {
  const { darkMode } = useApp();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado unificado de la consulta
  const [consulta, setConsulta] = useState({
    // Fase 1: Anamnesis
    motivo: '',
    anamnesis: '',
    // Constantes Fisiológicas
    peso: '',
    temperatura: '',
    frecuenciaCardiaca: '',
    frecuenciaRespiratoria: '',
    mucosas: 'rosadas',
    tiempoLlenadoCapilar: '2',
    
    // Fase 2: Diagnóstico
    hallazgos: '',
    diagnosticoPresuntivo: '',
    pruebasSolicitadas: [] as string[],
    
    // Fase 3: Tratamiento
    tratamientoEnClinica: '',
    recetaMedica: '',
    
    // Fase 4: Plan (Vacunas, Derivaciones, Prox Cita)
    aplicarVacuna: false,
    vacunaNombre: '',
    requiereInterconsulta: false,
    especialidadInterconsulta: '',
    proximaCita: '',
    notasFinales: ''
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onFinalizar({
      ...consulta,
      pacienteId: paciente.id,
      citaId: citaId,
      fecha: new Date().toISOString()
    });
    
    setIsSubmitting(false);
  };

  // Renderizado de pasos
  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 px-4">
      {[
        { num: 1, icon: ClipboardList, label: 'Anamnesis' },
        { num: 2, icon: Stethoscope, label: 'Diagnóstico' },
        { num: 3, icon: Pill, label: 'Tratamiento' },
        { num: 4, icon: CheckCircle2, label: 'Cierre' },
      ].map((s, idx) => (
        <div key={s.num} className="flex flex-col items-center relative z-10 w-1/4">
          <motion.div
            initial={false}
            animate={{
              backgroundColor: step >= s.num ? '#F97316' : (darkMode ? '#1F2937' : '#E2E8F0'),
              borderColor: step >= s.num ? '#F97316' : (darkMode ? '#374151' : '#CBD5E1'),
              scale: step === s.num ? 1.1 : 1
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
              step >= s.num ? 'text-white shadow-lg shadow-orange-500/30' : 'text-gray-400'
            }`}
          >
            <s.icon className="w-5 h-5" />
          </motion.div>
          <span className={`text-xs font-medium mt-2 ${
            step >= s.num ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-gray-500'
          }`}>
            {s.label}
          </span>
          
          {/* Connector Line */}
          {idx < 3 && (
            <div className="absolute top-5 left-1/2 w-full h-[2px] -z-10">
              <div className={`h-full transition-all duration-500 ${
                step > s.num ? 'bg-orange-500' : (darkMode ? 'bg-gray-800' : 'bg-gray-200')
              }`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-4xl h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${
          darkMode ? 'bg-[#0B0F1A] border border-gray-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex justify-between items-center ${
          darkMode ? 'border-gray-800 bg-[#111827]' : 'border-gray-100 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-lg">
              {paciente.nombre.charAt(0)}
            </div>
            <div>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Consulta Clínica: {paciente.nombre}
              </h2>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {paciente.especie} • {paciente.raza} • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-400' : 'border-gray-200 hover:bg-gray-100 text-gray-600'
            }`}
          >
            Cancelar / Guardar Borrador
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-3xl mx-auto">
            {renderStepIndicator()}

            <AnimatePresence mode='wait'>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="mt-6 space-y-6"
              >
                {/* STEP 1: ANAMNESIS & EXAMEN FÍSICO */}
                {step === 1 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-1 md:col-span-2 space-y-4">
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Motivo de la consulta
                        </label>
                        <textarea
                          value={consulta.motivo}
                          onChange={e => setConsulta({...consulta, motivo: e.target.value})}
                          placeholder="¿Por qué viene el paciente hoy?"
                          className={`w-full h-24 p-3 rounded-xl border focus:ring-2 focus:ring-orange-500 outline-none transition-all ${
                            darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2">
                         <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                           <Activity className="w-4 h-4" /> Constantes Fisiológicas
                         </h3>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { label: 'Peso (kg)', icon: Weight, key: 'peso' },
                              { label: 'Temp (°C)', icon: Thermometer, key: 'temperatura' },
                              { label: 'FC (lpm)', icon: HeartPulse, key: 'frecuenciaCardiaca' },
                              { label: 'FR (rpm)', icon: Activity, key: 'frecuenciaRespiratoria' },
                            ].map((item) => (
                              <div key={item.key} className={`p-3 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-center gap-2 mb-2 text-gray-500">
                                  <item.icon className="w-4 h-4" />
                                  <span className="text-xs font-medium">{item.label}</span>
                                </div>
                                <input
                                  type="text" // text to allow decimals easily or ranges
                                  value={(consulta as any)[item.key]}
                                  onChange={e => setConsulta({...consulta, [item.key]: e.target.value})}
                                  className={`w-full bg-transparent font-bold text-lg outline-none ${darkMode ? 'text-white' : 'text-gray-900'}`}
                                  placeholder="--"
                                />
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="col-span-1 md:col-span-2 space-y-4">
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Historia Clínica / Anamnesis Detallada
                        </label>
                        <textarea
                          value={consulta.anamnesis}
                          onChange={e => setConsulta({...consulta, anamnesis: e.target.value})}
                          placeholder="Antecedentes, evolución de síntomas, apetito, estado de ánimo..."
                          className={`w-full h-32 p-3 rounded-xl border focus:ring-2 focus:ring-orange-500 outline-none transition-all ${
                            darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 2: DIAGNÓSTICO */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Hallazgos del Examen Físico
                        </label>
                        <textarea
                          value={consulta.hallazgos}
                          onChange={e => setConsulta({...consulta, hallazgos: e.target.value})}
                          placeholder="Descripción de lo observado durante la exploración..."
                          className={`w-full h-32 p-3 rounded-xl border focus:ring-2 focus:ring-orange-500 outline-none transition-all ${
                            darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                    </div>

                    <div className={`p-6 rounded-xl border-l-4 border-orange-500 ${darkMode ? 'bg-gray-800' : 'bg-orange-50'}`}>
                        <label className={`block text-sm font-bold mb-2 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <Stethoscope className="w-4 h-4 text-orange-500" />
                          Diagnóstico Presuntivo / Definitivo
                        </label>
                        <textarea
                          value={consulta.diagnosticoPresuntivo}
                          onChange={e => setConsulta({...consulta, diagnosticoPresuntivo: e.target.value})}
                          placeholder="Escribe el diagnóstico principal..."
                          className={`w-full h-24 p-3 rounded-lg border-0 focus:ring-0 bg-transparent text-lg font-medium resize-none placeholder-opacity-50 ${
                             darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                          }`}
                        />
                    </div>
                  </div>
                )}

                {/* STEP 3: TRATAMIENTO */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Tratamiento aplicado en clínica (si aplica)
                        </label>
                        <textarea
                          value={consulta.tratamientoEnClinica}
                          onChange={e => setConsulta({...consulta, tratamientoEnClinica: e.target.value})}
                          placeholder="Inyecciones, fluidoterapia, curaciones realizadas ahora..."
                          className={`w-full h-24 p-3 rounded-xl border focus:ring-2 focus:ring-orange-500 outline-none transition-all ${
                            darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                          }`}
                        />
                    </div>

                    <div className={`p-1 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className={`px-4 py-3 border-b flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                           <h3 className={`font-semibold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                             <FileText className="w-4 h-4 text-blue-500" />
                             Receta Médica / Indicaciones
                           </h3>
                           <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-500 rounded font-medium">Para el propietario</span>
                        </div>
                        <textarea
                          value={consulta.recetaMedica}
                          onChange={e => setConsulta({...consulta, recetaMedica: e.target.value})}
                          placeholder="- Medicamento A: 1 tableta cada 12h x 5 días..."
                          className={`w-full h-48 p-4 bg-transparent border-none outline-none resize-none font-mono text-sm ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        />
                    </div>
                  </div>
                )}

                {/* STEP 4: CIERRE Y PLAN */}
                {step === 4 && (
                  <div className="space-y-6">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Integra acciones adicionales antes de cerrar la consulta. Esto evitará que tengas que navegar a otros módulos.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Vacunación */}
                      <div 
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          consulta.aplicarVacuna 
                            ? 'border-green-500 bg-green-500/5' 
                            : (darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300')
                        }`}
                        onClick={() => setConsulta({...consulta, aplicarVacuna: !consulta.aplicarVacuna})}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${consulta.aplicarVacuna ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <Syringe className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-center">
                               <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Registrar Vacunación</h4>
                               <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                 consulta.aplicarVacuna ? 'border-green-500 bg-green-500' : 'border-gray-400'
                               }`}>
                                 {consulta.aplicarVacuna && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                               </div>
                             </div>
                             {consulta.aplicarVacuna && (
                               <input 
                                 type="text"
                                 placeholder="Nombre de la vacuna / Lote"
                                 onClick={e => e.stopPropagation()}
                                 value={consulta.vacunaNombre}
                                 onChange={e => setConsulta({...consulta, vacunaNombre: e.target.value})}
                                 className={`mt-2 w-full p-2 rounded text-sm border outline-none ${
                                   darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300'
                                 }`}
                               />
                             )}
                          </div>
                        </div>
                      </div>

                      {/* Interconsulta */}
                      <div 
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          consulta.requiereInterconsulta 
                            ? 'border-purple-500 bg-purple-500/5' 
                            : (darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300')
                        }`}
                        onClick={() => setConsulta({...consulta, requiereInterconsulta: !consulta.requiereInterconsulta})}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${consulta.requiereInterconsulta ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <UserPlus className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-center">
                               <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Derivar / Interconsulta</h4>
                               <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                 consulta.requiereInterconsulta ? 'border-purple-500 bg-purple-500' : 'border-gray-400'
                               }`}>
                                 {consulta.requiereInterconsulta && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                               </div>
                             </div>
                             {consulta.requiereInterconsulta && (
                               <select 
                                 onClick={e => e.stopPropagation()}
                                 value={consulta.especialidadInterconsulta}
                                 onChange={e => setConsulta({...consulta, especialidadInterconsulta: e.target.value})}
                                 className={`mt-2 w-full p-2 rounded text-sm border outline-none ${
                                   darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white border-gray-300'
                                 }`}
                               >
                                 <option value="">Seleccionar Especialidad...</option>
                                 <option value="cardiologia">Cardiología</option>
                                 <option value="dermatologia">Dermatología</option>
                                 <option value="cirugia">Cirugía</option>
                               </select>
                             )}
                          </div>
                        </div>
                      </div>

                      {/* Próxima Cita */}
                      <div className={`col-span-1 md:col-span-2 p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                         <div className="flex items-center gap-3 mb-2">
                           <CalendarClock className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                           <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sugerir Próximo Control</h4>
                         </div>
                         <div className="flex gap-3">
                            {['1 Semana', '15 Días', '1 Mes'].map(time => (
                               <button 
                                 key={time} 
                                 onClick={() => setConsulta({...consulta, proximaCita: time})}
                                 className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                                   consulta.proximaCita === time 
                                     ? 'bg-orange-500 text-white border-orange-500'
                                     : (darkMode ? 'border-gray-600 text-gray-400 hover:border-gray-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50')
                                 }`}
                               >
                                 {time}
                               </button>
                            ))}
                         </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className={`px-6 py-4 border-t flex justify-between items-center ${
          darkMode ? 'border-gray-800 bg-[#111827]' : 'border-gray-100 bg-white'
        }`}>
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${
              step === 1 
                ? 'opacity-50 cursor-not-allowed text-gray-400' 
                : (darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100')
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="flex items-center gap-2">
             <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
               Paso {step} de {totalSteps}
             </span>
          </div>

          <button
            onClick={step === totalSteps ? handleSubmit : handleNext}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all ${
              step === totalSteps 
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:scale-105 shadow-green-500/20' 
                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-105 shadow-orange-500/20'
            }`}
          >
            {isSubmitting ? (
              'Guardando...'
            ) : step === totalSteps ? (
              <>
                <Save className="w-4 h-4" />
                Finalizar Atención
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}