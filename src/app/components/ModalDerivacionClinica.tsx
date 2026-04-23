import { useState } from 'react';
import { X, AlertCircle, CheckCircle, Clock, Heart, Activity, Droplet, Wind, Thermometer, Pill, Brain, Utensils, FileText, User } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { motion, AnimatePresence } from 'motion/react';

interface ModalDerivacionClinicaProps {
  darkMode: boolean;
  paciente: {
    id: number;
    nombre: string;
    especie: string;
    raza: string;
    edad: string;
  };
  onClose: () => void;
  onDerivar: (derivacion: DerivacionData) => void;
}

export interface DerivacionData {
  especialidadDestino: string;
  motivoClinico: string;
  urgencia: 'baja' | 'media' | 'alta' | 'critica';
  informacionCompartir: {
    diagnosticos: boolean;
    estudios: boolean;
    medicacion: boolean;
    historiaCompleta: boolean;
  };
  doctorDestino?: string;
  notasAdicionales?: string;
}

const especialidades = [
  { value: 'Cardiología Veterinaria', icon: Heart, color: 'from-red-500 to-pink-600' },
  { value: 'Cirugía Veterinaria', icon: Activity, color: 'from-purple-500 to-indigo-600' },
  { value: 'Anestesiología Veterinaria', icon: Thermometer, color: 'from-cyan-500 to-blue-600' },
  { value: 'Ecografía Veterinaria', icon: Activity, color: 'from-teal-500 to-cyan-600' },
  { value: 'Odontología Veterinaria', icon: Pill, color: 'from-pink-500 to-rose-600' },
  { value: 'Neumología Veterinaria', icon: Wind, color: 'from-sky-500 to-blue-600' },
  { value: 'Dermatología Veterinaria', icon: Pill, color: 'from-amber-500 to-orange-600' },
  { value: 'Nutrición Veterinaria', icon: Utensils, color: 'from-emerald-500 to-teal-600' },
  { value: 'Etología Veterinaria', icon: Brain, color: 'from-violet-500 to-purple-600' },
  { value: 'Neurología Veterinaria', icon: Brain, color: 'from-indigo-500 to-purple-600' },
  { value: 'Oncología Veterinaria', icon: Activity, color: 'from-rose-500 to-red-600' },
  { value: 'Medicina Interna', icon: FileText, color: 'from-blue-500 to-indigo-600' },
];

