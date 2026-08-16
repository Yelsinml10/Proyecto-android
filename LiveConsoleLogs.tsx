import React, { useRef, useEffect } from 'react';
import { Copy, Check, Trash2 } from 'lucide-react';
import { LogMessage } from '../types';
import { parseAnsiToReact } from '../utils/ansiParser';

interface LiveConsoleLogsProps {
  logs: LogMessage[];
  onClearLogs: () => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  onOpenAnsiModal?: () => void;
}

export const LiveConsoleLogs: React.FC<LiveConsoleLogsProps> = ({
  logs,
  onClearLogs,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] ${l.message.replace(/\x1b\[[0-9;]*m/g, '')}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#090d14] rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden font-mono flex flex-col min-h-[500px]">
      {/* Console Top Actions */}
      <div className="px-4 py-2 bg-[#0e131d] border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-bold text-[11px] uppercase tracking-wider">
            Registro de Conexión en Vivo
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            ({logs.length} líneas)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
            title="Copiar registro"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="text-[10px]">{copied ? 'Copiado' : 'Copiar'}</span>
          </button>

          <button
            type="button"
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 text-xs flex items-center gap-1 transition-colors"
            title="Limpiar registro"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[10px]">Limpiar</span>
          </button>
        </div>
      </div>

      {/* Terminal Log Lines (Matching Video 00:10-00:11) */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 space-y-1 overflow-y-auto text-xs leading-relaxed select-text"
      >
        {logs.length === 0 ? (
          <div className="text-center py-16 text-slate-600 space-y-2">
            <p>Registro vacío. Presiona el botón de conexión para iniciar el túnel.</p>
          </div>
        ) : (
          logs.map((log) => {
            const isSuccess =
              log.level === 'success' ||
              log.message.includes('conectado correctamente') ||
              log.message.includes('Listo para navegar') ||
              log.message.includes('detenido correctamente');
            const isError = log.level === 'error';
            const isHttp =
              log.message.includes('HTTP/1.1') ||
              log.message.includes('HTTP/2.0') ||
              log.message.includes('Reemplazar respuesta') ||
              log.message.includes('Switching Protocols');
            const isDnsOrEngine =
              log.message.includes('DNS por el túnel') ||
              log.message.includes('Motor SOCKS') ||
              log.message.includes('core SSH');

            let textColorClass = 'text-slate-300';
            if (isSuccess) textColorClass = 'text-emerald-400 font-medium';
            else if (isError) textColorClass = 'text-rose-400 font-bold';
            else if (isHttp) textColorClass = 'text-cyan-300';
            else if (isDnsOrEngine) textColorClass = 'text-sky-300';

            return (
              <div
                key={log.id}
                className="flex items-start gap-2 font-mono text-[12px] hover:bg-slate-900/40 px-1 py-0.5 rounded transition-colors"
              >
                <span className="text-cyan-500/80 shrink-0 select-none">
                  [{log.timestamp}]
                </span>
                <div className={`flex-1 break-all ${textColorClass}`}>
                  {parseAnsiToReact(log.message)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
