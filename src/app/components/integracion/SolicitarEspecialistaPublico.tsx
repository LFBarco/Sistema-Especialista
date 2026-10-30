import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, CheckCircle2, Clock, Loader2, PawPrint, Stethoscope } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { borradorAPI, type BorradorPublico } from '../../utils/integracionApi';

const DIAS_A_MOSTRAR = 14;

function hoyLima() {
  return new Date(Date.now() - 5 * 3600_000).toISOString().slice(0, 10);
}

function sumarDias(fecha: string, dias: number) {
  return new Date(Date.parse(`${fecha}T00:00:00Z`) + dias * 86_400_000).toISOString().slice(0, 10);
}

function fechaLegible(fecha: string) {
  return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Página abierta desde el botón "Solicitar especialista" del sistema de la clínica. */
export function SolicitarEspecialistaPublico() {
  const token = useMemo(() => new URLSearchParams(window.location.search).get('t') ?? '', []);
  const [borrador, setBorrador] = useState<BorradorPublico | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const [especialistaId, setEspecialistaId] = useState('');
  const [dias, setDias] = useState<{ fecha: string; horas: string[] }[]>([]);
  const [cargandoAgenda, setCargandoAgenda] = useState(false);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [tipoServicio, setTipoServicio] = useState('');
  const [motivo, setMotivo] = useState('');
  const [urgencia, setUrgencia] = useState<'baja' | 'media' | 'alta'>('media');
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('El enlace no es válido.');
      setCargando(false);
      return;
    }
    borradorAPI
      .obtener(token)
      .then((b) => {
        setBorrador(b);
        setTipoServicio(b.datos.tipoServicio ?? '');
        setMotivo(b.datos.motivo ?? '');
        setUrgencia(b.datos.urgencia ?? 'media');
        if (b.especialistas.length === 1) setEspecialistaId(b.especialistas[0].id);
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [token]);

  useEffect(() => {
    if (!especialistaId) return;
    setCargandoAgenda(true);
    setFecha('');
    setHora('');
    const desde = hoyLima();
    borradorAPI
      .disponibilidad(token, especialistaId, desde, sumarDias(desde, DIAS_A_MOSTRAR - 1))
      .then((r) => setDias(r.dias.filter((d) => d.horas.length > 0)))
      .catch((e) => setError(e.message))
      .finally(() => setCargandoAgenda(false));
  }, [especialistaId, token]);

  const horasDelDia = dias.find((d) => d.fecha === fecha)?.horas ?? [];
  const puedeEnviar = especialistaId && fecha && hora && tipoServicio.trim() && motivo.trim() && !enviando;

  const enviar = async () => {
    if (!puedeEnviar) return;
    setEnviando(true);
    setError(null);
    try {
      await borradorAPI.solicitar(token, { especialistaId, fecha, hora, tipoServicio, motivo, urgencia });
      setEnviada(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (enviada) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-10 space-y-3">
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
            <h1 className="text-xl font-semibold text-gray-900">Solicitud enviada</h1>
            <p className="text-gray-600">
              El especialista recibirá la solicitud para {borrador?.datos.paciente.nombre} el {fechaLegible(fecha)} a las {hora}.
              Verás la confirmación en {borrador?.integrador}.
            </p>
            <p className="text-sm text-gray-500">Ya puedes cerrar esta ventana.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!borrador) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-10 space-y-3">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-gray-700">{error ?? 'No se pudo cargar la solicitud.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { paciente } = borrador.datos;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <p className="text-sm text-orange-600 font-medium">VetSpecialist · desde {borrador.integrador}</p>
          <h1 className="text-2xl font-semibold text-gray-900">Solicitar especialista</h1>
          {borrador.clinica.nombre && <p className="text-gray-600">{borrador.clinica.nombre}</p>}
        </div>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{paciente.nombre}</p>
              <p className="text-sm text-gray-600">
                {[paciente.especie, paciente.raza, paciente.sexo, paciente.peso ? `${paciente.peso} kg` : null].filter(Boolean).join(' · ')}
              </p>
            </div>
          </CardContent>
        </Card>

        {borrador.especialistas.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-600">
              Tu clínica todavía no tiene especialistas afiliados en VetSpecialist. Pide al especialista que apruebe la afiliación de tu clínica.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Stethoscope className="w-5 h-5 text-orange-500" /> Especialista</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                {borrador.especialistas.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setEspecialistaId(e.id)}
                    className={`text-left rounded-lg border p-4 transition ${
                      especialistaId === e.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{e.nombre}</p>
                    <p className="text-sm text-gray-600">{[e.especialidad, e.ciudad].filter(Boolean).join(' · ')}</p>
                    {e.tarifaBase ? <p className="text-sm text-gray-500 mt-1">Desde S/ {e.tarifaBase}</p> : null}
                  </button>
                ))}
              </CardContent>
            </Card>

            {especialistaId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-orange-500" /> Fecha y hora</CardTitle>
                  <CardDescription>Horarios libres de los próximos {DIAS_A_MOSTRAR} días</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cargandoAgenda ? (
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  ) : dias.length === 0 ? (
                    <p className="text-gray-600">No hay horarios libres en los próximos días.</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {dias.map((d) => (
                          <Button
                            key={d.fecha}
                            type="button"
                            variant={fecha === d.fecha ? 'default' : 'outline'}
                            className={fecha === d.fecha ? 'bg-orange-500 hover:bg-orange-600' : ''}
                            onClick={() => { setFecha(d.fecha); setHora(''); }}
                          >
                            {fechaLegible(d.fecha)}
                          </Button>
                        ))}
                      </div>
                      {fecha && (
                        <div className="flex flex-wrap gap-2">
                          {horasDelDia.map((h) => (
                            <Button
                              key={h}
                              type="button"
                              size="sm"
                              variant={hora === h ? 'default' : 'outline'}
                              className={hora === h ? 'bg-orange-500 hover:bg-orange-600' : ''}
                              onClick={() => setHora(h)}
                            >
                              <Clock className="w-3 h-3 mr-1" /> {h}
                            </Button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Detalle de la solicitud</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Servicio</label>
                  <Input value={tipoServicio} onChange={(e) => setTipoServicio(e.target.value)} placeholder="Ej. Ecocardiograma Doppler" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Motivo clínico</label>
                  <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={4} placeholder="Describe el caso y lo que necesitas del especialista" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Urgencia</label>
                  <div className="flex gap-2">
                    {(['baja', 'media', 'alta'] as const).map((u) => (
                      <Button
                        key={u}
                        type="button"
                        size="sm"
                        variant={urgencia === u ? 'default' : 'outline'}
                        className={urgencia === u ? 'bg-orange-500 hover:bg-orange-600 capitalize' : 'capitalize'}
                        onClick={() => setUrgencia(u)}
                      >
                        {u}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <Button className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base" disabled={!puedeEnviar} onClick={enviar}>
              {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar solicitud'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
