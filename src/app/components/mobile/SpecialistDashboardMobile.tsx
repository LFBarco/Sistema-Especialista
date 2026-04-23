import { useState, useEffect } from 'react';
import { useApp } from '../../App';
import { 
  Bell, 
  CalendarClock, 
  ChevronRight, 
  MapPin, 
  Phone, 
  Search, 
  User, 
  Activity, 
  Thermometer, 
  Weight, 
  CheckCircle2, 
  AlertTriangle,
  FilePlus,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { MobileLayout } from './MobileLayout';
import { ConsultaClinicaWizard } from '../ConsultaClinicaWizard';

export function SpecialistDashboardMobile() {
  const { darkMode, crearServicio, userClinicas } = useApp();
  const [activeTab, setActiveTab] = useState('inicio');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Obtener la clínica principal para asignar a los servicios
  const clinicaPrincipal = userClinicas.length > 0 ? userClinicas[0].nombre : 'Clínica Principal';

  // Simulación de datos para móvil
  const pacientesPendientes = [
    { id: 1, nombre: 'Firulais', motivo: 'Chequeo Cardio', urgencia: 'media', hora: '10:00 AM' },
    { id: 2, nombre: 'Luna', motivo: 'Ecografía Abdomen', urgencia: 'alta', hora: '11:30 AM' },
    { id: 3, nombre: 'Rocky', motivo: 'Vacunación', urgencia: 'baja', hora: '02:00 PM' },
  ];

  const alertas = [
    { id: 1, mensaje: 'Nuevo resultado de laboratorio: Firulais', tiempo: 'hace 5m' },
    { id: 2, mensaje: 'Recordatorio: Cirugía programada mañana', tiempo: 'hace 1h' },
  ];

  const handleStartConsultation = (patient: any) => {
    // Configurar paciente para el wizard
    const pacienteMock = {
      ...patient,
      especie: 'Canino',
      raza: 'Mestizo',
      sexo: 'Macho',
      fechaNacimiento: '2020-01-01',
      edad: '3 años',
      nombre: patient.nombre,
      propietario: { nombre: 'Dueño Demo', telefono: '555-1234' },
      informacionMedica: { peso: 0, altura: 0, temperatura: 0, frecuenciaCardiaca: 0 },
      historiaClinica: [], vacunas: [], derivaciones: [], alergias: []
    };
    setSelectedPatient(pacienteMock);
    setShowWizard(true);
  };

  return (
    <div className={`h-full overflow-y-auto pb-24 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Wizard Overlay */}
      {showWizard && selectedPatient && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2">
           <ConsultaClinicaWizard 
             paciente={selectedPatient}
             onClose={() => setShowWizard(false)}
             onFinalizar={async (datos) => {
               // 1. Crear el servicio "Médico" automáticamente
               await crearServicio({
                 fecha: new Date().toISOString(),
                 clinica: clinicaPrincipal,
                 tipo: 'Consulta General',
                 paciente: datos.pacienteNombre || selectedPatient.nombre,
                 especie: selectedPatient.especie,
                 estado: 'completado', // Listo para facturar
                 tarifa: 50, // Precio base, podría ser dinámico
                 notas: `Motivo: ${datos.motivo}. Diagnóstico: ${datos.diagnosticoPresuntivo}`,
                 // Datos adicionales
                 hora: new Date().toLocaleTimeString(),
                 duracion: 30
               });

               // 2. Si hubo vacunas, crear servicio adicional
               if (datos.aplicarVacuna) {
                 await crearServicio({
                    fecha: new Date().toISOString(),
                    clinica: clinicaPrincipal,
                    tipo: `Vacunación: ${datos.vacunaNombre}`,
                    paciente: datos.pacienteNombre || selectedPatient.nombre,
                    especie: selectedPatient.especie,
                    estado: 'completado',
                    tarifa: 25,
                    notas: `Vacuna aplicada: ${datos.vacunaNombre}`,
                    hora: new Date().toLocaleTimeString(),
                    duracion: 10
                 });
               }

               setShowWizard(false);
               toast.success('Consulta finalizada y enviada a facturación');
             }}
           />
        </div>
      )}

      {/* Main Mobile Dashboard */}
      <MobileLayout activeTab={activeTab} onTabChange={setActiveTab}>
        
        {/* TAB: INICIO */}
        {activeTab === 'inicio' && (
          <div className="px-5 pt-6 pb-24 space-y-6">
            
            {/* Header Greeting */}
            <div className="flex justify-between items-center mb-2">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Hola, Dr. Pérez 👋</h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tienes 3 pacientes hoy</p>
              </div>
              <div className={`w-10 h-10 rounded-full bg-cover bg-center border-2 ${darkMode ? 'border-gray-700' : 'border-white shadow-sm'}`} 
                   style={{backgroundImage: 'url("https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200")'}} />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/20 border border-blue-800/30' : 'bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold">12</span>
                </div>
                <p className={`text-xs font-medium ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>Citas Pendientes</p>
              </div>
              
              <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/20 border border-purple-800/30' : 'bg-gradient-to-br from-purple-50 to-white border border-purple-100 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold text-red-500">2</span>
                </div>
                <p className={`text-xs font-medium ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>Urgencias Altas</p>
              </div>
            </div>

            {/* Upcoming Appointments List */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Próximos Pacientes</h2>
                <button className="text-blue-500 text-sm font-medium">Ver todos</button>
              </div>

              <div className="space-y-3">
                {pacientesPendientes.map((paciente) => (
                  <motion.div 
                    key={paciente.id}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center p-4 rounded-2xl border ${
                      darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-sm'
                    }`}
                  >
                    <div className="relative mr-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg ${
                        paciente.urgencia === 'alta' ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-red-500/20' : 
                        paciente.urgencia === 'media' ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/20' :
                        'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/20'
                      }`}>
                        {paciente.nombre.charAt(0)}
                      </div>
                      {paciente.urgencia === 'alta' && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-base truncate pr-2">{paciente.nombre}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {paciente.hora}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{paciente.motivo}</p>
                      
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => handleStartConsultation(paciente)}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-center transition-colors ${
                            darkMode 
                              ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                          }`}
                        >
                          Atender
                        </button>
                        <button className={`p-1.5 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Alerts */}
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-gray-500">
                <Bell className="w-4 h-4" />
                Notificaciones Recientes
              </h3>
              <div className="space-y-3">
                {alertas.map(alerta => (
                  <div key={alerta.id} className="flex gap-3 items-start text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{alerta.mensaje}</p>
                      <span className="text-xs text-gray-500">{alerta.tiempo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB: PACIENTES */}
        {activeTab === 'pacientes' && (
          <div className="flex flex-col h-full items-center justify-center p-8 text-center">
            <User className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold mb-2">Directorio de Pacientes</h2>
            <p className="text-gray-500 text-sm">Busca y gestiona la lista completa de pacientes desde aquí.</p>
            <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 w-full">
              Buscar Paciente
            </button>
          </div>
        )}

        {/* TAB: AGENDA */}
        {activeTab === 'agenda' && (
          <div className="flex flex-col h-full items-center justify-center p-8 text-center">
            <CalendarClock className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold mb-2">Agenda Móvil</h2>
            <p className="text-gray-500 text-sm">Vista simplificada de tu calendario de citas y cirugías.</p>
          </div>
        )}

        {/* TAB: PERFIL */}
        {activeTab === 'perfil' && (
          <div className="p-6 pt-10">
            <div className="text-center mb-8">
               <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 mb-4 overflow-hidden border-4 border-white shadow-lg">
                 <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200" alt="Profile" className="w-full h-full object-cover" />
               </div>
               <h2 className="text-2xl font-bold">Dr. Juan Pérez</h2>
               <p className="text-blue-500 font-medium">Cardiología Veterinaria</p>
            </div>

            <div className="space-y-2">
              {['Configuración', 'Ayuda y Soporte', 'Términos y Condiciones', 'Cerrar Sesión'].map((item) => (
                <button key={item} className={`w-full p-4 text-left rounded-xl flex justify-between items-center ${
                  darkMode ? 'bg-gray-900 hover:bg-gray-800 text-gray-300' : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm'
                }`}>
                  {item}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

      </MobileLayout>
    </div>
  );
}