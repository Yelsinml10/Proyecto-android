import { AppTheme } from '../utils/themeConfig';

function hexToRgb(hex: string): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `${r}, ${g}, ${b}`;
}

export const applyThemeCssVars = (theme: AppTheme) => {
  const root = document.documentElement;
  const primaryRgb = hexToRgb(theme.previewColors.primary);
  const accentRgb = hexToRgb(theme.previewColors.accent);
  const bgRgb = hexToRgb(theme.previewColors.bg);
  const cardRgb = hexToRgb(theme.previewColors.card);
  const borderRgb = hexToRgb(theme.previewColors.border);

  // Set Core CSS variables
  root.style.setProperty('--theme-bg', theme.previewColors.bg);
  root.style.setProperty('--theme-bg-rgb', bgRgb);
  root.style.setProperty('--theme-card', theme.previewColors.card);
  root.style.setProperty('--theme-card-rgb', cardRgb);
  root.style.setProperty('--theme-header', theme.previewColors.card);
  root.style.setProperty('--theme-inner', theme.cardInnerBg.replace('bg-[', '').replace(']', ''));
  root.style.setProperty('--theme-primary', theme.previewColors.primary);
  root.style.setProperty('--theme-primary-rgb', primaryRgb);
  root.style.setProperty('--theme-accent', theme.previewColors.accent);
  root.style.setProperty('--theme-accent-rgb', accentRgb);
  root.style.setProperty('--theme-border', theme.previewColors.border);
  root.style.setProperty('--theme-border-rgb', borderRgb);
  root.style.setProperty('--theme-glow', theme.glowColor);
  root.style.setProperty('--theme-fab', theme.previewColors.primary);

  // Set theme data attributes on body & root
  document.body.setAttribute('data-theme', theme.id);
  document.documentElement.setAttribute('data-theme', theme.id);
  document.body.style.backgroundColor = theme.previewColors.bg;
};
