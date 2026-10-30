import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { format, addDays, isSameDay, startOfWeek, parseISO, addMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { GripVertical, MousePointer2, Move, AlertTriangle } from 'lucide-react';
import type { Servicio } from '../App';

const HORA_INICIO = 7;
const HORA_FIN = 21;
const PX_POR_HORA = 72;
const SLOT_MIN = 30;

type ModoVista = 'semana' | 'dia';
export type ModoMover = 'arrastrar' | 'seleccionar';
export type ColorPor = 'estado' | 'clinica';

const HEX_CLINICA: Record<string, string> = {
  blue: '#3B82F6',
  green: '#22C55E',
  yellow: '#EAB308',
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
  red: '#EF4444',
  cyan: '#06B6D4',
};

interface Props {
  citas: Servicio[];
  darkMode: boolean;
  fechaReferencia: Date;
  modoVista: ModoVista;
  modoMover: ModoMover;
  onModoMoverChange: (m: ModoMover) => void;
  onCitaMovida: (citaId: number, fecha: string, hora: string) => void;
  onCitaClick: (cita: Servicio) => void;
  onSlotVacio: (fecha: string, hora: string) => void;
  diasLaborales?: number[];
  /** Mapa nombre clínica → token de color (blue, green, …) */
  coloresClinica?: Record<string, string>;
}

const ItemTypes = { CITA: 'cita-pro' };

const COLOR_ESTADO: Record<string, string> = {
  confirmado: '#F97316',
  completado: '#22C55E',
  facturado: '#3B82F6',
  pagado: '#8B5CF6',
  cancelado: '#6B7280',
};

function aMinutos(hora: string) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + (m || 0);
}

function deMinutos(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function snapMinutos(min: number) {
  return Math.round(min / SLOT_MIN) * SLOT_MIN;
}

function hayConflicto(cita: Servicio, otras: Servicio[], fecha: string, hora: string) {
  const inicio = aMinutos(hora);
  const fin = inicio + (cita.duracion || 60);
  return otras.some((o) => {
    if (o.id === cita.id || o.estado === 'cancelado' || o.fecha !== fecha || !o.hora) return false;
    const oi = aMinutos(o.hora);
    const of = oi + (o.duracion || 60);
    return inicio < of && fin > oi;
  });
}

/** Empaqueta citas solapadas en columnas (estilo Google Calendar). */
function layoutDia(citas: Servicio[]) {
  const ordenadas = [...citas]
    .filter((c) => c.hora && c.estado !== 'cancelado')
    .sort((a, b) => aMinutos(a.hora!) - aMinutos(b.hora!));

  type Laid = Servicio & { col: number; cols: number };
  const laid: Laid[] = [];
  let cluster: Servicio[] = [];
  let clusterEnd = -1;

  const flush = () => {
    if (!cluster.length) return;
    const cols: number[] = [];
    const assigned: Laid[] = [];
    for (const c of cluster) {
      const ini = aMinutos(c.hora!);
      let col = 0;
      while (cols[col] !== undefined && cols[col] > ini) col++;
      cols[col] = ini + (c.duracion || 60);
      assigned.push({ ...c, col, cols: 0 });
    }
    const maxCol = Math.max(...assigned.map((a) => a.col)) + 1;
    assigned.forEach((a) => laid.push({ ...a, cols: maxCol }));
    cluster = [];
    clusterEnd = -1;
  };

  for (const c of ordenadas) {
    const ini = aMinutos(c.hora!);
    if (cluster.length && ini >= clusterEnd) flush();
    cluster.push(c);
    clusterEnd = Math.max(clusterEnd, ini + (c.duracion || 60));
  }
  flush();
  return laid;
}

function CitaBloque({
  cita,
  col,
  cols,
  darkMode,
  modoMover,
  seleccionada,
  conflicto,
  colorHex,
  onSelect,
  onClick,
}: {
  cita: Servicio;
  col: number;
  cols: number;
  darkMode: boolean;
  modoMover: ModoMover;
  seleccionada: boolean;
  conflicto: boolean;
  colorHex: string;
  onSelect: () => void;
  onClick: () => void;
}) {
  const inicio = aMinutos(cita.hora!);
  const dur = cita.duracion || 60;
  const top = ((inicio - HORA_INICIO * 60) / 60) * PX_POR_HORA;
  const height = Math.max((dur / 60) * PX_POR_HORA, 28);
  const widthPct = 100 / cols;
  const leftPct = col * widthPct;
  const color = colorHex;

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.CITA,
      item: { id: cita.id, cita },
      canDrag: modoMover === 'arrastrar',
      collect: (m) => ({ isDragging: m.isDragging() }),
    }),
    [cita, modoMover],
  );

  return (
    <div
      ref={modoMover === 'arrastrar' ? drag : undefined}
      onClick={(e) => {
        e.stopPropagation();
        if (modoMover === 'seleccionar') onSelect();
        else onClick();
      }}
      className={`absolute rounded-lg px-2 py-1 text-white text-xs shadow-md overflow-hidden transition-all border-l-4 ${
        isDragging ? 'opacity-40' : 'opacity-100'
      } ${seleccionada ? 'ring-2 ring-offset-2 ring-orange-400 z-30 scale-[1.02]' : 'z-10'} ${
        modoMover === 'arrastrar' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
      }`}
      style={{
        top,
        height,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
        backgroundColor: color,
        borderLeftColor: darkMode ? '#fff' : 'rgba(255,255,255,0.85)',
        boxShadow: conflicto ? '0 0 0 2px #EF4444' : undefined,
      }}
      title={`${cita.paciente} · ${cita.tipo} · ${cita.hora}`}
    >
      <div className="flex items-start gap-1">
        {modoMover === 'arrastrar' && <GripVertical className="w-3 h-3 opacity-70 shrink-0 mt-0.5" />}
        <div className="min-w-0 flex-1">
          <p className="font-semibold truncate leading-tight">{cita.paciente}</p>
          <p className="opacity-90 truncate text-[10px] leading-tight">
            {cita.hora} · {cita.tipo}
          </p>
          {height > 48 && (
            <p className="opacity-80 truncate text-[10px] mt-0.5">{cita.clinica}</p>
          )}
        </div>
        {conflicto && <AlertTriangle className="w-3 h-3 text-white shrink-0" />}
      </div>
    </div>
  );
}

