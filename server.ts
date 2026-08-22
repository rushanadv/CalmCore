import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client securely on the server
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// System prompt strictly adhering to CalmCore guidelines
const CALMCORE_SYSTEM_PROMPT = `You are the CalmCore AI engine. Your sole purpose is de-escalation and clarity. You must speak in short, highly empathetic, and exceptionally actionable sentences. Never use complex jargon or long paragraphs. When processing a user's "brain dump," you must extract the core anxieties and return a structured JSON response categorizing the distress. You must then generate exactly three immediate, low-effort micro-actions to break the user's paralysis. Prioritize immediate physical and mental safety over long-term solutions. If self-harm is detected, immediately flag isEmergency=true and output emergency hotline resources.`;

// Safety keywords check for immediate heuristic protection
function checkSelfHarmRisk(text: string): boolean {
  const lower = text.toLowerCase();
  const dangerKeywords = [
    "kill myself",
    "suicide",
    "end my life",
    "hang myself",
    "want to die",
    "cut myself",
    "overdose",
    "can't live anymore",
    "better off dead",
    "harm myself",
  ];
  return dangerKeywords.some((keyword) => lower.includes(keyword));
}

// Fallback emergency response for resilience
function getFallbackDeEscalation(text: string, category?: string) {
  const isEmergency = checkSelfHarmRisk(text);
  const cat = category || "Emotional";

  if (isEmergency) {
    return {
      distressCategory: "Emergency Support",
      empathyAnchor: "You are not alone, and your life matters deeply right now.",
      coreAnxieties: ["Overwhelming acute crisis", "Needing immediate safe support"],
      clusters: {
        immediateControl: ["Reach out to a trained crisis counselor right now", "Stay in a safe, lighted space"],
        outOfControl: ["Trying to solve all life problems alone right this second"],
        parkForLater: ["All decisions, obligations, and heavy tasks"],
      },
      immediateMicroStep: "Call or text 988 immediately to speak with a supportive person for free.",
      threeMicroActions: [
        {
          stepNumber: 1,
          title: "Connect to 988",
          description: "Dial 988 or text HOME to 741741 for free, 24/7 confidential support.",
          timeEstimate: "Immediate",
        },
        {
          stepNumber: 2,
          title: "Physical Comfort",
          description: "Sit with your back against a solid wall and feel your feet flat on the floor.",
          timeEstimate: "30 seconds",
        },
        {
          stepNumber: 3,
          title: "Slow Out-Breath",
          description: "Breathe in for 4 seconds, and exhale slowly for 8 seconds.",
          timeEstimate: "1 minute",
        },
      ],
      isEmergency: true,
      emergencyGuidance: "If you are in immediate danger, please call 911 (US) or your local emergency services, or call/text 988.",
    };
  }

  const categoryPresets: Record<string, any> = {
    Financial: {
      empathy: "Financial stress triggers a deep panic response, but you do not need to solve the entire budget today.",
      control: ["Pause all discretionary spending for today", "Write down just the single most urgent deadline"],
      release: ["Worrying about what might happen next month"],
      park: ["Long-term financial reorganization and spreadsheet audits"],
      microStep: "Drink a glass of cold water and write down only the single next due date.",
      actions: [
        { stepNumber: 1, title: "Somatic Reset", description: "Take 3 deep belly breaths and relax your jaw.", timeEstimate: "30 seconds" },
        { stepNumber: 2, title: "Identify Single Top Priority", description: "Isolate only the ONE bill or task due within the next 48 hours.", timeEstimate: "2 minutes" },
        { stepNumber: 3, title: "One Simple Contact/Note", description: "Send a template email for extension or note a reminder date.", timeEstimate: "3 minutes" },
      ],
    },
    Relational: {
      empathy: "Conflict and interpersonal friction cause intense adrenaline spikes. You are safe in your body right now.",
      control: ["Taking space to breathe before responding", "Lowering your heart rate"],
      release: ["Controlling the other person's instant reaction or thoughts"],
      park: ["Resolving the entire relationship history"],
      microStep: "Step away from your screen or the room for 5 quiet minutes.",
      actions: [
        { stepNumber: 1, title: "Cooling Time", description: "Do not send any impulsive message right now. Put the phone face down.", timeEstimate: "1 minute" },
        { stepNumber: 2, title: "Physical Shakeout", description: "Roll your shoulders backward 5 times and release muscle tension.", timeEstimate: "45 seconds" },
        { stepNumber: 3, title: "Draft to Self", description: "If you need to reply later, write thoughts in a private draft first.", timeEstimate: "3 minutes" },
      ],
    },
    Health: {
      empathy: "Physical symptoms and health fears are frightening, but your body is working to keep you safe.",
      control: ["Pacing your breathing", "Sitting in a comfortable supported position"],
      release: ["Searching symptoms or spiraling on online diagnoses"],
      park: ["Long-term health anxieties"],
      microStep: "Close your tabs, place one hand on your chest, and feel your heartbeat slow down.",
      actions: [
        { stepNumber: 1, title: "Grounding Posture", description: "Rest both feet firmly on the ground and let your shoulders drop.", timeEstimate: "30 seconds" },
        { stepNumber: 2, title: "Hydration", description: "Take small, mindful sips of room-temperature water.", timeEstimate: "1 minute" },
        { stepNumber: 3, title: "Call a Clinician If Needed", description: "If in doubt, consult a medical professional rather than self-diagnosing.", timeEstimate: "2 minutes" },
      ],
    },
    Emotional: {
      empathy: "This feeling is intense, but panic peaks and then subsides. You are safe in this moment.",
      control: ["Your next exhale", "Observing 3 objects around you right now"],
      release: ["The expectation to feel perfectly calm immediately"],
      park: ["Big life decisions and difficult conversations"],
      microStep: "Splash cool water on your face or place an ice cube on your wrist.",
      actions: [
        { stepNumber: 1, title: "Physical Temperature Shock", description: "Wash your hands with cold water or touch something cool to reset the vagus nerve.", timeEstimate: "30 seconds" },
        { stepNumber: 2, title: "Name Your Immediate Environment", description: "Look around and name 3 blue objects in your room.", timeEstimate: "45 seconds" },
        { stepNumber: 3, title: "The Next 5 Minutes", description: "Sit in a safe spot without demanding productivity of yourself.", timeEstimate: "5 minutes" },
      ],
    },
  };

  const preset = categoryPresets[cat] || categoryPresets.Emotional;

  return {
    distressCategory: cat,
    empathyAnchor: preset.empathy,
    coreAnxieties: ["Sensory and cognitive overload", "Feeling frozen by competing demands"],
    clusters: {
      immediateControl: preset.control,
      outOfControl: preset.release,
      parkForLater: preset.park,
    },
    immediateMicroStep: preset.microStep,
    threeMicroActions: preset.actions,
    isEmergency: false,
    emergencyGuidance: "",
  };
}

