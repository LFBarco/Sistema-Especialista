import { Edit2 } from 'lucide-react';

interface AppointmentType {
  nombre: string;
  duracion: string;
}

interface ProfilePreviewProps {
  onPublish: () => void;
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
    paisCentro: string;
    telefonoCentro: string;
    fotoPerfil: string;
    biografia: string;
  };
  bloquesDias?: any[];
  tiposCita?: AppointmentType[];
}

export function ProfilePreview({ 
  onPublish, 
  onSkip,
  profileData,
  bloquesDias,
  tiposCita
}: ProfilePreviewProps) {
  // Get schedule preview
  const getSchedulePreview = () => {
    if (!bloquesDias || bloquesDias.length === 0 || !bloquesDias[0].horarios.length) {
      return null;
    }

    const activeDays = Object.entries(bloquesDias[0].dias)
      .filter(([_, active]) => active)
      .map(([day]) => day);

    return activeDays;
  };

  const scheduleDays = getSchedulePreview();
  const diasSemana = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
  const diasCompletos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl text-gray-800 mb-2">Vista previa</h2>
        <p className="text-gray-600">
          Revisa los datos que se publicarán en tu perfil público.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Cover image with edit button */}
        <div className="relative bg-gradient-to-r from-blue-200 to-blue-300 h-32">
          <button className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-50">
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Profile photo */}
        <div className="relative px-6 pb-6">
          <div className="flex items-start justify-between -mt-16 mb-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {profileData.fotoPerfil ? (
                  <img 
                    src={profileData.fotoPerfil} 
                    alt="Foto de perfil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-blue-200 flex items-center justify-center">
                    <span className="text-5xl">👤</span>
                  </div>
                )}
              </div>
              <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 hover:bg-gray-50">
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Name and title */}
          <div className="mb-6">
            <h1 className="text-2xl text-gray-800 mb-1">
              {`${profileData.titulo} ${profileData.nombre} ${profileData.apellido}`}
            </h1>
            <p className="text-gray-600 mb-3">{profileData.especialidad}</p>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600">
                <span>♡</span> Guardar
              </button>
              <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600">
                <span>↗</span> Compartir
              </button>
            </div>
          </div>

          {/* Consultorio y Agenda section */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">🏥</span>
                <h3 className="text-sm text-gray-700">Consultorio y Agenda</h3>
              </div>
              <button className="text-blue-600 hover:text-blue-700">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded p-3 space-y-2 mb-3">
              <div className="flex items-start gap-2">
                <span className="text-gray-400 text-xs">🏢</span>
                <div>
                  <p className="text-xs text-gray-500">Consultorio 1</p>
                  <p className="text-xs text-gray-700">
                    Centro {profileData.nombreCentro}: {profileData.direccionCentro}, {profileData.ciudadCentro}, {profileData.estadoCentro}, {profileData.paisCentro}
                  </p>
                  <button className="text-xs text-blue-600 hover:text-blue-700 mt-1">Ver mapa</button>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-gray-400 text-xs">📞</span>
                <p className="text-xs text-gray-700">
                  Teléfono del Centro Médico: {profileData.telefonoCentro}
                </p>
              </div>
            </div>

            {/* Calendar grid */}
            {scheduleDays && scheduleDays.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm text-gray-700">Agenda</h4>
                  <button className="text-blue-600 hover:text-blue-700">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white rounded p-3">
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {diasCompletos.map((dia, i) => {
                      const abbr = diasSemana[i];
                      const isActive = scheduleDays.includes(abbr);
                      return (
                        <div key={i} className="text-center">
                          <div className={`text-xs py-2 rounded ${
                            isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {dia.slice(0, 3)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Date numbers */}
                  <div className="grid grid-cols-7 gap-2 mb-3">
                    {[15, 16, 17, 18, 19, 20, 21].map((day, i) => {
                      const abbr = diasSemana[i];
                      const isActive = scheduleDays.includes(abbr);
                      return (
                        <div 
                          key={i}
                          className={`text-center text-xs py-2 ${
                            isActive ? 'text-gray-700' : 'text-gray-300'
                          }`}
                        >
                          {day} dic.
                        </div>
                      );
                    })}
                  </div>

                  {/* Time slots */}
                  <div className="space-y-2">
                    {['08:00', '09:00', '10:00', '11:00', '12:00'].map((time, i) => (
                      <div key={i} className="grid grid-cols-7 gap-2">
                        {diasSemana.map((dia, j) => {
                          const isActive = scheduleDays.includes(dia);
                          return (
                            <div 
                              key={j}
                              className={`text-center text-xs py-1 rounded ${
                                isActive ? 'bg-gray-50 text-gray-600' : 'bg-gray-100 text-gray-300'
                              }`}
                            >
                              {isActive ? time : '--'}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Professional info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">ℹ️</span>
                <h3 className="text-sm text-gray-700">Información del profesional</h3>
              </div>
              <button className="text-blue-600 hover:text-blue-700">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Acerca de mí</p>
              <p className="text-sm text-gray-700">
                {profileData.biografia || <span className="italic text-gray-400">Breve descripción...</span>}
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-700 mt-2">Ver más</button>
            </div>
          </div>

          {/* Appointment types */}
          {tiposCita && tiposCita.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">📋</span>
                  <h3 className="text-sm text-gray-700">Tipos de cita</h3>
                </div>
                <button className="text-blue-600 hover:text-blue-700">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-600 mb-2">
                  Los pacientes verán los tipos de cita al reservar. La duración de la consulta se toma solo para mostrar tu agenda.
                </p>
                <ul className="space-y-1">
                  {tiposCita.filter(t => t.nombre).map((tipo, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-gray-700 rounded-full"></span>
                      {tipo.nombre} <span className="text-gray-500 text-xs">{tipo.duracion} min</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={onSkip}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Omitir y ver mi agenda
        </button>
        <button
          onClick={onPublish}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Publicar perfil público
        </button>
      </div>
    </div>
  );
}
