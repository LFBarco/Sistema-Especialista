import { useState } from 'react';
import { Camera, Upload } from 'lucide-react';

interface PhotoBioStepProps {
  fotoPerfil: string;
  setFotoPerfil: (foto: string) => void;
  biografia: string;
  setBiografia: (bio: string) => void;
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
    estadoCentro: string;
    telefonoCentro: string;
  };
  bloquesDias?: any[];
}

export function PhotoBioStep({ 
  fotoPerfil,
  setFotoPerfil,
  biografia, 
  setBiografia, 
  onNext, 
  onBack,
  onSkip,
  profileData,
  bloquesDias
}: PhotoBioStepProps) {
  const [charCount, setCharCount] = useState(biografia.length);
  const maxChars = 2600;

  const handleBiografiaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setBiografia(text);
      setCharCount(text.length);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFotoPerfil(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  // Get schedule preview
  const getSchedulePreview = () => {
    if (!bloquesDias || bloquesDias.length === 0 || !bloquesDias[0].horarios.length) {
      return null;
    }

    const activeDays = Object.entries(bloquesDias[0].dias)
      .filter(([_, active]) => active)
      .map(([day]) => day);

    const firstHorario = bloquesDias[0].horarios[0];
    
    return {
      days: activeDays,
      time: `${firstHorario.desde.slice(0, 2)}:${firstHorario.desde.slice(3, 5)} - ${firstHorario.hasta.slice(0, 2)}:${firstHorario.hasta.slice(3, 5)}`
    };
  };

  const schedulePreview = getSchedulePreview();
  const diasSemana = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  return (
    <div className="flex gap-12">
      {/* Left side - Form */}
      <div className="flex-1 max-w-md">
        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl mb-6">
          {bloquesDias ? '7' : '5'}
        </div>
        
        <h2 className="text-3xl text-gray-800 mb-4">Sube tu foto y descripción</h2>
        <p className="text-gray-600 mb-8">
          Ingrese una imagen y una breve descripción de su biografía.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo upload */}
          <div>
            <label className="block text-sm text-gray-700 mb-4">Acerca de mí</label>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer block"
                >
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {fotoPerfil ? (
                      <img 
                        src={fotoPerfil} 
                        alt="Foto de perfil" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                        <span className="text-xs text-blue-600">Subir foto</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </label>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center mb-6">
              Puede hablar acerca de sus años de experiencia, del sector en que trabaja o sobre sus aptitudes.
            </p>

            <textarea
              value={biografia}
              onChange={handleBiografiaChange}
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Breve descripción..."
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {charCount}/{maxChars}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
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
              Guardar
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
                <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  {fotoPerfil ? (
                    <img 
                      src={fotoPerfil} 
                      alt="Foto de perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center">
                      <span className="text-4xl">👤</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl text-gray-800 mb-1">
                  {`${profileData.titulo} ${profileData.nombre} ${profileData.apellido}`}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{profileData.especialidad}</p>
                
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
                      Centro {profileData.nombreCentro}: {profileData.direccionCentro}, {profileData.ciudadCentro}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 text-xs">📞</span>
                  <p className="text-xs text-gray-700">
                    Teléfono del Centro Médico: {profileData.telefonoCentro}
                  </p>
                </div>
              </div>

              {/* Calendar preview with schedule */}
              {schedulePreview && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm text-gray-700">Agenda</h5>
                  </div>
                  <div className="bg-blue-50 rounded p-3">
                    <div className="grid grid-cols-7 gap-1 text-xs text-center mb-3">
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, i) => {
                        const abbr = diasSemana[i];
                        const isActive = schedulePreview.days.includes(abbr);
                        return (
                          <div 
                            key={i} 
                            className={`py-1 rounded text-[10px] ${
                              isActive ? 'bg-blue-600 text-white' : 'text-gray-400'
                            }`}
                          >
                            {day.slice(0, 3)}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Mini calendar grid */}
                    <div className="grid grid-cols-7 gap-1 text-xs text-center mb-3">
                      {[...Array(35)].map((_, i) => (
                        <div
                          key={i}
                          className={`py-1 text-[10px] ${
                            i % 7 === 5 || i % 7 === 6
                              ? 'text-gray-300'
                              : 'text-gray-600'
                          }`}
                        >
                          {(i % 28) + 1}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 gap-1 text-center">
                      {['08:00', '10:00', '12:00', '14:00', '16:00'].map((time, i) => (
                        <div key={i} className="bg-white rounded py-2 text-[10px] text-gray-600">
                          {time}
                        </div>
                      ))}
                    </div>
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
              
              <div className="bg-white rounded-lg p-3 min-h-[80px] border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Acerca de mí</p>
                <p className="text-xs text-gray-700">
                  {biografia || <span className="italic text-gray-400">Breve descripción...</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
