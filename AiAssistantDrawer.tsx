import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, RefreshCw, Check, Lightbulb } from 'lucide-react';
import { VpnConfig, LogMessage } from '../types';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: VpnConfig;
  logs: LogMessage[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  currentConfig,
  logs,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: '¡Hola! Soy el Asistente Técnico Especialista de **NET VPN PROXY**. Puedo ayudarte a solucionar errores de inyección HTTP, recomendar dominios Bug Host / SNI para tu compañía celular, o configurar parámetros de SlowDNS, Hysteria v2 y V2Ray. ¿Qué necesitas consultar?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputText;
    if (!promptToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          currentConfig,
          logs,
        }),
      });

      const data = await res.json();
      const aiReplyText = data.analysis || data.error || 'No se pudo obtener respuesta del servidor AI.';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Error de comunicación con el Asistente Gemini: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-white shadow-lg">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Asistente IA NET VPN</h3>
              <p className="text-[11px] text-purple-300">Soporte Inteligente para Túneles & SNI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <button
            onClick={() => handleSendMessage('¿Cómo configuro un Bug Host SNI para SSH SSL?')}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
          >
            Configurar Bug Host SSL
          </button>
          <button
            onClick={() => handleSendMessage('¿Cómo optimizo el MTU para SlowDNS sin saldo?')}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
          >
            Optimizar SlowDNS MTU
          </button>
          <button
            onClick={() => handleSendMessage('Explicar cómo funciona Hysteria v2 y Salamander')}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
          >
            Hysteria v2 Salamander
          </button>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`p-1.5 rounded-xl text-white shrink-0 ${
                m.sender === 'user' ? 'bg-cyan-600' : 'bg-purple-600'
              }`}>
                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-cyan-950 text-cyan-100 border border-cyan-800/60 rounded-tr-none'
                  : 'bg-slate-950 text-slate-200 border border-slate-800/80 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className="text-[9px] text-slate-500 mt-1 text-right">{m.timestamp}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-purple-400 italic p-2 bg-slate-950/50 rounded-xl">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Gemini IA analizando logs y parámetros de red...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-slate-800 bg-slate-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Pregunta sobre payloads, bug hosts o errores..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
