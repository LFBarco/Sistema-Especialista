import React, { useState, useEffect, createContext, useContext } from 'react';
import { ChatInbox } from './components/ChatInbox';
import { Dashboard } from './components/Dashboard';
import { DashboardClinica } from './components/DashboardClinica';
import { AgendaBusyFree } from './components/AgendaBusyFree';
import { ConciliacionFinanciera } from './components/ConciliacionFinanciera';
import { EstadoCuentaClinica } from './components/EstadoCuentaClinica';
import { EstadoCuentaClinicaV2 } from './components/EstadoCuentaClinicaV2';
import { MisFacturas } from './components/MisFacturas';
import { MetricasClinica } from './components/MetricasClinica';
import { EspecialistasAfiliados } from './components/EspecialistasAfiliados';
import { RegistroEspecialista } from './components/RegistroEspecialista';
import { PerfilProfesional } from './components/PerfilProfesional';
import { VerificacionProfesional } from './components/VerificacionProfesional';
import { ReportesAvanzados } from './components/ReportesAvanzados';
import { Solicitudes } from './components/Solicitudes';
import { SolicitudesV2 } from './components/SolicitudesV2';
import { Agenda } from './components/Agenda';
import { Servicios } from './components/Servicios';
import { FacturacionEnterpriseV2 as Facturacion } from './components/FacturacionEnterpriseV2';
import { FacturacionElectronica } from './components/FacturacionElectronica';
import { Finanzas } from './components/Finanzas';
import { Clinicas } from './components/Clinicas';
import { Perfil } from './components/Perfil';
import { PerfilClinica } from './components/PerfilClinica';
import { GoogleCalendarSync } from './components/GoogleCalendarSync';
import { Usuarios } from './components/Usuarios';
import { Pacientes } from './components/Pacientes';
import { Configuraciones } from './components/Configuraciones';
import { GestionSedes } from './components/GestionSedes';
import { Interconsultas } from './components/Interconsultas';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PremiumLogin } from './components/PremiumLogin';
import { RegistroSelector } from './components/RegistroSelector';
import { RegistroClinicaWizard } from './components/RegistroClinicaWizard';
import { RegistroEspecialistaWizard } from './components/RegistroEspecialistaWizard';
import { MobileNav } from './components/MobileNav';
import { SpecialistDashboardMobile } from './components/mobile/SpecialistDashboardMobile';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import * as API from './utils/api';
import { supabase } from './utils/supabase/client';
import { setupRealtimeSubscriptions } from './utils/supabase/realtime';
import type { Notificacion } from './components/NotificacionesMedicas';

// Tipos
export interface Solicitud {
  id: number;
  clinica: string;
  clinicaId: string;
  sedeId?: string;
  especialistaId: number;
  tipo: string;
  paciente: string;
  especie: string;
  fechaSolicitada: string;
  horaSolicitada: string;
  urgencia: 'baja' | 'media' | 'alta';
  descripcion: string;
  tarifa: number;
  direccion: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  fechaSolicitud: string;
}

export interface Servicio {
  id: number;
  fecha: string;
  clinica: string;
  sedeId?: string;
  tipo: string;
  paciente: string;
  especie: string;
  estado: 'confirmado' | 'completado' | 'facturado' | 'pagado' | 'cancelado';
  tarifa: number;
  facturaId?: string;
  notas: string;
  hora?: string;
  duracion?: number;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export interface Factura {
  id: string;
  numero: string;
  fecha: string;
  vencimiento: string;
  clinica: string;
  razonSocial?: string;
  rfc?: string;
  direccionFiscal?: string;
  sedeId?: string;
  servicioId: number;
  servicios: {
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
  }[];
  subtotal: number;
  impuestos: number;
  total: number;
  estado: 'borrador' | 'enviada' | 'validada_por_sede' | 'pagada' | 'vencida';
}

export interface Gasto {
  id: number;
  fecha: string;
  categoria: string;
  descripcion: string;
  monto: number;
  metodoPago: string;
  factura?: string;
}

export interface Pago {
  id: number;
  facturaId: string;
  clinica: string;
  monto: number;
  fecha: string;
  metodoPago: 'transferencia' | 'cheque' | 'efectivo' | 'tarjeta';
  referencia: string;
  comprobante?: string;
  estado: 'pendiente' | 'verificado' | 'rechazado';
  notas?: string;
  fechaRegistro: string;
  registradoPor: 'clinica' | 'especialista';
}

export interface Conciliacion {
  id: number;
  facturaId: string;
  facturaNumero: string;
  clinica: string;
  montoFactura: number;
  montoPagado: number;
  diferencia: number;
  estado: 'pendiente' | 'conciliado' | 'parcial' | 'con_diferencia';
  pagos: Pago[];
  fechaEmision: string;
  fechaVencimiento: string;
  fechaConciliacion?: string;
  notas?: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  especialidad?: string;
  rol: string;
  activo: boolean;
  fechaRegistro: string;
  sedesIds?: string[];
}

export interface Especialista {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: Especialidad;
  email: string;
  telefono: string;
  foto?: string;
  tarifa: number;
  experiencia: number;
  descripcion: string;
  disponibilidad: {
    lunes: { inicio: string; fin: string }[];
    martes: { inicio: string; fin: string }[];
    miercoles: { inicio: string; fin: string }[];
    jueves: { inicio: string; fin: string }[];
    viernes: { inicio: string; fin: string }[];
    sabado: { inicio: string; fin: string }[];
    domingo: { inicio: string; fin: string }[];
  };
  activo: boolean;
  rating: number;
  serviciosRealizados: number;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: {
    [modulo: string]: string[];
  };
}

export interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  clinicaId: string;
  encargado?: string;
  activo: boolean;
}

