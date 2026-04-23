import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Send, Paperclip, Image, File, Phone, Video, MoreVertical, Check, CheckCheck, Circle, Clock, Archive, Star, Filter, X, Smile, Download } from 'lucide-react';
import { useApp } from '../App';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface Mensaje {
  id: string;
  conversacionId: string;
  emisorId: string;
  emisorNombre: string;
  contenido: string;
  timestamp: Date;
  leido: boolean;
  tipo: 'texto' | 'imagen' | 'archivo';
  archivoUrl?: string;
  archivoNombre?: string;
}

interface Conversacion {
  id: string;
  participantes: {
    id: string;
    nombre: string;
    rol: 'especialista' | 'clinica';
    avatar?: string;
  }[];
  solicitudId?: string;
  ultimoMensaje?: Mensaje;
  noLeidos: number;
  archivada: boolean;
  enLinea: boolean;
  escribiendo: boolean;
}

export function ChatInbox() {
  const { darkMode, navegarA, rolActivo, solicitudes, especialistas } = useApp();
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [conversacionActiva, setConversacionActiva] = useState<Conversacion | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<'todas' | 'no-leidas' | 'archivadas'>('todas');
  const [showFiltros, setShowFiltros] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const mensajesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Simular datos mock de conversaciones
  useEffect(() => {
    const conversacionesMock: Conversacion[] = solicitudes.slice(0, 8).map((sol, index) => {
      const especialista = especialistas.find(e => e.id === sol.especialistaId);
      const esEspecialista = rolActivo === 'especialista';
      
      return {
        id: `conv-${sol.id}`,
        participantes: [
          {
            id: sol.especialistaId,
            nombre: especialista ? `Dr. ${especialista.nombre} ${especialista.apellido}` : 'Dr. Desconocido',
            rol: 'especialista',
          },
          {
            id: sol.clinicaId,
            nombre: sol.clinica,
            rol: 'clinica',
          }
        ],
        solicitudId: sol.id,
        noLeidos: index < 3 ? (index + 1) : 0,
        archivada: false,
        enLinea: index % 2 === 0,
        escribiendo: false,
      };
    });

    // Generar últimos mensajes
    const mensajesUltimos = [
      '¿Podemos agendar la consulta para el viernes?',
      'Perfecto, confirmo la cita para mañana a las 3pm',
      'Adjunto los resultados de laboratorio del paciente',
      'Gracias por la atención, excelente servicio',
      'Necesito revisar el caso urgente del paciente',
      '¿Tiene disponibilidad esta semana?',
      'Le envío las radiografías por este medio',
      'Confirmado, nos vemos mañana'
    ];
    conversacionesMock.forEach((conv, idx) => {
      const participanteIdx = idx % 2;
      const ultimoMensaje: Mensaje = {
        id: `msg-last-${conv.id}`,
        conversacionId: conv.id,
        emisorId: conv.participantes[participanteIdx].id,
        emisorNombre: conv.participantes[participanteIdx].nombre,
        contenido: mensajesUltimos[idx % mensajesUltimos.length],
        timestamp: new Date(Date.now() - (idx + 1) * 3600000),
        leido: conv.noLeidos === 0,
        tipo: 'texto',
      };
      conv.ultimoMensaje = ultimoMensaje;
    });

    setConversaciones(conversacionesMock);
  }, [solicitudes, especialistas, rolActivo]);

  // Generar mensajes para conversación activa (en producción vendrían del backend)
  const cargarMensajes = (conversacion: Conversacion) => {
    const mensajesMock: Mensaje[] = [];
    const numMensajes = 15;
    const esEspecialista = rolActivo === 'especialista';
    
    for (let i = 0; i < numMensajes; i++) {
      const esPropio = i % 2 === 0;
      const participante = esPropio 
        ? conversacion.participantes.find(p => p.rol === (esEspecialista ? 'especialista' : 'clinica'))!
        : conversacion.participantes.find(p => p.rol === (esEspecialista ? 'clinica' : 'especialista'))!;

      const contenidos = [
        'Buenos días, quisiera consultar sobre el caso del paciente',
        'Claro, con gusto. ¿Qué necesita saber?',
        'El paciente presenta síntomas de insuficiencia cardíaca',
        'Entiendo. ¿Tiene los resultados de los análisis?',
        'Sí, se los envío en un momento',
        'Perfecto, los reviso y le comento',
        '¿Podríamos agendar una videoconsulta?',
        'Por supuesto, ¿qué día le viene bien?',
        'El viernes en la tarde sería ideal',
        'Confirmado para el viernes a las 3pm',
        'Muchas gracias por su tiempo',
        'A sus órdenes, cualquier cosa me escribe',
        'Le envío las imágenes del ultrasonido',
        'Recibido, en breve le doy mi diagnóstico',
        'Excelente trabajo, el paciente está mejorando',
      ];

      mensajesMock.push({
        id: `msg-${conversacion.id}-${i}`,
        conversacionId: conversacion.id,
        emisorId: participante.id,
        emisorNombre: participante.nombre,
        contenido: contenidos[i % contenidos.length],
        timestamp: new Date(Date.now() - (numMensajes - i) * 600000),
        leido: i < numMensajes - (conversacion.noLeidos || 0),
        tipo: 'texto',
      });
    }

    setMensajes(mensajesMock.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
  };

  // Scroll to bottom cuando cambian los mensajes
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Marcar mensajes como leídos cuando se abre conversación
  useEffect(() => {
    if (conversacionActiva) {
      setConversaciones(prev => prev.map(conv => 
        conv.id === conversacionActiva.id 
          ? { ...conv, noLeidos: 0 } 
          : conv
      ));
    }
  }, [conversacionActiva]);

  const seleccionarConversacion = (conv: Conversacion) => {
    setConversacionActiva(conv);
    cargarMensajes(conv);
    setShowMobileChat(true);
  };

  const enviarMensaje = () => {
    if (!nuevoMensaje.trim() || !conversacionActiva) return;

    const esEspecialista = rolActivo === 'especialista';
    const emisor = conversacionActiva.participantes.find(p => 
      p.rol === (esEspecialista ? 'especialista' : 'clinica')
    )!;

    const mensaje: Mensaje = {
      id: `msg-${Date.now()}`,
      conversacionId: conversacionActiva.id,
      emisorId: emisor.id,
      emisorNombre: emisor.nombre,
      contenido: nuevoMensaje,
      timestamp: new Date(),
      leido: false,
      tipo: 'texto',
    };

    setMensajes(prev => [...prev, mensaje]);
    setNuevoMensaje('');
    
    // Actualizar último mensaje en conversación
    setConversaciones(prev => prev.map(conv => 
      conv.id === conversacionActiva.id 
        ? { ...conv, ultimoMensaje: mensaje }
        : conv
    ));

    // Simular respuesta automática (demo)
    setTimeout(() => {
      const otroParticipante = conversacionActiva.participantes.find(p => 
        p.rol !== (esEspecialista ? 'especialista' : 'clinica')
      )!;

      const respuestas = [
          'Entendido, gracias por la información',
          'Perfecto, lo revisamos',
          'Muchas gracias',
          'Confirmado',
          'Excelente, procedemos',
        ];

      const respuesta: Mensaje = {
        id: `msg-${Date.now()}-reply`,
        conversacionId: conversacionActiva.id,
        emisorId: otroParticipante.id,
        emisorNombre: otroParticipante.nombre,
        contenido: respuestas[mensajes.length % respuestas.length],
        timestamp: new Date(),
        leido: true,
        tipo: 'texto',
      };
      setMensajes(prev => [...prev, respuesta]);
    }, 2000);

    toast.success('Mensaje enviado');
  };

  const archivarConversacion = (convId: string) => {
    setConversaciones(prev => prev.map(conv => 
      conv.id === convId 
        ? { ...conv, archivada: !conv.archivada }
        : conv
    ));
    toast.success('Conversación archivada');
  };

  // Manejar adjuntar archivo
  const handleAdjuntarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo || !conversacionActiva) return;

    // Validar tamaño (max 10MB)
    if (archivo.size > 10 * 1024 * 1024) {
      toast.error('El archivo no puede superar 10MB');
      return;
    }

    const esEspecialista = rolActivo === 'especialista';
    const emisor = conversacionActiva.participantes.find(p => 
      p.rol === (esEspecialista ? 'especialista' : 'clinica')
    )!;

    const mensaje: Mensaje = {
      id: `msg-${Date.now()}`,
      conversacionId: conversacionActiva.id,
      emisorId: emisor.id,
      emisorNombre: emisor.nombre,
      contenido: `📎 ${archivo.name}`,
      timestamp: new Date(),
      leido: false,
      tipo: 'archivo',
      archivoNombre: archivo.name,
      archivoUrl: URL.createObjectURL(archivo),
    };

    setMensajes(prev => [...prev, mensaje]);
    
    // Actualizar último mensaje en conversación
    setConversaciones(prev => prev.map(conv => 
      conv.id === conversacionActiva.id 
        ? { ...conv, ultimoMensaje: mensaje }
        : conv
    ));

    toast.success(`Archivo "${archivo.name}" enviado`);
    
    // Reset input
    e.target.value = '';
  };

  // Manejar adjuntar imagen
  const handleAdjuntarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imagen = e.target.files?.[0];
    if (!imagen || !conversacionActiva) return;

    // Validar que sea imagen
    if (!imagen.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (max 5MB)
    if (imagen.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar 5MB');
      return;
    }

    const esEspecialista = rolActivo === 'especialista';
    const emisor = conversacionActiva.participantes.find(p => 
      p.rol === (esEspecialista ? 'especialista' : 'clinica')
    )!;

    const mensaje: Mensaje = {
      id: `msg-${Date.now()}`,
      conversacionId: conversacionActiva.id,
      emisorId: emisor.id,
      emisorNombre: emisor.nombre,
      contenido: `🖼️ ${imagen.name}`,
      timestamp: new Date(),
      leido: false,
      tipo: 'imagen',
      archivoNombre: imagen.name,
      archivoUrl: URL.createObjectURL(imagen),
    };

    setMensajes(prev => [...prev, mensaje]);
    
    // Actualizar último mensaje en conversación
    setConversaciones(prev => prev.map(conv => 
      conv.id === conversacionActiva.id 
        ? { ...conv, ultimoMensaje: mensaje }
        : conv
    ));

    toast.success(`Imagen "${imagen.name}" enviada`);
    
    // Reset input
    e.target.value = '';
  };

  // Filtrar conversaciones
  const conversacionesFiltradas = conversaciones.filter(conv => {
    // Filtro por estado
    if (filtro === 'no-leidas' && conv.noLeidos === 0) return false;
    if (filtro === 'archivadas' && !conv.archivada) return false;
    if (filtro === 'todas' && conv.archivada) return false;

    // Búsqueda
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      const participantesNombres = conv.participantes.map(p => p.nombre.toLowerCase()).join(' ');
      const ultimoMensaje = conv.ultimoMensaje?.contenido.toLowerCase() || '';
      
      return participantesNombres.includes(searchLower) || ultimoMensaje.includes(searchLower);
    }

    return true;
  });

  const totalNoLeidos = conversaciones.reduce((acc, conv) => acc + (conv.archivada ? 0 : conv.noLeidos), 0);

  const formatearHora = (date: Date) => {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (date.toDateString() === hoy.toDateString()) {
      return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    } else if (Date.now() - date.getTime() < 604800000) {
      return date.toLocaleDateString('es-CO', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' });
    }
  };

  const esPropio = (mensaje: Mensaje) => {
    if (!conversacionActiva) return false;
    const esEspecialista = rolActivo === 'especialista';
    const miRol = esEspecialista ? 'especialista' : 'clinica';
    const participante = conversacionActiva.participantes.find(p => p.id === mensaje.emisorId);
    return participante?.rol === miRol;
  };

  const otroParticipante = conversacionActiva 
    ? conversacionActiva.participantes.find(p => 
        p.rol !== (rolActivo === 'especialista' ? 'especialista' : 'clinica')
      )
    : null;

  return (
    <div className="h-screen flex flex-col">
      {/* HEADER */}
      <div className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all ${
        darkMode 
          ? 'bg-gray-900/90 border-gray-800' 
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navegarA('dashboard')}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Mensajes
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {totalNoLeidos > 0 ? `${totalNoLeidos} mensaje${totalNoLeidos !== 1 ? 's' : ''} sin leer` : 'Todo al día'}
                </p>
              </div>
            </div>

            {/* Filtros rápidos */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant={filtro === 'todas' ? 'default' : 'outline'}
                onClick={() => setFiltro('todas')}
                className={filtro === 'todas' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                  : darkMode ? 'border-gray-700 text-gray-400' : ''
                }
              >
                Todas
              </Button>
              <Button
                variant={filtro === 'no-leidas' ? 'default' : 'outline'}
                onClick={() => setFiltro('no-leidas')}
                className={filtro === 'no-leidas' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                  : darkMode ? 'border-gray-700 text-gray-400' : ''
                }
              >
                No leídas
                {conversaciones.filter(c => c.noLeidos > 0 && !c.archivada).length > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white">
                    {conversaciones.filter(c => c.noLeidos > 0 && !c.archivada).length}
                  </Badge>
                )}
              </Button>
              <Button
                variant={filtro === 'archivadas' ? 'default' : 'outline'}
                onClick={() => setFiltro('archivadas')}
                className={filtro === 'archivadas' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                  : darkMode ? 'border-gray-700 text-gray-400' : ''
                }
              >
                <Archive className="w-4 h-4 mr-2" />
                Archivadas
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex-1 flex overflow-hidden">
        {/* LISTA DE CONVERSACIONES */}
        <div className={`${
          showMobileChat ? 'hidden lg:flex' : 'flex'
        } w-full lg:w-96 flex-shrink-0 flex-col border-r ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
        }`}>
          {/* Buscador */}
          <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border font-medium transition-all focus:ring-2 focus:ring-orange-500 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {/* Filtros mobile */}
            <div className="lg:hidden flex gap-2 mt-3">
              <button
                onClick={() => setFiltro('todas')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  filtro === 'todas'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    : darkMode
                    ? 'bg-gray-800 text-gray-400'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFiltro('no-leidas')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  filtro === 'no-leidas'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    : darkMode
                    ? 'bg-gray-800 text-gray-400'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                No leídas
              </button>
              <button
                onClick={() => setFiltro('archivadas')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  filtro === 'archivadas'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    : darkMode
                    ? 'bg-gray-800 text-gray-400'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Archivadas
              </button>
            </div>
          </div>

          {/* Lista de conversaciones */}
          <div className="flex-1 overflow-y-auto">
            {conversacionesFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Send className={`w-16 h-16 mb-4 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No hay conversaciones
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {filtro === 'no-leidas' 
                    ? 'No tienes mensajes sin leer' 
                    : filtro === 'archivadas'
                    ? 'No hay conversaciones archivadas'
                    : 'Inicia una conversación desde una solicitud'}
                </p>
              </div>
            ) : (
              <div>
                {conversacionesFiltradas.map((conv) => {
                  const otroParticipante = conv.participantes.find(p => 
                    p.rol !== (rolActivo === 'especialista' ? 'especialista' : 'clinica')
                  );
                  const esActiva = conversacionActiva?.id === conv.id;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => seleccionarConversacion(conv)}
                      className={`w-full p-4 border-b transition-all text-left ${
                        esActiva
                          ? darkMode
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-orange-50 border-orange-200'
                          : darkMode
                          ? 'border-gray-800 hover:bg-gray-800/50'
                          : 'border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                            otroParticipante?.rol === 'especialista'
                              ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                              : 'bg-gradient-to-br from-blue-500 to-blue-600'
                          }`}>
                            {otroParticipante?.nombre.charAt(0)}
                          </div>
                          {conv.enLinea && (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-bold truncate ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {otroParticipante?.nombre}
                            </h3>
                            <span className={`text-xs flex-shrink-0 ml-2 ${
                              conv.noLeidos > 0 
                                ? 'text-orange-500 font-bold' 
                                : darkMode ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              {conv.ultimoMensaje && formatearHora(conv.ultimoMensaje.timestamp)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className={`text-sm truncate ${
                              conv.noLeidos > 0 
                                ? darkMode ? 'text-white font-semibold' : 'text-gray-900 font-semibold'
                                : darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {conv.escribiendo 
                                ? <span className="text-orange-500 italic">escribiendo...</span>
                                : conv.ultimoMensaje?.contenido || 'Sin mensajes'}
                            </p>
                            {conv.noLeidos > 0 && (
                              <Badge className="ml-2 bg-orange-500 text-white flex-shrink-0">
                                {conv.noLeidos}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* VISTA DE CHAT */}
        <div className={`${
          !showMobileChat ? 'hidden lg:flex' : 'flex'
        } flex-1 flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          {conversacionActiva && otroParticipante ? (
            <>
              {/* Header del chat */}
              <div className={`p-4 border-b flex items-center justify-between ${
                darkMode ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className={`lg:hidden p-2 rounded-lg ${
                      darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                  >
                    <ArrowLeft className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                  
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      otroParticipante.rol === 'especialista'
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      {otroParticipante.nombre.charAt(0)}
                    </div>
                    {conversacionActiva.enLinea && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                    )}
                  </div>

                  <div>
                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {otroParticipante.nombre}
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {conversacionActiva.enLinea 
                        ? 'En línea' 
                        : conversacionActiva.escribiendo
                        ? 'Escribiendo...'
                        : 'Desconectado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => toast.info('Función de llamada próximamente')}
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => toast.info('Función de videollamada próximamente')}
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => archivarConversacion(conversacionActiva.id)}
                  >
                    <Archive className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mensajes */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
                darkMode ? 'bg-gray-900' : 'bg-gray-50'
              }`}>
                {mensajes.map((mensaje, index) => {
                  const esPropioBool = esPropio(mensaje);
                  const mostrarAvatar = index === 0 || mensajes[index - 1].emisorId !== mensaje.emisorId;

                  return (
                    <motion.div
                      key={mensaje.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${esPropioBool ? 'justify-end' : 'justify-start'} items-end gap-2`}
                    >
                      {!esPropioBool && (
                        <div className="w-8 h-8 flex-shrink-0">
                          {mostrarAvatar && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {mensaje.emisorNombre.charAt(0)}
                            </div>
                          )}
                        </div>
                      )}

                      <div className={`max-w-xs lg:max-w-md ${esPropioBool ? 'items-end' : 'items-start'} flex flex-col`}>
                        {mensaje.tipo === 'texto' && (
                          <div className={`px-4 py-2.5 rounded-2xl ${
                            esPropioBool
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-sm'
                              : darkMode
                              ? 'bg-gray-800 text-white rounded-bl-sm'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                          }`}>
                            <p className="text-sm leading-relaxed">{mensaje.contenido}</p>
                          </div>
                        )}

                        {mensaje.tipo === 'imagen' && (
                          <div className={`overflow-hidden rounded-2xl ${
                            esPropioBool ? 'rounded-br-sm' : 'rounded-bl-sm'
                          }`}>
                            <img 
                              src="https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&h=300&fit=crop" 
                              alt="Imagen adjunta"
                              className="max-w-xs cursor-pointer hover:opacity-90 transition-opacity"
                            />
                            <div className={`px-3 py-2 text-xs ${
                              esPropioBool ? 'bg-orange-600 text-white' : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              radiografia-paciente.jpg
                            </div>
                          </div>
                        )}

                        {mensaje.tipo === 'archivo' && (
                          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
                            esPropioBool
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-sm'
                              : darkMode
                              ? 'bg-gray-800 text-white rounded-bl-sm'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                          }`}>
                            <div className={`p-2 rounded-lg ${
                              esPropioBool ? 'bg-white/20' : darkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              <File className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">
                                {mensaje.archivoNombre || 'documento.pdf'}
                              </p>
                              <p className={`text-xs ${esPropioBool ? 'text-white/80' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                234 KB
                              </p>
                            </div>
                            <Download className="w-4 h-4" />
                          </div>
                        )}

                        <div className={`flex items-center gap-1 mt-1 text-xs ${
                          darkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          <span>
                            {mensaje.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {esPropioBool && (
                            mensaje.leido ? (
                              <CheckCheck className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )
                          )}
                        </div>
                      </div>

                      {esPropioBool && (
                        <div className="w-8 h-8 flex-shrink-0">
                          {mostrarAvatar && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                              {mensaje.emisorNombre.charAt(0)}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                <div ref={mensajesEndRef} />
              </div>

              {/* Input de mensaje */}
              <div className={`p-4 border-t ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
                {/* Inputs ocultos para archivos e imágenes */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={handleAdjuntarArchivo}
                  className="hidden"
                />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAdjuntarImagen}
                  className="hidden"
                />

                <div className="flex items-end gap-2">
                  <button
                    className={`p-2.5 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-orange-400' : 'hover:bg-gray-100 text-gray-600 hover:text-orange-500'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    title="Adjuntar archivo"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <button
                    className={`p-2.5 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-orange-400' : 'hover:bg-gray-100 text-gray-600 hover:text-orange-500'
                    }`}
                    onClick={() => imageInputRef.current?.click()}
                    title="Adjuntar imagen"
                  >
                    <Image className="w-5 h-5" />
                  </button>

                  <div className="flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={nuevoMensaje}
                      onChange={(e) => setNuevoMensaje(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          enviarMensaje();
                        }
                      }}
                      placeholder="Escribe un mensaje..."
                      className={`w-full px-4 py-3 rounded-xl border font-medium transition-all focus:ring-2 focus:ring-orange-500 ${
                        darkMode
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>

                  <button
                    onClick={enviarMensaje}
                    disabled={!nuevoMensaje.trim()}
                    className={`p-3 rounded-xl transition-all ${
                      nuevoMensaje.trim()
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30'
                        : darkMode
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  darkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <Send className={`w-10 h-10 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Selecciona una conversación
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Elige una conversación de la lista para comenzar a chatear
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}