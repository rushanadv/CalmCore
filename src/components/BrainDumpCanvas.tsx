import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CrisisCategory, DeEscalationResult } from "../types";
import { sound } from "../utils/audioSynth";
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  Zap,
  BookmarkPlus,
  HelpCircle,
} from "lucide-react";

interface BrainDumpCanvasProps {
  initialCategory?: CrisisCategory;
  onApplyActionsToFlow: (result: DeEscalationResult) => void;
  onOpenEmergency: () => void;
}

const STARTER_PROMPTS = [
  "My heart is racing, I'm overwhelmed and can't think straight.",
  "I have 10 urgent tasks, bills due, and I'm completely paralyzed.",
  "Had a terrible conflict with someone and I'm spiraling with dread.",
  "My body feels shaky and I keep imagining worst-case scenarios.",
];

export const BrainDumpCanvas: React.FC<BrainDumpCanvasProps> = ({
  initialCategory,
  onApplyActionsToFlow,
  onOpenEmergency,
}) => {
  const [inputText, setInputText] = useState<string>("");
  const [selectedCat, setSelectedCat] = useState<CrisisCategory | "Unsure">(initialCategory || "Unsure");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DeEscalationResult | null>(null);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API for voice dictation
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleVoice = () => {
    sound.playClick();
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your thoughts.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Mic start error:", err);
      }
    }
  };

  const handleProcessBrainDump = async (overrideText?: string) => {
    const textToProcess = overrideText !== undefined ? overrideText : inputText;
    if (!textToProcess.trim()) {
      setErrorMsg("Please enter a few words about what is overwhelming you.");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    sound.playClick();

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    try {
      const response = await fetch("/api/de-escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToProcess,
          category: selectedCat !== "Unsure" ? selectedCat : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to de-escalate");
      }

      const data: DeEscalationResult = await response.json();
      setResult(data);
      setCompletedSteps([false, false, false]);
      sound.playBowlChime(528, 2.0);

      if (data.isEmergency) {
        onOpenEmergency();
      }
    } catch (err) {
      console.error("AI analysis error:", err);
      setErrorMsg("Using offline de-escalation protocol...");
      // Offline fallback
      setResult({
        distressCategory: selectedCat !== "Unsure" ? selectedCat : "Emotional",
        empathyAnchor: "This feeling is acute, but your body is safe right now.",
        coreAnxieties: ["Sensory overload", "Competing thoughts"],
        clusters: {
          immediateControl: ["Take a sip of water", "Unclench your jaw and drop shoulders"],
          outOfControl: ["Everything that cannot be solved this minute"],
          parkForLater: ["Long-term tasks and major decisions"],
        },
        immediateMicroStep: "Drink a glass of cold water and rest your hands on your lap.",
        threeMicroActions: [
          { stepNumber: 1, title: "Somatic Reset", description: "Take 3 slow out-breaths through your mouth.", timeEstimate: "30s" },
          { stepNumber: 2, title: "Pick One Thing", description: "Choose only the easiest small physical task in front of you.", timeEstimate: "1m" },
          { stepNumber: 3, title: "5-Minute Rest", description: "Allow yourself to rest for 5 minutes without self-judgment.", timeEstimate: "5m" },
        ],
        isEmergency: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStep = (index: number) => {
    sound.playClick();
    const updated = [...completedSteps];
    updated[index] = !updated[index];
    setCompletedSteps(updated);
    if (updated[index]) {
      sound.playBowlChime(480 + index * 40, 1.2);
    }
  };

  const handleCopySummary = () => {
    if (!result) return;
    sound.playClick();
    const text = `CalmCore De-escalation Plan
Anchor: ${result.empathyAnchor}

Immediate Step: ${result.immediateMicroStep}

Three Micro-Actions:
1. ${result.threeMicroActions[0]?.title} - ${result.threeMicroActions[0]?.description}
2. ${result.threeMicroActions[1]?.title} - ${result.threeMicroActions[1]?.description}
3. ${result.threeMicroActions[2]?.title} - ${result.threeMicroActions[2]?.description}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="braindump-canvas-container" className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 flex flex-col items-center">
      {/* Top Reassurance Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-4"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>CalmCore AI De-escalation & Clarity Engine</span>
      </motion.div>

      {/* Main Headline */}
      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-center font-display mb-1">
        The Brain Dump Canvas
      </h2>
      <p className="text-sm text-slate-300 text-center max-w-md mb-6">
        Dump your chaotic, messy, unstructured thoughts below. The AI will extract the core tension and organize it into 3 simple micro-actions.
      </p>

      {/* Input Area */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl mb-6">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-slate-400 shrink-0 font-medium">Focus Area:</span>
          {(["Unsure", "Emotional", "Financial", "Relational", "Health"] as (CrisisCategory | "Unsure")[]).map((cat) => {
            const isSelected = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setSelectedCat(cat);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            id="braindump-textarea"
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type anything here... e.g., 'Everything is hitting me at once, my rent is due, I have 15 unread emails, my chest feels tight, and I feel completely frozen...'"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm sm:text-base text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500/80 transition-colors resize-none"
          />

          {/* Voice Dictation Button */}
          <button
            id="braindump-voice-btn"
            onClick={handleToggleVoice}
            title={isListening ? "Stop voice dictation" : "Dictate your thoughts"}
            className={`absolute bottom-3 right-3 p-2 rounded-xl transition-all ${
              isListening
                ? "bg-rose-600 text-white animate-pulse shadow-md"
                : "bg-slate-800 text-slate-400 hover:text-teal-300 hover:bg-slate-700"
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {/* Error message if any */}
        {errorMsg && <p className="text-xs text-amber-400 mt-2">{errorMsg}</p>}

        {/* Starter Suggestion Chips */}
        <div className="mt-3.5">
          <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-300 block mb-1.5">
            Or tap a common crisis state:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                id={`starter-chip-${idx}`}
                onClick={() => {
                  setInputText(prompt);
                  handleProcessBrainDump(prompt);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-700/60 transition-colors text-left"
              >
                "{prompt.slice(0, 45)}..."
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
          <span className="text-xs text-slate-300">
            {isListening ? "🎙️ Listening to your voice..." : "Immediate de-escalation response"}
          </span>

          <button
            id="braindump-submit-btn"
            onClick={() => handleProcessBrainDump()}
            disabled={isLoading || !inputText.trim()}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              isLoading || !inputText.trim()
                ? "bg-slate-800 text-slate-300 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-500 text-slate-950 shadow-md active:scale-98"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>De-escalating...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Organize & Unfreeze</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Structured De-escalation Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full space-y-5 mb-8"
          >
            {/* Emergency Hotline Alert if triggered */}
            {result.isEmergency && (
              <div className="bg-rose-950/60 border-2 border-rose-500 rounded-2xl p-5 text-rose-100 flex items-start gap-3.5 shadow-xl">
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">Emergency Support Lifeline</h3>
                  <p className="text-xs sm:text-sm text-rose-200">{result.emergencyGuidance || "Please connect with a live crisis counselor right now."}</p>
                  <button
                    onClick={onOpenEmergency}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors inline-block"
                  >
                    Open 24/7 Lifeline (988)
                  </button>
                </div>
              </div>
            )}

            {/* Empathy Anchor Banner */}
            <div className="bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-900 border border-teal-500/40 rounded-2xl p-5 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                    Grounding Anchor • {result.distressCategory}
                  </span>
                  <p className="text-base sm:text-lg font-medium text-white mt-1 leading-relaxed">
                    "{result.empathyAnchor}"
                  </p>
                </div>
                <button
                  onClick={handleCopySummary}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
                  title="Copy clarity plan"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* The Single Immediate Micro-Step */}
            <div className="bg-slate-900 border-2 border-teal-400/80 rounded-2xl p-4 sm:p-5 text-center shadow-lg">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">
                <Zap className="w-3.5 h-3.5" /> Do this ONE thing right now:
              </span>
              <p className="text-base sm:text-xl font-bold text-white font-display">
                "{result.immediateMicroStep}"
              </p>
            </div>

            {/* 3 Visual Clusters: Immediate Control | To Release | Park for Later */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Immediate Control */}
              <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Within Your Control Today
                  </h4>
                </div>
                <ul className="space-y-1.5">
                  {result.clusters.immediateControl?.map((item, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-200 flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Outside Control / To Release */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                    To Release For The Next Hour
                  </h4>
                </div>
                <ul className="space-y-1.5">
                  {result.clusters.outOfControl?.map((item, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-sky-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Park for Later */}
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Parked For Tomorrow
                  </h4>
                </div>
                <ul className="space-y-1.5">
                  {result.clusters.parkForLater?.map((item, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Exactly 3 Sequenced Micro-Actions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-base font-bold text-white font-display mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>3 Micro-Actions to Unfreeze</span>
              </h3>

              <div className="space-y-3">
                {result.threeMicroActions?.map((act, idx) => {
                  const isDone = completedSteps[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleStep(idx)}
                      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                        isDone
                          ? "bg-slate-950/60 border-emerald-500/40 text-slate-400"
                          : "bg-slate-800/80 border-slate-700/80 text-white hover:border-teal-500/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-teal-300">Step {idx + 1}</span>
                            <span className="text-[10px] text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">
                              {act.timeEstimate}
                            </span>
                          </div>
                          <h4 className={`text-sm font-bold mt-0.5 ${isDone ? "line-through text-slate-400" : "text-white"}`}>
                            {act.title}
                          </h4>
                          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{act.description}</p>
                        </div>
                      </div>

                      <span className="text-xs text-teal-400 shrink-0 font-medium">
                        {isDone ? "Done" : "Tap to complete"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setResult(null);
                  setInputText("");
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start New Brain Dump</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onApplyActionsToFlow(result);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Track in Micro-Step View</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
