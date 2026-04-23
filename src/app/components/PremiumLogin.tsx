import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Activity, CheckCircle2, Clock, TrendingUp, Chrome, Shield, Moon, Sun, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface PremiumLoginProps {
  onLogin: (email: string, password: string, userType: 'clinic' | 'specialist') => void;
  onGoogleLogin: () => void;
  onRegister: () => void;
  onDemoLogin?: () => void;
}

export function PremiumLogin({ onLogin, onGoogleLogin, onRegister, onDemoLogin }: PremiumLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'clinic' | 'specialist'>('specialist');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, userType);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Theme colors - Orange instead of Blue
  const colors = {
    dark: {
      bg: '#0B0F1A',
      card: '#111827',
      cardAlt: 'rgba(17, 24, 39, 0.5)',
      border: '#1F2937',
      borderHover: '#374151',
      text: '#E5E7EB',
      textMuted: '#9CA3AF',
      textDim: '#6B7280',
      primary: '#F97316', // Orange
      primaryHover: '#EA580C',
      primaryDark: '#C2410C',
      primaryLight: 'rgba(249, 115, 22, 0.1)',
      accent: '#8B5CF6',
      success: '#22C55E',
      warning: '#FACC15',
      inputBg: 'rgba(31, 41, 55, 0.5)',
      statusBorder: '#0B0F1A',
    },
    light: {
      bg: '#F8FAFC',
      card: '#FFFFFF',
      cardAlt: 'rgba(255, 255, 255, 0.8)',
      border: '#E2E8F0',
      borderHover: '#CBD5E1',
      text: '#0F172A',
      textMuted: '#475569',
      textDim: '#64748B',
      primary: '#F97316', // Orange
      primaryHover: '#EA580C',
      primaryDark: '#C2410C',
      primaryLight: 'rgba(249, 115, 22, 0.1)',
      accent: '#8B5CF6',
      success: '#22C55E',
      warning: '#FACC15',
      inputBg: '#F1F5F9',
      statusBorder: '#FFFFFF',
    }
  };

  const c = colors[theme];

  return (
    <div className="min-h-screen flex transition-colors duration-300" style={{ backgroundColor: c.bg }}>
      {/* Theme Toggle - Fixed top right */}
      <motion.button
        onClick={toggleTheme}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-6 right-6 z-50 p-3 rounded-xl shadow-lg transition-all duration-200"
        style={{
          backgroundColor: c.card,
          border: `1px solid ${c.border}`,
        }}
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5" style={{ color: c.primary }} />
        ) : (
          <Moon className="w-5 h-5" style={{ color: c.primary }} />
        )}
      </motion.button>

      <div className="w-full max-w-[1600px] mx-auto flex">
        {/* LEFT SIDE - Access Zone (35%) */}
        <div className="w-full lg:w-[35%] flex items-center justify-center px-6 md:px-12 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            {/* Logo + Status */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div 
                    className="w-11 h-11 rounded-lg flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${c.primary} 0%, ${c.primaryHover} 100%)` }}
                  >
                    <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  {/* System status indicator */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ backgroundColor: c.success, border: `2px solid ${c.statusBorder}` }}>
                    <div className="w-full h-full rounded-full animate-ping opacity-75" style={{ backgroundColor: c.success }} />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight" style={{ color: c.text }}>VetSpecialist</h1>
                  <p className="text-xs font-medium" style={{ color: c.textDim }}>Medical Platform</p>
                </div>
              </div>

              {/* Title */}
              <div className="mb-2">
                <h2 className="text-3xl font-bold mb-2" style={{ color: c.text }}>
                  Acceso al sistema
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: c.textMuted }}>
                  Plataforma profesional para especialistas veterinarios
                </p>
              </div>
            </div>

            {/* Setup Guide Banner */}
            {showSetupGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-4 rounded-lg border-2"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(249, 115, 22, 0.05)' : 'rgba(249, 115, 22, 0.08)',
                  borderColor: c.primary,
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: c.primary }} />
                  <div>
                    <h3 className="text-sm font-bold mb-1" style={{ color: c.text }}>
                      Configuración requerida: Habilitar Email Provider
                    </h3>
                    <p className="text-xs leading-relaxed mb-2" style={{ color: c.textMuted }}>
                      El proveedor de autenticación por email no está habilitado en Supabase. Sigue estos pasos:
                    </p>
                  </div>
                </div>
                
                <ol className="text-xs space-y-2 ml-8 mb-3" style={{ color: c.textMuted }}>
                  <li className="flex items-start gap-2">
                    <span className="font-bold" style={{ color: c.primary }}>1.</span>
                    <span>Ve a tu <strong style={{ color: c.text }}>Dashboard de Supabase</strong> → <strong>Authentication</strong> → <strong>Providers</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold" style={{ color: c.primary }}>2.</span>
                    <span>Busca <strong style={{ color: c.text }}>Email</strong> en la lista de proveedores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold" style={{ color: c.primary }}>3.</span>
                    <span>Haz clic en <strong style={{ color: c.text }}>Email</strong> y activa el toggle <strong>"Enable Email provider"</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold" style={{ color: c.primary }}>4.</span>
                    <span>Guarda los cambios y recarga esta página</span>
                  </li>
                </ol>

                <div className="flex gap-2">
                  <button
                    onClick={() => window.open('https://supabase.com/dashboard/project/_/auth/providers', '_blank')}
                    className="text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: c.primary,
                      color: 'white',
                    }}
                  >
                    Abrir Supabase Dashboard
                  </button>
                  <button
                    onClick={() => setShowSetupGuide(false)}
                    className="text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'transparent',
                      color: c.textMuted,
                      border: `1px solid ${c.border}`,
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            )}

            {/* Quick Info Banner */}
            <div 
              className="flex items-center justify-between gap-3 p-3 rounded-lg mb-4 cursor-pointer transition-colors"
              style={{ 
                backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.08)',
                border: `1px solid ${theme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.3)'}`
              }}
              onClick={() => setShowSetupGuide(!showSetupGuide)}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: c.accent }} />
                <p className="text-xs font-medium" style={{ color: c.text }}>
                  {showSetupGuide ? 'Ocultar guía de configuración' : '¿Problemas al iniciar sesión? Ver guía de configuración'}
                </p>
              </div>
              <svg 
                className="w-4 h-4 transition-transform" 
                style={{ 
                  color: c.accent,
                  transform: showSetupGuide ? 'rotate(180deg)' : 'rotate(0deg)'
                }} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Access Card */}
            <div 
              className="backdrop-blur-sm rounded-xl p-6 mb-6"
              style={{ 
                backgroundColor: c.cardAlt,
                border: `1px solid ${c.border}`
              }}
            >
              {/* Role Selector */}
              <div className="mb-6">
                <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{ color: c.textMuted }}>
                  Tipo de acceso
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setUserType('clinic')}
                    whileTap={{ scale: 0.98 }}
                    className="relative px-4 py-3 rounded-lg border-2 transition-all duration-200"
                    style={{
                      backgroundColor: userType === 'clinic' ? c.primaryLight : 'transparent',
                      borderColor: userType === 'clinic' ? c.primary : c.border,
                      color: userType === 'clinic' ? c.text : c.textDim,
                    }}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ backgroundColor: userType === 'clinic' ? c.primary : c.border }}
                      >
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium">Clínica</span>
                    </div>
                    {userType === 'clinic' && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 rounded-lg ring-2 ring-offset-2"
                        style={{ 
                          ringColor: c.primary,
                          ringOffsetColor: c.bg 
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setUserType('specialist')}
                    whileTap={{ scale: 0.98 }}
                    className="relative px-4 py-3 rounded-lg border-2 transition-all duration-200"
                    style={{
                      backgroundColor: userType === 'specialist' ? c.primaryLight : 'transparent',
                      borderColor: userType === 'specialist' ? c.primary : c.border,
                      color: userType === 'specialist' ? c.text : c.textDim,
                    }}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ backgroundColor: userType === 'specialist' ? c.primary : c.border }}
                      >
                        <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </div>
                      <span className="text-xs font-medium">Especialista</span>
                    </div>
                    {userType === 'specialist' && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 rounded-lg ring-2 ring-offset-2"
                        style={{ 
                          ringColor: c.primary,
                          ringOffsetColor: c.bg 
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: c.textMuted }}>
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: c.textDim }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="usuario@ejemplo.com"
                      className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 text-sm"
                      style={{
                        backgroundColor: c.inputBg,
                        borderColor: focusedField === 'email' ? c.primary : c.border,
                        color: c.text,
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{ color: c.textMuted }}>
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: c.textDim }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••••"
                      className="w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 text-sm"
                      style={{
                        backgroundColor: c.inputBg,
                        borderColor: focusedField === 'password' ? c.primary : c.border,
                        color: c.text,
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: c.textDim }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Primary Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3.5 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg mt-6"
                  style={{
                    background: `linear-gradient(135deg, ${c.primary} 0%, ${c.primaryHover} 100%)`,
                    boxShadow: `0 10px 30px -10px ${c.primary}40`,
                    border: 'none'
                  }}
                >
                  Acceder al sistema
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </motion.button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: c.border }} />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span 
                    className="px-3 uppercase tracking-wider font-medium"
                    style={{ 
                      backgroundColor: c.cardAlt,
                      color: c.textDim 
                    }}
                  >
                    O continuar con
                  </span>
                </div>
              </div>

              {/* Google Login */}
              <button
                onClick={onGoogleLogin}
                className="w-full py-3 border-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 group"
                style={{
                  backgroundColor: c.cardAlt,
                  borderColor: c.border,
                  color: c.text,
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = c.borderHover}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = c.border}
              >
                <Chrome className="w-4 h-4 transition-colors" style={{ color: c.textDim }} />
                <span className="text-sm font-medium">Google Workspace</span>
              </button>

              {/* Demo Access Button */}
              {onDemoLogin && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" style={{ borderColor: c.border }} />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span 
                        className="px-3 uppercase tracking-wider font-medium"
                        style={{ 
                          backgroundColor: c.cardAlt,
                          color: c.textDim 
                        }}
                      >
                        Acceso rápido
                      </span>
                    </div>
                  </div>

                  <motion.button
                    onClick={onDemoLogin}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3 border-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.08)',
                      borderColor: c.accent,
                      color: c.text,
                    }}
                  >
                    <Activity className="w-4 h-4" style={{ color: c.accent }} />
                    <span className="text-sm font-semibold">Modo Demo (Sin autenticación)</span>
                  </motion.button>

                  <p className="text-xs text-center mt-2" style={{ color: c.textDim }}>
                    Para pruebas y desarrollo. No requiere configuración de Supabase.
                  </p>
                </>
              )}
            </div>

            {/* Security Notice */}
            <div 
              className="flex items-start gap-3 p-4 rounded-lg mb-4"
              style={{ 
                backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.3)' : 'rgba(226, 232, 240, 0.5)',
                border: `1px solid ${theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(203, 213, 225, 0.5)'}`
              }}
            >
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: c.success }} />
              <p className="text-xs leading-relaxed" style={{ color: c.textMuted }}>
                <span className="font-semibold" style={{ color: c.text }}>Acceso exclusivo para usuarios autorizados.</span> Conexión segura y encriptada end-to-end.
              </p>
            </div>

            {/* Footer Links */}
            <div className="text-center space-y-2">
              <button
                onClick={onRegister}
                className="text-xs transition-colors block mx-auto"
                style={{ color: c.textDim }}
              >
                ¿No tienes cuenta? <span className="font-semibold" style={{ color: c.primary }}>Registrarse</span>
              </button>
              <button
                className="text-xs transition-colors block mx-auto"
                style={{ color: c.textDim }}
                onClick={() => window.open('mailto:soporte@vetspecialist.com')}
              >
                ¿Problemas para ingresar? <span className="font-semibold" style={{ color: c.accent }}>Contactar soporte</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE - System Visualization (65%) */}
        <div 
          className="hidden lg:flex lg:w-[65%] relative overflow-hidden"
          style={{
            background: theme === 'dark' 
              ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 50%, #0B0F1A 100%)'
              : 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 50%, #CBD5E1 100%)'
          }}
        >
          {/* Subtle background grid */}
          <div 
            className="absolute inset-0"
            style={{
              opacity: theme === 'dark' ? 0.05 : 0.03,
              backgroundImage: `linear-gradient(${c.primary} 1px, transparent 1px), linear-gradient(90deg, ${c.primary} 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }} 
          />

          {/* Gradient overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: theme === 'dark'
                ? `linear-gradient(135deg, ${c.primary}10 0%, transparent 50%, ${c.accent}10 100%)`
                : `linear-gradient(135deg, ${c.primary}08 0%, transparent 50%, ${c.accent}08 100%)`
            }}
          />

          <div className="relative flex flex-col items-center justify-center w-full p-16">
            {/* Headline Text */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-12 max-w-2xl"
            >
              <h3 className="text-4xl font-bold mb-4 leading-tight" style={{ color: c.text }}>
                Coordinación médica.<br />
                <span 
                  className="text-transparent bg-clip-text"
                  style={{ 
                    backgroundImage: `linear-gradient(90deg, ${c.primary} 0%, ${c.accent} 100%)`
                  }}
                >
                  Especialistas conectados.
                </span><br />
                Operación bajo control.
              </h3>
              <p className="text-lg" style={{ color: c.textMuted }}>
                Sistema enterprise para gestión profesional de servicios veterinarios especializados
              </p>
            </motion.div>

            {/* Dashboard Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full max-w-4xl"
            >
                    {/* Main Dashboard Card */}
              <div 
                className="backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
                style={{ 
                  backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(203, 213, 225, 0.8)'}`
                }}
              >
                {/* Dashboard Header */}
                <div 
                  className="px-6 py-4 border-b flex items-center justify-between"
                  style={{ borderColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(203, 213, 225, 0.5)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: c.success }} />
                    <span className="text-sm font-semibold" style={{ color: c.text }}>Sistema Operativo</span>
                    <span className="text-xs" style={{ color: c.textDim }}>•</span>
                    <span className="text-xs" style={{ color: c.textDim }}>Última actualización: hace 2 min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="px-3 py-1 rounded-full border"
                      style={{ 
                        backgroundColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.15)',
                        borderColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.4)'
                      }}
                    >
                      <span className="text-xs font-semibold" style={{ color: c.success }}>En línea</span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div 
                  className="grid grid-cols-2 xl:grid-cols-4 gap-4 p-6 border-b"
                  style={{ borderColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(203, 213, 225, 0.5)' }}
                >
                  {[
                    { label: 'Solicitudes', value: '12', color: c.warning, icon: Clock, trend: '+3 hoy' },
                    { label: 'Confirmadas', value: '8', color: c.primary, icon: CheckCircle2, trend: 'Esta semana' },
                    { label: 'Completadas', value: '45', color: c.success, icon: Activity, trend: 'Este mes' },
                    { label: 'Por cobrar', value: '$8.5k', color: c.accent, icon: TrendingUp, trend: 'Pendiente' },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="border rounded-xl p-4 transition-colors"
                      style={{ 
                        backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                        borderColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(203, 213, 225, 0.5)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                        <span className="text-xs" style={{ color: c.textDim }}>{stat.trend}</span>
                      </div>
                      <div className="text-2xl font-bold mb-1" style={{ color: c.text }}>{stat.value}</div>
                      <div className="text-xs" style={{ color: c.textMuted }}>{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Appointments List */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold" style={{ color: c.text }}>Agenda del día</h4>
                    <span className="text-xs" style={{ color: c.textDim }}>Martes, 28 de enero</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { time: '10:00', patient: 'Max', type: 'Ecocardiograma', clinic: 'VetPlus', status: 'confirmed', color: c.primary },
                      { time: '14:30', patient: 'Luna', type: 'Consulta', clinic: 'PetCare', status: 'pending', color: c.warning },
                      { time: '16:00', patient: 'Rocky', type: 'Seguimiento', clinic: 'Animal Hospital', status: 'completed', color: c.success },
                    ].map((apt, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        className="flex items-center gap-4 p-3 border rounded-lg transition-all group cursor-pointer"
                        style={{ 
                          backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                          borderColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(203, 213, 225, 0.5)'
                        }}
                      >
                        <div className="flex-shrink-0 w-16 text-center">
                          <div className="text-sm font-semibold" style={{ color: c.text }}>{apt.time}</div>
                          <div className="text-xs" style={{ color: c.textDim }}>hrs</div>
                        </div>
                        <div className="w-px h-10" style={{ backgroundColor: c.border }} />
                        <div 
                          className="w-1 h-10 rounded-full" 
                          style={{ backgroundColor: apt.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold" style={{ color: c.text }}>{apt.patient}</span>
                            <span className="text-xs" style={{ color: c.textDim }}>•</span>
                            <span className="text-xs" style={{ color: c.textMuted }}>{apt.type}</span>
                          </div>
                          <div className="text-xs" style={{ color: c.textDim }}>{apt.clinic}</div>
                        </div>
                        <div 
                          className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: apt.status === 'confirmed' ? (theme === 'dark' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.15)') :
                                           apt.status === 'pending' ? (theme === 'dark' ? 'rgba(250, 204, 21, 0.1)' : 'rgba(250, 204, 21, 0.15)') :
                                           (theme === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.15)'),
                            color: apt.status === 'confirmed' ? c.primary :
                                   apt.status === 'pending' ? c.warning :
                                   c.success
                          }}
                        >
                          {apt.status === 'confirmed' ? 'Confirmada' :
                           apt.status === 'pending' ? 'Pendiente' :
                           'Completada'}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div 
                  className="px-6 py-4 border-t flex items-center justify-between"
                  style={{ 
                    backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                    borderColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(203, 213, 225, 0.5)'
                  }}
                >
                  <div className="flex items-center gap-2 text-xs" style={{ color: c.textDim }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.success }} />
                    <span>8 clínicas conectadas</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: c.textDim }}>
                    <span>Sincronización activa</span>
                    <span>•</span>
                    <span>Datos encriptados</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Features */}
            <div className="absolute top-8 right-8 space-y-3">
              {[
                { icon: Shield, label: 'Seguridad médica', color: c.success },
                { icon: Activity, label: 'Tiempo real', color: c.primary },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.2 }}
                  className="flex items-center gap-2 px-4 py-2 backdrop-blur-xl border rounded-lg"
                  style={{ 
                    backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                    borderColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(203, 213, 225, 0.5)'
                  }}
                >
                  <feature.icon className="w-4 h-4" style={{ color: feature.color }} />
                  <span className="text-xs font-medium" style={{ color: c.text }}>{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}