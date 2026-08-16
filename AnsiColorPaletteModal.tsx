import React, { useState } from 'react';
import {
  X,
  Palette,
  Copy,
  Check,
  Terminal,
  Sparkles,
  Sliders,
  Code,
  Flame,
  Wand2,
  Eye,
  Info,
  Send,
  RefreshCw,
} from 'lucide-react';
import {
  ANSI_FG_COLORS,
  ANSI_BG_COLORS,
  ANSI_COLOR_NAMES,
  get256ColorHex,
  parseAnsiToReact,
} from '../utils/ansiParser';

interface AnsiColorPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectTestLog?: (ansiMessage: string) => void;
}

type OutputFormat = 'x1b' | '033' | 'slash_e' | 'u001b' | 'injector' | 'hex';

export const AnsiColorPaletteModal: React.FC<AnsiColorPaletteModalProps> = ({
  isOpen,
  onClose,
  onInjectTestLog,
}) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'xterm256' | 'rgb' | 'banner'>('standard');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('x1b');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // RGB State
  const [customHex, setCustomHex] = useState<string>('#06b6d4');
  const [customRgb, setCustomRgb] = useState<{ r: number; g: number; b: number }>({ r: 6, g: 182, b: 212 });
  const [isBold, setIsBold] = useState<boolean>(true);
  const [isBg, setIsBg] = useState<boolean>(false);

  // Banner State
  const [bannerInputText, setBannerInputText] = useState<string>(
    `\\x1b[1;36m=========================================\\x1b[0m\n` +
    `\\x1b[1;32m   🚀 NET VPN PROXY - TÚNEL VIP CONECTADO\\x1b[0m\n` +
    `\\x1b[1;33m   Servidor: \\x1b[1;37mDE-Frankfurt-01 \\x1b[1;35m(AES-256)\\x1b[0m\n` +
    `\\x1b[1;36m=========================================\\x1b[0m`
  );

  if (!isOpen) return null;

  // Format Helper
  const formatCode = (codeNum: number, isForeground: boolean = true) => {
    let rawStr = `${codeNum}m`;
    switch (outputFormat) {
      case '033':
        return `\\033[${rawStr}`;
      case 'slash_e':
        return `\\e[${rawStr}`;
      case 'u001b':
        return `\\u001b[${rawStr}`;
      case 'injector':
        return `[${rawStr}`;
      case 'hex':
        return isForeground ? ANSI_FG_COLORS[codeNum] || '#ffffff' : ANSI_BG_COLORS[codeNum] || '#000000';
      case 'x1b':
      default:
        return `\\x1b[${rawStr}`;
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setCustomHex(hex);

    // Convert hex to rgb
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      const r = parseInt(hex.substring(1, 3), 16);
      const g = parseInt(hex.substring(3, 5), 16);
      const b = parseInt(hex.substring(5, 7), 16);
      setCustomRgb({ r, g, b });
    }
  };

  const generateRgbCode = () => {
    const { r, g, b } = customRgb;
    const mode = isBg ? '48;2' : '38;2';
    const prefix = outputFormat === '033' ? '\\033' : outputFormat === 'slash_e' ? '\\e' : outputFormat === 'u001b' ? '\\u001b' : outputFormat === 'injector' ? '[' : '\\x1b';
    const closeBracket = outputFormat === 'injector' ? '' : '[';
    return `${prefix}${closeBracket}${mode};${r};${g};${b}m`;
  };

  // Preset Banners
  const applyPresetBanner = (type: 'netvpn' | 'matrix' | 'neon' | 'cyberpunk') => {
    switch (type) {
      case 'netvpn':
        setBannerInputText(
          `\\x1b[1;36m=========================================\\x1b[0m\n` +
          `\\x1b[1;32m   🚀 NET VPN PROXY v2.5.0 ONLINE\\x1b[0m\n` +
          `\\x1b[1;33m   Estado: \\x1b[1;37mCONECTADO \\x1b[1;94m(Latency: 24ms)\\x1b[0m\n` +
          `\\x1b[1;36m=========================================\\x1b[0m`
        );
        break;
      case 'matrix':
        setBannerInputText(
          `\\x1b[1;32m01001110 01000101 01010100 01010110 01010000 01001110\\x1b[0m\n` +
          `\\x1b[1;92m[SYSTEM] Access Granted. Encrypted Tunnel Active.\\x1b[0m\n` +
          `\\x1b[32mProxy: 104.21.80.1:443 | Cipher: ChaCha20-Poly1305\\x1b[0m`
        );
        break;
      case 'neon':
        setBannerInputText(
          `\\x1b[1;35m⚡ CYBER TUNNEL - HIGH SPEED PROTOCOL ⚡\\x1b[0m\n` +
          `\\x1b[1;33m[+] Payload Injection:\\x1b[0m \\x1b[1;36mGET / HTTP/1.1 [crlf]\\x1b[0m\n` +
          `\\x1b[1;31m[+] SNI Status:\\x1b[0m \\x1b[1;92m200 OK (Connection Up)\\x1b[0m`
        );
        break;
      case 'cyberpunk':
        setBannerInputText(
          `\\x1b[1;91m╔════════════════════════════════════════╗\\x1b[0m\n` +
          `\\x1b[1;93m║  🔴 HIGH SPEED VPN ANSI TERMINAL VIP   ║\\x1b[0m\n` +
          `\\x1b[1;96m║  Protocols: SSH WS | V2Ray | Hysteria2 ║\\x1b[0m\n` +
          `\\x1b[1;91m╚════════════════════════════════════════╝\\x1b[0m`
        );
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 border border-amber-500/30 text-amber-400 shadow-md">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  Paleta de Colores ANSI & Generador de Banners
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                  ANSI 16 / 256 / RGB
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Códigos de color de escape para Terminal SSH, Banners de Bienvenida y Payloads de NET VPN PROXY
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Output Syntax Format Bar */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Code className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-200">Formato de Sintaxis:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'x1b', label: '\\x1b[31m (Standard C/Bash)' },
              { id: '033', label: '\\033[31m (Octal/Linux)' },
              { id: 'slash_e', label: '\\e[31m (Echo Shell)' },
              { id: 'u001b', label: '\\u001b[31m (JS/Node)' },
              { id: 'injector', label: '[31m (HTTP Injector)' },
              { id: 'hex', label: 'HEX / RGB' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setOutputFormat(fmt.id as OutputFormat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                  outputFormat === fmt.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-slate-800'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2 gap-2 overflow-x-auto">
          {[
            { id: 'standard', label: '16 Colores Estándar', icon: Sliders },
            { id: 'xterm256', label: 'xterm 256 Colores', icon: Grid2x2Icon },
            { id: 'rgb', label: 'TrueColor RGB 24-bit', icon: Flame },
            { id: 'banner', label: 'Banners SSH & Tester', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                  isActive
                    ? 'bg-slate-900 text-cyan-400 border-cyan-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Main Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6 bg-slate-900/80">
          
          {/* TAB 1: 16 Standard Colors */}
          {activeTab === 'standard' && (
            <div className="space-y-6">
              {/* Text / Foreground Colors (FG) */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Colores de Texto (Foreground FG)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Haz clic para copiar el código</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[30, 31, 32, 33, 34, 35, 36, 37, 90, 91, 92, 93, 94, 95, 96, 97].map((code) => {
                    const colorHex = ANSI_FG_COLORS[code];
                    const name = ANSI_COLOR_NAMES[code];
                    const formatted = formatCode(code, true);

                    return (
                      <button
                        key={code}
                        onClick={() => handleCopyText(formatted)}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-850 transition-all text-left flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-5 h-5 rounded-md border border-slate-700 shadow-inner shrink-0"
                            style={{ backgroundColor: colorHex }}
                          />
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                              {name}
                            </div>
                            <div className="text-[11px] font-mono text-cyan-400 font-semibold mt-0.5">
                              {formatted}
                            </div>
                          </div>
                        </div>

                        <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Background Colors (BG) */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Colores de Fondo (Background BG - 40 al 47 & 100 al 107)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[40, 41, 42, 43, 44, 45, 46, 47, 100, 101, 102, 103, 104, 105, 106, 107].map((code) => {
                    const colorHex = ANSI_BG_COLORS[code];
                    const formatted = formatCode(code, false);

                    return (
                      <button
                        key={code}
                        onClick={() => handleCopyText(formatted)}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-850 transition-all text-left flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-5 h-5 rounded-md border border-slate-600 shadow-inner shrink-0"
                            style={{ backgroundColor: colorHex }}
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-200">
                              Fondo {code}
                            </div>
                            <div className="text-[11px] font-mono text-amber-400 font-semibold mt-0.5">
                              {formatted}
                            </div>
                          </div>
                        </div>

                        <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Styles & Resets */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Modificadores de Estilo & Reset
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { name: 'Reset / Normal', code: '0', preview: 'Normal', style: '' },
                    { name: 'Negrita (Bold)', code: '1', preview: 'Negrita', style: 'font-bold' },
                    { name: 'Atenuado (Dim)', code: '2', preview: 'Atenuado', style: 'opacity-60' },
                    { name: 'Cursiva (Italic)', code: '3', preview: 'Cursiva', style: 'italic' },
                    { name: 'Subrayado', code: '4', preview: 'Subrayado', style: 'underline' },
                  ].map((st) => {
                    const fmt = formatCode(Number(st.code), true);
                    return (
                      <button
                        key={st.code}
                        onClick={() => handleCopyText(fmt)}
                        className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 transition-all text-left"
                      >
                        <div className={`text-xs text-white ${st.style}`}>{st.preview}</div>
                        <div className="text-[10px] font-mono text-cyan-400 font-bold mt-1">
                          {fmt}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: xterm 256 Palette Grid */}
          {activeTab === 'xterm256' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Matriz de 256 Colores xterm (0 - 255)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Soporte para terminales xterm-256color e inyecciones de logs personalizadas
                  </p>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Sintaxis: <span className="text-cyan-400 font-bold">\x1b[38;5;COLORm</span>
                </div>
              </div>

              {/* Grid of 256 tiles */}
              <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 max-h-80 overflow-y-auto">
                {Array.from({ length: 256 }).map((_, idx) => {
                  const hex = get256ColorHex(idx);
                  const codeStr = `\\x1b[38;5;${idx}m`;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleCopyText(codeStr)}
                      className="group relative flex flex-col items-center justify-center p-2 rounded-lg border border-slate-800/80 hover:border-cyan-400 hover:scale-105 transition-all shadow-sm"
                      style={{ backgroundColor: hex }}
                      title={`Color #${idx} (${hex}) - Clic para copiar ${codeStr}`}
                    >
                      <span className="text-[9px] font-mono font-bold text-slate-900 bg-white/90 px-1 rounded shadow-sm opacity-90 group-hover:opacity-100">
                        {idx}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Haz clic en cualquier celda para copiar la secuencia <code className="text-cyan-300 font-mono">\x1b[38;5;IDm</code></span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TrueColor RGB 24-bit */}
          {activeTab === 'rgb' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Selector de Color TrueColor RGB (24-bit)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Visual Color Picker */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300 block">
                      Color Visual (HEX)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={customHex}
                        onChange={handleHexChange}
                        className="w-12 h-10 rounded-xl border border-slate-700 bg-slate-900 cursor-pointer p-1"
                      />
                      <input
                        type="text"
                        value={customHex}
                        onChange={handleHexChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 uppercase focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* RGB Controls */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-medium text-slate-300 block">
                      Canales RGB (R: {customRgb.r}, G: {customRgb.g}, B: {customRgb.b})
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-rose-400 font-bold block">ROJO (R)</span>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={customRgb.r}
                          onChange={(e) => {
                            const r = Number(e.target.value);
                            setCustomRgb((prev) => ({ ...prev, r }));
                            setCustomHex(`#${r.toString(16).padStart(2, '0')}${customRgb.g.toString(16).padStart(2, '0')}${customRgb.b.toString(16).padStart(2, '0')}`);
                          }}
                          className="w-full accent-rose-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold block">VERDE (G)</span>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={customRgb.g}
                          onChange={(e) => {
                            const g = Number(e.target.value);
                            setCustomRgb((prev) => ({ ...prev, g }));
                            setCustomHex(`#${customRgb.r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${customRgb.b.toString(16).padStart(2, '0')}`);
                          }}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-blue-400 font-bold block">AZUL (B)</span>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={customRgb.b}
                          onChange={(e) => {
                            const b = Number(e.target.value);
                            setCustomRgb((prev) => ({ ...prev, b }));
                            setCustomHex(`#${customRgb.r.toString(16).padStart(2, '0')}${customRgb.g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
                          }}
                          className="w-full accent-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target Type Toggle */}
                <div className="flex items-center gap-4 pt-2 border-t border-slate-800 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="rgbTarget"
                      checked={!isBg}
                      onChange={() => setIsBg(false)}
                      className="text-cyan-500 focus:ring-0"
                    />
                    <span>Color de Texto (FG: 38;2)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="rgbTarget"
                      checked={isBg}
                      onChange={() => setIsBg(true)}
                      className="text-amber-500 focus:ring-0"
                    />
                    <span>Color de Fondo (BG: 48;2)</span>
                  </label>
                </div>
              </div>

              {/* Generated RGB Output */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase">
                    Código Generado
                  </span>
                  <button
                    onClick={() => handleCopyText(generateRgbCode())}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Código</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border border-slate-700 shrink-0 shadow-lg"
                    style={{ backgroundColor: customHex }}
                  />
                  <input
                    type="text"
                    readOnly
                    value={generateRgbCode()}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 select-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Banner Designer & Live Tester */}
          {activeTab === 'banner' && (
            <div className="space-y-5">
              {/* Presets Bar */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Presets de Banners SSH & Payloads ANSI
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => applyPresetBanner('netvpn')}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-left text-xs font-bold text-cyan-400 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>NET VPN PROXY</span>
                  </button>

                  <button
                    onClick={() => applyPresetBanner('matrix')}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left text-xs font-bold text-emerald-400 transition-all flex items-center gap-2"
                  >
                    <Terminal className="w-3.5 h-3.5 shrink-0" />
                    <span>Matrix Encrypted</span>
                  </button>

                  <button
                    onClick={() => applyPresetBanner('neon')}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-left text-xs font-bold text-purple-400 transition-all flex items-center gap-2"
                  >
                    <Flame className="w-3.5 h-3.5 shrink-0" />
                    <span>Cyber Tunnel</span>
                  </button>

                  <button
                    onClick={() => applyPresetBanner('cyberpunk')}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left text-xs font-bold text-amber-400 transition-all flex items-center gap-2"
                  >
                    <Code className="w-3.5 h-3.5 shrink-0" />
                    <span>Frame VIP</span>
                  </button>
                </div>
              </div>

              {/* Code Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Editor de Texto con Escapes ANSI
                  </label>
                  <button
                    onClick={() => handleCopyText(bannerInputText)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Banner</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={bannerInputText}
                  onChange={(e) => setBannerInputText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                />
              </div>

              {/* Rendered Live Terminal Output Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Vista Previa Renderizada en Terminal</span>
                </label>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-200 leading-relaxed min-h-[100px] whitespace-pre shadow-inner">
                  {parseAnsiToReact(bannerInputText)}
                </div>
              </div>

              {/* Inject to Console Button */}
              {onInjectTestLog && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      onInjectTestLog(bannerInputText);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Inyectar en Logs de Terminal de NET VPN PROXY</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Toast Notification */}
        {copiedCode && (
          <div className="absolute bottom-16 right-6 bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-2xl flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4" />
            <span>Código ANSI copiado: <code className="font-mono">{copiedCode}</code></span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>ANSI Escape Engine - NET VPN PROXY v2.5</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Icon
function Grid2x2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}
