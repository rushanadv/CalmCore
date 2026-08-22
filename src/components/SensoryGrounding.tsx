import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SensoryStageData } from "../types";
import { sound } from "../utils/audioSynth";
import { Eye, Hand, Volume2, Sparkles, Check, ArrowRight, ArrowLeft, RefreshCw, Compass } from "lucide-react";

interface SensoryGroundingProps {
  onProceedToTriage: () => void;
  onBackToBreathing: () => void;
  onJumpToBrainDump: () => void;
}

const SENSORY_STAGES: SensoryStageData[] = [
  {
    count: 5,
    sense: "see",
    title: "5 Things You Can SEE",
    prompt: "Look around you right now. Notice 5 distinct visual objects or colors.",
    iconName: "Eye",
    examples: ["A spot on the wall", "A light source", "Your hands", "A corner of the room", "A color you like"],
  },
  {
    count: 4,
    sense: "feel",
    title: "4 Things You Can FEEL",
    prompt: "Bring your awareness to physical tactile sensations on your body.",
    iconName: "Hand",
    examples: ["Feet flat on the ground", "Texture of your clothing", "Back supported by your chair", "Temperature of the air"],
  },
  {
    count: 3,
    sense: "hear",
    title: "3 Things You Can HEAR",
    prompt: "Listen past your internal thoughts to the subtle sounds around you.",
    iconName: "Volume2",
    examples: ["Distant traffic / hum", "Air circulation / breeze", "The rhythm of your breath"],
  },
  {
    count: 2,
    sense: "smell",
    title: "2 Things You Can SMELL",
    prompt: "Inhale gently. Notice two scents in the air, or recall two comforting smells.",
    iconName: "Wind",
    examples: ["Fresh air / room scent", "Coffee / fabric soap"],
  },
  {
    count: 1,
    sense: "taste",
    title: "1 Thing You Can TASTE (or 1 Grounding Truth)",
    prompt: "Notice the taste in your mouth, or anchor yourself in this undeniable physical truth:",
    iconName: "Sparkles",
    examples: ["I am safe in this room right now. This adrenaline wave is already passing."],
  },
];

