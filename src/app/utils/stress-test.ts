// Utilidad para generar datos masivos para pruebas de stress
import type { Solicitud, Servicio, Factura, Pago, Gasto } from '../App';

const CLINICAS = [
  'Clínica Veterinaria VetPlus',
  'Hospital Animal Care',
  'Clínica Mascotas Felices',
  'VetCenter Premium',
  'Hospital Veterinario Integral',
  'Clínica Pet Health',
  'Centro Médico Animal',
  'Veterinaria La Esperanza',
  'Hospital Animalia',
  'Clínica VetExpert'
];

const TIPOS_SERVICIO = [
  'Ecocardiograma Doppler',
  'Consulta Cardiológica',
  'Electrocardiograma',
  'Holter 24 horas',
  'Ecocardiograma 3D',
  'Consulta de Seguimiento',
  'Ecocardiograma de Urgencia'
];

const ESPECIES = [
  'Canino - Labrador',
  'Canino - Golden Retriever',
  'Canino - Pastor Alemán',
  'Canino - Bulldog',
  'Felino - Persa',
  'Felino - Siamés',
  'Felino - Maine Coon',
  'Canino - Chihuahua',
  'Canino - Poodle',
  'Felino - Británico'
];

const NOMBRES_PACIENTES = [
  'Max', 'Luna', 'Rocky', 'Bella', 'Toby', 'Mimi', 'Zeus', 'Lola',
  'Simba', 'Coco', 'Duke', 'Princess', 'Bruno', 'Nala', 'Charlie',
  'Daisy', 'Rex', 'Molly', 'Thor', 'Lucy', 'Oliver', 'Sophie', 'Leo',
  'Zoe', 'Cooper', 'Chloe', 'Buddy', 'Bailey', 'Jack', 'Sadie'
];

const ESTADOS_SOLICITUD: ('pendiente' | 'aceptada' | 'rechazada')[] = ['pendiente', 'aceptada', 'rechazada'];
const URGENCIAS: ('baja' | 'media' | 'alta')[] = ['baja', 'media', 'alta'];
const ESTADOS_SERVICIO: ('confirmado' | 'completado' | 'facturado' | 'pagado' | 'cancelado')[] = 
  ['confirmado', 'completado', 'facturado', 'pagado', 'cancelado'];
const ESTADOS_FACTURA: ('borrador' | 'enviada' | 'pagada' | 'vencida')[] = 
  ['borrador', 'enviada', 'pagada', 'vencida'];

// Generar fecha aleatoria en los últimos N días
function randomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString().split('T')[0];
}

// Generar hora aleatoria
function randomTime(): string {
  const hour = Math.floor(Math.random() * 10) + 8; // 8am - 6pm
  const minute = Math.random() > 0.5 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
}

// Generar elemento aleatorio de array
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Generar tarifa aleatoria
function randomTarifa(): number {
  const tarifas = [150, 180, 200, 250, 300, 350, 400, 450, 500];
  return randomItem(tarifas);
}

// ==================== GENERADORES ====================

export function generarSolicitudesMasivas(cantidad: number): Solicitud[] {
  const solicitudes: Solicitud[] = [];

  for (let i = 0; i < cantidad; i++) {
    const clinica = randomItem(CLINICAS);
    const tipo = randomItem(TIPOS_SERVICIO);
    const paciente = randomItem(NOMBRES_PACIENTES);
    const especie = randomItem(ESPECIES);
    const urgencia = randomItem(URGENCIAS);
    const tarifa = randomTarifa();
    
    solicitudes.push({
      id: 1000000 + i,
      clinica,
      tipo,
      paciente,
      especie,
      fechaSolicitada: randomDate(60),
      horaSolicitada: randomTime(),
      urgencia,
      descripcion: `Solicitud de ${tipo.toLowerCase()} para ${paciente}. ${urgencia === 'alta' ? 'Caso urgente.' : 'Evaluación programada.'}`,
      tarifa,
      direccion: `Dirección ${i + 1}, Ciudad`,
      estado: randomItem(ESTADOS_SOLICITUD),
      fechaSolicitud: randomDate(90)
    });
  }

  return solicitudes;
}

