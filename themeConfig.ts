export type AppThemeId =
  | 'cyber_neon'
  | 'amoled_black'
  | 'electric_violet'
  | 'aurora_borealis'
  | 'sunset_honduras'
  | 'emerald_matrix'
  | 'crimson_blood'
  | 'ocean_depths';

export interface AppTheme {
  id: AppThemeId;
  name: string;
  category: 'Dark HD' | 'Cyberpunk' | 'Vibrant' | 'Nature';
  description: string;
  previewColors: {
    bg: string;
    card: string;
    primary: string;
    accent: string;
    border: string;
  };
  // CSS classes / color tokens
  appBg: string;
  statusBarBg: string;
  headerBg: string;
  cardBg: string;
  cardBorder: string;
  cardInnerBg: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  glowColor: string;
  fabBg: string;
  bottomNavBg: string;
}

export const APP_THEMES: AppTheme[] = [
  {
    id: 'cyber_neon',
    name: 'Cyberpunk Cyan (Default)',
    category: 'Cyberpunk',
    description: 'Estilo clásico HTTP Custom con toques neón cian y ámbar en alta definición.',
    previewColors: {
      bg: '#0a0e16',
      card: '#111722',
      primary: '#06b6d4',
      accent: '#f59e0b',
      border: '#1e293b',
    },
    appBg: 'bg-[#0a0e16]',
    statusBarBg: 'bg-[#0b0e14]',
    headerBg: 'bg-[#0f141c]',
    cardBg: 'bg-[#111722]',
    cardBorder: 'border-slate-800/90',
    cardInnerBg: 'bg-[#0a0e16]',
    accentText: 'text-cyan-400',
    accentBg: 'bg-cyan-500',
    accentBorder: 'border-cyan-500',
    badgeBg: 'bg-cyan-950/80',
    badgeText: 'text-cyan-400',
    badgeBorder: 'border-cyan-800/60',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    fabBg: 'bg-[#2563eb]',
    bottomNavBg: 'bg-[#0d121b]',
  },
  {
    id: 'electric_violet',
    name: 'Electric Violet & Magenta',
    category: 'Vibrant',
    description: 'Tonos púrpura eléctrico, violeta neón y magenta con brillo ultravioleta.',
    previewColors: {
      bg: '#0b0813',
      card: '#150e24',
      primary: '#a855f7',
      accent: '#ec4899',
      border: '#2e194d',
    },
    appBg: 'bg-[#0b0813]',
    statusBarBg: 'bg-[#07040d]',
    headerBg: 'bg-[#100b1c]',
    cardBg: 'bg-[#150e24]',
    cardBorder: 'border-purple-900/60',
    cardInnerBg: 'bg-[#0c0716]',
    accentText: 'text-purple-400',
    accentBg: 'bg-purple-600',
    accentBorder: 'border-purple-500',
    badgeBg: 'bg-purple-950/80',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-800/60',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    fabBg: 'bg-purple-600',
    bottomNavBg: 'bg-[#110c1e]',
  },
  {
    id: 'aurora_borealis',
    name: 'Aurora Borealis',
    category: 'Nature',
    description: 'Gradientes mágicos de verde esmeralda ártico, turquesa nórdico y azul celeste.',
    previewColors: {
      bg: '#061314',
      card: '#0c2225',
      primary: '#10b981',
      accent: '#06b6d4',
      border: '#133e42',
    },
    appBg: 'bg-[#061314]',
    statusBarBg: 'bg-[#040e0f]',
    headerBg: 'bg-[#091b1d]',
    cardBg: 'bg-[#0c2225]',
    cardBorder: 'border-teal-900/60',
    cardInnerBg: 'bg-[#061416]',
    accentText: 'text-emerald-400',
    accentBg: 'bg-emerald-500',
    accentBorder: 'border-emerald-500',
    badgeBg: 'bg-emerald-950/80',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-800/60',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    fabBg: 'bg-emerald-600',
    bottomNavBg: 'bg-[#091d1f]',
  },
  {
    id: 'sunset_honduras',
    name: 'Atardecer Maya (Gold & Fire)',
    category: 'Vibrant',
    description: 'Dorado intenso, naranja volcánico y rojo ámbar vibrante para máxima energía.',
    previewColors: {
      bg: '#140c06',
      card: '#22150a',
      primary: '#f59e0b',
      accent: '#f97316',
      border: '#45260f',
    },
    appBg: 'bg-[#140c06]',
    statusBarBg: 'bg-[#0c0703]',
    headerBg: 'bg-[#1b1008]',
    cardBg: 'bg-[#22150a]',
    cardBorder: 'border-amber-900/60',
    cardInnerBg: 'bg-[#120a04]',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-500',
    accentBorder: 'border-amber-500',
    badgeBg: 'bg-amber-950/80',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-800/60',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    fabBg: 'bg-amber-600',
    bottomNavBg: 'bg-[#1c1108]',
  },
  {
    id: 'amoled_black',
    name: 'AMOLED Pure Black (Zero Battery)',
    category: 'Dark HD',
    description: 'Negro puro #000000 para pantallas OLED con bordes elegantes en gris titanio.',
    previewColors: {
      bg: '#000000',
      card: '#0a0a0a',
      primary: '#38bdf8',
      accent: '#ffffff',
      border: '#262626',
    },
    appBg: 'bg-[#000000]',
    statusBarBg: 'bg-[#000000]',
    headerBg: 'bg-[#050505]',
    cardBg: 'bg-[#0a0a0a]',
    cardBorder: 'border-neutral-800',
    cardInnerBg: 'bg-[#000000]',
    accentText: 'text-sky-400',
    accentBg: 'bg-sky-500',
    accentBorder: 'border-sky-500',
    badgeBg: 'bg-neutral-900',
    badgeText: 'text-sky-300',
    badgeBorder: 'border-neutral-700',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    fabBg: 'bg-sky-600',
    bottomNavBg: 'bg-[#040404]',
  },
  {
    id: 'emerald_matrix',
    name: 'Matrix Hacker Green',
    category: 'Cyberpunk',
    description: 'Estilo terminal hacker con verde fósforo brillante y fondo verde oscuro.',
    previewColors: {
      bg: '#031006',
      card: '#081d0d',
      primary: '#22c55e',
      accent: '#86efac',
      border: '#14461f',
    },
    appBg: 'bg-[#031006]',
    statusBarBg: 'bg-[#020b04]',
    headerBg: 'bg-[#05160a]',
    cardBg: 'bg-[#081d0d]',
    cardBorder: 'border-green-900/60',
    cardInnerBg: 'bg-[#031107]',
    accentText: 'text-green-400',
    accentBg: 'bg-green-500',
    accentBorder: 'border-green-500',
    badgeBg: 'bg-green-950/80',
    badgeText: 'text-green-300',
    badgeBorder: 'border-green-800/60',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    fabBg: 'bg-green-600',
    bottomNavBg: 'bg-[#06170a]',
  },
  {
    id: 'crimson_blood',
    name: 'Crimson Dragon (Ruby Red)',
    category: 'Vibrant',
    description: 'Rojo carmesí profundo y rubí con acentos de fuego para alto impacto visual.',
    previewColors: {
      bg: '#140608',
      card: '#220b0e',
      primary: '#f43f5e',
      accent: '#fb7185',
      border: '#451319',
    },
    appBg: 'bg-[#140608]',
    statusBarBg: 'bg-[#0d0305]',
    headerBg: 'bg-[#1c080b]',
    cardBg: 'bg-[#220b0e]',
    cardBorder: 'border-rose-900/60',
    cardInnerBg: 'bg-[#130507]',
    accentText: 'text-rose-400',
    accentBg: 'bg-rose-600',
    accentBorder: 'border-rose-500',
    badgeBg: 'bg-rose-950/80',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-800/60',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    fabBg: 'bg-rose-600',
    bottomNavBg: 'bg-[#1a0709]',
  },
  {
    id: 'ocean_depths',
    name: 'Deep Blue Ocean (Sapphire)',
    category: 'Dark HD',
    description: 'Azul zafiro abisal, índigo profundo y cobalto brillante de alta definición.',
    previewColors: {
      bg: '#050d1a',
      card: '#0c1a30',
      primary: '#3b82f6',
      accent: '#60a5fa',
      border: '#17315a',
    },
    appBg: 'bg-[#050d1a]',
    statusBarBg: 'bg-[#030913]',
    headerBg: 'bg-[#091529]',
    cardBg: 'bg-[#0c1a30]',
    cardBorder: 'border-blue-900/60',
    cardInnerBg: 'bg-[#061021]',
    accentText: 'text-blue-400',
    accentBg: 'bg-blue-600',
    accentBorder: 'border-blue-500',
    badgeBg: 'bg-blue-950/80',
    badgeText: 'text-blue-300',
    badgeBorder: 'border-blue-800/60',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    fabBg: 'bg-blue-600',
    bottomNavBg: 'bg-[#08152a]',
  },
];
