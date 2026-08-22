/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FlowStage, CrisisCategory, DeEscalationResult } from "./types";
import { Navbar } from "./components/Navbar";
import { BreathingPacer } from "./components/BreathingPacer";
import { SensoryGrounding } from "./components/SensoryGrounding";
import { CrisisTriage } from "./components/CrisisTriage";
import { MicroActionTree } from "./components/MicroActionTree";
import { BrainDumpCanvas } from "./components/BrainDumpCanvas";
import { EmergencyModal } from "./components/EmergencyModal";
import { Shield, Sparkles, Heart, Phone, Info } from "lucide-react";
import { sound } from "./utils/audioSynth";

export default function App() {
  const [currentStage, setCurrentStage] = useState<FlowStage>("breathing");
  const [selectedCategory, setSelectedCategory] = useState<CrisisCategory>("Emotional");
  const [customDeEscalation, setCustomDeEscalation] = useState<DeEscalationResult | null>(null);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);

  const handleSelectStage = (stage: FlowStage) => {
    sound.playClick();
    setCurrentStage(stage);
  };

  const handleProceedToSensory = () => {
    setCurrentStage("sensory");
  };

  const handleProceedToTriage = () => {
    setCurrentStage("triage");
  };

  const handleProceedToMicroActions = (cat: CrisisCategory) => {
    setSelectedCategory(cat);
    setCurrentStage("actions");
  };

  const handleProceedToBrainDump = (cat?: CrisisCategory) => {
    if (cat) setSelectedCategory(cat);
    setCurrentStage("braindump");
  };

  const handleApplyAIResult = (result: DeEscalationResult) => {
    setCustomDeEscalation(result);
    if (
      result.distressCategory === "Financial" ||
      result.distressCategory === "Relational" ||
      result.distressCategory === "Health" ||
      result.distressCategory === "Emotional"
    ) {
      setSelectedCategory(result.distressCategory as CrisisCategory);
    }
    setCurrentStage("actions");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-slate-950 font-sans">
      {/* Top Serene Header */}
      <Navbar
        currentStage={currentStage}
        onSelectStage={handleSelectStage}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Main Dynamic Stage View */}
      <main className="flex-1 flex flex-col justify-center py-4 sm:py-8 px-2 sm:px-4">
        <AnimatePresence mode="wait">
          {currentStage === "breathing" && (
            <motion.div
              key="breathing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <BreathingPacer
                onProceedToSensory={handleProceedToSensory}
                onJumpToTriage={handleProceedToTriage}
                onJumpToBrainDump={() => handleProceedToBrainDump()}
              />
            </motion.div>
          )}

          {currentStage === "sensory" && (
            <motion.div
              key="sensory"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <SensoryGrounding
                onProceedToTriage={handleProceedToTriage}
                onBackToBreathing={() => setCurrentStage("breathing")}
                onJumpToBrainDump={() => handleProceedToBrainDump()}
              />
            </motion.div>
          )}

          {currentStage === "triage" && (
            <motion.div
              key="triage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <CrisisTriage
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
                onProceedToMicroActions={handleProceedToMicroActions}
                onProceedToBrainDump={handleProceedToBrainDump}
              />
            </motion.div>
          )}

          {currentStage === "actions" && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <MicroActionTree
                category={selectedCategory}
                customActions={customDeEscalation?.threeMicroActions}
                immediateMicroStep={customDeEscalation?.immediateMicroStep}
                onJumpToBrainDump={() => handleProceedToBrainDump(selectedCategory)}
                onRestartFlow={() => setCurrentStage("breathing")}
              />
            </motion.div>
          )}

          {currentStage === "braindump" && (
            <motion.div
              key="braindump"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <BrainDumpCanvas
                initialCategory={selectedCategory}
                onApplyActionsToFlow={handleApplyAIResult}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Reassuring, Distraction-Free Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span className="text-slate-300">CalmCore • Zero-login emergency clarity tool</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => {
                sound.playClick();
                setIsEmergencyOpen(true);
              }}
              className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              <span>988 Lifeline (Free & 24/7)</span>
            </button>

            <span className="text-slate-400">•</span>
            <span className="text-slate-300">Private & Local (No data saved)</span>
          </div>
        </div>
      </footer>

      {/* Emergency Lifeline Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />
    </div>
  );
}
