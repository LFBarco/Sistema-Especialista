import { useState } from 'react';
import { X } from 'lucide-react';
import { LocationStep } from './register/LocationStep';
import { UserTypeStep } from './register/UserTypeStep';
import { AgendaStep } from './register/AgendaStep';
import { AppointmentTypesStep } from './register/AppointmentTypesStep';
import { PhotoBioStep } from './register/PhotoBioStep';
import { ProfilePreview } from './register/ProfilePreview';

interface RegisterProps {
  onRegisterComplete: (userData: any) => void;
  onBackToLogin: () => void;
}

export function Register({ onRegisterComplete, onBackToLogin }: RegisterProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Paso 1: Datos personales
  const [titulo, setTitulo] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [pais, setPais] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  
  // Paso 2: Datos del centro médico
  const [nombreCentro, setNombreCentro] = useState('');
  const [paisCentro, setPaisCentro] = useState('');
  const [estadoCentro, setEstadoCentro] = useState('');
  const [ciudadCentro, setCiudadCentro] = useState('');
  const [direccionCentro, setDireccionCentro] = useState('');
  const [telefonoCentro, setTelefonoCentro] = useState('');

  // Paso 3: Ubicación del centro
  const [mapPosition, setMapPosition] = useState<[number, number]>([4.7110, -74.0721]);

  // Paso 4: Tipo de usuario
  const [tipoUsuario, setTipoUsuario] = useState<'con-agenda' | 'sin-agenda' | null>(null);

  // Paso 5: Creación de agenda (solo para usuarios con agenda)
  const [bloquesDias, setBloquesDias] = useState<any[]>([
    { 
      dias: { Lu: false, Ma: false, Mi: false, Ju: false, Vi: false, Sa: false, Do: false },
      horarios: [{ desde: '08:00', hasta: '16:00' }]
    }
  ]);

  // Paso 6: Tipos de cita (solo para usuarios con agenda)
  const [tiposCita, setTiposCita] = useState([
    { nombre: 'Cita nueva', duracion: '00:30' },
    { nombre: 'Reconsulta', duracion: '00:30' }
  ]);

  // Paso 7 (con agenda) / Paso 5 (sin agenda): Foto y biografía
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [biografia, setBiografia] = useState('');

  const titulos = ['Dr.', 'Dra.', 'MV.', 'MVZ.'];
  const paises = ['Colombia', 'México', 'Argentina', 'Chile', 'Perú', 'España', 'Venezuela', 'Ecuador'];
  const especialidades = [
    'Cardiología',
    'Neurología',
    'Oftalmología',
    'Dermatología',
    'Oncología',
    'Cirugía',
    'Traumatología',
    'Medicina Interna',
    'Anestesiología',
    'Rehabilitación',
    'Diagnóstico por Imagen',
    'Etología'
  ];

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const completeRegistration = () => {
    const userData = {
      titulo,
      nombre,
      apellido,
      pais,
      especialidad,
      nombreCentro,
      paisCentro,
      estadoCentro,
      ciudadCentro,
      direccionCentro,
      telefonoCentro,
      mapPosition,
      tipoUsuario,
      bloquesDias: tipoUsuario === 'con-agenda' ? bloquesDias : null,
      tiposCita: tipoUsuario === 'con-agenda' ? tiposCita : null,
      fotoPerfil,
      biografia
    };
    onRegisterComplete(userData);
  };

  const removeEspecialidad = () => {
    setEspecialidad('');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1606619788423-005922947e38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJpYW4lMjBwcm9mZXNzaW9uYWwlMjBjbGluaWN8ZW58MXx8fHwxNzY1OTQzNzY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-blue-800/90 to-teal-900/95"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xl">🏥</span>
            </div>
            <h1 className="text-xl">
              <span className="text-blue-600">Vet</span>
              <span className="text-gray-800">Specialist</span>
            </h1>
          </div>
          <button
            onClick={onBackToLogin}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            Iniciar sesión
          </button>
        </header>

        <div className="max-w-6xl mx-auto px-8 py-12">
          {/* Paso 1: Datos personales */}
          {currentStep === 1 && (
            <div className="flex gap-12">
              {/* Left side - Form */}
              <div className="flex-1 max-w-md">
                {/* Step indicator */}
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl mb-6">
                    1
                  </div>
                  
                  <h2 className="text-3xl text-gray-800 mb-4">Crea tu cuenta</h2>
                  <p className="text-gray-600 mb-6">
                    Ingresa tus datos personales y profesionales para iniciar tu registro en VetSpecialist.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 mb-8">
                    <div className="text-blue-600 mt-1">👤</div>
                    <p className="text-sm text-gray-700">
                      Tu perfil ayudará a que las clínicas encuentren tu perfil público.
                    </p>
                  </div>

                  <form onSubmit={handleStep1Submit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Título</label>
                      <select
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                        required
                      >
                        <option value="">Seleccione Título</option>
                        {titulos.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Ingresar nombre completo</label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Luis"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Ingresar apellido completo</label>
                      <input
                        type="text"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Barco"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">País</label>
                      <select
                        value={pais}
                        onChange={(e) => setPais(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                        required
                      >
                        <option value="">Seleccione el País</option>
                        {paises.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Especialidad</label>
                      {especialidad ? (
                        <div className="relative">
                          <div className="w-full px-4 py-3 border border-blue-500 rounded-lg bg-white flex items-center justify-between">
                            <span className="text-gray-700">{especialidad}</span>
                            <button
                              type="button"
                              onClick={removeEspecialidad}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <select
                          value={especialidad}
                          onChange={(e) => setEspecialidad(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                          required
                        >
                          <option value="">Seleccione la especialidad</option>
                          {especialidades.map(esp => (
                            <option key={esp} value={esp}>{esp}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors mt-6"
                    >
                      Crear cuenta
                    </button>
                  </form>
                </div>
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
                          {titulo && nombre && apellido
                            ? `${titulo} ${nombre} ${apellido}`
                            : 'Tu nombre completo'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">{especialidad || 'Especialidad profesional'}</p>
                        
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
                              {nombreCentro || 'Nombre del Centro Médico: Dirección'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 text-xs">📞</span>
                          <p className="text-xs text-gray-700">
                            {telefonoCentro || 'Teléfono del Centro Médico'}
                          </p>
                        </div>
                      </div>

                      {/* Calendar preview */}
                      <div className="mt-4 bg-gray-50 rounded p-3">
                        <div className="grid grid-cols-7 gap-1 text-xs text-center">
                          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                            <div key={i} className="text-gray-500 py-1">{day}</div>
                          ))}
                          {[...Array(35)].map((_, i) => (
                            <div
                              key={i}
                              className={`py-1.5 rounded ${
                                i % 7 === 0 || i % 7 === 6
                                  ? 'text-gray-300'
                                  : 'text-gray-400 hover:bg-white'
                              }`}
                            >
                              {(i % 28) + 1}
                            </div>
                          ))}
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
          )}

          {/* Paso 2: Datos del centro */}
          {currentStep === 2 && (
            <div className="flex gap-12">
              {/* Left side - Form */}
              <div className="flex-1 max-w-md">
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl mb-6">
                    2
                  </div>
                  
                  <h2 className="text-3xl text-gray-800 mb-4">Crea tu centro veterinario</h2>
                  <p className="text-gray-600 mb-6">
                    Ingresa los datos de tu centro veterinario para vincularlo a tu perfil profesional.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 mb-8">
                    <div className="text-blue-600 mt-1">📍</div>
                    <p className="text-sm text-gray-700">
                      Muestra la ubicación para que los pacientes te encuentren fácilmente.
                    </p>
                  </div>

                  <form onSubmit={handleStep2Submit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Nombre del Centro Veterinario<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={nombreCentro}
                        onChange={(e) => setNombreCentro(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Centro Veterinario Las Lunas"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        País<span className="text-red-500">*</span>
                      </label>
                      <select
                        value={paisCentro}
                        onChange={(e) => setPaisCentro(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                        required
                      >
                        <option value="">Seleccione el país</option>
                        {paises.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Estado/Provincia<span className="text-red-500">*</span>
                      </label>
                      <select
                        value={estadoCentro}
                        onChange={(e) => setEstadoCentro(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                        required
                      >
                        <option value="">Seleccione el Estado/Provincia</option>
                        <option value="Cundinamarca">Cundinamarca</option>
                        <option value="Antioquia">Antioquia</option>
                        <option value="Valle del Cauca">Valle del Cauca</option>
                        <option value="Atlántico">Atlántico</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Ciudad/Localidad<span className="text-red-500">*</span>
                      </label>
                      <select
                        value={ciudadCentro}
                        onChange={(e) => setCiudadCentro(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                        required
                      >
                        <option value="">Seleccione la Ciudad/Localidad</option>
                        <option value="Bogotá">Bogotá</option>
                        <option value="Medellín">Medellín</option>
                        <option value="Cali">Cali</option>
                        <option value="Barranquilla">Barranquilla</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Dirección<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={direccionCentro}
                        onChange={(e) => setDireccionCentro(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Virrey del Pino 2596"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Teléfono</label>
                      <input
                        type="tel"
                        value={telefonoCentro}
                        onChange={(e) => setTelefonoCentro(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="111-1111"
                      />
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Anterior
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
                          {titulo && nombre && apellido
                            ? `${titulo} ${nombre} ${apellido}`
                            : 'Tu nombre completo'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">{especialidad || 'Especialidad profesional'}</p>
                        
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
                              {nombreCentro || 'Nombre del Centro Médico: Dirección'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 text-xs">📞</span>
                          <p className="text-xs text-gray-700">
                            {telefonoCentro || 'Teléfono del Centro Médico'}
                          </p>
                        </div>
                      </div>

                      {/* Calendar preview */}
                      <div className="mt-4 bg-gray-50 rounded p-3">
                        <div className="grid grid-cols-7 gap-1 text-xs text-center">
                          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                            <div key={i} className="text-gray-500 py-1">{day}</div>
                          ))}
                          {[...Array(35)].map((_, i) => (
                            <div
                              key={i}
                              className={`py-1.5 rounded ${
                                i % 7 === 0 || i % 7 === 6
                                  ? 'text-gray-300'
                                  : 'text-gray-400 hover:bg-white'
                              }`}
                            >
                              {(i % 28) + 1}
                            </div>
                          ))}
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
          )}

          {/* Paso 3: Ubicación */}
          {currentStep === 3 && (
            <LocationStep
              direccionCentro={direccionCentro}
              ciudadCentro={ciudadCentro}
              estadoCentro={estadoCentro}
              paisCentro={paisCentro}
              nombreCentro={nombreCentro}
              mapPosition={mapPosition}
              setMapPosition={setMapPosition}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
              profileData={{
                titulo,
                nombre,
                apellido,
                especialidad,
                telefonoCentro
              }}
            />
          )}

          {/* Paso 4: Tipo de usuario */}
          {currentStep === 4 && (
            <UserTypeStep
              tipoUsuario={tipoUsuario}
              setTipoUsuario={(tipo) => {
                setTipoUsuario(tipo);
                if (tipo === 'con-agenda') {
                  setCurrentStep(5);
                } else {
                  // Sin agenda, ir a foto/bio (paso 8 temporal para diferenciar)
                  setCurrentStep(8);
                }
              }}
              onNext={() => {
                if (tipoUsuario === 'con-agenda') {
                  setCurrentStep(5);
                } else {
                  setCurrentStep(8);
                }
              }}
              onBack={() => setCurrentStep(3)}
            />
          )}

          {/* Paso 5: Creación de agenda */}
          {currentStep === 5 && tipoUsuario === 'con-agenda' && (
            <AgendaStep
              bloquesDias={bloquesDias}
              setBloquesDias={setBloquesDias}
              onNext={() => setCurrentStep(6)}
              onBack={() => setCurrentStep(4)}
              onSkip={() => setCurrentStep(6)}
              profileData={{
                titulo,
                nombre,
                apellido,
                especialidad,
                nombreCentro,
                direccionCentro,
                ciudadCentro,
                telefonoCentro
              }}
            />
          )}

          {/* Paso 6: Tipos de cita */}
          {currentStep === 6 && (
            <AppointmentTypesStep
              tiposCita={tiposCita}
              setTiposCita={setTiposCita}
              onNext={() => setCurrentStep(7)}
              onBack={() => setCurrentStep(5)}
              profileData={{
                titulo,
                nombre,
                apellido,
                especialidad,
                nombreCentro,
                direccionCentro,
                ciudadCentro,
                telefonoCentro
              }}
            />
          )}

          {/* Paso 7: Foto y biografía */}
          {currentStep === 7 && (
            <PhotoBioStep
              fotoPerfil={fotoPerfil}
              setFotoPerfil={setFotoPerfil}
              biografia={biografia}
              setBiografia={setBiografia}
              onNext={() => setCurrentStep(9)}
              onBack={() => setCurrentStep(6)}
              onSkip={() => setCurrentStep(9)}
              profileData={{
                titulo,
                nombre,
                apellido,
                especialidad,
                nombreCentro,
                direccionCentro,
                ciudadCentro,
                estadoCentro,
                telefonoCentro
              }}
              bloquesDias={bloquesDias}
            />
          )}

          {/* Paso 8: Foto/Bio para usuarios SIN agenda */}
          {currentStep === 8 && (
            <PhotoBioStep
              fotoPerfil={fotoPerfil}
              setFotoPerfil={setFotoPerfil}
              biografia={biografia}
              setBiografia={setBiografia}
              onNext={() => setCurrentStep(9)}
              onBack={() => setCurrentStep(4)}
              onSkip={() => setCurrentStep(9)}
              profileData={{
                titulo,
                nombre,
                apellido,
                especialidad,
                nombreCentro,
                direccionCentro,
                ciudadCentro,
                estadoCentro,
                telefonoCentro
              }}
            />
          )}

          {/* Paso 9: Vista previa del perfil */}
          {currentStep === 9 && (
            <ProfilePreview
              onPublish={completeRegistration}
              onSkip={completeRegistration}
              profileData={{
                titulo,
                nombre,
                apellido,
                especialidad,
                nombreCentro,
                direccionCentro,
                ciudadCentro,
                estadoCentro,
                paisCentro,
                telefonoCentro,
                fotoPerfil,
                biografia
              }}
              bloquesDias={tipoUsuario === 'con-agenda' ? bloquesDias : undefined}
              tiposCita={tipoUsuario === 'con-agenda' ? tiposCita : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}