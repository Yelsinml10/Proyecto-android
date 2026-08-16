import React, { useState } from 'react';
import {
  X,
  Palette,
  Check,
  Sparkles,
  Sun,
  Moon,
  Flame,
  Droplets,
  Zap,
  Terminal,
  Shield,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { AppTheme, AppThemeId, APP_THEMES } from '../utils/themeConfig';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: AppThemeId;
  onSelectTheme: (themeId: AppThemeId) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
}) => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Cyberpunk' | 'Dark HD' | 'Vibrant' | 'Nature'>('All');
  const [previewTheme, setPreviewTheme] = useState<AppThemeId>(currentThemeId);

  if (!isOpen) return null;

  const categories = ['All', 'Cyberpunk', 'Dark HD', 'Vibrant', 'Nature'] as const;

  const filteredThemes = activeCategory === 'All'
    ? APP_THEMES
    : APP_THEMES.filter((t) => t.category === activeCategory);

  const activeThemeObj = APP_THEMES.find((t) => t.id === currentThemeId) || APP_THEMES[0];

  const getThemeIcon = (id: AppThemeId) => {
    switch (id) {
      case 'cyber_neon':
        return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'electric_violet':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'aurora_borealis':
        return <Droplets className="w-4 h-4 text-emerald-400" />;
      case 'sunset_honduras':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'amoled_black':
        return <Moon className="w-4 h-4 text-sky-400" />;
      case 'emerald_matrix':
        return <Terminal className="w-4 h-4 text-green-400" />;
      case 'crimson_blood':
        return <Shield className="w-4 h-4 text-rose-400" />;
      case 'ocean_depths':
        return <Droplets className="w-4 h-4 text-blue-400" />;
      default:
        return <Palette className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-[#0f141c] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-gradient-to-r from-[#141b26] to-[#0f141c]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400 shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <span>Temas y Personalización HD</span>
                <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60 font-mono font-bold">
                  8 TEMAS
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Selecciona una paleta de colores visualmente adaptada en alta definición
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-1.5 px-4 py-2.5 border-b border-slate-800/60 bg-[#0c1017] overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                  : 'bg-[#121824] text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredThemes.map((theme) => {
              const isSelected = currentThemeId === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme.id);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'border-cyan-500 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-500/50'
                      : 'border-slate-800/90 bg-[#121824] hover:border-slate-700 hover:bg-[#151c2a]'
                  }`}
                  style={{
                    backgroundColor: theme.previewColors.card,
                  }}
                >
                  {/* Subtle Background Glow */}
                  <div
                    className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40 pointer-events-none"
                    style={{ backgroundColor: theme.previewColors.primary }}
                  />

                  <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="p-1.5 rounded-xl border flex items-center justify-center"
                          style={{
                            borderColor: theme.previewColors.border,
                            backgroundColor: theme.previewColors.bg,
                          }}
                        >
                          {getThemeIcon(theme.id)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{theme.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {theme.category}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      {theme.description}
                    </p>

                    {/* Color Swatch Preview */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[10px] font-mono text-slate-400">Paleta de color:</span>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                          style={{ backgroundColor: theme.previewColors.bg }}
                          title="Fondo Principal"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                          style={{ backgroundColor: theme.previewColors.card }}
                          title="Tarjeta"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                          style={{ backgroundColor: theme.previewColors.primary }}
                          title="Color Primario"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                          style={{ backgroundColor: theme.previewColors.accent }}
                          title="Color Acento"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0c1017] flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Tema activo:</span>
            <span className="font-bold text-cyan-400 font-mono">
              {activeThemeObj.name}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            Aplicar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
