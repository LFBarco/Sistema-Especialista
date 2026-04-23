import { Building2, Calendar, Clock, DollarSign, Activity, TrendingUp, Users, FileText, ArrowRight, CheckCircle, AlertCircle, Eye, Star, Award, Briefcase, Zap, User2, Bell, Phone, MessageCircle, Video, Stethoscope, Heart, AlertTriangle } from 'lucide-react';
import { useApp } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';

export function DashboardClinica() {
  const { darkMode, servicios, solicitudes, facturas, navegarA, especialistas, selectedSedeId, setEspecialistaSeleccionado } = useApp();

  // Filtrar datos según sede seleccionada
  const filteredSolicitudes = selectedSedeId === 'all' 
    ? solicitudes 
    : solicitudes.filter(s => s.sedeId === selectedSedeId || !s.sedeId);
    
  const filteredServicios = selectedSedeId === 'all'
    ? servicios
    : servicios.filter(s => s.sedeId === selectedSedeId || !s.sedeId);

  const filteredFacturas = selectedSedeId === 'all'
    ? facturas
    : facturas.filter(f => f.sedeId === selectedSedeId || !f.sedeId);

  // Si no hay especialistas disponibles, mostrar mensaje
  if (!especialistas || especialistas.length === 0) {
    return (
      <div className="p-4 lg:p-8">
        <div className={`rounded-2xl p-8 border-2 text-center ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <Building2 className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            No hay especialistas disponibles
          </h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Por favor contacta al administrador para agregar especialistas al sistema
          </p>
        </div>
      </div>
    );
  }

  // Calcular disponibilidad de cada especialista
  const calcularDisponibilidadEspecialista = (especialistaId: string) => {
    const serviciosProximos = servicios.filter(s => 
      s.medicoId === especialistaId && s.estado === 'confirmado'
    ).length;
    
    if (serviciosProximos > 15) {
      return { status: 'ocupado', label: 'Ocupado', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
    } else if (serviciosProximos > 8) {
      return { status: 'moderado', label: 'Moderado', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' };
    } else {
      return { status: 'disponible', label: 'Disponible', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' };
    }
  };

  // Métricas importantes
  const solicitudesPendientes = filteredSolicitudes.filter(s => s.estado === 'pendiente').length;
  const solicitudesUrgentes = filteredSolicitudes.filter(s => s.urgencia === 'alta' && s.estado === 'pendiente').length;
  const serviciosHoy = filteredServicios.filter(s => {
    const hoy = new Date().toISOString().split('T')[0];
    return s.fecha === hoy && s.estado === 'confirmado';
  }).length;
  const serviciosSemana = filteredServicios.filter(s => s.estado === 'confirmado').length;

  // Próximos servicios (hoy y mañana)
  const proximosServicios = filteredServicios
    .filter(s => s.estado === 'confirmado')
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 3);

  // Actividad reciente (últimas solicitudes y respuestas)
  const actividadReciente = [...filteredSolicitudes]
    .sort((a, b) => new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime())
    .slice(0, 4);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Portal Clínica
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Gestiona tus especialistas y servicios veterinarios
          </p>
        </div>
        
        {/* Alertas rápidas */}
        {solicitudesUrgentes > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border-2 border-red-500/50"
          >
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className={`font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              {solicitudesUrgentes} solicitud{solicitudesUrgentes !== 1 ? 'es' : ''} urgente{solicitudesUrgentes !== 1 ? 's' : ''}
            </span>
          </motion.div>
        )}
      </div>

      {/* Métricas Rápidas del Día */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border-2 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {solicitudesPendientes}
              </p>
            </div>
          </div>
          <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Solicitudes Pendientes
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-4 rounded-xl border-2 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {serviciosHoy}
              </p>
            </div>
          </div>
          <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Servicios Hoy
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-xl border-2 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {serviciosSemana}
              </p>
            </div>
          </div>
          <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Esta Semana
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-4 rounded-xl border-2 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {especialistas.length}
              </p>
            </div>
          </div>
          <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Especialistas
          </p>
        </motion.div>
      </div>

      {/* SECCIÓN PRINCIPAL: TODOS LOS ESPECIALISTAS DISPONIBLES */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🏥 Especialistas Disponibles
          </h2>
          <button
            onClick={() => navegarA('especialistas')}
            className={`text-sm font-semibold transition-colors ${
              darkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'
            }`}
          >
            Ver todos →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {especialistas.map((especialista, index) => {
            const disponibilidad = calcularDisponibilidadEspecialista(especialista.id);
            const serviciosProximos = servicios.filter(s => 
              s.medicoId === especialista.id && s.estado === 'confirmado'
            ).length;

            return (
              <motion.div
                key={especialista.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl p-6 border-2 transition-all hover:shadow-xl ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 hover:border-orange-500/50' 
                    : 'bg-white border-gray-200 hover:border-orange-300'
                }`}
              >
                {/* Header con Avatar y Disponibilidad */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                          boxShadow: '0 4px 16px rgba(249, 115, 22, 0.3)'
                        }}
                      >
                        <User2 className="w-8 h-8 text-white" />
                      </div>
                      {/* Badge de estado */}
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          backgroundColor: disponibilidad.color,
                          borderColor: darkMode ? '#1F2937' : '#FFFFFF'
                        }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Dr. {especialista.nombre}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {especialista.apellido}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Especialidad */}
                <div className="mb-4">
                  <Badge 
                    className="px-3 py-1 text-sm font-bold"
                    style={{
                      backgroundColor: darkMode ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.1)',
                      color: '#F97316',
                      border: '1px solid rgba(249, 115, 22, 0.3)'
                    }}
                  >
                    <Stethoscope className="w-4 h-4 mr-1" />
                    {especialista.especialidad}
                  </Badge>
                </div>

                {/* Stats Rápidos */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className={`p-2 rounded-lg text-center ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    </div>
                    <p className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {especialista.rating}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      Rating
                    </p>
                  </div>

                  <div className={`p-2 rounded-lg text-center ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Award className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {especialista.experiencia}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      Años
                    </p>
                  </div>

                  <div className={`p-2 rounded-lg text-center ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="w-4 h-4 text-green-500" />
                    </div>
                    <p className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${especialista.tarifa}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      Tarifa
                    </p>
                  </div>
                </div>

                {/* Disponibilidad y Servicios Próximos */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Estado
                    </span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: disponibilidad.color }}
                      ></div>
                      <span 
                        className="text-sm font-bold"
                        style={{ color: disponibilidad.color }}
                      >
                        {disponibilidad.label}
                      </span>
                    </div>
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    {serviciosProximos} servicio{serviciosProximos !== 1 ? 's' : ''} confirmado{serviciosProximos !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Acciones */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setEspecialistaSeleccionado(especialista.id);
                      navegarA('agenda');
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 ${
                      darkMode 
                        ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' 
                        : 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20'
                    }`}
                  >
                    Ver Agenda
                  </button>
                  <button
                    onClick={() => {
                      setEspecialistaSeleccionado(especialista.id);
                      navegarA('solicitudes');
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 ${
                      darkMode 
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                        : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
                    }`}
                  >
                    Solicitar
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dos columnas: Próximos Servicios + Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Servicios */}
        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Calendar className="w-5 h-5 text-blue-500" />
                Próximos Servicios
              </CardTitle>
              <button
                onClick={() => navegarA('agenda')}
                className={`text-sm font-semibold transition-colors ${
                  darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                Ver todos →
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {proximosServicios.length > 0 ? (
              <div className="space-y-3">
                {proximosServicios.map((servicio) => (
                  <div
                    key={servicio.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {servicio.tipo}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {servicio.paciente}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        📅 {servicio.fecha} • {servicio.hora}
                      </span>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                        Confirmado
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  No hay servicios confirmados próximamente
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Activity className="w-5 h-5 text-orange-500" />
                Actividad Reciente
              </CardTitle>
              <button
                onClick={() => navegarA('solicitudes')}
                className={`text-sm font-semibold transition-colors ${
                  darkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'
                }`}
              >
                Ver todas →
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {actividadReciente.length > 0 ? (
              <div className="space-y-3">
                {actividadReciente.map((solicitud) => (
                  <div
                    key={solicitud.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {solicitud.tipo}
                          </h4>
                          {solicitud.estado === 'pendiente' && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs">
                              Pendiente
                            </Badge>
                          )}
                          {solicitud.estado === 'aceptada' && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
                              Aceptada
                            </Badge>
                          )}
                          {solicitud.estado === 'rechazada' && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">
                              Rechazada
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {solicitud.paciente} • {solicitud.fechaSolicitada}
                        </p>
                      </div>
                      <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${solicitud.tarifa}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  No hay actividad reciente
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <div>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ⚡ Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navegarA('solicitudes')}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-orange-500/50' 
                : 'bg-white border-gray-200 hover:border-orange-300'
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Nueva Solicitud
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Solicitar servicio
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navegarA('agenda')}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-blue-500/50' 
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Ver Agendas
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Disponibilidad
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navegarA('estado-cuenta')}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-green-500/50' 
                : 'bg-white border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Pagos
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Gestionar facturas
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navegarA('especialistas')}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 hover:border-purple-500/50' 
                : 'bg-white border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Especialistas
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Ver marketplace
            </p>
          </motion.button>
        </div>
      </div>
    </div>
  );
}