export const SensoryGrounding: React.FC<SensoryGroundingProps> = ({
  onProceedToTriage,
  onBackToBreathing,
  onJumpToBrainDump,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean[]>>({
    5: [false, false, false, false, false],
    4: [false, false, false, false],
    3: [false, false, false],
    2: [false, false],
    1: [false],
  });

  const stage = SENSORY_STAGES[currentStageIndex];
  const stageChecks = checkedItems[stage.count] || [];
  const isStageFullyChecked = stageChecks.every(Boolean);
  const isFinalStage = currentStageIndex === SENSORY_STAGES.length - 1;

  const handleToggleItem = (index: number) => {
    sound.playClick();
    const updated = [...stageChecks];
    updated[index] = !updated[index];

    setCheckedItems({
      ...checkedItems,
      [stage.count]: updated,
    });

    // If this completes the stage, play a harmonic bowl chime
    if (updated.every(Boolean)) {
      sound.playBowlChime(432 + currentStageIndex * 24, 1.2);
    }
  };

  const handleQuickCompleteStage = () => {
    sound.playBowlChime(480, 1.2);
    const completed = new Array(stage.count).fill(true);
    setCheckedItems({
      ...checkedItems,
      [stage.count]: completed,
    });

    if (!isFinalStage) {
      setTimeout(() => {
        setCurrentStageIndex((prev) => prev + 1);
      }, 350);
    }
  };

  const handleNextStage = () => {
    sound.playClick();
    if (!isFinalStage) {
      setCurrentStageIndex((prev) => prev + 1);
    } else {
      onProceedToTriage();
    }
  };

  const handlePrevStage = () => {
    sound.playClick();
    if (currentStageIndex > 0) {
      setCurrentStageIndex((prev) => prev - 1);
    } else {
      onBackToBreathing();
    }
  };

  const handleResetSensory = () => {
    sound.playClick();
    setCheckedItems({
      5: [false, false, false, false, false],
      4: [false, false, false, false],
      3: [false, false, false],
      2: [false, false],
      1: [false],
    });
    setCurrentStageIndex(0);
  };

  // Render the icon
  const getStageIcon = () => {
    switch (stage.sense) {
      case "see":
        return <Eye className="w-6 h-6 text-teal-400" />;
      case "feel":
        return <Hand className="w-6 h-6 text-cyan-400" />;
      case "hear":
        return <Volume2 className="w-6 h-6 text-sky-400" />;
      case "smell":
        return <Sparkles className="w-6 h-6 text-indigo-400" />;
      case "taste":
        return <Sparkles className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <div id="sensory-grounding-container" className="w-full max-w-3xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center">
      {/* Top Reassurance Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-4"
      >
        <span>Step 2 of 4: 5-4-3-2-1 Sensory Anchoring (10-20s)</span>
      </motion.div>

      {/* Main Headline */}
      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-center font-display mb-1">
        Anchor into the physical room.
      </h2>
      <p className="text-sm text-slate-300 text-center max-w-md mb-6">
        Panic lives in the future; your senses live only right now. Tap each anchor as you notice it.
      </p>

      {/* Progress Track (5 -> 4 -> 3 -> 2 -> 1) */}
      <div className="w-full max-w-md grid grid-cols-5 gap-2 mb-6">
        {SENSORY_STAGES.map((s, idx) => {
          const isComplete = (checkedItems[s.count] || []).every(Boolean);
          const isCurrent = idx === currentStageIndex;
          return (
            <button
              key={s.count}
              id={`sensory-step-tab-${s.count}`}
              onClick={() => {
                sound.playClick();
                setCurrentStageIndex(idx);
              }}
              className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                isCurrent
                  ? "bg-slate-800 border-teal-400 text-white shadow-[0_0_12px_rgba(45,212,191,0.2)]"
                  : isComplete
                  ? "bg-teal-950/40 border-teal-500/30 text-teal-300"
                  : "bg-slate-900/60 border-slate-800 text-slate-300 hover:text-slate-200"
              }`}
            >
              <span className="text-base font-bold font-mono">{s.count}</span>
              <span className="text-[10px] uppercase font-semibold mt-0.5">
                {s.sense}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Active Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage.count}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl mb-6 relative overflow-hidden"
        >
          {/* Subtle decorative glow */}
          <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              {getStageIcon()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-display flex items-center gap-2">
                <span>{stage.title}</span>
                {isStageFullyChecked && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Anchored
                  </span>
                )}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{stage.prompt}</p>
            </div>
          </div>

          {/* Interactive Checkable Chips */}
          <div className="space-y-2.5 my-5">
            {stage.examples.map((ex, idx) => {
              const isChecked = stageChecks[idx] || false;
              return (
                <button
                  key={idx}
                  id={`sensory-item-${stage.count}-${idx}`}
                  onClick={() => handleToggleItem(idx)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                    isChecked
                      ? "bg-teal-950/40 border-teal-500/60 text-teal-100 shadow-sm"
                      : "bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-3 pr-2">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        isChecked
                          ? "bg-teal-500 border-teal-400 text-slate-950"
                          : "border-slate-600 bg-slate-900 text-transparent"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className={`text-sm ${isChecked ? "font-medium" : "text-slate-300"}`}>{ex}</span>
                  </div>
                  <span className="text-xs text-slate-300 font-mono shrink-0">
                    {idx + 1} of {stage.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick One-Tap Stage Complete Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            <button
              id="sensory-quick-mark-btn"
              onClick={handleQuickCompleteStage}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>I've noticed all {stage.count} (Tap to complete)</span>
            </button>

            <button
              id="sensory-reset-all-btn"
              onClick={handleResetSensory}
              className="text-xs text-slate-300 hover:text-slate-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset 5-4-3-2-1
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="w-full max-w-md flex items-center justify-between gap-3">
        <button
          id="sensory-prev-btn"
          onClick={handlePrevStage}
          className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStageIndex === 0 ? "Breathing" : "Previous Sense"}</span>
        </button>

        {!isFinalStage ? (
          <button
            id="sensory-next-btn"
            onClick={handleNextStage}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md active:scale-98"
          >
            <span>Next ({SENSORY_STAGES[currentStageIndex + 1].count})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="sensory-proceed-triage-btn"
            onClick={() => {
              sound.playClick();
              onProceedToTriage();
            }}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-teal-900/30"
          >
            <span>Step 3: Crisis Triage</span>
            <Compass className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