export function ModalDerivacionClinica({ darkMode, paciente, onClose, onDerivar }: ModalDerivacionClinicaProps) {
  const [especialidadDestino, setEspecialidadDestino] = useState('');
  const [motivoClinico, setMotivoClinico] = useState('');
  const [urgencia, setUrgencia] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [doctorDestino, setDoctorDestino] = useState('');
  const [notasAdicionales, setNotasAdicionales] = useState('');
  const [informacionCompartir, setInformacionCompartir] = useState({
    diagnosticos: true,
    estudios: true,
    medicacion: true,
    historiaCompleta: false,
  });

  const handleSubmit = () => {
    if (!especialidadDestino || !motivoClinico) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const derivacion: DerivacionData = {
      especialidadDestino,
      motivoClinico,
      urgencia,
      informacionCompartir,
      doctorDestino: doctorDestino || undefined,
      notasAdicionales: notasAdicionales || undefined,
    };

    onDerivar(derivacion);
  };

  const getUrgenciaConfig = (nivel: string) => {
    const config = {
      baja: { label: 'Baja', color: 'bg-green-500/20 text-green-600 border-green-500/50 dark:bg-green-900/30 dark:text-green-400', icon: Clock },
      media: { label: 'Media', color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
      alta: { label: 'Alta', color: 'bg-orange-500/20 text-orange-600 border-orange-500/50 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertCircle },
      critica: { label: 'Crítica', color: 'bg-red-500/20 text-red-600 border-red-500/50 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
    };
    return config[nivel as keyof typeof config] || config.media;
  };

  const especialidadSeleccionada = especialidades.find(e => e.value === especialidadDestino);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          } shadow-2xl`}
        >
          {/* Header */}
          <div className={`sticky top-0 z-10 px-6 py-4 border-b ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Derivar a Especialidad
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  Paciente: {paciente.nombre} • {paciente.especie} • {paciente.raza} • {paciente.edad}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Especialidad Destino */}
            <div>
              <Label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <Activity className="w-4 h-4 text-orange-500" />
                Especialidad Destino *
              </Label>
              <Select value={especialidadDestino} onValueChange={setEspecialidadDestino}>
                <SelectTrigger className={`mt-2 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}`}>
                  <SelectValue placeholder="Selecciona una especialidad" />
                </SelectTrigger>
                <SelectContent className={darkMode ? 'bg-gray-900 border-gray-700' : ''}>
                  {especialidades.map((esp) => {
                    const Icon = esp.icon;
                    return (
                      <SelectItem
                        key={esp.value}
                        value={esp.value}
                        className={darkMode ? 'text-white hover:bg-gray-800' : ''}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${esp.color} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span>{esp.value}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {especialidadSeleccionada && (
                <div className={`mt-3 p-3 rounded-lg flex items-center gap-3 ${
                  darkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'
                }`}>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${especialidadSeleccionada.color} flex items-center justify-center`}>
                    <especialidadSeleccionada.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                      {especialidadSeleccionada.value}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                      Especialidad seleccionada
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Urgencia */}
            <div>
              <Label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Nivel de Urgencia *
              </Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {(['baja', 'media', 'alta', 'critica'] as const).map((nivel) => {
                  const config = getUrgenciaConfig(nivel);
                  const UrgenciaIcon = config.icon;
                  const selected = urgencia === nivel;
                  
                  return (
                    <button
                      key={nivel}
                      onClick={() => setUrgencia(nivel)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selected
                          ? config.color + ' scale-105'
                          : darkMode
                          ? 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <UrgenciaIcon className={`w-5 h-5 mx-auto mb-1 ${selected ? '' : 'opacity-50'}`} />
                      <p className="text-xs font-medium">{config.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Motivo Clínico */}
            <div>
              <Label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <FileText className="w-4 h-4 text-orange-500" />
                Motivo Clínico de Derivación *
              </Label>
              <Textarea
                value={motivoClinico}
                onChange={(e) => setMotivoClinico(e.target.value)}
                placeholder="Describe el motivo clínico de la derivación, hallazgos relevantes, estudios realizados, y cualquier información pertinente para el especialista..."
                rows={5}
                className={`mt-2 ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder:text-gray-500' : ''}`}
              />
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {motivoClinico.length} caracteres
              </p>
            </div>

            {/* Checklist de Información */}
            <div>
              <Label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Información a Compartir
              </Label>
              <div className={`p-4 rounded-lg space-y-3 ${
                darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'
              }`}>
                {[
                  { key: 'diagnosticos', label: 'Diagnósticos previos', description: 'Historial de diagnósticos del paciente' },
                  { key: 'estudios', label: 'Estudios y laboratorios', description: 'Resultados de análisis, imágenes, etc.' },
                  { key: 'medicacion', label: 'Medicación actual', description: 'Tratamientos y fármacos en curso' },
                  { key: 'historiaCompleta', label: 'Historia clínica completa', description: 'Acceso total al expediente' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      informacionCompartir[item.key as keyof typeof informacionCompartir]
                        ? darkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'
                        : darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={informacionCompartir[item.key as keyof typeof informacionCompartir]}
                      onChange={(e) => setInformacionCompartir({
                        ...informacionCompartir,
                        [item.key]: e.target.checked,
                      })}
                      className="mt-0.5 w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.label}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Doctor Destino (Opcional) */}
            <div>
              <Label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <User className="w-4 h-4 text-orange-500" />
                Doctor Destino (Opcional)
              </Label>
              <Input
                value={doctorDestino}
                onChange={(e) => setDoctorDestino(e.target.value)}
                placeholder="Ej: Dr. Juan Pérez"
                className={`mt-2 ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder:text-gray-500' : ''}`}
              />
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Si conoces al especialista específico, puedes indicarlo aquí
              </p>
            </div>

            {/* Notas Adicionales */}
            <div>
              <Label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <FileText className="w-4 h-4 text-orange-500" />
                Notas Adicionales (Opcional)
              </Label>
              <Textarea
                value={notasAdicionales}
                onChange={(e) => setNotasAdicionales(e.target.value)}
                placeholder="Cualquier información adicional relevante..."
                rows={3}
                className={`mt-2 ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder:text-gray-500' : ''}`}
              />
            </div>
          </div>

          {/* Footer */}
          <div className={`sticky bottom-0 px-6 py-4 border-t ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between gap-4">
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                * Campos obligatorios
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : ''}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!especialidadDestino || !motivoClinico}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Derivar a Especialidad
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
