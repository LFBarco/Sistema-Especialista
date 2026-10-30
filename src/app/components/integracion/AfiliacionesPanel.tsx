import { useEffect, useState } from 'react';
import { Check, Link2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../App';
import { afiliacionesPortalAPI, type AfiliacionPortal } from '../../utils/integracionApi';

const ETIQUETAS: Record<AfiliacionPortal['estado'], { texto: string; clase: string }> = {
  pendiente: { texto: 'Pendiente', clase: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/40' },
  aprobada: { texto: 'Aprobada', clase: 'bg-green-500/15 text-green-500 border-green-500/40' },
  rechazada: { texto: 'Rechazada', clase: 'bg-red-500/15 text-red-500 border-red-500/40' },
  revocada: { texto: 'Revocada', clase: 'bg-gray-500/15 text-gray-400 border-gray-500/40' },
};

/** Clínicas que piden trabajar con el especialista a través de un sistema integrado (por ejemplo, Veterinari). */
export function AfiliacionesPanel() {
  const { darkMode } = useApp();
  const [afiliaciones, setAfiliaciones] = useState<AfiliacionPortal[] | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);

  const cargar = () =>
    afiliacionesPortalAPI
      .listar()
      .then(setAfiliaciones)
      .catch(() => setAfiliaciones([]));

  useEffect(() => {
    cargar();
  }, []);

  const responder = async (a: AfiliacionPortal, accion: 'aprobar' | 'rechazar' | 'revocar') => {
    setProcesando(a.id);
    try {
      await afiliacionesPortalAPI.responder(a.id, accion);
      toast.success(
        accion === 'aprobar'
          ? `${a.clinica.nombre} ya puede enviarte solicitudes`
          : accion === 'rechazar' ? 'Afiliación rechazada' : 'Afiliación revocada',
      );
      await cargar();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setProcesando(null);
    }
  };

  if (afiliaciones === null) {
    return (
      <div className={`rounded-xl border p-6 flex items-center gap-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Cargando clínicas conectadas…</p>
      </div>
    );
  }

  const pendientes = afiliaciones.filter((a) => a.estado === 'pendiente').length;

  if (afiliaciones.length === 0) {
    return (
      <div className={`rounded-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="w-5 h-5 text-orange-500" />
          <h2 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Clínicas conectadas por integración</h2>
        </div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Cuando una clínica en Veterinari (u otro sistema) te invite a trabajar con ellos, la solicitud aparecerá aquí para que la apruebes.
          Hasta entonces no recibirás pedidos por integración.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="w-5 h-5 text-orange-500" />
        <h2 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Clínicas conectadas por integración</h2>
        {pendientes > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white">{pendientes} por revisar</span>
        )}
      </div>
      <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
        {afiliaciones.map((a) => (
          <div key={a.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{a.clinica.nombre}</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {[a.clinica.ciudad, a.clinica.ruc ? `RUC ${a.clinica.ruc}` : null, a.integrador ? `vía ${a.integrador}` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {a.mensaje && <p className={`text-sm italic mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>"{a.mensaje}"</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded border ${ETIQUETAS[a.estado].clase}`}>{ETIQUETAS[a.estado].texto}</span>
              {procesando === a.id ? (
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
              ) : a.estado === 'pendiente' ? (
                <>
                  <button onClick={() => responder(a, 'aprobar')} className="px-3 py-1.5 text-sm rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center gap-1">
                    <Check className="w-4 h-4" /> Aprobar
                  </button>
                  <button onClick={() => responder(a, 'rechazar')} className="px-3 py-1.5 text-sm rounded-lg border border-red-500/50 text-red-500 hover:bg-red-500/10 flex items-center gap-1">
                    <X className="w-4 h-4" /> Rechazar
                  </button>
                </>
              ) : a.estado === 'aprobada' ? (
                <button onClick={() => responder(a, 'revocar')} className={`px-3 py-1.5 text-sm rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                  Revocar
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
