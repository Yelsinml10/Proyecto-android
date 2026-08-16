import React, { useState, useRef } from 'react';
import {
  FileCode2,
  Download,
  Upload,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Lock,
  Sparkles,
  Server,
  Zap,
  Play,
  Share2,
  Calendar,
  AlertCircle,
  FileUp,
} from 'lucide-react';
import { VpnConfig, AbiConfigFile } from '../types';
import { AppTheme } from '../utils/themeConfig';

interface ProfilesManagerProps {
  currentConfig: VpnConfig;
  savedProfiles: VpnConfig[];
  onSelectProfile: (config: VpnConfig) => void;
  onSaveCurrentAsProfile: () => void;
  onDeleteProfile: (id: string) => void;
  onImportProfile: (config: VpnConfig) => void;
  onOpenExportModalForConfig: (config: VpnConfig) => void;
  theme?: AppTheme;
}

export const ProfilesManager: React.FC<ProfilesManagerProps> = ({
  currentConfig,
  savedProfiles,
  onSelectProfile,
  onSaveCurrentAsProfile,
  onDeleteProfile,
  onImportProfile,
  onOpenExportModalForConfig,
  theme,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [importNotification, setImportNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProfiles = savedProfiles.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.server.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.protocol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Quick download of a specific profile as .abi file
  const handleQuickDownloadAbi = (profile: VpnConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    const exportAbi: AbiConfigFile = {
      app: 'VPN PROXY HN',
      format: 'ABI_CONFIG_V1',
      fileExt: '.abi',
      version: '7.9.26',
      exportedAt: new Date().toISOString(),
      config: profile,
      security: {
        isLocked: false,
        lockNote: `Perfil .abi: ${profile.name}`,
      },
    };

    const jsonStr = JSON.stringify(exportAbi, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = profile.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${safeName}.abi`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setImportNotification(`Archivo "${safeName}.abi" descargado.`);
    setTimeout(() => setImportNotification(null), 3500);
  };

  // Direct file upload handler for .abi files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let raw = (event.target?.result as string).trim();
        if (raw.startsWith('ABI-VPN-V1:')) {
          raw = raw.replace('ABI-VPN-V1:', '');
        }

        let decodedStr = raw;
        if (!raw.startsWith('{')) {
          try {
            decodedStr = decodeURIComponent(escape(atob(raw)));
          } catch {
            // keep raw
          }
        }

        const parsed = JSON.parse(decodedStr);
        const config: VpnConfig = parsed.config || parsed;

        if (!config.protocol || !config.server) {
          throw new Error('El archivo .abi no tiene parámetros de servidor válidos.');
        }

        config.id = `abi-file-${Date.now()}`;
        if (!config.name.includes('.abi')) {
          config.name = `${config.name}`;
        }

        onImportProfile(config);
        setImportNotification(`¡Archivo .abi "${file.name}" importado con éxito a tus perfiles!`);
        setTimeout(() => setImportNotification(null), 4000);
      } catch (err: any) {
        alert(`Error al importar archivo .abi: ${err.message || 'Formato no soportado.'}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto py-2">
      {/* Top Banner with .abi format info */}
      <div
        className="p-5 rounded-2xl border relative overflow-hidden transition-all shadow-lg"
        style={{
          backgroundColor: theme?.previewColors.card || '#0f1520',
          borderColor: theme?.previewColors.border || 'rgba(30, 41, 59, 0.8)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-black px-2 py-0.5 rounded-full border"
                style={{
                  color: theme?.previewColors.primary || '#22d3ee',
                  backgroundColor: `${theme?.previewColors.primary || '#06b6d4'}20`,
                  borderColor: `${theme?.previewColors.primary || '#06b6d4'}50`,
                }}
              >
                Formato .abi
              </span>
              <h2 className="text-sm font-extrabold text-white">
                Gestor de Servidores & Perfiles .abi
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Guarda tus servidores en la memoria local o expórtalos en archivos <code>.abi</code> protegidos para compartir con otros usuarios.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
            <FileCode2 className="w-6 h-6" />
          </div>
        </div>

        {/* Action Buttons: Import .abi / Save current */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <input
            ref={fileInputRef}
            type="file"
            accept=".abi,.json"
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <FileUp className="w-4 h-4 text-cyan-400" />
            <span>Importar Archivo .abi</span>
          </button>

          <button
            type="button"
            onClick={onSaveCurrentAsProfile}
            className="py-2.5 px-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Guardar Config Actual</span>
          </button>
        </div>
      </div>

      {/* Import Notification Banner */}
      {importNotification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{importNotification}</span>
        </div>
      )}

      {/* Search and Counter */}
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="text-xs font-bold text-slate-300">
          Servidores Guardados ({savedProfiles.length})
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar servidor..."
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-40 sm:w-52"
        />
      </div>

      {/* Profiles List */}
      <div className="space-y-2.5">
        {filteredProfiles.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
            <Server className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No se encontraron perfiles guardados.</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-cyan-400 font-bold hover:underline"
            >
              Haz clic aquí para importar tu primer archivo .abi
            </button>
          </div>
        ) : (
          filteredProfiles.map((profile) => {
            const isActive = currentConfig.id === profile.id || currentConfig.name === profile.name;

            return (
              <div
                key={profile.id}
                onClick={() => onSelectProfile(profile)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isActive
                    ? 'border-cyan-500/80 bg-cyan-950/20 shadow-lg shadow-cyan-950/50'
                    : 'border-slate-800/90 bg-[#0f141c] hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                {/* Active Indicator Strip */}
                {isActive && (
                  <div
                    className="absolute top-0 left-0 bottom-0 w-1.5"
                    style={{ backgroundColor: theme?.previewColors.primary || '#22d3ee' }}
                  />
                )}

                <div className="flex items-center justify-between gap-3">
                  {/* Left: Info */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base">{profile.flag || '🇭🇳'}</span>
                      <h3 className="font-extrabold text-xs sm:text-sm text-white truncate">
                        {profile.name}
                      </h3>
                      {isActive && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-black border"
                          style={{
                            color: theme?.previewColors.primary || '#22d3ee',
                            backgroundColor: `${theme?.previewColors.primary || '#06b6d4'}25`,
                            borderColor: `${theme?.previewColors.primary || '#06b6d4'}60`,
                          }}
                        >
                          ACTIVO
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span className="text-cyan-400 font-bold uppercase">
                        {profile.protocol.toUpperCase()}
                      </span>
                      <span>•</span>
                      <span className="truncate">{profile.server}:{profile.port}</span>
                      {profile.ping && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">{profile.ping} ms</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Download .abi file */}
                    <button
                      type="button"
                      onClick={(e) => handleQuickDownloadAbi(profile, e)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors"
                      title="Descargar archivo .abi"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Open Export / Share Modal */}
                    <button
                      type="button"
                      onClick={() => onOpenExportModalForConfig(profile)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-slate-700/60 transition-colors"
                      title="Exportar con candado / QR"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Delete Profile */}
                    <button
                      type="button"
                      onClick={() => onDeleteProfile(profile.id)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-colors"
                      title="Eliminar perfil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Quick Apply bar if not active */}
                {!isActive && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Toca para cargar este perfil como servidor activo</span>
                    <span className="text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <Play className="w-3 h-3 fill-current" />
                      <span>Cargar</span>
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