function ColumnaDia({
  dia,
  citas,
  darkMode,
  modoMover,
  citaSeleccionadaId,
  colorDe,
  onDrop,
  onSelectSlot,
  onCitaClick,
  onSelectCita,
  bloqueado,
}: {
  dia: Date;
  citas: Servicio[];
  darkMode: boolean;
  modoMover: ModoMover;
  citaSeleccionadaId: number | null;
  colorDe: (c: Servicio) => string;
  onDrop: (cita: Servicio, fecha: string, hora: string) => void;
  onSelectSlot: (fecha: string, hora: string) => void;
  onCitaClick: (c: Servicio) => void;
  onSelectCita: (id: number) => void;
  bloqueado: boolean;
}) {
  const fechaStr = format(dia, 'yyyy-MM-dd');
  const colRef = useRef<HTMLDivElement>(null);
  const laid = useMemo(() => layoutDia(citas), [citas]);
  const esHoy = isSameDay(dia, new Date());

  const minutosDesdeY = (clientY: number) => {
    const rect = colRef.current!.getBoundingClientRect();
    const y = clientY - rect.top + (colRef.current!.parentElement?.scrollTop || 0);
    // parent scroll is on outer; use offset within column
    const localY = clientY - rect.top;
    const mins = HORA_INICIO * 60 + (localY / PX_POR_HORA) * 60;
    return snapMinutos(Math.max(HORA_INICIO * 60, Math.min(HORA_FIN * 60 - SLOT_MIN, mins)));
  };

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.CITA,
      drop: (item: { cita: Servicio }, monitor) => {
        const offset = monitor.getClientOffset();
        if (!offset || !colRef.current) return;
        const min = minutosDesdeY(offset.y);
        onDrop(item.cita, fechaStr, deMinutos(min));
      },
      canDrop: () => !bloqueado && modoMover === 'arrastrar',
      collect: (m) => ({ isOver: m.isOver() && m.canDrop() }),
    }),
    [fechaStr, bloqueado, modoMover],
  );

  const setRefs = (node: HTMLDivElement | null) => {
    colRef.current = node;
    drop(node);
  };

  // Línea de hora actual
  const ahora = new Date();
  const mostrarAhora = esHoy && ahora.getHours() >= HORA_INICIO && ahora.getHours() < HORA_FIN;
  const topAhora = ((ahora.getHours() * 60 + ahora.getMinutes() - HORA_INICIO * 60) / 60) * PX_POR_HORA;

  const horas = HORA_FIN - HORA_INICIO;

  return (
    <div
      ref={setRefs}
      className={`relative border-r last:border-r-0 ${
        darkMode ? 'border-gray-800' : 'border-gray-200'
      } ${bloqueado ? 'opacity-40' : ''} ${isOver ? (darkMode ? 'bg-orange-500/10' : 'bg-orange-50') : ''} ${
        esHoy ? (darkMode ? 'bg-orange-500/5' : 'bg-orange-50/40') : ''
      }`}
      style={{ height: horas * PX_POR_HORA }}
      onClick={(e) => {
        if (bloqueado || !colRef.current) return;
        const min = minutosDesdeY(e.clientY);
        onSelectSlot(fechaStr, deMinutos(min));
      }}
    >
      {/* Líneas de hora */}
      {Array.from({ length: horas * 2 }).map((_, i) => (
        <div
          key={i}
          className={`absolute left-0 right-0 border-t ${
            i % 2 === 0
              ? darkMode ? 'border-gray-800' : 'border-gray-200'
              : darkMode ? 'border-gray-800/40' : 'border-gray-100'
          }`}
          style={{ top: (i * PX_POR_HORA) / 2 }}
        />
      ))}

      {mostrarAhora && (
        <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: topAhora }}>
          <div className="h-0.5 bg-red-500 relative">
            <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>
        </div>
      )}

      {laid.map((c) => (
        <CitaBloque
          key={c.id}
          cita={c}
          col={c.col}
          cols={c.cols}
          darkMode={darkMode}
          modoMover={modoMover}
          seleccionada={citaSeleccionadaId === c.id}
          conflicto={hayConflicto(c, citas, fechaStr, c.hora!)}
          colorHex={colorDe(c)}
          onSelect={() => onSelectCita(c.id)}
          onClick={() => onCitaClick(c)}
        />
      ))}
    </div>
  );
}

