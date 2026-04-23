import { useState } from 'react';
import { Code, Copy, Check, Key, AlertCircle, BookOpen, Zap } from 'lucide-react';
import { useApp } from '../App';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function ApiDocs() {
  const { darkMode, userClinicas } = useApp();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const apiBaseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-91d1f360`;

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Código copiado al portapapeles');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const ejemploJavaScript = `// Ejemplo de integración desde el sistema de la clínica
const crearSolicitud = async () => {
  const response = await fetch('${apiBaseUrl}/api/solicitudes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${publicAnonKey}',
      'X-API-Key': 'TU_API_KEY_AQUI' // API Key de tu clínica
    },
    body: JSON.stringify({
      tipo: "Ecocardiograma Doppler",
      paciente: "Max",
      especie: "Canino - Labrador",
      fechaSolicitada: "2025-01-25",
      horaSolicitada: "10:00",
      urgencia: "alta",
      descripcion: "Paciente con soplo cardíaco grado III",
      tarifa: 350
    })
  });

  const data = await response.json();
  console.log('Solicitud creada:', data);
  return data;
};

crearSolicitud();`;

  const ejemploPython = `import requests
import json
from datetime import datetime

def crear_solicitud():
    url = '${apiBaseUrl}/solicitudes'
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${publicAnonKey}',
        'X-API-Key': 'TU_API_KEY_AQUI'  # API Key de tu clínica
    }
    
    data = {
        'clinica': 'Clínica Veterinaria VetPlus',
        'tipo': 'Ecocardiograma Doppler',
        'paciente': 'Max',
        'especie': 'Canino - Labrador',
        'fechaSolicitada': '2025-01-25',
        'horaSolicitada': '10:00',
        'urgencia': 'alta',
        'descripcion': 'Paciente con soplo cardíaco grado III',
        'tarifa': 350,
        'direccion': 'Av. Principal 123',
        'estado': 'pendiente',
        'fechaSolicitud': datetime.now().isoformat()
    }
    
    response = requests.post(url, headers=headers, json=data)
    result = response.json()
    print('Solicitud creada:', result)
    return result

crear_solicitud()`;

  const ejemploPHP = `<?php
$url = '${apiBaseUrl}/solicitudes';

$headers = [
    'Content-Type: application/json',
    'Authorization: Bearer ${publicAnonKey}',
    'X-API-Key: TU_API_KEY_AQUI' // API Key de tu clínica
];

