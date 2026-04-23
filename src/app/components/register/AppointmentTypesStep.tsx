import { useState } from 'react';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

interface AppointmentType {
  nombre: string;
  duracion: string;
}

interface AppointmentTypesStepProps {
  tiposCita: AppointmentType[];
  setTiposCita: (tipos: AppointmentType[]) => void;
  onNext: () => void;
  onBack: () => void;
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

export function AppointmentTypesStep({ 
  tiposCita, 
  setTiposCita, 
  onNext, 
  onBack,
  profileData 
}: AppointmentTypesStepProps) {
  const duraciones = ['00:15', '00:30', '00:45', '01:00', '01:30', '02:00', '02:30', '03:00'];

  const agregarTipoCita = () => {
    setTiposCita([...tiposCita, { nombre: '', duracion: '00:30' }]);
  };

  const eliminarTipoCita = (index: number) => {
    if (tiposCita.length > 1) {
      setTiposCita(tiposCita.filter((_, i) => i !== index));
    }
  };

  const updateTipoCita = (index: number, field: 'nombre' | 'duracion', value: string) => {
    const newTipos = [...tiposCita];
    newTipos[index][field] = value;
    setTiposCita(newTipos);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="flex gap-12">
      {/* Left side - Form */}
      <div className="flex-1 max-w-md">
        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl mb-6">
          6
        </div>
        
        <h2 className="text-3xl text-gray-800 mb-4">Verifica los tipos de cita</h2>
        <p className="text-gray-600 mb-6">
          Confirma los tipos de consulta, para que los pacientes puedan agendar de forma clara y rápida.
        </p>
        
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex gap-3 mb-8">
          <div className="text-teal-600 mt-1">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-sm text-gray-700">
            Optimiza tu agenda y facilita que los pacientes reserven correctamente.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tiposCita.map((tipo, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-end">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Nombre de la cita
                  </label>
                  <input
                    type="text"
                    value={tipo.nombre}
                    onChange={(e) => updateTipoCita(index, 'nombre', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder={index === 0 ? "Cita nueva" : index === 1 ? "Reconsulta" : `Cita ${index + 1}`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Duración
                  </label>
                  <select
                    value={tipo.duracion}
                    onChange={(e) => updateTipoCita(index, 'duracion', e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white min-w-[100px]"
                    required
                  >
                    {duraciones.map(dur => (
                      <option key={dur} value={dur}>{dur}</option>
                    ))}
                  </select>
                </div>

                {tiposCita.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarTipoCita(index)}
                    className="p-2.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={agregarTipoCita}
            className="w-full py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar tipo de cita
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
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirmar
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

            {/* Profile preview header */}
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h3 className="text-lg text-gray-800">Detalle de la cita</h3>
            </div>

            {/* Professional info */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded">
                      Profesional verificado
                    </span>
                  </div>
                  <h4 className="text-base text-gray-800 mb-0.5">
                    {`${profileData.titulo} ${profileData.nombre} ${profileData.apellido}`}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">{profileData.especialidad}</p>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <span>📍</span>
                      <span>Día y hora de cita</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>⏱️</span>
                      <span>Cambiar la fecha</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment type selector preview */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h5 className="text-sm text-gray-700 mb-3">Cuéntanos sobre la cita</h5>
              <p className="text-xs text-gray-500 mb-3">
                Por favor escucha, selecciona algunos datos sobre tu mascota y el motivo de tu consulta.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Tipo de cita</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white">
                    <option>Selecciona el tipo de cita</option>
                    {tiposCita.filter(t => t.nombre).map((tipo, idx) => (
                      <option key={idx}>{tipo.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-2">Plan Médico</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white">
                    <option>Selecciona su plan médico</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <input type="checkbox" className="rounded" />
                  <span>Es una cita con otro médico</span>
                </div>

                <button className="w-full bg-teal-700 text-white py-2.5 rounded-lg hover:bg-teal-800 transition-colors text-sm">
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