export function AgendaCalendarioPro(props: Props) {
  const {
    citas,
    darkMode,
    fechaReferencia,
    modoVista,
    modoMover,
    onModoMoverChange,
    onCitaMovida,
    onCitaClick,
    onSlotVacio,
    diasLaborales = [1, 2, 3, 4, 5, 6],
    coloresClinica = {},
  } = props;

  const [citaSeleccionadaId, setCitaSeleccionadaId] = useState<number | null>(null);
  const [colorPor, setColorPor] = useState<ColorPor>('estado');

  const colorDe = useCallback(
    (c: Servicio) => {
      if (colorPor === 'clinica') {
        const token = coloresClinica[c.clinica];
        return (token && HEX_CLINICA[token]) || '#F97316';
      }
      return COLOR_ESTADO[c.estado] || '#F97316';
    },
    [colorPor, coloresClinica],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCitaSeleccionadaId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const lunes = startOfWeek(fechaReferencia, { weekStartsOn: 1 });
  const dias =
    modoVista === 'dia'
      ? [fechaReferencia]
      : Array.from({ length: 7 }, (_, i) => addDays(lunes, i));

  const handleDrop = useCallback(
    (cita: Servicio, fecha: string, hora: string) => {
      if (cita.fecha === fecha && cita.hora === hora) return;
      onCitaMovida(cita.id, fecha, hora);
    },
    [onCitaMovida],
  );

  const handleSlot = (fecha: string, hora: string) => {
    if (modoMover === 'seleccionar' && citaSeleccionadaId != null) {
      const cita = citas.find((c) => c.id === citaSeleccionadaId);
      if (cita) {
        onCitaMovida(cita.id, fecha, hora);
        setCitaSeleccionadaId(null);
        return;
      }
    }
    onSlotVacio(fecha, hora);
  };

  const horasLabels = Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => HORA_INICIO + i);

  return (
    <div className="flex flex-col">
      {/* Toolbar interacción */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: darkMode ? '#1F2937' : '#F1F5F9' }}>
            <button
              type="button"
              onClick={() => {
                onModoMoverChange('arrastrar');
                setCitaSeleccionadaId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                modoMover === 'arrastrar'
                  ? 'bg-orange-500 text-white'
                  : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              Arrastrar
            </button>
            <button
              type="button"
              onClick={() => onModoMoverChange('seleccionar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                modoMover === 'seleccionar'
                  ? 'bg-orange-500 text-white'
                  : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MousePointer2 className="w-3.5 h-3.5" />
              Seleccionar y mover
            </button>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: darkMode ? '#1F2937' : '#F1F5F9' }}>
            <button
              type="button"
              onClick={() => setColorPor('estado')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                colorPor === 'estado' ? 'bg-orange-500 text-white' : darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Por estado
            </button>
            <button
              type="button"
              onClick={() => setColorPor('clinica')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                colorPor === 'clinica' ? 'bg-orange-500 text-white' : darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Por clínica
            </button>
          </div>
        </div>
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          {modoMover === 'arrastrar'
            ? 'Arrastra una cita a otro día u hora'
            : citaSeleccionadaId
              ? 'Cita seleccionada — haz clic en el horario destino (Esc para cancelar)'
              : 'Haz clic en una cita y luego en el hueco destino'}
        </p>
      </div>

      <div className={`rounded-xl border overflow-hidden ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className="overflow-x-auto">
          <div style={{ minWidth: modoVista === 'dia' ? 480 : 900 }}>
            {/* Header días */}
            <div
              className="grid sticky top-0 z-30"
              style={{ gridTemplateColumns: `56px repeat(${dias.length}, minmax(0, 1fr))` }}
            >
              <div className={`border-b border-r ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`} />
              {dias.map((dia) => {
                const esHoy = isSameDay(dia, new Date());
                return (
                  <div
                    key={dia.toISOString()}
                    className={`text-center py-3 border-b border-r last:border-r-0 ${
                      darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className={`text-[11px] uppercase tracking-wide ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {format(dia, 'EEE', { locale: es })}
                    </div>
                    <div
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-lg font-bold mt-0.5 ${
                        esHoy
                          ? 'bg-orange-500 text-white'
                          : darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {format(dia, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cuerpo */}
            <div
              className="grid"
              style={{ gridTemplateColumns: `56px repeat(${dias.length}, minmax(0, 1fr))` }}
            >
              {/* Columna horas */}
              <div className={`relative border-r ${darkMode ? 'border-gray-800' : 'border-gray-200'}`} style={{ height: (HORA_FIN - HORA_INICIO) * PX_POR_HORA }}>
                {horasLabels.map((h) => (
                  <div
                    key={h}
                    className={`absolute right-2 text-[11px] -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                    style={{ top: (h - HORA_INICIO) * PX_POR_HORA }}
                  >
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {dias.map((dia) => {
                const fechaStr = format(dia, 'yyyy-MM-dd');
                const delDia = citas.filter((c) => c.fecha === fechaStr);
                const bloqueado = !diasLaborales.includes(dia.getDay());
                return (
                  <ColumnaDia
                    key={fechaStr}
                    dia={dia}
                    citas={delDia}
                    darkMode={darkMode}
                    modoMover={modoMover}
                    citaSeleccionadaId={citaSeleccionadaId}
                    colorDe={colorDe}
                    onDrop={handleDrop}
                    onSelectSlot={handleSlot}
                    onCitaClick={onCitaClick}
                    onSelectCita={(id) => {
                      setCitaSeleccionadaId((prev) => (prev === id ? null : id));
                    }}
                    bloqueado={bloqueado}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 mt-3 px-1">
        {colorPor === 'estado'
          ? Object.entries(COLOR_ESTADO).map(([estado, color]) => (
              <div key={estado} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className={`capitalize ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{estado}</span>
              </div>
            ))
          : Object.entries(coloresClinica).map(([nombre, token]) => (
              <div key={nombre} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: HEX_CLINICA[token] || '#F97316' }} />
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{nombre}</span>
              </div>
            ))}
      </div>
    </div>
  );
}

/** Utilidad para crear eventos ICS (exportar a Google/Outlook sin OAuth). */
export function servicioAIcs(s: Servicio) {
  const fecha = s.fecha.replace(/-/g, '');
  const [hh, mm] = (s.hora || '09:00').split(':');
  const start = `${fecha}T${hh}${mm}00`;
  const endDate = addMinutes(parseISO(`${s.fecha}T${s.hora || '09:00'}:00`), s.duracion || 60);
  const end = format(endDate, "yyyyMMdd'T'HHmmss");
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VetSpecialist//ES',
    'BEGIN:VEVENT',
    `UID:vs-${s.id}@vetspecialist`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${s.tipo} - ${s.paciente}`,
    `DESCRIPTION:Clínica: ${s.clinica}\\nEstado: ${s.estado}`,
    `LOCATION:${s.direccion || s.clinica}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
