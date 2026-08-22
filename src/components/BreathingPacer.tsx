import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BreathingTechnique, BreathingPhase, BreathingPatternConfig } from "../types";
import { sound } from "../utils/audioSynth";
import { Play, Pause, RotateCcw, ArrowRight, Sparkles, Check, Heart, Shield } from "lucide-react";

interface BreathingPacerProps {
  onProceedToSensory: () => void;
  onJumpToTriage: () => void;
  onJumpToBrainDump: () => void;
}

const TECHNIQUES: Record<BreathingTechnique, BreathingPatternConfig> = {
  "4-7-8": {
    name: "4-7-8 Technique",
    technique: "4-7-8",
    description: "Rapidly activates the parasympathetic nervous system to break panic and acute anxiety.",
    inhaleSeconds: 4,
    holdSeconds: 7,
    exhaleSeconds: 8,
    holdEmptySeconds: 0,
    totalCycleSeconds: 19,
  },
  box: {
    name: "Box Breathing",
    technique: "box",
    description: "4-4-4-4 rhythmic pacing used by first responders to stabilize racing thoughts.",
    inhaleSeconds: 4,
    holdSeconds: 4,
    exhaleSeconds: 4,
    holdEmptySeconds: 4,
    totalCycleSeconds: 16,
  },
  resonance: {
    name: "Resonance Coherence",
    technique: "resonance",
    description: "5.5s in and 5.5s out to align heart rate variability and blood pressure.",
    inhaleSeconds: 5.5,
    holdSeconds: 0,
    exhaleSeconds: 5.5,
    holdEmptySeconds: 0,
    totalCycleSeconds: 11,
  },
  "sos-sigh": {
    name: "Physiological Sigh",
    technique: "sos-sigh",
    description: "Double inhale through nose followed by long slow sigh to pop open collapsed alveoli.",
    inhaleSeconds: 3,
    holdSeconds: 1.5,
    exhaleSeconds: 6,
    holdEmptySeconds: 0,
    totalCycleSeconds: 10.5,
  },
};

