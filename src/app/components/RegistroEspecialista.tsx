import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, User, FileText, ShieldCheck, Zap, Mail, Phone, Briefcase, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

type EstadoVerificacion = 'draft' | 'pending' | 'partial' | 'verified';

export function RegistroEspecialista() {
  const { darkMode, navegarA } = useApp();
  const [pasoActual, setPasoActual] = useState(0);
  
  // Estados del formulario - Paso 1: Cuenta
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  
  // Estados del formulario - Paso 2: Perfil
  const [especialidadPrincipal, setEspecialidadPrincipal] = useState('');
  const [especialidadesSecundarias, setEspecialidadesSecundarias] = useState<string[]>([]);
  const [anosExperiencia, setAnosExperiencia] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [bio, setBio] = useState('');
  
  // Estados del formulario - Paso 3: Tarifas y Servicios
  const [tarifaConsulta, setTarifaConsulta] = useState('');
  const [tarifaCirugia, setTarifaCirugia] = useState('');
  const [tarifaUrgencia, setTarifaUrgencia] = useState('');
  const [modalidades, setModalidades] = useState<string[]>([]);
  
  // Validaciones
  const [errores, setErrores] = useState<Record<string, string>>({});

  const pasos = [
    { id: 0, titulo: 'Cuenta', icon: User, descripcion: 'Información básica' },
    { id: 1, titulo: 'Perfil', icon: Briefcase, descripcion: 'Datos profesionales' },
    { id: 2, titulo: 'Verificación', icon: ShieldCheck, descripcion: 'Documentos' },
    { id: 3, titulo: 'Activación', icon: Zap, descripcion: 'Confirmación' }
  ];

  const especialidades = [
    'Cardiología',
    'Anestesiología',
    'Cirugía',
    'Ecografía',
    'Odontología',
    'Dermatología',
    'Nutrición',
    'Etología',
    'Medicina Interna',
    'Oftalmología',
    'Neurología',
    'Oncología'
  ];

  const ciudadesDisponibles = [
    'Medellín',
    'Bogotá',
    'Cali',
    'Barranquilla',
    'Cartagena',
    'Bucaramanga',
    'Pereira',
    'Manizales'
  ];

  // Validaciones en tiempo real
  const validarPaso1 = () => {
    const nuevosErrores: Record<string, string> = {};
    
    if (!nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!apellido.trim()) nuevosErrores.apellido = 'El apellido es obligatorio';
    
    if (!email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nuevosErrores.email = 'Email inválido';
    }
    
    if (!telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio';
    } else if (!/^\+?[0-9]{10,15}$/.test(telefono.replace(/\s/g, ''))) {
      nuevosErrores.telefono = 'Teléfono inválido';
    }
    
    if (!password) {
      nuevosErrores.password = 'La contraseña es obligatoria';
    } else if (password.length < 8) {
      nuevosErrores.password = 'Mínimo 8 caracteres';
    }
    
    if (password !== confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
    }
    
    if (!aceptaTerminos) {
      nuevosErrores.terminos = 'Debes aceptar los términos';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const validarPaso2 = () => {
    const nuevosErrores: Record<string, string> = {};
    
    if (!especialidadPrincipal) {
      nuevosErrores.especialidad = 'Selecciona tu especialidad principal';
    }
    
    if (!anosExperiencia) {
      nuevosErrores.experiencia = 'Indica tus años de experiencia';
    } else if (parseInt(anosExperiencia) < 0 || parseInt(anosExperiencia) > 50) {
      nuevosErrores.experiencia = 'Valor inválido (0-50)';
    }
    
    if (!ciudad) {
      nuevosErrores.ciudad = 'Selecciona tu ciudad';
    }
    
    if (!bio.trim()) {
      nuevosErrores.bio = 'Escribe una breve descripción profesional';
    } else if (bio.length < 50) {
      nuevosErrores.bio = 'Mínimo 50 caracteres';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const validarPaso3 = () => {
    const nuevosErrores: Record<string, string> = {};
    
    if (!tarifaConsulta) {
      nuevosErrores.tarifaConsulta = 'Indica tu tarifa de consulta';
    } else if (parseFloat(tarifaConsulta) <= 0) {
      nuevosErrores.tarifaConsulta = 'Tarifa inválida';
    }
    
    if (modalidades.length === 0) {
      nuevosErrores.modalidades = 'Selecciona al menos una modalidad';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const siguientePaso = () => {
    let valido = false;
    
    if (pasoActual === 0) {
      valido = validarPaso1();
    } else if (pasoActual === 1) {
      valido = validarPaso2();
    } else if (pasoActual === 2) {
      valido = validarPaso3();
    } else {
      valido = true;
    }
    
    if (valido) {
      if (pasoActual < pasos.length - 1) {
        setPasoActual(pasoActual + 1);
        setErrores({});
      }
    } else {
      toast.error('Por favor completa todos los campos obligatorios');
    }
  };

  const pasoAnterior = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1);
      setErrores({});
    }
  };

  const toggleEspecialidadSecundaria = (esp: string) => {
    setEspecialidadesSecundarias(prev => 
      prev.includes(esp) 
        ? prev.filter(e => e !== esp)
        : [...prev, esp]
    );
  };

  const toggleModalidad = (mod: string) => {
    setModalidades(prev =>
      prev.includes(mod)
        ? prev.filter(m => m !== mod)
        : [...prev, mod]
    );
  };

  const finalizarRegistro = () => {
    toast.success('¡Registro completado! Tu perfil está en estado DRAFT');
    // Aquí iría la lógica para guardar en Supabase/backend
    setTimeout(() => {
      navegarA('perfil-profesional');
    }, 1500);
  };

  const guardarYCompletarLuego = () => {
    toast.info('Progreso guardado. Puedes continuar cuando quieras');
    navegarA('dashboard');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      darkMode ? 'bg-gray-950' : 'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
      {/* Ilustración de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className={`absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl ${
          darkMode ? 'bg-cyan-500' : 'bg-cyan-300'
        }`} />
        <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl ${
          darkMode ? 'bg-blue-500' : 'bg-blue-300'
        }`} />
      </div>

      <div className="w-full max-w-4xl relative">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4 shadow-xl">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Registro de Especialista
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Únete a la red de especialistas veterinarios más confiable
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {pasos.map((paso, index) => {
              const Icon = paso.icon;
              const completado = index < pasoActual;
              const activo = index === pasoActual;
              
              return (
                <div key={paso.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <motion.div
                      whileHover={{ scale: activo ? 1.05 : 1 }}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center relative z-10 transition-all ${
                        completado || activo
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                          : darkMode
                          ? 'bg-gray-800 text-gray-500 border-2 border-gray-700'
                          : 'bg-white text-gray-400 border-2 border-gray-200'
                      }`}
                    >
                      {completado ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </motion.div>
                    <p className={`text-xs font-bold mt-2 ${
                      activo
                        ? 'text-cyan-500'
                        : darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {paso.titulo}
                    </p>
                  </div>
                  {index < pasos.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 -mt-8 ${
                      index < pasoActual
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                        : darkMode ? 'bg-gray-800' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Card principal */}
        <Card className={`backdrop-blur-xl shadow-2xl ${
          darkMode 
            ? 'bg-gray-900/80 border-gray-800' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {/* PASO 1: CUENTA */}
              {pasoActual === 0 && (
                <motion.div
                  key="paso1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Información de Cuenta
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Completa tus datos básicos para crear tu cuenta profesional
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Nombre *
                      </label>
                      <Input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Juan"
                        className={errores.nombre ? 'border-red-500' : ''}
                      />
                      {errores.nombre && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errores.nombre}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Apellido *
                      </label>
                      <Input
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        placeholder="Pérez"
                        className={errores.apellido ? 'border-red-500' : ''}
                      />
                      {errores.apellido && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errores.apellido}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email Profesional *
                    </label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="juan.perez@veterinaria.com"
                        className={`pl-10 ${errores.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errores.email && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Teléfono *
                    </label>
                    <div className="relative">
                      <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <Input
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="+57 300 123 4567"
                        className={`pl-10 ${errores.telefono ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errores.telefono && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.telefono}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Contraseña *
                      </label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className={errores.password ? 'border-red-500' : ''}
                      />
                      {errores.password && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errores.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Confirmar Contraseña *
                      </label>
                      <Input
                        type="password"
                        value={confirmarPassword}
                        onChange={(e) => setConfirmarPassword(e.target.value)}
                        placeholder="Repite tu contraseña"
                        className={errores.confirmarPassword ? 'border-red-500' : ''}
                      />
                      {errores.confirmarPassword && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errores.confirmarPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border-2 ${
                    errores.terminos
                      ? 'border-red-500 bg-red-500/10'
                      : darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aceptaTerminos}
                        onChange={(e) => setAceptaTerminos(e.target.checked)}
                        className="w-5 h-5 mt-0.5 rounded border-2 border-cyan-500 text-cyan-500"
                      />
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Acepto los <span className="text-cyan-500 font-semibold">Términos y Condiciones</span> y la <span className="text-cyan-500 font-semibold">Política de Privacidad</span>
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                          Tus datos están protegidos según normativas de confidencialidad médica
                        </p>
                      </div>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* PASO 2: PERFIL */}
              {pasoActual === 1 && (
                <motion.div
                  key="paso2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Perfil Profesional
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Esta información será visible para las clínicas
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Especialidad Principal *
                    </label>
                    <select
                      value={especialidadPrincipal}
                      onChange={(e) => setEspecialidadPrincipal(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errores.especialidad ? 'border-red-500' : darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                      }`}
                    >
                      <option value="">Selecciona tu especialidad</option>
                      {especialidades.map(esp => (
                        <option key={esp} value={esp}>{esp}</option>
                      ))}
                    </select>
                    {errores.especialidad && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.especialidad}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Especialidades Secundarias (opcional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {especialidades.filter(e => e !== especialidadPrincipal).map(esp => (
                        <button
                          key={esp}
                          onClick={() => toggleEspecialidadSecundaria(esp)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                            especialidadesSecundarias.includes(esp)
                              ? 'bg-cyan-500 text-white'
                              : darkMode
                              ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {esp}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Años de Experiencia *
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={anosExperiencia}
                        onChange={(e) => setAnosExperiencia(e.target.value)}
                        placeholder="5"
                        className={errores.experiencia ? 'border-red-500' : ''}
                      />
                      {errores.experiencia && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errores.experiencia}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Ciudad *
                      </label>
                      <select
                        value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          errores.ciudad ? 'border-red-500' : darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                        }`}
                      >
                        <option value="">Selecciona tu ciudad</option>
                        {ciudadesDisponibles.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {errores.ciudad && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errores.ciudad}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Descripción Profesional * <span className="text-xs font-normal">({bio.length}/500 caracteres)</span>
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder="Describe tu experiencia, enfoque profesional y áreas de interés..."
                      className={`w-full px-4 py-3 rounded-xl border-2 resize-none ${
                        errores.bio 
                          ? 'border-red-500' 
                          : darkMode 
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-200 placeholder-gray-400'
                      }`}
                    />
                    {errores.bio && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.bio}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* PASO 3: VERIFICACIÓN */}
              {pasoActual === 2 && (
                <motion.div
                  key="paso3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Tarifas y Modalidades
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Configura tus tarifas base y modalidades de atención
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Consulta *
                      </label>
                      <div className="relative">
                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          $
                        </span>
                        <Input
                          type="number"
                          min="0"
                          value={tarifaConsulta}
                          onChange={(e) => setTarifaConsulta(e.target.value)}
                          placeholder="200"
                          className={`pl-8 ${errores.tarifaConsulta ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errores.tarifaConsulta && (
                        <p className="text-xs text-red-500 mt-1">
                          {errores.tarifaConsulta}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Cirugía (opcional)
                      </label>
                      <div className="relative">
                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          $
                        </span>
                        <Input
                          type="number"
                          min="0"
                          value={tarifaCirugia}
                          onChange={(e) => setTarifaCirugia(e.target.value)}
                          placeholder="500"
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Urgencia (opcional)
                      </label>
                      <div className="relative">
                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          $
                        </span>
                        <Input
                          type="number"
                          min="0"
                          value={tarifaUrgencia}
                          onChange={(e) => setTarifaUrgencia(e.target.value)}
                          placeholder="300"
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Modalidades de Atención *
                    </label>
                    <div className="flex gap-3">
                      {['Presencial', 'Remoto', 'Domicilio'].map(mod => (
                        <button
                          key={mod}
                          onClick={() => toggleModalidad(mod)}
                          className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                            modalidades.includes(mod)
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                              : darkMode
                              ? 'bg-gray-800 text-gray-400 border-2 border-gray-700 hover:bg-gray-700'
                              : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {mod}
                        </button>
                      ))}
                    </div>
                    {errores.modalidades && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errores.modalidades}
                      </p>
                    )}
                  </div>

                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-500/10 border-2 border-blue-500/50' : 'bg-blue-50 border-2 border-blue-200'}`}>
                    <p className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                      💡 <strong>Nota:</strong> Estas son tarifas base. Podrás ajustarlas según la complejidad de cada caso.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* PASO 4: ACTIVACIÓN */}
              {pasoActual === 3 && (
                <motion.div
                  key="paso4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  
                  <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ¡Todo listo!
                  </h2>
                  
                  <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tu registro está completo
                  </p>

                  <div className={`max-w-md mx-auto p-6 rounded-xl mb-6 ${
                    darkMode ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <strong>Siguiente paso:</strong> Completa tu verificación profesional para activar tu perfil público
                    </p>
                    
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-500" />
                        </div>
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Perfil creado
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        </div>
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Pendiente: Verificación de documentos
                        </span>
                      </div>
                    </div>
                  </div>

                  <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50 mb-8">
                    Estado: DRAFT (No visible para clínicas)
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          {/* Footer con botones */}
          <div className={`p-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={guardarYCompletarLuego}
                className={darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : ''}
              >
                Completar más tarde
              </Button>

              <div className="flex gap-3">
                {pasoActual > 0 && pasoActual < 3 && (
                  <Button
                    variant="outline"
                    onClick={pasoAnterior}
                    className={darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : ''}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>
                )}

                {pasoActual < 3 ? (
                  <Button
                    onClick={siguientePaso}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={finalizarRegistro}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Finalizar Registro
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Link de login */}
        <p className={`text-center text-sm mt-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          ¿Ya tienes una cuenta? <button onClick={() => navegarA('dashboard')} className="text-cyan-500 font-semibold hover:underline">Inicia sesión</button>
        </p>
      </div>
    </div>
  );
}
