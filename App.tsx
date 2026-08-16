import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HttpCustomHome } from './components/HttpCustomHome';
import { ToolsTab } from './components/ToolsTab';
import { LiveConsoleLogs } from './components/LiveConsoleLogs';
import { ConfigImportExportModal } from './components/ConfigImportExportModal';
import { PayloadGeneratorModal } from './components/PayloadGeneratorModal';
import { AnsiColorPaletteModal } from './components/AnsiColorPaletteModal';
import { ProtocolSelectorModal } from './components/ProtocolSelectorModal';
import { NativeApkSourceModal } from './components/NativeApkSourceModal';
import { AndroidDrawer } from './components/AndroidDrawer';
import { BottomNavBar } from './components/BottomNavBar';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { MobileFrame } from './components/MobileFrame';
import { SshProtocolScreen } from './components/protocols/SshProtocolScreen';
import { V2RayProtocolScreen } from './components/protocols/V2RayProtocolScreen';
import { UdpCustomProtocolScreen } from './components/protocols/UdpCustomProtocolScreen';
import { SlowDnsProtocolScreen } from './components/protocols/SlowDnsProtocolScreen';
import { PsiphonProtocolScreen } from './components/protocols/PsiphonProtocolScreen';
import { HysteriaProtocolScreen } from './components/protocols/HysteriaProtocolScreen';
import { OpenVPNProtocolScreen } from './components/protocols/OpenVPNProtocolScreen';
import { ProfilesManager } from './components/ProfilesManager';
import { VpnConfig, VpnProtocol, ConnectionStatus, LogMessage, NetworkStats, ActiveTab, AppThemeId } from './types';
import { SAMPLE_SERVERS } from './data/mockData';
import { APP_THEMES } from './utils/themeConfig';
import { applyThemeCssVars } from './utils/themeApplier';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { Play, Square } from 'lucide-react';

