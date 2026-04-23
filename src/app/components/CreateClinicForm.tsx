import { useState } from 'react';
import { LogOut, ChevronRight } from 'lucide-react';

interface CreateClinicFormProps {
  userName: string;
  userRole: string;
  onCancel: () => void;
  onCreate: (clinicaData: any) => void;
  onLogout: () => void;
}

export function CreateClinicForm({ userName, userRole, onCancel, onCreate, onLogout }: CreateClinicFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Paso 1: Información básica
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [pais, setPais] = useState('');
  const [estado, setEstado] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [direccion, setDireccion] = useState('');

  // Paso 2: Información adicional
  const [tipoClinica, setTipoClinica] = useState('');
  const [numeroLicencia, setNumeroLicencia] = useState('');
  const [servicios, setServicios] = useState<string[]>([]);
  const [horarioAtencion, setHorarioAtencion] = useState('');

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === totalSteps) {
      onCreate({
        nombre,
        email,
        telefono,
        pais,
        estado,
        ciudad,
        direccion,
        tipoClinica,
        numeroLicencia,
        servicios,
        horarioAtencion
      });
    } else {
      handleNext();
    }
  };

  const paises = ['Colombia', 'México', 'Argentina', 'Chile', 'Perú', 'España'];
  const tiposClinica = ['Clínica General', 'Hospital Veterinario', 'Consultorio Privado', 'Centro de Especialidades'];
  const serviciosDisponibles = ['Consulta General', 'Cirugía', 'Diagnóstico por Imagen', 'Laboratorio', 'Hospitalización', 'Emergencias 24h'];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div 
        className="w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(29, 78, 216, 0.95), rgba(30, 58, 138, 0.95)), url(https://images.unsplash.com/photo-1724632824319-4b43e74e000c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJpYW4lMjBkb2N0b3IlMjBvZmZpY2UlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzY1OTQyNTI4fDA&ixlib=rb-4.1.0&q=80&w=1080)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <span className="text-blue-600">🏥</span>
            </div>
            <span className="text-xl">
              <span className="font-bold">Vet</span>Specialist
            </span>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-6 py-8 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 border-4 border-white/30">
            <span className="text-4xl">👤</span>
          </div>
          <h3 className="text-lg">{userName}</h3>
          <p className="text-blue-200 text-sm">{userRole}</p>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="m-6 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 transition-colors backdrop-blur-sm border border-white/20"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-12 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl text-gray-800 mb-8">
            Crear nueva <span className="font-semibold">clínica veterinaria</span>
          </h1>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit}>
              {/* Paso 1: Información básica */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Clínica Veterinaria Lic. Luis Barco"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Correo electrónico <span className="text-gray-400">(Opcional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="contacto@clinica.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Teléfono <span className="text-gray-400">(Opcional)</span>
                    </label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="+57 300 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      País <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={pais}
                      onChange={(e) => setPais(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    >
                      <option value="">Seleccione un país</option>
                      {paises.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Estado / Provincia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Cundinamarca"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Ciudad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Bogotá"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Dirección <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Calle 123 # 45-67"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Paso 2: Información adicional */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Tipo de Clínica <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={tipoClinica}
                      onChange={(e) => setTipoClinica(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    >
                      <option value="">Seleccione tipo de clínica</option>
                      {tiposClinica.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Número de Licencia Sanitaria <span className="text-gray-400">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={numeroLicencia}
                      onChange={(e) => setNumeroLicencia(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="LS-2024-001234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Servicios que Ofrece <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2 border border-gray-300 rounded-lg p-4">
                      {serviciosDisponibles.map(servicio => (
                        <label key={servicio} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={servicios.includes(servicio)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setServicios([...servicios, servicio]);
                              } else {
                                setServicios(servicios.filter(s => s !== servicio));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{servicio}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Horario de Atención <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={horarioAtencion}
                      onChange={(e) => setHorarioAtencion(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Lunes a Viernes 8:00 AM - 6:00 PM"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Progress indicator */}
              <div className="mt-6 mb-4">
                <div className="flex justify-center items-center gap-2">
                  <div className="text-sm text-gray-600">
                    {currentStep} de {totalSteps}
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={currentStep === 1 ? onCancel : handleBack}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {currentStep === 1 ? 'Cancelar' : 'Anterior'}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {currentStep === totalSteps ? 'Crear Clínica' : 'Siguiente'}
                  {currentStep < totalSteps && <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
