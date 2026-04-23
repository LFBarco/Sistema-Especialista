import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldAlert, UserCheck, AlertCircle, ArrowLeft, Info } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useApp } from '../App';

interface PacienteBasico {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  edad?: string;
  sexo?: string;
  foto?: string;
  propietario?: {
    nombre: string;
  };
  doctorPropietario?: {
    nombre: string;
    especialidad: string;
  };
}

interface Props {
  paciente: PacienteBasico;
  onSolicitarAcceso: (pacienteId: number) => void;
  onVolver: () => void;
}

export function PacientePerfilRestringido({ paciente, onSolicitarAcceso, onVolver }: Props) {
  const { darkMode } = useApp();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-5xl mx-auto">
        
        {/* Header con botón volver */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onVolver}
            className={`${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Alert de seguridad superior */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg border-2 ${
            darkMode 
              ? 'bg-orange-900/20 border-orange-500/50' 
              : 'bg-orange-50 border-orange-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
            <div className="flex-1">
              <p className={`font-semibold ${darkMode ? 'text-orange-300' : 'text-orange-900'}`}>
                Información Clínica Protegida
              </p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                Este paciente pertenece a otro especialista. Para acceder a su historia clínica completa, 
                debes solicitar acceso clínico al doctor propietario.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contenedor con información básica */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`relative overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            
            {/* Badge de estado en esquina superior derecha */}
            <div className="absolute top-4 right-4 z-10">
              <Badge 
                className={`${
                  darkMode 
                    ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700' 
                    : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                } px-3 py-1`}
              >
                <Lock className="w-3 h-3 mr-1" />
                Acceso Restringido
              </Badge>
            </div>

            {/* Información básica del paciente - SIN BLUR */}
            <div className="p-8">
              <div className="flex items-start gap-6">
                
                {/* Foto del paciente */}
                <div className="flex-shrink-0">
                  <div 
                    className={`w-32 h-32 rounded-2xl flex items-center justify-center text-5xl ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                    style={{
                      background: paciente.foto 
                        ? `url(${paciente.foto})` 
                        : darkMode 
                          ? 'linear-gradient(135deg, #374151 0%, #1F2937 100%)'
                          : 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)'
                    }}
                  >
                    {!paciente.foto && '🐕'}
                  </div>
                </div>

                {/* Datos básicos */}
                <div className="flex-1">
                  <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {paciente.nombre}
                  </h1>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    <Badge variant="outline" className={darkMode ? 'border-gray-600 text-gray-300' : ''}>
                      {paciente.especie}
                    </Badge>
                    <Badge variant="outline" className={darkMode ? 'border-gray-600 text-gray-300' : ''}>
                      {paciente.raza}
                    </Badge>
                    {paciente.edad && (
                      <Badge variant="outline" className={darkMode ? 'border-gray-600 text-gray-300' : ''}>
                        {paciente.edad}
                      </Badge>
                    )}
                    {paciente.sexo && (
                      <Badge variant="outline" className={darkMode ? 'border-gray-600 text-gray-300' : ''}>
                        {paciente.sexo}
                      </Badge>
                    )}
                  </div>

                  {paciente.propietario && (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Propietario: {paciente.propietario.nombre}
                    </p>
                  )}

                  {paciente.doctorPropietario && (
                    <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-1`}>
                        Doctor propietario
                      </p>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {paciente.doctorPropietario.nombre}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {paciente.doctorPropietario.especialidad}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Separador */}
            <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />

            {/* Área de información protegida con overlay */}
            <div className="relative min-h-[400px]">
              
              {/* Contenido simulado con blur */}
              <div className="p-8 filter blur-sm opacity-30 pointer-events-none select-none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>Peso</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>XX.X kg</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>Temperatura</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>XX.X °C</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>F. Cardíaca</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>XXX bpm</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <p className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Historia Clínica
                    </p>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`p-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                          <div className="h-4 bg-gray-500 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-600 rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <p className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Diagnósticos Activos
                    </p>
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div key={i} className={`p-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                          <div className="h-4 bg-gray-500 rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-gray-600 rounded w-5/6"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlay central con mensaje y CTA */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute inset-0 flex items-center justify-center backdrop-blur-md"
                style={{
                  background: darkMode 
                    ? 'rgba(17, 24, 39, 0.85)' 
                    : 'rgba(249, 250, 251, 0.85)'
                }}
              >
                <div className="text-center max-w-md px-6">
                  
                  {/* Icono principal */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
                    style={{
                      background: darkMode 
                        ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(234, 88, 12, 0.3) 100%)'
                        : 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.15) 100%)',
                      boxShadow: darkMode 
                        ? '0 8px 24px -8px rgba(249, 115, 22, 0.4)'
                        : '0 8px 24px -8px rgba(249, 115, 22, 0.3)'
                    }}
                  >
                    <Lock className="w-12 h-12" style={{ color: '#F97316' }} />
                  </motion.div>

                  {/* Título */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    Información Clínica Protegida
                  </motion.h2>

                  {/* Descripción */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}
                  >
                    Este paciente pertenece a <strong>{paciente.doctorPropietario?.nombre || 'otro especialista'}</strong>.
                    <br />
                    Para acceder a su historia clínica completa, diagnósticos, medicación y estudios, 
                    necesitas solicitar acceso clínico.
                  </motion.p>

                  {/* CTA Principal */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button
                      onClick={() => onSolicitarAcceso(paciente.id)}
                      size="lg"
                      className="text-white shadow-xl"
                      style={{
                        background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                        boxShadow: '0 8px 24px -6px rgba(249, 115, 22, 0.5)'
                      }}
                    >
                      <UserCheck className="w-5 h-5 mr-2" />
                      Solicitar Acceso Clínico
                    </Button>
                  </motion.div>

                  {/* Información adicional */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className={`mt-6 p-4 rounded-lg ${
                      darkMode 
                        ? 'bg-blue-900/20 border border-blue-800' 
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-2 text-left">
                      <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        darkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                      <div>
                        <p className={`text-xs font-semibold mb-1 ${
                          darkMode ? 'text-blue-300' : 'text-blue-900'
                        }`}>
                          ¿Qué sucede después?
                        </p>
                        <p className={`text-xs ${
                          darkMode ? 'text-blue-400' : 'text-blue-700'
                        }`}>
                          El doctor propietario recibirá tu solicitud y podrá aprobar o rechazar el acceso. 
                          Especifica el motivo clínico para agilizar la aprobación.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Indicadores de privacidad */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="mt-6 flex items-center justify-center gap-4 text-xs"
                  >
                    <div className="flex items-center gap-1">
                      <ShieldAlert className={`w-3 h-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                        Protección GDPR
                      </span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                    <div className="flex items-center gap-1">
                      <Lock className={`w-3 h-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                        Encriptación E2E
                      </span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className={`w-3 h-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                        Auditoría completa
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Información de seguridad inferior */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className={`mt-6 p-4 rounded-lg ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <div>
              <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Sistema de Control de Acceso Médico
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} leading-relaxed`}>
                Este sistema garantiza la privacidad y seguridad de la información médica de los pacientes, 
                cumpliendo con normativas internacionales de protección de datos (GDPR, HIPAA). 
                Solo los especialistas autorizados pueden acceder a la información clínica completa.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
