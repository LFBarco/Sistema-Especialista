import { useRef, useState } from 'react';
import { FileUp, FileCheck2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApp, type Servicio } from '../../App';
import { informesAPI } from '../../utils/integracionApi';

const ESTADOS_CON_INFORME = ['completado', 'facturado', 'pagado'];

/** Subir o ver el informe PDF de un servicio. Si la solicitud vino de un integrador, se le avisa automáticamente. */
export function BotonInformeServicio({ servicio }: { servicio: Servicio }) {
  const { darkMode, servicios, setServicios } = useApp();
  const input = useRef<HTMLInputElement>(null);
  const [cargando, setCargando] = useState(false);

  if (!ESTADOS_CON_INFORME.includes(servicio.estado)) return null;

  const subir = async (archivo: File | undefined) => {
    if (!archivo) return;
    if (archivo.type !== 'application/pdf') {
      toast.error('El informe debe ser un archivo PDF');
      return;
    }
    if (archivo.size > 3 * 1024 * 1024) {
      toast.error('El informe no puede superar 3 MB');
      return;
    }
    setCargando(true);
    try {
      const informe = await informesAPI.subir(servicio.id, archivo);
      setServicios(servicios.map((s) => (s.id === servicio.id ? { ...s, informe } : s)));
      toast.success(servicio.solicitudId ? 'Informe cargado y enviado a la clínica' : 'Informe cargado');
    } catch (e: any) {
      toast.error(e.message ?? 'No se pudo subir el informe');
    } finally {
      setCargando(false);
      if (input.current) input.current.value = '';
    }
  };

  const ver = async () => {
    setCargando(true);
    try {
      window.open(await informesAPI.enlace(servicio.id), '_blank', 'noopener');
    } catch (e: any) {
      toast.error(e.message ?? 'No se pudo abrir el informe');
    } finally {
      setCargando(false);
    }
  };

  const clase = `p-2 rounded-lg transition-colors ${
    servicio.informe
      ? darkMode ? 'text-orange-400 hover:bg-orange-900/30' : 'text-orange-600 hover:bg-orange-50'
      : darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
  }`;

  return (
    <>
      <input ref={input} type="file" accept="application/pdf" className="hidden" onChange={(e) => subir(e.target.files?.[0])} />
      {servicio.informe ? (
        <>
          <button onClick={ver} className={clase} title="Ver informe" disabled={cargando}>
            {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => input.current?.click()}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Reemplazar informe"
            disabled={cargando}
          >
            <FileUp className="w-4 h-4" />
          </button>
        </>
      ) : (
        <button onClick={() => input.current?.click()} className={clase} title="Subir informe PDF" disabled={cargando}>
          {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
        </button>
      )}
    </>
  );
}
