import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Upload, Download, Calendar, User, Phone, Mail, MapPin, FileText, Syringe, AlertCircle, Activity, Pill, Heart, Thermometer, Weight, Ruler, Search, Filter, X, UserCheck, Stethoscope, CheckCircle2 } from 'lucide-react';
import { useApp } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ModalDerivacionClinica, DerivacionData } from './ModalDerivacionClinica';
import { TimelineDerivaciones } from './TimelineDerivaciones';
import { ConsultaClinicaWizard } from './ConsultaClinicaWizard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PacientePerfilRestringido } from './PacientePerfilRestringido';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';

interface Paciente {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  sexo: string;
  fechaNacimiento: string;
  edad: string;
  microchip?: string;
  foto?: string;
  propietario: {
    nombre: string;
    telefono: string;
    email: string;
    direccion: string;
    documento: string;
  };
  informacionMedica: {
    peso: number;
    altura: number;
    temperatura: number;
    frecuenciaCardiaca: number;
    grupoSanguineo?: string;
  };
  historiaClinica: HistoriaClinica[];
  diagnosticos: Diagnostico[];
  medicamentos: Medicamento[];
  vacunas: Vacuna[];
  derivaciones: Derivacion[];
  alergias: string[];
  notas?: string;
}

interface HistoriaClinica {
  id: number;
  fecha: string;
  tipo: string;
  veterinario: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  notas?: string;
}

interface Diagnostico {
  id: number;
  fecha: string;
  codigo?: string;
  descripcion: string;
  estado: 'activo' | 'resuelto' | 'cronico';
  veterinario: string;
}

interface Medicamento {
  id: number;
  nombre: string;
  dosis: string;
  frecuencia: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: 'activo' | 'finalizado';
  indicaciones?: string;
}

interface Vacuna {
  id: number;
  nombre: string;
  fecha: string;
  proximaAplicacion?: string;
  lote?: string;
  veterinario: string;
  notas?: string;
}

interface Derivacion {
  id: number;
  fecha: string;
  especialidad: string;
  doctorSolicitante: {
    nombre: string;
    especialidad: string;
  };
  doctorDestino?: {
    nombre: string;
    especialidad: string;
  };
  motivo: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'en-proceso' | 'completada';
  urgencia: 'baja' | 'media' | 'alta' | 'critica';
  autorizadoPor?: string;
  fechaAutorizacion?: string;
  interconsultaId?: number;
}

