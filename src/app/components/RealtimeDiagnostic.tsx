import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Copy, Terminal, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { getRealtimeMode, setRealtimeActiveCallback } from '../utils/supabase/realtime';

export function RealtimeDiagnostic() {
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  useEffect(() => {
    // Ya NO mostramos el banner automáticamente
    // Solo se muestra si el usuario hace clic en el indicador de estado
    
    // Configurar callback para cerrar el banner si Realtime se activa
    setRealtimeActiveCallback(() => {
      setShowDiagnostic(false);
      toast.success('✅ Realtime habilitado correctamente', {
        description: 'Sincronización instantánea activada'
      });
    });
  }, []);

  const sqlQuery = `-- Paso 1: Verificar si Realtime está habilitado
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE tablename = 'kv_store_91d1f360';

-- Si el query anterior NO devuelve resultados, ejecuta el Paso 2:
-- Paso 2: Habilitar Realtime para la tabla
ALTER PUBLICATION supabase_realtime ADD TABLE kv_store_91d1f360;

-- Paso 3: Verificar de nuevo
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE tablename = 'kv_store_91d1f360';`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('SQL copiado al portapapeles');
  };

  if (!showDiagnostic) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4"
    >
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-500 dark:border-amber-600 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-white" />
              <div>
                <h3 className="text-white font-bold text-lg">Realtime no está habilitado</h3>
                <p className="text-amber-100 text-sm">Se está usando Polling como alternativa (actualización cada 5s)</p>
              </div>
            </div>
            <button
              onClick={() => setShowDiagnostic(false)}
              className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Current Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Estado Actual: Polling Activo
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  El sistema está funcionando correctamente, pero actualizando cada 5 segundos en lugar de instantáneamente.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-amber-600" />
              Configuración Rápida (2 minutos)
            </h4>

            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    Abre el <strong>SQL Editor</strong> en Supabase Dashboard
                  </p>
                  <a
                    href="https://supabase.com/dashboard/project/_/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:text-amber-700 dark:text-amber-400 inline-flex items-center gap-1 mt-1"
                  >
                    Abrir SQL Editor
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">
                    Copia y ejecuta este SQL:
                  </p>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto border border-gray-700">
                      <code>{sqlQuery}</code>
                    </pre>
                    <button
                      onClick={() => copyToClipboard(sqlQuery)}
                      className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Copiar SQL"
                    >
                      <Copy className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    Recarga esta página (F5)
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    Deberías ver "✅ Canal de Pagos: Subscrito correctamente" en la consola
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Expected Result */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  Resultado Esperado
                </h5>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Después de ejecutar el SQL, verás:
                </p>
                <pre className="mt-2 bg-green-100 dark:bg-green-900/40 p-2 rounded text-xs text-green-900 dark:text-green-200">
schemaname | tablename{'\n'}
-----------+-----------------{'\n'}
public     | kv_store_91d1f360
                </pre>
              </div>
            </div>
          </div>

          {/* Alternative */}
          <div className="border-t border-amber-200 dark:border-amber-700 pt-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>¿No quieres configurar Realtime?</strong> No hay problema. El sistema Polling funciona perfectamente para demos y testing.
              Solo tendrás una latencia de 0-5 segundos en lugar de ser instantáneo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-amber-100 dark:bg-amber-900/30 px-6 py-3 flex items-center justify-between">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            📚 Documentación completa en <code className="bg-amber-200 dark:bg-amber-800 px-1 rounded">/SETUP_REALTIME.md</code>
          </p>
          <button
            onClick={() => setShowDiagnostic(false)}
            className="text-xs text-amber-700 dark:text-amber-300 hover:underline font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </motion.div>
  );
}