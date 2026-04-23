import * as API from '../api';
import { toast } from 'sonner';

/**
 * Sistema de Polling como alternativa a Supabase Realtime
 * Refresca datos cada N segundos para sincronización automática
 * 
 * Resilient: soporta errores transitorios de red sin spam de errores.
 * Usa backoff progresivo cuando el servidor no responde.
 */

export interface PollingCallbacks {
  onPagosChange: (pagos: any[]) => void;
  onFacturasChange: (facturas: any[]) => void;
  onServiciosChange: (servicios: any[]) => void;
  onSolicitudesChange: (solicitudes: any[]) => void;
}

// Almacenar hashes para detectar cambios
let lastPagosHash = '';
let lastFacturasHash = '';
let lastServiciosHash = '';
let lastSolicitudesHash = '';
let isFirstLoad = true;
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 3;
let stopped = false;

/**
 * Genera un hash simple de un array para detectar cambios
 */
function generateHash(data: any[]): string {
  return JSON.stringify(data.map(item => ({
    id: item.id,
    updated: item.updatedAt || item.fecha || item.estado
  })));
}

/**
 * Inicia el sistema de polling
 * @param callbacks - Funciones para actualizar estado
 * @param interval - Intervalo en milisegundos (default: 10000ms = 10s)
 * @returns Función de cleanup para detener el polling
 */
export function startPolling(
  callbacks: PollingCallbacks,
  interval: number = 10000
) {
  console.log(`✅ Sincronización automática activa (intervalo: ${interval / 1000}s)`);
  stopped = false;
  consecutiveErrors = 0;

  const pollData = async () => {
    if (stopped) return;

    try {
      // Fetch todos los datos en paralelo
      const [pagos, facturas, servicios, solicitudes] = await Promise.all([
        API.pagosAPI.getAll(),
        API.facturasAPI.getAll(),
        API.serviciosAPI.getAll(),
        API.solicitudesAPI.getAll()
      ]);

      // Reset error counter on success
      consecutiveErrors = 0;

      // Generar hashes para detectar cambios
      const pagosHash = generateHash(pagos);
      const facturasHash = generateHash(facturas);
      const serviciosHash = generateHash(servicios);
      const solicitudesHash = generateHash(solicitudes);

      // Detectar cambios y actualizar (solo después de la primera carga)
      if (!isFirstLoad) {
        if (pagosHash !== lastPagosHash && lastPagosHash !== '') {
          console.log('💰 Cambio detectado en Pagos');
          callbacks.onPagosChange(pagos);
          toast.info('💰 Datos de pagos actualizados', {
            description: 'Se han detectado cambios en los pagos'
          });
        }

        if (facturasHash !== lastFacturasHash && lastFacturasHash !== '') {
          console.log('📄 Cambio detectado en Facturas');
          callbacks.onFacturasChange(facturas);
          toast.info('📄 Facturas actualizadas', {
            description: 'Se han detectado cambios en las facturas'
          });
        }

        if (serviciosHash !== lastServiciosHash && lastServiciosHash !== '') {
          console.log('🏥 Cambio detectado en Servicios');
          callbacks.onServiciosChange(servicios);
          toast.info('🏥 Servicios actualizados', {
            description: 'Se han detectado cambios en los servicios'
          });
        }

        if (solicitudesHash !== lastSolicitudesHash && lastSolicitudesHash !== '') {
          console.log('📋 Cambio detectado en Solicitudes');
          callbacks.onSolicitudesChange(solicitudes);
          toast.info('📋 Solicitudes actualizadas', {
            description: 'Se han detectado cambios en las solicitudes'
          });
        }
      }

      // Actualizar hashes
      lastPagosHash = pagosHash;
      lastFacturasHash = facturasHash;
      lastServiciosHash = serviciosHash;
      lastSolicitudesHash = solicitudesHash;

      // Si es la primera carga, actualizar sin notificar
      if (isFirstLoad) {
        callbacks.onPagosChange(pagos);
        callbacks.onFacturasChange(facturas);
        callbacks.onServiciosChange(servicios);
        callbacks.onSolicitudesChange(solicitudes);
        isFirstLoad = false;
      }

    } catch (error: any) {
      // Ignorar errores de componente desmontado
      if (error?.name === 'AbortError' || stopped) return;

      consecutiveErrors++;

      // Solo loguear en el primer fallo, no spamear en cada ciclo
      if (consecutiveErrors === 1) {
        console.warn('⚠️ Polling: error transitorio de red, reintentando...', error?.message || error);
      }

      // Después de demasiados fallos consecutivos, notificar UNA vez
      if (consecutiveErrors === MAX_CONSECUTIVE_ERRORS) {
        console.error('❌ Polling: múltiples fallos de red consecutivos. Reduciendo frecuencia.');
      }
    }
  };

  // Demorar el primer poll 2s para no colisionar con loadData()
  const initialDelay = setTimeout(() => {
    if (!stopped) pollData();
  }, 2000);

  // Configurar intervalo con backoff: si hay errores, esperar más
  let intervalId: ReturnType<typeof setInterval>;

  const scheduleNext = () => {
    const effectiveInterval = consecutiveErrors >= MAX_CONSECUTIVE_ERRORS
      ? interval * 3 // Triplicar intervalo si hay errores continuos
      : interval;

    intervalId = setInterval(async () => {
      await pollData();
      // Si el intervalo cambió por errores/recuperación, re-programar
      const newEffective = consecutiveErrors >= MAX_CONSECUTIVE_ERRORS ? interval * 3 : interval;
      if (newEffective !== effectiveInterval) {
        clearInterval(intervalId);
        scheduleNext();
      }
    }, effectiveInterval);
  };

  scheduleNext();

  // Retornar función de cleanup
  return () => {
    console.log('🔌 Deteniendo polling...');
    stopped = true;
    clearTimeout(initialDelay);
    clearInterval(intervalId);
    // Reset hashes
    lastPagosHash = '';
    lastFacturasHash = '';
    lastServiciosHash = '';
    lastSolicitudesHash = '';
    isFirstLoad = true;
    consecutiveErrors = 0;
  };
}

/**
 * Verifica el estado del polling
 */
export function getPollingStatus() {
  return {
    isActive: lastPagosHash !== '' && !stopped,
    consecutiveErrors,
    lastUpdate: new Date().toISOString()
  };
}