import { GoogleGenAI } from "@google/genai";

const planJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "riskScore",
    "nextBestAction",
    "priorityRationale",
    "focusBlocks",
    "recommendations",
    "nudges",
    "estimatedWin"
  ],
  properties: {
    summary: { type: "string" },
    riskScore: { type: "number", minimum: 0, maximum: 100 },
    nextBestAction: { type: "string" },
    priorityRationale: { type: "string" },
    estimatedWin: { type: "string" },
    focusBlocks: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "taskId", "start", "end", "mode", "reason"],
        properties: {
          title: { type: "string" },
          taskId: { type: "string" },
          start: { type: "string" },
          end: { type: "string" },
          mode: { type: "string", enum: ["deep", "admin", "quick", "recovery"] },
          reason: { type: "string" }
        }
      }
    },
    recommendations: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "detail", "impact"],
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
          impact: { type: "string", enum: ["high", "medium", "low"] }
        }
      }
    },
    nudges: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: { type: "string" }
    }
  }
};

const fallbackPlan = {
  summary: "Your submission task is the clear deadline risk. Protect the next two hours for build verification, then move to deployment and documentation.",
  riskScore: 86,
  nextBestAction: "Run the production build, fix any blocking errors, and schedule a Google-hosted deploy block immediately after.",
  priorityRationale: "The hackathon submission has the nearest hard deadline, the highest consequence, and multiple dependent artifacts. Lower-effort personal tasks can wait until the public deploy link is verified.",
  estimatedWin: "A focused 90-minute build-and-deploy block should reduce deadline risk by about 45%.",
  focusBlocks: [
    {
      taskId: "t-submit-hackathon",
      title: "Build and verify production app",
      start: "2026-06-30T16:00:00+05:30",
      end: "2026-06-30T17:30:00+05:30",
      mode: "deep",
      reason: "Removes the largest technical uncertainty before the final submit window."
    },
    {
      taskId: "t-submit-hackathon",
      title: "Deploy and public smoke test",
      start: "2026-06-30T17:45:00+05:30",
      end: "2026-06-30T18:30:00+05:30",
      mode: "admin",
      reason: "The deployed Google-hosted link is mandatory for evaluation."
    },
    {
      taskId: "t-google-doc",
      title: "Finalize project description",
      start: "2026-06-30T18:45:00+05:30",
      end: "2026-06-30T19:30:00+05:30",
      mode: "quick",
      reason: "Documentation is required but can be completed once the product behavior is stable."
    }
  ],
  recommendations: [
    {
      title: "Work backward from final submit",
      detail: "Reserve the last 30 minutes only for link checks and BlockseBlock final submission.",
      impact: "high"
    },
    {
      title: "Convert reminders into actions",
      detail: "Every urgent item now has one next action, one owner, and a scheduled block.",
      impact: "high"
    },
    {
      title: "Batch shallow tasks",
      detail: "Handle the Google Doc and repository cleanup in a single admin block after deploy.",
      impact: "medium"
    },
    {
      title: "Keep a fallback path",
      detail: "If Gemini credentials are unavailable, the app still demonstrates planning with deterministic demo logic.",
      impact: "medium"
    }
  ],
  nudges: [
    "Start with the production build before polishing copy.",
    "Do not open BlockseBlock final submit until all three links are verified.",
    "Put your phone away for the first focus block."
  ]
};

function buildPrompt({ tasks, focusBlocks, habits, selectedTaskId, userMessage }) {
  return `You are Deadline Lifeline, an agentic productivity companion for preventing missed deadlines.

Return only valid JSON matching the requested schema. Do not include markdown.

Current date: 2026-06-30
User message: ${userMessage || "Create the best rescue plan for today."}
Selected task id: ${selectedTaskId || "none"}

Tasks:
${JSON.stringify(tasks, null, 2)}

Existing focus blocks:
${JSON.stringify(focusBlocks, null, 2)}

Habits:
${JSON.stringify(habits, null, 2)}

Planning rules:
- Prioritize hard deadlines, dependency chains, and high-consequence items.
- Convert passive reminders into concrete next actions.
- Suggest focus blocks in ISO 8601 date-time format with timezone offsets.
- Keep recommendations practical for a student/professional under time pressure.
- Mention Google Cloud deploy risk if the hackathon submission task is present.`;
}

function withMetadata(plan, mode, model) {
  return {
    ...fallbackPlan,
    ...plan,
    generatedAt: new Date().toISOString(),
    mode,
    model
  };
}

export async function generatePlan(input) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  if (!apiKey) {
    return withMetadata(fallbackPlan, "demo", model);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: buildPrompt(input),
      config: {
        temperature: 0.35,
        responseMimeType: "application/json",
        responseJsonSchema: planJsonSchema
      }
    });
    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return withMetadata(parsed, "gemini", model);
  } catch (error) {
    console.error("Gemini planner failed, returning demo plan.", error);
    return withMetadata(
      {
        ...fallbackPlan,
        summary: "Gemini planning could not complete, so Deadline Lifeline switched to a safe demo plan.",
        nudges: [
          "Check GEMINI_API_KEY and GEMINI_MODEL in the deployed backend environment.",
          ...fallbackPlan.nudges.slice(0, 2)
        ]
      },
      "fallback",
      model
    );
  }
}
