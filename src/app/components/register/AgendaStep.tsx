import { useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';

interface AgendaStepProps {
  bloquesDias: any[];
  setBloquesDias: (bloques: any[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  profileData: {
    titulo: string;
    nombre: string;
    apellido: string;
    especialidad: string;
    nombreCentro: string;
    direccionCentro: string;
    ciudadCentro: string;
    telefonoCentro: string;
  };
}

export function AgendaStep({ 
  bloquesDias, 
  setBloquesDias, 
  onNext, 
  onBack, 
  onSkip,
  profileData 
}: AgendaStepProps) {
  const diasSemana = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  const agregarBloqueDias = () => {
    setBloquesDias([
      ...bloquesDias,
      { 
        dias: { Lu: false, Ma: false, Mi: false, Ju: false, Vi: false, Sa: false, Do: false },
        horarios: [{ desde: '08:00', hasta: '16:00' }]
      }
    ]);
  };

  const eliminarBloqueDias = (index: number) => {
    const newBloques = bloquesDias.filter((_, i) => i !== index);
    setBloquesDias(newBloques);
  };

  const toggleDia = (bloqueIndex: number, dia: string) => {
    const newBloques = [...bloquesDias];
    newBloques[bloqueIndex].dias[dia] = !newBloques[bloqueIndex].dias[dia];
    setBloquesDias(newBloques);
  };

  const agregarHorario = (bloqueIndex: number) => {
    const newBloques = [...bloquesDias];
    newBloques[bloqueIndex].horarios.push({ desde: '08:00', hasta: '16:00' });
    setBloquesDias(newBloques);
  };

  const eliminarHorario = (bloqueIndex: number, horarioIndex: number) => {
    const newBloques = [...bloquesDias];
    newBloques[bloqueIndex].horarios = newBloques[bloqueIndex].horarios.filter(
      (_: any, i: number) => i !== horarioIndex
    );
    setBloquesDias(newBloques);
  };

  const updateHorario = (bloqueIndex: number, horarioIndex: number, field: 'desde' | 'hasta', value: string) => {
    const newBloques = [...bloquesDias];
    newBloques[bloqueIndex].horarios[horarioIndex][field] = value;
    setBloquesDias(newBloques);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  // Get abbreviated schedule for preview
  const getSchedulePreview = () => {
    if (bloquesDias.length === 0 || !bloquesDias[0].horarios.length) {
      return null;
    }

    const activeDays = Object.entries(bloquesDias[0].dias)
      .filter(([_, active]) => active)
      .map(([day]) => day);

    const firstHorario = bloquesDias[0].horarios[0];
    
    return {
      days: activeDays,
      time: `${firstHorario.desde.slice(0, 2)} ac. - ${firstHorario.hasta.slice(0, 2)} ac.`
    };
  };

  const schedulePreview = getSchedulePreview();

  return (
    <div className="flex gap-12">
      {/* Left side - Form */}
      <div className="flex-1 max-w-md">
        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl mb-6">
          5
        </div>
        
        <h2 className="text-3xl text-gray-800 mb-4">Crea tu agenda</h2>
        <p className="text-gray-600 mb-6">
          Configura tus días y horarios de atención para que los pacientes puedan reservar citas.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 mb-8">
          <div className="text-blue-600 mt-1">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-sm text-gray-700">
            Crea una agenda para que los pacientes puedan reservar citas contigo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {bloquesDias.map((bloque, bloqueIndex) => (
            <div key={bloqueIndex} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Definir días</span>
                </div>
                {bloquesDias.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarBloqueDias(bloqueIndex)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Días de la semana */}
              <div className="flex gap-2 mb-4">
                {diasSemana.map(dia => (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => toggleDia(bloqueIndex, dia)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      bloque.dias[dia]
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {dia}
                  </button>
                ))}
              </div>

              {/* Horarios */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-700">Definir horarios</span>
                </div>

                {bloque.horarios.map((horario: any, horarioIndex: number) => (
                  <div key={horarioIndex} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-sm text-gray-600">De</label>
                      <input
                        type="time"
                        value={horario.desde}
                        onChange={(e) => updateHorario(bloqueIndex, horarioIndex, 'desde', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      />
                      <label className="text-sm text-gray-600">Hasta</label>
                      <input
                        type="time"
                        value={horario.hasta}
                        onChange={(e) => updateHorario(bloqueIndex, horarioIndex, 'hasta', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>
                    
                    {bloque.horarios.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarHorario(bloqueIndex, horarioIndex)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => agregarHorario(bloqueIndex)}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar horarios
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={agregarBloqueDias}
            className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar días
          </button>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              En otro momento
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </form>
      </div>

      {/* Right side - Preview */}
      <div className="flex-1">
        <div className="sticky top-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* VetConnect Header */}
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 px-6 py-3 flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                <span className="text-blue-600 text-xs">🔗</span>
              </div>
              <span className="text-white">VetConnect</span>
              <div className="ml-auto w-6 h-6 bg-white/20 rounded-full"></div>
            </div>

            {/* Profile Section */}
            <div className="bg-gradient-to-b from-blue-100 to-blue-50 px-6 py-8">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center">
                    <span className="text-4xl">👤</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl text-gray-800 mb-1">
                  {`${profileData.titulo} ${profileData.nombre} ${profileData.apellido}`}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {profileData.especialidad}
                </p>
                
                <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                  <button className="flex items-center gap-1 hover:text-blue-600">
                    <span>♡</span> Guardar
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-600">
                    <span>↗</span> Compartir
                  </button>
                </div>
              </div>

              <button className="w-full mt-4 bg-teal-700 text-white py-2.5 rounded-lg hover:bg-teal-800 transition-colors">
                Agendar cita
              </button>
            </div>

            {/* Consultorio y Agenda */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-gray-600">🏥</span>
                <h4 className="text-sm text-gray-700">Consultorio y Agenda</h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 text-xs mt-0.5">📍</span>
                  <div>
                    <p className="text-xs text-gray-500">Consultorio 1</p>
                    <p className="text-xs text-gray-700">
                      {profileData.nombreCentro}: {profileData.direccionCentro}, {profileData.ciudadCentro}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 text-xs">📞</span>
                  <p className="text-xs text-gray-700">
                    {profileData.telefonoCentro}
                  </p>
                </div>
              </div>

              {/* Calendar preview with schedule */}
              {schedulePreview && (
                <div className="mt-4 bg-blue-50 rounded p-3">
                  <div className="grid grid-cols-7 gap-1 text-xs text-center mb-3">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, i) => {
                      const abbr = diasSemana[i];
                      const isActive = schedulePreview.days.includes(abbr);
                      return (
                        <div 
                          key={i} 
                          className={`py-1 rounded ${
                            isActive ? 'bg-blue-600 text-white' : 'text-gray-400'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-700">
                      {schedulePreview.time}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Información del profesional */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-gray-600">ℹ️</span>
                <h4 className="text-sm text-gray-700">Información del profesional</h4>
              </div>
              
              <div className="bg-white rounded-lg p-3 min-h-[60px] border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Acerca de mí</p>
                <p className="text-xs text-gray-400 italic">
                  Breve descripción...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
