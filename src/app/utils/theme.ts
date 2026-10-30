export type BrandTheme = 'orange' | 'teal' | 'blue';

export const BRAND_STORAGE_KEY = 'vs_brand_theme';
export const DARK_STORAGE_KEY = 'vs_dark_mode';

export type BrandThemeMeta = {
  id: BrandTheme;
  nombre: string;
  descripcion: string;
  /** Swatch preview (light mode brand) */
  swatch: string;
  swatchDark: string;
};

export const BRAND_THEMES: BrandThemeMeta[] = [
  {
    id: 'orange',
    nombre: 'Naranja clínico',
    descripcion: 'Marca VetSpecialist — energía profesional y clara.',
    swatch: '#EA580C',
    swatchDark: '#FB923C',
  },
  {
    id: 'teal',
    nombre: 'Teal clínico',
    descripcion: 'Sensación salud / cuidado veterinario.',
    swatch: '#0F766E',
    swatchDark: '#2DD4BF',
  },
  {
    id: 'blue',
    nombre: 'Azul institucional',
    descripcion: 'Look hospitalario y corporativo.',
    swatch: '#1D4ED8',
    swatchDark: '#60A5FA',
  },
];

export function leerBrandTheme(): BrandTheme {
  try {
    const v = localStorage.getItem(BRAND_STORAGE_KEY);
    if (v === 'orange' || v === 'teal' || v === 'blue') return v;
  } catch {
    /* ignore */
  }
  return 'orange';
}

export function leerDarkMode(): boolean {
  try {
    const v = localStorage.getItem(DARK_STORAGE_KEY);
    if (v === '0' || v === 'false') return false;
    if (v === '1' || v === 'true') return true;
  } catch {
    /* ignore */
  }
  return true;
}

/** Aplica data-brand y clase .dark en <html> */
export function aplicarTemaEnDocumento(brand: BrandTheme, dark: boolean) {
  const root = document.documentElement;
  root.setAttribute('data-brand', brand);
  root.classList.toggle('dark', dark);
  try {
    localStorage.setItem(BRAND_STORAGE_KEY, brand);
    localStorage.setItem(DARK_STORAGE_KEY, dark ? '1' : '0');
  } catch {
    /* ignore */
  }
}

/** Hex de marca para estilos inline (gráficos, PDF, etc.) */
export function brandHex(brand: BrandTheme, dark: boolean): string {
  const meta = BRAND_THEMES.find((t) => t.id === brand)!;
  return dark ? meta.swatchDark : meta.swatch;
}

// Evita flash de tema incorrecto en la primera pintura
if (typeof document !== 'undefined') {
  aplicarTemaEnDocumento(leerBrandTheme(), leerDarkMode());
}
