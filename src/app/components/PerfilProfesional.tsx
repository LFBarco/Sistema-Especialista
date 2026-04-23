import { useState } from 'react';
import { ArrowLeft, User, Star, MapPin, DollarSign, Save, Eye, Award, Upload, X, CheckCircle } from 'lucide-react';
import { useApp } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

export function PerfilProfesional() {
  const { darkMode, navegarA } = useApp();
  
  // Estados del perfil
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [nombre, setNombre] = useState('Juan');
  const [apellido, setApellido] = useState('Pérez');
  const [especialidadPrincipal, setEspecialidadPrincipal] = useState('Cardiología');
  const [especialidadesSecundarias, setEspecialidadesSecundarias] = useState<string[]>(['Medicina Interna']);
  const [anosExperiencia, setAnosExperiencia] = useState('8');
  const [ciudad, setCiudad] = useState('Medellín');
  const [bio, setBio] = useState('Especialista en Cardiología Veterinaria con más de 8 años de experiencia. Enfoque en diagnóstico preciso mediante ecocardiografía y tratamientos de última generación. Comprometido con el bienestar animal y la medicina basada en evidencia.');
  const [tarifaConsulta, setTarifaConsulta] = useState('250');
  const [tarifaCirugia, setTarifaCirugia] = useState('600');
  const [tarifaUrgencia, setTarifaUrgencia] = useState('350');
  const [modalidades, setModalidades] = useState<string[]>(['Presencial', 'Remoto']);
  const [certificaciones, setCertificaciones] = useState<string[]>([
    'Diplomado en Cardiología Veterinaria Avanzada',
    'Certificación Internacional en Ecocardiografía'
  ]);
  const [nuevaCertificacion, setNuevaCertificacion] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(true);

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
    'Oftalmología'
  ];

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPerfil(reader.result as string);
        toast.success('Foto cargada correctamente');
      };
      reader.readAsDataURL(file);
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

  const agregarCertificacion = () => {
    if (nuevaCertificacion.trim()) {
      setCertificaciones([...certificaciones, nuevaCertificacion.trim()]);
      setNuevaCertificacion('');
      toast.success('Certificación agregada');
    }
  };

  const eliminarCertificacion = (index: number) => {
    setCertificaciones(certificaciones.filter((_, i) => i !== index));
    toast.info('Certificación eliminada');
  };

  const guardarPerfil = () => {
    setGuardando(true);
    // Simular guardado
    setTimeout(() => {
      setGuardando(false);
      toast.success('Perfil guardado correctamente');
    }, 1000);
  };

  const irAVerificacion = () => {
    toast.info('Redirigiendo a verificación profesional...');
    navegarA('verificacion-profesional');
  };

  // Preview del perfil público
  const PreviewPerfil = () => (
    <Card className={`sticky top-4 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white'}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-orange-500" />
          <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
            Vista Previa Pública
          </CardTitle>
        </div>
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
          Así verán las clínicas tu perfil
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          {fotoPerfil ? (
            <img
              src={fotoPerfil}
              alt="Foto de perfil"
              className="w-24 h-24 rounded-2xl object-cover shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {nombre[0]}{apellido[0]}
            </div>
          )}
          <Badge className="mt-3 bg-green-500/20 text-green-400 border-green-500/50">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verificado
          </Badge>
        </div>

        {/* Nombre */}
        <div className="text-center">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Dr. {nombre} {apellido}
          </h3>
          <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {especialidadPrincipal}
          </p>
          {especialidadesSecundarias.length > 0 && (
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              + {especialidadesSecundarias.join(', ')}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Award className={`w-5 h-5 mx-auto mb-1 ${darkMode ? 'text-orange-500' : 'text-orange-600'}`} />
            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {anosExperiencia}
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              Años
            </p>
          </div>
          <div className={`p-3 rounded-lg text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <MapPin className={`w-5 h-5 mx-auto mb-1 ${darkMode ? 'text-blue-500' : 'text-blue-600'}`} />
            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {ciudad}
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              Ciudad
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {bio || 'Sin descripción'}
          </p>
        </div>

        {/* Modalidades */}
        <div>
          <p className={`text-xs font-bold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Modalidades
          </p>
          <div className="flex gap-2">
            {modalidades.map(mod => (
              <Badge key={mod} variant="outline" className={darkMode ? 'border-gray-700' : ''}>
                {mod}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tarifas */}
        <div>
          <p className={`text-xs font-bold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Tarifas
          </p>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Desde
              </span>
              <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ${tarifaConsulta}
              </span>
            </div>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
              Tarifa puede variar según complejidad
            </p>
          </div>
        </div>

        {/* Certificaciones */}
        {certificaciones.length > 0 && (
          <div>
            <p className={`text-xs font-bold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Certificaciones
            </p>
            <div className="space-y-2">
              {certificaciones.slice(0, 2).map((cert, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                    darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">{cert}</span>
                </div>
              ))}
              {certificaciones.length > 2 && (
                <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-500'}`}>
                  +{certificaciones.length - 2} más
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className={`border-b ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navegarA('dashboard')}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Perfil Profesional
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Configura tu perfil público visible para clínicas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
              Estado: DRAFT
            </Badge>
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              • No visible para clínicas
            </span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: Formulario */}
          <div className="lg:col-span-2 space-y-6">
            {/* Foto de perfil */}
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Foto de Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  {fotoPerfil ? (
                    <img
                      src={fotoPerfil}
                      alt="Foto de perfil"
                      className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {nombre[0]}{apellido[0]}
                    </div>
                  )}
                  <div>
                    <label htmlFor="foto-upload" className="cursor-pointer">
                      <Button variant="outline" className={darkMode ? 'border-gray-700' : ''} asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Subir Foto
                        </span>
                      </Button>
                      <input
                        id="foto-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      JPG, PNG o GIF. Máx 2MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información básica */}
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nombre
                    </label>
                    <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                  </div>
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Apellido
                    </label>
                    <Input value={apellido} onChange={(e) => setApellido(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Años de Experiencia
                    </label>
                    <Input
                      type="number"
                      value={anosExperiencia}
                      onChange={(e) => setAnosExperiencia(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Ciudad
                    </label>
                    <Input value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Especialidades */}
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Especialidades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Especialidad Principal
                  </label>
                  <select
                    value={especialidadPrincipal}
                    onChange={(e) => setEspecialidadPrincipal(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200'
                    }`}
                  >
                    {especialidades.map(esp => (
                      <option key={esp} value={esp}>{esp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Especialidades Secundarias
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {especialidades.filter(e => e !== especialidadPrincipal).map(esp => (
                      <button
                        key={esp}
                        onClick={() => toggleEspecialidadSecundaria(esp)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                          especialidadesSecundarias.includes(esp)
                            ? 'bg-orange-500 text-white'
                            : darkMode
                            ? 'bg-gray-900 text-gray-400 hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {esp}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Descripción Profesional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={5}
                  placeholder="Describe tu experiencia, enfoque profesional y áreas de interés..."
                  className={`w-full px-4 py-3 rounded-xl border-2 resize-none ${
                    darkMode
                      ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-200 placeholder-gray-400'
                  }`}
                />
                <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  {bio.length}/500 caracteres
                </p>
              </CardContent>
            </Card>

            {/* Tarifas */}
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Tarifas Base
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Consulta
                    </label>
                    <div className="relative">
                      <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        $
                      </span>
                      <Input
                        type="number"
                        value={tarifaConsulta}
                        onChange={(e) => setTarifaConsulta(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Cirugía
                    </label>
                    <div className="relative">
                      <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        $
                      </span>
                      <Input
                        type="number"
                        value={tarifaCirugia}
                        onChange={(e) => setTarifaCirugia(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Urgencia
                    </label>
                    <div className="relative">
                      <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        $
                      </span>
                      <Input
                        type="number"
                        value={tarifaUrgencia}
                        onChange={(e) => setTarifaUrgencia(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modalidades */}
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Modalidades de Atención
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  {['Presencial', 'Remoto', 'Domicilio'].map(mod => (
                    <button
                      key={mod}
                      onClick={() => toggleModalidad(mod)}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                        modalidades.includes(mod)
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                          : darkMode
                          ? 'bg-gray-900 text-gray-400 border-2 border-gray-700 hover:bg-gray-700'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certificaciones */}
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Certificaciones y Estudios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {certificaciones.map((cert, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between gap-3 p-3 rounded-lg ${
                        darkMode ? 'bg-gray-900' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Award className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {cert}
                        </span>
                      </div>
                      <button
                        onClick={() => eliminarCertificacion(index)}
                        className={`p-1 rounded ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                      >
                        <X className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={nuevaCertificacion}
                    onChange={(e) => setNuevaCertificacion(e.target.value)}
                    placeholder="Agregar certificación..."
                    onKeyPress={(e) => e.key === 'Enter' && agregarCertificacion()}
                  />
                  <Button onClick={agregarCertificacion} variant="outline">
                    Agregar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <Button
                onClick={guardarPerfil}
                disabled={guardando}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Button
                onClick={irAVerificacion}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                Ir a Verificación →
              </Button>
            </div>
          </div>

          {/* Columna derecha: Preview */}
          <div className="lg:col-span-1">
            <PreviewPerfil />
          </div>
        </div>
      </div>
    </div>
  );
}
