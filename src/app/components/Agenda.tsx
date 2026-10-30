import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Phone, Mail, Plus, X, User, Building2, CreditCard, FileText, ChevronDown, Edit2, Trash2, Check, Activity, MoreVertical, AlertCircle, Bell, RefreshCw, Search, Filter } from 'lucide-react';
import { useApp } from '../App';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { ClinicaFilter, getClinicaColor, getClinicaBorderColor, getClinicaBgColor } from './ClinicaFilter';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { PanelDetalleCita } from './PanelDetalleCita';
import { AgendaCalendarioPro, type ModoMover } from './AgendaCalendarioPro';
import { configuracionAgendaAPI } from '../utils/api';
import { empujarServicioAGoogle, leerToken } from '../utils/googleCalendar';
import { toast } from 'sonner';

export function Agenda() {
  const { servicios, setServicios, darkMode, userClinicas, getClinicaByNombre, especialistas, actualizarServicio, crearServicio, completarServicio, navegarA } = useApp();
  const [vistaActual, setVistaActual] = useState<'mes' | 'semana' | 'dia' | 'agenda'>('semana');
  const [fechaActual, setFechaActual] = useState(new Date());
  const [mostrarModal, setMostrarModal] = useState(false);
  const [citaSeleccionadaId, setCitaSeleccionadaId] = useState<number | null>(null); // Changed to ID only
  const [incluirCanceladas, setIncluirCanceladas] = useState(false);
  const [modoMover, setModoMover] = useState<ModoMover>('arrastrar');
  
  // Derived state for the selected appointment to ensure sync with global state
  const citaSeleccionada = servicios.find(s => s.id === citaSeleccionadaId) || null;

  const [selectedClinica, setSelectedClinica] = useState('todas');
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [editandoCita, setEditandoCita] = useState(false);
  const [hoveredCita, setHoveredCita] = useState<number | null>(null);
  const [mostrarRecordatorios, setMostrarRecordatorios] = useState(false);
  const [mostrarSincronizacion, setMostrarSincronizacion] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Configuración de Agenda
  const [configAgenda, setConfigAgenda] = useState({
    duracionCita: 30,
    diasLaborales: [1, 2, 3, 4, 5],
    fechasBloqueadas: [] as Date[]
  });

  useEffect(() => {
    loadAgendaConfig();
  }, []);

  const loadAgendaConfig = async () => {
    try {
      const data = await configuracionAgendaAPI.get();
      if (data) {
        setConfigAgenda({
          duracionCita: data.duracionCita || 30,
          diasLaborales: data.diasLaborales || [1, 2, 3, 4, 5],
          fechasBloqueadas: (data.fechasBloqueadas || []).map((d: string) => new Date(d))
        });
      }
    } catch (error) {
      console.error('Error loading agenda config:', error);
    }
  };

  const handleCitaMovida = async (citaId: number, nuevaFecha: string, nuevaHora: string) => {
    const cita = servicios.find(s => s.id === citaId);
    if (!cita) return;

    const duracion = cita.duracion || 60;
    
    // Validar superposición
    const fechaInicioNueva = new Date(`${nuevaFecha}T${nuevaHora}`);
    const fechaFinNueva = new Date(fechaInicioNueva.getTime() + duracion * 60000);

    const conflicto = servicios.some(s => {
      if (s.id === citaId) return false;
      if (s.estado === 'cancelado') return false;
      // Validar conflicto solo dentro de la misma clínica (recurso físico)
      if (s.clinica !== cita.clinica) return false;

      const sHora = s.hora || '00:00';
      const inicioExistente = new Date(`${s.fecha}T${sHora}`);
      const finExistente = new Date(inicioExistente.getTime() + (s.duracion || 60) * 60000);

      // Algoritmo de intersección de intervalos: (InicioA < FinB) && (FinA > InicioB)
      return fechaInicioNueva < finExistente && fechaFinNueva > inicioExistente;
    });

    if (conflicto) {
      toast.error('Conflicto de horario: Ya existe una cita en ese intervalo.');
      // Forzar re-render para que el item vuelva a su lugar visualmente si react-dnd no lo hizo
      setServicios([...servicios]); 
      return;
    }

    try {
      await actualizarServicio(citaId, { fecha: nuevaFecha, hora: nuevaHora });
      toast.success('Cita reprogramada correctamente');
      const cita = servicios.find((s) => s.id === citaId);
      if (cita && leerToken()) {
        empujarServicioAGoogle({ ...cita, fecha: nuevaFecha, hora: nuevaHora })
          .then((googleEventId) => {
            if (googleEventId && googleEventId !== cita.googleEventId) {
              return actualizarServicio(citaId, { googleEventId });
            }
          })
          .catch(() => {
            /* sync opcional — no bloquea la agenda */
          });
      }
    } catch (error) {
      console.error('Error al mover cita:', error);
      toast.error('No se pudo guardar el cambio');
    }
  };
  
  // Configuración de recordatorios
  const [configRecordatorios, setConfigRecordatorios] = useState({
    email: true,
    sms: false,
    anticipacion24h: true,
    anticipacion1h: true,
    personalizado: false,
    horasPersonalizadas: 2
  });

  // Estado de sincronización
  const [sincronizacion, setSincronizacion] = useState({
    googleCalendar: false,
    outlookCalendar: false,
    sincronizacionAutomatica: true
  });
  
  // Hora actual para línea de tiempo
  const [horaActual, setHoraActual] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const [nuevaCita, setNuevaCita] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: '09:00',
    duracion: 60,
    clinica: '',
    tipo: '',
    paciente: '',
    especie: '',
    telefono: '',
    email: '',
    direccion: '',
    tarifa: 0,
    notas: '',
    estado: 'confirmado' as const
  });

  const tiposCita = [
    { nombre: 'Cita nueva', color: 'bg-blue-500', duracion: 30 },
    { nombre: 'Reconsulta', color: 'bg-teal-500', duracion: 30 },
    { nombre: 'Cita urgente', color: 'bg-orange-500', duracion: 15 }
  ];

  const doctores = especialistas.map(e => `${e.nombre} ${e.apellido}`);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const diasSemana = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
  const diasSemanaCompleto = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Horarios para vista semanal y diaria
  const horarios = [];
  for (let h = 7; h <= 20; h++) {
    horarios.push(`${h.toString().padStart(2, '0')}:00`);
  }

  // Funciones de calendario
  const getDiasDelMes = (fecha: Date) => {
    const year = fecha.getFullYear();
    const month = fecha.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay() === 0 ? 6 : primerDia.getDay() - 1;

    const dias = [];
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(new Date(year, month, i));
    }
    return dias;
  };

  const getDiasSemana = (fecha: Date) => {
    const dias = [];
    const diaActual = fecha.getDay() === 0 ? 6 : fecha.getDay() - 1; // Lunes = 0
    const lunes = new Date(fecha);
    lunes.setDate(fecha.getDate() - diaActual);

    for (let i = 0; i < 7; i++) {
      const dia = new Date(lunes);
      dia.setDate(lunes.getDate() + i);
      dias.push(dia);
    }
    return dias;
  };

  const getCitasDelDia = (fecha: Date | null) => {
    if (!fecha) return [];
    const fechaStr = fecha.toISOString().split('T')[0];
    return servicios.filter(s => {
      const coincideFecha = s.fecha === fechaStr;
      const coincideClinica = selectedClinica === 'todas' || (() => {
        const clinica = getClinicaByNombre(s.clinica);
        return clinica?.id === selectedClinica;
      })();
      const incluyeCancelada = incluirCanceladas || s.estado !== 'cancelado';
      return coincideFecha && coincideClinica && incluyeCancelada;
    });
  };

  const getCitasEnHorario = (fecha: Date, hora: string) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return servicios.filter(s => {
      if (s.fecha !== fechaStr) return false;
      if (!incluirCanceladas && s.estado === 'cancelado') return false;
      const coincideClinica = selectedClinica === 'todas' || (() => {
        const clinica = getClinicaByNombre(s.clinica);
        return clinica?.id === selectedClinica;
      })();
      if (!coincideClinica) return false;
      
      if (s.hora) {
        const [hCita, mCita] = s.hora.split(':').map(Number);
        const [hBuscar] = hora.split(':').map(Number);
        return hCita === hBuscar;
      }
      return false;
    });
  };

  const esHoy = (fecha: Date | null) => {
    if (!fecha) return false;
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  };

  const esCitaSeleccionada = (fecha: Date | null) => {
    if (!fecha || !citaSeleccionada) return false;
    return fecha.toISOString().split('T')[0] === citaSeleccionada.fecha;
  };

  const navegarMes = (direccion: number) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(fechaActual.getMonth() + direccion);
    setFechaActual(nuevaFecha);
  };

  const navegarSemana = (direccion: number) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setDate(fechaActual.getDate() + (direccion * 7));
    setFechaActual(nuevaFecha);
  };

  const navegarDia = (direccion: number) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setDate(fechaActual.getDate() + direccion);
    setFechaActual(nuevaFecha);
  };

  const irHoy = () => {
    setFechaActual(new Date());
  };

  const abrirModal = (fecha?: Date, hora?: string) => {
    setNuevaCita({
      fecha: fecha ? fecha.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      hora: hora || '09:00',
      duracion: 60,
      clinica: '',
      tipo: '',
      paciente: '',
      especie: '',
      telefono: '',
      email: '',
      direccion: '',
      tarifa: 0,
      notas: '',
      estado: 'confirmado'
    });
    setEditandoCita(false);
    setMostrarModal(true);
  };

  const abrirEdicionCita = (cita: any) => {
    setNuevaCita({
      fecha: cita.fecha,
      hora: cita.hora || '09:00',
      duracion: cita.duracion || 60,
      clinica: cita.clinica,
      tipo: cita.tipo,
      paciente: cita.paciente,
      especie: cita.especie,
      telefono: cita.telefono || '',
      email: cita.email || '',
      direccion: cita.direccion || '',
      tarifa: cita.tarifa,
      notas: cita.notas || '',
      estado: cita.estado
    });
    setEditandoCita(true);
    setCitaSeleccionadaId(cita.id);
    setMostrarModal(true);
  };

  const guardarCita = async () => {
    // Validar campos requeridos
    if (!nuevaCita.paciente) {
      toast.error('El nombre del paciente es obligatorio');
      return;
    }

    const duracion = nuevaCita.duracion || 60;
    const fechaInicioNueva = new Date(`${nuevaCita.fecha}T${nuevaCita.hora}`);
    const fechaFinNueva = new Date(fechaInicioNueva.getTime() + duracion * 60000);

    // Validar superposición
    const conflicto = servicios.some(s => {
      // Ignorar la misma cita si estamos editando
      if (editandoCita && citaSeleccionada && s.id === citaSeleccionada.id) return false;
      
      if (s.estado === 'cancelado') return false;
      // Validar por clínica si se ha seleccionado una (o si la nueva cita tiene clínica asignada)
      if (nuevaCita.clinica && s.clinica !== nuevaCita.clinica) return false;

      const sHora = s.hora || '00:00';
      const inicioExistente = new Date(`${s.fecha}T${sHora}`);
      const finExistente = new Date(inicioExistente.getTime() + (s.duracion || 60) * 60000);

      return fechaInicioNueva < finExistente && fechaFinNueva > inicioExistente;
    });

    if (conflicto) {
      toast.error('Conflicto de horario: Ya existe una cita en ese intervalo.');
      return;
    }

    try {
      if (editandoCita && citaSeleccionadaId) {
        await actualizarServicio(citaSeleccionadaId, nuevaCita);
        // Actualizar estado local de selección
        // setCitaSeleccionada({ ...citaSeleccionada, ...nuevaCita });
        toast.success('Cita actualizada correctamente');
      } else {
        await crearServicio(nuevaCita);
        // toast success ya está en crearServicio
      }
      setMostrarModal(false);
      setEditandoCita(false);
    } catch (error) {
      console.error('Error al guardar cita:', error);
      toast.error('No se pudo guardar la cita');
    }
  };

  const eliminarCita = (citaId: number) => {
    if (confirm('¿Estás seguro de eliminar esta cita?')) {
      setServicios(servicios.filter(s => s.id !== citaId));
      setCitaSeleccionadaId(null);
    }
  };

  const seleccionarCita = (cita: any) => {
    setCitaSeleccionadaId(cita.id);
  };

  const actualizarEstadoCita = async (nuevoEstado: string) => {
    if (!citaSeleccionadaId) return;
    
    // UI Optimista handled globally
    // const citaActualizada = { ...citaSeleccionada, estado: nuevoEstado };
    // setCitaSeleccionada(citaActualizada);
    
    // Llamar a la función centralizada que maneja API + Estado Global
    await actualizarServicio(citaSeleccionadaId, { estado: nuevoEstado as any });
  };

  const getColorTipoCita = (tipo: string) => {
    if (tipo.includes('nueva') || tipo.includes('Ecocardiograma')) return 'bg-blue-500';
    if (tipo.includes('urgente') || tipo.includes('Urgente')) return 'bg-orange-500';
    return 'bg-teal-500';
  };

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'confirmado': return 'bg-blue-500';
      case 'completado': return 'bg-green-500';
      case 'cancelado': return 'bg-red-500';
      case 'facturado': return 'bg-purple-500';
      case 'pagado': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const dias = getDiasDelMes(fechaActual);
  const diasSemanaActual = getDiasSemana(fechaActual);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
        <div className="max-w-[1600px] mx-auto">
          {/* Layout simplificado - Solo calendario (sin panel lateral estático) */}
          <div className="space-y-4">
            {/* Nuevo Header Compacto */}
          <div className={`flex flex-wrap items-center gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            {/* Navegación y Fecha */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (vistaActual === 'mes') navegarMes(-1);
                  else if (vistaActual === 'semana') navegarSemana(-1);
                  else if (vistaActual === 'dia') navegarDia(-1);
                }}
                className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                onClick={irHoy}
                className={`px-3 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                Hoy
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (vistaActual === 'mes') navegarMes(1);
                  else if (vistaActual === 'semana') navegarSemana(1);
                  else if (vistaActual === 'dia') navegarDia(1);
                }}
                className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Fecha Actual */}
            <div className={`px-4 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {vistaActual === 'mes' && `${meses[fechaActual.getMonth()]} De ${fechaActual.getFullYear()}`}
              {vistaActual === 'semana' && `Semana del ${diasSemanaActual[0].getDate()} ${meses[diasSemanaActual[0].getMonth()]}`}
              {vistaActual === 'dia' && `${fechaActual.getDate()} de ${meses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`}
              {vistaActual === 'agenda' && 'Agenda General'}
            </div>

            {/* Botones de Vista */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVistaActual('mes')}
                className={`gap-2 ${vistaActual === 'mes' ? darkMode ? 'bg-gray-700' : 'bg-gray-100' : ''} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <CalendarIcon className="w-4 h-4" />
                Mes
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVistaActual('semana')}
                className={`gap-2 ${vistaActual === 'semana' ? 'bg-orange-500 text-white hover:bg-orange-600' : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <CalendarIcon className="w-4 h-4" />
                Semana
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVistaActual('dia')}
                className={`gap-2 ${vistaActual === 'dia' ? 'bg-orange-500 text-white hover:bg-orange-600' : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <CalendarIcon className="w-4 h-4" />
                Día
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navegarA('google-calendar')}
              className={`gap-2 ${darkMode ? 'border-gray-600 text-gray-300' : ''}`}
              title="Sincronizar con Google Calendar"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Google Calendar</span>
            </Button>

            {/* Barra de Búsqueda */}
            <div className="flex-1 relative max-w-xl min-w-[200px]">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <Input
                type="text"
                placeholder="Buscar citas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-300'}`}
              />
            </div>

            {/* Botón de Filtro */}
            <Button
              variant="ghost"
              size="sm"
              className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Fila de acciones secundarias */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={incluirCanceladas}
                onCheckedChange={(checked) => setIncluirCanceladas(checked as boolean)}
                id="canceladas"
              />
              <label
                htmlFor="canceladas"
                className={`text-sm cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Incluir citas canceladas
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navegarA('google-calendar')}
                className={darkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : ''}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {leerToken() ? 'Google · conectado' : 'Sincronizar Google'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarRecordatorios(true)}
                className={darkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : ''}
              >
                <Bell className="w-4 h-4 mr-2" />
                Recordatorios
              </Button>
              <Button
                size="sm"
                onClick={() => abrirModal()}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Cita
              </Button>
            </div>
          </div>

          {/* Contenido del Calendario */}
          <Tabs value={vistaActual} onValueChange={(v: any) => setVistaActual(v)} className="w-full">

            {/* VISTA MES */}
            <TabsContent value="mes" className="mt-4">
              {/* Filtros */}
              <Card className={`p-4 mb-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Clínica</Label>
                    <ClinicaFilter
                      clinicas={userClinicas}
                      selectedClinica={selectedClinica}
                      onSelectClinica={setSelectedClinica}
                    />
                  </div>

                  <div>
                    <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Leyenda</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tiposCita.map(tipo => (
                        <div key={tipo.nombre} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${tipo.color}`}></div>
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {tipo.nombre}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Calendario Mensual */}
              <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {diasSemana.map(dia => (
                    <div
                      key={dia}
                      className={`text-center py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {dia}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {dias.map((dia, index) => {
                    const citas = getCitasDelDia(dia);
                    const esHoyDia = esHoy(dia);
                    const esDiaSeleccionado = esCitaSeleccionada(dia);

                    return (
                      <div
                        key={index}
                        className={`
                          min-h-[100px] p-2 rounded-lg border transition-all cursor-pointer
                          ${dia ? (darkMode ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100') : ''}
                          ${esHoyDia ? 'ring-2 ring-blue-500' : ''}
                          ${esDiaSeleccionado ? 'ring-2 ring-purple-500' : ''}
                        `}
                        onClick={() => {
                          if (dia && citas.length > 0) seleccionarCita(citas[0]);
                        }}
                      >
                        {dia && (
                          <>
                            <div className={`text-sm mb-2 ${esHoyDia ? 'text-blue-500 font-bold' : darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {dia.getDate()}
                            </div>
                            <div className="space-y-1">
                              {citas.slice(0, 2).map((cita, i) => (
                                <div
                                  key={i}
                                  className={`text-xs p-1 rounded text-white ${getColorTipoCita(cita.tipo)} truncate`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    seleccionarCita(cita);
                                  }}
                                >
                                  {cita.hora} - {cita.paciente}
                                </div>
                              ))}
                              {citas.length > 2 && (
                                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  +{citas.length - 2} más
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>

            {/* VISTA SEMANA — calendario pro */}
            <TabsContent value="semana" className="mt-4">
              <AgendaCalendarioPro
                coloresClinica={Object.fromEntries(userClinicas.map((c) => [c.nombre, c.color]))}
                citas={servicios.filter(s => {
                  if (selectedClinica !== 'todas') {
                    const clinica = getClinicaByNombre(s.clinica);
                    if (clinica?.id !== selectedClinica) return false;
                  }
                  if (!incluirCanceladas && s.estado === 'cancelado') return false;
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    if (![s.paciente, s.tipo, s.clinica].some(x => x?.toLowerCase().includes(q))) return false;
                  }
                  return true;
                })}
                darkMode={darkMode}
                fechaReferencia={fechaActual}
                modoVista="semana"
                modoMover={modoMover}
                onModoMoverChange={setModoMover}
                onCitaMovida={handleCitaMovida}
                onCitaClick={seleccionarCita}
                onSlotVacio={(fecha, hora) => abrirModal(new Date(fecha + 'T12:00:00'), hora)}
                diasLaborales={configAgenda.diasLaborales}
              />
            </TabsContent>

            {/* VISTA DÍA — mismo motor pro */}
            <TabsContent value="dia" className="mt-4">
              <AgendaCalendarioPro
                coloresClinica={Object.fromEntries(userClinicas.map((c) => [c.nombre, c.color]))}
                citas={servicios.filter(s => {
                  if (selectedClinica !== 'todas') {
                    const clinica = getClinicaByNombre(s.clinica);
                    if (clinica?.id !== selectedClinica) return false;
                  }
                  if (!incluirCanceladas && s.estado === 'cancelado') return false;
                  return true;
                })}
                darkMode={darkMode}
                fechaReferencia={fechaActual}
                modoVista="dia"
                modoMover={modoMover}
                onModoMoverChange={setModoMover}
                onCitaMovida={handleCitaMovida}
                onCitaClick={seleccionarCita}
                onSlotVacio={(fecha, hora) => abrirModal(new Date(fecha + 'T12:00:00'), hora)}
                diasLaborales={configAgenda.diasLaborales}
              />
            </TabsContent>

            {/* VISTA AGENDA (LISTA) */}
            <TabsContent value="agenda" className="mt-4">
              <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {servicios
                    .filter(s => incluirCanceladas || s.estado !== 'cancelado')
                    .filter(s => selectedClinica === 'todas' || (() => {
                      const clinica = getClinicaByNombre(s.clinica);
                      return clinica?.id === selectedClinica;
                    })())
                    .sort((a, b) => {
                      const fechaA = new Date(a.fecha + ' ' + (a.hora || '00:00'));
                      const fechaB = new Date(b.fecha + ' ' + (b.hora || '00:00'));
                      return fechaB.getTime() - fechaA.getTime();
                    })
                    .map(cita => {
                      const clinica = getClinicaByNombre(cita.clinica);
                      return (
                        <div
                          key={cita.id}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors`}
                          onClick={() => seleccionarCita(cita)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className={`w-2 h-full rounded ${getColorEstado(cita.estado)}`}></div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {cita.paciente}
                                  </h4>
                                  <Badge className={`${getColorEstado(cita.estado)} text-white border-0`}>
                                    {cita.estado}
                                  </Badge>
                                </div>
                                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                                  <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <CalendarIcon className="w-4 h-4" />
                                      {new Date(cita.fecha).toLocaleDateString('es-ES', { 
                                        day: 'numeric', 
                                        month: 'long', 
                                        year: 'numeric' 
                                      })}
                                    </span>
                                    {cita.hora && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {cita.hora}
                                      </span>
                                    )}
                                  </div>
                                  <div>{cita.tipo}</div>
                                  <div>{cita.especie}</div>
                                  <div className="flex items-center gap-2">
                                    {clinica && (
                                      <div className={`w-3 h-3 rounded-full ${getClinicaColor(clinica.color)}`} />
                                    )}
                                    <Building2 className="w-4 h-4" />
                                    {cita.clinica}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              S/ {cita.tarifa}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal Nueva/Editar Cita */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className={`w-full max-w-3xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} my-8`}>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editandoCita ? 'Editar Cita' : 'Nueva Cita'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMostrarModal(false);
                    setEditandoCita(false);
                  }}
                  className={darkMode ? 'text-gray-400 hover:text-white' : ''}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Paciente *</Label>
                  <Input
                    value={nuevaCita.paciente}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, paciente: e.target.value })}
                    placeholder="Nombre del paciente"
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Especie *</Label>
                  <Input
                    value={nuevaCita.especie}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, especie: e.target.value })}
                    placeholder="Canino - Labrador"
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Tipo de servicio *</Label>
                  <Select value={nuevaCita.tipo} onValueChange={(value) => setNuevaCita({ ...nuevaCita, tipo: value })}>
                    <SelectTrigger className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}>
                      <SelectValue placeholder="Selecciona un servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ecocardiograma">Ecocardiograma</SelectItem>
                      <SelectItem value="Ecocardiograma Doppler">Ecocardiograma Doppler</SelectItem>
                      <SelectItem value="Consulta Cardiológica">Consulta Cardiológica</SelectItem>
                      <SelectItem value="Electrocardiograma">Electrocardiograma</SelectItem>
                      <SelectItem value="Holter 24h">Holter 24h</SelectItem>
                      <SelectItem value="Evaluación Pre-Anestésica">Evaluación Pre-Anestésica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Clínica *</Label>
                  <Input
                    value={nuevaCita.clinica}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, clinica: e.target.value })}
                    placeholder="Clínica VetPlus"
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Fecha *</Label>
                  <Input
                    type="date"
                    value={nuevaCita.fecha}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, fecha: e.target.value })}
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Hora *</Label>
                  <Input
                    type="time"
                    value={nuevaCita.hora}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, hora: e.target.value })}
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Duración (minutos)</Label>
                  <Input
                    type="number"
                    value={nuevaCita.duracion}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, duracion: parseInt(e.target.value) || 60 })}
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Tarifa ($)</Label>
                  <Input
                    type="number"
                    value={nuevaCita.tarifa}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, tarifa: parseFloat(e.target.value) || 0 })}
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Teléfono</Label>
                  <Input
                    value={nuevaCita.telefono}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, telefono: e.target.value })}
                    placeholder="+1234567890"
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Email</Label>
                  <Input
                    type="email"
                    value={nuevaCita.email}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, email: e.target.value })}
                    placeholder="email@ejemplo.com"
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Dirección</Label>
                  <Input
                    value={nuevaCita.direccion}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, direccion: e.target.value })}
                    placeholder="Dirección de la clínica"
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Notas</Label>
                  <Textarea
                    value={nuevaCita.notas}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, notas: e.target.value })}
                    placeholder="Notas adicionales sobre la cita..."
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMostrarModal(false);
                    setEditandoCita(false);
                  }}
                  className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-900' : ''}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={guardarCita}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  disabled={!nuevaCita.paciente || !nuevaCita.tipo || !nuevaCita.fecha}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {editandoCita ? 'Actualizar Cita' : 'Guardar Cita'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Panel Lateral Derecho - Detalle Clínico */}
      {citaSeleccionada && (
        <PanelDetalleCita
          cita={citaSeleccionada}
          onClose={() => setCitaSeleccionadaId(null)}
          onCambiarEstado={async (id, nuevoEstado) => {
            if (nuevoEstado === 'completado') {
              console.log('Completando servicio:', id);
              await completarServicio(id);
            } else {
              console.log('Actualizando estado:', id, nuevoEstado);
              await actualizarServicio(id, { estado: nuevoEstado });
            }
          }}
          onEliminar={(id) => eliminarCita(id)}
          onReprogramar={(id, nuevaFecha, nuevaHora) => {
            setServicios(servicios.map(s =>
              s.id === id ? { ...s, fecha: nuevaFecha, hora: nuevaHora } : s
            ));
            // No need to update local state as it is derived from services
          }}
          onVerPaciente={(pacienteNombre) => {
            navegarA('pacientes', { 
              pacienteNombre, 
              citaId: citaSeleccionada.id 
            });
          }}
        />
      )}

      {/* Modal Configuración de Recordatorios */}
      {mostrarRecordatorios && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                <Bell className="w-6 h-6 text-orange-500" />
                <h2 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Configuración de Recordatorios Automáticos
                </h2>
              </div>

              {/* Canales de Notificación */}
              <div className="space-y-4">
                <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Canales de Notificación
                </Label>

                {/* Email */}
                <div className={`flex items-center justify-between p-4 rounded-lg border ${
                  configRecordatorios.email 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <Mail className={`w-5 h-5 ${configRecordatorios.email ? 'text-blue-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Email
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Enviar recordatorios por correo electrónico
                      </div>
                    </div>
                  </div>
                  <Checkbox
                    checked={configRecordatorios.email}
                    onCheckedChange={(checked) => 
                      setConfigRecordatorios({ ...configRecordatorios, email: checked as boolean })
                    }
                  />
                </div>

                {/* SMS */}
                <div className={`flex items-center justify-between p-4 rounded-lg border ${
                  configRecordatorios.sms 
                    ? 'border-green-500 bg-green-500/10' 
                    : darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <Phone className={`w-5 h-5 ${configRecordatorios.sms ? 'text-green-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        SMS
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Enviar recordatorios por mensaje de texto
                      </div>
                    </div>
                  </div>
                  <Checkbox
                    checked={configRecordatorios.sms}
                    onCheckedChange={(checked) => 
                      setConfigRecordatorios({ ...configRecordatorios, sms: checked as boolean })
                    }
                  />
                </div>
              </div>

              {/* Anticipación de Recordatorios */}
              <div className="space-y-3">
                <Label className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Anticipación de Recordatorios
                </Label>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="24h"
                    checked={configRecordatorios.anticipacion24h}
                    onCheckedChange={(checked) => 
                      setConfigRecordatorios({ ...configRecordatorios, anticipacion24h: checked as boolean })
                    }
                  />
                  <label htmlFor="24h" className={`text-sm cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    24 horas antes
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="1h"
                    checked={configRecordatorios.anticipacion1h}
                    onCheckedChange={(checked) => 
                      setConfigRecordatorios({ ...configRecordatorios, anticipacion1h: checked as boolean })
                    }
                  />
                  <label htmlFor="1h" className={`text-sm cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    1 hora antes
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="personalizado"
                    checked={configRecordatorios.personalizado}
                    onCheckedChange={(checked) => 
                      setConfigRecordatorios({ ...configRecordatorios, personalizado: checked as boolean })
                    }
                  />
                  <label htmlFor="personalizado" className={`text-sm cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Personalizado
                  </label>
                </div>

                {configRecordatorios.personalizado && (
                  <div className="ml-6 flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="72"
                      value={configRecordatorios.horasPersonalizadas}
                      onChange={(e) => 
                        setConfigRecordatorios({ 
                          ...configRecordatorios, 
                          horasPersonalizadas: parseInt(e.target.value) || 2 
                        })
                      }
                      className={`w-20 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}`}
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      horas antes
                    </span>
                  </div>
                )}
              </div>

              {/* Vista previa del recordatorio */}
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-blue-50 border border-blue-200'}`}>
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                  <span className={`text-xs font-medium ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                    Vista previa del recordatorio
                  </span>
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                  <p><strong>Asunto:</strong> Recordatorio: Cita mañana a las 10:00</p>
                  <p><strong>Mensaje:</strong> Hola, le recordamos su cita de Ecocardiograma Doppler programada para mañana 15 de febrero a las 10:00 en Clínica VetPlus.</p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setMostrarRecordatorios(false)}
                  className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-900' : ''}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // Aquí iría la lógica para guardar la configuración
                    setMostrarRecordatorios(false);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Guardar Configuración
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Sincronización con Calendarios Externos */}
      {mostrarSincronizacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 text-blue-500" />
                <h2 className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Sincronización con Calendarios Externos
                </h2>
              </div>

              {/* Google Calendar */}
              <div className={`flex items-center justify-between p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-2">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Google Calendar
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {sincronizacion.googleCalendar ? 'Conectado' : 'No conectado'}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setSincronizacion({ ...sincronizacion, googleCalendar: !sincronizacion.googleCalendar })}
                  className={sincronizacion.googleCalendar ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                >
                  {sincronizacion.googleCalendar ? 'Desconectar' : 'Conectar'}
                </Button>
              </div>

              {/* Outlook Calendar */}
              <div className={`flex items-center justify-between p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
                      <path d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zM6 8.5v7l6-3.5z"/>
                    </svg>
                  </div>
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Outlook Calendar
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {sincronizacion.outlookCalendar ? 'Conectado' : 'No conectado'}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setSincronizacion({ ...sincronizacion, outlookCalendar: !sincronizacion.outlookCalendar })}
                  className={sincronizacion.outlookCalendar ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                >
                  {sincronizacion.outlookCalendar ? 'Desconectar' : 'Conectar'}
                </Button>
              </div>

              {/* Opciones de Sincronización */}
              <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                <Label className={`mb-3 block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Opciones de Sincronización
                </Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sync-auto"
                    checked={sincronizacion.sincronizacionAutomatica}
                    onCheckedChange={(checked) => 
                      setSincronizacion({ ...sincronizacion, sincronizacionAutomatica: checked as boolean })
                    }
                  />
                  <label htmlFor="sync-auto" className={`text-sm cursor-pointer ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sincronización automática cada 15 minutos
                  </label>
                </div>
              </div>

              {/* Botón Cerrar */}
              <div className="pt-4">
                <Button
                  onClick={() => setMostrarSincronizacion(false)}
                  className={`w-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
    </DndProvider>
  );
}