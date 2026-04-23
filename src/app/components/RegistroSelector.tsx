import { useState } from 'react';
import { Building2, Stethoscope, ArrowLeft, ArrowRight, Shield, Activity, CheckCircle2, Users, Calendar, FileText, Moon, Sun } from 'lucide-react';

interface RegistroSelectorProps {
  onSelectClinica: () => void;
  onSelectEspecialista: () => void;
  onBackToLogin: () => void;
}

const COLORS_DARK = {
  bg: '#0B0F1A', card: '#111827', cardHover: '#1F2937', border: '#1F2937',
  borderActive: '#F97316', text: '#E5E7EB', textMuted: '#9CA3AF', textDim: '#6B7280',
  primary: '#F97316', primaryLight: 'rgba(249, 115, 22, 0.1)',
  accent: '#8B5CF6', accentLight: 'rgba(139, 92, 246, 0.1)',
};

const COLORS_LIGHT = {
  bg: '#F8FAFC', card: '#FFFFFF', cardHover: '#F1F5F9', border: '#E2E8F0',
  borderActive: '#F97316', text: '#0F172A', textMuted: '#475569', textDim: '#64748B',
  primary: '#F97316', primaryLight: 'rgba(249, 115, 22, 0.08)',
  accent: '#8B5CF6', accentLight: 'rgba(139, 92, 246, 0.08)',
};

const clinicaFeatures = [
  { icon: Users, text: 'Gestión de especialistas afiliados' },
  { icon: Calendar, text: 'Coordinación de citas y agenda' },
  { icon: FileText, text: 'Facturación y reportes financieros' },
  { icon: Shield, text: 'Control de accesos y permisos' },
];

const especialistaFeatures = [
  { icon: Stethoscope, text: 'Perfil profesional verificable' },
  { icon: Calendar, text: 'Agenda médica personalizada' },
  { icon: Building2, text: 'Conexión con múltiples clínicas' },
  { icon: CheckCircle2, text: 'Historial de servicios y finanzas' },
];

export function RegistroSelector({ onSelectClinica, onSelectEspecialista, onBackToLogin }: RegistroSelectorProps) {
  const [hoveredCard, setHoveredCard] = useState<'clinica' | 'especialista' | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const c = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT;

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

      <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center px-6 py-12 min-h-screen">
        {/* Header */}
        <div className="text-center mb-12 animate-[fadeIn_0.4s_ease]">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${c.primary} 0%, #EA580C 100%)` }}>
              <Activity className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: c.text }}>VetSpecialist</h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: c.text }}>¿Cómo deseas registrarte?</h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: c.textMuted }}>Selecciona el tipo de cuenta que mejor se adapte a tu rol profesional</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-10">
          {/* Clínica Card */}
          <button
            onClick={onSelectClinica}
            onMouseEnter={() => setHoveredCard('clinica')}
            onMouseLeave={() => setHoveredCard(null)}
            className="relative text-left rounded-2xl p-8 transition-all duration-300 group overflow-hidden hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]"
            style={{
              backgroundColor: hoveredCard === 'clinica' ? c.cardHover : c.card,
              border: `2px solid ${hoveredCard === 'clinica' ? c.primary : c.border}`,
              boxShadow: hoveredCard === 'clinica' ? `0 20px 60px -15px ${c.primary}30` : 'none',
            }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(circle, ${c.primary}15 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300"
                style={{ backgroundColor: hoveredCard === 'clinica' ? c.primary : c.primaryLight }}>
                <Building2 className="w-8 h-8 transition-colors duration-300" style={{ color: hoveredCard === 'clinica' ? 'white' : c.primary }} />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: c.text }}>Soy Clínica</h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: c.textMuted }}>Administra tu clínica veterinaria, coordina especialistas y gestiona operaciones desde un solo portal.</p>
              <div className="space-y-3 mb-6">
                {clinicaFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.primaryLight }}>
                      <feature.icon className="w-3.5 h-3.5" style={{ color: c.primary }} />
                    </div>
                    <span className="text-sm" style={{ color: c.textMuted }}>{feature.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: c.primary }}>
                Registrar Clínica<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Especialista Card */}
          <button
            onClick={onSelectEspecialista}
            onMouseEnter={() => setHoveredCard('especialista')}
            onMouseLeave={() => setHoveredCard(null)}
            className="relative text-left rounded-2xl p-8 transition-all duration-300 group overflow-hidden hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]"
            style={{
              backgroundColor: hoveredCard === 'especialista' ? c.cardHover : c.card,
              border: `2px solid ${hoveredCard === 'especialista' ? c.accent : c.border}`,
              boxShadow: hoveredCard === 'especialista' ? `0 20px 60px -15px ${c.accent}30` : 'none',
            }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(circle, ${c.accent}15 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300"
                style={{ backgroundColor: hoveredCard === 'especialista' ? c.accent : c.accentLight }}>
                <Stethoscope className="w-8 h-8 transition-colors duration-300" style={{ color: hoveredCard === 'especialista' ? 'white' : c.accent }} />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: c.text }}>Soy Especialista</h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: c.textMuted }}>Crea tu perfil profesional, gestiona tu agenda y conecta con clínicas que necesitan tus servicios.</p>
              <div className="space-y-3 mb-6">
                {especialistaFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.accentLight }}>
                      <feature.icon className="w-3.5 h-3.5" style={{ color: c.accent }} />
                    </div>
                    <span className="text-sm" style={{ color: c.textMuted }}>{feature.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: c.accent }}>
                Registrar Especialista<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <button onClick={onBackToLogin} className="flex items-center gap-2 mx-auto text-sm transition-colors hover:gap-3" style={{ color: c.textDim }}>
            <ArrowLeft className="w-4 h-4" />
            <span>¿Ya tienes cuenta? <span className="font-semibold" style={{ color: c.primary }}>Iniciar sesión</span></span>
          </button>
        </div>
      </div>
    </div>
  );
}
