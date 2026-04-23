import { supabase } from './client';
import { toast } from 'sonner';
import * as API from '../api';
import { startPolling } from './polling';

/**
 * Configuración de Supabase Realtime para sincronización automática
 * Este módulo escucha cambios en las tablas de Supabase y actualiza el estado local
 * 
 * FILTROS: Las keys en kv_store_91d1f360 usan el formato "recurso:id"
 * (e.g., "pagos:123", "facturas:abc-def", "servicios:456", "solicitudes:789")
 * Los filtros LIKE usan "recurso:%" para capturar todos los registros del recurso.
 * 
 * FALLBACK: Si Realtime no está habilitado, usa Polling automáticamente
 */

export interface RealtimeCallbacks {
  onPagosChange: (pagos: any[], event?: any) => void;
  onFacturasChange: (facturas: any[], event?: any) => void;
  onServiciosChange: (servicios: any[], event?: any) => void;
  onSolicitudesChange: (solicitudes: any[], event?: any) => void;
}

let isUsingRealtime = false;
let isUsingPolling = false;

// Callback para notificar cuando Realtime se activa correctamente
let onRealtimeActiveCallback: (() => void) | null = null;

export function setRealtimeActiveCallback(callback: () => void) {
  onRealtimeActiveCallback = callback;
}

export function getRealtimeMode(): 'realtime' | 'polling' | 'disconnected' {
  if (isUsingRealtime) return 'realtime';
  if (isUsingPolling) return 'polling';
  return 'disconnected';
}

/**
 * Inicializa las subscripciones de Supabase Realtime
 * Si falla, automáticamente cambia a Polling
 * @param callbacks - Funciones callback para actualizar el estado local
 * @returns Función de cleanup para desuscribirse
 */
export function setupRealtimeSubscriptions(callbacks: RealtimeCallbacks) {
  console.log('🔄 Iniciando sistema de sincronización...');

  let cleanupPolling: (() => void) | null = null;
  let hasReceivedEvent = false;
  
  // Timeout reducido para cambiar rápidamente a Polling sin alarmar
  const realtimeTimeout = setTimeout(() => {
    if (!hasReceivedEvent && !isUsingPolling) {
      console.log('🔄 Usando modo Polling para sincronización automática');
      
      // Limpiar canales de Realtime silenciosamente
      supabase.removeAllChannels();
      
      // Iniciar Polling como fallback (intervalo 10s para evitar congestión)
      cleanupPolling = startPolling(callbacks, 10000);
      isUsingPolling = true;
      isUsingRealtime = false;
    }
  }, 5000); // 5 segundos para dar tiempo a loadData de completar

  // ============================================
  // Canal para PAGOS
  // Filtro: key LIKE 'pagos:%' (formato del servidor: pagos:id)
  // ============================================
  const pagosChannel = supabase
    .channel('pagos-changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'kv_store_91d1f360',
        filter: 'key=like.pagos:%'
      },
      async (payload) => {
        console.log('💰 Cambio detectado en Pagos:', payload);
        
        try {
          const pagosActualizados = await API.pagosAPI.getAll();
          callbacks.onPagosChange(pagosActualizados, payload);
          // Toast notifications moved to App.tsx for context awareness
        } catch (error) {
          console.error('Error recargando pagos desde Realtime:', error);
        }
        
        hasReceivedEvent = true;
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Canal de Pagos: Subscrito correctamente (filtro: pagos:%)');
        isUsingRealtime = true;
        if (onRealtimeActiveCallback) {
          onRealtimeActiveCallback();
        }
      } else if (status === 'CHANNEL_ERROR') {
        // Silently fail - polling will take over
        console.log('⚠️ Canal de Pagos: No disponible, usando fallback');
      }
    });

  // ============================================
  // Canal para FACTURAS
  // Filtro: key LIKE 'facturas:%' (formato del servidor: facturas:id)
  // ============================================
  const facturasChannel = supabase
    .channel('facturas-changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'kv_store_91d1f360',
        filter: 'key=like.facturas:%'
      },
      async (payload) => {
        console.log('📄 Cambio detectado en Facturas:', payload);
        
        try {
          const facturasActualizadas = await API.facturasAPI.getAll();
          callbacks.onFacturasChange(facturasActualizadas, payload);
        } catch (error) {
          console.error('Error recargando facturas desde Realtime:', error);
        }
        
        hasReceivedEvent = true;
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Canal de Facturas: Subscrito correctamente (filtro: facturas:%)');
        isUsingRealtime = true;
        if (onRealtimeActiveCallback) {
          onRealtimeActiveCallback();
        }
      }
    });

  // ============================================
  // Canal para SERVICIOS
  // Filtro: key LIKE 'servicios:%' (formato del servidor: servicios:id)
  // ============================================
  const serviciosChannel = supabase
    .channel('servicios-changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'kv_store_91d1f360',
        filter: 'key=like.servicios:%'
      },
      async (payload) => {
        console.log('🏥 Cambio detectado en Servicios:', payload);
        
        try {
          const serviciosActualizados = await API.serviciosAPI.getAll();
          callbacks.onServiciosChange(serviciosActualizados, payload);
        } catch (error) {
          console.error('Error recargando servicios desde Realtime:', error);
        }
        
        hasReceivedEvent = true;
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Canal de Servicios: Subscrito correctamente (filtro: servicios:%)');
        isUsingRealtime = true;
        if (onRealtimeActiveCallback) {
          onRealtimeActiveCallback();
        }
      }
    });

  // ============================================
  // Canal para SOLICITUDES
  // Filtro: key LIKE 'solicitudes:%' (formato del servidor: solicitudes:id)
  // ============================================
  const solicitudesChannel = supabase
    .channel('solicitudes-changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'kv_store_91d1f360',
        filter: 'key=like.solicitudes:%'
      },
      async (payload) => {
        console.log('📋 Cambio detectado en Solicitudes:', payload);
        
        try {
          const solicitudesActualizadas = await API.solicitudesAPI.getAll();
          callbacks.onSolicitudesChange(solicitudesActualizadas, payload);
        } catch (error) {
          console.error('Error recargando solicitudes desde Realtime:', error);
        }
        
        hasReceivedEvent = true;
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Canal de Solicitudes: Subscrito correctamente (filtro: solicitudes:%)');
        isUsingRealtime = true;
        if (onRealtimeActiveCallback) {
          onRealtimeActiveCallback();
        }
      }
    });

  // ============================================
  // Función de Cleanup
  // ============================================
  return () => {
    console.log('🔌 Cerrando subscripciones Supabase Realtime...');
    clearTimeout(realtimeTimeout);
    supabase.removeChannel(pagosChannel);
    supabase.removeChannel(facturasChannel);
    supabase.removeChannel(serviciosChannel);
    supabase.removeChannel(solicitudesChannel);
    
    // Limpiar Polling si estaba en uso
    if (cleanupPolling) {
      cleanupPolling();
    }
    
    isUsingRealtime = false;
    isUsingPolling = false;
  };
}

/**
 * Verifica el estado de las subscripciones de Realtime
 */
export async function checkRealtimeStatus() {
  try {
    const channels = supabase.getChannels();
    console.log('📡 Estado de canales Realtime:', {
      totalCanales: channels.length,
      canales: channels.map(ch => ({
        topic: ch.topic,
        state: ch.state
      }))
    });
    return channels;
  } catch (error) {
    console.error('Error verificando estado de Realtime:', error);
    return [];
  }
}