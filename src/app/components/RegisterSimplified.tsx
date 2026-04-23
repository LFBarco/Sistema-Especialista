import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, X, Building2, User, Settings, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

interface Clinica {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  direccion: string;
  color: string;
}

interface RegisterSimplifiedProps {
  onRegisterComplete: (userData: any) => void;
  onBackToLogin: () => void;
}

const COLORES_DISPONIBLES = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-500' },
  { value: 'green', label: 'Verde', class: 'bg-green-500' },
  { value: 'yellow', label: 'Amarillo', class: 'bg-yellow-500' },
  { value: 'purple', label: 'Morado', class: 'bg-purple-500' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-500' },
  { value: 'orange', label: 'Naranja', class: 'bg-orange-500' },
  { value: 'red', label: 'Rojo', class: 'bg-red-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
];

export function RegisterSimplified({ onRegisterComplete, onBackToLogin }: RegisterSimplifiedProps) {
  // Datos personales
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [cedula, setCedula] = useState('');

  // Clínicas
  const [clinicas, setClinicas] = useState<Clinica[]>([
    {
      id: '1',
      nombre: '',
      contacto: '',
      telefono: '',
      direccion: '',
      color: 'blue'
    }
  ]);

  // Configuración básica
  const [horarioInicio, setHorarioInicio] = useState('08:00');
  const [horarioFin, setHorarioFin] = useState('18:00');
  const [duracionConsulta, setDuracionConsulta] = useState('45');

  const agregarClinica = () => {
    const coloresUsados = clinicas.map(c => c.color);
    const colorDisponible = COLORES_DISPONIBLES.find(c => !coloresUsados.includes(c.value))?.value || 'blue';
    
    setClinicas([
      ...clinicas,
      {
        id: String(clinicas.length + 1),
        nombre: '',
        contacto: '',
        telefono: '',
        direccion: '',
        color: colorDisponible
      }
    ]);
  };

  const eliminarClinica = (id: string) => {
    if (clinicas.length === 1) {
      toast.error('Debes tener al menos una clínica');
      return;
    }
    setClinicas(clinicas.filter(c => c.id !== id));
  };

  const actualizarClinica = (id: string, field: keyof Clinica, value: string) => {
    setClinicas(clinicas.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!nombre || !apellido || !email || !password) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validar que al menos una clínica tenga nombre
    const clinicasValidas = clinicas.filter(c => c.nombre.trim() !== '');
    if (clinicasValidas.length === 0) {
      toast.error('Debes agregar al menos una clínica');
      return;
    }

    const userData = {
      nombre,
      apellido,
      email,
      password,
      telefono,
      especialidad,
      cedula,
      clinicas: clinicasValidas,
      configuracion: {
        horarioInicio,
        horarioFin,
        duracionConsulta: parseInt(duracionConsulta)
      }
    };

    onRegisterComplete(userData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Stethoscope className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
                <CardDescription className="text-blue-100">
                  Configura tu perfil profesional en minutos
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* SECCIÓN 1: DATOS PERSONALES */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Datos Personales</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      placeholder="Ej: Juan"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input
                      id="apellido"
                      placeholder="Ej: Pérez"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      placeholder="+57 300 123 4567"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="especialidad">Especialidad *</Label>
                    <Select value={especialidad} onValueChange={setEspecialidad}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu especialidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardiologia">Cardiología</SelectItem>
                        <SelectItem value="neurologia">Neurología</SelectItem>
                        <SelectItem value="oftalmologia">Oftalmología</SelectItem>
                        <SelectItem value="dermatologia">Dermatología</SelectItem>
                        <SelectItem value="traumatologia">Traumatología</SelectItem>
                        <SelectItem value="cirugia">Cirugía</SelectItem>
                        <SelectItem value="medicina_interna">Medicina Interna</SelectItem>
                        <SelectItem value="oncologia">Oncología</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cedula">Cédula Profesional</Label>
                    <Input
                      id="cedula"
                      placeholder="Ej: 12345678"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repite tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: CLÍNICAS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Clínicas donde trabajas</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={agregarClinica}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Clínica
                  </Button>
                </div>

                <div className="space-y-4">
                  {clinicas.map((clinica, index) => (
                    <Card key={clinica.id} className="border-2 border-gray-200">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${COLORES_DISPONIBLES.find(c => c.value === clinica.color)?.class}`} />
                            <span className="font-medium text-gray-700">Clínica {index + 1}</span>
                          </div>
                          {clinicas.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarClinica(clinica.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 md:col-span-2">
                            <Label>Nombre de la Clínica *</Label>
                            <Input
                              placeholder="Ej: Clínica Veterinaria VetPlus"
                              value={clinica.nombre}
                              onChange={(e) => actualizarClinica(clinica.id, 'nombre', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Contacto Principal</Label>
                            <Input
                              placeholder="Nombre del contacto"
                              value={clinica.contacto}
                              onChange={(e) => actualizarClinica(clinica.id, 'contacto', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Teléfono de Contacto</Label>
                            <Input
                              type="tel"
                              placeholder="+57 300 123 4567"
                              value={clinica.telefono}
                              onChange={(e) => actualizarClinica(clinica.id, 'telefono', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Dirección</Label>
                            <Input
                              placeholder="Dirección de la clínica"
                              value={clinica.direccion}
                              onChange={(e) => actualizarClinica(clinica.id, 'direccion', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Color Identificador</Label>
                            <Select 
                              value={clinica.color} 
                              onValueChange={(value) => actualizarClinica(clinica.id, 'color', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {COLORES_DISPONIBLES.map(color => (
                                  <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-3 h-3 rounded-full ${color.class}`} />
                                      {color.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* SECCIÓN 3: CONFIGURACIÓN BÁSICA */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Configuración Básica</h3>
                  <span className="text-sm text-gray-500">(puedes modificarlo después)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="horarioInicio">Horario de Inicio</Label>
                    <Input
                      id="horarioInicio"
                      type="time"
                      value={horarioInicio}
                      onChange={(e) => setHorarioInicio(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horarioFin">Horario de Fin</Label>
                    <Input
                      id="horarioFin"
                      type="time"
                      value={horarioFin}
                      onChange={(e) => setHorarioFin(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duracionConsulta">Duración de Consulta (min)</Label>
                    <Select value={duracionConsulta} onValueChange={setDuracionConsulta}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                        <SelectItem value="90">90 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* BOTONES */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBackToLogin}
                  className="flex-1"
                >
                  Volver al Login
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Crear Cuenta e Ingresar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