export default function App() {
  // --- STATE ---
  const [currentThemeId, setCurrentThemeId] = useState<AppThemeId>(() => {
    const saved = localStorage.getItem('vpn_app_theme');
    return (saved as AppThemeId) || 'cyber_neon';
  });
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Saved .abi Profiles
  const [savedProfiles, setSavedProfiles] = useState<VpnConfig[]>(() => {
    try {
      const saved = localStorage.getItem('vpn_saved_abi_profiles');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return SAMPLE_SERVERS;
  });

  const [currentConfig, setCurrentConfig] = useState<VpnConfig>(() => {
    return savedProfiles[0] || SAMPLE_SERVERS[0];
  });

  // Persist savedProfiles
  useEffect(() => {
    try {
      localStorage.setItem('vpn_saved_abi_profiles', JSON.stringify(savedProfiles));
    } catch {
      // ignore
    }
  }, [savedProfiles]);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const [activeBottomTab, setActiveBottomTab] = useState<ActiveTab>('home');
  const [activeTopTab, setActiveTopTab] = useState<'principal' | 'registro'>('principal');
  const [activeProtocolView, setActiveProtocolView] = useState<VpnProtocol | null>(null);

  const isConnected = connectionStatus === 'CONNECTED';
  const isConnecting =
    connectionStatus === 'CONNECTING' ||
    connectionStatus === 'AUTHENTICATING' ||
    connectionStatus === 'HANDSHAKE';

  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    bytesSent: 0,
    bytesReceived: 0,
    uploadSpeed: 0,
    downloadSpeed: 0,
    latencyMs: 0,
    virtualIp: '10.0.0.2',
    connectionTimeSeconds: 0,
  });

  const [logs, setLogs] = useState<LogMessage[]>([]);

  // Modals & Drawers Controls
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configModalInitialTab, setConfigModalInitialTab] = useState<'EXPORT' | 'IMPORT' | 'QR'>('IMPORT');
  const [isPayloadModalOpen, setIsPayloadModalOpen] = useState(false);
  const [isAnsiModalOpen, setIsAnsiModalOpen] = useState(false);
  const [isNativeApkModalOpen, setIsNativeApkModalOpen] = useState(false);
  const [isAndroidDrawerOpen, setIsAndroidDrawerOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelectProfile = (config: VpnConfig) => {
    setCurrentConfig(config);
    addLog('info', `Servidor activo cambiado a "${config.name}"`);
    setActiveBottomTab('home');
  };

  const handleSaveCurrentAsProfile = () => {
    const defaultName = `${currentConfig.name} (Copia .abi)`;
    const profileName = prompt('Nombre para guardar este perfil .abi:', defaultName) || currentConfig.name;
    const newProfile: VpnConfig = {
      ...currentConfig,
      id: `abi-saved-${Date.now()}`,
      name: profileName,
    };
    setSavedProfiles((prev) => [newProfile, ...prev.filter((p) => p.id !== newProfile.id)]);
    setCurrentConfig(newProfile);
    addLog('success', `Perfil .abi "${newProfile.name}" guardado en la lista`);
  };

  const handleDeleteProfile = (id: string) => {
    if (confirm('¿Deseas eliminar este perfil guardado?')) {
      setSavedProfiles((prev) => prev.filter((p) => p.id !== id));
      addLog('warning', 'Perfil eliminado de la lista');
    }
  };

  const handleImportProfile = (config: VpnConfig) => {
    setSavedProfiles((prev) => [config, ...prev.filter((p) => p.id !== config.id)]);
    setCurrentConfig(config);
    addLog('success', `Perfil .abi "${config.name}" importado y activado`);
  };

  const [modalConfigTarget, setModalConfigTarget] = useState<VpnConfig>(currentConfig);
  const handleOpenExportModalForConfig = (config: VpnConfig) => {
    setModalConfigTarget(config);
    setConfigModalInitialTab('EXPORT');
    setIsConfigModalOpen(true);
  };

  // Helper to append log
  const addLog = (level: LogMessage['level'], message: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newLog: LogMessage = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: timeStr,
      level,
      message,
      protocol: currentConfig.protocol,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  // Connection Handler Simulation (Exact sequence from Video 00:10-00:11)
  const handleToggleConnect = () => {
    if (connectionStatus === 'CONNECTED' || connectionStatus === 'CONNECTING') {
      // Disconnect
      setConnectionStatus('DISCONNECTING');
      addLog('warning', 'Deteniendo...');
      addLog('warning', `${currentConfig.protocol.toUpperCase()}: deteniendo conexión`);

      setTimeout(() => {
        setConnectionStatus('DISCONNECTED');
        addLog('info', 'Túnel VPN detenido');
        setNetworkStats((prev) => ({
          ...prev,
          uploadSpeed: 0,
          downloadSpeed: 0,
          latencyMs: 0,
        }));
      }, 500);
    } else {
      // Connect Simulation
      setConnectionStatus('CONNECTING');
      addLog('info', `Iniciando ${currentConfig.protocol.toUpperCase()}...`);
      addLog('debug', `${currentConfig.protocol.toUpperCase()}: inicializando core`);

      const targetServer = currentConfig.server || 'paquetes1.miclaro.com.hn';
      const targetPort = currentConfig.port || 80;

      setTimeout(() => {
        setConnectionStatus('AUTHENTICATING');
        addLog('debug', `Conectando a ${targetServer}:${targetPort}, timeout 10 segundos`);
      }, 400);

      setTimeout(() => {
        if (currentConfig.protocol === 'ssh_ws' || currentConfig.protocol === 'ssh_ssl') {
          addLog('debug', 'HTTP/1.1 204 No Content');
          addLog('debug', 'Reemplazar respuesta');
          addLog('info', 'HTTP/2.0 200 Connection established');
          addLog('debug', 'HTTP/1.1 101 Switching Protocols');
          addLog('info', 'HTTP/1.0 200 Connection established');
        } else if (currentConfig.protocol === 'v2ray_xray') {
          const protoName = (currentConfig.v2rayType || 'vless').toUpperCase();
          const netName = (currentConfig.network || 'ws').toUpperCase();
          const secName = currentConfig.securityType === 'reality' || currentConfig.realityPublicKey ? 'REALITY' : currentConfig.v2rayTls ? 'TLS' : 'NONE';
          addLog('info', `Xray-Core: iniciando outbound [${protoName}] (${netName} + ${secName})`);
          addLog('debug', `SNI/Host: ${currentConfig.sni || targetServer} · Path: ${currentConfig.v2rayPath || '/'}`);
          if (currentConfig.realityPublicKey) {
            addLog('debug', `Reality PBK: ${currentConfig.realityPublicKey.substring(0, 10)}... · Flow: ${currentConfig.v2rayFlow || 'none'}`);
          }
        } else if (currentConfig.protocol === 'slowdns') {
          addLog('info', `SlowDNS: consultando TXT para ${currentConfig.dnsNameServer || 'ns1.example.com'}`);
          addLog('debug', 'SlowDNS: canal DNSTT establecido vía UDP 53');
        } else if (currentConfig.protocol === 'hysteria_v2' || currentConfig.protocol === 'hysteria_v1') {
          addLog('info', `Hysteria Core: conectando a ${targetServer}:${currentConfig.port || 443} vía QUIC UDP`);
          addLog('debug', `SNI: ${currentConfig.sni || targetServer} · Obfs: ${currentConfig.obfsType || 'none'}`);
        } else if (currentConfig.protocol === 'openvpn') {
          addLog('info', `OpenVPN: iniciando túnel tun0 ${currentConfig.ovpnProtocol?.toUpperCase() || 'TCP'}`);
          addLog('debug', `Servidor remoto: ${targetServer}:${currentConfig.port || 1194}`);
        }
      }, 900);

      setTimeout(() => {
        setConnectionStatus('HANDSHAKE');
        addLog('info', 'DNS por el túnel activo');
        addLog('info', 'Motor SOCKS: BadVPN');
      }, 1400);

      setTimeout(() => {
        setConnectionStatus('CONNECTED');
        addLog('success', `${currentConfig.protocol.toUpperCase()}: conectado correctamente`);
        addLog('success', 'Listo para navegar');
      }, 1900);
    }
  };

  // Speed Simulation effect when connected
  useEffect(() => {
    if (connectionStatus === 'CONNECTED') {
      timerRef.current = setInterval(() => {
        const up = Math.floor(Math.random() * 450) + 50; // KB/s
        const down = Math.floor(Math.random() * 2800) + 300; // KB/s
        setNetworkStats((prev) => ({
          ...prev,
          uploadSpeed: up,
          downloadSpeed: down,
          bytesSent: prev.bytesSent + up * 1024,
          bytesReceived: prev.bytesReceived + down * 1024,
          latencyMs: Math.floor(Math.random() * 15) + 20,
          connectionTimeSeconds: prev.connectionTimeSeconds + 1,
        }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [connectionStatus]);

  const handleSelectProtocol = (proto: VpnProtocol) => {
    const updated = { ...currentConfig, protocol: proto };
    setCurrentConfig(updated);
    addLog('info', `Protocolo seleccionado: ${proto.toUpperCase()}`);
  };

  const activeTheme = APP_THEMES.find((t) => t.id === currentThemeId) || APP_THEMES[0];

  useEffect(() => {
    applyThemeCssVars(activeTheme);
  }, [activeTheme]);

  const handleSelectTheme = (themeId: AppThemeId) => {
    setCurrentThemeId(themeId);
    localStorage.setItem('vpn_app_theme', themeId);
    const found = APP_THEMES.find((t) => t.id === themeId);
    if (found) {
      applyThemeCssVars(found);
      addLog('info', `Tema visual cambiado a "${found.name}"`);
    }
  };

  // Dedicated Protocol Screen Renderer
  if (activeProtocolView) {
    if (activeProtocolView === 'ssh_ws' || activeProtocolView === 'ssh_ssl') {
      return (
        <MobileFrame isFrameActive={isMobileFrame} onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}>
          <SshProtocolScreen
            config={currentConfig}
            onUpdateConfig={(updated) => setCurrentConfig(updated)}
            onBack={() => setActiveProtocolView(null)}
            onOpenPayloadModal={() => setIsPayloadModalOpen(true)}
          />
        </MobileFrame>
      );
    }

    if (activeProtocolView === 'v2ray_xray') {
      return (
        <MobileFrame isFrameActive={isMobileFrame} onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}>
          <V2RayProtocolScreen
            config={currentConfig}
            onUpdateConfig={(updated) => setCurrentConfig(updated)}
            onBack={() => setActiveProtocolView(null)}
          />
        </MobileFrame>
      );
    }

    if (activeProtocolView === 'udp_custom') {
      return (
        <MobileFrame isFrameActive={isMobileFrame} onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}>
          <UdpCustomProtocolScreen
            config={currentConfig}
            onUpdateConfig={(updated) => setCurrentConfig(updated)}
            onBack={() => setActiveProtocolView(null)}
          />
        </MobileFrame>
      );
    }

    if (activeProtocolView === 'slowdns') {
      return (
        <MobileFrame isFrameActive={isMobileFrame} onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}>
          <SlowDnsProtocolScreen
            config={currentConfig}
            onUpdateConfig={(updated) => setCurrentConfig(updated)}
            onBack={() => setActiveProtocolView(null)}
          />
        </MobileFrame>
      );
    }

    if (activeProtocolView === 'zivpn') {
      return (
        <MobileFrame isFrameActive={isMobileFrame} onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}>
          <PsiphonProtocolScreen
            config={currentConfig}
            onUpdateConfig={(updated) => setCurrentConfig(updated)}
            onBack={() => setActiveProtocolView(null)}
          />
        </MobileFrame>
      );
    }

    if (activeProtocolView === 'hysteria_v2' || activeProtocolView === 'hysteria_v1') {
      return (
        <MobileFrame isFrameActive={isMobileFrame} onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}>
          <HysteriaProtocolScreen
            config={currentConfig}
            onUpdateConfig={(updated) => setCurrentConfig(updated)}
            onBack={() => setActiveProtocolView(null)}
          />
        </MobileFrame>
      );
    }

    if (activeProtocolView === 'openvpn') {
      return (
        <MobileFrame isFrameActive={isMobileFrame} onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}>
          <OpenVPNProtocolScreen
            config={currentConfig}
            onUpdateConfig={(updated) => setCurrentConfig(updated)}
            onBack={() => setActiveProtocolView(null)}
          />
        </MobileFrame>
      );
    }
  }

  return (
    <MobileFrame
      isFrameActive={isMobileFrame}
      onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
    >
      <div className="min-h-screen bg-[#0a0e16] text-slate-200 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-black">
        {/* Top App Bar & Tabs (Exact HTTP Custom Style) */}
        <Header
          activeTopTab={activeTopTab}
          connectionStatus={connectionStatus}
          onChangeTopTab={(tab) => {
            setActiveTopTab(tab);
            if (activeBottomTab !== 'home') setActiveBottomTab('home');
          }}
          onOpenDrawer={() => setIsAndroidDrawerOpen(true)}
          onClearLogs={() => setLogs([])}
          onOpenConfigModal={() => {
            setConfigModalInitialTab('IMPORT');
            setIsConfigModalOpen(true);
          }}
          onSaveConfig={() => {
            setConfigModalInitialTab('EXPORT');
            setIsConfigModalOpen(true);
          }}
          onOpenCloud={() => {
            setConfigModalInitialTab('QR');
            setIsConfigModalOpen(true);
          }}
          theme={activeTheme}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-xl w-full mx-auto p-4">
          {/* TAB 1: INICIO (Principal vs Registro) */}
          {activeBottomTab === 'home' && (
            <>
              {activeTopTab === 'principal' ? (
                <HttpCustomHome
                  config={currentConfig}
                  status={connectionStatus}
                  networkStats={networkStats}
                  onUpdateConfig={(updated) => {
                    setCurrentConfig(updated);
                    addLog('debug', 'Configuración actualizada.');
                  }}
                  onToggleConnect={handleToggleConnect}
                  onOpenProtocolModal={() => setIsProtocolModalOpen(true)}
                  onOpenPayloadModal={() => setIsPayloadModalOpen(true)}
                  onOpenConfigModal={() => setIsConfigModalOpen(true)}
                  onSelectProtocol={handleSelectProtocol}
                  onOpenProtocolView={(proto) => setActiveProtocolView(proto)}
                />
              ) : (
                <LiveConsoleLogs
                  logs={logs}
                  onClearLogs={() => setLogs([])}
                  onOpenAnsiModal={() => setIsAnsiModalOpen(true)}
                />
              )}
            </>
          )}

          {/* TAB 2: PERFILES (.abi) */}
          {activeBottomTab === 'configs' && (
            <ProfilesManager
              currentConfig={currentConfig}
              savedProfiles={savedProfiles}
              onSelectProfile={handleSelectProfile}
              onSaveCurrentAsProfile={handleSaveCurrentAsProfile}
              onDeleteProfile={handleDeleteProfile}
              onImportProfile={handleImportProfile}
              onOpenExportModalForConfig={handleOpenExportModalForConfig}
              theme={activeTheme}
            />
          )}

          {/* TAB 3: AJUSTES / HERRAMIENTAS */}
          {activeBottomTab === 'tools' && (
            <div className="max-w-xl mx-auto">
              <ToolsTab
                config={currentConfig}
                onUpdateConfig={(updated) => setCurrentConfig(updated)}
                onOpenPayloadModal={() => setIsPayloadModalOpen(true)}
                currentThemeId={currentThemeId}
                onOpenThemesModal={() => setIsThemeModalOpen(true)}
              />
            </div>
          )}

          {/* TAB 4: GUÍA / ASISTENTE */}
          {activeBottomTab === 'ai' && (
            <div className="max-w-xl mx-auto space-y-4 py-2">
              <div className="p-5 rounded-2xl bg-[#0f1520] border border-slate-800 space-y-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>📖 Guía de Conexión HTTP Custom</span>
                </h2>
                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p>
                    <strong>1. Conexión SSH:</strong> Activa "Usar payload", elige el método (Enhanced/TLS/SlowDNS), ingresa el payload personalizado y credenciales de cuenta (Host:puerto, Usuario, Contraseña).
                  </p>
                  <p>
                    <strong>2. V2Ray:</strong> Pega tu enlace o configura Trojan/VLESS/VMess con WebSocket/gRPC, SNI, uTLS fingerprint (chrome), ALPN y multiplexación Mux.
                  </p>
                  <p>
                    <strong>3. UDP Custom:</strong> Configura host:puerto, usuario, contraseña y opciones TLS con SNI automático.
                  </p>
                  <p>
                    <strong>4. SlowDNS:</strong> Requiere configurar tu <strong>Registro NS</strong> y la Clave Pública DNSTT.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiDrawerOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all shadow"
                >
                  Consultar con Asistente IA VPN
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Floating Action Button (FAB) (Exact Video 00:00, 00:06, 00:10, 00:14) */}
        <div className="fixed bottom-16 right-5 z-40">
          <button
            type="button"
            onClick={handleToggleConnect}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${
              isConnected
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40 ring-4 ring-red-600/20'
                : isConnecting
                ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/40 animate-pulse ring-4 ring-amber-500/20'
                : 'text-white ring-4'
            }`}
            style={{
              backgroundColor: !isConnected && !isConnecting ? activeTheme.previewColors.primary : undefined,
              boxShadow: !isConnected && !isConnecting ? `0 10px 25px -5px ${activeTheme.glowColor}` : undefined,
              borderColor: activeTheme.previewColors.border,
            }}
            title={isConnected ? 'Desconectar' : 'Conectar'}
          >
            {isConnected ? (
              <Square className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            )}
          </button>
        </div>

        {/* Bottom Navigation Bar (4 Native Tabs: Inicio, Perfiles, Ajustes, Guía) */}
        <BottomNavBar
          activeTab={activeBottomTab}
          onChangeTab={(tab) => {
            setActiveBottomTab(tab);
          }}
          connectionStatus={connectionStatus}
          theme={activeTheme}
        />

        {/* Left Android Drawer (Matching Video 00:01 - 00:04) */}
        <AndroidDrawer
          isOpen={isAndroidDrawerOpen}
          onClose={() => setIsAndroidDrawerOpen(false)}
          currentProtocol={currentConfig.protocol}
          onSelectProtocol={(p) => {
            handleSelectProtocol(p);
            setActiveProtocolView(p);
            setActiveBottomTab('home');
            setActiveTopTab('principal');
          }}
          onOpenDeviceId={() => {
            setIsAndroidDrawerOpen(false);
            alert(`ID de hardware del dispositivo:\nHWID-ANDROID-2026-X98B-7721`);
          }}
          onOpenAbout={() => {
            setIsAndroidDrawerOpen(false);
            alert(`VPN PROXY HN v7.9.26 (Patch 2)\nCliente VPN Túnel para Honduras\nMotor SOCKS / BadVPN & Core V2Ray Xray`);
          }}
          theme={activeTheme}
        />

        {/* Modals & Dialogs */}
        <ThemeSelectorModal
          isOpen={isThemeModalOpen}
          onClose={() => setIsThemeModalOpen(false)}
          currentThemeId={currentThemeId}
          onSelectTheme={handleSelectTheme}
        />

        <ConfigImportExportModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          currentConfig={modalConfigTarget || currentConfig}
          initialTab={configModalInitialTab}
          onImportConfig={(loaded) => {
            handleImportProfile(loaded);
          }}
        />

        <PayloadGeneratorModal
          isOpen={isPayloadModalOpen}
          onClose={() => setIsPayloadModalOpen(false)}
          onApplyPayload={(payload) => {
            setCurrentConfig((prev) => ({ ...prev, payload }));
            addLog('info', 'Nuevo payload inyectado');
          }}
        />

        <AnsiColorPaletteModal
          isOpen={isAnsiModalOpen}
          onClose={() => setIsAnsiModalOpen(false)}
        />

        <ProtocolSelectorModal
          isOpen={isProtocolModalOpen}
          onClose={() => setIsProtocolModalOpen(false)}
          currentProtocol={currentConfig.protocol}
          onSelectProtocol={(proto) => {
            handleSelectProtocol(proto);
            setActiveProtocolView(proto);
          }}
        />

        <NativeApkSourceModal
          isOpen={isNativeApkModalOpen}
          onClose={() => setIsNativeApkModalOpen(false)}
        />

        <AiAssistantDrawer
          isOpen={isAiDrawerOpen}
          onClose={() => setIsAiDrawerOpen(false)}
          currentConfig={currentConfig}
          onApplyConfig={(suggested) => {
            setCurrentConfig(suggested);
            addLog('info', 'Configuración optimizada por Asistente IA');
          }}
        />
      </div>
    </MobileFrame>
  );
}
