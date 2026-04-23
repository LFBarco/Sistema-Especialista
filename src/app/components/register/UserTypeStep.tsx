import { Users, UserCog } from 'lucide-react';

interface UserTypeStepProps {
  tipoUsuario: 'con-agenda' | 'sin-agenda' | null;
  setTipoUsuario: (tipo: 'con-agenda' | 'sin-agenda') => void;
  onNext: () => void;
  onBack: () => void;
}

export function UserTypeStep({ tipoUsuario, setTipoUsuario, onNext, onBack }: UserTypeStepProps) {
  const handleSelectType = (type: 'con-agenda' | 'sin-agenda') => {
    setTipoUsuario(type);
    // Auto-advance after selection
    setTimeout(() => {
      if (type === 'con-agenda') {
        onNext();
      } else {
        // Si no tiene agenda, completar registro directamente
        onNext();
      }
    }, 300);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl text-gray-800 mb-4">¡Te damos la bienvenida!</h2>
        <p className="text-gray-600">
          Selecciona el tipo de registro que se ajuste a tu perfil
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Con agenda médica */}
        <button
          onClick={() => handleSelectType('con-agenda')}
          className={`p-8 border-2 rounded-xl transition-all hover:shadow-lg ${
            tipoUsuario === 'con-agenda' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&h=200&fit=crop" 
                alt="Veterinario con agenda"
                className="w-28 h-28 rounded-full object-cover"
              />
            </div>
          </div>
          
          <h3 className="text-xl text-gray-800 mb-3">
            Soy usuario<br />con agenda veterinaria
          </h3>
          
          <p className="text-sm text-gray-600">
            Por ejemplo: médicos veterinarios, especialistas, cirujanos y otros. 
            Publica tu agenda, administra tus consultas y pacientes.
          </p>
        </button>

        {/* Sin agenda médica */}
        <button
          onClick={() => handleSelectType('sin-agenda')}
          className={`p-8 border-2 rounded-xl transition-all hover:shadow-lg ${
            tipoUsuario === 'sin-agenda' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 bg-teal-100 rounded-full flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop" 
                alt="Personal administrativo"
                className="w-28 h-28 rounded-full object-cover"
              />
            </div>
          </div>
          
          <h3 className="text-xl text-gray-800 mb-3">
            Soy usuario<br />sin agenda veterinaria
          </h3>
          
          <p className="text-sm text-gray-600">
            Por ejemplo: recepcionistas, administradores y otros. 
            Accede a gestión de pacientes y otras funciones según permisos.
          </p>
        </button>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Anterior
        </button>
      </div>
    </div>
  );
}
