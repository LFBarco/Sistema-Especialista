import { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, Activity, FileText, ArrowLeft } from 'lucide-react';
import { useApp } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner@2.0.3';

export function ReportesAvanzados() {
  const { darkMode, servicios, facturas, solicitudes, navegarA, userClinicas } = useApp();
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'semana' | 'mes' | 'trimestre' | 'anio'>('mes');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calcular fecha límite según período seleccionado
  const fechaLimite = useMemo(() => {
    const hoy = new Date();
    switch (periodoSeleccionado) {
      case 'semana':
        return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 7);
      case 'mes':
        return new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
      case 'trimestre':
        return new Date(hoy.getFullYear(), hoy.getMonth() - 3, 1);
      case 'anio':
        return new Date(hoy.getFullYear() - 1, hoy.getMonth(), hoy.getDate());
      default:
        return new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
    }
  }, [periodoSeleccionado]);

  // Datos filtrados por período
  const serviciosFiltrados = useMemo(() => 
    servicios.filter(s => new Date(s.fecha) >= fechaLimite), 
    [servicios, fechaLimite]
  );
  const facturasFiltradas = useMemo(() => 
    facturas.filter(f => new Date(f.fecha) >= fechaLimite), 
    [facturas, fechaLimite]
  );

  // Evolución de ingresos mensuales (últimos 12 meses desde datos reales)
  const ingresosData = useMemo(() => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const datos = [];

    for (let i = 11; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mesNombre = meses[fecha.getMonth()];
      const mes = fecha.getMonth();
      const anio = fecha.getFullYear();

      const facturasMes = facturas.filter(f => {
        const ff = new Date(f.fecha);
        return ff.getMonth() === mes && ff.getFullYear() === anio;
      });

      const serviciosMes = servicios.filter(s => {
        const fs = new Date(s.fecha);
        return fs.getMonth() === mes && fs.getFullYear() === anio;
      });

      datos.push({
        mes: mesNombre,
        ingresos: facturasMes.reduce((acc, f) => acc + f.total, 0),
        servicios: serviciosMes.length
      });
    }

    return datos;
  }, [facturas, servicios]);

  // Servicios agrupados por tipo (desde datos reales)
  const serviciosPorTipo = useMemo(() => {
    const agrupado: { [tipo: string]: { cantidad: number; valor: number } } = {};

    serviciosFiltrados.forEach(s => {
      if (!agrupado[s.tipo]) {
        agrupado[s.tipo] = { cantidad: 0, valor: 0 };
      }
      agrupado[s.tipo].cantidad += 1;
      agrupado[s.tipo].valor += s.tarifa;
    });

    return Object.entries(agrupado)
      .map(([tipo, data]) => ({ tipo, cantidad: data.cantidad, valor: data.valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [serviciosFiltrados]);

  // Distribución por clínica (desde datos reales)
  const COLORS_PIE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const distribucionClinicas = useMemo(() => {
    const agrupado: { [clinica: string]: number } = {};

    serviciosFiltrados.forEach(s => {
      agrupado[s.clinica] = (agrupado[s.clinica] || 0) + 1;
    });

    const total = serviciosFiltrados.length;
    return Object.entries(agrupado)
      .map(([nombre, cantidad], index) => ({
        nombre,
        valor: total > 0 ? Math.round((cantidad / total) * 100) : 0,
        cantidad,
        color: COLORS_PIE[index % COLORS_PIE.length]
      }))
      .sort((a, b) => b.valor - a.valor);
  }, [serviciosFiltrados]);

  // KPIs calculados desde datos reales
  const totalIngresos = useMemo(() => 
    facturasFiltradas.reduce((acc, f) => acc + f.total, 0), 
    [facturasFiltradas]
  );

  const totalServiciosPeriodo = serviciosFiltrados.length;

  // Comparar con período anterior para calcular crecimiento
  const crecimiento = useMemo(() => {
    const hoy = new Date();
    let inicioAnterior: Date;
    let finAnterior: Date;
    
    switch (periodoSeleccionado) {
      case 'semana':
        inicioAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 14);
        finAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 7);
        break;
      case 'mes':
        inicioAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 2, hoy.getDate());
        finAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
        break;
      case 'trimestre':
        inicioAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 6, 1);
        finAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 3, 1);
        break;
      case 'anio':
        inicioAnterior = new Date(hoy.getFullYear() - 2, hoy.getMonth(), hoy.getDate());
        finAnterior = new Date(hoy.getFullYear() - 1, hoy.getMonth(), hoy.getDate());
        break;
      default:
        inicioAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 2, hoy.getDate());
        finAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
    }

    const ingresosAnterior = facturas
      .filter(f => {
        const ff = new Date(f.fecha);
        return ff >= inicioAnterior && ff < finAnterior;
      })
      .reduce((acc, f) => acc + f.total, 0);

    if (ingresosAnterior === 0) return totalIngresos > 0 ? 100 : 0;
    return Math.round(((totalIngresos - ingresosAnterior) / ingresosAnterior) * 100);
  }, [facturas, facturasFiltradas, totalIngresos, periodoSeleccionado]);

  const mesesEnPeriodo = periodoSeleccionado === 'semana' ? 0.25 : periodoSeleccionado === 'mes' ? 1 : periodoSeleccionado === 'trimestre' ? 3 : 12;
  const promedioMensual = mesesEnPeriodo > 0 ? Math.round(totalIngresos / mesesEnPeriodo) : 0;
  const ticketPromedio = totalServiciosPeriodo > 0 ? Math.round(totalIngresos / totalServiciosPeriodo) : 0;

  const exportarReporte = () => {
    try {
      const periodoLabel = { semana: 'Última semana', mes: 'Último mes', trimestre: 'Último trimestre', anio: 'Último año' }[periodoSeleccionado];

      const rows: string[] = [
        `Reporte Avanzado - ${periodoLabel}`,
        `Generado: ${new Date().toLocaleDateString('es-MX')}`,
        '',
        'RESUMEN',
        `Total Ingresos,$${totalIngresos.toLocaleString()}`,
        `Total Servicios,${totalServiciosPeriodo}`,
        `Crecimiento,${crecimiento}%`,
        `Promedio Mensual,$${promedioMensual.toLocaleString()}`,
        `Ticket Promedio,$${ticketPromedio.toLocaleString()}`,
        '',
        'SERVICIOS POR TIPO',
        'Tipo,Cantidad,Valor',
        ...serviciosPorTipo.map(s => `${s.tipo},${s.cantidad},$${s.valor.toLocaleString()}`),
        '',
        'DISTRIBUCIÓN POR CLÍNICA',
        'Clínica,Cantidad,Porcentaje',
        ...distribucionClinicas.map(c => `${c.nombre},${c.cantidad},${c.valor}%`),
        '',
        'DETALLE DE SERVICIOS',
        'Fecha,Clínica,Tipo,Paciente,Especie,Estado,Tarifa',
        ...serviciosFiltrados.map(s =>
          `${s.fecha},${s.clinica},${s.tipo},${s.paciente},${s.especie},${s.estado},$${s.tarifa}`
        ),
      ];

      const csvContent = rows.join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${periodoSeleccionado}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Reporte exportado (${serviciosFiltrados.length} servicios, ${facturasFiltradas.length} facturas)`);
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      toast.error('Error al exportar el reporte');
    }
  };

  // Estado vacío
  const sinDatos = servicios.length === 0 && facturas.length === 0;

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
              Reportes & Analytics
            </h1>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Análisis detallado de tu desempeño
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Selector de periodo */}
          <select
            value={periodoSeleccionado}
            onChange={(e) => setPeriodoSeleccionado(e.target.value as any)}
            className={`px-4 py-2 rounded-lg border font-semibold transition-all ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          >
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mes</option>
            <option value="trimestre">Este Trimestre</option>
            <option value="anio">Este Año</option>
          </select>

          <button
            onClick={exportarReporte}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all"
          >
            <Download className="w-5 h-5" />
            Exportar
          </button>
        </div>
      </div>

      {/* Estado vacío */}
      {sinDatos && (
        <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="p-12 text-center">
            <FileText className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Sin datos disponibles
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Los reportes se generarán automáticamente cuando haya servicios y facturas registrados en el sistema.
            </p>
          </CardContent>
        </Card>
      )}

      {!sinDatos && (
        <>
          {/* KPIs Principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Ingresos Totales
                    </p>
                    <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${totalIngresos.toLocaleString()}
                    </p>
                    <p className={`text-xs mt-2 ${crecimiento >= 0 ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-red-400' : 'text-red-600')}`}>
                      {crecimiento >= 0 ? '+' : ''}{crecimiento}% vs período anterior
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Promedio Mensual
                    </p>
                    <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${promedioMensual.toLocaleString()}
                    </p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      En el período seleccionado
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Servicios
                    </p>
                    <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {totalServiciosPeriodo}
                    </p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {mesesEnPeriodo >= 1 ? `~${Math.round(totalServiciosPeriodo / mesesEnPeriodo)} por mes` : 'En la semana'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Ticket Promedio
                    </p>
                    <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${ticketPromedio.toLocaleString()}
                    </p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Por servicio
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Ingresos Mensuales */}
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                Evolución de Ingresos (últimos 12 meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80" style={{ minHeight: '320px' }}>
                {isMounted && (
                  <ResponsiveContainer width="100%" height={300} minWidth={200}>
                    <LineChart data={ingresosData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                      <XAxis 
                        dataKey="mes" 
                        stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                          border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                          borderRadius: '8px',
                          color: darkMode ? '#FFFFFF' : '#000000'
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === 'Ingresos ($)') return [`$${value.toLocaleString()}`, name];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="ingresos" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981', r: 6 }}
                        activeDot={{ r: 8 }}
                        name="Ingresos ($)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="servicios" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', r: 6 }}
                        name="Servicios"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gráficos de Distribución */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Servicios por Tipo */}
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Servicios por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {serviciosPorTipo.length > 0 ? (
                  <div className="h-80" style={{ minHeight: '320px' }}>
                    {isMounted && (
                      <ResponsiveContainer width="100%" height={300} minWidth={200}>
                        <BarChart data={serviciosPorTipo}>
                          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                          <XAxis 
                            dataKey="tipo" 
                            stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                            style={{ fontSize: '11px' }}
                            angle={-20}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis 
                            stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                            style={{ fontSize: '12px' }}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                              borderRadius: '8px',
                              color: darkMode ? '#FFFFFF' : '#000000'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="cantidad" fill="#8B5CF6" name="Cantidad" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                ) : (
                  <div className={`p-8 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Sin servicios en este período
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribución por Clínica */}
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Distribución por Clínica
                </CardTitle>
              </CardHeader>
              <CardContent>
                {distribucionClinicas.length > 0 ? (
                  <div className="h-80 flex items-center justify-center" style={{ minHeight: '320px' }}>
                    {isMounted && (
                      <ResponsiveContainer width="100%" height={300} minWidth={200}>
                        <PieChart>
                          <Pie
                            data={distribucionClinicas}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.nombre}: ${entry.valor}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="valor"
                          >
                            {distribucionClinicas.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                              borderRadius: '8px',
                              color: darkMode ? '#FFFFFF' : '#000000'
                            }}
                            formatter={(value: any, name: string, props: any) => 
                              [`${value}% (${props.payload.cantidad} servicios)`, props.payload.nombre]
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                ) : (
                  <div className={`p-8 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Sin datos de clínicas en este período
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Servicios */}
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Top Servicios por Valor
                </CardTitle>
                <Badge variant="outline" className={darkMode ? 'text-gray-400 border-gray-600' : ''}>
                  {serviciosPorTipo.length} tipos
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {serviciosPorTipo.length > 0 ? (
                <div className="space-y-4">
                  {serviciosPorTipo
                    .slice(0, 8)
                    .map((servicio, index) => {
                      const maxValor = serviciosPorTipo[0]?.valor || 1;
                      return (
                        <motion.div
                          key={servicio.tipo}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                            index === 1 ? 'bg-gray-400/20 text-gray-400' :
                            index === 2 ? 'bg-orange-500/20 text-orange-500' :
                            darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {servicio.tipo}
                              </p>
                              <p className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                ${servicio.valor.toLocaleString()}
                              </p>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(servicio.valor / maxValor) * 100}%` }}
                              />
                            </div>
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {servicio.cantidad} servicios realizados
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              ) : (
                <div className={`p-8 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  No hay servicios registrados en este período
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumen de solicitudes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Solicitudes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total recibidas
                    </p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {solicitudes.length}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Aceptadas
                    </p>
                    <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {solicitudes.filter(s => s.estado === 'aceptada').length}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pendientes
                    </p>
                    <p className={`text-lg font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      {solicitudes.filter(s => s.estado === 'pendiente').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Facturación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total facturas
                    </p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {facturasFiltradas.length}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pagadas
                    </p>
                    <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {facturasFiltradas.filter(f => f.estado === 'pagada').length}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pendientes de cobro
                    </p>
                    <p className={`text-lg font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      ${facturasFiltradas
                        .filter(f => f.estado !== 'pagada')
                        .reduce((acc, f) => acc + f.total, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Eficiencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Tasa de aceptación
                    </p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {solicitudes.length > 0 
                        ? Math.round((solicitudes.filter(s => s.estado === 'aceptada').length / solicitudes.length) * 100) 
                        : 0}%
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Tasa de cobro
                    </p>
                    <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {facturasFiltradas.length > 0
                        ? Math.round((facturasFiltradas.filter(f => f.estado === 'pagada').length / facturasFiltradas.length) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Servicios completados
                    </p>
                    <p className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {serviciosFiltrados.filter(s => s.estado === 'completado' || s.estado === 'facturado' || s.estado === 'pagado').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}