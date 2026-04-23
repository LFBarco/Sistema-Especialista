import { useState } from 'react';
import { LogOut, Building2, Plus } from 'lucide-react';

interface Clinica {
  id: string;
  nombre: string;
  ubicacion: string;
  rol: string;
}

interface ClinicSelectionProps {
  userName: string;
  userRole: string;
  clinicas: Clinica[];
  onSelectClinica: (clinicaId: string) => void;
  onCreateClinica: () => void;
  onLogout: () => void;
}

export function ClinicSelection({ 
  userName, 
  userRole, 
  clinicas, 
  onSelectClinica, 
  onCreateClinica,
  onLogout 
}: ClinicSelectionProps) {
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
      <div className="flex-1 p-12">
        <div className="max-w-5xl">
          <h1 className="text-3xl text-gray-800 mb-2">
            Te damos la bienvenida a VetSpecialist
          </h1>
          <p className="text-gray-600 mb-8">Selecciona una Clínica Veterinaria</p>

          <div>
            <h2 className="text-gray-700 mb-6">Gestión de consultorio</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Clínicas existentes */}
              {clinicas.map((clinica) => (
                <div
                  key={clinica.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <Building2 className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-gray-800 mb-1">{clinica.nombre}</h3>
                    <p className="text-sm text-gray-500">{clinica.ubicacion}</p>
                  </div>

                  <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2 bg-blue-50 rounded-lg">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                    <span className="text-sm text-blue-700">{clinica.rol}</span>
                  </div>

                  <button
                    onClick={() => onSelectClinica(clinica.id)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ingresar
                  </button>
                </div>
              ))}

              {/* Crear nueva clínica */}
              <button
                onClick={onCreateClinica}
                className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center min-h-[280px] group"
              >
                <div className="w-20 h-20 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center mb-4 transition-colors">
                  <Plus className="w-10 h-10 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <span className="text-blue-600 group-hover:text-blue-700">
                  + Crear nueva clínica veterinaria
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
