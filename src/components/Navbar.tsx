import React from 'react';
import { ITOfficerStatus } from '../types/ticket';
import { 
  Laptop, 
  Layers, 
  ShieldAlert, 
  MapPin, 
  Volume2, 
  VolumeX, 
  FileText,
  Clock,
  HelpCircle,
  Radio
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'portal' | 'queue' | 'dashboard';
  setCurrentTab: (tab: 'portal' | 'queue' | 'dashboard') => void;
  itStatus: ITOfficerStatus;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onOpenTroubleshoot: () => void;
  onOpenReport: () => void;
  waitingCount: number;
  inProgressCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  itStatus,
  soundEnabled,
  setSoundEnabled,
  onOpenTroubleshoot,
  onOpenReport,
  waitingCount,
  inProgressCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top IT Location Broadcast Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-4 py-2 text-xs md:text-sm border-b border-indigo-800/40 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            IT Officer Location:
          </span>
          <span className="font-bold text-white bg-blue-950/80 px-2.5 py-0.5 rounded border border-blue-700/60 truncate">
            {itStatus.currentLocation}
          </span>
          {itStatus.destinationLocation && (
            <span className="text-slate-300 hidden sm:inline truncate">
              → Next stop: <strong className="text-amber-300">{itStatus.destinationLocation}</strong>
            </span>
          )}
          {itStatus.statusNote && (
            <span className="text-slate-300 hidden lg:inline border-l border-slate-700 pl-2 italic text-xs truncate max-w-md">
              "{itStatus.statusNote}"
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0">
          <button
            onClick={onOpenTroubleshoot}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-700 px-2 py-1 rounded transition"
            title="Quick Self-Help Troubleshooting Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Self-Help</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-700 transition"
            title={soundEnabled ? 'Mute queue chime' : 'Enable queue chime'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Chime On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Chime Muted</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                IT Officer Queue System
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                Multi-Branch
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Fair Queue • Zero Registration • Real-Time Repair Status
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <nav className="flex items-center gap-1.5 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setCurrentTab('portal')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
              currentTab === 'portal'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Submit Ticket</span>
          </button>

          <button
            onClick={() => setCurrentTab('queue')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition relative ${
              currentTab === 'queue'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Live Queue</span>
            {waitingCount > 0 && (
              <span className="ml-1 bg-amber-500 text-slate-950 text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                {waitingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Laptop className="w-4 h-4 text-indigo-300" />
            <span>IT Dashboard</span>
            {inProgressCount > 0 && (
              <span className="ml-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