export function generarServiciosMasivos(cantidad: number): Servicio[] {
  const servicios: Servicio[] = [];

  for (let i = 0; i < cantidad; i++) {
    const clinica = randomItem(CLINICAS);
    const tipo = randomItem(TIPOS_SERVICIO);
    const paciente = randomItem(NOMBRES_PACIENTES);
    const especie = randomItem(ESPECIES);
    const tarifa = randomTarifa();
    const estado = randomItem(ESTADOS_SERVICIO);
    
    servicios.push({
      id: 2000000 + i,
      fecha: randomDate(180),
      hora: randomTime(),
      duracion: 60,
      clinica,
      tipo,
      paciente,
      especie,
      telefono: `+57 3${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      email: `contacto${i}@${clinica.toLowerCase().replace(/\s/g, '')}.com`,
      direccion: `Dirección ${i + 1}, Ciudad`,
      estado,
      tarifa,
      facturaId: estado === 'facturado' || estado === 'pagado' ? `FAC-${String(i).padStart(6, '0')}` : undefined,
      notas: `Servicio ${tipo} realizado para ${paciente}`
    });
  }

  return servicios;
}

export function generarFacturasMasivas(cantidad: number): Factura[] {
  const facturas: Factura[] = [];

  for (let i = 0; i < cantidad; i++) {
    const clinica = randomItem(CLINICAS);
    const tipo = randomItem(TIPOS_SERVICIO);
    const paciente = randomItem(NOMBRES_PACIENTES);
    const especie = randomItem(ESPECIES);
    const tarifa = randomTarifa();
    const fecha = randomDate(365);
    const vencimiento = new Date(fecha);
    vencimiento.setDate(vencimiento.getDate() + 30);
    
    facturas.push({
      id: String(3000000 + i),
      numero: `FAC-${String(i).padStart(6, '0')}`,
      fecha,
      vencimiento: vencimiento.toISOString().split('T')[0],
      clinica,
      servicioId: 2000000 + i,
      servicios: [
        {
          descripcion: `${tipo} - ${paciente} (${especie})`,
          cantidad: 1,
          precioUnitario: tarifa
        }
      ],
      subtotal: tarifa,
      impuestos: 0,
      total: tarifa,
      estado: randomItem(ESTADOS_FACTURA)
    });
  }

  return facturas;
}

export function generarPagosMasivos(cantidad: number): Pago[] {
  const pagos: Pago[] = [];
  const metodosPago: ('transferencia' | 'cheque' | 'efectivo' | 'tarjeta')[] = 
    ['transferencia', 'cheque', 'efectivo', 'tarjeta'];

  for (let i = 0; i < cantidad; i++) {
    const clinica = randomItem(CLINICAS);
    const monto = randomTarifa();
    const fecha = randomDate(180);
    
    pagos.push({
      id: 4000000 + i,
      facturaId: String(3000000 + i),
      clinica,
      monto,
      fecha,
      metodoPago: randomItem(metodosPago),
      referencia: `REF-${fecha.replace(/-/g, '')}-${String(i).padStart(4, '0')}`,
      estado: Math.random() > 0.2 ? 'verificado' : 'pendiente',
      fechaRegistro: fecha,
      registradoPor: Math.random() > 0.5 ? 'clinica' : 'especialista',
      notas: Math.random() > 0.7 ? 'Pago verificado correctamente' : undefined
    });
  }

  return pagos;
}

export function generarGastosMasivos(cantidad: number): Gasto[] {
  const gastos: Gasto[] = [];
  const categorias = [
    'Equipo Médico',
    'Transporte',
    'Material Médico',
    'Servicios Profesionales',
    'Mantenimiento',
    'Capacitación',
    'Software',
    'Seguros'
  ];

  for (let i = 0; i < cantidad; i++) {
    const categoria = randomItem(categorias);
    const monto = Math.floor(Math.random() * 1000) + 50;
    
    gastos.push({
      id: 5000000 + i,
      fecha: randomDate(365),
      categoria,
      descripcion: `Gasto de ${categoria.toLowerCase()} #${i + 1}`,
      monto,
      metodoPago: randomItem(['Tarjeta de Crédito', 'Efectivo', 'Transferencia', 'Tarjeta de Débito']),
      factura: Math.random() > 0.5 ? `FACT-2025-${String(i).padStart(4, '0')}` : undefined
    });
  }

  return gastos;
}

// ==================== GENERADOR COMPLETO ====================

export interface DatasetMasivo {
  solicitudes: Solicitud[];
  servicios: Servicio[];
  facturas: Factura[];
  pagos: Pago[];
  gastos: Gasto[];
  stats: {
    totalRegistros: number;
    tiempoGeneracion: number;
    memoriaEstimada: string;
  };
}

