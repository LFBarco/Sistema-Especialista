import { CheckCircle, Clock, FileText, DollarSign } from 'lucide-react';
import { useApp } from '../App';

export function RecentActivity() {
  const { servicios, solicitudes, facturas, darkMode, navegarA } = useApp();

  // Crear actividades recientes combinando servicios, solicitudes y facturas
  const activities = [
    ...servicios.slice(-3).map(s => ({
      id: `servicio-${s.id}`,
      type: 'servicio',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: darkMode ? 'bg-green-900/30' : 'bg-green-100',
      title: s.estado === 'completado' ? 'Servicio completado' : 'Servicio confirmado',
      description: `${s.tipo} en ${s.clinica} - ${s.paciente}`,
      time: new Date(s.fecha).toLocaleDateString('es-ES'),
      amount: `$${s.tarifa}`
    })),
    ...solicitudes.filter(s => s.estado === 'pendiente').slice(-2).map(s => ({
      id: `solicitud-${s.id}`,
      type: 'solicitud',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: darkMode ? 'bg-amber-900/30' : 'bg-amber-100',
      title: 'Nueva solicitud recibida',
      description: `${s.clinica} - ${s.tipo}`,
      time: new Date(s.fechaSolicitud).toLocaleDateString('es-ES'),
      amount: null
    })),
    ...facturas.slice(-2).map(f => ({
      id: `factura-${f.id}`,
      type: 'factura',
      icon: f.estado === 'pagada' ? DollarSign : FileText,
      color: f.estado === 'pagada' ? 'text-green-600' : 'text-blue-600',
      bgColor: f.estado === 'pagada' 
        ? darkMode ? 'bg-green-900/30' : 'bg-green-100'
        : darkMode ? 'bg-blue-900/30' : 'bg-blue-100',
      title: f.estado === 'pagada' ? 'Pago recibido' : 'Factura generada',
      description: `${f.numero} - ${f.clinica}`,
      time: new Date(f.fecha).toLocaleDateString('es-ES'),
      amount: f.estado === 'pagada' ? `+$${f.total}` : `$${f.total}`
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6 hover:shadow-xl transition-shadow`}>
      <div className="mb-6">
        <h2 className={darkMode ? 'text-white' : 'text-gray-900'}>Actividad Reciente</h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Últimas actualizaciones de tu cuenta</p>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div 
              key={activity.id} 
              className="flex items-start space-x-4 cursor-pointer rounded-lg p-2 -mx-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              onClick={() => {
                if (activity.type === 'servicio') navegarA('servicios');
                else if (activity.type === 'solicitud') navegarA('solicitudes');
                else if (activity.type === 'factura') navegarA('finanzas');
              }}
            >
              <div className={`${activity.bgColor} ${activity.color} p-2 rounded-lg flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{activity.title}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-0.5`}>{activity.description}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>{activity.time}</p>
                  </div>
                  {activity.amount && (
                    <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'} ml-4 flex-shrink-0`}>
                      {activity.amount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button 
        onClick={() => navegarA('servicios')}
        className={`w-full mt-6 py-2 text-sm ${
        darkMode 
          ? 'text-purple-400 hover:bg-gray-700' 
          : 'text-purple-600 hover:bg-purple-50'
      } rounded-lg transition-colors font-medium`}>
        Ver todo el historial
      </button>
    </div>
  );
}