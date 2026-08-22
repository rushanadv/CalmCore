import React, { useState } from "react";
import { motion } from "motion/react";
import { CrisisCategory } from "../types";
import { sound } from "../utils/audioSynth";
import { Heart, DollarSign, Users, Activity, ArrowRight, Sparkles, Shield, CheckCircle2 } from "lucide-react";

interface CrisisTriageProps {
  selectedCategory: CrisisCategory | null;
  onSelectCategory: (category: CrisisCategory) => void;
  onProceedToMicroActions: (category: CrisisCategory) => void;
  onProceedToBrainDump: (category: CrisisCategory) => void;
}

interface CategoryCardInfo {
  id: CrisisCategory;
  title: string;
  subtitle: string;
  examples: string;
  icon: React.ReactNode;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
  instantTip: string;
}

const CATEGORIES: CategoryCardInfo[] = [
  {
    id: "Emotional",
    title: "Emotional Overwhelm",
    subtitle: "Panic attacks, spiraling thoughts, severe crying, numbness, or sensory overload.",
    examples: "Racing heart • Can't think straight • Amygdala hijack",
    icon: <Heart className="w-6 h-6" />,
    accentBorder: "border-teal-500/50 hover:border-teal-400",
    badgeBg: "bg-teal-500/20",
    badgeText: "text-teal-300",
    instantTip: "Splash cold water on your wrists or face to stimulate the vagus nerve and slow your heart rate.",
  },
  {
    id: "Financial",
    title: "Financial Shock",
    subtitle: "Sudden unexpected expense, job loss, rent anxiety, or urgent bill dread.",
    examples: "Scarcity panic • Urgent deadline • Freezing on bills",
    icon: <DollarSign className="w-6 h-6" />,
    accentBorder: "border-amber-500/50 hover:border-amber-400",
    badgeBg: "bg-amber-500/20",
    badgeText: "text-amber-300",
    instantTip: "Freeze all decisions for 60 minutes. No bank calls or frantic calculations while in fight-or-flight.",
  },
  {
    id: "Relational",
    title: "Relational Conflict",
    subtitle: "Intense arguments, breakup, boundary breach, feeling rejected, or severe loneliness.",
    examples: "Fight with partner • Toxic message • Dread of confrontation",
    icon: <Users className="w-6 h-6" />,
    accentBorder: "border-indigo-500/50 hover:border-indigo-400",
    badgeBg: "bg-indigo-500/20",
    badgeText: "text-indigo-300",
    instantTip: "Put your phone face down in another room. Do not send any impulsive reactive messages right now.",
  },
  {
    id: "Health",
    title: "Health & Somatic Panic",
    subtitle: "Physical distress sensations, health anxiety, shortness of breath, or exhaustion.",
    examples: "Chest tightness • Hyperventilating • Dizzy from adrenaline",
    icon: <Activity className="w-6 h-6" />,
    accentBorder: "border-rose-500/50 hover:border-rose-400",
    badgeBg: "bg-rose-500/20",
    badgeText: "text-rose-300",
    instantTip: "Sit upright, press your back firmly against the chair, and take small sips of water.",
  },
];

export const CrisisTriage: React.FC<CrisisTriageProps> = ({
  selectedCategory,
  onSelectCategory,
  onProceedToMicroActions,
  onProceedToBrainDump,
}) => {
  const [activeCat, setActiveCat] = useState<CrisisCategory>(selectedCategory || "Emotional");

  const handlePickCategory = (cat: CrisisCategory) => {
    sound.playClick();
    setActiveCat(cat);
    onSelectCategory(cat);
  };

  const currentInfo = CATEGORIES.find((c) => c.id === activeCat) || CATEGORIES[0];

  return (
    <div id="crisis-triage-container" className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center">
      {/* Top Reassurance Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-4"
      >
        <Shield className="w-3.5 h-3.5" />
        <span>Step 3 of 4: Crisis Triage (20-40s)</span>
      </motion.div>

      {/* Main Headline */}
      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-center font-display mb-1">
        Name the weight you are carrying.
      </h2>
      <p className="text-sm text-slate-300 text-center max-w-lg mb-6 sm:mb-8">
        Labeling your distress engages the prefrontal cortex and immediately cuts panic intensity.
      </p>

      {/* 4 Large, High-Legibility Triage Buttons */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
        {CATEGORIES.map((cat) => {
          const isSelected = activeCat === cat.id;
          return (
            <button
              key={cat.id}
              id={`triage-card-${cat.id.toLowerCase()}`}
              onClick={() => handlePickCategory(cat.id)}
              className={`flex flex-col text-left p-5 rounded-2xl border transition-all relative ${
                isSelected
                  ? `bg-slate-800/90 border-2 ${cat.accentBorder} shadow-lg ring-1 ring-teal-500/20`
                  : "bg-slate-900/80 border-slate-800 hover:bg-slate-850 hover:border-slate-700"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.badgeBg} ${cat.badgeText}`}
                  >
                    {cat.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-display">{cat.title}</h3>
                </div>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Subtitle & Examples */}
              <p className="text-xs sm:text-sm text-slate-300 mb-2 leading-relaxed">{cat.subtitle}</p>
              <span className="text-[11px] text-slate-300 font-mono tracking-tight">{cat.examples}</span>
            </button>
          );
        })}
      </div>

      {/* Instant Somatic Prescription Card for Selected Category */}
      <motion.div
        key={activeCat}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-8 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider text-teal-300">
              Immediate Micro-Grounding for {currentInfo.title}
            </h4>
            <p className="text-sm sm:text-base text-slate-200 mt-1 font-medium leading-relaxed">
              {currentInfo.instantTip}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Path Transitions */}
      <div className="w-full max-w-lg flex flex-col sm:flex-row items-center gap-3">
        <button
          id="triage-proceed-microactions-btn"
          onClick={() => {
            sound.playClick();
            onProceedToMicroActions(activeCat);
          }}
          className="w-full py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <span>Step 4: Get Single Micro-Step</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          id="triage-proceed-braindump-btn"
          onClick={() => {
            sound.playClick();
            onProceedToBrainDump(activeCat);
          }}
          className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Dump Chaotic Thoughts</span>
        </button>
      </div>
    </div>
  );
};
