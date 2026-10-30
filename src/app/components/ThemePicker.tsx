import { Check, Moon, Sun, Palette } from 'lucide-react';
import { useApp } from '../App';
import { BRAND_THEMES, type BrandTheme } from '../utils/theme';

type Props = {
  /** compact = solo swatches (Header); full = tarjetas con texto (Config) */
  variant?: 'compact' | 'full';
};

export function ThemePicker({ variant = 'full' }: Props) {
  const { darkMode, toggleDarkMode, brandTheme, setBrandTheme } = useApp();

  const elegir = (id: BrandTheme) => setBrandTheme(id);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5" title="Tema de color">
        <Palette className="w-4 h-4 opacity-60" style={{ color: 'var(--text-muted-theme)' }} />
        {BRAND_THEMES.map((t) => {
          const activo = brandTheme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              title={t.nombre}
              onClick={() => elegir(t.id)}
              className="relative w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                backgroundColor: darkMode ? t.swatchDark : t.swatch,
                boxShadow: activo ? `0 0 0 2px var(--surface), 0 0 0 4px ${darkMode ? t.swatchDark : t.swatch}` : undefined,
              }}
              aria-pressed={activo}
              aria-label={t.nombre}
            >
              {activo && <Check className="w-3 h-3 text-white absolute inset-0 m-auto drop-shadow" strokeWidth={3} />}
            </button>
          );
        })}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="ml-1 p-1.5 rounded-lg transition-colors"
          style={{
            color: 'var(--text-muted-theme)',
            backgroundColor: 'transparent',
          }}
          title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-theme)' }}>
            Apariencia
          </h3>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted-theme)' }}>
            Elige la paleta del portal. Se guarda en este dispositivo.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleDarkMode}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
          style={{
            borderColor: 'var(--border-theme)',
            color: 'var(--text-theme)',
            backgroundColor: 'var(--surface)',
          }}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {darkMode ? 'Modo claro' : 'Modo oscuro'}
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {BRAND_THEMES.map((t) => {
          const activo = brandTheme === t.id;
          const color = darkMode ? t.swatchDark : t.swatch;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => elegir(t.id)}
              className="text-left rounded-xl border p-4 transition-all hover:scale-[1.01]"
              style={{
                borderColor: activo ? color : 'var(--border-theme)',
                backgroundColor: 'var(--surface)',
                boxShadow: activo ? `0 0 0 1px ${color}` : undefined,
              }}
              aria-pressed={activo}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-10 h-10 rounded-xl brand-mark shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${color} 0%, ${t.swatch} 100%)`,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate" style={{ color: 'var(--text-theme)' }}>
                    {t.nombre}
                  </p>
                  {activo && (
                    <span className="text-xs font-medium inline-flex items-center gap-1" style={{ color }}>
                      <Check className="w-3 h-3" /> Activo
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted-theme)' }}>
                {t.descripcion}
              </p>
              <div className="mt-3 flex gap-1.5">
                <span className="h-2 flex-1 rounded-full" style={{ backgroundColor: color }} />
                <span className="h-2 w-8 rounded-full" style={{ backgroundColor: 'var(--success)' }} />
                <span className="h-2 w-8 rounded-full" style={{ backgroundColor: 'var(--warning)' }} />
                <span className="h-2 w-8 rounded-full" style={{ backgroundColor: 'var(--danger)' }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
