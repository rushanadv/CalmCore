import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CrisisCategory, MicroAction } from "../types";
import { sound } from "../utils/audioSynth";
import { CheckCircle2, Circle, Clock, ArrowRight, RotateCcw, Sparkles, Shield, HeartHandshake, Play, Pause } from "lucide-react";

interface MicroActionTreeProps {
  category: CrisisCategory;
  customActions?: MicroAction[];
  immediateMicroStep?: string;
  onJumpToBrainDump: () => void;
  onRestartFlow: () => void;
}

const DEFAULT_ACTIONS: Record<CrisisCategory, { microStep: string; actions: MicroAction[] }> = {
  Emotional: {
    microStep: "Drink 3 slow sips of cool water and uncross your legs.",
    actions: [
      {
        stepNumber: 1,
        title: "Cold Water Shock",
        description: "Splash cool water on your face or hold an ice cube for 15 seconds to reset your vagus nerve.",
        timeEstimate: "30 seconds",
        completed: false,
      },
      {
        stepNumber: 2,
        title: "Name 3 Solid Objects",
        description: "Look around your space and gently whisper the names of 3 non-threatening objects.",
        timeEstimate: "45 seconds",
        completed: false,
      },
      {
        stepNumber: 3,
        title: "5-Minute Permission Slip",
        description: "Give yourself permission to do absolutely nothing productive for the next 5 minutes.",
        timeEstimate: "5 minutes",
        completed: false,
      },
    ],
  },
  Financial: {
    microStep: "Close all banking apps and write down only the single most urgent date.",
    actions: [
      {
        stepNumber: 1,
        title: "Pause Impulse Actions",
        description: "Freeze all decisions right now. Do not send angry messages or make panic purchases.",
        timeEstimate: "1 minute",
        completed: false,
      },
      {
        stepNumber: 2,
        title: "Isolate Single Top Priority",
        description: "Identify only ONE bill or obligation due within the next 48 hours. Ignore the rest.",
        timeEstimate: "2 minutes",
        completed: false,
      },
      {
        stepNumber: 3,
        title: "Set a Calm Discussion Window",
        description: "Schedule a 15-minute block tomorrow morning when your cortisol is low to address it.",
        timeEstimate: "1 minute",
        completed: false,
      },
    ],
  },
  Relational: {
    microStep: "Put your phone in another room and step outside or by an open window.",
    actions: [
      {
        stepNumber: 1,
        title: "Cooling Circuit-Breaker",
        description: "Put the device face down. Do not respond while your pulse is elevated.",
        timeEstimate: "2 minutes",
        completed: false,
      },
      {
        stepNumber: 2,
        title: "Physical Tension Release",
        description: "Roll your shoulders back 5 times, unclench your teeth, and shake out your hands.",
        timeEstimate: "45 seconds",
        completed: false,
      },
      {
        stepNumber: 3,
        title: "Private Safe Draft",
        description: "If you feel a desperate urge to say something, write it only in a private notepad, not a text.",
        timeEstimate: "3 minutes",
        completed: false,
      },
    ],
  },
  Health: {
    microStep: "Place one hand on your belly, one on your chest, and feel your heart rate settle.",
    actions: [
      {
        stepNumber: 1,
        title: "Somatic Reassurance",
        description: "Remind yourself: 'Adrenaline causes uncomfortable bodily sensations, but adrenaline is not dangerous.'",
        timeEstimate: "30 seconds",
        completed: false,
      },
      {
        stepNumber: 2,
        title: "Gentle Hydration",
        description: "Take small sips of water. Feel the cool sensation traveling down your throat.",
        timeEstimate: "1 minute",
        completed: false,
      },
      {
        stepNumber: 3,
        title: "Resting Posture",
        description: "Sit back with your spine supported and your feet resting flat on the floor.",
        timeEstimate: "2 minutes",
        completed: false,
      },
    ],
  },
};

