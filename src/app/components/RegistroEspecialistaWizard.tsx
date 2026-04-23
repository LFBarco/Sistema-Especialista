import { useState, useCallback } from 'react';
import {
  ArrowLeft, ArrowRight, Check, User, Briefcase, ShieldCheck, Building2, CheckCircle2,
  Mail, Phone, Lock, Eye, EyeOff, MapPin, Activity, FileText, Moon, Sun,
  AlertCircle, Upload, Clock, Star, Stethoscope, DollarSign, Zap, Award, X
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ==========================================
// Color Theme type
// ==========================================
interface ColorTheme {
  bg: string; card: string; cardAlt: string; border: string; borderHover: string;
  text: string; textMuted: string; textDim: string; primary: string;
  primaryHover: string; primaryLight: string; accent: string; accentLight: string;
  success: string; error: string; warning: string; inputBg: string;
}

// ==========================================
// EXTRACTED OUTSIDE: stable component identity
// ==========================================
function InputField({ label, value, onChange, error, type = 'text', placeholder, icon: Icon, required = true, c, className = '' }: {
  label: string; value: string; onChange: (v: string) => void; error?: string;
  type?: string; placeholder?: string; icon?: LucideIcon; required?: boolean; c: ColorTheme; className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: c.textMuted }}>
        {label} {required && <span style={{ color: c.accent }}>*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: c.textDim }} />}
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full py-3 border-2 rounded-lg focus:outline-none transition-colors text-sm"
          style={{ paddingLeft: Icon ? '2.5rem' : '1rem', paddingRight: '1rem', backgroundColor: c.inputBg, borderColor: error ? c.error : c.border, color: c.text }}
        />
      </div>
      {error && <p className="text-xs mt-1 flex items-center gap-1" style={{ color: c.error }}><AlertCircle className="w-3 h-3" /> {error}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, error, placeholder, required = true, c }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; error?: string;
  placeholder?: string; required?: boolean; c: ColorTheme;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: c.textMuted }}>
        {label} {required && <span style={{ color: c.accent }}>*</span>}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-sm appearance-none"
        style={{ backgroundColor: c.inputBg, borderColor: error ? c.error : c.border, color: value ? c.text : c.textDim }}>
        <option value="">{placeholder}</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {error && <p className="text-xs mt-1 flex items-center gap-1" style={{ color: c.error }}><AlertCircle className="w-3 h-3" /> {error}</p>}
    </div>
  );
}

function PasswordField({ label, value, onChange, error, showPw, onToggle, placeholder, c }: {
  label: string; value: string; onChange: (v: string) => void; error?: string;
  showPw: boolean; onToggle: () => void; placeholder?: string; c: ColorTheme;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: c.textMuted }}>
        {label} <span style={{ color: c.accent }}>*</span>
      </label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: c.textDim }} />
        <input type={showPw ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none transition-colors text-sm"
          style={{ backgroundColor: c.inputBg, borderColor: error ? c.error : c.border, color: c.text }} />
        <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: c.textDim }}>
          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs mt-1 flex items-center gap-1" style={{ color: c.error }}><AlertCircle className="w-3 h-3" /> {error}</p>}
    </div>
  );
}

// ==========================================
// Static data
// ==========================================
interface RegistroEspecialistaWizardProps {
  onRegisterComplete: (userData: any) => void;
  onBackToSelector: () => void;
  onBackToLogin: () => void;
}

type Fase = 0 | 1 | 2 | 3 | 4;

