import React, { useState } from "react";
import { FlowStage } from "../types";
import { Wind, Eye, Compass, CheckCircle2, Sparkles, Volume2, VolumeX, Radio, ShieldAlert } from "lucide-react";
import { sound } from "../utils/audioSynth";

interface NavbarProps {
  currentStage: FlowStage;
  onSelectStage: (stage: FlowStage) => void;
  onOpenEmergency: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentStage, onSelectStage, onOpenEmergency }) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [isDroneActive, setIsDroneActive] = useState(sound.isDroneActive());

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    sound.setMuted(nextMuted);
    setIsMuted(nextMuted);
    if (nextMuted) {
      setIsDroneActive(false);
    } else {
      sound.playClick();
    }
  };

  const handleToggleDrone = () => {
    if (isMuted) {
      sound.setMuted(false);
      setIsMuted(false);
    }
    const active = sound.toggleDrone();
    setIsDroneActive(active);
  };

  const stages: { id: FlowStage; label: string; timeTag: string; icon: React.ReactNode }[] = [
    { id: "breathing", label: "Ground", timeTag: "0-3s", icon: <Wind className="w-3.5 h-3.5" /> },
    { id: "sensory", label: "Anchor (5-4-3-2-1)", timeTag: "10-20s", icon: <Eye className="w-3.5 h-3.5" /> },
    { id: "triage", label: "Triage", timeTag: "20-40s", icon: <Compass className="w-3.5 h-3.5" /> },
    { id: "actions", label: "Micro-Step", timeTag: "40-60s", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { id: "braindump", label: "Brain Dump", timeTag: "AI", icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <header id="main-navigation" className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Live status */}
        <div className="flex items-center gap-3">
          <button
            id="brand-logo-button"
            onClick={() => {
              sound.playClick();
              onSelectStage("breathing");
            }}
            className="flex items-center gap-2 text-left group"
          >
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping absolute opacity-75" />
              <span className="w-2.5 h-2.5 rounded-full bg-white relative" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 font-display">
                CalmCore
              </span>
              <span className="hidden sm:inline-block text-[11px] text-teal-400 font-medium tracking-wider uppercase block -mt-0.5">
                Crisis De-escalation
              </span>
            </div>
          </button>
        </div>

        {/* Stage Timeline Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          {stages.map((st) => {
            const isActive = currentStage === st.id;
            return (
              <button
                key={st.id}
                id={`nav-stage-${st.id}`}
                onClick={() => {
                  sound.playClick();
                  onSelectStage(st.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-teal-600/20 text-teal-300 border border-teal-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {st.icon}
                <span>{st.label}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${isActive ? "bg-teal-500/30 text-teal-200" : "text-slate-500"}`}>
                  {st.timeTag}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Audio Controls & Emergency Help */}
        <div className="flex items-center gap-2">
          {/* Ambient Theta Drone Toggle */}
          <button
            id="ambient-drone-toggle-btn"
            onClick={handleToggleDrone}
            title={isDroneActive ? "Turn off ambient theta tone" : "Turn on soothing 432Hz ambient drone"}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              isDroneActive
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isDroneActive ? "animate-pulse text-cyan-400" : ""}`} />
            <span className="hidden lg:inline">{isDroneActive ? "Ambient On" : "Ambient Drone"}</span>
          </button>

          {/* Sound Cues Toggle */}
          <button
            id="sound-mute-toggle-btn"
            onClick={handleToggleMute}
            title={isMuted ? "Unmute audio cues" : "Mute audio cues"}
            className={`p-2 rounded-lg text-xs border transition-colors ${
              isMuted
                ? "bg-slate-800/60 border-slate-700 text-slate-500 hover:text-slate-300"
                : "bg-slate-800 border-slate-700 text-teal-400 hover:bg-slate-700"
            }`}
            aria-label="Toggle sound cues"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Crisis 988 Quick Action */}
          <button
            id="emergency-top-action-btn"
            onClick={() => {
              sound.playClick();
              onOpenEmergency();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Lifeline (988)</span>
          </button>
        </div>
      </div>

      {/* Mobile Stage Scroller */}
      <div className="flex md:hidden overflow-x-auto px-3 py-1.5 gap-1.5 bg-slate-950/40 border-t border-slate-800/60 scrollbar-none">
        {stages.map((st) => {
          const isActive = currentStage === st.id;
          return (
            <button
              key={st.id}
              onClick={() => {
                sound.playClick();
                onSelectStage(st.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                isActive
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                  : "text-slate-400 bg-slate-900/60 border border-slate-800"
              }`}
            >
              {st.icon}
              <span>{st.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
