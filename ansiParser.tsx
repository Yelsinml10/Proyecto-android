import React from 'react';

// Standard 16 ANSI Color Maps
export const ANSI_FG_COLORS: Record<number, string> = {
  30: '#1e293b', // Black / Slate
  31: '#f43f5e', // Red
  32: '#10b981', // Green
  33: '#f59e0b', // Yellow
  34: '#3b82f6', // Blue
  35: '#d946ef', // Magenta
  36: '#06b6d4', // Cyan
  37: '#e2e8f0', // White
  90: '#64748b', // Bright Black / Gray
  91: '#fb7185', // Bright Red
  92: '#34d399', // Bright Green
  93: '#fbbf24', // Bright Yellow
  94: '#60a5fa', // Bright Blue
  95: '#f0abfc', // Bright Magenta
  96: '#38bdf8', // Bright Cyan
  97: '#ffffff', // Bright White
};

export const ANSI_BG_COLORS: Record<number, string> = {
  40: '#020617', // Black
  41: '#881337', // Red
  42: '#064e3b', // Green
  43: '#78350f', // Yellow
  44: '#1e3a8a', // Blue
  45: '#701a75', // Magenta
  46: '#164e63', // Cyan
  47: '#334155', // White
  100: '#334155', // Bright Black
  101: '#9f1239', // Bright Red
  102: '#047857', // Bright Green
  103: '#b45309', // Bright Yellow
  104: '#1d4ed8', // Bright Blue
  105: '#a21caf', // Bright Magenta
  106: '#0e7490', // Bright Cyan
  107: '#475569', // Bright White
};

export const ANSI_COLOR_NAMES: Record<number, string> = {
  30: 'Negro',
  31: 'Rojo',
  32: 'Verde',
  33: 'Amarillo',
  34: 'Azul',
  35: 'Magenta',
  36: 'Cian',
  37: 'Blanco',
  90: 'Gris Oscuro',
  91: 'Rojo Brillante',
  92: 'Verde Brillante',
  93: 'Amarillo Brillante',
  94: 'Azul Brillante',
  95: 'Magenta Brillante',
  96: 'Cian Brillante',
  97: 'Blanco Puro',
};

// Generate 256 Xterm Palette Colors
export function get256ColorHex(code: number): string {
  if (code < 16) {
    const stdMap: Record<number, string> = {
      0: '#000000', 1: '#800000', 2: '#008000', 3: '#808000',
      4: '#000080', 5: '#800080', 6: '#008080', 7: '#c0c0c0',
      8: '#808080', 9: '#ff0000', 10: '#00ff00', 11: '#ffff00',
      12: '#0000ff', 13: '#ff00ff', 14: '#00ffff', 15: '#ffffff'
    };
    return stdMap[code] || '#ffffff';
  }

  // 16-231: 6x6x6 Color Cube
  if (code >= 16 && code <= 231) {
    const val = code - 16;
    const r = Math.floor(val / 36);
    const g = Math.floor((val % 36) / 6);
    const b = val % 6;
    const steps = [0, 95, 135, 175, 215, 255];
    const hexR = steps[r].toString(16).padStart(2, '0');
    const hexG = steps[g].toString(16).padStart(2, '0');
    const hexB = steps[b].toString(16).padStart(2, '0');
    return `#${hexR}${hexG}${hexB}`;
  }

  // 232-255: Grayscale Ramp
  if (code >= 232 && code <= 255) {
    const gray = 8 + (code - 232) * 10;
    const hex = gray.toString(16).padStart(2, '0');
    return `#${hex}${hex}${hex}`;
  }

  return '#ffffff';
}

interface StyleState {
  fg?: string;
  bg?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  dim?: boolean;
  blink?: boolean;
}

/**
 * Parses a string containing ANSI escape sequences (e.g. \x1b[31m, \033[1;32m, \e[36m, [31m)
 * and returns styled React node chunks.
 */
