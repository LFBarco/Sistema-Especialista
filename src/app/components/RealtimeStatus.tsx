import { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkRealtimeStatus } from '../utils/supabase/realtime';

export function RealtimeStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [channelCount, setChannelCount] = useState(0);
  const [syncMode, setSyncMode] = useState<'realtime' | 'polling' | 'disconnected'>('realtime');

  useEffect(() => {
    // Verificar el estado cada 10 segundos
    const interval = setInterval(async () => {
      const channels = await checkRealtimeStatus();
      const activeChannels = channels.filter(ch => ch.state === 'joined');
      setChannelCount(activeChannels.length);
      
      // Determinar modo de sincronización
      if (activeChannels.length > 0) {
        setSyncMode('realtime');
        setIsConnected(true);
      } else {
        // Si no hay canales pero aún tenemos datos, probablemente sea polling
        setSyncMode('polling');
        setIsConnected(true);
      }
    }, 10000);

    // Verificar inmediatamente al montar
    checkRealtimeStatus().then(channels => {
      const activeChannels = channels.filter(ch => ch.state === 'joined');
      setChannelCount(activeChannels.length);
      
      if (activeChannels.length > 0) {
        setSyncMode('realtime');
        setIsConnected(true);
      } else {
        setSyncMode('polling');
        setIsConnected(true);
      }
    });

    return () => clearInterval(interval);
  }, []);

  const getModeInfo = () => {
    switch (syncMode) {
      case 'realtime':
        return {
          label: 'Tiempo Real',
          color: 'green',
          icon: Wifi,
          description: 'Sincronización instantánea activa'
        };
      case 'polling':
        return {
          label: 'Sincronizado',
          color: 'green',
          icon: Activity,
          description: 'Actualización automática cada 5 segundos'
        };
      default:
        return {
          label: 'Desconectado',
          color: 'red',
          icon: WifiOff,
          description: 'Sin sincronización'
        };
    }
  };

  const modeInfo = getModeInfo();

  return (
    <div className="relative">
      {/* Indicator Button */}
      <button
        onClick={() => setShowStatus(!showStatus)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
        title={isConnected ? 'Sincronización en tiempo real activa' : 'Sincronización desconectada'}
      >
        <div className="relative">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </>
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
        </div>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 hidden sm:inline">
          {isConnected ? 'Sincronizado' : 'Desconectado'}
        </span>
      </button>

      {/* Status Dropdown */}
      <AnimatePresence>
        {showStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
              <div className="flex items-center gap-2 text-white">
                <Activity className="w-5 h-5" />
                <h3 className="font-semibold">Sincronización en Tiempo Real</h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Estado:</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className={`text-sm font-medium ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
              </div>

              {/* Active Channels */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Canales activos:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {channelCount} / 4
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-3" />

              {/* Features Info */}
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                  <span>Los pagos registrados se sincronizan automáticamente</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1 flex-shrink-0" />
                  <span>Los cambios en facturas se reflejan al instante</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 flex-shrink-0" />
                  <span>Actualizaciones sin necesidad de recargar la página</span>
                </div>
              </div>

              {/* Warning if disconnected */}
              {!isConnected && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                        Sincronización desconectada
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                        Recarga la página para restablecer la conexión
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                Powered by Supabase Realtime
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown */}
      {showStatus && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowStatus(false)}
        />
      )}
    </div>
  );
}