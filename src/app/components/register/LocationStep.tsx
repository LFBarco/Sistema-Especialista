import { useState } from 'react';
import { MapPin } from 'lucide-react';

interface LocationStepProps {
  direccionCentro: string;
  ciudadCentro: string;
  estadoCentro: string;
  paisCentro: string;
  nombreCentro: string;
  mapPosition: [number, number];
  setMapPosition: (pos: [number, number]) => void;
  onNext: () => void;
  onBack: () => void;
  profileData: {
    titulo: string;
    nombre: string;
    apellido: string;
    especialidad: string;
    telefonoCentro: string;
  };
}

export function LocationStep({ 
  direccionCentro, 
  ciudadCentro, 
  estadoCentro, 
  paisCentro,
  nombreCentro,
  mapPosition,
  setMapPosition,
  onNext, 
  onBack,
  profileData
}: LocationStepProps) {
  const [markerPos, setMarkerPos] = useState(mapPosition);
  
  const direccionCompleta = `${direccionCentro}, ${ciudadCentro}, ${estadoCentro}, ${paisCentro}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMapPosition(markerPos);
    onNext();
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Simular cambio de posición del marcador en el mapa
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convertir coordenadas de píxel a lat/lng (simulado)
    const lat = 4.7110 + (y - rect.height / 2) / 1000;
    const lng = -74.0721 + (x - rect.width / 2) / 1000;
    
    setMarkerPos([lat, lng]);
  };

  // Simulated map click handler (generates a static map image with marker)
  const mapImageUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-veterinary+3B82F6(${mapPosition[1]},${mapPosition[0]})/${mapPosition[1]},${mapPosition[0]},13,0/500x400@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;

  return (
    <div className="flex gap-12">
      {/* Left side - Map */}
      <div className="flex-1 max-w-md">
        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl mb-6">
          3
        </div>
        
        <h2 className="text-3xl text-gray-800 mb-4">Ubica el centro veterinario</h2>
        <p className="text-gray-600 mb-6">
          Necesitamos saber dónde atiendes. Marca en el mapa la ubicación exacta del centro veterinario.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 mb-8">
          <div className="text-blue-600 mt-1">
            <MapPin className="w-5 h-5" />
          </div>
          <p className="text-sm text-gray-700">
            Ubica el pin en la dirección exacta.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Simulated Map */}
          <div 
            onClick={handleMapClick}
            className="relative w-full h-[400px] bg-gray-200 rounded-lg overflow-hidden cursor-crosshair mb-4"
            style={{
              backgroundImage: `url("https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-74.0721,4.7110,13,0/400x400?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Marker */}
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full"
              style={{ width: '30px', height: '40px' }}
            >
              <svg viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="#3B82F6"/>
                <circle cx="12" cy="12" r="6" fill="white"/>
              </svg>
            </div>

            {/* Leaflet attribution */}
            <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs text-gray-600">
              🍃 Leaflet | © OpenStreetMap
            </div>
          </div>

          {/* Address display */}
          <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              {direccionCompleta}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Anterior
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirmar ubicación
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
                  {profileData.titulo && profileData.nombre && profileData.apellido
                    ? `${profileData.titulo} ${profileData.nombre} ${profileData.apellido}`
                    : 'Tu nombre completo'}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {profileData.especialidad || 'Especialidad profesional'}
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
                      {nombreCentro || 'Centro Veterinario'}: {direccionCompleta}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 text-xs">📞</span>
                  <p className="text-xs text-gray-700">
                    {profileData.telefonoCentro || 'Teléfono del Centro'}
                  </p>
                </div>
              </div>
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