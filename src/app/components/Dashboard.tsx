import { DollarSign, Calendar, CheckCircle, Clock, TrendingUp, AlertCircle, Sparkles, ArrowUpRight, ArrowDownRight, Info, ShieldAlert, Award, ShieldCheck, AlertTriangle } from 'lucide-react';
import { StatCard } from './StatCard';
import { RecentActivity } from './RecentActivity';
import { UpcomingAppointments } from './UpcomingAppointments';
import { RevenueChart } from './RevenueChart';
import { useApp } from '../App';
import { ClinicaFilter, getClinicaColor } from './ClinicaFilter';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function Dashboard() {
  const { solicitudes, servicios, facturas, gastos, darkMode, navegarA, userClinicas, getClinicaByNombre } = useApp();
  const [selectedClinica, setSelectedClinica] = useState('todas');
  
  // Estado de verificación del especialista (simulado - vendría del contexto/Supabase)
  const [estadoVerificacion, setEstadoVerificacion] = useState<'draft' | 'pending' | 'partial' | 'verified'>('verified');
  // Para demo: cambiar a 'draft', 'pending', 'partial' para ver diferentes estados

  // Filtrar datos según clínica seleccionada
  const solicitudesFiltradas = selectedClinica === 'todas' 
    ? solicitudes 
    : solicitudes.filter(s => {
        const clinica = getClinicaByNombre(s.clinica);
        return clinica?.id === selectedClinica;
      });

  const serviciosFiltrados = selectedClinica === 'todas'
    ? servicios
    : servicios.filter(s => {
        const clinica = getClinicaByNombre(s.clinica);
        return clinica?.id === selectedClinica;
      });

  const facturasFiltradas = selectedClinica === 'todas'
    ? facturas
    : facturas.filter(f => {
        const clinica = getClinicaByNombre(f.clinica);
        return clinica?.id === selectedClinica;
      });

  const solicitudesPendientes = solicitudesFiltradas.filter(s => s.estado === 'pendiente').length;
  
  const serviciosEsteMes = serviciosFiltrados.filter(s => {
    const fecha = new Date(s.fecha);
    const hoy = new Date();
    return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
  }).length;

  // Calcular servicios mes anterior
  const serviciosMesAnterior = serviciosFiltrados.filter(s => {
    const fecha = new Date(s.fecha);
    const hoy = new Date();
    const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1);
    return fecha.getMonth() === mesAnterior.getMonth() && fecha.getFullYear() === mesAnterior.getFullYear();
  }).length;

  const cambioServicios = serviciosMesAnterior > 0 
    ? Math.round(((serviciosEsteMes - serviciosMesAnterior) / serviciosMesAnterior) * 100)
    : 0;

  const ingresosEsteMes = serviciosFiltrados
    .filter(s => {
      const fecha = new Date(s.fecha);
      const hoy = new Date();
      return fecha.getMonth() === hoy.getMonth() && s.estado === 'pagado';
    })
    .reduce((acc, s) => acc + s.tarifa, 0);

  // Calcular ingresos mes anterior
  const ingresosMesAnterior = serviciosFiltrados
    .filter(s => {
      const fecha = new Date(s.fecha);
      const hoy = new Date();
      const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1);
      return fecha.getMonth() === mesAnterior.getMonth() && s.estado === 'pagado';
    })
    .reduce((acc, s) => acc + s.tarifa, 0);

  const cambioIngresos = ingresosMesAnterior > 0
    ? Math.round(((ingresosEsteMes - ingresosMesAnterior) / ingresosMesAnterior) * 100)
    : 0;

  const cuentasPorCobrar = facturasFiltradas
    .filter(f => f.estado !== 'pagada')
    .reduce((acc, f) => acc + f.total, 0);

  const facturasPendientes = facturasFiltradas.filter(f => f.estado !== 'pagada').length;

  // Solicitudes de hoy
  const solicitudesHoy = solicitudesFiltradas.filter(s => {
    const fecha = new Date(s.fechaSolicitud);
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }).length;

  const stats = [
    {
      title: 'Solicitudes Pendientes',
      value: solicitudesPendientes.toString(),
      change: `${solicitudesHoy > 0 ? '+' : ''}${solicitudesHoy} hoy`,
      icon: Clock,
      color: '#F97316', // Orange
      trend: solicitudesHoy > 0 ? 'up' : 'neutral',
      onClick: () => navegarA('solicitudes'),
      description: 'Solicitudes esperando tu revisión',
      changeValue: solicitudesHoy
    },
    {
      title: 'Servicios Este Mes',
      value: serviciosEsteMes.toString(),
      change: `${cambioServicios > 0 ? '+' : ''}${cambioServicios}% vs mes anterior`,
      icon: CheckCircle,
      color: '#22C55E', // Green
      trend: cambioServicios > 0 ? 'up' : cambioServicios < 0 ? 'down' : 'neutral',
      onClick: () => navegarA('servicios'),
      description: 'Servicios completados en el mes actual',
      changeValue: cambioServicios
    },
    {
      title: 'Ingresos del Mes',
      value: `$${ingresosEsteMes.toLocaleString()}`,
      change: `${cambioIngresos > 0 ? '+' : ''}${cambioIngresos}% vs mes anterior`,
      icon: DollarSign,
      color: '#F97316', // Orange (reemplaza azul)
      trend: cambioIngresos > 0 ? 'up' : cambioIngresos < 0 ? 'down' : 'neutral',
      onClick: () => navegarA('finanzas'),
      description: 'Total de ingresos confirmados este mes',
      changeValue: cambioIngresos
    },
    {
      title: 'Cuentas por Cobrar',
      value: `$${cuentasPorCobrar.toLocaleString()}`,
      change: `${facturasPendientes} factura${facturasPendientes !== 1 ? 's' : ''} pendiente${facturasPendientes !== 1 ? 's' : ''}`,
      icon: AlertCircle,
      color: '#EF4444', // Red
      trend: 'neutral',
      onClick: () => navegarA('finanzas'),
      description: 'Monto pendiente de cobro',
      changeValue: facturasPendientes
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      {/* Header - Jerarquía mejorada */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="p-2.5 rounded-xl"
              style={{ 
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)',
                border: darkMode ? '1px solid rgba(249, 115, 22, 0.2)' : '1px solid rgba(249, 115, 22, 0.15)'
              }}
            >
              <Sparkles className="w-6 h-6" style={{ color: '#F97316' }} />
            </div>
            <h1 
              className="text-3xl font-bold tracking-tight"
              style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
            >
              Dashboard
            </h1>
          </div>
          <p 
            className="text-sm ml-[52px]"
            style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
          >
            Resumen ejecutivo de tu actividad profesional
          </p>
        </div>

        {/* Context indicator - dynamic based on filter */}
        {selectedClinica !== 'todas' && (
          <div 
            className="px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2"
            style={{
              backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(248, 250, 252, 0.8)',
              borderColor: darkMode ? '#374151' : '#E2E8F0',
              color: darkMode ? '#E5E7EB' : '#0F172A'
            }}
          >
            <div 
              className="w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: getClinicaColor(userClinicas.find(c => c.id === selectedClinica)?.nombre || '')
              }}
            />
            Vista filtrada
          </div>
        )}
      </div>

      {/* BANNER DE ESTADO DE VERIFICACIÓN */}
      {estadoVerificacion !== 'verified' && (
        <Card className={`border-l-4 ${
          estadoVerificacion === 'draft'
            ? 'border-l-yellow-500'
            : estadoVerificacion === 'pending'
            ? 'border-l-blue-500'
            : 'border-l-orange-500'
        } ${
          darkMode
            ? estadoVerificacion === 'draft'
              ? 'bg-yellow-500/10 border-yellow-500/30'
              : estadoVerificacion === 'pending'
              ? 'bg-blue-500/10 border-blue-500/30'
              : 'bg-orange-500/10 border-orange-500/30'
            : estadoVerificacion === 'draft'
            ? 'bg-yellow-50 border-yellow-200'
            : estadoVerificacion === 'pending'
            ? 'bg-blue-50 border-blue-200'
            : 'bg-orange-50 border-orange-200'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {estadoVerificacion === 'draft' ? (
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  </div>
                ) : estadoVerificacion === 'pending' ? (
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-500" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Award className="w-6 h-6 text-orange-500" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                {estadoVerificacion === 'draft' && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Completa tu perfil profesional
                      </h3>
                      <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                        DRAFT
                      </Badge>
                    </div>
                    <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tu perfil aún no está visible para las clínicas. Completa tu información profesional 
                      y envía tus documentos de verificación para activar tu perfil público.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => navegarA('perfil-profesional')}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                      >
                        Completar Perfil
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navegarA('verificacion-profesional')}
                        className={darkMode ? 'border-gray-700 text-gray-300' : ''}
                      >
                        Ver Requisitos →
                      </Button>
                    </div>
                  </>
                )}

                {estadoVerificacion === 'pending' && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Tu perfil está siendo verificado
                      </h3>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                        EN REVISIÓN
                      </Badge>
                    </div>
                    <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Estamos revisando tus documentos profesionales. Este proceso suele tomar 24-48 horas hábiles. 
                      Te notificaremos por correo cuando la verificación esté completa.
                    </p>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-500/10' : 'bg-blue-100'}`}>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                        📧 Recibirás una notificación en las próximas 48 horas
                      </p>
                    </div>
                  </>
                )}

                {estadoVerificacion === 'partial' && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Verificación parcial completada
                      </h3>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                        PARCIAL
                      </Badge>
                    </div>
                    <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tu perfil está parcialmente verificado. Para acceder a todas las funcionalidades y 
                      aparecer con badge "Verificado", completa la verificación total.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => navegarA('verificacion-profesional')}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                      >
                        Completar Verificación
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navegarA('verificacion-profesional')}
                        className={darkMode ? 'border-gray-700 text-gray-300' : ''}
                      >
                        Ver Detalles →
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clínica Filter - Más compacto */}
      <Card>
        <CardContent className="pt-6">
          <ClinicaFilter
            clinicas={userClinicas}
            selectedClinica={selectedClinica}
            onSelectClinica={setSelectedClinica}
          />
        </CardContent>
      </Card>

      {/* Stats Grid - KPIs mejorados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <TooltipProvider>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </TooltipProvider>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2" style={{ minHeight: '400px' }}>
          <RevenueChart />
        </div>
        <div>
          <UpcomingAppointments />
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}