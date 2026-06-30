export const seedTasks = [
  {
    id: "t-submit-hackathon",
    title: "Final hackathon submission",
    category: "Hackathon",
    due: "2026-06-30T23:59:00+05:30",
    effortMinutes: 180,
    urgency: "critical",
    priority: 98,
    status: "at-risk",
    energy: "deep",
    context: "Deployable link, GitHub repo, and Google Doc must be final before BlockseBlock final submit.",
    blockers: ["Google-hosted deploy", "Project description doc", "Final smoke test"],
    steps: ["Build production bundle", "Deploy to Google Firebase Hosting", "Verify public URL", "Submit on BlockseBlock"],
    completed: false
  },
  {
    id: "t-google-doc",
    title: "Project description Google Doc",
    category: "Documentation",
    due: "2026-06-30T20:30:00+05:30",
    effortMinutes: 45,
    urgency: "high",
    priority: 88,
    status: "planned",
    energy: "light",
    context: "Needs problem statement, solution overview, features, technologies, and Google technologies utilized.",
    blockers: ["Make sharing anyone-with-link"],
    steps: ["Draft content", "Paste into Google Doc", "Enable link sharing"],
    completed: false
  },
  {
    id: "t-interview-prep",
    title: "Interview prep kit",
    category: "Career",
    due: "2026-07-01T09:00:00+05:30",
    effortMinutes: 90,
    urgency: "medium",
    priority: 72,
    status: "ready",
    energy: "deep",
    context: "Review resume stories, two projects, and common behavioral answers.",
    blockers: [],
    steps: ["Pick five stories", "Practice intro", "Prepare questions"],
    completed: false
  },
  {
    id: "t-electricity-bill",
    title: "Pay electricity bill",
    category: "Personal",
    due: "2026-07-02T18:00:00+05:30",
    effortMinutes: 15,
    urgency: "medium",
    priority: 55,
    status: "ready",
    energy: "light",
    context: "Small but penalty-sensitive task.",
    blockers: [],
    steps: ["Open payment portal", "Confirm amount", "Save receipt"],
    completed: false
  }
];

export const seedHabits = [
  { id: "h-focus", label: "Deep focus", streak: 6, target: "2 blocks", doneToday: 1 },
  { id: "h-review", label: "Nightly review", streak: 4, target: "10 min", doneToday: 0 },
  { id: "h-health", label: "Reset break", streak: 9, target: "3 breaks", doneToday: 2 }
];

export const seedFocusBlocks = [
  {
    id: "fb-ship",
    taskId: "t-submit-hackathon",
    title: "Ship MVP and build",
    start: "2026-06-30T16:00:00+05:30",
    end: "2026-06-30T17:30:00+05:30",
    mode: "deep",
    reason: "Largest risk reduction before deployment."
  },
  {
    id: "fb-doc",
    taskId: "t-google-doc",
    title: "Submission documentation",
    start: "2026-06-30T18:00:00+05:30",
    end: "2026-06-30T18:45:00+05:30",
    mode: "admin",
    reason: "Required artifact before final submit."
  }
];