const ESPECIALIDADES = ['Cardiología', 'Anestesiología', 'Cirugía', 'Ecografía', 'Odontología', 'Dermatología', 'Nutrición', 'Etología', 'Medicina Interna', 'Oftalmología', 'Neurología', 'Oncología', 'Traumatología', 'Rehabilitación', 'Diagnóstico por Imagen', 'Endocrinología'];
const CIUDADES = ['Medellín', 'Bogotá', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Manizales', 'Santa Marta', 'Pasto'];
const MODALIDADES = ['Presencial', 'Remoto / Teleconsulta', 'Domicilio', 'Mixto'];
const TITULOS = ['Dr.', 'Dra.', 'MV.', 'MVZ.', 'Esp.', 'MSc.', 'PhD.'];

const FASES_INFO = [
  { id: 0, titulo: 'Cuenta', icon: User, desc: 'Datos personales' },
  { id: 1, titulo: 'Perfil', icon: Briefcase, desc: 'Datos profesionales' },
  { id: 2, titulo: 'Documentos', icon: ShieldCheck, desc: 'Verificación' },
  { id: 3, titulo: 'Clínicas', icon: Building2, desc: 'Afiliaciones' },
  { id: 4, titulo: 'Confirmar', icon: CheckCircle2, desc: 'Revisión final' },
];

const FASE_VISUAL = [
  { titulo: 'Tu identidad', desc: 'Crea tu cuenta personal para acceder a todas las herramientas de la plataforma.', icon: User },
  { titulo: 'Tu expertise', desc: 'Las clínicas buscan especialistas como tú. Tu perfil es tu carta de presentación.', icon: Award },
  { titulo: 'Confianza verificada', desc: 'La documentación profesional genera confianza con las clínicas. Puedes completarla después.', icon: ShieldCheck },
  { titulo: 'Red profesional', desc: 'Conecta con las clínicas donde colaboras y expande tu red profesional.', icon: Building2 },
  { titulo: '¡Bienvenido!', desc: 'Tu perfil está listo. Las clínicas podrán encontrarte y enviarte solicitudes de servicio.', icon: Zap },
];

interface DocumentoReq {
  id: string; nombre: string; descripcion: string; obligatorio: boolean; archivo: File | null;
}

const INITIAL_DOCS: DocumentoReq[] = [
  { id: 'cedula', nombre: 'Documento de Identidad', descripcion: 'Cédula o pasaporte (ambos lados)', obligatorio: true, archivo: null },
  { id: 'titulo-prof', nombre: 'Título Profesional', descripcion: 'Diploma de Médico Veterinario', obligatorio: true, archivo: null },
  { id: 'tarjeta-prof', nombre: 'Tarjeta Profesional', descripcion: 'Tarjeta o licencia de ejercicio', obligatorio: true, archivo: null },
  { id: 'certificado-esp', nombre: 'Certificado de Especialidad', descripcion: 'Diploma de posgrado o especialización', obligatorio: false, archivo: null },
  { id: 'seguro', nombre: 'Póliza de Responsabilidad', descripcion: 'Seguro de responsabilidad civil profesional', obligatorio: false, archivo: null },
];

const COLORS_DARK: ColorTheme = {
  bg: '#0B0F1A', card: '#111827', cardAlt: 'rgba(17, 24, 39, 0.5)',
  border: '#1F2937', borderHover: '#374151', text: '#E5E7EB',
  textMuted: '#9CA3AF', textDim: '#6B7280', primary: '#8B5CF6',
  primaryHover: '#7C3AED', primaryLight: 'rgba(139, 92, 246, 0.1)',
  accent: '#F97316', accentLight: 'rgba(249, 115, 22, 0.1)',
  success: '#22C55E', error: '#EF4444', warning: '#F59E0B',
  inputBg: 'rgba(31, 41, 55, 0.5)',
};

const COLORS_LIGHT: ColorTheme = {
  bg: '#F8FAFC', card: '#FFFFFF', cardAlt: 'rgba(255, 255, 255, 0.8)',
  border: '#E2E8F0', borderHover: '#CBD5E1', text: '#0F172A',
  textMuted: '#475569', textDim: '#64748B', primary: '#8B5CF6',
  primaryHover: '#7C3AED', primaryLight: 'rgba(139, 92, 246, 0.08)',
  accent: '#F97316', accentLight: 'rgba(249, 115, 22, 0.08)',
  success: '#22C55E', error: '#EF4444', warning: '#F59E0B',
  inputBg: '#F1F5F9',
};

// ==========================================
// Main Component
// ==========================================
export function RegistroEspecialistaWizard({ onRegisterComplete, onBackToSelector, onBackToLogin }: RegistroEspecialistaWizardProps) {
  const [fase, setFase] = useState<Fase>(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrando, setRegistrando] = useState(false);

  // Fase 0
  const [titulo, setTitulo] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fase 1
  const [especialidadPrincipal, setEspecialidadPrincipal] = useState('');
  const [especialidadesSecundarias, setEspecialidadesSecundarias] = useState<string[]>([]);
  const [anosExperiencia, setAnosExperiencia] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [modalidad, setModalidad] = useState<string[]>([]);
  const [tarifaConsulta, setTarifaConsulta] = useState('');
  const [tarifaCirugia, setTarifaCirugia] = useState('');
  const [bio, setBio] = useState('');

  // Fase 2
  const [documentos, setDocumentos] = useState<DocumentoReq[]>(INITIAL_DOCS);
  const [omitirDocumentos, setOmitirDocumentos] = useState(false);

  // Fase 3
  const [clinicasAfiliadas, setClinicasAfiliadas] = useState<{ nombre: string; ciudad: string; contacto: string }[]>([]);
  const [nuevaClinicaNombre, setNuevaClinicaNombre] = useState('');
  const [nuevaClinicaCiudad, setNuevaClinicaCiudad] = useState('');
  const [nuevaClinicaContacto, setNuevaClinicaContacto] = useState('');

  const [errores, setErrores] = useState<Record<string, string>>({});

  const c = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT;

  const validarFase = useCallback((f: Fase): boolean => {
    const errs: Record<string, string> = {};
    if (f === 0) {
      if (!nombre.trim()) errs.nombre = 'Requerido';
      if (!apellido.trim()) errs.apellido = 'Requerido';
      if (!email.trim()) errs.email = 'Requerido';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email inválido';
      if (!password) errs.password = 'Requerido';
      else if (password.length < 6) errs.password = 'Mínimo 6 caracteres';
      if (password !== confirmPassword) errs.confirmPassword = 'No coinciden';
    } else if (f === 1) {
      if (!especialidadPrincipal) errs.especialidadPrincipal = 'Selecciona tu especialidad';
      if (!ciudad) errs.ciudad = 'Selecciona tu ciudad';
    }
    setErrores(errs);
    return Object.keys(errs).length === 0;
  }, [nombre, apellido, email, password, confirmPassword, especialidadPrincipal, ciudad]);

  const siguiente = () => { if (validarFase(fase)) setFase(Math.min(fase + 1, 4) as Fase); };
  const anterior = () => { setErrores({}); setFase(Math.max(fase - 1, 0) as Fase); };

  const toggleEspecialidadSecundaria = (esp: string) => {
    if (esp === especialidadPrincipal) return;
    setEspecialidadesSecundarias(prev => prev.includes(esp) ? prev.filter(e => e !== esp) : [...prev, esp]);
  };
  const toggleModalidad = (m: string) => { setModalidad(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]); };

  const handleFileChange = (docId: string, file: File | null) => {
    setDocumentos(prev => prev.map(d => d.id === docId ? { ...d, archivo: file } : d));
  };

  const agregarClinica = () => {
    if (nuevaClinicaNombre.trim()) {
      setClinicasAfiliadas(prev => [...prev, { nombre: nuevaClinicaNombre, ciudad: nuevaClinicaCiudad, contacto: nuevaClinicaContacto }]);
      setNuevaClinicaNombre(''); setNuevaClinicaCiudad(''); setNuevaClinicaContacto('');
    }
  };

  const handleRegistro = () => {
    setRegistrando(true);
    const docsSubidos = documentos.filter(d => d.archivo).length;
    onRegisterComplete({
      tipo: 'especialista', titulo, nombre, apellido, email, telefono, password,
      perfil: { especialidadPrincipal, especialidadesSecundarias, anosExperiencia: parseInt(anosExperiencia) || 0, ciudad, modalidad, tarifaConsulta: parseInt(tarifaConsulta) || 0, tarifaCirugia: parseInt(tarifaCirugia) || 0, bio },
      verificacion: { documentosSubidos: docsSubidos, totalDocumentos: documentos.length, estado: docsSubidos === 0 ? 'pendiente' : docsSubidos < documentos.filter(d => d.obligatorio).length ? 'parcial' : 'completa', omitido: omitirDocumentos },
      clinicas: clinicasAfiliadas,
    });
  };

  const docsSubidos = documentos.filter(d => d.archivo).length;

  return (
    <div className="min-h-screen flex transition-colors duration-300" style={{ backgroundColor: c.bg }}>
      {/* Theme Toggle */}
      <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        className="fixed top-6 right-6 z-50 p-3 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: c.card, border: `1px solid ${c.border}` }}>
        {theme === 'dark' ? <Sun className="w-5 h-5" style={{ color: c.primary }} /> : <Moon className="w-5 h-5" style={{ color: c.primary }} />}
      </button>

      <div className="w-full max-w-[1600px] mx-auto flex">
        {/* LEFT - Wizard */}
        <div className="w-full lg:w-[42%] flex flex-col px-6 md:px-10 py-8 overflow-y-auto max-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.accent})` }}>
                <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: c.text }}>VetSpecialist</h1>
                <p className="text-xs" style={{ color: c.textDim }}>Registro de Especialista</p>
              </div>
            </div>
            <button onClick={onBackToSelector} className="text-xs font-medium flex items-center gap-1" style={{ color: c.textDim }}>
              <ArrowLeft className="w-3 h-3" /> Volver
            </button>
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center gap-0.5 mb-8">
            {FASES_INFO.map((f, idx) => (
              <div key={f.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300"
                    style={{ backgroundColor: fase > idx ? c.success : fase === idx ? c.primary : 'transparent', border: `2px solid ${fase > idx ? c.success : fase === idx ? c.primary : c.border}` }}>
                    {fase > idx ? <Check className="w-3.5 h-3.5 text-white" /> : <f.icon className="w-3.5 h-3.5" style={{ color: fase === idx ? 'white' : c.textDim }} />}
                  </div>
                  <span className="text-[9px] font-medium text-center leading-tight" style={{ color: fase >= idx ? c.text : c.textDim }}>{f.titulo}</span>
                </div>
                {idx < FASES_INFO.length - 1 && <div className="h-0.5 flex-1 mx-0.5 mt-[-12px] rounded-full" style={{ backgroundColor: fase > idx ? c.success : c.border }} />}
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1">
            {/* ---- FASE 0: Cuenta ---- */}
            {fase === 0 && (
              <div className="space-y-4" key="f0">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: c.text }}>Crea tu cuenta</h3>
                  <p className="text-sm" style={{ color: c.textMuted }}>Tus datos personales para acceder a la plataforma</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <SelectField label="Título" value={titulo} onChange={setTitulo} options={TITULOS} placeholder="Título" required={false} c={c} />
                  <InputField label="Nombre" value={nombre} onChange={setNombre} error={errores.nombre} placeholder="Juan" icon={User} c={c} />
                  <InputField label="Apellido" value={apellido} onChange={setApellido} error={errores.apellido} placeholder="Pérez" c={c} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Email" value={email} onChange={setEmail} error={errores.email} type="email" placeholder="tu@email.com" icon={Mail} c={c} />
                  <InputField label="Teléfono" value={telefono} onChange={setTelefono} placeholder="+57 300 123 4567" icon={Phone} required={false} c={c} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PasswordField label="Contraseña" value={password} onChange={setPassword} error={errores.password} showPw={showPassword} onToggle={() => setShowPassword(p => !p)} placeholder="Mínimo 6 caracteres" c={c} />
                  <PasswordField label="Confirmar" value={confirmPassword} onChange={setConfirmPassword} error={errores.confirmPassword} showPw={showConfirmPassword} onToggle={() => setShowConfirmPassword(p => !p)} placeholder="Repite la contraseña" c={c} />
                </div>
              </div>
            )}

            {/* ---- FASE 1: Perfil ---- */}
            {fase === 1 && (
              <div className="space-y-4" key="f1">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: c.text }}>Perfil profesional</h3>
                  <p className="text-sm" style={{ color: c.textMuted }}>Información que verán las clínicas en tu perfil</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField label="Especialidad principal" value={especialidadPrincipal} onChange={setEspecialidadPrincipal} options={ESPECIALIDADES} error={errores.especialidadPrincipal} placeholder="Selecciona" c={c} />
                  <SelectField label="Ciudad" value={ciudad} onChange={setCiudad} options={CIUDADES} error={errores.ciudad} placeholder="Selecciona" c={c} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: c.textMuted }}>
                    Especialidades secundarias <span className="normal-case font-normal">(Opcional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ESPECIALIDADES.filter(e => e !== especialidadPrincipal).map(esp => (
                      <button key={esp} type="button" onClick={() => toggleEspecialidadSecundaria(esp)}
                        className="px-3 py-1.5 rounded-full border text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: especialidadesSecundarias.includes(esp) ? c.primaryLight : 'transparent',
                          borderColor: especialidadesSecundarias.includes(esp) ? c.primary : c.border,
                          color: especialidadesSecundarias.includes(esp) ? c.primary : c.textDim,
                        }}>
                        {especialidadesSecundarias.includes(esp) && <Check className="w-3 h-3 inline mr-1" />}{esp}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputField label="Años de experiencia" value={anosExperiencia} onChange={setAnosExperiencia} type="number" placeholder="8" icon={Clock} required={false} c={c} />
                  <InputField label="Tarifa consulta (USD)" value={tarifaConsulta} onChange={setTarifaConsulta} type="number" placeholder="250" icon={DollarSign} required={false} c={c} />
                  <InputField label="Tarifa cirugía (USD)" value={tarifaCirugia} onChange={setTarifaCirugia} type="number" placeholder="600" icon={DollarSign} required={false} c={c} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: c.textMuted }}>
                    Modalidad de atención <span className="normal-case font-normal">(Opcional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MODALIDADES.map(m => (
                      <button key={m} type="button" onClick={() => toggleModalidad(m)}
                        className="px-4 py-2 rounded-lg border-2 text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: modalidad.includes(m) ? c.primaryLight : 'transparent',
                          borderColor: modalidad.includes(m) ? c.primary : c.border,
                          color: modalidad.includes(m) ? c.primary : c.textMuted,
                        }}>{m}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: c.textMuted }}>
                    Biografía profesional <span className="normal-case font-normal">(Opcional)</span>
                  </label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe tu experiencia, enfoque y áreas de interés..." rows={3}
                    className="w-full px-4 py-3 border-2 rounded-lg text-sm resize-none focus:outline-none"
                    style={{ backgroundColor: c.inputBg, borderColor: c.border, color: c.text }} />
                  <p className="text-xs mt-1" style={{ color: c.textDim }}>{bio.length}/500 caracteres</p>
                </div>
              </div>
            )}

            {/* ---- FASE 2: Documentos ---- */}
            {fase === 2 && (
              <div className="space-y-4" key="f2">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: c.text }}>Documentación profesional</h3>
                  <p className="text-sm" style={{ color: c.textMuted }}>
                    Sube tus documentos para verificar tu perfil. Tu cuenta quedará activa mientras completas este paso.
                  </p>
                </div>
                <div
                  className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
                  onClick={() => setOmitirDocumentos(!omitirDocumentos)}
                  style={{ backgroundColor: omitirDocumentos ? c.accentLight : 'transparent', borderColor: omitirDocumentos ? c.accent : c.border }}>
                  <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: omitirDocumentos ? c.accent : c.border, backgroundColor: omitirDocumentos ? c.accent : 'transparent' }}>
                    {omitirDocumentos && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <span className="text-sm font-medium" style={{ color: c.text }}>Completar después</span>
                    <p className="text-xs" style={{ color: c.textDim }}>Tu perfil quedará marcado como "Pendiente de verificación"</p>
                  </div>
                </div>
                {!omitirDocumentos && (
                  <div className="space-y-3">
                    {documentos.map(doc => (
                      <div key={doc.id} className="flex items-center gap-4 p-4 rounded-xl border transition-colors"
                        style={{
                          backgroundColor: doc.archivo ? (theme === 'dark' ? 'rgba(34,197,94,0.05)' : 'rgba(34,197,94,0.08)') : c.cardAlt,
                          borderColor: doc.archivo ? c.success : c.border,
                        }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: doc.archivo ? `${c.success}20` : c.primaryLight }}>
                          {doc.archivo ? <CheckCircle2 className="w-5 h-5" style={{ color: c.success }} /> : <FileText className="w-5 h-5" style={{ color: c.primary }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: c.text }}>{doc.nombre}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                              style={{ backgroundColor: doc.obligatorio ? c.accentLight : c.primaryLight, color: doc.obligatorio ? c.accent : c.primary }}>
                              {doc.obligatorio ? 'Requerido' : 'Opcional'}
                            </span>
                          </div>
                          <p className="text-xs truncate" style={{ color: c.textDim }}>{doc.archivo ? doc.archivo.name : doc.descripcion}</p>
                        </div>
                        <label className="cursor-pointer flex-shrink-0">
                          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)} />
                          <div className="px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 hover:opacity-80"
                            style={{ borderColor: doc.archivo ? c.success : c.primary, color: doc.archivo ? c.success : c.primary }}>
                            <Upload className="w-3 h-3" />{doc.archivo ? 'Cambiar' : 'Subir'}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {!omitirDocumentos && (
                  <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: c.cardAlt, border: `1px solid ${c.border}` }}>
                    <div className="flex-1">
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: c.border }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(docsSubidos / documentos.length) * 100}%`, backgroundColor: docsSubidos === documentos.length ? c.success : c.primary }} />
                      </div>
                    </div>
                    <span className="text-xs font-medium" style={{ color: c.textMuted }}>{docsSubidos}/{documentos.length}</span>
                  </div>
                )}
              </div>
            )}

            {/* ---- FASE 3: Clínicas ---- */}
            {fase === 3 && (
              <div className="space-y-4" key="f3">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: c.text }}>Clínicas donde trabajas</h3>
                  <p className="text-sm" style={{ color: c.textMuted }}>Opcional: agrega las clínicas con las que colaboras.</p>
                </div>
                {clinicasAfiliadas.length > 0 && (
                  <div className="space-y-2">
                    {clinicasAfiliadas.map((cl, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border" style={{ backgroundColor: c.cardAlt, borderColor: c.border }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: c.primaryLight }}>
                          <Building2 className="w-5 h-5" style={{ color: c.primary }} />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium" style={{ color: c.text }}>{cl.nombre}</span>
                          {cl.ciudad && <span className="text-xs ml-2" style={{ color: c.textDim }}>· {cl.ciudad}</span>}
                        </div>
                        <button onClick={() => setClinicasAfiliadas(prev => prev.filter((_, i) => i !== idx))} className="p-1 rounded-lg hover:opacity-70" style={{ color: c.error }}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: c.cardAlt, borderColor: c.border }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4" style={{ color: c.primary }} />
                    <span className="text-sm font-semibold" style={{ color: c.text }}>Agregar clínica</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input value={nuevaClinicaNombre} onChange={(e) => setNuevaClinicaNombre(e.target.value)} placeholder="Nombre de la clínica"
                      className="px-3 py-2.5 border-2 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: c.inputBg, borderColor: c.border, color: c.text }} />
                    <input value={nuevaClinicaCiudad} onChange={(e) => setNuevaClinicaCiudad(e.target.value)} placeholder="Ciudad"
                      className="px-3 py-2.5 border-2 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: c.inputBg, borderColor: c.border, color: c.text }} />
                    <input value={nuevaClinicaContacto} onChange={(e) => setNuevaClinicaContacto(e.target.value)} placeholder="Email contacto"
                      className="px-3 py-2.5 border-2 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: c.inputBg, borderColor: c.border, color: c.text }} />
                  </div>
                  <button type="button" onClick={agregarClinica} disabled={!nuevaClinicaNombre.trim()}
                    className="w-full py-2.5 rounded-lg border-2 border-dashed text-sm font-medium transition-colors disabled:opacity-40"
                    style={{ borderColor: c.primary, color: c.primary }}>+ Agregar clínica</button>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: c.primaryLight, border: `1px solid ${c.primary}30` }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: c.primary }} />
                  <p className="text-xs" style={{ color: c.textMuted }}>Las clínicas recibirán una notificación de afiliación. También puedes recibir invitaciones de clínicas que te encuentren en la plataforma.</p>
                </div>
              </div>
            )}

            {/* ---- FASE 4: Confirmación ---- */}
            {fase === 4 && (
              <div className="space-y-4" key="f4">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: c.text }}>Confirma tu registro</h3>
                  <p className="text-sm" style={{ color: c.textMuted }}>Revisa que todo esté correcto</p>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl p-4 border" style={{ backgroundColor: c.cardAlt, borderColor: c.border }}>
                    <div className="flex items-center gap-2 mb-3"><User className="w-4 h-4" style={{ color: c.primary }} /><span className="text-sm font-semibold" style={{ color: c.text }}>Cuenta</span></div>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span style={{ color: c.textDim }}>Nombre:</span><span style={{ color: c.text }}>{titulo} {nombre} {apellido}</span>
                      <span style={{ color: c.textDim }}>Email:</span><span style={{ color: c.text }}>{email}</span>
                    </div>
                  </div>
                  <div className="rounded-xl p-4 border" style={{ backgroundColor: c.cardAlt, borderColor: c.border }}>
                    <div className="flex items-center gap-2 mb-3"><Stethoscope className="w-4 h-4" style={{ color: c.primary }} /><span className="text-sm font-semibold" style={{ color: c.text }}>Perfil Profesional</span></div>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span style={{ color: c.textDim }}>Especialidad:</span><span style={{ color: c.text }}>{especialidadPrincipal}</span>
                      <span style={{ color: c.textDim }}>Ciudad:</span><span style={{ color: c.text }}>{ciudad}</span>
                      {anosExperiencia && <><span style={{ color: c.textDim }}>Experiencia:</span><span style={{ color: c.text }}>{anosExperiencia} años</span></>}
                      {modalidad.length > 0 && <><span style={{ color: c.textDim }}>Modalidad:</span><span style={{ color: c.text }}>{modalidad.join(', ')}</span></>}
                    </div>
                    {especialidadesSecundarias.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {especialidadesSecundarias.map(e => <span key={e} className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: c.primaryLight, color: c.primary }}>{e}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl p-4 border" style={{ backgroundColor: c.cardAlt, borderColor: c.border }}>
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-4 h-4" style={{ color: omitirDocumentos || docsSubidos === 0 ? c.warning : c.success }} />
                      <span className="text-sm font-semibold" style={{ color: c.text }}>Verificación</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold ml-auto"
                        style={{
                          backgroundColor: omitirDocumentos || docsSubidos === 0 ? `${c.warning}20` : docsSubidos < documentos.filter(d => d.obligatorio).length ? `${c.warning}20` : `${c.success}20`,
                          color: omitirDocumentos || docsSubidos === 0 ? c.warning : docsSubidos < documentos.filter(d => d.obligatorio).length ? c.warning : c.success,
                        }}>
                        {omitirDocumentos || docsSubidos === 0 ? 'Pendiente' : docsSubidos < documentos.filter(d => d.obligatorio).length ? 'Parcial' : 'Completa'}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: c.textDim }}>
                      {omitirDocumentos ? 'Decidiste completar la documentación después.' : `${docsSubidos} de ${documentos.length} documentos cargados.`}
                    </p>
                  </div>
                  {clinicasAfiliadas.length > 0 && (
                    <div className="rounded-xl p-4 border" style={{ backgroundColor: c.cardAlt, borderColor: c.border }}>
                      <div className="flex items-center gap-2 mb-3"><Building2 className="w-4 h-4" style={{ color: c.primary }} /><span className="text-sm font-semibold" style={{ color: c.text }}>Clínicas ({clinicasAfiliadas.length})</span></div>
                      <div className="space-y-1">{clinicasAfiliadas.map((cl, idx) => <div key={idx} className="text-sm" style={{ color: c.textMuted }}>• {cl.nombre} {cl.ciudad && `(${cl.ciudad})`}</div>)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t" style={{ borderColor: c.border }}>
            <button onClick={fase === 0 ? onBackToSelector : anterior}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors"
              style={{ borderColor: c.border, color: c.textMuted }}>
              <ArrowLeft className="w-4 h-4" />{fase === 0 ? 'Volver' : 'Anterior'}
            </button>
            {fase < 4 ? (
              <button onClick={siguiente}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: c.primary }}>
                {fase === 2 && omitirDocumentos ? 'Omitir y continuar' : fase === 3 && clinicasAfiliadas.length === 0 ? 'Omitir y continuar' : 'Siguiente'}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleRegistro} disabled={registrando}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                style={{ backgroundColor: c.success }}>
                {registrando ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creando cuenta...</> : <><CheckCircle2 className="w-4 h-4" />Crear Cuenta</>}
              </button>
            )}
          </div>

          <div className="text-center mt-4">
            <button onClick={onBackToLogin} className="text-xs" style={{ color: c.textDim }}>
              ¿Ya tienes cuenta? <span className="font-semibold" style={{ color: c.primary }}>Iniciar sesión</span>
            </button>
          </div>
        </div>

        {/* RIGHT - Visual Panel */}
        <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden"
          style={{ background: theme === 'dark' ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 50%, #0B0F1A 100%)' : 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 50%, #CBD5E1 100%)' }}>
          <div className="absolute inset-0" style={{ opacity: theme === 'dark' ? 0.04 : 0.03, backgroundImage: `linear-gradient(${c.primary} 1px, transparent 1px), linear-gradient(90deg, ${c.primary} 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
          <div className="relative flex flex-col items-center justify-center w-full p-12">
            <div className="text-center max-w-lg">
              <div className="mx-auto w-24 h-24 rounded-3xl flex items-center justify-center mb-8" style={{ background: `linear-gradient(135deg, ${c.primary}20, ${c.accent}20)`, border: `2px solid ${c.primary}30` }}>
                {(() => { const I = FASE_VISUAL[fase].icon; return <I className="w-12 h-12" style={{ color: fase === 4 ? c.success : c.primary }} />; })()}
              </div>
              <h3 className="text-3xl font-bold mb-4" style={{ color: c.text }}>{FASE_VISUAL[fase].titulo}</h3>
              <p className="text-lg leading-relaxed" style={{ color: c.textMuted }}>{FASE_VISUAL[fase].desc}</p>
              <div className="flex items-center justify-center gap-3 mt-10">
                {FASES_INFO.map((_, idx) => (
                  <div key={idx} className="h-1.5 rounded-full transition-all duration-500" style={{ width: fase === idx ? '40px' : '10px', backgroundColor: fase >= idx ? c.primary : c.border }} />
                ))}
              </div>
              {fase === 4 && (
                <div className="mt-10 rounded-2xl p-6 text-left max-w-sm mx-auto"
                  style={{ backgroundColor: theme === 'dark' ? 'rgba(31,41,55,0.4)' : 'rgba(255,255,255,0.6)', border: `1px solid ${c.border}` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: c.primaryLight }}>
                      <Stethoscope className="w-6 h-6" style={{ color: c.primary }} />
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: c.text }}>{titulo} {nombre} {apellido}</div>
                      <div className="text-xs" style={{ color: c.primary }}>{especialidadPrincipal}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: c.textMuted }}>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ciudad}</span>
                    {anosExperiencia && <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {anosExperiencia} años exp.</span>}
                  </div>
                  {bio && <p className="text-xs mt-3 line-clamp-2" style={{ color: c.textDim }}>{bio}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
