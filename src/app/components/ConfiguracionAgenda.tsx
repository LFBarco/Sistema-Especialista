import { useState, useEffect } from 'react';
import { Calendar } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon, Trash2, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { configuracionAgendaAPI } from '../utils/api';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useApp } from '../App';

export function ConfiguracionAgenda() {
  const { darkMode } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Configuration State
  const [duracionCita, setDuracionCita] = useState<string>('30');
  const [diasLaborales, setDiasLaborales] = useState<number[]>([1, 2, 3, 4, 5]); // 0=Sun, 1=Mon, etc.
  const [fechasBloqueadas, setFechasBloqueadas] = useState<Date[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const daysOfWeek = [
    { id: 1, label: 'L', name: 'Lunes' },
    { id: 2, label: 'M', name: 'Martes' },
    { id: 3, label: 'M', name: 'Miércoles' },
    { id: 4, label: 'J', name: 'Jueves' },
    { id: 5, label: 'V', name: 'Viernes' },
    { id: 6, label: 'S', name: 'Sábado' },
    { id: 0, label: 'D', name: 'Domingo' },
  ];

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await configuracionAgendaAPI.get();
      if (data) {
        if (data.duracionCita) setDuracionCita(data.duracionCita.toString());
        if (data.diasLaborales) setDiasLaborales(data.diasLaborales);
        if (data.fechasBloqueadas) {
          setFechasBloqueadas(data.fechasBloqueadas.map((d: string) => new Date(d)));
        }
      }
    } catch (error) {
      console.error('Error loading agenda config:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = {
        duracionCita: parseInt(duracionCita),
        diasLaborales,
        fechasBloqueadas: fechasBloqueadas.map(d => d.toISOString()),
      };
      await configuracionAgendaAPI.update(data);
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error saving agenda config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayId: number) => {
    if (diasLaborales.includes(dayId)) {
      setDiasLaborales(diasLaborales.filter(d => d !== dayId));
    } else {
      setDiasLaborales([...diasLaborales, dayId]);
    }
  };

  const addBlockedDate = () => {
    if (date && !fechasBloqueadas.some(d => d.toDateString() === date.toDateString())) {
      setFechasBloqueadas([...fechasBloqueadas, date]);
      setDate(undefined);
    }
  };

  const removeBlockedDate = (dateToRemove: Date) => {
    setFechasBloqueadas(fechasBloqueadas.filter(d => d.toDateString() !== dateToRemove.toDateString()));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <CardHeader>
          <CardTitle className={darkMode ? 'text-white' : ''}>Configuración de Agenda</CardTitle>
          <CardDescription className={darkMode ? 'text-gray-400' : ''}>
            Personaliza la duración de tus citas y tus días disponibles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Duración de Citas */}
          <div className="space-y-4">
            <Label className={darkMode ? 'text-gray-200' : ''}>Duración de Cita (Promedio)</Label>
            <Select value={duracionCita} onValueChange={setDuracionCita}>
              <SelectTrigger className={`w-[200px] ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}`}>
                <SelectValue placeholder="Seleccionar duración" />
              </SelectTrigger>
              <SelectContent className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">60 minutos</SelectItem>
              </SelectContent>
            </Select>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Este intervalo se utilizará para generar los bloques de disponibilidad en tu calendario.
            </p>
          </div>

          <div className="h-px bg-border" />

          {/* Días Laborales */}
          <div className="space-y-4">
            <Label className={darkMode ? 'text-gray-200' : ''}>Días Laborales</Label>
            <div className="flex gap-2">
              {daysOfWeek.map((day) => {
                const isSelected = diasLaborales.includes(day.id);
                return (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      isSelected
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : darkMode 
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                    title={day.name}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Selecciona los días de la semana en los que atiendes consultas.
            </p>
          </div>

          <div className="h-px bg-border" />

          {/* Bloqueo de Fechas */}
          <div className="space-y-4">
            <Label className={darkMode ? 'text-gray-200' : ''}>Bloquear Fechas Específicas</Label>
            <div className="flex gap-4 items-start">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                      darkMode ? 'bg-gray-900 border-gray-700 text-white hover:bg-gray-800' : ''
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button 
                onClick={addBlockedDate}
                disabled={!date}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Bloquear Día
              </Button>
            </div>

            {fechasBloqueadas.length > 0 && (
              <div className="mt-4">
                <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Fechas Bloqueadas:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {fechasBloqueadas.map((blockedDate, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-2 rounded border ${
                        darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <span className="text-sm">{format(blockedDate, "PPP", { locale: es })}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBlockedDate(blockedDate)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
             <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Agrega días específicos (feriados, vacaciones) que no estarán disponibles en tu agenda.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
