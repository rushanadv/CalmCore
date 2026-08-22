export type FlowStage = "breathing" | "sensory" | "triage" | "actions" | "braindump";

export type BreathingTechnique = "4-7-8" | "box" | "resonance" | "sos-sigh";

export type BreathingPhase = "inhale" | "hold" | "exhale" | "hold_empty";

export interface BreathingPatternConfig {
  name: string;
  technique: BreathingTechnique;
  description: string;
  inhaleSeconds: number;
  holdSeconds: number;
  exhaleSeconds: number;
  holdEmptySeconds: number;
  totalCycleSeconds: number;
}

export type CrisisCategory = "Emotional" | "Financial" | "Relational" | "Health";

export interface MicroAction {
  stepNumber: number;
  title: string;
  description: string;
  timeEstimate: string;
  completed?: boolean;
}

export interface DistressClusters {
  immediateControl: string[];
  outOfControl: string[];
  parkForLater: string[];
}

export interface DeEscalationResult {
  distressCategory: string;
  empathyAnchor: string;
  coreAnxieties: string[];
  clusters: DistressClusters;
  immediateMicroStep: string;
  threeMicroActions: MicroAction[];
  isEmergency?: boolean;
  emergencyGuidance?: string;
}

export interface SensoryPromptItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface SensoryStageData {
  count: number;
  sense: "see" | "feel" | "hear" | "smell" | "taste";
  title: string;
  prompt: string;
  iconName: string;
  examples: string[];
}