$data = [
    'clinica' => 'Clínica Veterinaria VetPlus',
    'tipo' => 'Ecocardiograma Doppler',
    'paciente' => 'Max',
    'especie' => 'Canino - Labrador',
    'fechaSolicitada' => '2025-01-25',
    'horaSolicitada' => '10:00',
    'urgencia' => 'alta',
    'descripcion' => 'Paciente con soplo cardíaco grado III',
    'tarifa' => 350,
    'direccion' => 'Av. Principal 123',
    'estado' => 'pendiente',
    'fechaSolicitud' => date('c')
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
echo 'Solicitud creada: ' . print_r($result, true);
?>`;

  const [activeTab, setActiveTab] = useState('javascript');

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className={darkMode ? 'text-white' : 'text-gray-900'}>
          <BookOpen className="inline w-8 h-8 text-purple-500 mr-2" />
          Documentación de API
        </h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
          Integra tu sistema de clínica con nuestra API RESTful
        </p>
      </div>

      {/* Alert de Seguridad */}
      <div className={`${darkMode ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-200'} rounded-xl border p-4`}>
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
          <div>
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
              Importante: Seguridad de API Keys
            </h3>
            <p className={`text-sm mt-1 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
              Nunca compartas tu API Key públicamente. Úsala solo en el backend de tu sistema. 
              Si crees que tu API Key fue comprometida, genera una nueva inmediatamente desde el módulo de Clínicas.
            </p>
          </div>
        </div>
      </div>

      {/* Configuración Base */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Configuración Base
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              URL Base de la API
            </label>
            <div className="flex items-center gap-2 mt-1">
              <code className={`flex-1 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-900 text-green-400' : 'bg-gray-100 text-green-600'} font-mono text-sm`}>
                {apiBaseUrl}
              </code>
              <button
                onClick={() => handleCopyCode(apiBaseUrl, 'base-url')}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
              >
                {copiedCode === 'base-url' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Authorization Token (Supabase)
            </label>
            <div className="flex items-center gap-2 mt-1">
              <code className={`flex-1 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-900 text-green-400' : 'bg-gray-100 text-green-600'} font-mono text-sm overflow-x-auto`}>
                Bearer {publicAnonKey}
              </code>
              <button
                onClick={() => handleCopyCode(`Bearer ${publicAnonKey}`, 'auth-token')}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
              >
                {copiedCode === 'auth-token' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints Disponibles */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Endpoints Disponibles
        </h2>

        <div className="space-y-4">
          {/* POST Solicitudes */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">POST</span>
              <code className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                /api/solicitudes
              </code>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              Crea una nueva solicitud de servicio
            </p>
            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <strong>Headers requeridos:</strong> Content-Type, Authorization, X-API-Key
            </div>
          </div>

          {/* GET Solicitudes */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">GET</span>
              <code className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                /api/solicitudes
              </code>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              Obtiene todas las solicitudes de la clínica autenticada
            </p>
            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <strong>Headers requeridos:</strong> Authorization, X-API-Key
            </div>
          </div>

          {/* GET Solicitud por ID */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">GET</span>
              <code className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                /api/solicitudes/:id
              </code>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              Obtiene el estado de una solicitud específica
            </p>
            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <strong>Headers requeridos:</strong> Authorization, X-API-Key
            </div>
          </div>
        </div>
      </div>

      {/* Ejemplo de Código */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Ejemplos de Código
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('javascript')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'javascript'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            JavaScript
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'python'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Python
          </button>
          <button
            onClick={() => setActiveTab('php')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'php'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            PHP
          </button>
        </div>

        {/* Code Block */}
        <div className="relative">
          <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-900'} rounded-lg p-4 overflow-x-auto`}>
            <pre className="text-sm text-green-400 font-mono">
              {activeTab === 'javascript' && ejemploJavaScript}
              {activeTab === 'python' && ejemploPython}
              {activeTab === 'php' && ejemploPHP}
            </pre>
          </div>
          <button
            onClick={() => handleCopyCode(
              activeTab === 'javascript' ? ejemploJavaScript :
              activeTab === 'python' ? ejemploPython : ejemploPHP,
              `code-${activeTab}`
            )}
            className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {copiedCode === `code-${activeTab}` ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Estructura de Datos */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Estructura de Datos - Solicitud
        </h2>

        <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-900'} rounded-lg p-4 overflow-x-auto`}>
          <pre className="text-sm text-green-400 font-mono">
{`{
  "clinica": "string",           // Nombre de la clínica (requerido)
  "tipo": "string",              // Tipo de servicio (requerido)
  "paciente": "string",          // Nombre del paciente (requerido)
  "especie": "string",           // Especie del animal (requerido)
  "fechaSolicitada": "YYYY-MM-DD", // Fecha deseada (requerido)
  "horaSolicitada": "HH:mm",     // Hora deseada (requerido)
  "urgencia": "baja|media|alta", // Nivel de urgencia (requerido)
  "descripcion": "string",       // Detalles del caso (opcional)
  "tarifa": number,              // Monto del servicio (requerido)
  "direccion": "string",         // Dirección de la clínica (opcional)
  "estado": "pendiente",         // Siempre "pendiente" al crear
  "fechaSolicitud": "ISO 8601"   // Timestamp de creación (requerido)
}`}
          </pre>
        </div>
      </div>

      {/* Códigos de Respuesta */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Códigos de Respuesta HTTP
        </h2>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">200</span>
            <div className="flex-1">
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>OK</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                La solicitud se procesó correctamente
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-semibold rounded">400</span>
            <div className="flex-1">
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bad Request</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Faltan campos requeridos o datos inválidos
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="px-2 py-1 bg-orange-600 text-white text-xs font-semibold rounded">401</span>
            <div className="flex-1">
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Unauthorized</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                API Key inválida o faltante
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">500</span>
            <div className="flex-1">
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Server Error</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Error interno del servidor
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className={`${darkMode ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-700' : 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300'} rounded-xl border p-6`}>
        <div className="flex items-start gap-4">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
            <Key className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ¿Necesitas una API Key?
            </h3>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Genera tu API Key única desde el módulo de <strong>Clínicas</strong>. Cada clínica tiene su propia API Key para seguridad.
            </p>
            <button
              onClick={() => window.location.hash = '#clinicas'}
              className="mt-3 px-4 py-2 text-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              Ir a Clínicas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}