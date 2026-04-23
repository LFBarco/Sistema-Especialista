import { useState } from 'react';
import { useApp } from '../App';
import { Activity, Zap, Database, TrendingUp, AlertTriangle, CheckCircle, Play, RotateCcw } from 'lucide-react';
import { 
  generarDatasetCompleto, 
  STRESS_TEST_PRESETS, 
  getMemoryUsage, 
  logMemoryUsage,
  runPerformanceBenchmark 
} from '../utils/stress-test';
import { motion } from 'motion/react';
import { toast } from 'sonner';

type PresetSize = 'small' | 'medium' | 'large' | 'xlarge' | 'mega';

export function StressTestPanel() {
  const { darkMode, setSolicitudes, setServicios, setFacturas } = useApp();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [memoryBefore, setMemoryBefore] = useState<any>(null);
  const [memoryAfter, setMemoryAfter] = useState<any>(null);

  const presets = [
    { 
      id: 'small', 
      name: 'Pequeño', 
      desc: '1,200 registros',
      color: '#10B981',
      icon: CheckCircle
    },
    { 
      id: 'medium', 
      name: 'Mediano', 
      desc: '5,500 registros',
      color: '#3B82F6',
      icon: Activity
    },
    { 
      id: 'large', 
      name: 'Grande', 
      desc: '12,000 registros',
      color: '#F59E0B',
      icon: Zap
    },
    { 
      id: 'xlarge', 
      name: 'Extra Grande', 
      desc: '24,000 registros',
      color: '#EF4444',
      icon: TrendingUp
    },
    { 
      id: 'mega', 
      name: 'MEGA', 
      desc: '55,000 registros',
      color: '#9333EA',
      icon: AlertTriangle
    }
  ];

  const runStressTest = async (preset: PresetSize) => {
    setIsRunning(true);
    toast.info(`🧪 Iniciando stress test: ${preset.toUpperCase()}`);

    try {
      // Medir memoria inicial
      const memBefore = getMemoryUsage();
      setMemoryBefore(memBefore);
      logMemoryUsage('Antes del test');

      // Generar datos masivos
      const startGeneration = performance.now();
      const dataset = STRESS_TEST_PRESETS[preset]();
      const endGeneration = performance.now();
      const generationTime = Math.round(endGeneration - startGeneration);

      console.log('\n🎯 Dataset generado:');
      console.log(`   Solicitudes: ${dataset.solicitudes.length.toLocaleString()}`);
      console.log(`   Servicios: ${dataset.servicios.length.toLocaleString()}`);
      console.log(`   Facturas: ${dataset.facturas.length.toLocaleString()}`);
      console.log(`   Pagos: ${dataset.pagos.length.toLocaleString()}`);
      console.log(`   Gastos: ${dataset.gastos.length.toLocaleString()}`);

      // Medir tiempo de renderizado
      const startRender = performance.now();
      
      setSolicitudes(dataset.solicitudes);
      setServicios(dataset.servicios);
      setFacturas(dataset.facturas);
      
      // Forzar un re-render y esperar
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const endRender = performance.now();
      const renderTime = Math.round(endRender - startRender);

      // Benchmark de filtros
      console.log('\n🔍 Benchmarking filtros...');
      const filterBenchmark = runPerformanceBenchmark(
        'Filtrar solicitudes pendientes',
        () => {
          dataset.solicitudes.filter(s => s.estado === 'pendiente');
        },
        50
      );

      const searchBenchmark = runPerformanceBenchmark(
        'Buscar por texto',
        () => {
          dataset.solicitudes.filter(s => 
            s.paciente.toLowerCase().includes('max') ||
            s.clinica.toLowerCase().includes('vet')
          );
        },
        50
      );

      const sortBenchmark = runPerformanceBenchmark(
        'Ordenar por fecha',
        () => {
          [...dataset.solicitudes].sort((a, b) => 
            new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()
          );
        },
        50
      );

      // Medir memoria final
      const memAfter = getMemoryUsage();
      setMemoryAfter(memAfter);
      logMemoryUsage('Después del test');

      // Calcular incremento de memoria
      const memIncreaseMB = memAfter.usedJSHeapSize !== 'N/A' && memBefore.usedJSHeapSize !== 'N/A'
        ? (parseFloat(memAfter.usedJSHeapSize) - parseFloat(memBefore.usedJSHeapSize)).toFixed(2)
        : 'N/A';

      const testResults = {
        preset,
        totalRegistros: dataset.stats.totalRegistros,
        generationTime,
        renderTime,
        filterTime: filterBenchmark.avg.toFixed(2),
        searchTime: searchBenchmark.avg.toFixed(2),
        sortTime: sortBenchmark.avg.toFixed(2),
        memoryIncrease: memIncreaseMB,
        memoryEstimated: dataset.stats.memoriaEstimada
      };

      setResults(testResults);

      console.log('\n✅ STRESS TEST COMPLETADO');
      console.log('════════════════════════════════════════');
      console.log(`📊 Registros totales: ${testResults.totalRegistros.toLocaleString()}`);
      console.log(`⚡ Tiempo de generación: ${testResults.generationTime}ms`);
      console.log(`🎨 Tiempo de renderizado: ${testResults.renderTime}ms`);
      console.log(`🔍 Filtro promedio: ${testResults.filterTime}ms`);
      console.log(`🔎 Búsqueda promedio: ${testResults.searchTime}ms`);
      console.log(`📈 Ordenamiento promedio: ${testResults.sortTime}ms`);
      console.log(`💾 Incremento de memoria: ${testResults.memoryIncrease} MB`);
      console.log('════════════════════════════════════════\n');

      toast.success(`✅ Stress test completado: ${testResults.totalRegistros.toLocaleString()} registros`);

      // Analizar resultados
      analyzePerformance(testResults);

    } catch (error) {
      console.error('❌ Error en stress test:', error);
      toast.error('Error ejecutando stress test');
    } finally {
      setIsRunning(false);
    }
  };

  const analyzePerformance = (results: any) => {
    const warnings: string[] = [];

    if (results.renderTime > 1000) {
      warnings.push('⚠️ Tiempo de renderizado alto (>1s). Considerar virtualización.');
    }

    if (results.filterTime > 50) {
      warnings.push('⚠️ Filtros lentos (>50ms). Considerar useMemo.');
    }

    if (results.searchTime > 100) {
      warnings.push('⚠️ Búsqueda lenta (>100ms). Considerar índices o debounce.');
    }

    if (results.sortTime > 100) {
      warnings.push('⚠️ Ordenamiento lento (>100ms). Considerar cache.');
    }

    if (parseFloat(results.memoryIncrease) > 100) {
      warnings.push('⚠️ Alto consumo de memoria (>100MB). Revisar memory leaks.');
    }

    if (warnings.length > 0) {
      console.log('\n⚠️ ADVERTENCIAS DE PERFORMANCE:');
      warnings.forEach(w => console.log(w));
      warnings.forEach(w => toast.warning(w.replace('⚠️ ', '')));
    } else {
      console.log('\n✅ Rendimiento óptimo. No se detectaron problemas.');
      toast.success('✅ Rendimiento óptimo');
    }
  };

  const resetData = () => {
    setSolicitudes([]);
    setServicios([]);
    setFacturas([]);
    setResults(null);
    setMemoryBefore(null);
    setMemoryAfter(null);
    toast.info('Datos reseteados');
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🧪 Stress Test & Performance
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Prueba el sistema con datos masivos y analiza el rendimiento
          </p>
        </div>
        <button
          onClick={resetData}
          disabled={isRunning}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
            isRunning
              ? 'opacity-50 cursor-not-allowed bg-gray-500'
              : darkMode
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {presets.map((preset) => (
          <motion.button
            key={preset.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => runStressTest(preset.id as PresetSize)}
            disabled={isRunning}
            className={`p-6 rounded-2xl border-2 text-left transition-all ${
              darkMode
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                : 'bg-white border-gray-200 hover:border-gray-300'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${preset.color}20` }}
              >
                <preset.icon className="w-6 h-6" style={{ color: preset.color }} />
              </div>
              <Play className="w-5 h-5" style={{ color: preset.color }} />
            </div>
            <h3 className={`font-black text-lg mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {preset.name}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {preset.desc}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Resultados */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border-2 p-6 ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
            >
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Resultados del Test
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Preset: {results.preset.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Registros */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-blue-500" />
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Registros Totales
                </span>
              </div>
              <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {results.totalRegistros.toLocaleString()}
              </p>
            </div>

            {/* Tiempo Generación */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Generación
                </span>
              </div>
              <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {results.generationTime}ms
              </p>
            </div>

            {/* Tiempo Renderizado */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-green-500" />
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Renderizado
                </span>
              </div>
              <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {results.renderTime}ms
              </p>
            </div>

            {/* Memoria */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Incremento RAM
                </span>
              </div>
              <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {results.memoryIncrease} MB
              </p>
            </div>
          </div>

          {/* Benchmarks detallados */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                🔍 Filtrado
              </p>
              <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {results.filterTime}ms
              </p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                🔎 Búsqueda
              </p>
              <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {results.searchTime}ms
              </p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                📈 Ordenamiento
              </p>
              <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {results.sortTime}ms
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Información de memoria */}
      {memoryBefore && memoryAfter && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-6 rounded-xl border-2 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💾 Memoria Antes
            </h3>
            <div className="space-y-2">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Usada: <span className="font-bold">{memoryBefore.usedJSHeapSize}</span>
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total: <span className="font-bold">{memoryBefore.totalJSHeapSize}</span>
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Porcentaje: <span className="font-bold">{memoryBefore.percentage}</span>
              </p>
            </div>
          </div>

          <div className={`p-6 rounded-xl border-2 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💾 Memoria Después
            </h3>
            <div className="space-y-2">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Usada: <span className="font-bold">{memoryAfter.usedJSHeapSize}</span>
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total: <span className="font-bold">{memoryAfter.totalJSHeapSize}</span>
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Porcentaje: <span className="font-bold">{memoryAfter.percentage}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-8 rounded-2xl border-2 text-center ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Ejecutando stress test...
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Generando datos, renderizando y midiendo performance
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
