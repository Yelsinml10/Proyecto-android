import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  MoreVertical,
  Trash2,
  Save,
  FolderOpen,
  Cloud,
  Wifi,
  BatteryCharging,
  Key,
} from 'lucide-react';
import { ConnectionStatus } from '../types';
import { AppTheme } from '../utils/themeConfig';

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  activeTopTab: 'principal' | 'registro';
  onChangeTopTab: (tab: 'principal' | 'registro') => void;
  onOpenDrawer: () => void;
  onClearLogs: () => void;
  onOpenConfigModal: () => void;
  onSaveConfig: () => void;
  onOpenCloud: () => void;
  theme?: AppTheme;
}

export const Header: React.FC<HeaderProps> = ({
  connectionStatus,
  activeTopTab,
  onChangeTopTab,
  onOpenDrawer,
  onClearLogs,
  onOpenConfigModal,
  onSaveConfig,
  onOpenCloud,
  theme,
}) => {
  const [currentTime, setCurrentTime] = useState('10:53');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isConnected = connectionStatus === 'CONNECTED';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 border-b select-none transition-colors"
      style={{
        backgroundColor: theme?.previewColors.card || '#0f141c',
        borderColor: theme?.previewColors.border || 'rgba(30, 41, 59, 0.8)',
      }}
    >
      {/* 1. Android Status Bar (Exact HTTP Custom Style) */}
      <div
        className="px-4 py-1 border-b flex items-center justify-between text-[11px] font-mono text-slate-400"
        style={{
          backgroundColor: theme?.previewColors.bg || '#0b0e14',
          borderColor: theme?.previewColors.border || 'rgba(15, 23, 42, 0.6)',
        }}
      >
        <div className="flex items-center gap-2 font-bold text-slate-300">
          <span>{currentTime}</span>
          {isConnected && (
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60 font-sans text-[10px] animate-pulse">
              <Key className="w-3 h-3" />
              <span>VPN</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className="text-[10px] font-bold"
            style={{ color: theme?.previewColors.primary || '#22d3ee' }}
          >
            5G
          </span>
          <Wifi className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-[10px]">67%</span>
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* 2. Top Bar with Hamburger, HTTP Custom Logo, and Options Menu */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* Left: Hamburger Menu */}
        <button
          type="button"
          onClick={onOpenDrawer}
          className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-lg active:bg-slate-800 transition-colors"
          title="Menú lateral"
        >
          <Menu className="w-6 h-6 stroke-[2.2]" />
        </button>

        {/* Center: VPN PROXY HN Brand Title */}
        <div className="flex items-center gap-1.5 text-lg font-bold tracking-wide">
          <span
            className="font-black tracking-wider"
            style={{ color: theme?.previewColors.accent || '#f59e0b' }}
          >
            VPN PROXY
          </span>
          <span
            className="font-black tracking-wider text-sm px-1.5 py-0.5 rounded border shadow-sm"
            style={{
              color: theme?.previewColors.primary || '#22d3ee',
              backgroundColor: `${theme?.previewColors.primary || '#06b6d4'}20`,
              borderColor: `${theme?.previewColors.primary || '#06b6d4'}50`,
            }}
          >
            HN
          </span>
        </div>

        {/* Right: Three Dots Menu or Trash icon based on Active Tab */}
        <div className="relative" ref={menuRef}>
          {activeTopTab === 'registro' ? (
            <button
              type="button"
              onClick={onClearLogs}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg active:bg-slate-800 transition-colors"
              title="Limpiar registro"
            >
              <Trash2 className="w-5 h-5 text-slate-300 hover:text-rose-400" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg active:bg-slate-800 transition-colors"
                title="Opciones de configuración"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Popup Menu (Matching Video 00:07) */}
              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 border rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in text-xs"
                  style={{
                    backgroundColor: theme?.previewColors.card || '#18202c',
                    borderColor: theme?.previewColors.border || 'rgba(51, 65, 85, 0.8)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onSaveConfig();
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-200 hover:bg-white/5 flex items-center gap-3 transition-colors"
                  >
                    <Save
                      className="w-4 h-4"
                      style={{ color: theme?.previewColors.primary || '#22d3ee' }}
                    />
                    <span className="font-medium">Guardar config (.abi)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenConfigModal();
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-200 hover:bg-white/5 flex items-center gap-3 transition-colors"
                  >
                    <FolderOpen
                      className="w-4 h-4"
                      style={{ color: theme?.previewColors.accent || '#f59e0b' }}
                    />
                    <span className="font-medium">Abrir config (.abi)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenCloud();
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-200 hover:bg-white/5 flex items-center gap-3 transition-colors"
                  >
                    <Cloud className="w-4 h-4 text-purple-400" />
                    <span className="font-medium">Compartir QR (.abi)</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 3. Top Dual Tabs: Principal vs Registro (Exact HTTP Custom Style) */}
      <div
        className="grid grid-cols-2 text-center text-xs font-bold border-t"
        style={{ borderColor: theme?.previewColors.border || 'rgba(30, 41, 59, 0.6)' }}
      >
        <button
          type="button"
          onClick={() => onChangeTopTab('principal')}
          className="py-2.5 transition-all relative"
          style={{
            color: activeTopTab === 'principal' ? (theme?.previewColors.primary || '#22d3ee') : '#94a3b8',
          }}
        >
          <span>Principal</span>
          {activeTopTab === 'principal' && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 shadow-sm"
              style={{
                backgroundColor: theme?.previewColors.primary || '#22d3ee',
                boxShadow: `0 0 8px ${theme?.glowColor || 'rgba(34,211,238,0.8)'}`,
              }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => onChangeTopTab('registro')}
          className="py-2.5 transition-all relative"
          style={{
            color: activeTopTab === 'registro' ? (theme?.previewColors.primary || '#22d3ee') : '#94a3b8',
          }}
        >
          <span>Registro</span>
          {activeTopTab === 'registro' && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 shadow-sm"
              style={{
                backgroundColor: theme?.previewColors.primary || '#22d3ee',
                boxShadow: `0 0 8px ${theme?.glowColor || 'rgba(34,211,238,0.8)'}`,
              }}
            />
          )}
        </button>
      </div>
    </header>
  );
};