// Primary AI endpoint for Brain Dump & De-escalation
app.post("/api/de-escalate", async (req, res) => {
  try {
    const { text, category } = req.body;
    const rawText = typeof text === "string" ? text.trim() : "";

    if (!rawText && !category) {
      return res.status(400).json({ error: "Text or category is required." });
    }

    // Immediate heuristic check for self-harm
    const isCrisis = checkSelfHarmRisk(rawText);
    if (isCrisis) {
      return res.json(getFallbackDeEscalation(rawText, "Emergency Support"));
    }

    const ai = getAi();
    if (!ai) {
      // Fallback if no API key is available
      return res.json(getFallbackDeEscalation(rawText, category));
    }

    const prompt = `User category: ${category || "Unspecified"}
User brain dump / crisis input:
"${rawText || "I am feeling acute paralysis and overwhelm."}"

Respond according to your system instructions in strict JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: CALMCORE_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            distressCategory: {
              type: Type.STRING,
              description: "The primary categorized distress (Emotional, Financial, Relational, Health, or Mixed)",
            },
            empathyAnchor: {
              type: Type.STRING,
              description: "A single, highly empathetic, reassuring sentence validating reality without panic.",
            },
            coreAnxieties: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 to 3 extracted core root anxieties.",
            },
            clusters: {
              type: Type.OBJECT,
              properties: {
                immediateControl: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "1 to 3 realistic small things within the user's immediate control today.",
                },
                outOfControl: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "1 to 2 things outside their direct control right now to release.",
                },
                parkForLater: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "1 to 2 things to park for tomorrow or next week.",
                },
              },
              required: ["immediateControl", "outOfControl", "parkForLater"],
            },
            immediateMicroStep: {
              type: Type.STRING,
              description: "Exactly ONE immediate, effortless physical micro-step (e.g. 'Drink a glass of cool water and uncross your legs').",
            },
            threeMicroActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  timeEstimate: { type: Type.STRING },
                },
                required: ["stepNumber", "title", "description", "timeEstimate"],
              },
              description: "Exactly 3 progressive, low-effort micro-actions to break paralysis.",
            },
            isEmergency: {
              type: Type.BOOLEAN,
              description: "True if severe self-harm or medical emergency is detected.",
            },
            emergencyGuidance: {
              type: Type.STRING,
              description: "Emergency hotline instructions if isEmergency is true.",
            },
          },
          required: [
            "distressCategory",
            "empathyAnchor",
            "coreAnxieties",
            "clusters",
            "immediateMicroStep",
            "threeMicroActions",
            "isEmergency",
          ],
        },
      },
    });

    const outputText = response.text;
    if (!outputText) {
      return res.json(getFallbackDeEscalation(rawText, category));
    }

    const parsed = JSON.parse(outputText);
    return res.json(parsed);
  } catch (error) {
    console.error("CalmCore AI de-escalate error:", error);
    // Graceful fallback to avoid any user disruption during panic
    return res.json(getFallbackDeEscalation(req.body?.text || "", req.body?.category));
  }
});

// Quick triage endpoint
app.post("/api/quick-triage", (req, res) => {
  const { category } = req.body;
  const result = getFallbackDeEscalation("", category);
  res.json(result);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "CalmCore", uptime: process.uptime() });
});

// Server and Vite setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CalmCore server running on port ${PORT}`);
  });
}

startServer();