export function Pacientes() {
  const { darkMode, verificarAccesoPaciente, solicitarAccesoClinico, usuarioActual, navegarA, moduleData, completarServicio, servicios } = useApp();
  const [vistaActual, setVistaActual] = useState<'lista' | 'detalle' | 'restringido'>('lista');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);
  const [tabActual, setTabActual] = useState('resumen');
  const [mostrarNuevoPaciente, setMostrarNuevoPaciente] = useState(false);
  const [mostrarNuevaHistoria, setMostrarNuevaHistoria] = useState(false);
  const [mostrarNuevoDiagnostico, setMostrarNuevoDiagnostico] = useState(false);
  const [mostrarNuevoMedicamento, setMostrarNuevoMedicamento] = useState(false);
  const [mostrarNuevaVacuna, setMostrarNuevaVacuna] = useState(false);
  const [mostrarModalDerivacion, setMostrarModalDerivacion] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModalAcceso, setMostrarModalAcceso] = useState(false);
  const [motivoAcceso, setMotivoAcceso] = useState('');
  const [especialidadSolicitada, setEspecialidadSolicitada] = useState('');
  const [mostrarConsultaWizard, setMostrarConsultaWizard] = useState(false);
  const [citaActivaId, setCitaActivaId] = useState<number | undefined>(undefined);
  const [editandoSignosVitales, setEditandoSignosVitales] = useState(false);
  const [signosVitalesTemp, setSignosVitalesTemp] = useState({
    peso: '',
    altura: '',
    temperatura: '',
    frecuenciaCardiaca: ''
  });
  const [permisos, setPermisos] = useState({
    verDiagnosticos: true,
    verEstudios: true,
    verMedicacion: true,
    verHistoriaCompleta: true
  });

  const [pacientes, setPacientes] = useState<Paciente[]>([
    {
      id: 1,
      nombre: 'Firulais',
      especie: 'Canino',
      raza: 'Labrador',
      sexo: 'Macho',
      fechaNacimiento: '2020-05-15',
      edad: '3 años',
      microchip: '981098109810981',
      propietario: {
        nombre: 'Juan Pérez',
        telefono: '555-0123',
        email: 'juan@email.com',
        direccion: 'Calle Principal 123',
        documento: '12345678'
      },
      informacionMedica: {
        peso: 25.5,
        altura: 60,
        temperatura: 38.5,
        frecuenciaCardiaca: 80,
        grupoSanguineo: 'DEA 1.1'
      },
      historiaClinica: [],
      diagnosticos: [],
      medicamentos: [],
      vacunas: [],
      derivaciones: [],
      alergias: [],
      notas: 'Paciente amigable.'
    },
    {
      id: 2,
      nombre: 'Michi',
      especie: 'Felino',
      raza: 'Siamés',
      sexo: 'Hembra',
      fechaNacimiento: '2021-08-20',
      edad: '2 años',
      propietario: {
        nombre: 'María López',
        telefono: '555-0987',
        email: 'maria@email.com',
        direccion: 'Av. Central 456',
        documento: '87654321'
      },
      informacionMedica: {
        peso: 4.2,
        altura: 25,
        temperatura: 38.2,
        frecuenciaCardiaca: 140
      },
      historiaClinica: [],
      diagnosticos: [],
      medicamentos: [],
      vacunas: [],
      derivaciones: [],
      alergias: [],
      notas: ''
    }
  ]);

  const [nuevoPaciente, setNuevoPaciente] = useState<Partial<Paciente>>({
    nombre: '',
    especie: '',
    raza: '',
    sexo: '',
    fechaNacimiento: '',
    microchip: '',
    propietario: {
      nombre: '',
      telefono: '',
      email: '',
      direccion: '',
      documento: ''
    },
    informacionMedica: {
      peso: 0,
      altura: 0,
      temperatura: 0,
      frecuenciaCardiaca: 0,
      grupoSanguineo: ''
    },
    historiaClinica: [],
    diagnosticos: [],
    medicamentos: [],
    vacunas: [],
    alergias: [],
    notas: ''
  });

  // Efecto para manejar navegación desde otros módulos (ej. Agenda)
  useEffect(() => {
    if (moduleData?.pacienteNombre) {
      const nombreBuscado = moduleData.pacienteNombre.trim();
      setBusqueda(nombreBuscado);
      
      const match = pacientes.find(p => p.nombre.toLowerCase() === nombreBuscado.toLowerCase());
      
      if (match) {
         seleccionarPaciente(match);
      } else {
         // Si no existe, lo creamos dinámicamente para la demo
         const nuevoId = Math.max(...pacientes.map(p => p.id), 0) + 1;
         const pacienteDemo: Paciente = {
            id: nuevoId,
            nombre: nombreBuscado,
            especie: 'Sin especificar',
            raza: 'Sin especificar',
            sexo: 'Sin especificar',
            fechaNacimiento: new Date().toISOString(),
            edad: 'Desconocida',
            propietario: {
                nombre: 'Propietario de ' + nombreBuscado,
                telefono: '',
                email: '',
                direccion: '',
                documento: ''
            },
            informacionMedica: {
                peso: 0,
                altura: 0,
                temperatura: 0,
                frecuenciaCardiaca: 0
            },
            historiaClinica: [],
            diagnosticos: [],
            medicamentos: [],
            vacunas: [],
            derivaciones: [],
            alergias: []
         };
         
         setPacientes(prev => [...prev, pacienteDemo]);
         // Seleccionamos inmediatamente el objeto creado
         seleccionarPaciente(pacienteDemo);
      }

      if (moduleData.citaId) {
        setCitaActivaId(moduleData.citaId);
      }
    }
  }, [moduleData]); // Quitamos 'pacientes' de deps para evitar loops infinitos al hacer setPacientes

  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    const años = hoy.getFullYear() - nacimiento.getFullYear();
    const meses = hoy.getMonth() - nacimiento.getMonth();
    
    if (años < 1) {
      return `${meses} meses`;
    }
    return `${años} año${años > 1 ? 's' : ''}`;
  };

  const agregarPaciente = () => {
    if (!nuevoPaciente.nombre || !nuevoPaciente.especie || !nuevoPaciente.propietario?.nombre) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const paciente: Paciente = {
      id: pacientes.length + 1,
      nombre: nuevoPaciente.nombre!,
      especie: nuevoPaciente.especie!,
      raza: nuevoPaciente.raza || 'Sin especificar',
      sexo: nuevoPaciente.sexo || 'Sin especificar',
      fechaNacimiento: nuevoPaciente.fechaNacimiento || new Date().toISOString().split('T')[0],
      edad: calcularEdad(nuevoPaciente.fechaNacimiento || new Date().toISOString().split('T')[0]),
      microchip: nuevoPaciente.microchip,
      propietario: nuevoPaciente.propietario!,
      informacionMedica: nuevoPaciente.informacionMedica || {
        peso: 0,
        altura: 0,
        temperatura: 0,
        frecuenciaCardiaca: 0
      },
      historiaClinica: [],
      diagnosticos: [],
      medicamentos: [],
      vacunas: [],
      alergias: nuevoPaciente.alergias || [],
      notas: nuevoPaciente.notas
    };

    setPacientes([...pacientes, paciente]);
    setMostrarNuevoPaciente(false);
    setNuevoPaciente({
      nombre: '',
      especie: '',
      raza: '',
      sexo: '',
      fechaNacimiento: '',
      microchip: '',
      propietario: {
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
        documento: ''
      },
      informacionMedica: {
        peso: 0,
        altura: 0,
        temperatura: 0,
        frecuenciaCardiaca: 0,
        grupoSanguineo: ''
      },
      historiaClinica: [],
      diagnosticos: [],
      medicamentos: [],
      vacunas: [],
      alergias: [],
      notas: ''
    });
  };

  const seleccionarPaciente = (paciente: Paciente) => {
    // Verificar si el paciente pertenece a otro doctor
    // En producción, verificar con: verificarAccesoPaciente(paciente.id, usuarioActual?.id)
    const esPropio = true; // Por defecto, todos los pacientes cargados son propios
    
    if (!esPropio) {
      // Paciente de otro doctor - mostrar perfil restringido
      setPacienteSeleccionado(paciente);
      setVistaActual('restringido');
      return;
    }

    // Paciente propio - mostrar perfil completo
    const pacienteActualizado = {
      ...paciente,
      edad: calcularEdad(paciente.fechaNacimiento)
    };
    setPacienteSeleccionado(pacienteActualizado);

    // Buscar si tiene una cita agendada para hoy
    const hoy = new Date().toISOString().split('T')[0];
    const citaHoy = servicios.find(s => 
      s.paciente === paciente.nombre && 
      s.fecha === hoy && 
      (s.estado === 'confirmado' || s.estado === 'pendiente' || s.estado === 'reprogramada')
    );

    if (citaHoy) {
      console.log('Cita encontrada para hoy:', citaHoy);
      setCitaActivaId(citaHoy.id);
    } else {
      setCitaActivaId(undefined);
    }

    setVistaActual('detalle');
    setTabActual('resumen');
  };

  const volverALista = () => {
    setVistaActual('lista');
    setPacienteSeleccionado(null);
  };

  const handleSolicitarAcceso = (pacienteId: number) => {
    setMostrarModalAcceso(true);
  };

  const confirmarSolicitudAcceso = () => {
    // Validaciones
    if (!especialidadSolicitada) {
      toast.error('⚠️ Por favor selecciona tu especialidad');
      return;
    }

    if (!motivoAcceso.trim()) {
      toast.error('⚠️ Por favor especifica el motivo clínico de la solicitud');
      return;
    }

    if (motivoAcceso.trim().length < 50) {
      toast.error('⚠️ El motivo clínico debe ser más detallado (mínimo 50 caracteres)');
      return;
    }

    // Aquí se haría la llamada real a la API
    // solicitarAccesoClinico({
    //   pacienteId: pacienteSeleccionado.id,
    //   especialidadSolicitante: especialidadSolicitada,
    //   motivoClinico: motivoAcceso,
    //   permisos: permisos
    // });
    
    // Cerrar modal
    setMostrarModalAcceso(false);
    
    // Toast de confirmación
    toast.success('✅ Solicitud de acceso clínico enviada', {
      description: `El doctor propietario recibirá tu solicitud y toda visualización quedará registrada.`,
      duration: 4000
    });

    // Limpiar estados
    setMotivoAcceso('');
    setEspecialidadSolicitada('');
    setPermisos({
      verDiagnosticos: true,
      verEstudios: true,
      verMedicacion: true,
      verHistoriaCompleta: true
    });
    
    volverALista();
    
    // Info adicional
    setTimeout(() => {
      toast.info('💡 Puedes ver el estado de tu solicitud en Interconsultas', {
        duration: 5000
      });
    }, 1500);
  };

  const handleFinalizarConsulta = (datosConsulta: any) => {
    if (!pacienteSeleccionado) return;

    // 1. Crear Historia Clínica
    const nuevaHistoria: HistoriaClinica = {
      id: Date.now(),
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'Consulta General',
      veterinario: 'Dr. Usuario Actual',
      motivo: datosConsulta.motivo,
      diagnostico: datosConsulta.diagnosticoPresuntivo,
      tratamiento: datosConsulta.recetaMedica,
      notas: datosConsulta.anamnesis
    };

    // 2. Actualizar Signos Vitales
    const nuevosSignos = {
       peso: parseFloat(datosConsulta.peso) || pacienteSeleccionado.informacionMedica.peso,
       altura: pacienteSeleccionado.informacionMedica.altura, // No cambia en este wizard
       temperatura: parseFloat(datosConsulta.temperatura) || pacienteSeleccionado.informacionMedica.temperatura,
       frecuenciaCardiaca: parseFloat(datosConsulta.frecuenciaCardiaca) || pacienteSeleccionado.informacionMedica.frecuenciaCardiaca,
    };

    // 3. Crear Vacuna si aplica
    let nuevasVacunas = [...(pacienteSeleccionado.vacunas || [])];
    if (datosConsulta.aplicarVacuna && datosConsulta.vacunaNombre) {
       nuevasVacunas.push({
         id: Date.now(),
         nombre: datosConsulta.vacunaNombre,
         fecha: new Date().toISOString().split('T')[0],
         veterinario: 'Dr. Usuario Actual',
         notas: 'Aplicada durante consulta'
       });
    }

    // 4. Actualizar Estado Paciente
    const pacienteActualizado = {
      ...pacienteSeleccionado,
      informacionMedica: { ...pacienteSeleccionado.informacionMedica, ...nuevosSignos },
      historiaClinica: [nuevaHistoria, ...pacienteSeleccionado.historiaClinica],
      vacunas: nuevasVacunas
    };

    setPacienteSeleccionado(pacienteActualizado);
    setPacientes(prev => prev.map(p => p.id === pacienteActualizado.id ? pacienteActualizado : p));
    
    setMostrarConsultaWizard(false);
    toast.success('Consulta finalizada y guardada exitosamente');
    
    // Si hay citaId, aquí llamaríamos a completarServicio(citaId)
    if (datosConsulta.citaId) {
      // Logic to complete appointment
      console.log('Finalizando cita asociada:', datosConsulta.citaId);
      completarServicio(datosConsulta.citaId);
      
      toast.info('La cita ha sido marcada como completada y está lista para facturación', {
        duration: 4000
      });
    }
  };

  const handleDerivar = (derivacion: DerivacionData) => {
    if (!pacienteSeleccionado) return;

    // Crear la nueva derivación
    const nuevaDerivacion: Derivacion = {
      id: (pacienteSeleccionado.derivaciones?.length || 0) + 1,
      fecha: new Date().toISOString(),
      especialidad: derivacion.especialidadDestino,
      doctorSolicitante: {
        nombre: usuarioActual?.nombre || 'Dr. Actual',
        especialidad: usuarioActual?.especialidad || 'Medicina Veterinaria'
      },
      ...(derivacion.doctorDestino && {
        doctorDestino: {
          nombre: derivacion.doctorDestino,
          especialidad: derivacion.especialidadDestino
        }
      }),
      motivo: derivacion.motivoClinico,
      estado: 'pendiente',
      urgencia: derivacion.urgencia,
    };

    // Actualizar el paciente con la nueva derivación
    setPacientes(pacientes.map(p => 
      p.id === pacienteSeleccionado.id 
        ? { 
            ...p, 
            derivaciones: [...(p.derivaciones || []), nuevaDerivacion] 
          }
        : p
    ));

    // Actualizar el paciente seleccionado
    setPacienteSeleccionado({
      ...pacienteSeleccionado,
      derivaciones: [...(pacienteSeleccionado.derivaciones || []), nuevaDerivacion]
    });

    // Cerrar modal
    setMostrarModalDerivacion(false);

    // Toast de confirmación
    toast.success('✅ Derivación clínica creada exitosamente', {
      description: `Se ha generado la derivación a ${derivacion.especialidadDestino} con urgencia ${derivacion.urgencia}.`,
      duration: 4000
    });

    // Cambiar al tab de derivaciones
    setTabActual('derivaciones');

    // Info adicional
    setTimeout(() => {
      toast.info('📋 La derivación se convertirá en una interconsulta una vez aprobada', {
        duration: 5000
      });
    }, 1500);
  };

  const pacientesFiltrados = pacientes.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.especie.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.raza.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.propietario.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-[1600px] mx-auto">
        {vistaActual === 'lista' ? (
          // VISTA LISTA DE PACIENTES
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-3`}>
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-3 rounded-xl">
                    <Heart className="w-8 h-8" />
                  </div>
                  Pacientes
                </h1>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                  Gestión completa de historias clínicas veterinarias
                </p>
              </div>
              <Button
                onClick={() => setMostrarNuevoPaciente(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Paciente
              </Button>
            </div>

            {/* Búsqueda */}
            <Card className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <Input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre, especie, raza o propietario..."
                    className={`pl-10 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}`}
                  />
                </div>
              </div>
            </Card>

            {/* Grid de Pacientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pacientesFiltrados.map(paciente => (
                <div key={paciente.id} className="group relative h-full">
                  <Card
                    className={`p-6 ${darkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white hover:shadow-lg'} transition-all h-full flex flex-col`}
                  >
                    <div 
                      className="flex items-start gap-4 mb-4 cursor-pointer"
                      onClick={() => seleccionarPaciente(paciente)}
                    >
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
                        {paciente.nombre.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {paciente.nombre}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                          {paciente.especie} - {paciente.raza}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className={`${darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600'} text-[10px] px-2 h-5`}>
                            {paciente.edad}
                          </Badge>
                          <Badge variant="secondary" className={`${darkMode ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600'} text-[10px] px-2 h-5`}>
                            {paciente.sexo}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className={`space-y-2 mb-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5" />
                        <span className="truncate">{paciente.propietario.nombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="truncate">{paciente.propietario.telefono}</span>
                      </div>
                    </div>

                    <div 
                      className={`mt-auto pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} grid grid-cols-3 gap-2 text-center cursor-pointer hover:bg-white/5 transition-colors -mx-6 -mb-6 px-6 pb-6 pt-4 rounded-b-xl`}
                      onClick={() => seleccionarPaciente(paciente)}
                    >
                      <div>
                        <p className={`text-[10px] uppercase tracking-wider font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Historias</p>
                        <p className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {paciente.historiaClinica.length}
                        </p>
                      </div>
                      <div>
                        <p className={`text-[10px] uppercase tracking-wider font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Vacunas</p>
                        <p className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {paciente.vacunas.length}
                        </p>
                      </div>
                      <div>
                        <p className={`text-[10px] uppercase tracking-wider font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Peso</p>
                        <p className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {paciente.informacionMedica.peso} kg
                        </p>
                      </div>
                    </div>


                  </Card>
                </div>
              ))}
            </div>

            {pacientesFiltrados.length === 0 && (
              <Card className={`p-12 text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <Heart className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No se encontraron pacientes
                </p>
              </Card>
            )}
          </div>
        ) : vistaActual === 'restringido' ? (
          // VISTA PERFIL RESTRINGIDO
          pacienteSeleccionado && (
            <PacientePerfilRestringido
              paciente={{
                id: pacienteSeleccionado.id,
                nombre: pacienteSeleccionado.nombre,
                especie: pacienteSeleccionado.especie,
                raza: pacienteSeleccionado.raza,
                edad: pacienteSeleccionado.edad,
                sexo: pacienteSeleccionado.sexo,
                foto: pacienteSeleccionado.foto,
                propietario: {
                  nombre: pacienteSeleccionado.propietario.nombre
                },
                doctorPropietario: {
                  nombre: 'Dr. María López',
                  especialidad: 'Medicina Interna Veterinaria'
                }
              }}
              onSolicitarAcceso={handleSolicitarAcceso}
              onVolver={volverALista}
            />
          )
        ) : (
          // VISTA DETALLE DEL PACIENTE
          pacienteSeleccionado && (
            <div className="space-y-6">
              {/* Header con botón volver */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={volverALista}
                  className={darkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : ''}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Regresar a pacientes
                </Button>
                <div className="flex-1">
                  <h1 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Paciente: {pacienteSeleccionado.nombre}
                  </h1>
                </div>
                <Button
                  variant="outline"
                  className={darkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : ''}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                
                <Button
                  onClick={() => setMostrarConsultaWizard(true)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
                >
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Iniciar Consulta
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar izquierdo con perfil */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Card de Perfil */}
                  <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                    <div className="text-center mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-4">
                        {pacienteSeleccionado.nombre.charAt(0)}
                      </div>
                      <h2 className={`text-2xl mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {pacienteSeleccionado.nombre}
                      </h2>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {pacienteSeleccionado.especie} - {pacienteSeleccionado.raza}
                      </p>
                      {pacienteSeleccionado.microchip && (
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                          🔖 {pacienteSeleccionado.microchip}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sexo</p>
                        <p className={darkMode ? 'text-white' : 'text-gray-900'}>{pacienteSeleccionado.sexo}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fecha de Nacimiento</p>
                        <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                          {new Date(pacienteSeleccionado.fechaNacimiento).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Edad</p>
                        <p className={darkMode ? 'text-white' : 'text-gray-900'}>{pacienteSeleccionado.edad}</p>
                      </div>
                      {pacienteSeleccionado.informacionMedica.grupoSanguineo && (
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Grupo Sanguíneo</p>
                          <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                            {pacienteSeleccionado.informacionMedica.grupoSanguineo}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Card de Propietario */}
                  <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                    <h3 className={`text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Información del Propietario
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {pacienteSeleccionado.propietario.nombre}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {pacienteSeleccionado.propietario.telefono}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {pacienteSeleccionado.propietario.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {pacienteSeleccionado.propietario.direccion}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {pacienteSeleccionado.propietario.documento}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Alergias */}
                  {pacienteSeleccionado.alergias && pacienteSeleccionado.alergias.length > 0 && (
                    <Card className={`p-6 ${darkMode ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <h3 className={`${darkMode ? 'text-red-400' : 'text-red-700'}`}>Alergias</h3>
                      </div>
                      <div className="space-y-2">
                        {pacienteSeleccionado.alergias.map((alergia, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded ${darkMode ? 'bg-red-900/30' : 'bg-red-100'}`}
                          >
                            <span className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                              {alergia}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>

                {/* Contenido principal con tabs */}
                <div className="lg:col-span-2">
                  <Tabs value={tabActual} onValueChange={setTabActual} className="w-full">
                    <TabsList className={`w-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                      <TabsTrigger value="resumen">Resumen</TabsTrigger>
                      <TabsTrigger value="historia">Historia Clínica</TabsTrigger>
                      <TabsTrigger value="diagnosticos">Diagnósticos</TabsTrigger>
                      <TabsTrigger value="medicamentos">Medicamentos</TabsTrigger>
                      <TabsTrigger value="vacunas">Vacunas</TabsTrigger>
                      <TabsTrigger value="derivaciones">Derivaciones</TabsTrigger>
                    </TabsList>

                    {/* TAB RESUMEN */}
                    <TabsContent value="resumen" className="mt-6 space-y-6">
                      {/* Signos Vitales / Medidas */}
                      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                          <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Signos Vitales / Medidas
                          </h3>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                            onClick={() => {
                              if (editandoSignosVitales) {
                                if (pacienteSeleccionado) {
                                  const updated = {
                                    ...pacienteSeleccionado,
                                    informacionMedica: {
                                      ...pacienteSeleccionado.informacionMedica,
                                      peso: signosVitalesTemp.peso ? parseFloat(signosVitalesTemp.peso) : pacienteSeleccionado.informacionMedica.peso,
                                      altura: signosVitalesTemp.altura ? parseFloat(signosVitalesTemp.altura) : pacienteSeleccionado.informacionMedica.altura,
                                      temperatura: signosVitalesTemp.temperatura ? parseFloat(signosVitalesTemp.temperatura) : pacienteSeleccionado.informacionMedica.temperatura,
                                      frecuenciaCardiaca: signosVitalesTemp.frecuenciaCardiaca ? parseInt(signosVitalesTemp.frecuenciaCardiaca) : pacienteSeleccionado.informacionMedica.frecuenciaCardiaca,
                                    }
                                  };
                                  setPacientes(pacientes.map(p => p.id === updated.id ? updated : p));
                                  setPacienteSeleccionado(updated);
                                  toast.success('Signos vitales actualizados');
                                }
                                setEditandoSignosVitales(false);
                              } else {
                                setSignosVitalesTemp({
                                  peso: String(pacienteSeleccionado?.informacionMedica.peso || ''),
                                  altura: String(pacienteSeleccionado?.informacionMedica.altura || ''),
                                  temperatura: String(pacienteSeleccionado?.informacionMedica.temperatura || ''),
                                  frecuenciaCardiaca: String(pacienteSeleccionado?.informacionMedica.frecuenciaCardiaca || ''),
                                });
                                setEditandoSignosVitales(true);
                              }
                            }}
                          >
                            {editandoSignosVitales ? (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Guardar
                              </>
                            ) : (
                              <>
                                <Activity className="w-4 h-4 mr-2" />
                                Actualizar
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <Weight className="w-5 h-5 text-blue-500" />
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Peso</span>
                              </div>
                              {editandoSignosVitales ? (
                                <div className="flex items-center gap-1">
                                  <Input type="number" step="0.1" value={signosVitalesTemp.peso} onChange={(e) => setSignosVitalesTemp({...signosVitalesTemp, peso: e.target.value})} className={`w-24 text-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`} />
                                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>kg</span>
                                </div>
                              ) : (
                                <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {pacienteSeleccionado.informacionMedica.peso} kg
                                </p>
                              )}
                            </div>
                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <Ruler className="w-5 h-5 text-green-500" />
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Altura</span>
                              </div>
                              {editandoSignosVitales ? (
                                <div className="flex items-center gap-1">
                                  <Input type="number" step="0.1" value={signosVitalesTemp.altura} onChange={(e) => setSignosVitalesTemp({...signosVitalesTemp, altura: e.target.value})} className={`w-24 text-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`} />
                                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>cm</span>
                                </div>
                              ) : (
                                <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {pacienteSeleccionado.informacionMedica.altura} cm
                                </p>
                              )}
                            </div>
                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <Thermometer className="w-5 h-5 text-red-500" />
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Temperatura</span>
                              </div>
                              {editandoSignosVitales ? (
                                <div className="flex items-center gap-1">
                                  <Input type="number" step="0.1" value={signosVitalesTemp.temperatura} onChange={(e) => setSignosVitalesTemp({...signosVitalesTemp, temperatura: e.target.value})} className={`w-24 text-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`} />
                                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>°C</span>
                                </div>
                              ) : (
                                <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {pacienteSeleccionado.informacionMedica.temperatura}°C
                                </p>
                              )}
                            </div>
                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <Heart className="w-5 h-5 text-pink-500" />
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Frecuencia Cardíaca</span>
                              </div>
                              {editandoSignosVitales ? (
                                <div className="flex items-center gap-1">
                                  <Input type="number" step="1" value={signosVitalesTemp.frecuenciaCardiaca} onChange={(e) => setSignosVitalesTemp({...signosVitalesTemp, frecuenciaCardiaca: e.target.value})} className={`w-24 text-lg ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`} />
                                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>bpm</span>
                                </div>
                              ) : (
                                <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {pacienteSeleccionado.informacionMedica.frecuenciaCardiaca} bpm
                                </p>
                              )}
                            </div>
                          </div>
                          {editandoSignosVitales && (
                            <div className="mt-3 flex justify-end">
                              <Button size="sm" variant="ghost" onClick={() => setEditandoSignosVitales(false)} className={darkMode ? 'text-gray-400 hover:text-white' : ''}>
                                Cancelar
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Última Historia Clínica */}
                      {pacienteSeleccionado.historiaClinica.length > 0 && (
                        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                          <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              Última Consulta
                            </h3>
                          </div>
                          <div className="p-6">
                            {(() => {
                              const ultima = pacienteSeleccionado.historiaClinica[0];
                              return (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                      {ultima.tipo}
                                    </Badge>
                                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {new Date(ultima.fecha).toLocaleDateString('es-ES')}
                                    </span>
                                  </div>
                                  <div>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Veterinario</p>
                                    <p className={darkMode ? 'text-white' : 'text-gray-900'}>{ultima.veterinario}</p>
                                  </div>
                                  <div>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Motivo</p>
                                    <p className={darkMode ? 'text-white' : 'text-gray-900'}>{ultima.motivo}</p>
                                  </div>
                                  <div>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Diagnóstico</p>
                                    <p className={darkMode ? 'text-white' : 'text-gray-900'}>{ultima.diagnostico}</p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </Card>
                      )}

                      {/* Notas */}
                      {pacienteSeleccionado.notas && (
                        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                          <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              Notas Generales
                            </h3>
                          </div>
                          <div className="p-6">
                            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                              {pacienteSeleccionado.notas}
                            </p>
                          </div>
                        </Card>
                      )}
                    </TabsContent>

                    {/* TAB HISTORIA CLÍNICA */}
                    <TabsContent value="historia" className="mt-6">
                      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                          <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Historias Clínicas
                          </h3>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Historia
                          </Button>
                        </div>
                        <div className="p-6 space-y-4">
                          {pacienteSeleccionado.historiaClinica.map(historia => (
                            <div
                              key={historia.id}
                              className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-2">
                                    {historia.tipo}
                                  </Badge>
                                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {new Date(historia.fecha).toLocaleDateString('es-ES', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {historia.veterinario}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Motivo:</p>
                                  <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{historia.motivo}</p>
                                </div>
                                <div>
                                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Diagnóstico:</p>
                                  <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{historia.diagnostico}</p>
                                </div>
                                <div>
                                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Tratamiento:</p>
                                  <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{historia.tratamiento}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {pacienteSeleccionado.historiaClinica.length === 0 && (
                            <div className="text-center py-12">
                              <FileText className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                No hay historias cl��nicas registradas
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </TabsContent>

                    {/* TAB DIAGNÓSTICOS */}
                    <TabsContent value="diagnosticos" className="mt-6">
                      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                          <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Diagnósticos
                          </h3>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Diagnóstico
                          </Button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <tr>
                                <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
                                  Fecha
                                </th>
                                <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
                                  Código
                                </th>
                                <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
                                  Descripción
                                </th>
                                <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
                                  Estado
                                </th>
                                <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
                                  Veterinario
                                </th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                              {pacienteSeleccionado.diagnosticos.map(diagnostico => (
                                <tr key={diagnostico.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    {new Date(diagnostico.fecha).toLocaleDateString('es-ES')}
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                      {diagnostico.codigo || 'N/A'}
                                    </Badge>
                                  </td>
                                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    {diagnostico.descripcion}
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge className={
                                      diagnostico.estado === 'activo'
                                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                        : diagnostico.estado === 'cronico'
                                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                    }>
                                      {diagnostico.estado}
                                    </Badge>
                                  </td>
                                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {diagnostico.veterinario}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {pacienteSeleccionado.diagnosticos.length === 0 && (
                          <div className="text-center py-12">
                            <Activity className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                              No hay diagnósticos registrados
                            </p>
                          </div>
                        )}
                      </Card>
                    </TabsContent>

                    {/* TAB MEDICAMENTOS */}
                    <TabsContent value="medicamentos" className="mt-6">
                      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                          <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Medicamentos
                          </h3>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Medicamento
                          </Button>
                        </div>
                        <div className="p-6 space-y-4">
                          {pacienteSeleccionado.medicamentos.map(medicamento => (
                            <div
                              key={medicamento.id}
                              className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className={`text-lg mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {medicamento.nombre}
                                  </h4>
                                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {medicamento.dosis} - {medicamento.frecuencia}
                                  </p>
                                </div>
                                <Badge className={
                                  medicamento.estado === 'activo'
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                }>
                                  {medicamento.estado}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Inicio:</p>
                                  <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                    {new Date(medicamento.fechaInicio).toLocaleDateString('es-ES')}
                                  </p>
                                </div>
                                {medicamento.fechaFin && (
                                  <div>
                                    <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Fin:</p>
                                    <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                      {new Date(medicamento.fechaFin).toLocaleDateString('es-ES')}
                                    </p>
                                  </div>
                                )}
                              </div>
                              {medicamento.indicaciones && (
                                <div className="mt-3">
                                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Indicaciones:</p>
                                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {medicamento.indicaciones}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                          {pacienteSeleccionado.medicamentos.length === 0 && (
                            <div className="text-center py-12">
                              <Pill className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                No hay medicamentos registrados
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </TabsContent>

                    {/* TAB VACUNAS */}
                    <TabsContent value="vacunas" className="mt-6">
                      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                          <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Vacunas
                          </h3>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Vacuna
                          </Button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <tr>
                                <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
                                  Vacuna
                                </th>
                                <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
                                  Fecha Aplicación
                                </th>
                                <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
                                  Próxima Aplicación
                                </th>
                                <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
                                  Lote
                                </th>
                                <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>
                                  Veterinario
                                </th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                              {pacienteSeleccionado.vacunas.map(vacuna => (
                                <tr key={vacuna.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                  <td className={`px-6 py-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {vacuna.nombre}
                                  </td>
                                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    {new Date(vacuna.fecha).toLocaleDateString('es-ES')}
                                  </td>
                                  <td className="px-6 py-4">
                                    {vacuna.proximaAplicacion ? (
                                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                                        {new Date(vacuna.proximaAplicacion).toLocaleDateString('es-ES')}
                                      </Badge>
                                    ) : (
                                      <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>-</span>
                                    )}
                                  </td>
                                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {vacuna.lote || '-'}
                                  </td>
                                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {vacuna.veterinario}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {pacienteSeleccionado.vacunas.length === 0 && (
                          <div className="text-center py-12">
                            <Syringe className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                              No hay vacunas registradas
                            </p>
                          </div>
                        )}
                      </Card>
                    </TabsContent>

                    {/* TAB DERIVACIONES */}
                    <TabsContent value="derivaciones" className="mt-6">
                      <div className="space-y-6">
                        {/* Botón de Derivar */}
                        <Card className={`p-6 ${darkMode ? 'bg-gradient-to-r from-orange-900/20 to-orange-800/20 border-orange-800' : 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                                <Activity className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  Derivación Clínica
                                </h3>
                                <p className={`text-sm ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                                  Deriva este paciente a un especialista
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => setMostrarModalDerivacion(true)}
                              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Derivar a Especialidad
                            </Button>
                          </div>
                        </Card>

                        {/* Timeline de Derivaciones */}
                        <TimelineDerivaciones
                          darkMode={darkMode}
                          derivaciones={pacienteSeleccionado.derivaciones || []}
                          paciente={{
                            nombre: pacienteSeleccionado.nombre,
                            especie: pacienteSeleccionado.especie
                          }}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Modal Nuevo Paciente */}
      {mostrarNuevoPaciente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className={`w-full max-w-4xl ${darkMode ? 'bg-gray-800' : 'bg-white'} my-8`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Registrar Nuevo Paciente
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrarNuevoPaciente(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Información del Paciente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre *</Label>
                      <Input
                        value={nuevoPaciente.nombre}
                        onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, nombre: e.target.value })}
                        placeholder="Max, Luna, Rocky..."
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                      />
                    </div>
                    <div>
                      <Label>Especie *</Label>
                      <Select
                        value={nuevoPaciente.especie}
                        onValueChange={(value) => setNuevoPaciente({ ...nuevoPaciente, especie: value })}
                      >
                        <SelectTrigger className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Canino">Canino</SelectItem>
                          <SelectItem value="Felino">Felino</SelectItem>
                          <SelectItem value="Ave">Ave</SelectItem>
                          <SelectItem value="Roedor">Roedor</SelectItem>
                          <SelectItem value="Reptil">Reptil</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Raza</Label>
                      <Input
                        value={nuevoPaciente.raza}
                        onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, raza: e.target.value })}
                        placeholder="Labrador, Persa..."
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                      />
                    </div>
                    <div>
                      <Label>Sexo</Label>
                      <Select
                        value={nuevoPaciente.sexo}
                        onValueChange={(value) => setNuevoPaciente({ ...nuevoPaciente, sexo: value })}
                      >
                        <SelectTrigger className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Macho">Macho</SelectItem>
                          <SelectItem value="Hembra">Hembra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Fecha de Nacimiento</Label>
                      <Input
                        type="date"
                        value={nuevoPaciente.fechaNacimiento}
                        onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, fechaNacimiento: e.target.value })}
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                      />
                    </div>
                    <div>
                      <Label>Microchip</Label>
                      <Input
                        value={nuevoPaciente.microchip}
                        onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, microchip: e.target.value })}
                        placeholder="982000123456789"
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Información del Propietario
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre Completo *</Label>
                      <Input
                        value={nuevoPaciente.propietario?.nombre}
                        onChange={(e) => setNuevoPaciente({
                          ...nuevoPaciente,
                          propietario: { ...nuevoPaciente.propietario!, nombre: e.target.value }
                        })}
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                      />
                    </div>
                    <div>
                      <Label>Documento</Label>
                      <Input
                        value={nuevoPaciente.propietario?.documento}
                        onChange={(e) => setNuevoPaciente({
                          ...nuevoPaciente,
                          propietario: { ...nuevoPaciente.propietario!, documento: e.target.value }
                        })}
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                      />
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <Input
                        value={nuevoPaciente.propietario?.telefono}
                        onChange={(e) => setNuevoPaciente({
                          ...nuevoPaciente,
                          propietario: { ...nuevoPaciente.propietario!, telefono: e.target.value }
                        })}
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={nuevoPaciente.propietario?.email}
                        onChange={(e) => setNuevoPaciente({
                          ...nuevoPaciente,
                          propietario: { ...nuevoPaciente.propietario!, email: e.target.value }
                        })}
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Dirección</Label>
                      <Input
                        value={nuevoPaciente.propietario?.direccion}
                        onChange={(e) => setNuevoPaciente({
                          ...nuevoPaciente,
                          propietario: { ...nuevoPaciente.propietario!, direccion: e.target.value }
                        })}
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setMostrarNuevoPaciente(false)}
                  className={darkMode ? 'border-gray-700 text-gray-300' : ''}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={agregarPaciente}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                >
                  Guardar Paciente
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de solicitud de acceso clínico */}
      <AnimatePresence>
        {mostrarModalAcceso && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border rounded-xl max-w-2xl w-full`}
            >
              <div className={`p-6 ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Solicitar Acceso Clínico
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {pacienteSeleccionado?.nombre} - {pacienteSeleccionado?.especie}
                </p>
              </div>

              <div className="p-6 space-y-5">
                
                {/* Campo: Especialidad Solicitada */}
                <div>
                  <Label className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 block`}>
                    Especialidad Solicitada *
                  </Label>
                  <Select value={especialidadSolicitada} onValueChange={setEspecialidadSolicitada}>
                    <SelectTrigger className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}>
                      <SelectValue placeholder="Selecciona tu especialidad" />
                    </SelectTrigger>
                    <SelectContent className={darkMode ? 'bg-gray-900 border-gray-700' : ''}>
                      <SelectItem value="cardiologia" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                        Cardiología Veterinaria
                      </SelectItem>
                      <SelectItem value="neurologia" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                        Neurología Veterinaria
                      </SelectItem>
                      <SelectItem value="oncologia" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                        Oncología Veterinaria
                      </SelectItem>
                      <SelectItem value="dermatologia" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                        Dermatología Veterinaria
                      </SelectItem>
                      <SelectItem value="oftalmologia" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                        Oftalmología Veterinaria
                      </SelectItem>
                      <SelectItem value="cirugia" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                        Cirugía Veterinaria
                      </SelectItem>
                      <SelectItem value="medicina-interna" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                        Medicina Interna Veterinaria
                      </SelectItem>
                      <SelectItem value="anestesiologia" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                        Anestesiología Veterinaria
                      </SelectItem>
                      <SelectItem value="diagnostico-imagen" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                        Diagnóstico por Imagen
                      </SelectItem>
                      <SelectItem value="otra" className={darkMode ? 'text-white hover:bg-gray-800' : ''}>
                        Otra Especialidad
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                    Esta información ayuda al doctor propietario a evaluar tu solicitud
                  </p>
                </div>

                {/* Campo: Motivo Clínico */}
                <div>
                  <Label className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 block`}>
                    Motivo Clínico *
                  </Label>
                  <Textarea
                    value={motivoAcceso}
                    onChange={(e) => setMotivoAcceso(e.target.value)}
                    placeholder="Ejemplo: Paciente derivado para evaluación cardiológica por soplo sistólico grado III/VI detectado durante consulta de rutina. Requiero acceder a historia clínica previa, estudios de imagen cardíaca y resultados de laboratorio recientes para establecer diagnóstico diferencial entre insuficiencia mitral degenerativa vs. cardiomiopatía dilatada..."
                    rows={5}
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Describe detalladamente el contexto clínico de tu solicitud
                    </p>
                    <p className={`text-xs ${
                      motivoAcceso.length < 50 
                        ? 'text-orange-500' 
                        : darkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {motivoAcceso.length}/50 mín.
                    </p>
                  </div>
                </div>

                {/* Permisos Solicitados */}
                <div>
                  <Label className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 block`}>
                    Permisos Solicitados
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        permisos.verDiagnosticos
                          ? darkMode
                            ? 'bg-orange-900/20 border-orange-500'
                            : 'bg-orange-50 border-orange-300'
                          : darkMode
                          ? 'bg-gray-900 border-gray-700 hover:border-gray-600'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPermisos({...permisos, verDiagnosticos: !permisos.verDiagnosticos})}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={permisos.verDiagnosticos}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Ver diagnósticos
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Acceso a diagnósticos activos y pasados
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        permisos.verEstudios
                          ? darkMode
                            ? 'bg-orange-900/20 border-orange-500'
                            : 'bg-orange-50 border-orange-300'
                          : darkMode
                          ? 'bg-gray-900 border-gray-700 hover:border-gray-600'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPermisos({...permisos, verEstudios: !permisos.verEstudios})}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={permisos.verEstudios}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Ver estudios
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Imágenes, laboratorios y otros estudios
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        permisos.verMedicacion
                          ? darkMode
                            ? 'bg-orange-900/20 border-orange-500'
                            : 'bg-orange-50 border-orange-300'
                          : darkMode
                          ? 'bg-gray-900 border-gray-700 hover:border-gray-600'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPermisos({...permisos, verMedicacion: !permisos.verMedicacion})}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={permisos.verMedicacion}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Ver medicación activa
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Tratamientos actuales y dosis
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        permisos.verHistoriaCompleta
                          ? darkMode
                            ? 'bg-orange-900/20 border-orange-500'
                            : 'bg-orange-50 border-orange-300'
                          : darkMode
                          ? 'bg-gray-900 border-gray-700 hover:border-gray-600'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPermisos({...permisos, verHistoriaCompleta: !permisos.verHistoriaCompleta})}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={permisos.verHistoriaCompleta}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Historia clínica completa
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Todas las consultas y procedimientos
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Microcopy Legal */}
                <div className={`p-4 rounded-lg ${
                  darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                      <p className="mb-2">
                        <strong className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                          Aviso Legal:
                        </strong>
                      </p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>El acceso está sujeto a aprobación del médico tratante.</li>
                        <li>Toda visualización queda registrada en el sistema de auditoría.</li>
                        <li>El uso indebido de la información puede resultar en sanciones legales.</li>
                        <li>Los datos son confidenciales según normativa GDPR/HIPAA.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-6 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'} flex justify-end gap-3`}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMostrarModalAcceso(false);
                    setMotivoAcceso('');
                    setEspecialidadSolicitada('');
                    setPermisos({
                      verDiagnosticos: true,
                      verEstudios: true,
                      verMedicacion: true,
                      verHistoriaCompleta: true
                    });
                  }}
                  className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-900' : ''}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmarSolicitudAcceso}
                  className="text-white"
                  style={{
                    background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                    boxShadow: '0 4px 12px -2px rgba(249, 115, 22, 0.4)'
                  }}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Enviar Solicitud
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Derivación Clínica */}
      {mostrarModalDerivacion && pacienteSeleccionado && (
        <ModalDerivacionClinica
          darkMode={darkMode}
          paciente={{
            id: pacienteSeleccionado.id,
            nombre: pacienteSeleccionado.nombre,
            especie: pacienteSeleccionado.especie,
            raza: pacienteSeleccionado.raza,
            edad: pacienteSeleccionado.edad
          }}
          onClose={() => setMostrarModalDerivacion(false)}
          onDerivar={handleDerivar}
        />
      )}
      {/* Modal Wizard de Consulta */}
      {mostrarConsultaWizard && pacienteSeleccionado && (
        <ConsultaClinicaWizard
          paciente={pacienteSeleccionado}
          citaId={citaActivaId}
          onClose={() => setMostrarConsultaWizard(false)}
          onFinalizar={handleFinalizarConsulta}
        />
      )}
    </div>
  );
}
