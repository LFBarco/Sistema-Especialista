import React, { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Clock, Lock, GripVertical } from 'lucide-react';
import type { Servicio } from '../App';
import { format, addMinutes, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface CitaDraggable extends Servicio {
  color?: string;
}

interface DragItem {
  id: number;
  cita: CitaDraggable;
}

interface SlotProps {
  fecha: string;
  hora: string; // "08:00", "08:30"
  citas: CitaDraggable[];
  onDropCita: (cita: CitaDraggable, fecha: string, hora: string) => void;
  darkMode: boolean;
  isBlocked: boolean;
  duracionSlot: number;
}

interface CitaCardProps {
  cita: CitaDraggable;
  darkMode: boolean;
  onCitaClick: (cita: CitaDraggable) => void;
}

const ItemTypes = {
  CITA: 'cita'
};

function CitaCard({ cita, darkMode, onCitaClick }: CitaCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CITA,
    item: { id: cita.id, cita },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      onClick={(e) => {
        e.stopPropagation();
        onCitaClick(cita);
      }}
      className={`${cita.color} text-white p-2 rounded text-xs cursor-move hover:opacity-90 transition-all group shadow-sm ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className="flex items-center gap-1">
        <GripVertical className="w-3 h-3 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate">{cita.paciente}</div>
          <div className="flex items-center gap-1 opacity-90 truncate text-[10px]">
             <span>{cita.hora}</span>
             <span>•</span>
             <span>{cita.tipo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeSlot({ fecha, hora, citas, onDropCita, darkMode, isBlocked, duracionSlot }: SlotProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CITA,
    drop: (item: DragItem) => {
      onDropCita(item.cita, fecha, hora);
    },
    canDrop: () => !isBlocked,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const isActive = isOver && canDrop;
  
  const citasEnSlot = citas.filter(c => {
    if (!c.hora) return false;
    return c.hora === hora;
  });

  return (
    <div
      ref={drop}
      className={`relative min-h-[40px] p-1 border-b border-r transition-all ${
        isActive
          ? 'bg-purple-500/20'
          : canDrop
          ? 'bg-purple-500/5'
          : isBlocked
          ? darkMode ? 'bg-gray-800/50' : 'bg-gray-100'
          : 'bg-transparent'
      } ${
        darkMode ? 'border-gray-800' : 'border-gray-200'
      }`}
    >
      {isBlocked && (
         <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <Lock className="w-4 h-4" />
         </div>
      )}
      
      <div className="space-y-1">
        {citasEnSlot.map(cita => (
          <CitaCard key={cita.id} cita={cita} darkMode={darkMode} onCitaClick={() => {}} />
        ))}
      </div>
    </div>
  );
}

interface CalendarioDragDropProps {
  citasCalendario: CitaDraggable[];
  onCitaMovida: (citaId: number, nuevaFecha: string, nuevaHora: string) => void;
  darkMode: boolean;
  fechaInicio: Date;
  config?: {
    duracionCita: number;
    diasLaborales: number[];
    fechasBloqueadas: Date[];
  };
}

export function CalendarioDragDrop({ citasCalendario, onCitaMovida, darkMode, fechaInicio, config }: CalendarioDragDropProps) {
  const [citasActualizadas, setCitasActualizadas] = useState(citasCalendario);
  
  useEffect(() => {
    setCitasActualizadas(citasCalendario);
  }, [citasCalendario]);

  // Default configuration
  const duracionSlot = config?.duracionCita || 30; // Minutes
  const diasLaborales = config?.diasLaborales || [1, 2, 3, 4, 5];
  const fechasBloqueadas = config?.fechasBloqueadas || [];
  
  // Generate time slots based on duration
  const slots: string[] = [];
  const startTime = new Date();
  startTime.setHours(7, 0, 0, 0); // Start at 7 AM
  const endTime = new Date();
  endTime.setHours(20, 0, 0, 0); // End at 8 PM

  let currentTime = startTime;
  while (currentTime < endTime) {
    slots.push(format(currentTime, 'HH:mm'));
    currentTime = addMinutes(currentTime, duracionSlot);
  }

  // Generate 7 days of week
  const diasSemana: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(fechaInicio);
    fecha.setDate(fecha.getDate() + i);
    diasSemana.push(fecha);
  }

  const handleDropCita = (cita: CitaDraggable, nuevaFecha: string, nuevaHora: string) => {
    // Optimistic update
    setCitasActualizadas(prev =>
      prev.map(c =>
        c.id === cita.id
          ? { ...c, fecha: nuevaFecha, hora: nuevaHora }
          : c
      )
    );

    // Notify parent
    onCitaMovida(cita.id, nuevaFecha, nuevaHora);
  };

  const obtenerCitasDelDia = (fecha: Date) => {
    const fechaStr = format(fecha, 'yyyy-MM-dd');
    return citasActualizadas.filter(c => c.fecha === fechaStr);
  };

  const isDiaBloqueado = (fecha: Date) => {
    const dayOfWeek = fecha.getDay(); // 0 = Sunday
    // Check if working day
    // In ConfigAgenda we used: 0=Sun, 1=Mon.
    if (!diasLaborales.includes(dayOfWeek)) return true;
    
    // Check blocked dates
    return fechasBloqueadas.some(blocked => isSameDay(blocked, fecha));
  };

  return (
    <div className="overflow-x-auto select-none">
      <div className="min-w-[1000px] pb-6">
        {/* Header días */}
        <div className="grid grid-cols-8 gap-0 border-b sticky top-0 z-10 bg-inherit">
            <div className={`p-2 border-r ${darkMode ? 'border-gray-800' : 'border-gray-200'}`} /> {/* Time col */}
          {diasSemana.map((dia, idx) => {
            const esHoy = isSameDay(dia, new Date());
            const bloqueado = isDiaBloqueado(dia);
            return (
              <div
                key={idx}
                className={`text-center p-2 border-r last:border-r-0 ${
                  darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
                } ${bloqueado ? 'opacity-50 bg-gray-100 dark:bg-gray-800/50' : ''}`}
              >
                  <div className={`text-xs uppercase font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {format(dia, 'EEE', { locale: es })}
                </div>
                <div className={`text-xl font-bold ${
                  esHoy 
                    ? 'text-purple-600' 
                    : darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {format(dia, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid Content */}
        <div className="relative">
          {slots.map((hora) => (
            <div key={hora} className="grid grid-cols-8 gap-0 h-auto">
              {/* Time Label */}
              <div className={`
                flex items-start justify-end pr-2 py-1 text-xs border-r border-b 
                ${darkMode ? 'text-gray-500 border-gray-800' : 'text-gray-400 border-gray-200'}
              `}>
                <span className="-mt-2 bg-inherit px-1">{hora}</span>
              </div>

              {/* Day Columns */}
              {diasSemana.map((dia, idxDia) => {
                const fechaStr = format(dia, 'yyyy-MM-dd');
                const citasDelDia = obtenerCitasDelDia(dia);
                const bloqueado = isDiaBloqueado(dia);
                
                return (
                  <TimeSlot
                    key={`${fechaStr}-${hora}`}
                    fecha={fechaStr}
                    hora={hora}
                    citas={citasDelDia}
                    onDropCita={handleDropCita}
                    darkMode={darkMode}
                    isBlocked={bloqueado}
                    duracionSlot={duracionSlot}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
