import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useApp } from '../App';
import { TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect, useMemo } from 'react';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function RevenueChart() {
  const { darkMode, servicios } = useApp();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calcular datos de ingresos a partir de los servicios reales
  const data = useMemo(() => {
    if (!servicios || servicios.length === 0) {
      return [];
    }

    const monthlyData: { [key: string]: { ingresos: number; servicios: number; sortKey: string } } = {};

    servicios.forEach(servicio => {
      if (!servicio.fecha) return;
      const date = new Date(servicio.fecha);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${String(month).padStart(2, '0')}`;
      
      if (!monthlyData[key]) {
        monthlyData[key] = { ingresos: 0, servicios: 0, sortKey: key };
      }
      
      monthlyData[key].ingresos += servicio.tarifa || 0;
      monthlyData[key].servicios += 1;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Ultimos 6 meses
      .map(([key, val]) => ({
        mes: MONTH_NAMES[parseInt(key.split('-')[1])],
        ingresos: val.ingresos,
        servicios: val.servicios,
      }));
  }, [servicios]);

  const currentMonth = data.length > 0 ? data[data.length - 1] : { mes: '-', ingresos: 0, servicios: 0 };
  const previousMonth = data.length > 1 ? data[data.length - 2] : { mes: '-', ingresos: 0, servicios: 0 };
  const growth = previousMonth.ingresos > 0
    ? Math.round(((currentMonth.ingresos - previousMonth.ingresos) / previousMonth.ingresos) * 100)
    : 0;
  
  return (
    <div 
      className="rounded-xl border p-6 transition-all duration-200 hover:shadow-xl group"
      style={{
        backgroundColor: darkMode ? '#111827' : '#FFFFFF',
        borderColor: darkMode ? '#1F2937' : '#E2E8F0',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 
              className="text-lg font-bold"
              style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
            >
              Evolucion de Ingresos
            </h2>
            {data.length > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: growth >= 0 
                    ? darkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)'
                    : darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                }}
              >
                <TrendingUp 
                  className="w-3 h-3" 
                  style={{ color: growth >= 0 ? '#22C55E' : '#EF4444' }} 
                />
                <span 
                  className="text-xs font-semibold"
                  style={{ color: growth >= 0 ? '#22C55E' : '#EF4444' }}
                >
                  {growth > 0 ? '+' : ''}{growth}%
                </span>
              </motion.div>
            )}
          </div>
          <p 
            className="text-sm"
            style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
          >
            {data.length > 0 ? `Ultimos ${data.length} meses` : 'Sin datos de servicios'}
          </p>
        </div>

        <div 
          className="px-4 py-2 rounded-lg border"
          style={{
            backgroundColor: darkMode ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.05)',
            borderColor: darkMode ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.15)',
          }}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <DollarSign className="w-4 h-4" style={{ color: '#F97316' }} />
            <span 
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
            >
              {currentMonth.mes}
            </span>
          </div>
          <p 
            className="text-xl font-bold"
            style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
          >
            S/ {currentMonth.ingresos.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ minHeight: '300px' }}>
        {isMounted && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300} minWidth={200} minHeight={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={darkMode ? '#374151' : '#E2E8F0'}
                vertical={false}
              />
              <XAxis 
                dataKey="mes" 
                stroke={darkMode ? '#6B7280' : '#94A3B8'}
                style={{ fontSize: '12px', fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: darkMode ? '#374151' : '#E2E8F0' }}
              />
              <YAxis 
                stroke={darkMode ? '#6B7280' : '#94A3B8'}
                style={{ fontSize: '12px', fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: darkMode ? '#374151' : '#E2E8F0' }}
                tickFormatter={(value) => `S/ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#374151' : '#E2E8F0'}`,
                  borderRadius: '12px',
                  boxShadow: darkMode 
                    ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '12px',
                }}
                labelStyle={{
                  color: darkMode ? '#E5E7EB' : '#0F172A',
                  fontWeight: 600,
                  marginBottom: '8px',
                  fontSize: '14px'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'ingresos') return [`S/ ${value.toLocaleString()}`, 'Ingresos'];
                  return [value, name === 'servicios' ? 'Servicios' : name];
                }}
                cursor={{ stroke: '#F97316', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke="#F97316"
                strokeWidth={3}
                fill="url(#colorIngresos)"
                dot={{ fill: '#F97316', r: 4, strokeWidth: 2, stroke: darkMode ? '#111827' : '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#F97316', strokeWidth: 2, stroke: darkMode ? '#111827' : '#FFFFFF' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px]" style={{ color: darkMode ? '#6B7280' : '#94A3B8' }}>
            <p className="text-sm">No hay datos de servicios para mostrar</p>
          </div>
        )}
      </div>

      {/* Footer con insights */}
      <div 
        className="mt-6 pt-4 border-t flex items-center justify-between"
        style={{ borderColor: darkMode ? '#1F2937' : '#E2E8F0' }}
      >
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}>
              Promedio mensual
            </p>
            <p className="text-base font-bold" style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}>
              S/ {data.length > 0 ? Math.round(data.reduce((acc, d) => acc + d.ingresos, 0) / data.length).toLocaleString() : '0'}
            </p>
          </div>
          <div className="w-px h-10" style={{ backgroundColor: darkMode ? '#1F2937' : '#E2E8F0' }} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}>
              Total periodo
            </p>
            <p className="text-base font-bold" style={{ color: darkMode ? '#E5E7EB' : '#0F172A' }}>
              S/ {data.reduce((acc, d) => acc + d.ingresos, 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div 
          className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{
            backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(248, 250, 252, 0.8)',
            color: darkMode ? '#9CA3AF' : '#64748B'
          }}
        >
          Datos en tiempo real
        </div>
      </div>
    </div>
  );
}