export interface AccesoClinico {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  doctorSolicitante: {
    id: number;
    nombre: string;
    especialidad: string;
    email: string;
  };
  doctorPropietario: {
    id: number;
    nombre: string;
    especialidad: string;
  };
  motivoClinico: string;
  permiso: {
    verDiagnosticos: boolean;
    verEstudios: boolean;
    verMedicacion: boolean;
    verHistoriaCompleta: boolean;
  };
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'revocado';
  fechaSolicitud: string;
  fechaRespuesta?: string;
  notasRespuesta?: string;
  vigenciaHasta?: string;
}

export type Especialidad = 
  | 'Cardiología'
  | 'Cirugía'
  | 'Anestesiología'
  | 'Dermatología'
  | 'Neurología'
  | 'Oftalmología'
  | 'Oncología'
  | 'Medicina Interna';

export interface ConfigItem {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  orden?: number;
  metadata?: any;
}

// Context
interface AppContextType {
  configServicios: ConfigItem[];
  setConfigServicios: (items: ConfigItem[]) => void;
  solicitudes: Solicitud[];
  setSolicitudes: (solicitudes: Solicitud[]) => void;
  servicios: Servicio[];
  setServicios: (servicios: Servicio[]) => void;
  facturas: Factura[];
  setFacturas: (facturas: Factura[]) => void;
  gastos: Gasto[];
  setGastos: (gastos: Gasto[]) => void;
  usuarios: Usuario[];
  setUsuarios: (usuarios: Usuario[]) => void;
  roles: Rol[];
  setRoles: (roles: Rol[]) => void;
  pagos: Pago[];
  setPagos: (pagos: Pago[]) => void;
  sedes: Sede[];
  setSedes: (sedes: Sede[]) => void;
  selectedSedeId: string;
  setSelectedSedeId: (id: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  aceptarSolicitud: (id: number) => void;
  rechazarSolicitud: (id: number) => void;
  crearSolicitud: (nuevaSolicitud: Omit<Solicitud, 'id'>) => Promise<boolean>;
  completarServicio: (id: number) => void;
  generarFactura: (servicioId: number) => void;
  validarFacturaSede: (facturaId: string) => void;
  marcarComoPagada: (facturaId: string) => void;
  navegarA: (modulo: string, data?: any) => void;
  activeModule: string;
  handleLogout: () => void;
  userClinicas: Array<{
    id: string;
    nombre: string;
    contacto: string;
    telefono: string;
    direccion: string;
    razonSocial?: string;
    rfc?: string;
    color: string;
    apiKey?: string;
  }>;
  setUserClinicas: (clinicas: any[]) => void;
  getClinicaById: (id: string) => any;
  getClinicaByNombre: (nombre: string) => any;
  generarApiKey: (clinicaId: string) => string;
  revocarApiKey: (clinicaId: string) => void;
  notificaciones: Notificacion[];
  marcarNotificacionLeida: (id: number) => void;
  marcarTodasNotificacionesLeidas: () => void;
  eliminarNotificacion: (id: number) => void;
  accesosClinic: AccesoClinico[];
  setAccesosClinic: (accesos: AccesoClinico[]) => void;
  solicitarAccesoClinico: (acceso: Omit<AccesoClinico, 'id' | 'fechaSolicitud' | 'estado'>) => void;
  aprobarAccesoClinico: (id: number, notas?: string, vigencia?: string) => void;
  rechazarAccesoClinico: (id: number, notas?: string) => void;
  revocarAccesoClinico: (id: number) => void;
  verificarAccesoPaciente: (pacienteId: number, doctorId: number) => AccesoClinico | null;
  usuarioActual: {
    id: number;
    nombre: string;
    email: string;
    especialidad?: string;
    sedesIds?: string[];
  } | null;
  simularUsuario: (tipo: 'admin' | 'sede_norte') => void;
  rolActivo: 'especialista' | 'clinica';
  setRolActivo: (rol: 'especialista' | 'clinica') => void;
  especialistas: Especialista[];
  setEspecialistas: (especialistas: Especialista[]) => void;
  especialistaSeleccionado: number;
  setEspecialistaSeleccionado: (id: number) => void;
  getEspecialistaById: (id: number) => Especialista | undefined;
  registrarPagoFactura: (numeroFactura: string, datosPago: { monto: number; fecha: string; metodoPago: string; referencia: string; comprobante?: string }) => void;
  actualizarServicio: (id: number, data: Partial<Servicio>) => Promise<void>;
  crearServicio: (data: Omit<Servicio, 'id'>) => Promise<void>;
  moduleData: any;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// Roles del sistema (configuración fija)
const defaultRoles: Rol[] = [
  {
    id: 'admin',
    nombre: 'Administrador',
    descripcion: 'Acceso completo a todas las funcionalidades del sistema',
    permisos: {
      dashboard: ['ver'],
      solicitudes: ['ver', 'crear', 'editar', 'eliminar'],
      agenda: ['ver', 'crear', 'editar', 'eliminar'],
      servicios: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
      facturacion: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
      finanzas: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
      clinicas: ['ver', 'crear', 'editar', 'eliminar'],
      usuarios: ['ver', 'crear', 'editar', 'eliminar'],
      perfil: ['ver', 'editar']
    }
  },
  {
    id: 'medico',
    nombre: 'Médico Especialista',
    descripcion: 'Acceso completo excepto gestión de usuarios',
    permisos: {
      dashboard: ['ver'],
      solicitudes: ['ver', 'crear', 'editar', 'eliminar'],
      agenda: ['ver', 'crear', 'editar', 'eliminar'],
      servicios: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
      facturacion: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
      finanzas: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
      clinicas: ['ver', 'crear', 'editar', 'eliminar'],
      usuarios: ['ver'],
      perfil: ['ver', 'editar']
    }
  },
  {
    id: 'asistente',
    nombre: 'Asistente',
    descripcion: 'Acceso limitado a solicitudes y agenda',
    permisos: {
      dashboard: ['ver'],
      solicitudes: ['ver', 'crear', 'editar'],
      agenda: ['ver', 'crear', 'editar'],
      servicios: ['ver'],
      facturacion: ['ver'],
      finanzas: ['ver'],
      clinicas: ['ver'],
      perfil: ['ver', 'editar']
    }
  },
  {
    id: 'contador',
    nombre: 'Contador',
    descripcion: 'Acceso completo a facturación y finanzas',
    permisos: {
      dashboard: ['ver'],
      solicitudes: ['ver'],
      agenda: ['ver'],
      servicios: ['ver', 'exportar'],
      facturacion: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
      finanzas: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
      clinicas: ['ver'],
      perfil: ['ver', 'editar']
    }
  },
  {
    id: 'lectura',
    nombre: 'Solo Lectura',
    descripcion: 'Acceso de solo lectura a todos los módulos',
    permisos: {
      dashboard: ['ver'],
      solicitudes: ['ver'],
      agenda: ['ver'],
      servicios: ['ver'],
      facturacion: ['ver'],
      finanzas: ['ver'],
      clinicas: ['ver'],
      perfil: ['ver']
    }
  }
];

export default function App() {
  // Estados de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [vistaAuth, setVistaAuth] = useState<'login' | 'selector' | 'registro-clinica' | 'registro-especialista'>('login');
  const [currentUser, setCurrentUser] = useState<{
    nombre: string;
    rol: string;
    email: string;
    especialidad?: string;
    sedesIds?: string[];
  } | null>(null);

  const simularUsuario = (tipo: 'admin' | 'sede_norte') => {
    if (tipo === 'admin') {
      setCurrentUser({
        nombre: 'Admin Corporativo',
        rol: 'admin',
        email: 'admin@vetcorp.com',
        sedesIds: undefined
      });
      setSelectedSedeId('all');
      toast.info('Modo: Admin Corporativo (Acceso Global)');
    } else {
      setCurrentUser({
        nombre: 'Dra. Ana (Sede Norte)',
        rol: 'veterinario',
        email: 'ana@sedenorte.com',
        sedesIds: ['2']
      });
      setSelectedSedeId('2');
      toast.info('Modo: Dra. Ana (Acceso Limitado a Sede Norte)');
    }
  };
  
  // Estado de la aplicación
  const [activeModule, setActiveModule] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [selectedSedeId, setSelectedSedeId] = useState<string>('all');
  const [moduleData, setModuleData] = useState<any>(null);
  const [rolActivo, setRolActivo] = useState<'especialista' | 'clinica'>('especialista');
  
  // Todos los datos se cargan desde el backend
  const [userClinicas, setUserClinicas] = useState<any[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [configServicios, setConfigServicios] = useState<ConfigItem[]>([
    { id: 1, nombre: 'Ecocardiograma', descripcion: 'Estudio cardíaco con ultrasonido', activo: true, orden: 1, metadata: { precio: 150000 } },
    { id: 2, nombre: 'Ecocardiograma Doppler', descripcion: 'Estudio cardíaco avanzado con Doppler', activo: true, orden: 2, metadata: { precio: 200000 } },
    { id: 3, nombre: 'Consulta Cardiológica', descripcion: 'Consulta especializada en cardiología', activo: true, orden: 3, metadata: { precio: 80000 } },
    { id: 4, nombre: 'Electrocardiograma', descripcion: 'Estudio de actividad eléctrica del corazón', activo: true, orden: 4, metadata: { precio: 60000 } },
    { id: 5, nombre: 'Seguimiento Post-Quirúrgico', descripcion: 'Control después de cirugía cardíaca', activo: true, orden: 5, metadata: { precio: 50000 } },
    { id: 6, nombre: 'Holter 24h', descripcion: 'Monitoreo cardíaco continuo 24 horas', activo: true, orden: 6, metadata: { precio: 250000 } },
    { id: 7, nombre: 'Evaluación Pre-Anestésica', descripcion: 'Evaluación cardíaca pre-operatoria', activo: true, orden: 7, metadata: { precio: 120000 } }
  ]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [conciliaciones, setConciliaciones] = useState<Conciliacion[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>(defaultRoles);
  const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
  const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState<number>(0);
  const [accesosClinic, setAccesosClinic] = useState<AccesoClinico[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Funciones para manejar notificaciones
  const marcarNotificacionLeida = (id: number) => {
    setNotificaciones(prev => 
      prev.map(n => n.id === id ? { ...n, leida: true } : n)
    );
  };

  const marcarTodasNotificacionesLeidas = () => {
    setNotificaciones(prev => 
      prev.map(n => ({ ...n, leida: true }))
    );
    toast.success('Todas las notificaciones marcadas como leídas');
  };

  const eliminarNotificacion = (id: number) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
    toast.success('Notificación eliminada');
  };

  // Generar notificaciones automáticamente cuando hay nuevas solicitudes
  useEffect(() => {
    const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente');
    
    solicitudesPendientes.forEach(solicitud => {
      const yaExisteNotif = notificaciones.some(n => 
        n.metadata?.solicitudId === solicitud.id
      );

      if (!yaExisteNotif && solicitud.urgencia === 'alta') {
        const nuevaNotif: Notificacion = {
          id: Date.now() + solicitud.id,
          tipo: 'urgencia',
          prioridad: 'critica',
          titulo: `Urgencia: ${solicitud.tipo}`,
          descripcion: `${solicitud.clinica} solicita servicio urgente para ${solicitud.paciente}`,
          timestamp: new Date(),
          leida: false,
          accionUrl: '/solicitudes',
          metadata: { solicitudId: solicitud.id }
        };

        setNotificaciones(prev => [nuevaNotif, ...prev]);
      }
    });
  }, [solicitudes]);

  // Generar notificaciones automáticamente para interconsultas pendientes
  useEffect(() => {
    const accesosPendientes = accesosClinic.filter(a => a.estado === 'pendiente');
    
    accesosPendientes.forEach(acceso => {
      const yaExisteNotif = notificaciones.some(n => 
        n.metadata?.accesoId === acceso.id
      );

      if (!yaExisteNotif) {
        const nuevaNotif: Notificacion = {
          id: Date.now() + acceso.id + 10000,
          tipo: 'interconsulta',
          prioridad: 'importante',
          titulo: `Solicitud de acceso clínico`,
          descripcion: `${acceso.doctorSolicitante.nombre} (${acceso.doctorSolicitante.especialidad}) solicita acceso al expediente de ${acceso.pacienteNombre}`,
          timestamp: new Date(acceso.fechaSolicitud),
          leida: false,
          accionUrl: '/interconsultas',
          metadata: { accesoId: acceso.id }
        };

        setNotificaciones(prev => [nuevaNotif, ...prev]);
      }
    });
  }, [accesosClinic]);

  // Cargar TODOS los datos desde Supabase al iniciar
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Cargar todos los recursos desde Supabase en paralelo
        const [
          solicitudesData,
          serviciosData,
          facturasData,
          gastosData,
          usuariosData,
          rolesData,
          sedesData,
          clinicasData,
          pagosData,
          especialistasData,
          accesosData,
          conciliacionesData,
        ] = await Promise.all([
          API.solicitudesAPI.getAll(),
          API.serviciosAPI.getAll(),
          API.facturasAPI.getAll(),
          API.gastosAPI.getAll(),
          API.usuariosAPI.getAll(),
          API.rolesAPI.getAll(),
          API.sedesAPI.getAll(),
          API.clinicasAPI.getAll(),
          API.pagosAPI.getAll(),
          API.especialistasAPI.getAll(),
          API.accesosClinicosAPI.getAll(),
          API.conciliacionesAPI.getAll(),
        ]);

        // Asignar todos los datos cargados
        if (solicitudesData.length > 0) setSolicitudes(solicitudesData);
        if (serviciosData.length > 0) setServicios(serviciosData);
        if (facturasData.length > 0) setFacturas(facturasData);
        if (gastosData.length > 0) setGastos(gastosData);
        if (usuariosData.length > 0) setUsuarios(usuariosData);
        if (rolesData.length > 0) setRoles(rolesData);
        if (sedesData.length > 0) setSedes(sedesData);
        if (clinicasData.length > 0) setUserClinicas(clinicasData);
        if (pagosData.length > 0) setPagos(pagosData);
        if (especialistasData.length > 0) setEspecialistas(especialistasData);
        if (accesosData.length > 0) setAccesosClinic(accesosData);
        if (conciliacionesData.length > 0) setConciliaciones(conciliacionesData);

        // Seleccionar primer especialista si existe
        if (especialistasData.length > 0 && especialistasData[0]?.id) {
          setEspecialistaSeleccionado(especialistasData[0].id);
        }

        console.log('Datos cargados desde Supabase:', {
          solicitudes: solicitudesData.length,
          servicios: serviciosData.length,
          facturas: facturasData.length,
          clinicas: clinicasData.length,
          especialistas: especialistasData.length,
          pagos: pagosData.length,
          sedes: sedesData.length,
        });

      } catch (error) {
        console.error('Error cargando datos desde Supabase:', error);
        // No mostrar toast para permitir trabajo offline silencioso
        console.warn('⚠️ Trabajando en modo offline. Los datos se guardarán localmente.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // ============================================
  // SUPABASE REALTIME - Sincronización en tiempo real
  // ============================================
  useEffect(() => {
    if (!isAuthenticated) return;

    const cleanup = setupRealtimeSubscriptions({
      onPagosChange: (pagosActualizados, event) => {
        setPagos(pagosActualizados);
        if (event?.eventType === 'INSERT' && rolActivo === 'especialista') {
           toast.success('💰 Nuevo pago registrado', { description: 'Una clínica ha registrado un pago.' });
        }
      },
      onFacturasChange: (facturasActualizadas, event) => {
        setFacturas(facturasActualizadas);
        if (event?.eventType === 'INSERT' && rolActivo === 'clinica') {
           toast.info('📄 Nueva factura disponible', { description: 'Un especialista ha generado una nueva factura.' });
        }
      },
      onServiciosChange: (serviciosActualizados, event) => {
        setServicios(serviciosActualizados);
        if (event?.eventType === 'UPDATE' && rolActivo === 'clinica') {
           // Detectar si se completó
           if (event.new?.estado === 'completado') {
              toast.success('✅ Servicio completado', { description: 'El especialista ha marcado la cita como realizada.' });
           }
        }
      },
      onSolicitudesChange: (solicitudesActualizadas, event) => {
        setSolicitudes(solicitudesActualizadas);
        
        if (event?.eventType === 'INSERT') {
          if (rolActivo === 'especialista') {
            toast.info('📋 Nueva Solicitud', { 
              description: 'Una clínica requiere tus servicios.',
              action: {
                label: 'Ver',
                onClick: () => setActiveModule('solicitudes')
              }
            });
            // Play notification sound if needed
          }
        } else if (event?.eventType === 'UPDATE') {
          if (rolActivo === 'clinica' && event.new?.estado === 'aceptada') {
            toast.success('🎉 Solicitud Aceptada', {
              description: 'El especialista ha confirmado tu solicitud.',
              action: {
                label: 'Ver Agenda',
                onClick: () => setActiveModule('agenda')
              }
            });
          }
        }
      }
    });

    return cleanup;
  }, [isAuthenticated, rolActivo]); // Re-subscribe if role changes to ensure correct context

  const aceptarSolicitud = async (id: number) => {
    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    try {
      const solicitudActualizada = { ...solicitud, estado: 'aceptada' as const };
      await API.solicitudesAPI.update(id, solicitudActualizada);

      setSolicitudes(prev => prev.map(s => 
        s.id === id ? solicitudActualizada : s
      ));

      const nuevoServicio: Servicio = {
        id: Date.now(),
        fecha: solicitud.fechaSolicitada,
        hora: solicitud.horaSolicitada,
        duracion: 60,
        clinica: solicitud.clinica,
        tipo: solicitud.tipo,
        paciente: solicitud.paciente,
        especie: solicitud.especie,
        direccion: solicitud.direccion,
        estado: 'confirmado',
        tarifa: solicitud.tarifa,
        notas: solicitud.descripcion
      };

      const servicioCreado = await API.serviciosAPI.create(nuevoServicio);
      setServicios(prev => [...prev, servicioCreado]);

      toast.success('Solicitud aceptada y agregada a la agenda');
    } catch (error) {
      console.error('Error aceptando solicitud:', error);
      toast.error('Error al aceptar la solicitud');
    }
  };

  const rechazarSolicitud = async (id: number) => {
    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    try {
      const solicitudActualizada = { ...solicitud, estado: 'rechazada' as const };
      await API.solicitudesAPI.update(id, solicitudActualizada);

      setSolicitudes(prev => prev.map(s => 
        s.id === id ? solicitudActualizada : s
      ));

      toast.success('Solicitud rechazada');
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
      toast.error('Error al rechazar la solicitud');
    }
  };

  const crearSolicitud = async (nuevaSolicitud: Omit<Solicitud, 'id'>) => {
    try {
      const solicitudConId = {
        ...nuevaSolicitud,
        id: Date.now(),
      };

      const solicitudCreada = await API.solicitudesAPI.create(solicitudConId);
      setSolicitudes(prev => [...prev, solicitudCreada]);

      return true;
    } catch (error) {
      console.error('Error creando solicitud:', error);
      toast.error('Error al crear la solicitud');
      return false;
    }
  };

  const completarServicio = async (id: number) => {
    // Buscar servicio permitiendo coincidencia laxa de tipos (string vs number)
    const servicio = servicios.find(s => s.id == id);
    
    if (!servicio) {
      console.error(`completarServicio: Servicio no encontrado con ID ${id}`, { serviciosIDs: servicios.map(s => s.id) });
      toast.error('Error interno: No se encontró el servicio');
      return;
    }

    console.log('Completando servicio:', servicio);

    try {
      const servicioActualizado = { ...servicio, estado: 'completado' as const };
      
      // Actualización optimista
      setServicios(prev => prev.map(s => 
        s.id == id ? servicioActualizado : s
      ));

      await API.serviciosAPI.update(id, servicioActualizado);
      toast.success('Servicio marcado como completado');
    } catch (error) {
      console.error('Error completando servicio:', error);
      toast.error('Error al completar el servicio');
      
      // Rollback en caso de error
      setServicios(prev => prev.map(s => 
        s.id == id ? servicio : s
      ));
    }
  };

  const actualizarServicio = async (id: number, data: Partial<Servicio>) => {
    const servicioActual = servicios.find(s => s.id === id);
    if (!servicioActual) return;

    // Optimistic UI update
    const servicioActualizado = { ...servicioActual, ...data };
    setServicios(prev => prev.map(s => 
      s.id === id ? servicioActualizado : s
    ));

    try {
      await API.serviciosAPI.update(id, servicioActualizado);
    } catch (error) {
      console.error('Error actualizando servicio:', error);
      toast.error('Error al actualizar el servicio');
      // Rollback
      setServicios(prev => prev.map(s => 
        s.id === id ? servicioActual : s
      ));
    }
  };

  const crearServicio = async (data: Omit<Servicio, 'id'>) => {
    // Generar ID temporal para UI optimista (usar random para evitar colisiones en llamadas rápidas)
    const tempId = Date.now() + Math.floor(Math.random() * 10000);
    const nuevoServicio = { ...data, id: tempId } as Servicio;
    
    setServicios(prev => [...prev, nuevoServicio]);

    try {
      const servicioCreado = await API.serviciosAPI.create(data);
      // Reemplazar el temporal con el real (aunque create devuelve el mismo objeto con ID, si el backend genera ID distinto hay que ajustar)
      // En este caso el mock devuelve { ...data, id: res.id || data.id }
      // Asegurarse de usar el ID retornado por la API si existe, sino mantener tempId o data.id
      const servicioFinal = { ...servicioCreado, id: servicioCreado.id || tempId };
      
      setServicios(prev => prev.map(s => s.id === tempId ? servicioFinal : s));
      toast.success('Servicio registrado correctamente');
    } catch (error) {
      console.error('Error creando servicio:', error);
      toast.error('Error al registrar el servicio');
      setServicios(prev => prev.filter(s => s.id !== tempId));
    }
  };

  const generarFactura = async (servicioId: number) => {
    const servicio = servicios.find(s => s.id === servicioId);
    if (!servicio || servicio.facturaId) return;

    try {
      const numeroFactura = `FAC-${String(Date.now()).slice(-6)}`;
      
      let clinicaPadre = null;
      let razonSocial = '';
      let rfc = '';
      let direccionFiscal = '';

      if (servicio.sedeId) {
        const sede = sedes.find(s => s.id === servicio.sedeId);
        if (sede) {
          clinicaPadre = userClinicas.find(c => c.id === sede.clinicaId);
        }
      } 
      
      if (!clinicaPadre && servicio.clinica) {
         clinicaPadre = userClinicas.find(c => c.nombre === servicio.clinica);
      }

      if (clinicaPadre) {
        razonSocial = clinicaPadre.razonSocial || clinicaPadre.nombre;
        rfc = clinicaPadre.rfc || 'XAXX010101000';
        direccionFiscal = clinicaPadre.direccion;
      }

      const nuevaFactura: Factura = {
        id: String(Date.now()),
        numero: numeroFactura,
        fecha: new Date().toISOString().split('T')[0],
        vencimiento: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        clinica: servicio.clinica,
        sedeId: servicio.sedeId,
        razonSocial,
        rfc,
        direccionFiscal,
        servicioId: servicio.id,
        servicios: [
          {
            descripcion: `${servicio.tipo} - ${servicio.paciente} (${servicio.especie})`,
            cantidad: 1,
            precioUnitario: servicio.tarifa
          }
        ],
        subtotal: servicio.tarifa,
        impuestos: 0,
        total: servicio.tarifa,
        estado: 'borrador'
      };

      const facturaCreada = await API.facturasAPI.create(nuevaFactura);
      
      const servicioActualizado = { ...servicio, estado: 'facturado' as const, facturaId: numeroFactura };
      await API.serviciosAPI.update(servicioId, servicioActualizado);

      setFacturas(prev => [...prev, facturaCreada]);
      setServicios(prev => prev.map(s => 
        s.id === servicioId ? servicioActualizado : s
      ));

      toast.success('Factura generada correctamente');
    } catch (error) {
      console.error('Error generando factura:', error);
      toast.error('Error al generar la factura');
    }
  };

  const validarFacturaSede = async (facturaId: string) => {
    const factura = facturas.find(f => f.id === facturaId);
    if (!factura) return;

    try {
      const facturaActualizada = { ...factura, estado: 'validada_por_sede' as const };
      await API.facturasAPI.update(facturaId, facturaActualizada);

      setFacturas(prev => prev.map(f => 
        f.id === facturaId ? facturaActualizada : f
      ));

      toast.success('Factura validada por la sede. Lista para pago.');
    } catch (error) {
      console.error('Error validando factura:', error);
      toast.error('Error al validar la factura');
    }
  };

  const marcarComoPagada = async (facturaId: string) => {
    const factura = facturas.find(f => f.id === facturaId);
    if (!factura) return;

    try {
      const facturaActualizada = { ...factura, estado: 'pagada' as const };
      await API.facturasAPI.update(facturaId, facturaActualizada);

      setFacturas(prev => prev.map(f => 
        f.id === facturaId ? facturaActualizada : f
      ));

      const servicio = servicios.find(s => s.id === factura.servicioId);
      if (servicio) {
        const servicioActualizado = { ...servicio, estado: 'pagado' as const };
        await API.serviciosAPI.update(factura.servicioId, servicioActualizado);

        setServicios(prev => prev.map(s => 
          s.id === factura.servicioId ? servicioActualizado : s
        ));
      }

      toast.success('Factura marcada como pagada');
    } catch (error) {
      console.error('Error marcando factura como pagada:', error);
      toast.error('Error al marcar la factura como pagada');
    }
  };

  const navegarA = (modulo: string, data?: any) => {
    setActiveModule(modulo);
    setModuleData(data);
  };

  // Funciones de autenticación
  const handleLogin = async (email: string, password: string, userType: 'clinic' | 'specialist') => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;
      const metadata = user?.user_metadata || {};

      setCurrentUser({
        nombre: metadata.name || (userType === 'specialist' ? 'Especialista' : 'Clínica'),
        rol: metadata.role || (userType === 'specialist' ? 'veterinario' : 'admin'),
        email: user?.email || email,
        sedesIds: metadata.sedesIds
      });

      setIsAuthenticated(true);
      setActiveModule('dashboard');
      toast.success(`Bienvenido!`);
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message && (error.message.includes('Unsupported provider') || error.message.includes('provider is not enabled'))) {
          toast.error('Email Provider no habilitado en Supabase', {
              description: '1. Ve a Supabase Dashboard > Authentication > Providers\n2. Habilita "Email" provider\n3. Guarda y recarga esta pagina',
              duration: 10000,
              action: {
                  label: 'Abrir Dashboard',
                  onClick: () => window.open('https://supabase.com/dashboard/project/_/auth/providers', '_blank')
              }
          });
      } else if (error.message === 'Invalid login credentials') {
          toast.error('Credenciales incorrectas. Verifica tu correo y contrasena.');
      } else {
          toast.error(error.message || 'Error al iniciar sesion');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Do not forget to complete setup at https://supabase.com/docs/guides/auth/social-login/auth-google
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Google Login error:', error);
      
      if (error.message && (error.message.includes('Unsupported provider') || error.message.includes('provider is not enabled'))) {
        toast.error('Google OAuth no configurado', {
            description: 'Configura Google OAuth en Supabase siguiendo la guia oficial.',
            duration: 10000,
            action: {
                label: 'Ver Guia Google',
                onClick: () => window.open('https://supabase.com/docs/guides/auth/social-login/auth-google', '_blank')
            }
        });
      } else {
        toast.error('Error con Google Login: ' + (error.message || 'Desconocido'));
      }
    }
  };

  const handleRegisterComplete = async (userData: any) => {
    try {
        const userType = userData.tipo || 'specialist';

        // Single server call: creates user + clinic/specialist data atomically
        // Uses publicAnonKey, no user session needed
        const result = await API.authAPI.registerComplete({
            email: userData.email,
            password: userData.password,
            name: `${userData.nombre} ${userData.apellido}`,
            userType: userType === 'clinica' ? 'clinic' : 'specialist',
            nombre: userData.nombre,
            apellido: userData.apellido,
            titulo: userData.titulo,
            telefono: userData.telefono,
            clinica: userData.clinica,
            perfil: userData.perfil,
            verificacion: userData.verificacion,
            clinicasAfiliadas: userData.clinicas,
        });

        console.log('Registration server result:', result);

        // Auto-login after server-side registration
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password: userData.password
        });
        
        if (loginError) throw loginError;

        // Set local state from the server response (no more API calls needed)
        if (userType === 'clinica' && result.clinica) {
            setUserClinicas([result.clinica]);
            setCurrentUser({
                nombre: `${userData.nombre} ${userData.apellido}`,
                rol: 'admin',
                email: userData.email
            });
            setRolActivo('clinica');
        } else {
            if (result.clinicas && result.clinicas.length > 0) {
                setUserClinicas(result.clinicas);
            }
            setCurrentUser({
                nombre: `${userData.titulo || 'Dr.'} ${userData.nombre} ${userData.apellido}`,
                rol: 'veterinario',
                email: userData.email,
                especialidad: userData.perfil?.especialidadPrincipal
            });
            setRolActivo('especialista');
        }

        setVistaAuth('login');
        setIsAuthenticated(true);
        setActiveModule('dashboard');
        
        toast.success(`¡Bienvenido, ${userData.nombre}! Tu cuenta ha sido creada.`);

    } catch (error: any) {
        console.error('Registration error:', error);
        toast.error(error.message || 'Error en el registro');
    }
  };

  const handleBackToLogin = () => {
    setVistaAuth('login');
  };

  const handleDemoLogin = () => {
    setCurrentUser({
      nombre: 'Usuario Demo',
      rol: 'especialista',
      email: 'demo@vetapp.com',
      sedesIds: undefined
    });
    setIsAuthenticated(true);
    setActiveModule('dashboard');
    toast.success('Bienvenido al Modo Demo!', {
      description: 'Estas usando la aplicacion en modo demo. Los datos se cargan desde la base de datos.'
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out:', e);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    setVistaAuth('login');
    // Limpiar estado
    setSolicitudes([]);
    setServicios([]);
    setFacturas([]);
    setGastos([]);
    setPagos([]);
    setUsuarios([]);
    setEspecialistas([]);
    setAccesosClinic([]);
    setNotificaciones([]);
    setUserClinicas([]);
    setSedes([]);
  };

  // Helper functions para clinicas
  const getClinicaById = (id: string) => {
    return userClinicas.find(c => c.id === id);
  };

  const getClinicaByNombre = (nombre: string) => {
    return userClinicas.find(c => c.nombre === nombre);
  };

  const generarApiKey = (clinicaId: string) => {
    const apiKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setUserClinicas(prev => prev.map(c => 
      c.id === clinicaId ? { ...c, apiKey } : c
    ));
    return apiKey;
  };

  const revocarApiKey = (clinicaId: string) => {
    setUserClinicas(prev => prev.map(c => 
      c.id === clinicaId ? { ...c, apiKey: undefined } : c
    ));
  };

  // Funciones para Interconsultas
  const solicitarAccesoClinico = async (acceso: Omit<AccesoClinico, 'id' | 'fechaSolicitud' | 'estado'>) => {
    try {
      const accesoConId: AccesoClinico = {
        ...acceso,
        id: Date.now(),
        fechaSolicitud: new Date().toISOString(),
        estado: 'pendiente'
      };

      const accesoCreado = await API.accesosClinicosAPI.create(accesoConId);
      setAccesosClinic(prev => [...prev, accesoCreado]);

      toast.success('Acceso solicitado correctamente');
    } catch (error) {
      console.error('Error solicitando acceso clinico:', error);
      toast.error('Error al solicitar acceso clinico');
    }
  };

  const aprobarAccesoClinico = async (id: number, notas?: string, vigencia?: string) => {
    const acceso = accesosClinic.find(a => a.id === id);
    if (!acceso) return;

    try {
      const accesoActualizado: AccesoClinico = {
        ...acceso,
        estado: 'aprobado',
        fechaRespuesta: new Date().toISOString(),
        notasRespuesta: notas,
        vigenciaHasta: vigencia
      };

      await API.accesosClinicosAPI.update(id, accesoActualizado);

      setAccesosClinic(prev => prev.map(a => 
        a.id === id ? accesoActualizado : a
      ));

      toast.success('Acceso aprobado correctamente');
    } catch (error) {
      console.error('Error aprobando acceso clinico:', error);
      toast.error('Error al aprobar acceso clinico');
    }
  };

  const rechazarAccesoClinico = async (id: number, notas?: string) => {
    const acceso = accesosClinic.find(a => a.id === id);
    if (!acceso) return;

    try {
      const accesoActualizado: AccesoClinico = {
        ...acceso,
        estado: 'rechazado',
        fechaRespuesta: new Date().toISOString(),
        notasRespuesta: notas
      };

      await API.accesosClinicosAPI.update(id, accesoActualizado);

      setAccesosClinic(prev => prev.map(a => 
        a.id === id ? accesoActualizado : a
      ));

      toast.success('Acceso rechazado correctamente');
    } catch (error) {
      console.error('Error rechazando acceso clinico:', error);
      toast.error('Error al rechazar acceso clinico');
    }
  };

  const revocarAccesoClinico = async (id: number) => {
    const acceso = accesosClinic.find(a => a.id === id);
    if (!acceso) return;

    try {
      const accesoActualizado: AccesoClinico = {
        ...acceso,
        estado: 'revocado',
        fechaRespuesta: new Date().toISOString(),
        notasRespuesta: 'Acceso revocado por el administrador'
      };

      await API.accesosClinicosAPI.update(id, accesoActualizado);

      setAccesosClinic(prev => prev.map(a => 
        a.id === id ? accesoActualizado : a
      ));

      toast.success('Acceso revocado correctamente');
    } catch (error) {
      console.error('Error revocando acceso clinico:', error);
      toast.error('Error al revocar acceso clinico');
    }
  };

  const verificarAccesoPaciente = (pacienteId: number, doctorId: number) => {
    return accesosClinic.find(a => a.pacienteId === pacienteId && a.doctorSolicitante.id === doctorId);
  };

  const getEspecialistaById = (id: number) => {
    return especialistas.find(e => e.id === id);
  };

  const registrarPagoFactura = async (numeroFactura: string, datosPago: { monto: number; fecha: string; metodoPago: string; referencia: string; comprobante?: string }) => {
    const factura = facturas.find(f => f.numero === numeroFactura);
    if (!factura) return;

    try {
      const nuevoPago: any = {
        id: Date.now(),
        facturaId: factura.id,
        clinica: factura.clinica,
        monto: datosPago.monto,
        fecha: datosPago.fecha,
        metodoPago: datosPago.metodoPago as 'transferencia' | 'cheque' | 'efectivo' | 'tarjeta',
        referencia: datosPago.referencia,
        comprobante: datosPago.comprobante,
        estado: 'verificado'
      };

      const pagoCreado = await API.pagosAPI.create(nuevoPago);
      setPagos(prev => [...prev, pagoCreado]);

      if (Math.abs(datosPago.monto - factura.total) < 0.01) {
        const facturaActualizada = { ...factura, estado: 'pagada' as const };
        await API.facturasAPI.update(factura.id, facturaActualizada);
        
        setFacturas(prev => prev.map(f => 
          f.id === factura.id ? facturaActualizada : f
        ));

        const servicio = servicios.find(s => s.id === factura.servicioId);
        if (servicio) {
          const servicioActualizado = { ...servicio, estado: 'pagado' as const };
          await API.serviciosAPI.update(factura.servicioId, servicioActualizado);

          setServicios(prev => prev.map(s => 
            s.id === factura.servicioId ? servicioActualizado : s
          ));
        }
      }

      toast.success('Pago registrado correctamente');
    } catch (error) {
      console.error('Error registrando pago:', error);
      toast.error('Error al registrar el pago');
    }
  };

  const contextValue: AppContextType = {
    configServicios,
    setConfigServicios,
    solicitudes,
    setSolicitudes,
    servicios,
    setServicios,
    facturas,
    setFacturas,
    gastos,
    setGastos,
    usuarios,
    setUsuarios,
    roles,
    setRoles,
    pagos,
    setPagos,
    sedes,
    setSedes,
    selectedSedeId,
    setSelectedSedeId,
    darkMode,
    toggleDarkMode,
    aceptarSolicitud,
    rechazarSolicitud,
    crearSolicitud,
    completarServicio,
    generarFactura,
    validarFacturaSede,
    marcarComoPagada,
    navegarA,
    activeModule,
    handleLogout,
    userClinicas,
    setUserClinicas,
    getClinicaById,
    getClinicaByNombre,
    generarApiKey,
    revocarApiKey,
    notificaciones,
    marcarNotificacionLeida,
    marcarTodasNotificacionesLeidas,
    eliminarNotificacion,
    accesosClinic,
    setAccesosClinic,
    solicitarAccesoClinico,
    aprobarAccesoClinico,
    rechazarAccesoClinico,
    revocarAccesoClinico,
    verificarAccesoPaciente,
    usuarioActual: currentUser ? { ...currentUser, id: 1 } : null,
    simularUsuario,
    rolActivo,
    setRolActivo,
    especialistas,
    setEspecialistas,
    especialistaSeleccionado,
    setEspecialistaSeleccionado,
    getEspecialistaById,
    registrarPagoFactura,
    actualizarServicio,
    crearServicio,
    moduleData // Exposing internal moduleData to consumers
  };

  const renderModule = () => {
    // Si el rol es clinica, mostrar vistas especificas
    if (rolActivo === 'clinica') {
      switch (activeModule) {
        case 'dashboard':
          return <DashboardClinica />;
        case 'mensajes':
          return <ChatInbox />;
        case 'agenda':
          return <AgendaBusyFree />;
        case 'solicitudes':
          return <SolicitudesV2 />;
        case 'metricas':
          return <MetricasClinica />;
        case 'especialistas':
          return <EspecialistasAfiliados />;
        case 'estado-cuenta':
          return <EstadoCuentaClinicaV2 />;
        case 'mis-facturas':
          return <MisFacturas />;
        case 'perfil':
          return <PerfilClinica />;
        case 'sedes':
          return <GestionSedes />;
        default:
          return <DashboardClinica />;
      }
    }

    // Vista especialista (por defecto)
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'mensajes':
        return <ChatInbox />;
      case 'solicitudes':
        return <Solicitudes />;
      case 'agenda':
        return <Agenda />;
      case 'servicios':
        return <Servicios />;
      case 'facturacion':
        return <FacturacionElectronica />;
      case 'finanzas':
        return <Finanzas />;
      case 'conciliacion':
        return <ConciliacionFinanciera />;
      case 'reportes':
        return <ReportesAvanzados />;
      case 'estado-cuenta':
        return <EstadoCuentaClinica />;
      case 'clinicas':
        return <Clinicas />;
      case 'usuarios':
        return <Usuarios />;
      case 'perfil':
        return <Perfil />;
      case 'registro-especialista':
        return <RegistroEspecialista />;
      case 'perfil-profesional':
        return <PerfilProfesional />;
      case 'verificacion-profesional':
        return <VerificacionProfesional />;
      case 'pacientes':
        return <Pacientes />;
      case 'interconsultas':
        return <Interconsultas />;
      case 'configuraciones':
        return <Configuraciones />;
      case 'google-calendar':
        return <GoogleCalendarSync />;
      default:
        return <Dashboard />;
    }
  };

  // Render auth screens
  if (!isAuthenticated) {
    switch (vistaAuth) {
      case 'selector':
        return (
          <RegistroSelector
            onSelectClinica={() => setVistaAuth('registro-clinica')}
            onSelectEspecialista={() => setVistaAuth('registro-especialista')}
            onBackToLogin={() => setVistaAuth('login')}
          />
        );
      case 'registro-clinica':
        return (
          <RegistroClinicaWizard
            onRegisterComplete={handleRegisterComplete}
            onBackToSelector={() => setVistaAuth('selector')}
            onBackToLogin={() => setVistaAuth('login')}
          />
        );
      case 'registro-especialista':
        return (
          <RegistroEspecialistaWizard
            onRegisterComplete={handleRegisterComplete}
            onBackToSelector={() => setVistaAuth('selector')}
            onBackToLogin={() => setVistaAuth('login')}
          />
        );
      default:
        return (
          <PremiumLogin
            onLogin={handleLogin}
            onGoogleLogin={handleGoogleLogin}
            onRegister={() => setVistaAuth('selector')}
            onDemoLogin={handleDemoLogin}
          />
        );
    }
  }

  // Render main app
  if (activeModule === 'mobile-specialist') {
    return (
      <AppContext.Provider value={contextValue}>
        <SpecialistDashboardMobile />
        <Toaster />
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`flex h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50'}`}>
        <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Header activeModule={activeModule} />
          <main className="flex-1 overflow-y-auto pb-24 lg:pb-0 scroll-smooth">
            {renderModule()}
          </main>
          <MobileNav activeModule={activeModule} setActiveModule={setActiveModule} />
        </div>
      </div>
      <Toaster />
    </AppContext.Provider>
  );
}