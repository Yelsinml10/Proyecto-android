import React from 'react';
import { Home, FileText, Settings, BookOpen } from 'lucide-react';
import { ActiveTab, ConnectionStatus } from '../types';
import { AppTheme } from '../utils/themeConfig';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  connectionStatus: ConnectionStatus;
  theme?: AppTheme;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
  connectionStatus,
  theme,
}) => {
  const tabs = [
    {
      id: 'home' as ActiveTab,
      label: 'Inicio',
      icon: Home,
    },
    {
      id: 'configs' as ActiveTab,
      label: 'Perfiles',
      icon: FileText,
    },
    {
      id: 'tools' as ActiveTab,
      label: 'Ajustes',
      icon: Settings,
    },
    {
      id: 'ai' as ActiveTab,
      label: 'Guía',
      icon: BookOpen,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t px-2 py-1 safe-area-pb transition-colors"
      style={{
        backgroundColor: theme ? `${theme.previewColors.bg}F0` : 'rgba(12, 16, 23, 0.95)',
        borderColor: theme?.previewColors.border || 'rgba(30, 41, 59, 0.8)',
      }}
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center">
        {tabs.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className="flex flex-col items-center justify-center py-1.5 transition-all select-none"
              style={{
                color: isActive
                  ? (theme?.previewColors.primary || '#22d3ee')
                  : '#94a3b8',
                fontWeight: isActive ? 700 : 400,
              }}
            >
              <div className="relative">
                <IconComp
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
              </div>

              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
