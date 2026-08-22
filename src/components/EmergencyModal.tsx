import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, MessageSquare, HeartHandshake, ShieldAlert, X, ExternalLink, Globe } from "lucide-react";
import { sound } from "../utils/audioSynth";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div id="emergency-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            id="emergency-modal-content"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-xl bg-slate-900 border border-rose-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              id="emergency-modal-close-btn"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close emergency modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display">Immediate Support Lifelines</h2>
                <p className="text-sm text-slate-300">Free, confidential, and available 24/7. You don't have to carry this alone.</p>
              </div>
            </div>

            {/* Grounding Reminder Banner */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 mb-6">
              <p className="text-sm text-teal-300 font-medium">
                🌊 Right this second: Keep your feet flat on the floor, drop your shoulders, and know that you are safe in this physical moment.
              </p>
            </div>

            {/* Hotline Cards */}
            <div className="space-y-3">
              {/* 988 Suicide & Crisis Lifeline */}
              <div className="bg-slate-800/90 border border-slate-700 hover:border-teal-500/50 rounded-xl p-4 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Primary 24/7 Lifeline (US & Canada)
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">988 Suicide & Crisis Lifeline</h3>
                    <p className="text-xs text-slate-300 mt-0.5">Free support for anyone experiencing distress, panic, or suicidal thoughts.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      id="emergency-call-988-btn"
                      href="tel:988"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors shadow-sm"
                    >
                      <Phone className="w-4 h-4" /> Call 988
                    </a>
                    <a
                      id="emergency-text-988-btn"
                      href="sms:988"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" /> Text 988
                    </a>
                  </div>
                </div>
              </div>

              {/* Crisis Text Line */}
              <div className="bg-slate-800/90 border border-slate-700 hover:border-teal-500/50 rounded-xl p-4 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Text Support (US, UK, Canada)
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">Crisis Text Line</h3>
                    <p className="text-xs text-slate-300">Text HOME to connect with a live crisis counselor.</p>
                  </div>
                  <a
                    id="emergency-text-home-btn"
                    href="sms:741741?&body=HOME"
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition-colors shrink-0"
                  >
                    <MessageSquare className="w-4 h-4" /> Text HOME to 741741
                  </a>
                </div>
              </div>

              {/* The Trevor Project & Veterans */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-pink-400" /> The Trevor Project
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">24/7 LGBTQ+ youth crisis support</p>
                  <a
                    id="emergency-trevor-call-btn"
                    href="tel:18664887386"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-pink-400 hover:text-pink-300 mt-2"
                  >
                    <Phone className="w-3 h-3" /> 1-866-488-7386
                  </a>
                </div>

                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" /> Veterans Crisis Line
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Specialized support for veterans</p>
                  <a
                    id="emergency-veterans-call-btn"
                    href="tel:988"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 mt-2"
                  >
                    <Phone className="w-3 h-3" /> Dial 988, press 1
                  </a>
                </div>
              </div>

              {/* International Resources */}
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs text-slate-300">Outside the US or Canada?</span>
                </div>
                <a
                  id="emergency-international-link"
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-indigo-200 underline"
                >
                  Find A Helpline Worldwide <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Footer action */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                id="emergency-modal-dismiss-btn"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
              >
                Return to CalmCore Tools
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
