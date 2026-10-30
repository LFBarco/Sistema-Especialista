import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Download, Plus, X, Edit2, Trash2, Settings, Filter, FileText, Calendar, CreditCard, Receipt } from 'lucide-react';
import { useApp, Gasto } from '../App';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { ClinicaFilter, getClinicaColor } from './ClinicaFilter';
import { toast } from 'sonner';

interface CuentaPorPagar {
  id: number;
  proveedor: string;
  concepto: string;
  monto: number;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: 'pendiente' | 'pagada' | 'vencida';
  categoria: string;
  referencia?: string;
}

export function Finanzas() {
  const { facturas, servicios, gastos, setGastos, marcarComoPagada, darkMode, userClinicas, getClinicaByNombre } = useApp();
  const [tabActual, setTabActual] = useState('ingresos');
  const [mostrarNuevoGasto, setMostrarNuevoGasto] = useState(false);
  const [mostrarConfigGastos, setMostrarConfigGastos] = useState(false);
  const [mostrarNuevaCuentaPagar, setMostrarNuevaCuentaPagar] = useState(false);
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth().toString());
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString());
  const [selectedClinica, setSelectedClinica] = useState('todas');

  const [categoriasGastos, setCategoriasGastos] = useState([
    'Equipo Médico',
    'Material Médico',
    'Transporte',
    'Servicios Profesionales',
    'Administrativos',
    'Otros'
  ]);
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  const [cuentasPorPagar, setCuentasPorPagar] = useState<CuentaPorPagar[]>([]);

  const [nuevoGasto, setNuevoGasto] = useState<Partial<Gasto>>({
    fecha: new Date().toISOString().split('T')[0],
    categoria: '',
    descripcion: '',
    monto: 0,
    metodoPago: 'Efectivo'
  });

  const [nuevaCuentaPagar, setNuevaCuentaPagar] = useState<Partial<CuentaPorPagar>>({
    proveedor: '',
    concepto: '',
    monto: 0,
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: new Date().toISOString().split('T')[0],
    estado: 'pendiente',
    categoria: '',
    referencia: ''
  });

  // Cálculos
  const cuentasPorCobrar = facturas.filter(f => f.estado !== 'pagada');
  const totalPorCobrar = cuentasPorCobrar.reduce((acc, c) => acc + c.total, 0);
  const cuentasVencidas = cuentasPorCobrar.filter(f => new Date(f.vencimiento) < new Date());
  const totalVencido = cuentasVencidas.reduce((acc, c) => acc + c.total, 0);

  const cuentasPagarPendientes = cuentasPorPagar.filter(c => c.estado === 'pendiente' || c.estado === 'vencida');
  const totalPorPagar = cuentasPagarPendientes.reduce((acc, c) => acc + c.monto, 0);

  const ingresosMes = servicios
    .filter(s => {
      const fecha = new Date(s.fecha);
      const cumpleFecha = (s.estado === 'pagado' || s.estado === 'facturado') &&
             fecha.getMonth() === parseInt(filtroMes) &&
             fecha.getFullYear() === parseInt(filtroAnio);
      const cumpleClinica = selectedClinica === 'todas' || (() => {
        const clinica = getClinicaByNombre(s.clinica);
        return clinica?.id === selectedClinica;
      })();
      return cumpleFecha && cumpleClinica;
    })
    .reduce((acc, s) => acc + s.tarifa, 0);

  const gastosMes = gastos
    .filter(g => {
      const fecha = new Date(g.fecha);
      return fecha.getMonth() === parseInt(filtroMes) &&
             fecha.getFullYear() === parseInt(filtroAnio);
    })
    .reduce((acc, g) => acc + g.monto, 0);

  const utilidadMes = ingresosMes - gastosMes;

  const ingresosPorCategoria = servicios
    .filter(s => {
      const fecha = new Date(s.fecha);
      const cumpleFecha = (s.estado === 'pagado' || s.estado === 'facturado') &&
             fecha.getMonth() === parseInt(filtroMes) &&
             fecha.getFullYear() === parseInt(filtroAnio);
      const cumpleClinica = selectedClinica === 'todas' || (() => {
        const clinica = getClinicaByNombre(s.clinica);
        return clinica?.id === selectedClinica;
      })();
      return cumpleFecha && cumpleClinica;
    })
    .reduce((acc: any, s) => {
      const tipo = s.tipo || 'Otros';
      acc[tipo] = (acc[tipo] || 0) + s.tarifa;
      return acc;
    }, {});

  // Desglose por clínica
  const ingresosPorClinica = servicios
    .filter(s => {
      const fecha = new Date(s.fecha);
      return (s.estado === 'pagado' || s.estado === 'facturado') &&
             fecha.getMonth() === parseInt(filtroMes) &&
             fecha.getFullYear() === parseInt(filtroAnio);
    })
    .reduce((acc: any, s) => {
      const clinica = s.clinica || 'Sin clínica';
      acc[clinica] = (acc[clinica] || 0) + s.tarifa;
      return acc;
    }, {});

  const gastosPorCategoria = gastos
    .filter(g => {
      const fecha = new Date(g.fecha);
      return fecha.getMonth() === parseInt(filtroMes) &&
             fecha.getFullYear() === parseInt(filtroAnio);
    })
    .reduce((acc: any, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + g.monto;
      return acc;
    }, {});

  // Funciones
  const agregarGasto = () => {
    if (!nuevoGasto.categoria || !nuevoGasto.descripcion || !nuevoGasto.monto) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const gasto: Gasto = {
      id: gastos.length + 1,
      fecha: nuevoGasto.fecha || new Date().toISOString().split('T')[0],
      categoria: nuevoGasto.categoria,
      descripcion: nuevoGasto.descripcion,
      monto: nuevoGasto.monto,
      metodoPago: nuevoGasto.metodoPago || 'Efectivo',
      factura: nuevoGasto.factura
    };

    setGastos([...gastos, gasto]);
    setMostrarNuevoGasto(false);
    setNuevoGasto({
      fecha: new Date().toISOString().split('T')[0],
      categoria: '',
      descripcion: '',
      monto: 0,
      metodoPago: 'Efectivo'
    });
  };

  const eliminarGasto = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este gasto?')) {
      setGastos(gastos.filter(g => g.id !== id));
    }
  };

  const agregarCategoria = () => {
    if (nuevaCategoria && !categoriasGastos.includes(nuevaCategoria)) {
      setCategoriasGastos([...categoriasGastos, nuevaCategoria]);
      setNuevaCategoria('');
    }
  };

  const eliminarCategoria = (categoria: string) => {
    if (confirm(`¿Eliminar la categoría "${categoria}"?`)) {
      setCategoriasGastos(categoriasGastos.filter(c => c !== categoria));
    }
  };

  const agregarCuentaPorPagar = () => {
    if (!nuevaCuentaPagar.proveedor || !nuevaCuentaPagar.concepto || !nuevaCuentaPagar.monto) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const cuenta: CuentaPorPagar = {
      id: cuentasPorPagar.length + 1,
      proveedor: nuevaCuentaPagar.proveedor!,
      concepto: nuevaCuentaPagar.concepto!,
      monto: nuevaCuentaPagar.monto!,
      fechaEmision: nuevaCuentaPagar.fechaEmision || new Date().toISOString().split('T')[0],
      fechaVencimiento: nuevaCuentaPagar.fechaVencimiento || new Date().toISOString().split('T')[0],
      estado: nuevaCuentaPagar.estado || 'pendiente',
      categoria: nuevaCuentaPagar.categoria || 'Otros',
      referencia: nuevaCuentaPagar.referencia
    };

    setCuentasPorPagar([...cuentasPorPagar, cuenta]);
    setMostrarNuevaCuentaPagar(false);
    setNuevaCuentaPagar({
      proveedor: '',
      concepto: '',
      monto: 0,
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaVencimiento: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
      categoria: '',
      referencia: ''
    });
  };

  const marcarCuentaComoPagada = (id: number) => {
    setCuentasPorPagar(cuentasPorPagar.map(c =>
      c.id === id ? { ...c, estado: 'pagada' as const } : c
    ));
  };

  const eliminarCuentaPorPagar = (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta cuenta por pagar?')) {
      setCuentasPorPagar(cuentasPorPagar.filter(c => c.id !== id));
    }
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const anios = [2023, 2024, 2025];

  const exportarFinanzas = () => {
    try {
      const mesNombre = meses[parseInt(filtroMes)];
      const rows: string[] = [
        '=== REPORTE FINANCIERO ===',
        `Período: ${mesNombre} ${filtroAnio}`,
        '',
        '--- RESUMEN ---',
        `Ingresos del Mes,S/ ${ingresosMes.toLocaleString()}`,
        `Gastos del Mes,S/ ${gastosMes.toLocaleString()}`,
        `Utilidad Neta,S/ ${utilidadMes.toLocaleString()}`,
        `Cuentas por Cobrar,S/ ${totalPorCobrar.toLocaleString()}`,
        `Cuentas por Pagar,S/ ${totalPorPagar.toLocaleString()}`,
        '',
        '--- INGRESOS POR CATEGORÍA ---',
        ...Object.entries(ingresosPorCategoria).map(([tipo, monto]) => `${tipo},S/ ${(monto as number).toLocaleString()}`),
        '',
        '--- GASTOS DETALLE ---',
        'Fecha,Categoría,Descripción,Monto,Método de Pago',
        ...gastos
          .filter(g => {
            const fecha = new Date(g.fecha);
            return fecha.getMonth() === parseInt(filtroMes) && fecha.getFullYear() === parseInt(filtroAnio);
          })
          .map(g => `${g.fecha},${g.categoria},${g.descripcion},S/ ${g.monto},${g.metodoPago}`),
        '',
        '--- CUENTAS POR COBRAR ---',
        'Factura,Clínica,Total,Estado,Vencimiento',
        ...cuentasPorCobrar.map(f => `${f.numero},${f.clinica},S/ ${f.total},${f.estado},${f.vencimiento}`)
      ];

      const csvContent = rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finanzas_${mesNombre}_${filtroAnio}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Reporte financiero de ${mesNombre} ${filtroAnio} exportado`);
    } catch (error) {
      console.error('Error al exportar finanzas:', error);
      toast.error('Error al exportar el reporte financiero');
    }
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-3`}>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-3 rounded-xl">
                <DollarSign className="w-8 h-8" />
              </div>
              Finanzas
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Control financiero completo: ingresos, gastos, cuentas y balance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={exportarFinanzas}
              className={darkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : ''}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} hover:shadow-lg transition-shadow`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Ingresos del Mes</p>
                <p className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  S/ {ingresosMes.toLocaleString()}
                </p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +{servicios.filter(s => new Date(s.fecha).getMonth() === parseInt(filtroMes)).length} servicios
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} hover:shadow-lg transition-shadow`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Gastos del Mes</p>
                <p className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  S/ {gastosMes.toLocaleString()}
                </p>
                <p className={`text-sm text-rose-600`}>
                  {gastos.filter(g => new Date(g.fecha).getMonth() === parseInt(filtroMes)).length} gastos registrados
                </p>
              </div>
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-3 rounded-lg">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} hover:shadow-lg transition-shadow`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Cuentas por Cobrar</p>
                <p className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  S/ {totalPorCobrar.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {cuentasPorCobrar.length} facturas
                  </p>
                  {cuentasVencidas.length > 0 && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      {cuentasVencidas.length} vencidas
                    </Badge>
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} hover:shadow-lg transition-shadow`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Utilidad del Mes</p>
                <p className={`text-3xl ${utilidadMes >= 0 ? 'text-green-500' : 'text-red-500'} mb-2`}>
                  S/ {Math.abs(utilidadMes).toLocaleString()}
                </p>
                <p className={`text-sm ${utilidadMes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {utilidadMes >= 0 ? '✓ Ganancia' : '✗ Pérdida'}
                </p>
              </div>
              <div className={`bg-gradient-to-br ${utilidadMes >= 0 ? 'from-purple-500 to-purple-600' : 'from-gray-500 to-gray-600'} text-white p-3 rounded-lg`}>
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <div className="flex flex-col gap-4">
            {/* Filtro de Periodo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filtrar por periodo:</span>
              </div>
              <div className="flex items-center gap-3">
                <Select value={filtroMes} onValueChange={setFiltroMes}>
                  <SelectTrigger className={`w-[180px] ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((mes, index) => (
                      <SelectItem key={index} value={index.toString()}>{mes}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filtroAnio} onValueChange={setFiltroAnio}>
                  <SelectTrigger className={`w-[120px] ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {anios.map(anio => (
                      <SelectItem key={anio} value={anio.toString()}>{anio}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtro de Clínica */}
            <div>
              <label className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>Filtrar por clínica:</label>
              <ClinicaFilter
                clinicas={userClinicas}
                selectedClinica={selectedClinica}
                onSelectClinica={setSelectedClinica}
              />
            </div>
          </div>
        </Card>

        {/* Desglose por Clínica */}
        <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <h3 className={`text-xl mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Ingresos por Clínica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ingresosPorClinica)
              .sort(([, a]: any, [, b]: any) => b - a)
              .map(([nombreClinica, monto]: [string, any]) => {
                const clinica = getClinicaByNombre(nombreClinica);
                const totalIngresosSinFiltro = servicios
                  .filter(s => {
                    const fecha = new Date(s.fecha);
                    return (s.estado === 'pagado' || s.estado === 'facturado') &&
                           fecha.getMonth() === parseInt(filtroMes) &&
                           fecha.getFullYear() === parseInt(filtroAnio);
                  })
                  .reduce((acc, s) => acc + s.tarifa, 0);
                const porcentaje = totalIngresosSinFiltro > 0 ? (monto / totalIngresosSinFiltro * 100) : 0;
                
                return (
                  <div
                    key={nombreClinica}
                    className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {clinica && (
                        <div className={`w-3 h-3 rounded-full ${getClinicaColor(clinica.color)}`} />
                      )}
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{nombreClinica}</p>
                    </div>
                    <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                      S/ {monto.toLocaleString()}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
                      {porcentaje.toFixed(1)}% del total
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${clinica ? getClinicaColor(clinica.color) : 'bg-gray-400'}`}
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>

        {/* Tabs Principal */}
        <Tabs value={tabActual} onValueChange={setTabActual} className="w-full">
          <TabsList className={`grid w-full grid-cols-5 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
            <TabsTrigger value="gastos">Gastos</TabsTrigger>
            <TabsTrigger value="cobrar">Por Cobrar</TabsTrigger>
            <TabsTrigger value="pagar">Por Pagar</TabsTrigger>
            <TabsTrigger value="balance">Balance</TabsTrigger>
          </TabsList>

          {/* TAB INGRESOS */}
          <TabsContent value="ingresos" className="mt-6 space-y-6">
            {/* Resumen por Categorías */}
            <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <h3 className={`text-xl mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Ingresos por Tipo de Servicio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(ingresosPorCategoria).map(([tipo, monto]: [string, any]) => (
                  <div
                    key={tipo}
                    className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{tipo}</p>
                    <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      S/ {monto.toLocaleString()}
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                        style={{ width: `${(monto / ingresosMes) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Detalle de Ingresos */}
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Detalle de Ingresos
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Servicios realizados y facturados
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Fecha
                      </th>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Clínica
                      </th>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Servicio
                      </th>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Paciente
                      </th>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Estado
                      </th>
                      <th className={`px-6 py-3 text-right text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {servicios
                      .filter(s => {
                        const fecha = new Date(s.fecha);
                        const cumpleFecha = (s.estado === 'pagado' || s.estado === 'facturado') &&
                               fecha.getMonth() === parseInt(filtroMes) &&
                               fecha.getFullYear() === parseInt(filtroAnio);
                        const cumpleClinica = selectedClinica === 'todas' || (() => {
                          const clinica = getClinicaByNombre(s.clinica);
                          return clinica?.id === selectedClinica;
                        })();
                        return cumpleFecha && cumpleClinica;
                      })
                      .map(servicio => {
                        const clinica = getClinicaByNombre(servicio.clinica);
                        return (
                          <tr key={servicio.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {new Date(servicio.fecha).toLocaleDateString('es-ES')}
                            </td>
                            <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              <div className="flex items-center gap-2">
                                {clinica && (
                                  <div className={`w-3 h-3 rounded-full ${getClinicaColor(clinica.color)}`} />
                                )}
                                {servicio.clinica}
                              </div>
                            </td>
                            <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {servicio.tipo}
                            </td>
                            <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {servicio.paciente}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={`${servicio.estado === 'pagado' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                                {servicio.estado}
                              </Badge>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-right text-sm text-green-600`}>
                              +${servicio.tarifa.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB GASTOS */}
          <TabsContent value="gastos" className="mt-6 space-y-6">
            {/* Resumen por Categorías */}
            <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Gastos por Categoría
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarConfigGastos(true)}
                  className={darkMode ? 'bg-gray-900 border-gray-700 text-white hover:bg-gray-700' : ''}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Categorías
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(gastosPorCategoria).map(([categoria, monto]: [string, any]) => (
                  <div
                    key={categoria}
                    className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{categoria}</p>
                    <p className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      S/ {monto.toLocaleString()}
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-rose-500 to-pink-600 h-2 rounded-full"
                        style={{ width: `${(monto / gastosMes) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tabla de Gastos */}
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                <div>
                  <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Registro de Gastos
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total de gastos: S/ {gastosMes.toLocaleString()}
                  </p>
                </div>
                <Button
                  onClick={() => setMostrarNuevoGasto(true)}
                  className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Gasto
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Fecha
                      </th>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Categoría
                      </th>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Descripción
                      </th>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Método Pago
                      </th>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Referencia
                      </th>
                      <th className={`px-6 py-3 text-right text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Monto
                      </th>
                      <th className={`px-6 py-3 text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {gastos
                      .filter(g => {
                        const fecha = new Date(g.fecha);
                        return fecha.getMonth() === parseInt(filtroMes) &&
                               fecha.getFullYear() === parseInt(filtroAnio);
                      })
                      .slice().reverse()
                      .map(gasto => (
                        <tr key={gasto.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {new Date(gasto.fecha).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              {gasto.categoria}
                            </Badge>
                          </td>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {gasto.descripcion}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {gasto.metodoPago}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {gasto.factura || '-'}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-right text-sm text-rose-600`}>
                            -${gasto.monto.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarGasto(gasto.id)}
                              className={darkMode ? 'text-rose-400 hover:text-rose-300 hover:bg-gray-600' : 'text-rose-600 hover:bg-rose-50'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {gastos.filter(g => {
                const fecha = new Date(g.fecha);
                return fecha.getMonth() === parseInt(filtroMes) &&
                       fecha.getFullYear() === parseInt(filtroAnio);
              }).length === 0 && (
                <div className="text-center py-12">
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    No hay gastos registrados en este periodo
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* TAB CUENTAS POR COBRAR */}
          <TabsContent value="cobrar" className="mt-6 space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total por Cobrar</p>
                <p className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  S/ {totalPorCobrar.toLocaleString()}
                </p>
              </Card>
              <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Facturas Vencidas</p>
                <p className={`text-3xl text-red-500`}>
                  S/ {totalVencido.toLocaleString()}
                </p>
                <p className={`text-sm text-red-400`}>{cuentasVencidas.length} facturas</p>
              </Card>
              <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Facturas Pendientes</p>
                <p className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {cuentasPorCobrar.length}
                </p>
              </Card>
            </div>

            {/* Tabla de Cuentas por Cobrar */}
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Cuentas por Cobrar Pendientes
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Facturas que requieren seguimiento
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Factura
                      </th>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Clínica
                      </th>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Fecha Emisión
                      </th>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Vencimiento
                      </th>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Estado
                      </th>
                      <th className={`px-6 py-3 text-right text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Monto
                      </th>
                      <th className={`px-6 py-3 text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {cuentasPorCobrar.map(factura => {
                      const esVencida = new Date(factura.vencimiento) < new Date();
                      return (
                        <tr key={factura.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {factura.numero}
                          </td>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {factura.clinica}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(factura.fecha).toLocaleDateString('es-ES')}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {new Date(factura.vencimiento).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={esVencida 
                              ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }>
                              {esVencida ? 'Vencida' : factura.estado}
                            </Badge>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            S/ {factura.total.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <Button
                              size="sm"
                              onClick={() => marcarComoPagada(factura.id)}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Cobrado
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {cuentasPorCobrar.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className={`${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>¡Todo al día!</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No hay cuentas pendientes por cobrar
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* TAB CUENTAS POR PAGAR */}
          <TabsContent value="pagar" className="mt-6 space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total por Pagar</p>
                <p className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  S/ {totalPorPagar.toLocaleString()}
                </p>
              </Card>
              <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Cuentas Vencidas</p>
                <p className={`text-3xl text-red-500`}>
                  {cuentasPorPagar.filter(c => c.estado === 'vencida').length}
                </p>
              </Card>
              <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Cuentas Pendientes</p>
                <p className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {cuentasPagarPendientes.length}
                </p>
              </Card>
            </div>

            {/* Tabla de Cuentas por Pagar */}
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                <div>
                  <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Cuentas por Pagar
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Obligaciones con proveedores
                  </p>
                </div>
                <Button
                  onClick={() => setMostrarNuevaCuentaPagar(true)}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Cuenta
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Proveedor
                      </th>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Concepto
                      </th>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Categoría
                      </th>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Vencimiento
                      </th>
                      <th className={`px-6 py-3 text-left text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Estado
                      </th>
                      <th className={`px-6 py-3 text-right text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Monto
                      </th>
                      <th className={`px-6 py-3 text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {cuentasPorPagar.map(cuenta => {
                      const esVencida = new Date(cuenta.fechaVencimiento) < new Date() && cuenta.estado === 'pendiente';
                      return (
                        <tr key={cuenta.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {cuenta.proveedor}
                          </td>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {cuenta.concepto}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                              {cuenta.categoria}
                            </Badge>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {new Date(cuenta.fechaVencimiento).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={
                              cuenta.estado === 'pagada'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : esVencida
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }>
                              {cuenta.estado === 'pagada' ? 'Pagada' : esVencida ? 'Vencida' : 'Pendiente'}
                            </Badge>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            S/ {cuenta.monto.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              {cuenta.estado !== 'pagada' && (
                                <Button
                                  size="sm"
                                  onClick={() => marcarCuentaComoPagada(cuenta.id)}
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Pagar
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => eliminarCuentaPorPagar(cuenta.id)}
                                className={darkMode ? 'text-rose-400 hover:text-rose-300 hover:bg-gray-600' : 'text-rose-600 hover:bg-rose-50'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* TAB BALANCE */}
          <TabsContent value="balance" className="mt-6 space-y-6">
            <Card className={`p-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <h3 className={`text-2xl mb-8 ${darkMode ? 'text-white' : 'text-gray-900'} text-center`}>
                Balance General - {meses[parseInt(filtroMes)]} {filtroAnio}
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ingresos */}
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-green-500">
                    <h4 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ingresos</h4>
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="space-y-3">
                    {Object.entries(ingresosPorCategoria).map(([tipo, monto]: [string, any]) => (
                      <div key={tipo} className="flex items-center justify-between">
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{tipo}</span>
                        <span className="text-green-600">S/ {monto.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className={`flex items-center justify-between pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>Total Ingresos</span>
                      <span className="text-green-600 text-xl">S/ {ingresosMes.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Gastos */}
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-rose-500">
                    <h4 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>Gastos</h4>
                    <TrendingDown className="w-6 h-6 text-rose-500" />
                  </div>
                  <div className="space-y-3">
                    {Object.entries(gastosPorCategoria).map(([categoria, monto]: [string, any]) => (
                      <div key={categoria} className="flex items-center justify-between">
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{categoria}</span>
                        <span className="text-rose-600">-${monto.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className={`flex items-center justify-between pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>Total Gastos</span>
                      <span className="text-rose-600 text-xl">-${gastosMes.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen Final */}
              <div className={`mt-8 pt-8 border-t-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Ingresos Totales</p>
                    <p className="text-3xl text-green-600">S/ {ingresosMes.toLocaleString()}</p>
                  </div>
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Gastos Totales</p>
                    <p className="text-3xl text-rose-600">S/ {gastosMes.toLocaleString()}</p>
                  </div>
                  <div className={`p-6 rounded-xl ${utilidadMes >= 0 ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' : 'bg-gradient-to-br from-red-500/20 to-rose-500/20'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Utilidad Neta</p>
                    <p className={`text-3xl ${utilidadMes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      S/ {Math.abs(utilidadMes).toLocaleString()}
                    </p>
                    <p className={`text-sm mt-2 ${utilidadMes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {utilidadMes >= 0 ? '✓ Ganancia' : '✗ Pérdida'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cuentas por Cobrar y Pagar */}
              <div className={`mt-8 pt-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className={`text-xl mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Estado de Cuentas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Cuentas por Cobrar</span>
                      <Clock className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-2xl text-blue-600">S/ {totalPorCobrar.toLocaleString()}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      {cuentasPorCobrar.length} facturas pendientes
                    </p>
                  </div>
                  <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Cuentas por Pagar</span>
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="text-2xl text-orange-600">S/ {totalPorPagar.toLocaleString()}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      {cuentasPagarPendientes.length} cuentas pendientes
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Nuevo Gasto */}
      {mostrarNuevoGasto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>Registrar Nuevo Gasto</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrarNuevoGasto(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha *</Label>
                    <Input
                      type="date"
                      value={nuevoGasto.fecha}
                      onChange={(e) => setNuevoGasto({ ...nuevoGasto, fecha: e.target.value })}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                    />
                  </div>
                  <div>
                    <Label>Categoría *</Label>
                    <Select
                      value={nuevoGasto.categoria}
                      onValueChange={(value) => setNuevoGasto({ ...nuevoGasto, categoria: value })}
                    >
                      <SelectTrigger className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasGastos.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Descripción *</Label>
                  <Input
                    value={nuevoGasto.descripcion}
                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })}
                    placeholder="Describe el gasto..."
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Monto *</Label>
                    <Input
                      type="number"
                      value={nuevoGasto.monto}
                      onChange={(e) => setNuevoGasto({ ...nuevoGasto, monto: parseFloat(e.target.value) || 0 })}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                    />
                  </div>
                  <div>
                    <Label>Método de Pago</Label>
                    <Select
                      value={nuevoGasto.metodoPago}
                      onValueChange={(value) => setNuevoGasto({ ...nuevoGasto, metodoPago: value })}
                    >
                      <SelectTrigger className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                        <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                        <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                        <SelectItem value="Transferencia">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Número de Factura (Opcional)</Label>
                  <Input
                    value={nuevoGasto.factura || ''}
                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, factura: e.target.value })}
                    placeholder="FACT-2025-001"
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setMostrarNuevoGasto(false)}
                  className={darkMode ? 'border-gray-700 text-gray-300' : ''}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={agregarGasto}
                  className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
                >
                  Guardar Gasto
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Configuración de Categorías */}
      {mostrarConfigGastos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Configurar Categorías de Gastos
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrarConfigGastos(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    placeholder="Nueva categoría..."
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                  <Button
                    onClick={agregarCategoria}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>

                <div className="space-y-2">
                  {categoriasGastos.map(categoria => (
                    <div
                      key={categoria}
                      className={`flex items-center justify-between p-3 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{categoria}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarCategoria(categoria)}
                        className={darkMode ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setMostrarConfigGastos(false)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Nueva Cuenta por Pagar */}
      {mostrarNuevaCuentaPagar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Registrar Nueva Cuenta por Pagar
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrarNuevaCuentaPagar(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Proveedor *</Label>
                    <Input
                      value={nuevaCuentaPagar.proveedor}
                      onChange={(e) => setNuevaCuentaPagar({ ...nuevaCuentaPagar, proveedor: e.target.value })}
                      placeholder="Nombre del proveedor"
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                    />
                  </div>
                  <div>
                    <Label>Categoría *</Label>
                    <Select
                      value={nuevaCuentaPagar.categoria}
                      onValueChange={(value) => setNuevaCuentaPagar({ ...nuevaCuentaPagar, categoria: value })}
                    >
                      <SelectTrigger className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasGastos.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Concepto *</Label>
                  <Input
                    value={nuevaCuentaPagar.concepto}
                    onChange={(e) => setNuevaCuentaPagar({ ...nuevaCuentaPagar, concepto: e.target.value })}
                    placeholder="Describe el concepto..."
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Monto *</Label>
                    <Input
                      type="number"
                      value={nuevaCuentaPagar.monto}
                      onChange={(e) => setNuevaCuentaPagar({ ...nuevaCuentaPagar, monto: parseFloat(e.target.value) || 0 })}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                    />
                  </div>
                  <div>
                    <Label>Fecha Emisión</Label>
                    <Input
                      type="date"
                      value={nuevaCuentaPagar.fechaEmision}
                      onChange={(e) => setNuevaCuentaPagar({ ...nuevaCuentaPagar, fechaEmision: e.target.value })}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                    />
                  </div>
                  <div>
                    <Label>Fecha Vencimiento</Label>
                    <Input
                      type="date"
                      value={nuevaCuentaPagar.fechaVencimiento}
                      onChange={(e) => setNuevaCuentaPagar({ ...nuevaCuentaPagar, fechaVencimiento: e.target.value })}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                    />
                  </div>
                </div>

                <div>
                  <Label>Referencia (Opcional)</Label>
                  <Input
                    value={nuevaCuentaPagar.referencia}
                    onChange={(e) => setNuevaCuentaPagar({ ...nuevaCuentaPagar, referencia: e.target.value })}
                    placeholder="PO-2025-001"
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setMostrarNuevaCuentaPagar(false)}
                  className={darkMode ? 'border-gray-700 text-gray-300' : ''}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={agregarCuentaPorPagar}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                >
                  Guardar Cuenta
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