export const BreathingPacer: React.FC<BreathingPacerProps> = ({
  onProceedToSensory,
  onJumpToTriage,
  onJumpToBrainDump,
}) => {
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique>("4-7-8");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [phase, setPhase] = useState<BreathingPhase>("inhale");
  const [secondsRemainingInPhase, setSecondsRemainingInPhase] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [targetCycles] = useState<number>(4);

  const currentConfig = TECHNIQUES[selectedTechnique];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and tick the breathing loop
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Play initial chime on start
    sound.playBreathCue(phase);

    timerRef.current = setInterval(() => {
      setSecondsRemainingInPhase((prev) => {
        if (prev <= 1) {
          // Transition to next phase
          let nextPhase: BreathingPhase = "inhale";
          let nextSeconds = currentConfig.inhaleSeconds;

          if (phase === "inhale") {
            if (currentConfig.holdSeconds > 0) {
              nextPhase = "hold";
              nextSeconds = currentConfig.holdSeconds;
            } else {
              nextPhase = "exhale";
              nextSeconds = currentConfig.exhaleSeconds;
            }
          } else if (phase === "hold") {
            nextPhase = "exhale";
            nextSeconds = currentConfig.exhaleSeconds;
          } else if (phase === "exhale") {
            if (currentConfig.holdEmptySeconds > 0) {
              nextPhase = "hold_empty";
              nextSeconds = currentConfig.holdEmptySeconds;
            } else {
              nextPhase = "inhale";
              nextSeconds = currentConfig.inhaleSeconds;
              setCompletedCycles((c) => c + 1);
            }
          } else if (phase === "hold_empty") {
            nextPhase = "inhale";
            nextSeconds = currentConfig.inhaleSeconds;
            setCompletedCycles((c) => c + 1);
          }

          setPhase(nextPhase);
          sound.playBreathCue(nextPhase);
          return Math.ceil(nextSeconds);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase, selectedTechnique, currentConfig]);

  const handleReset = () => {
    sound.playClick();
    setPhase("inhale");
    setSecondsRemainingInPhase(currentConfig.inhaleSeconds);
    setCompletedCycles(0);
    setIsActive(true);
  };

  const handleSelectTechnique = (tech: BreathingTechnique) => {
    sound.playClick();
    setSelectedTechnique(tech);
    setPhase("inhale");
    setSecondsRemainingInPhase(TECHNIQUES[tech].inhaleSeconds);
    setCompletedCycles(0);
    setIsActive(true);
  };

  // Guidance texts per phase
  const getPhaseInstruction = () => {
    switch (phase) {
      case "inhale":
        return {
          title: "Inhale Slowly",
          subtitle: "Breathe quietly in through your nose into your belly",
          color: "text-teal-300",
          ringColor: "border-teal-400",
          scaleTarget: 1.25,
        };
      case "hold":
        return {
          title: "Hold Stillness",
          subtitle: "Gently rest at the top. Soften your jaw and neck",
          color: "text-cyan-300",
          ringColor: "border-cyan-400",
          scaleTarget: 1.25,
        };
      case "exhale":
        return {
          title: "Exhale Completely",
          subtitle: "Release slowly through your mouth with a soft whoosh",
          color: "text-sky-300",
          ringColor: "border-sky-400",
          scaleTarget: 0.85,
        };
      case "hold_empty":
        return {
          title: "Rest Empty",
          subtitle: "Natural pause before the next wave begins",
          color: "text-indigo-300",
          ringColor: "border-indigo-400",
          scaleTarget: 0.85,
        };
    }
  };

  const instruction = getPhaseInstruction();

  return (
    <div id="breathing-pacer-container" className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center">
      {/* Top Reassurance Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-medium mb-4"
      >
        <Shield className="w-3.5 h-3.5 text-teal-400" />
        <span>Step 1 of 4: Immediate Somatic Grounding (0-3s)</span>
      </motion.div>

      {/* Primary Headline */}
      <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight text-center font-display mb-2">
        Let your body breathe.
      </h1>
      <p className="text-sm sm:text-base text-slate-300 text-center max-w-lg mb-6 sm:mb-8">
        Follow the pulsing circle. You do not have to fix everything right now — just let your nervous system catch up.
      </p>

      {/* Main Breathing Circle Stage */}
      <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center my-2">
        {/* Background ambient rings */}
        <div className="absolute inset-0 rounded-full border border-slate-800/80 pointer-events-none" />
        <div className="absolute inset-4 rounded-full border border-slate-800/50 pointer-events-none" />

        {/* Pulsing Breathing Ring */}
        <motion.div
          animate={{
            scale: phase === "inhale" || phase === "hold" ? 1.2 : 0.82,
            opacity: phase === "hold" ? 0.95 : 0.75,
          }}
          transition={{
            duration:
              phase === "inhale"
                ? currentConfig.inhaleSeconds
                : phase === "hold"
                ? 0.3
                : phase === "exhale"
                ? currentConfig.exhaleSeconds
                : currentConfig.holdEmptySeconds,
            ease: phase === "inhale" || phase === "exhale" ? "easeInOut" : "linear",
          }}
          className="absolute w-56 h-56 sm:w-68 sm:h-68 rounded-full bg-gradient-to-tr from-teal-500/20 via-cyan-500/15 to-sky-500/20 border-2 border-teal-400/40 shadow-[0_0_60px_rgba(20,184,166,0.25)] flex items-center justify-center"
        >
          {/* Inner core circle */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-slate-900/90 border border-teal-500/30 flex flex-col items-center justify-center p-4 text-center shadow-inner relative z-10">
            {/* Phase Title */}
            <span className={`text-xs sm:text-sm font-bold uppercase tracking-widest ${instruction.color} mb-1`}>
              {instruction.title}
            </span>

            {/* Countdown seconds */}
            <AnimatePresence mode="wait">
              <motion.span
                key={`${phase}-${secondsRemainingInPhase}`}
                initial={{ opacity: 0.4, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.4, scale: 1.15 }}
                transition={{ duration: 0.3 }}
                className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight my-0.5"
              >
                {secondsRemainingInPhase}
              </motion.span>
            </AnimatePresence>

            {/* Micro instruction */}
            <span className="text-[11px] text-slate-300 line-clamp-2 px-2 mt-1">
              {phase === "inhale" ? "Inhale belly" : phase === "hold" ? "Hold softly" : "Slow exhale"}
            </span>
          </div>
        </motion.div>

        {/* Orbiting particle indicators */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: currentConfig.totalCycleSeconds, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
        >
          <div className="w-full h-full relative">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_12px_#2dd4bf]" />
          </div>
        </motion.div>
      </div>

      {/* Subtitle guidance */}
      <div className="text-center mt-3 mb-6 min-h-[44px] flex items-center justify-center px-4">
        <p className="text-sm sm:text-base text-teal-200/90 font-medium max-w-md animate-fade-in">
          {instruction.subtitle}
        </p>
      </div>

      {/* Breathing Controls & Cycle Tracker */}
      <div className="flex items-center gap-3 mb-6">
        <button
          id="breathing-toggle-play-btn"
          onClick={() => {
            sound.playClick();
            setIsActive(!isActive);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
        >
          {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-teal-400" />}
          <span>{isActive ? "Pause Rhythm" : "Resume"}</span>
        </button>

        <button
          id="breathing-reset-btn"
          onClick={handleReset}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          title="Reset cycle counter"
          aria-label="Reset breathing pacer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Cycle Progress Pill */}
        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span>
            Cycle <strong className="text-white">{completedCycles}</strong> of {targetCycles}
          </span>
          {completedCycles >= targetCycles && (
            <span className="ml-1 text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
              <Check className="w-2.5 h-2.5" /> Calmed
            </span>
          )}
        </div>
      </div>

      {/* Technique Preset Selectors */}
      <div className="w-full max-w-xl bg-slate-950/60 p-2 rounded-2xl border border-slate-800/80 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {(Object.keys(TECHNIQUES) as BreathingTechnique[]).map((key) => {
            const tech = TECHNIQUES[key];
            const isSel = selectedTechnique === key;
            return (
              <button
                key={key}
                id={`breathing-technique-btn-${key}`}
                onClick={() => handleSelectTechnique(key)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all ${
                  isSel
                    ? "bg-slate-800 text-teal-300 border border-teal-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <span className="text-xs font-bold">{tech.name}</span>
                <span className="text-[10px] text-slate-300 mt-0.5">
                  {key === "4-7-8"
                    ? "4-7-8s"
                    : key === "box"
                    ? "4-4-4-4s"
                    : key === "resonance"
                    ? "5.5s-5.5s"
                    : "Double Inhale"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Action Transitions */}
      <div className="w-full max-w-md flex flex-col sm:flex-row items-center gap-3">
        <button
          id="proceed-to-sensory-btn"
          onClick={() => {
            sound.playClick();
            onProceedToSensory();
          }}
          className="w-full py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Step 2: 5-4-3-2-1 Sensory Grounding</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          id="jump-to-braindump-btn"
          onClick={() => {
            sound.playClick();
            onJumpToBrainDump();
          }}
          className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Brain Dump</span>
        </button>
      </div>
    </div>
  );
};