export const MicroActionTree: React.FC<MicroActionTreeProps> = ({
  category,
  customActions,
  immediateMicroStep,
  onJumpToBrainDump,
  onRestartFlow,
}) => {
  const fallback = DEFAULT_ACTIONS[category] || DEFAULT_ACTIONS.Emotional;
  const initialActions = customActions && customActions.length > 0 ? customActions : fallback.actions;
  const topStep = immediateMicroStep || fallback.microStep;

  const [actions, setActions] = useState<MicroAction[]>(initialActions);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Sync actions if props change
  useEffect(() => {
    if (customActions && customActions.length > 0) {
      setActions(customActions);
    }
  }, [customActions]);

  // Focus timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      sound.playBowlChime(528, 2.0);
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const handleToggleComplete = (index: number) => {
    sound.playClick();
    const updated = [...actions];
    const nextState = !updated[index].completed;
    updated[index].completed = nextState;
    setActions(updated);

    if (nextState) {
      sound.playBowlChime(432 + index * 40, 1.2);
      if (index < actions.length - 1) {
        setActiveStepIndex(index + 1);
      }
    }
  };

  const handleStartTimer = (seconds: number = 60) => {
    sound.playClick();
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  const allCompleted = actions.every((a) => a.completed);

  return (
    <div id="micro-actions-container" className="w-full max-w-3xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center">
      {/* Top Reassurance Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-4"
      >
        <Shield className="w-3.5 h-3.5" />
        <span>Step 4 of 4: Micro-Action De-escalation (40-60s)</span>
      </motion.div>

      {/* Main Headline */}
      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-center font-display mb-1">
        Break the freeze response.
      </h2>
      <p className="text-sm text-slate-300 text-center max-w-md mb-6">
        Do not try to climb the mountain. Just take the single, easiest micro-step below.
      </p>

      {/* The Single Immediate Micro-Step Banner */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-gradient-to-r from-teal-950/70 via-slate-900 to-teal-950/70 border-2 border-teal-500/50 rounded-2xl p-5 sm:p-6 shadow-xl mb-6 text-center relative overflow-hidden"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2 border border-teal-500/30">
          <Sparkles className="w-3.5 h-3.5" /> Just this ONE thing right now:
        </div>
        <p className="text-lg sm:text-xl font-bold text-white font-display max-w-xl mx-auto leading-snug">
          "{topStep}"
        </p>
      </motion.div>

      {/* 3-Step Micro-Action Tree List */}
      <div className="w-full space-y-3.5 mb-6">
        {actions.map((act, idx) => {
          const isCurrent = idx === activeStepIndex;
          const isDone = !!act.completed;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`w-full rounded-2xl p-4 sm:p-5 border transition-all ${
                isDone
                  ? "bg-slate-900/60 border-emerald-500/40 text-slate-300"
                  : isCurrent
                  ? "bg-slate-800/90 border-teal-400 shadow-md ring-1 ring-teal-500/20"
                  : "bg-slate-900/80 border-slate-800 text-slate-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <button
                    id={`action-checkbox-${idx}`}
                    onClick={() => handleToggleComplete(idx)}
                    className="mt-0.5 shrink-0 transition-transform active:scale-90"
                    aria-label={`Mark step ${idx + 1} completed`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-500 hover:text-teal-400" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-teal-400">Action {idx + 1}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> {act.timeEstimate}
                      </span>
                    </div>

                    <h3 className={`text-base sm:text-lg font-bold mt-1 font-display ${isDone ? "line-through text-slate-400" : "text-white"}`}>
                      {act.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>

                {/* Micro Action Button */}
                <button
                  id={`action-toggle-btn-${idx}`}
                  onClick={() => handleToggleComplete(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                    isDone
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-teal-600 hover:bg-teal-500 text-slate-950"
                  }`}
                >
                  {isDone ? "Completed" : "Mark Done"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Micro Focus Timer */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">60-Second Micro-Focus Timer</h4>
            <p className="text-xs text-slate-400">Give yourself just 60 seconds to do the step above without pressure.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-black font-mono text-teal-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
            {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, "0")}
          </span>

          <button
            id="micro-timer-toggle-btn"
            onClick={() => {
              if (isTimerRunning) {
                setIsTimerRunning(false);
              } else {
                handleStartTimer(timerSeconds || 60);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-teal-400" />}
            <span>{isTimerRunning ? "Pause" : "Start 60s"}</span>
          </button>

          <button
            id="micro-timer-reset-btn"
            onClick={() => {
              sound.playClick();
              setIsTimerRunning(false);
              setTimerSeconds(60);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Reset timer"
            aria-label="Reset focus timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Completion Celebratory Banner */}
      <AnimatePresence>
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-5 mb-8 text-center"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-display">You broke through the freeze response.</h3>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-md mx-auto">
              Your nervous system is already recalibrating. Be gentle with yourself for the rest of the day.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Actions */}
      <div className="w-full max-w-md flex flex-col sm:flex-row items-center gap-3">
        <button
          id="actions-restart-flow-btn"
          onClick={() => {
            sound.playClick();
            onRestartFlow();
          }}
          className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
          <span>Breathe Again (Step 1)</span>
        </button>

        <button
          id="actions-to-braindump-btn"
          onClick={() => {
            sound.playClick();
            onJumpToBrainDump();
          }}
          className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Brain Dump Canvas</span>
        </button>
      </div>
    </div>
  );
};
