import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  QrCode,
  Copy,
  Check,
  FileCode2,
  Lock,
  Calendar,
  Smartphone,
  ShieldAlert,
  FileUp,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import QRCode from 'qrcode';
import { VpnConfig, AbiConfigFile, AbiSecurityOptions } from '../types';

interface ConfigImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: VpnConfig;
  onImportConfig: (config: VpnConfig) => void;
  initialTab?: 'EXPORT' | 'IMPORT' | 'QR';
}

export const ConfigImportExportModal: React.FC<ConfigImportExportModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onImportConfig,
  initialTab = 'EXPORT',
}) => {
  const [activeTab, setActiveTab] = useState<'EXPORT' | 'IMPORT' | 'QR'>(initialTab);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<VpnConfig | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security / Lock Options for .abi Export
  const [securityOpts, setSecurityOpts] = useState<AbiSecurityOptions>({
    isLocked: false,
    lockNote: 'Configuración oficial .abi para Honduras',
    expiryDate: '',
    lockHwid: '',
    blockRoot: false,
    passwordProtected: false,
    password: '',
  });
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
      setImportError('');
      setImportSuccess(null);
      setParsedPreview(null);
    }
  }, [isOpen, initialTab]);

  // Generate .abi Export Object
  const exportAbiObject: AbiConfigFile = {
    app: 'VPN PROXY HN',
    format: 'ABI_CONFIG_V1',
    fileExt: '.abi',
    version: '7.9.26',
    exportedAt: new Date().toISOString(),
    config: currentConfig,
    security: securityOpts.isLocked ? securityOpts : undefined,
  };

  const exportJsonStr = JSON.stringify(exportAbiObject, null, 2);
  const exportBase64 =
    typeof window !== 'undefined'
      ? `ABI-VPN-V1:${btoa(unescape(encodeURIComponent(exportJsonStr)))}`
      : '';

  useEffect(() => {
    if (isOpen && activeTab === 'QR') {
      const qrContent = exportBase64;
      QRCode.toDataURL(qrContent, { width: 250, margin: 2 }, (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      });
    }
  }, [isOpen, activeTab, exportBase64]);

  if (!isOpen) return null;

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportBase64);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAbiFile = () => {
    const blob = new Blob([exportJsonStr], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = currentConfig.name
      ? currentConfig.name.replace(/[^a-zA-Z0-9_-]/g, '_')
      : 'servidor_vpn';
    a.download = `${safeName}.abi`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parseRawContent = (rawText: string): VpnConfig => {
    let raw = rawText.trim();
    if (!raw) {
      throw new Error('El archivo o texto está vacío.');
    }

    // 1. Direct URIs (vmess, vless, trojan, hy2, etc.)
    if (
      raw.startsWith('vmess://') ||
      raw.startsWith('vless://') ||
      raw.startsWith('trojan://') ||
      raw.startsWith('hy2://') ||
      raw.startsWith('hysteria2://') ||
      raw.startsWith('hysteria://')
    ) {
      const isHy2 = raw.startsWith('hy2://') || raw.startsWith('hysteria2://');
      const isHy1 = raw.startsWith('hysteria://');
      const isV2 = raw.startsWith('vless://') || raw.startsWith('vmess://') || raw.startsWith('trojan://');

      let host = 'server.abi.net';
      let port = 443;
      let auth = '';
      let sni = '';

      try {
        const parsed = new URL(raw);
        host = parsed.hostname || host;
        port = parseInt(parsed.port) || 443;
        auth = decodeURIComponent(parsed.username || parsed.password || parsed.searchParams.get('auth') || '');
        sni = parsed.searchParams.get('sni') || parsed.searchParams.get('peer') || host;
      } catch {
        // url parse fallback
      }

      return {
        id: `abi-${Date.now()}`,
        name: isHy2 ? 'Hysteria v2 (.abi)' : isHy1 ? 'Hysteria v1 (.abi)' : 'V2Ray (.abi)',
        protocol: isHy2 ? 'hysteria_v2' : isHy1 ? 'hysteria_v1' : 'v2ray_xray',
        hysteriaVersion: isHy2 ? 2 : isHy1 ? 1 : undefined,
        server: host,
        port: port,
        authPassword: auth,
        sni: sni,
        flag: '🇭🇳',
        country: 'Honduras',
        ping: 28,
        load: 18,
        v2rayLink: isV2 ? raw : undefined,
        hy2Uri: isHy2 || isHy1 ? raw : undefined,
      };
    }

    // 2. Decode Base64 or ABI header
    if (raw.startsWith('ABI-VPN-V1:')) {
      raw = raw.replace('ABI-VPN-V1:', '');
    }

    let decodedStr = raw;
    if (!raw.startsWith('{')) {
      try {
        decodedStr = decodeURIComponent(escape(atob(raw)));
      } catch {
        // try raw string
      }
    }

    const parsed = JSON.parse(decodedStr);

    // Check expiration date
    if (parsed.security?.expiryDate) {
      const exp = new Date(parsed.security.expiryDate);
      if (exp.getTime() < Date.now()) {
        throw new Error(`Este archivo .abi expiró el ${exp.toLocaleDateString()}`);
      }
    }

    const targetConfig: VpnConfig = parsed.config || parsed;
    if (!targetConfig.protocol || !targetConfig.server) {
      throw new Error('El archivo .abi no contiene una configuración de servidor válida.');
    }

    // Ensure valid id & flag
    if (!targetConfig.id) {
      targetConfig.id = `abi-imp-${Date.now()}`;
    }
    if (!targetConfig.flag) {
      targetConfig.flag = '🇭🇳';
    }

    return targetConfig;
  };

  const handleFileUpload = (file: File) => {
    setImportError('');
    setImportSuccess(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config = parseRawContent(content);
        setParsedPreview(config);
        setImportText(content);
        setImportSuccess(`Archivo "${file.name}" cargado y verificado correctamente.`);
      } catch (err: any) {
        setImportError(`Error al leer archivo .abi: ${err.message || 'Formato no soportado.'}`);
      }
    };

    reader.onerror = () => {
      setImportError('Error al leer el archivo desde el dispositivo.');
    };

    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    setImportError('');
    try {
      const config = parseRawContent(importText);
      onImportConfig(config);
      onClose();
    } catch (err: any) {
      setImportError(`Error al importar: ${err.message || 'Formato de archivo .abi no válido.'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-white">
                  Archivos de Configuración .abi
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  .abi Format
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Exporta, importa y comparte tus servidores con extensión .abi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('EXPORT')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'EXPORT'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Exportar .abi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('IMPORT')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'IMPORT'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Importar .abi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('QR')}
            className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'QR'
                ? 'border-purple-400 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Código QR Móvil</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* TAB 1: EXPORT */}
          {activeTab === 'EXPORT' && (
            <div className="space-y-4">
              {/* Server Info Card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 mb-0.5">Perfil seleccionado para exportar:</div>
                  <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <span>{currentConfig.name}</span>
                    <span className="text-cyan-400 font-mono text-[11px] font-normal">
                      ({currentConfig.protocol.toUpperCase()})
                    </span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                    {currentConfig.server}:{currentConfig.port}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSecuritySettings(!showSecuritySettings)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    securityOpts.isLocked
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{securityOpts.isLocked ? 'Bloqueo Activo' : 'Añadir Candado'}</span>
                </button>
              </div>

              {/* Security / Lock options accordion */}
              {showSecuritySettings && (
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      <span>Protección y Bloqueos del archivo .abi</span>
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securityOpts.isLocked}
                        onChange={(e) =>
                          setSecurityOpts((prev) => ({ ...prev, isLocked: e.target.checked }))
                        }
                        className="rounded accent-amber-500 w-4 h-4"
                      />
                      <span className="text-xs text-slate-300 font-medium">Activar protección</span>
                    </label>
                  </div>

                  {securityOpts.isLocked && (
                    <div className="space-y-3 pt-2 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Nota o Mensaje del Creador (visible al importar)
                        </label>
                        <input
                          type="text"
                          value={securityOpts.lockNote || ''}
                          onChange={(e) =>
                            setSecurityOpts((prev) => ({ ...prev, lockNote: e.target.value }))
                          }
                          placeholder="Ej. Servidor válido para Honduras Claro/Tigo"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Fecha de Expiración</span>
                          </label>
                          <input
                            type="date"
                            value={securityOpts.expiryDate || ''}
                            onChange={(e) =>
                              setSecurityOpts((prev) => ({ ...prev, expiryDate: e.target.value }))
                            }
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                            <span>Bloqueo HWID (Hardware ID)</span>
                          </label>
                          <input
                            type="text"
                            value={securityOpts.lockHwid || ''}
                            onChange={(e) =>
                              setSecurityOpts((prev) => ({ ...prev, lockHwid: e.target.value }))
                            }
                            placeholder="Opcional: ID de teléfono único"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="blockRootCheck"
                          checked={securityOpts.blockRoot || false}
                          onChange={(e) =>
                            setSecurityOpts((prev) => ({ ...prev, blockRoot: e.target.checked }))
                          }
                          className="rounded accent-red-500 w-4 h-4"
                        />
                        <label htmlFor="blockRootCheck" className="text-slate-300 text-xs flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                          <span>Bloquear en dispositivos con Root</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Code preview */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Código de Clave .abi (Base64 Armored)
                </label>
                <textarea
                  readOnly
                  rows={4}
                  value={exportBase64}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 select-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadAbiFile}
                  className="py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-cyan-500/20"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Descargar Archivo .abi</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyExport}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '¡Clave .abi Copiada!' : 'Copiar Clave al Portapapeles'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'IMPORT' && (
            <div className="space-y-4">
              {/* File Drag and Drop / Picker Box */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".abi,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-slate-700/80 bg-slate-950/60 hover:bg-slate-950 hover:border-cyan-500/50'
                }`}
              >
                <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400">
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    Haz clic o arrastra aquí tu archivo <span className="text-cyan-400 font-mono">.abi</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Soporta archivos <code className="text-cyan-300">.abi</code> exportados desde la aplicación
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-1 px-4 py-1.5 rounded-lg bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-slate-700"
                >
                  Seleccionar archivo .abi
                </button>
              </div>

              {/* Or paste text */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  O pega directamente el código / clave .abi o URI
                </label>
                <textarea
                  rows={4}
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    setImportError('');
                    setImportSuccess(null);
                    setParsedPreview(null);
                  }}
                  placeholder="Pega la clave .abi, archivo JSON o enlace vmess://, vless://, hy2://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Status Messages */}
              {importError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{importSuccess}</span>
                </div>
              )}

              {/* Parsed Preview Card */}
              {parsedPreview && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs space-y-1 animate-fade-in">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase">Perfil Detectado en el archivo .abi:</div>
                  <div className="font-extrabold text-white text-sm">{parsedPreview.name}</div>
                  <div className="text-slate-300 font-mono text-[11px]">
                    Protocolo: <span className="text-cyan-300">{parsedPreview.protocol.toUpperCase()}</span> • Servidor:{' '}
                    {parsedPreview.server}:{parsedPreview.port}
                  </div>
                </div>
              )}

              {/* Submit Import Button */}
              <button
                type="button"
                onClick={handleProcessImport}
                disabled={!importText.trim()}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-cyan-500/20"
              >
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>Cargar e Importar Configuración .abi</span>
              </button>
            </div>
          )}

          {/* TAB 3: QR CODE */}
          {activeTab === 'QR' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="text-center">
                <h3 className="font-bold text-sm text-white">Escanear Archivo .abi con la Cámara Móvil</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Abre la cámara o escáner QR en tu teléfono para importar la configuración .abi al instante
                </p>
              </div>

              {qrDataUrl ? (
                <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-cyan-500/30">
                  <img src={qrDataUrl} alt="VPN PROXY HN QR Code" className="w-48 h-48" />
                </div>
              ) : (
                <div className="w-48 h-48 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-xs text-slate-500">
                  Generando código QR .abi...
                </div>
              )}

              <div className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-3.5 py-1.5 rounded-full border border-cyan-800/80 flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5" />
                <span>
                  {currentConfig.name} ({currentConfig.protocol.toUpperCase()}) • Formato .abi
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
