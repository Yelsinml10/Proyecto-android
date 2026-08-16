import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  FileCode2,
  Sliders,
  Terminal,
  Zap,
  Globe,
  Layers,
  Code2,
} from 'lucide-react';
import { VpnProtocol } from '../types';

interface PayloadGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPayload: (payload: string, bugHost: string, protocol?: VpnProtocol) => void;
}

export const PayloadGeneratorModal: React.FC<PayloadGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyPayload,
}) => {
  const [bugHostInput, setBugHostInput] = useState<string>('m.domain.com');
  const [requestMethod, setRequestMethod] = useState<string>('GET');
  const [injectionType, setInjectionType] = useState<'normal' | 'front_inject' | 'back_inject'>('normal');
  const [splitMode, setSplitMode] = useState<'none' | 'split' | 'instant_split' | 'delay_split'>('none');
  
  // Custom HTTP Headers toggles
  const [onlineHost, setOnlineHost] = useState<boolean>(true);
  const [forwardHost, setForwardHost] = useState<boolean>(false);
  const [reverseProxy, setReverseProxy] = useState<boolean>(false);
  const [keepAlive, setKeepAlive] = useState<boolean>(true);
  const [wsUpgrade, setWsUpgrade] = useState<boolean>(true);
  const [userAgent, setUserAgent] = useState<boolean>(true);
  const [dualConnect, setDualConnect] = useState<boolean>(false);
  const [customPath, setCustomPath] = useState<string>('/');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Real HTTP Custom dynamic payload generator logic
  const generateDynamicPayload = () => {
    const host = bugHostInput.trim() || 'm.domain.com';
    let p = '';

    if (requestMethod === 'CONNECT') {
      p = `CONNECT [host_port] HTTP/1.1[crlf]Host: ${host}[crlf]`;
      if (onlineHost) p += `X-Online-Host: ${host}[crlf]`;
      if (forwardHost) p += `X-Forward-Host: ${host}[crlf]X-Forwarded-For: ${host}[crlf]`;
      if (reverseProxy) p += `Reverse-Host: ${host}[crlf]`;
      if (keepAlive) p += `Connection: Keep-Alive[crlf]Proxy-Connection: Keep-Alive[crlf]`;
      if (userAgent) p += `User-Agent: [ua][crlf]`;
      p += `[crlf]`;
    } else {
      let reqLine = '';
      if (injectionType === 'front_inject') {
        reqLine = `${requestMethod} http://${host}${customPath} HTTP/1.1[crlf]`;
      } else if (injectionType === 'back_inject') {
        reqLine = `${requestMethod} ${customPath} HTTP/1.1[crlf]`;
      } else {
        reqLine = `${requestMethod} ${customPath} HTTP/1.1[crlf]`;
      }

      p = `${reqLine}Host: ${host}[crlf]`;
      if (onlineHost) p += `X-Online-Host: ${host}[crlf]`;
      if (forwardHost) p += `X-Forward-Host: ${host}[crlf]X-Forwarded-For: ${host}[crlf]`;
      if (reverseProxy) p += `Reverse-Host: ${host}[crlf]`;
      if (wsUpgrade) p += `Upgrade: websocket[crlf]Connection: Upgrade[crlf]`;
      else if (keepAlive) p += `Connection: Keep-Alive[crlf]`;
      if (userAgent) p += `User-Agent: [ua][crlf]`;
      p += `[crlf]`;
    }

    if (dualConnect) {
      p = `CONNECT [host_port] HTTP/1.1[crlf]Host: ${host}[crlf][crlf]${p}`;
    }

    if (splitMode === 'split') {
      p = `[split]${p}`;
    } else if (splitMode === 'instant_split') {
      p = `[instant_split]${p}`;
    } else if (splitMode === 'delay_split') {
      p = `[delay_split]${p}`;
    }

    return p;
  };

  const generatedPayloadText = generateDynamicPayload();

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPayloadText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    const recommended: VpnProtocol = requestMethod === 'CONNECT' ? 'ssh_ssl' : 'ssh_ws';
    onApplyPayload(generatedPayloadText, bugHostInput, recommended);
    onClose();
  };

  // Quick Macro Inserter
  const appendTag = (tag: string) => {
    setBugHostInput((prev) => prev + tag);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">
                Generador de Payloads HTTP Custom
              </h2>
              <p className="text-xs text-slate-400">
                Creador avanzado de inyecciones HTTP con macros y encabezados personalizados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Bug Host / SNI Target URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              Bug Host / Dominio SNI
            </label>
            <div className="relative">
              <input
                type="text"
                value={bugHostInput}
                onChange={(e) => setBugHostInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                placeholder="ej. cdn.auth.cloudflare.com o m.facebook.com"
              />
            </div>
          </div>

          {/* Request Method & Injection Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Método HTTP
              </label>
              <select
                value={requestMethod}
                onChange={(e) => setRequestMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="CONNECT">CONNECT</option>
                <option value="HEAD">HEAD</option>
                <option value="PUT">PUT</option>
                <option value="OPTIONS">OPTIONS</option>
                <option value="TRACE">TRACE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Inyección
              </label>
              <select
                value={injectionType}
                onChange={(e) => setInjectionType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="normal">Normal (Direct)</option>
                <option value="front_inject">Front Inject (URL Completa)</option>
                <option value="back_inject">Back Inject (Path)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Modo Split
              </label>
              <select
                value={splitMode}
                onChange={(e) => setSplitMode(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="none">Sin Split</option>
                <option value="split">[split]</option>
                <option value="instant_split">[instant_split]</option>
                <option value="delay_split">[delay_split]</option>
              </select>
            </div>
          </div>

          {/* HTTP Header Toggles */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Encabezados HTTP (Headers)
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={onlineHost}
                  onChange={(e) => setOnlineHost(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                <span className="truncate">Online Host</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={forwardHost}
                  onChange={(e) => setForwardHost(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                <span className="truncate">Forward Host</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={reverseProxy}
                  onChange={(e) => setReverseProxy(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                <span className="truncate">Reverse Proxy</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={wsUpgrade}
                  onChange={(e) => setWsUpgrade(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                <span className="truncate">WebSocket Upgrade</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={keepAlive}
                  onChange={(e) => setKeepAlive(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                <span className="truncate">Keep-Alive</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={userAgent}
                  onChange={(e) => setUserAgent(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                <span className="truncate">User-Agent</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 sm:col-span-3">
                <input
                  type="checkbox"
                  checked={dualConnect}
                  onChange={(e) => setDualConnect(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                <span className="truncate">Dual Connect (CONNECT + Payload Secundario)</span>
              </label>
            </div>
          </div>

          {/* Generated Payload Code Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>Payload Generado</span>
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={4}
              value={generatedPayloadText}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-400 select-all focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-800 bg-slate-950">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Aplicar en NET VPN PROXY</span>
          </button>
        </div>
      </div>
    </div>
  );
};
