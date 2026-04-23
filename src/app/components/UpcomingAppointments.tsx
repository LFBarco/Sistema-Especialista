import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import { useApp } from '../App';

export function UpcomingAppointments() {
  const { servicios, darkMode, navegarA } = useApp();

  const proximosServicios = servicios
    .filter(s => s.estado === 'confirmado' && new Date(s.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 3);

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6 hover:shadow-xl transition-shadow`}>
      <div className="mb-6">
        <h2 className={darkMode ? 'text-white' : 'text-gray-900'}>Próximos Servicios</h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Esta semana</p>
      </div>

      <div className="space-y-4">
        {proximosServicios.map((appointment) => (
          <div
            key={appointment.id}
            onClick={() => navegarA('servicios', { servicioId: appointment.id })}
            className={`border ${darkMode ? 'border-gray-700 hover:border-purple-500' : 'border-gray-200 hover:border-purple-300'} rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer group/item`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{appointment.tipo}</h3>
              <div className="flex items-center gap-1.5">
                <span className="text-xs px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded">
                  Confirmado
                </span>
                <ChevronRight className={`w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-opacity ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            </div>
            
            <div className={`space-y-1.5 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="flex items-center">
                <MapPin className={`w-3.5 h-3.5 mr-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                {appointment.clinica}
              </div>
              <div className="flex items-center">
                <Calendar className={`w-3.5 h-3.5 mr-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                {new Date(appointment.fecha).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short'
                })}
              </div>
              {appointment.hora && (
                <div className="flex items-center">
                  <Clock className={`w-3.5 h-3.5 mr-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  {appointment.hora}
                </div>
              )}
            </div>

            <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Paciente: <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{appointment.paciente}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {proximosServicios.length === 0 && (
        <div className="text-center py-8">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No hay servicios próximos confirmados
          </p>
        </div>
      )}

      <button 
        onClick={() => navegarA('agenda')}
        className={`w-full mt-4 py-2 text-sm ${
        darkMode 
          ? 'text-purple-400 hover:bg-gray-700' 
          : 'text-purple-600 hover:bg-purple-50'
      } rounded-lg transition-colors font-medium`}>
        Ver toda la agenda
      </button>
    </div>
  );
}