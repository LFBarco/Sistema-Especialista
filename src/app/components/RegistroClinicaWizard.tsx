import { useState, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, ArrowRight, Check, User, Building2, Stethoscope, CheckCircle2,
  Mail, Phone, Lock, Eye, EyeOff, MapPin, Clock, Activity,
  Globe, FileText, Moon, Sun, AlertCircle, Heart, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

// ==========================================
// EXTRACTED OUTSIDE: Input/Select components
// ==========================================
interface ColorTheme {
  bg: string; card: string; cardAlt: string; border: string; borderHover: string;
  text: string; textMuted: string; textDim: string; primary: string;
  primaryHover: string; primaryLight: string; accent: string; success: string;
  error: string; inputBg: string;
}

function InputField({ label, value, onChange, error, type = 'text', placeholder, icon: Icon, required = true, c }: {
  label: string; value: string; onChange: (v: string) => void; error?: string;
  type?: string; placeholder?: string; icon?: LucideIcon; required?: boolean; c: ColorTheme;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: c.textMuted }}>
        {label} {required && <span style={{ color: c.primary }}>*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: c.textDim }} />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
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
        {label} {required && <span style={{ color: c.primary }}>*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-sm appearance-none"
        style={{ backgroundColor: c.inputBg, borderColor: error ? c.error : c.border, color: value ? c.text : c.textDim }}
      >
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
        {label} <span style={{ color: c.primary }}>*</span>
      </label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: c.textDim }} />
        <input
          type={showPw ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none transition-colors text-sm"
          style={{ backgroundColor: c.inputBg, borderColor: error ? c.error : c.border, color: c.text }}
        />
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
interface RegistroClinicaWizardProps {
  onRegisterComplete: (userData: any) => void;
  onBackToSelector: () => void;
  onBackToLogin: () => void;
}

type Fase = 0 | 1 | 2 | 3;

const TIPOS_CLINICA = ['Clínica General', 'Hospital Veterinario', 'Clínica de Especialidades', 'Centro de Diagnóstico', 'Clínica de Emergencias', 'Centro de Rehabilitación', 'Clínica Móvil'];
const SERVICIOS_NECESARIOS = ['Cardiología', 'Cirugía', 'Dermatología', 'Diagnóstico por Imagen', 'Endocrinología', 'Gastroenterología', 'Medicina Interna', 'Neurología', 'Odontología', 'Oftalmología', 'Oncología', 'Ortopedia', 'Rehabilitación', 'Anestesiología', 'Ecografía', 'Laboratorio'];
const CARGOS = ['Dueño/a', 'Administrador/a', 'Director/a Médico', 'Gerente General', 'Contador/a', 'Auditor/a', 'Jefe de Operaciones'];
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const FASES_INFO = [
  { id: 0, titulo: 'Tu Cuenta', icon: User, desc: 'Datos del responsable' },
  { id: 1, titulo: 'La Clínica', icon: Building2, desc: 'Información del establecimiento' },
  { id: 2, titulo: 'Servicios', icon: Stethoscope, desc: 'Qué especialidades necesitas' },
  { id: 3, titulo: 'Confirmación', icon: CheckCircle2, desc: 'Revisa y confirma' },
];

const FASE_VISUAL = [
  { titulo: 'Crea tu cuenta', desc: 'Tu información personal como responsable del portal de la clínica.' },
  { titulo: 'Tu clínica', desc: 'Los datos del establecimiento que aparecerán en la plataforma.' },
  { titulo: 'Conecta con especialistas', desc: 'Indica qué servicios necesitas para que te encuentren los mejores profesionales.' },
  { titulo: '¡Todo listo!', desc: 'Tu cuenta será creada y podrás empezar a usar la plataforma inmediatamente.' },
];

const COLORS_DARK: ColorTheme = {
  bg: '#0B0F1A', card: '#111827', cardAlt: 'rgba(17, 24, 39, 0.5)',
  border: '#1F2937', borderHover: '#374151', text: '#E5E7EB',
  textMuted: '#9CA3AF', textDim: '#6B7280', primary: '#F97316',
  primaryHover: '#EA580C', primaryLight: 'rgba(249, 115, 22, 0.1)',
  accent: '#8B5CF6', success: '#22C55E', error: '#EF4444',
  inputBg: 'rgba(31, 41, 55, 0.5)',
};

const COLORS_LIGHT: ColorTheme = {
  bg: '#F8FAFC', card: '#FFFFFF', cardAlt: 'rgba(255, 255, 255, 0.8)',
  border: '#E2E8F0', borderHover: '#CBD5E1', text: '#0F172A',
  textMuted: '#475569', textDim: '#64748B', primary: '#F97316',
  primaryHover: '#EA580C', primaryLight: 'rgba(249, 115, 22, 0.08)',
  accent: '#8B5CF6', success: '#22C55E', error: '#EF4444',
  inputBg: '#F1F5F9',
};

// ==========================================
// Main Component
// ==========================================
export function RegistroClinicaWizard({ onRegisterComplete, onBackToSelector, onBackToLogin }: RegistroClinicaWizardProps) {
  const [fase, setFase] = useState<Fase>(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrando, setRegistrando] = useState(false);

  // Fase 0
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cargo, setCargo] = useState('');
  const [emailPersonal, setEmailPersonal] = useState('');
  const [telefonoPersonal, setTelefonoPersonal] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fase 1
  const [nombreClinica, setNombreClinica] = useState('');
  const [tipoClinica, setTipoClinica] = useState('');
  const [emailClinica, setEmailClinica] = useState('');
  const [telefonoClinica, setTelefonoClinica] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [pais, setPais] = useState('');
  const [licencia, setLicencia] = useState('');

  // Fase 2
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([]);
  const [horarioInicio, setHorarioInicio] = useState('08:00');
  const [horarioFin, setHorarioFin] = useState('18:00');
  const [diasOperacion, setDiasOperacion] = useState<string[]>(['Lun', 'Mar', 'Mié', 'Jue', 'Vie']);
  const [descripcion, setDescripcion] = useState('');

  const [errores, setErrores] = useState<Record<string, string>>({});

  const c = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT;

  const validarFase = useCallback((f: Fase): boolean => {
    const errs: Record<string, string> = {};
    if (f === 0) {
      if (!nombre.trim()) errs.nombre = 'Requerido';
      if (!apellido.trim()) errs.apellido = 'Requerido';
      if (!cargo) errs.cargo = 'Selecciona tu cargo';
      if (!emailPersonal.trim()) errs.emailPersonal = 'Requerido';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPersonal)) errs.emailPersonal = 'Email inválido';
      if (!password) errs.password = 'Requerido';
      else if (password.length < 6) errs.password = 'Mínimo 6 caracteres';
      if (password !== confirmPassword) errs.confirmPassword = 'No coinciden';
    } else if (f === 1) {
      if (!nombreClinica.trim()) errs.nombreClinica = 'Requerido';
      if (!tipoClinica) errs.tipoClinica = 'Selecciona el tipo';
      if (!direccion.trim()) errs.direccion = 'Requerido';
      if (!ciudad.trim()) errs.ciudad = 'Requerido';
    }
    setErrores(errs);
    return Object.keys(errs).length === 0;
  }, [nombre, apellido, cargo, emailPersonal, password, confirmPassword, nombreClinica, tipoClinica, direccion, ciudad]);

  const siguiente = () => { if (validarFase(fase)) setFase(Math.min(fase + 1, 3) as Fase); };
  const anterior = () => { setErrores({}); setFase(Math.max(fase - 1, 0) as Fase); };

  const toggleServicio = (s: string) => {
    setServiciosSeleccionados(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };
  const toggleDia = (d: string) => {
    setDiasOperacion(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleRegistro = () => {
    setRegistrando(true);
    onRegisterComplete({
      tipo: 'clinica', nombre, apellido, cargo, email: emailPersonal, telefono: telefonoPersonal, password,
      clinica: {
        nombre: nombreClinica, tipo: tipoClinica, email: emailClinica, telefono: telefonoClinica,
        direccion, ciudad, pais, licencia, serviciosNecesarios: serviciosSeleccionados,
        horario: { inicio: horarioInicio, fin: horarioFin }, diasOperacion, descripcion,
      }
    });
  };

  return (
    <div className="min-h-screen flex transition-colors duration-300" style={{ backgroundColor: c.bg }}>
      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        className="fixed top-6 right-6 z-50 p-3 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: c.card, border: `1px solid ${c.border}` }}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" style={{ color: c.primary }} /> : <Moon className="w-5 h-5" style={{ color: c.primary }} />}
      </button>

      <div className="w-full max-w-[1600px] mx-auto flex">
        {/* LEFT - Wizard */}
        <div className="w-full lg:w-[42%] flex flex-col px-6 md:px-10 py-8 overflow-y-auto max-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${c.primary}, #EA580C)` }}>
                <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: c.text }}>VetSpecialist</h1>
                <p className="text-xs" style={{ color: c.textDim }}>Registro de Clínica</p>
              </div>
            </div>
            <button onClick={onBackToSelector} className="text-xs font-medium flex items-center gap-1" style={{ color: c.textDim }}>
              <ArrowLeft className="w-3 h-3" /> Volver
            </button>
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center gap-1 mb-8">
            {FASES_INFO.map((f, idx) => (
              <div key={f.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center mb-1.5 transition-all duration-300"
                    style={{
                      backgroundColor: fase > idx ? c.success : fase === idx ? c.primary : 'transparent',
                      border: `2px solid ${fase > idx ? c.success : fase === idx ? c.primary : c.border}`,
                    }}
                  >
                    {fase > idx ? <Check className="w-4 h-4 text-white" /> : <f.icon className="w-4 h-4" style={{ color: fase === idx ? 'white' : c.textDim }} />}
                  </div>
                  <span className="text-[10px] font-medium text-center" style={{ color: fase >= idx ? c.text : c.textDim }}>{f.titulo}</span>
                </div>
                {idx < FASES_INFO.length - 1 && <div className="h-0.5 flex-1 mx-1 mt-[-12px] rounded-full transition-colors" style={{ backgroundColor: fase > idx ? c.success : c.border }} />}
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1">
            {fase === 0 && (
              <div className="space-y-4" key="fase0">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: c.text }}>Datos del responsable</h3>
                  <p className="text-sm" style={{ color: c.textMuted }}>La persona que administrará el portal de la clínica</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Nombre" value={nombre} onChange={setNombre} error={errores.nombre} placeholder="Juan" icon={User} c={c} />
                  <InputField label="Apellido" value={apellido} onChange={setApellido} error={errores.apellido} placeholder="Pérez" c={c} />
                </div>
                <SelectField label="Cargo / Rol" value={cargo} onChange={setCargo} options={CARGOS} error={errores.cargo} placeholder="Selecciona tu cargo" c={c} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Email" value={emailPersonal} onChange={setEmailPersonal} error={errores.emailPersonal} type="email" placeholder="tu@email.com" icon={Mail} c={c} />
                  <InputField label="Teléfono" value={telefonoPersonal} onChange={setTelefonoPersonal} placeholder="+57 300 123 4567" icon={Phone} required={false} c={c} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PasswordField label="Contraseña" value={password} onChange={setPassword} error={errores.password} showPw={showPassword} onToggle={() => setShowPassword(p => !p)} placeholder="Mínimo 6 caracteres" c={c} />
                  <PasswordField label="Confirmar" value={confirmPassword} onChange={setConfirmPassword} error={errores.confirmPassword} showPw={showConfirmPassword} onToggle={() => setShowConfirmPassword(p => !p)} placeholder="Repite la contraseña" c={c} />
                </div>
              </div>
            )}

            {fase === 1 && (
              <div className="space-y-4" key="fase1">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: c.text }}>Datos de la clínica</h3>
                  <p className="text-sm" style={{ color: c.textMuted }}>Información del establecimiento veterinario</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Nombre de la Clínica" value={nombreClinica} onChange={setNombreClinica} error={errores.nombreClinica} placeholder="Clínica Veterinaria XYZ" icon={Building2} c={c} />
                  <SelectField label="Tipo de Establecimiento" value={tipoClinica} onChange={setTipoClinica} options={TIPOS_CLINICA} error={errores.tipoClinica} placeholder="Selecciona tipo" c={c} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Email de la Clínica" value={emailClinica} onChange={setEmailClinica} type="email" placeholder="clinica@email.com" icon={Mail} required={false} c={c} />
                  <InputField label="Teléfono Clínica" value={telefonoClinica} onChange={setTelefonoClinica} placeholder="+57 604 123 4567" icon={Phone} required={false} c={c} />
                </div>
                <InputField label="Dirección" value={direccion} onChange={setDireccion} error={errores.direccion} placeholder="Calle 10 #20-30, Local 5" icon={MapPin} c={c} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputField label="Ciudad" value={ciudad} onChange={setCiudad} error={errores.ciudad} placeholder="Medellín" c={c} />
                  <InputField label="País" value={pais} onChange={setPais} placeholder="Colombia" icon={Globe} required={false} c={c} />
                  <InputField label="No. Licencia / RUT" value={licencia} onChange={setLicencia} placeholder="Opcional" icon={FileText} required={false} c={c} />
                </div>
              </div>
            )}

            {fase === 2 && (
              <div className="space-y-5" key="fase2">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: c.text }}>Servicios y horarios</h3>
                  <p className="text-sm" style={{ color: c.textMuted }}>¿Qué especialidades necesitas? Esto nos ayuda a conectarte con los especialistas correctos</p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{ color: c.textMuted }}>
                    Especialidades que necesitas <span className="normal-case font-normal">(Opcional)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SERVICIOS_NECESARIOS.map(s => (
                      <button key={s} type="button" onClick={() => toggleServicio(s)}
                        className="px-3 py-2.5 rounded-lg border-2 text-xs font-medium transition-colors text-left"
                        style={{
                          backgroundColor: serviciosSeleccionados.includes(s) ? c.primaryLight : 'transparent',
                          borderColor: serviciosSeleccionados.includes(s) ? c.primary : c.border,
                          color: serviciosSeleccionados.includes(s) ? c.primary : c.textMuted,
                        }}
                      >
                        <span className="flex items-center gap-2">
                          {serviciosSeleccionados.includes(s) && <Check className="w-3 h-3" />}{s}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{ color: c.textMuted }}>Horario de atención</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: c.textDim }}>Apertura</label>
                      <input type="time" value={horarioInicio} onChange={(e) => setHorarioInicio(e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-lg text-sm" style={{ backgroundColor: c.inputBg, borderColor: c.border, color: c.text }} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: c.textDim }}>Cierre</label>
                      <input type="time" value={horarioFin} onChange={(e) => setHorarioFin(e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-lg text-sm" style={{ backgroundColor: c.inputBg, borderColor: c.border, color: c.text }} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{ color: c.textMuted }}>Días de operación</label>
                  <div className="flex gap-2 flex-wrap">
                    {DIAS.map(d => (
                      <button key={d} type="button" onClick={() => toggleDia(d)}
                        className="w-12 h-12 rounded-xl border-2 text-xs font-semibold transition-colors"
                        style={{
                          backgroundColor: diasOperacion.includes(d) ? c.primary : 'transparent',
                          borderColor: diasOperacion.includes(d) ? c.primary : c.border,
                          color: diasOperacion.includes(d) ? 'white' : c.textMuted,
                        }}
                      >{d}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: c.textMuted }}>
                    Descripción de la clínica <span className="normal-case font-normal">(Opcional)</span>
                  </label>
                  <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Breve descripción de tu clínica, servicios principales, enfoque..." rows={3}
                    className="w-full px-4 py-3 border-2 rounded-lg text-sm resize-none focus:outline-none"
                    style={{ backgroundColor: c.inputBg, borderColor: c.border, color: c.text }} />
                </div>
              </div>
            )}

            {fase === 3 && (
              <div className="space-y-5" key="fase3">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: c.text }}>Confirma tu registro</h3>
                  <p className="text-sm" style={{ color: c.textMuted }}>Revisa que todo esté correcto antes de crear tu cuenta</p>
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl p-4 border" style={{ backgroundColor: c.cardAlt, borderColor: c.border }}>
                    <div className="flex items-center gap-2 mb-3"><User className="w-4 h-4" style={{ color: c.primary }} /><span className="text-sm font-semibold" style={{ color: c.text }}>Responsable</span></div>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span style={{ color: c.textDim }}>Nombre:</span><span style={{ color: c.text }}>{nombre} {apellido}</span>
                      <span style={{ color: c.textDim }}>Cargo:</span><span style={{ color: c.text }}>{cargo}</span>
                      <span style={{ color: c.textDim }}>Email:</span><span style={{ color: c.text }}>{emailPersonal}</span>
                      {telefonoPersonal && <><span style={{ color: c.textDim }}>Teléfono:</span><span style={{ color: c.text }}>{telefonoPersonal}</span></>}
                    </div>
                  </div>
                  <div className="rounded-xl p-4 border" style={{ backgroundColor: c.cardAlt, borderColor: c.border }}>
                    <div className="flex items-center gap-2 mb-3"><Building2 className="w-4 h-4" style={{ color: c.primary }} /><span className="text-sm font-semibold" style={{ color: c.text }}>Clínica</span></div>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span style={{ color: c.textDim }}>Nombre:</span><span style={{ color: c.text }}>{nombreClinica}</span>
                      <span style={{ color: c.textDim }}>Tipo:</span><span style={{ color: c.text }}>{tipoClinica}</span>
                      <span style={{ color: c.textDim }}>Dirección:</span><span style={{ color: c.text }}>{direccion}, {ciudad}</span>
                      {pais && <><span style={{ color: c.textDim }}>País:</span><span style={{ color: c.text }}>{pais}</span></>}
                    </div>
                  </div>
                  {serviciosSeleccionados.length > 0 && (
                    <div className="rounded-xl p-4 border" style={{ backgroundColor: c.cardAlt, borderColor: c.border }}>
                      <div className="flex items-center gap-2 mb-3"><Stethoscope className="w-4 h-4" style={{ color: c.primary }} /><span className="text-sm font-semibold" style={{ color: c.text }}>Especialidades</span></div>
                      <div className="flex flex-wrap gap-2">
                        {serviciosSeleccionados.map(s => <span key={s} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: c.primaryLight, color: c.primary }}>{s}</span>)}
                      </div>
                    </div>
                  )}
                  <div className="rounded-xl p-4 border" style={{ backgroundColor: c.cardAlt, borderColor: c.border }}>
                    <div className="flex items-center gap-2 mb-3"><Clock className="w-4 h-4" style={{ color: c.primary }} /><span className="text-sm font-semibold" style={{ color: c.text }}>Horario</span></div>
                    <div className="text-sm" style={{ color: c.textMuted }}>{diasOperacion.join(', ')} · {horarioInicio} – {horarioFin}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t" style={{ borderColor: c.border }}>
            <button onClick={fase === 0 ? onBackToSelector : anterior}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors"
              style={{ borderColor: c.border, color: c.textMuted }}>
              <ArrowLeft className="w-4 h-4" />{fase === 0 ? 'Volver' : 'Anterior'}
            </button>
            {fase < 3 ? (
              <button onClick={siguiente}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: c.primary }}>
                Siguiente<ArrowRight className="w-4 h-4" />
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
                {fase === 0 && <User className="w-12 h-12" style={{ color: c.primary }} />}
                {fase === 1 && <Building2 className="w-12 h-12" style={{ color: c.primary }} />}
                {fase === 2 && <Heart className="w-12 h-12" style={{ color: c.primary }} />}
                {fase === 3 && <Zap className="w-12 h-12" style={{ color: c.success }} />}
              </div>
              <h3 className="text-3xl font-bold mb-4" style={{ color: c.text }}>{FASE_VISUAL[fase].titulo}</h3>
              <p className="text-lg leading-relaxed" style={{ color: c.textMuted }}>{FASE_VISUAL[fase].desc}</p>
              <div className="flex items-center justify-center gap-3 mt-10">
                {FASES_INFO.map((_, idx) => (
                  <div key={idx} className="h-1.5 rounded-full transition-all duration-500" style={{ width: fase === idx ? '40px' : '12px', backgroundColor: fase >= idx ? c.primary : c.border }} />
                ))}
              </div>
              {fase === 3 && (
                <div className="grid grid-cols-3 gap-4 mt-10">
                  {[{ label: 'Especialistas', value: '50+', desc: 'verificados' }, { label: 'Ciudades', value: '15+', desc: 'cobertura' }, { label: 'Especialidades', value: '16', desc: 'disponibles' }].map((stat, idx) => (
                    <div key={idx} className="rounded-xl p-4 text-center" style={{ backgroundColor: theme === 'dark' ? 'rgba(31,41,55,0.4)' : 'rgba(255,255,255,0.6)', border: `1px solid ${c.border}` }}>
                      <div className="text-2xl font-bold" style={{ color: c.primary }}>{stat.value}</div>
                      <div className="text-xs font-medium" style={{ color: c.text }}>{stat.label}</div>
                      <div className="text-xs" style={{ color: c.textDim }}>{stat.desc}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
