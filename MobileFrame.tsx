import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  isMobileFrame?: boolean;
  isFrameActive?: boolean;
  onToggleFrame?: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, isMobileFrame, isFrameActive }) => {
  const active = isMobileFrame ?? isFrameActive ?? false;
  if (!active) {
    return <div className="w-full min-h-screen bg-slate-950 text-slate-100">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 py-6 px-4 flex items-center justify-center">
      {/* Mobile Device Bezel Wrapper */}
      <div className="relative w-full max-w-[420px] h-[860px] bg-slate-950 rounded-[48px] border-[8px] border-slate-800 shadow-[0_0_60px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden">
        {/* Notch / Speaker Bar */}
        <div className="w-full bg-slate-950 pt-3 pb-1 px-6 flex items-center justify-between text-[11px] font-semibold text-slate-400 select-none z-40 shrink-0">
          <span>09:41</span>
          <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto -mt-1 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-800" />
          </div>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-cyan-400" />
            <Wifi className="w-3 h-3 text-cyan-400" />
            <Battery className="w-3.5 h-3.5 text-slate-300" />
          </div>
        </div>

        {/* Mobile Screen Content */}
        <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 relative">
          {children}
        </div>

        {/* Android Gesture Bar */}
        <div className="w-full bg-slate-950 py-2 flex justify-center items-center shrink-0 z-40">
          <div className="w-32 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
