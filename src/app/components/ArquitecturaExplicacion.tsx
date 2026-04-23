import { useState } from 'react';
import { Database, Smartphone, Globe, Zap, ArrowRight, Check, Clock, FileText, DollarSign, Filter, Building2, Palette } from 'lucide-react';
import { useApp } from '../App';

export function ArquitecturaExplicacion() {
  const { darkMode } = useApp();
  const [pasoActivo, setPasoActivo] = useState(1);

  const pasos = [
    {
      numero: 1,
      titulo: "Registro y Configuración Inicial",
      descripcion: "El doctor se registra y configura su perfil con todas sus clínicas",
      icono: Smartphone,
      color: "from-blue-500 to-cyan-500",
      detalles: [
        "Registro simplificado en un solo paso",
        "Perfil único del doctor con sus datos profesionales",
        "Agregar múltiples clínicas manualmente con nombre, contacto, teléfono y dirección",
        "Asignar código de color a cada clínica (8 colores disponibles)",
        "Sin fragmentación: Un solo perfil para todas las clínicas"
      ]
    },
    {
      numero: 2,
      titulo: "Clínica Solicita Servicio",
      descripcion: "Las clínicas envían solicitudes al doctor especialista",
      icono: Building2,
      color: "from-purple-500 to-pink-500",
      detalles: [
        "Sistema de la clínica hace petición HTTP POST",
        "Endpoint: POST /make-server-91d1f360/solicitudes",
        "Incluye datos del paciente, tipo de servicio, urgencia, fecha y hora solicitada",
        "Datos almacenados en Supabase PostgreSQL (tabla kv_store)",
        "Notificación en tiempo real al doctor"
      ]
    },
    {
      numero: 3,
      titulo: "Revisión en Dashboard con Filtros",
      descripcion: "El doctor visualiza todas las solicitudes con filtros por clínica",
      icono: Filter,
      color: "from-amber-500 to-orange-500",
      detalles: [
        "Dashboard con KPIs filtrados por clínica seleccionada",
        "Filtro visual con ClinicaFilter (dropdown con códigos de color)",
        "Vista unificada de todas las clínicas o filtrada por una específica",
        "Indicadores visuales de color en cada solicitud",
        "Contadores actualizados dinámicamente según filtro activo"
      ]
    },
    {
      numero: 4,
      titulo: "Aceptar/Rechazar con Códigos de Color",
      descripcion: "El doctor acepta o rechaza solicitudes viendo la clínica de origen",
      icono: Check,
      color: "from-green-500 to-emerald-500",
      detalles: [
        "Cada solicitud muestra badge con color de la clínica",
        "Filtro por urgencia, estado y clínica combinados",
        "Al aceptar: Se crea servicio automáticamente en la Agenda",
        "Al rechazar: Se actualiza estado y se notifica a la clínica",
        "Sincronización instantánea con Supabase"
      ]
    },
    {
      numero: 5,
      titulo: "Gestión de Agenda Multi-Clínica",
      descripcion: "Calendario visual con códigos de color por clínica",
      icono: Clock,
      color: "from-teal-500 to-cyan-500",
      detalles: [
        "Vista Mes, Semana, Día y Lista (Agenda)",
        "Filtro de clínica aplicado a todas las vistas",
        "Indicadores de color en cada cita según clínica de origen",
        "Bordes de color en eventos del calendario",
        "Evitar conflictos de horarios entre clínicas"
      ]
    },
    {
      numero: 6,
      titulo: "Servicios y Facturación por Clínica",
      descripcion: "Control completo con filtros y desglose por clínica",
      icono: FileText,
      color: "from-indigo-500 to-purple-500",
      detalles: [
        "Tabla de servicios con badges de color por clínica",
        "Filtros combinados: estado + clínica + búsqueda",
        "Generar facturas automáticamente desde servicios completados",
        "Módulo de Facturación con filtro de clínica",
        "Estadísticas filtradas por clínica seleccionada"
      ]
    },
    {
      numero: 7,
      titulo: "Finanzas con Desglose por Clínica",
      descripcion: "Análisis financiero completo con gráficos de colores",
      icono: DollarSign,
      color: "from-rose-500 to-pink-500",
      detalles: [
        "KPIs financieros filtrados por clínica",
        "Desglose visual de ingresos por clínica con gráficos de colores",
        "Barras de progreso con colores específicos de cada clínica",
        "Tabla de ingresos con badges de color",
        "Filtros por periodo (mes/año) + clínica combinados"
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className={darkMode ? 'text-white' : 'text-gray-900'}>
          <Zap className="inline w-8 h-8 text-purple-500 mr-2" />
          Cómo Funciona el Sistema
        </h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
          Sistema corporativo con perfil único, filtros por clínica y códigos de colores visuales
        </p>
      </div>

      {/* Enfoque Actual */}
      <div className={`${darkMode ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-700' : 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300'} rounded-xl border p-6`}>
        <div className="flex items-start">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
            <Palette className="w-8 h-8 text-purple-600" />
          </div>
          <div className="ml-4 flex-1">
            <h2 className={darkMode ? 'text-white' : 'text-gray-900'}>Enfoque Simplificado y Visual</h2>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              El sistema utiliza un <strong>perfil único</strong> donde el doctor maneja todas sus clínicas con <strong>filtros y códigos de colores</strong>, 
              eliminando el flujo fragmentado de múltiples pasos y selección de clínica.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                <Check className="w-5 h-5 text-green-500 mb-2" />
                <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Perfil Único:</strong> Un solo perfil del doctor para todas las clínicas
                </p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                <Check className="w-5 h-5 text-blue-500 mb-2" />
                <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Filtros Visuales:</strong> Componente ClinicaFilter en todos los módulos
                </p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                <Check className="w-5 h-5 text-purple-500 mb-2" />
                <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Códigos de Color:</strong> 8 colores para identificar cada clínica visualmente
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modo Actual vs Futuro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
          <div className="flex items-center mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <h2 className={darkMode ? 'text-white' : 'text-gray-900'}>Estado Actual</h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Backend Supabase Integrado</p>
            </div>
          </div>
          <ul className="space-y-2">
            <li className={`flex items-start text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Base de datos PostgreSQL en Supabase
            </li>
            <li className={`flex items-start text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              API RESTful con Hono web server
            </li>
            <li className={`flex items-start text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Sincronización en tiempo real
            </li>
            <li className={`flex items-start text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Sistema de filtros por clínica en todos los módulos
            </li>
            <li className={`flex items-start text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Códigos de colores visuales integrados
            </li>
          </ul>
          <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <p className={`text-xs ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
              ✨ Sistema 100% funcional con backend completo
            </p>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
          <div className="flex items-center mb-4">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <div className="ml-3">
              <h2 className={darkMode ? 'text-white' : 'text-gray-900'}>Mejoras Futuras</h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Funcionalidades avanzadas</p>
            </div>
          </div>
          <ul className="space-y-2">
            <li className={`flex items-start text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <ArrowRight className="w-4 h-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              Autenticación con Google OAuth
            </li>
            <li className={`flex items-start text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <ArrowRight className="w-4 h-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              Notificaciones push en tiempo real
            </li>
            <li className={`flex items-start text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <ArrowRight className="w-4 h-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              Exportación de reportes en PDF/Excel
            </li>
            <li className={`flex items-start text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <ArrowRight className="w-4 h-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              Integración con calendarios externos (Google Calendar)
            </li>
            <li className={`flex items-start text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <ArrowRight className="w-4 h-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              App móvil nativa (iOS/Android)
            </li>
          </ul>
          <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
            <p className={`text-xs ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
              🚀 Roadmap de desarrollo continuo
            </p>
          </div>
        </div>
      </div>

      {/* Flujo Paso a Paso */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
        <h2 className={`${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Flujo Completo del Sistema</h2>
        
        {/* Timeline */}
        <div className="space-y-6">
          {pasos.map((paso, index) => {
            const Icono = paso.icono;
            const isActivo = pasoActivo === paso.numero;
            
            return (
              <div key={paso.numero}>
                <div
                  onClick={() => setPasoActivo(paso.numero)}
                  className={`cursor-pointer transition-all duration-300 ${
                    isActivo ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  <div className="flex items-start">
                    {/* Icono y línea */}
                    <div className="relative flex flex-col items-center mr-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${paso.color} flex items-center justify-center shadow-lg ${
                        isActivo ? 'ring-4 ring-purple-300 dark:ring-purple-700' : ''
                      }`}>
                        <Icono className="w-6 h-6 text-white" />
                      </div>
                      {index < pasos.length - 1 && (
                        <div className={`w-0.5 h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} mt-2`} />
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1">
                      <div className={`p-4 rounded-lg transition-all ${
                        isActivo 
                          ? darkMode 
                            ? 'bg-gray-700 shadow-xl' 
                            : 'bg-gradient-to-r from-purple-50 to-pink-50 shadow-xl'
                          : darkMode
                            ? 'bg-gray-900/50'
                            : 'bg-gray-50'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-600' : 'bg-white'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Paso {paso.numero}
                              </span>
                              <h3 className={darkMode ? 'text-white' : 'text-gray-900'}>{paso.titulo}</h3>
                            </div>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {paso.descripcion}
                            </p>
                          </div>
                          <ArrowRight className={`w-5 h-5 ${isActivo ? 'text-purple-500' : darkMode ? 'text-gray-600' : 'text-gray-400'} ml-4`} />
                        </div>

                        {/* Detalles expandidos */}
                        {isActivo && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 animate-slide-in">
                            <ul className="space-y-2">
                              {paso.detalles.map((detalle, idx) => (
                                <li key={idx} className={`flex items-start text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  <Check className={`w-4 h-4 bg-gradient-to-br ${paso.color} text-white rounded-full p-0.5 mr-2 mt-0.5 flex-shrink-0`} />
                                  {detalle}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Características Clave */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
        <h2 className={`${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Características Clave del Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
            <Building2 className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className={`text-sm mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Gestión Multi-Clínica</h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manejo centralizado de múltiples clínicas con filtros visuales y códigos de color únicos
            </p>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
            <Filter className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className={`text-sm mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Filtros Inteligentes</h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Componente ClinicaFilter reutilizable en Dashboard, Solicitudes, Agenda, Servicios, Facturación y Finanzas
            </p>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
            <Palette className="w-8 h-8 text-pink-500 mb-3" />
            <h3 className={`text-sm mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Códigos Visuales</h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              8 colores distintos (azul, verde, amarillo, morado, rosa, naranja, rojo, cian) para identificar clínicas
            </p>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
            <Database className="w-8 h-8 text-green-500 mb-3" />
            <h3 className={`text-sm mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Backend Supabase</h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              PostgreSQL con API RESTful, sincronización en tiempo real y persistencia de datos
            </p>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
            <Smartphone className="w-8 h-8 text-indigo-500 mb-3" />
            <h3 className={`text-sm mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Responsive Design</h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Diseño adaptable a móvil, tablet y desktop con navegación optimizada para cada dispositivo
            </p>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
            <DollarSign className="w-8 h-8 text-emerald-500 mb-3" />
            <h3 className={`text-sm mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Finanzas Visuales</h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Desglose de ingresos por clínica con gráficos de colores y barras de progreso personalizadas
            </p>
          </div>
        </div>
      </div>

      {/* Stack Tecnológico */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
        <h2 className={`${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Stack Tecnológico Actual</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
            <h3 className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Frontend</h3>
            <ul className={`space-y-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <li>✅ React + TypeScript</li>
              <li>✅ Tailwind CSS v4</li>
              <li>✅ Lucide Icons</li>
              <li>✅ Recharts (gráficos)</li>
              <li>✅ Sonner (notificaciones)</li>
            </ul>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
            <h3 className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Backend</h3>
            <ul className={`space-y-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <li>✅ Supabase (PostgreSQL)</li>
              <li>✅ Hono Web Server</li>
              <li>✅ Edge Functions (Deno)</li>
              <li>✅ KV Store (tabla principal)</li>
              <li>✅ API RESTful</li>
            </ul>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
            <h3 className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Componentes</h3>
            <ul className={`space-y-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <li>✅ ClinicaFilter (reutilizable)</li>
              <li>✅ Sidebar + MobileNav</li>
              <li>✅ Header responsivo</li>
              <li>✅ Cards + Tabs + Modals</li>
              <li>✅ Theme oscuro/claro</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Ejemplo de Código */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
        <h2 className={`${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Uso del Componente ClinicaFilter</h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
          Así se implementa el filtro de clínicas en cualquier módulo:
        </p>
        
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-900'} rounded-lg p-4 overflow-x-auto`}>
          <pre className="text-sm text-green-400">
{`// Importar el componente y funciones helper
import { ClinicaFilter, getClinicaColor } from './ClinicaFilter';

// En el componente
const { userClinicas, getClinicaByNombre } = useApp();
const [selectedClinica, setSelectedClinica] = useState('todas');

// Renderizar el filtro
<ClinicaFilter
  clinicas={userClinicas}
  selectedClinica={selectedClinica}
  onSelectClinica={setSelectedClinica}
/>

// Usar el filtro en los datos
const datosFiltrados = datos.filter(item => {
  const cumpleClinica = selectedClinica === 'todas' || (() => {
    const clinica = getClinicaByNombre(item.clinica);
    return clinica?.id === selectedClinica;
  })();
  return cumpleClinica;
});

// Mostrar badge con color
const clinica = getClinicaByNombre(item.clinica);
<div className="flex items-center gap-2">
  {clinica && (
    <div className={\`w-3 h-3 rounded-full \${getClinicaColor(clinica.color)}\`} />
  )}
  {item.clinica}
</div>`}
          </pre>
        </div>

        <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
          <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
            💡 <strong>Ventaja:</strong> El componente ClinicaFilter es reutilizable en todos los módulos, 
            manteniendo consistencia visual y funcional en toda la aplicación.
          </p>
        </div>
      </div>
    </div>
  );
}