export function generarDatasetCompleto(
  solicitudesCantidad: number = 1000,
  serviciosCantidad: number = 5000,
  facturasCantidad: number = 3000,
  pagosCantidad: number = 2000,
  gastosCantidad: number = 1000
): DatasetMasivo {
  const startTime = performance.now();

  console.log('🔄 Generando dataset masivo para stress test...');
  
  const solicitudes = generarSolicitudesMasivas(solicitudesCantidad);
  console.log(`✅ ${solicitudesCantidad} solicitudes generadas`);
  
  const servicios = generarServiciosMasivos(serviciosCantidad);
  console.log(`✅ ${serviciosCantidad} servicios generados`);
  
  const facturas = generarFacturasMasivas(facturasCantidad);
  console.log(`✅ ${facturasCantidad} facturas generadas`);
  
  const pagos = generarPagosMasivos(pagosCantidad);
  console.log(`✅ ${pagosCantidad} pagos generados`);
  
  const gastos = generarGastosMasivos(gastosCantidad);
  console.log(`✅ ${gastosCantidad} gastos generados`);

  const endTime = performance.now();
  const tiempoGeneracion = Math.round(endTime - startTime);
  
  const totalRegistros = solicitudesCantidad + serviciosCantidad + facturasCantidad + pagosCantidad + gastosCantidad;
  
  // Estimar memoria (muy aproximado)
  const memoriaEstimadaBytes = totalRegistros * 500; // ~500 bytes por registro
  const memoriaEstimadaMB = (memoriaEstimadaBytes / 1024 / 1024).toFixed(2);

  console.log(`🎉 Dataset completo generado en ${tiempoGeneracion}ms`);
  console.log(`📊 Total de registros: ${totalRegistros.toLocaleString()}`);
  console.log(`💾 Memoria estimada: ${memoriaEstimadaMB} MB`);

  return {
    solicitudes,
    servicios,
    facturas,
    pagos,
    gastos,
    stats: {
      totalRegistros,
      tiempoGeneracion,
      memoriaEstimada: `${memoriaEstimadaMB} MB`
    }
  };
}

// ==================== PRESETS DE STRESS TEST ====================

export const STRESS_TEST_PRESETS = {
  // Pequeño - Para desarrollo
  small: () => generarDatasetCompleto(100, 500, 300, 200, 100),
  
  // Mediano - Caso típico de uso
  medium: () => generarDatasetCompleto(500, 2000, 1500, 1000, 500),
  
  // Grande - Clínica muy activa
  large: () => generarDatasetCompleto(1000, 5000, 3000, 2000, 1000),
  
  // Extra Grande - Stress test extremo
  xlarge: () => generarDatasetCompleto(2000, 10000, 6000, 4000, 2000),
  
  // Mega - Prueba límites del sistema
  mega: () => generarDatasetCompleto(5000, 20000, 15000, 10000, 5000)
};

// ==================== FUNCIÓN DE BENCHMARK ====================

export function runPerformanceBenchmark(testName: string, fn: () => void, iterations: number = 100) {
  const times: number[] = [];
  
  console.log(`\n🧪 Ejecutando benchmark: ${testName}`);
  console.log(`📊 Iteraciones: ${iterations}`);
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
  
  console.log(`⏱️  Promedio: ${avg.toFixed(2)}ms`);
  console.log(`⚡ Mínimo: ${min.toFixed(2)}ms`);
  console.log(`🐌 Máximo: ${max.toFixed(2)}ms`);
  console.log(`📊 Mediana: ${median.toFixed(2)}ms`);
  
  return { avg, min, max, median };
}

// ==================== MONITOREO DE MEMORIA ====================

export function getMemoryUsage() {
  if (performance && (performance as any).memory) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      totalJSHeapSize: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      percentage: `${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)}%`
    };
  }
  
  return {
    usedJSHeapSize: 'N/A',
    totalJSHeapSize: 'N/A',
    jsHeapSizeLimit: 'N/A',
    percentage: 'N/A'
  };
}

export function logMemoryUsage(label: string) {
  const usage = getMemoryUsage();
  console.log(`\n💾 Uso de memoria - ${label}:`);
  console.log(`   Usado: ${usage.usedJSHeapSize}`);
  console.log(`   Total: ${usage.totalJSHeapSize}`);
  console.log(`   Límite: ${usage.jsHeapSizeLimit}`);
  console.log(`   Porcentaje: ${usage.percentage}`);
}
