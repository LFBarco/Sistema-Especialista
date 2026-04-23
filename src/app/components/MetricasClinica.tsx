import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, TrendingUp, DollarSign, Calendar, Users, BarChart3, PieChart, Clock, AlertCircle, CheckCircle2, Filter, Download, ChevronDown, Activity } from 'lucide-react';
import { useApp } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { BarChart, Bar, PieChart as RechartsPie, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export function MetricasClinica() {
  const { darkMode, navegarA, facturas, servicios, especialistas, userClinicas } = useApp();
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'mes' | 'trimestre' | 'semestre' | 'año'>('mes');
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [especialistaFiltroAntiguedad, setEspecialistaFiltroAntiguedad] = useState<string>('todos');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Esperar a que el componente esté montado antes de renderizar gráficos
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Obtener clínica del contexto
  const clinicaData = userClinicas[0];
  const clinica = {
    nombre: clinicaData?.nombre || '',
    id: clinicaData?.id || ''
  };

  // Facturas de la clínica
  const facturasClinica = facturas.filter(f => f.clinica === clinica.nombre);

  // Servicios de la clínica con información del especialista
  const serviciosClinica = servicios
    .filter(s => s.clinica === clinica.nombre)
    .map(servicio => {
      // Mapear tipos de servicio a especialidades
      const especialidadMap: { [key: string]: string } = {
        'Ecocardiograma': 'Cardiología',
        'Ecocardiograma Doppler': 'Cardiología',
        'Consulta Cardiológica': 'Cardiología',
        'Electrocardiograma': 'Cardiología',
        'Cirugía': 'Cirugía',
        'Dermatología': 'Dermatología',
        'Oftalmología': 'Oftalmología'
      };

      const especialidad = especialidadMap[servicio.tipo] || 'Medicina Interna';
      
      // Buscar el especialista correspondiente (proteger contra array vacío)
      const especialista = especialistas.find(e => e.especialidad === especialidad) || especialistas[0] || null;

      return {
        ...servicio,
        especialidad,
        especialistaNombre: especialista ? `${especialista.nombre} ${especialista.apellido}` : 'Sin asignar',
        especialistaId: especialista?.id ?? 0
      };
    });

  // Calcular fecha límite según período
  const getFechaLimite = () => {
    const hoy = new Date();
    switch (periodoSeleccionado) {
      case 'mes':
        return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      case 'trimestre':
        return new Date(hoy.getFullYear(), hoy.getMonth() - 3, 1);
      case 'semestre':
        return new Date(hoy.getFullYear(), hoy.getMonth() - 6, 1);
      case 'año':
        return new Date(hoy.getFullYear(), 0, 1);
      default:
        return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    }
  };

  const fechaLimite = getFechaLimite();
  const serviciosFiltrados = serviciosClinica.filter(s => new Date(s.fecha) >= fechaLimite);
  const facturasFiltradas = facturasClinica.filter(f => new Date(f.fecha) >= fechaLimite);

  // KPIs principales
  const totalServicios = serviciosFiltrados.length;
  const totalInvertido = facturasFiltradas.reduce((acc, f) => acc + f.total, 0);
  const promedioServicio = totalServicios > 0 ? totalInvertido / totalServicios : 0;
  const facturasPagadas = facturasFiltradas.filter(f => f.estado === 'pagada').length;
  const tasaPago = facturasFiltradas.length > 0 ? (facturasPagadas / facturasFiltradas.length) * 100 : 0;

  // Servicios por Especialista
  const serviciosPorEspecialista = useMemo(() => {
    const agrupado: { [key: string]: { nombre: string; cantidad: number; monto: number; especialidad: string } } = {};

    serviciosFiltrados.forEach(servicio => {
      const key = servicio.especialistaNombre;
      if (!agrupado[key]) {
        agrupado[key] = {
          nombre: servicio.especialistaNombre,
          cantidad: 0,
          monto: 0,
          especialidad: servicio.especialidad
        };
      }
      agrupado[key].cantidad += 1;
      agrupado[key].monto += servicio.tarifa;
    });

    return Object.values(agrupado).sort((a, b) => b.cantidad - a.cantidad);
  }, [serviciosFiltrados]);

  // Ingresos por Especialidad
  const ingresosPorEspecialidad = useMemo(() => {
    const agrupado: { [key: string]: number } = {};

    serviciosFiltrados.forEach(servicio => {
      const especialidad = servicio.especialidad;
      agrupado[especialidad] = (agrupado[especialidad] || 0) + servicio.tarifa;
    });

    return Object.entries(agrupado)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [serviciosFiltrados]);

  // Antigüedad de Cuentas por Pagar
  const antiguedadCuentas = useMemo(() => {
    const hoy = new Date();
    const categorias = {
      'Menos de 15 días': { count: 0, monto: 0, facturas: [] as any[] },
      '15-30 días': { count: 0, monto: 0, facturas: [] as any[] },
      '31-60 días': { count: 0, monto: 0, facturas: [] as any[] },
      'Más de 61 días': { count: 0, monto: 0, facturas: [] as any[] }
    };

    // Filtrar facturas por especialista si está seleccionado
    let facturasParaAntiguedad = facturasClinica.filter(f => f.estado !== 'pagada');
    
    if (especialistaFiltroAntiguedad !== 'todos') {
      // Filtrar facturas que pertenecen a servicios del especialista seleccionado
      facturasParaAntiguedad = facturasParaAntiguedad.filter(factura => {
        // Buscar el servicio asociado a esta factura por servicioId
        const servicioRelacionado = serviciosClinica.find(s => 
          s.id === factura.servicioId && 
          String(s.especialistaId) === String(especialistaFiltroAntiguedad)
        );
        return !!servicioRelacionado;
      });
    }

    facturasParaAntiguedad.forEach(factura => {
      const fechaFactura = new Date(factura.fecha);
      const diasTranscurridos = Math.floor((hoy.getTime() - fechaFactura.getTime()) / (1000 * 60 * 60 * 24));

      if (diasTranscurridos < 15) {
        categorias['Menos de 15 días'].count += 1;
        categorias['Menos de 15 días'].monto += factura.total;
        categorias['Menos de 15 días'].facturas.push(factura);
      } else if (diasTranscurridos <= 30) {
        categorias['15-30 días'].count += 1;
        categorias['15-30 días'].monto += factura.total;
        categorias['15-30 días'].facturas.push(factura);
      } else if (diasTranscurridos <= 60) {
        categorias['31-60 días'].count += 1;
        categorias['31-60 días'].monto += factura.total;
        categorias['31-60 días'].facturas.push(factura);
      } else {
        categorias['Más de 61 días'].count += 1;
        categorias['Más de 61 días'].monto += factura.total;
        categorias['Más de 61 días'].facturas.push(factura);
      }
    });

    return Object.entries(categorias).map(([categoria, data]) => ({
      categoria,
      cantidad: data.count,
      monto: data.monto,
      facturas: data.facturas
    }));
  }, [facturasClinica, especialistaFiltroAntiguedad, serviciosClinica]);

  // Tendencia de servicios (últimos 6 meses)
  const tendenciaServicios = useMemo(() => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const datos = [];

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mesNombre = meses[fecha.getMonth()];
      const año = fecha.getFullYear();

      const serviciosMes = serviciosClinica.filter(s => {
        const fechaServicio = new Date(s.fecha);
        return fechaServicio.getMonth() === fecha.getMonth() && 
               fechaServicio.getFullYear() === fecha.getFullYear();
      });

      const montoMes = serviciosMes.reduce((acc, s) => acc + s.tarifa, 0);

      datos.push({
        mes: `${mesNombre} '${String(año).slice(-2)}`,
        servicios: serviciosMes.length,
        monto: montoMes
      });
    }

    return datos;
  }, [serviciosClinica]);

  // Distribución por sede (mock - en producción vendría de los datos)
  const distribucionSedes = useMemo(() => {
    const sedes = [
      { nombre: 'Sede Principal', servicios: Math.floor(totalServicios * 0.5) },
      { nombre: 'Sede Norte', servicios: Math.floor(totalServicios * 0.3) },
      { nombre: 'Sede Sur', servicios: Math.floor(totalServicios * 0.2) }
    ];
    return sedes;
  }, [totalServicios]);

  // Colores para gráficos
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
  const AGING_COLORS = ['#10B981', '#F59E0B', '#F97316', '#EF4444']; // Verde, Amarillo, Naranja, Rojo

  const exportarReporte = () => {
    toast.info('Generando reporte en PDF...');
    console.log('Exportando métricas:', {
      periodo: periodoSeleccionado,
      servicios: totalServicios,
      inversion: totalInvertido
    });
  };

  const periodos = [
    { value: 'mes', label: 'Último mes' },
    { value: 'trimestre', label: 'Último trimestre' },
    { value: 'semestre', label: 'Último semestre' },
    { value: 'año', label: 'Último año' }
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navegarA('dashboard')}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Métricas y Analíticas
            </h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Análisis de servicios y finanzas de {clinica.nombre}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de período */}
          <div className="relative">
            <select
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value as any)}
              className={`appearance-none px-4 py-2 pr-10 rounded-lg border font-semibold cursor-pointer ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {periodos.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`} />
          </div>

          <Button
            onClick={exportarReporte}
            variant="outline"
            className={darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700' : ''}
          >
            <Download className="w-5 h-5 mr-2" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Servicios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Servicios Contratados
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {totalServicios}
                  </p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {periodos.find(p => p.value === periodoSeleccionado)?.label}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Invertido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Invertido
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${totalInvertido.toLocaleString()}
                  </p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    En servicios especializados
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Promedio por Servicio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Promedio por Servicio
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${Math.round(promedioServicio).toLocaleString()}
                  </p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Costo promedio unitario
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasa de Pago */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Tasa de Pago
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round(tasaPago)}%
                  </p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {facturasPagadas} de {facturasFiltradas.length} facturas
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Antigüedad de Cuentas por Pagar - DESTACADO */}
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Antigüedad de Cuentas por Pagar
                </CardTitle>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Distribución de facturas pendientes por días de antigüedad
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Filtro de especialistas */}
              <div className="relative">
                <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <select
                  value={especialistaFiltroAntiguedad}
                  onChange={(e) => setEspecialistaFiltroAntiguedad(e.target.value)}
                  className={`appearance-none pl-10 pr-10 py-2 rounded-lg border font-semibold cursor-pointer text-sm ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="todos">Todos los Especialistas</option>
                  {especialistas.map(esp => (
                    <option key={esp.id} value={esp.id}>
                      Dr. {esp.nombre} {esp.apellido}
                    </option>
                  ))}
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
              </div>
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/50">
                {antiguedadCuentas.reduce((acc, cat) => acc + cat.cantidad, 0)} pendientes
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico */}
            <div className="h-80" style={{ minHeight: '320px' }}>
              {isMounted && (
                <ResponsiveContainer width="100%" height={300} minWidth={200}>
                  <BarChart data={antiguedadCuentas}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                    <XAxis 
                      dataKey="categoria" 
                      stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                      tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
                      angle={-15}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                      tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px',
                        color: darkMode ? '#FFFFFF' : '#000000'
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === 'monto') return [`$${value.toLocaleString()}`, 'Monto'];
                        return [value, 'Cantidad'];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="cantidad" fill="#3B82F6" name="Cantidad de Facturas" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="monto" fill="#10B981" name="Monto Total ($)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Tabla de detalles */}
            <div className="space-y-3">
              {antiguedadCuentas.map((cat, index) => {
                const porcentajeMonto = facturasFiltradas.length > 0 
                  ? (cat.monto / facturasFiltradas.reduce((acc, f) => acc + f.total, 0)) * 100 
                  : 0;

                return (
                  <div
                    key={cat.categoria}
                    className={`p-4 rounded-xl border-2 ${
                      darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}
                    style={{
                      borderLeftWidth: '4px',
                      borderLeftColor: AGING_COLORS[index]
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: AGING_COLORS[index] }}
                        />
                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {cat.categoria}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        style={{ 
                          backgroundColor: `${AGING_COLORS[index]}20`,
                          color: AGING_COLORS[index],
                          borderColor: `${AGING_COLORS[index]}50`
                        }}
                      >
                        {cat.cantidad} factura{cat.cantidad !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${cat.monto.toLocaleString()}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                          {Math.round(porcentajeMonto)}% del total pendiente
                        </p>
                      </div>
                      {cat.cantidad > 0 && (
                        <button
                          onClick={() => navegarA('estado-cuenta')}
                          className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                            darkMode
                              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Ver detalles
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alerta si hay facturas muy antiguas */}
          {antiguedadCuentas[3].cantidad > 0 && (
            <div className={`mt-6 p-4 rounded-xl border-2 ${
              darkMode 
                ? 'bg-red-500/10 border-red-500/50' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className={`font-bold ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                    Atención: Facturas con alta antigüedad
                  </p>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                    Tienes {antiguedadCuentas[3].cantidad} factura{antiguedadCuentas[3].cantidad !== 1 ? 's' : ''} con más de 61 días de antigüedad 
                    por un total de ${antiguedadCuentas[3].monto.toLocaleString()}. 
                    Se recomienda gestionar estos pagos prioritariamente.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Servicios por Especialista e Ingresos por Especialidad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Servicios por Especialista */}
        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Servicios por Especialista
                </CardTitle>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Top especialistas contratados
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 mb-4" style={{ minHeight: '320px' }}>
              {isMounted && (
                <ResponsiveContainer width="100%" height={300} minWidth={200}>
                  <BarChart data={serviciosPorEspecialista.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                    <XAxis type="number" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <YAxis 
                      dataKey="nombre" 
                      type="category" 
                      width={120}
                      stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                      tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="cantidad" fill="#3B82F6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Tabla de detalles */}
            <div className="space-y-2">
              {serviciosPorEspecialista.slice(0, 5).map((esp, index) => (
                <div
                  key={esp.nombre}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    darkMode ? 'bg-gray-900' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white`}
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {esp.nombre}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        {esp.especialidad}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {esp.cantidad} servicios
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      ${esp.monto.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ingresos por Especialidad */}
        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Distribución por Especialidad
                </CardTitle>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Inversión por área médica
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 mb-4" style={{ minHeight: '320px' }}>
              {isMounted && (
                <ResponsiveContainer width="100%" height={300} minWidth={200}>
                  <RechartsPie>
                    <Pie
                      data={ingresosPorEspecialidad}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {ingresosPorEspecialidad.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px'
                      }}
                      formatter={(value: any) => `$${value.toLocaleString()}`}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              )}
            </div>

            {/* Leyenda con detalles */}
            <div className="space-y-2">
              {ingresosPorEspecialidad.map((esp, index) => {
                const porcentaje = totalInvertido > 0 ? (esp.value / totalInvertido) * 100 : 0;
                return (
                  <div
                    key={esp.name}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      darkMode ? 'bg-gray-900' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {esp.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${esp.value.toLocaleString()}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {porcentaje.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendencia de Servicios */}
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                Tendencia de Servicios
              </CardTitle>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Evolución de servicios e inversión (últimos 6 meses)
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80" style={{ minHeight: '320px' }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height={300} minWidth={200}>
                <LineChart data={tendenciaServicios}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                  <XAxis 
                    dataKey="mes" 
                    stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                    tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                    tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280' }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                    tick={{ fill: darkMode ? '#9CA3AF' : '#6B7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                      border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'monto') return [`$${value.toLocaleString()}`, 'Inversión'];
                      return [value, 'Servicios'];
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="servicios" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', r: 5 }}
                    name="Cantidad de Servicios"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="monto" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', r: 5 }}
                    name="Inversión ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Métricas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Distribución por Sede */}
        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Distribución por Sede
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {distribucionSedes.map((sede, index) => {
                const porcentaje = totalServicios > 0 ? (sede.servicios / totalServicios) * 100 : 0;
                return (
                  <div key={sede.nombre}>
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {sede.nombre}
                      </p>
                      <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {sede.servicios}
                      </p>
                    </div>
                    <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${porcentaje}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      {porcentaje.toFixed(1)}% del total
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Especialistas */}
        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Top 3 Especialistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {serviciosPorEspecialista.slice(0, 3).map((esp, index) => {
                const medallas = ['🥇', '🥈', '🥉'];
                return (
                  <div
                    key={esp.nombre}
                    className={`p-3 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{medallas[index]}</span>
                      <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {esp.nombre}
                      </p>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {esp.cantidad} servicios • ${esp.monto.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas Rápidas */}
        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Estadísticas Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Especialidad más contratada
                </p>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {ingresosPorEspecialidad[0]?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tiempo prom. de pago
                </p>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  24 días
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Facturas pendientes
                </p>
                <p className={`text-lg font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {facturasClinica.filter(f => f.estado !== 'pagada').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}