export function parseAnsiToReact(input: string): React.ReactNode {
  if (!input) return null;

  // Normalize escape notations: \033, \e, \u001b to \x1b
  const normalized = input
    .replace(/\\033/g, '\x1b')
    .replace(/\\e/g, '\x1b')
    .replace(/\\u001b/g, '\x1b');

  // Regex to match ANSI escape codes like \x1b[1;31m or \x1b[0m
  const ansiRegex = /\x1b\[([0-9;]*)m/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let currentStyle: StyleState = {};

  let match: RegExpExecArray | null;

  while ((match = ansiRegex.exec(normalized)) !== null) {
    const textBefore = normalized.substring(lastIndex, match.index);
    if (textBefore) {
      elements.push(
        <span key={elements.length} style={buildStyleObj(currentStyle)}>
          {textBefore}
        </span>
      );
    }

    lastIndex = ansiRegex.lastIndex;

    // Process ANSI code sequence e.g. "1;31" or "0"
    const codesStr = match[1];
    if (!codesStr || codesStr === '0' || codesStr === '') {
      currentStyle = {};
    } else {
      const codes = codesStr.split(';').map(Number);
      let i = 0;
      while (i < codes.length) {
        const c = codes[i];
        if (c === 0) {
          currentStyle = {};
        } else if (c === 1) {
          currentStyle.bold = true;
        } else if (c === 2) {
          currentStyle.dim = true;
        } else if (c === 3) {
          currentStyle.italic = true;
        } else if (c === 4) {
          currentStyle.underline = true;
        } else if (c === 5) {
          currentStyle.blink = true;
        } else if ((c >= 30 && c <= 37) || (c >= 90 && c <= 97)) {
          currentStyle.fg = ANSI_FG_COLORS[c];
        } else if ((c >= 40 && c <= 47) || (c >= 100 && c <= 107)) {
          currentStyle.bg = ANSI_BG_COLORS[c];
        } else if (c === 38) {
          // 256 or RGB FG: 38;5;N or 38;2;R;G;B
          if (codes[i + 1] === 5 && codes[i + 2] !== undefined) {
            currentStyle.fg = get256ColorHex(codes[i + 2]);
            i += 2;
          } else if (codes[i + 1] === 2 && codes[i + 2] !== undefined && codes[i + 3] !== undefined && codes[i + 4] !== undefined) {
            currentStyle.fg = `rgb(${codes[i + 2]}, ${codes[i + 3]}, ${codes[i + 4]})`;
            i += 4;
          }
        } else if (c === 48) {
          // 256 or RGB BG: 48;5;N or 48;2;R;G;B
          if (codes[i + 1] === 5 && codes[i + 2] !== undefined) {
            currentStyle.bg = get256ColorHex(codes[i + 2]);
            i += 2;
          } else if (codes[i + 1] === 2 && codes[i + 2] !== undefined && codes[i + 3] !== undefined && codes[i + 4] !== undefined) {
            currentStyle.bg = `rgb(${codes[i + 2]}, ${codes[i + 3]}, ${codes[i + 4]})`;
            i += 4;
          }
        } else if (c === 39) {
          delete currentStyle.fg;
        } else if (c === 49) {
          delete currentStyle.bg;
        }
        i++;
      }
    }
  }

  const remainingText = normalized.substring(lastIndex);
  if (remainingText) {
    elements.push(
      <span key={elements.length} style={buildStyleObj(currentStyle)}>
        {remainingText}
      </span>
    );
  }

  return <>{elements}</>;
}

function buildStyleObj(styleState: StyleState): React.CSSProperties {
  const css: React.CSSProperties = {};
  if (styleState.fg) css.color = styleState.fg;
  if (styleState.bg) css.backgroundColor = styleState.bg;
  if (styleState.bold) css.fontWeight = 'bold';
  if (styleState.italic) css.fontStyle = 'italic';
  if (styleState.underline) css.textDecoration = 'underline';
  if (styleState.dim) css.opacity = 0.7;
  return css;
}
