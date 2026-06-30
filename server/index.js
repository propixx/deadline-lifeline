import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { buildCalendarLink, buildIcs } from "./calendar.js";
import { generatePlan } from "./planner.js";
import { seedFocusBlocks, seedHabits, seedTasks } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 8787);

let tasks = structuredClone(seedTasks);
let focusBlocks = structuredClone(seedFocusBlocks);
let habits = structuredClone(seedHabits);

if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: true, credentials: true }));
}

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "deadline-lifeline",
    mode: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY ? "gemini" : "demo",
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash"
  });
});

app.get("/api/tasks", (_req, res) => {
  res.json({ tasks, focusBlocks, habits });
});

app.post("/api/tasks", (req, res) => {
  const title = String(req.body?.title || "").trim();
  if (!title) {
    res.status(400).json({ error: "Task title is required." });
    return;
  }

  const task = {
    id: `t-${crypto.randomUUID()}`,
    title,
    category: String(req.body?.category || "Inbox"),
    due: req.body?.due || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    effortMinutes: Number(req.body?.effortMinutes || 30),
    urgency: req.body?.urgency || "medium",
    priority: Number(req.body?.priority || 50),
    status: "ready",
    energy: req.body?.energy || "light",
    context: String(req.body?.context || "Captured from quick add."),
    blockers: Array.isArray(req.body?.blockers) ? req.body.blockers : [],
    steps: Array.isArray(req.body?.steps) ? req.body.steps : ["Clarify next action", "Schedule focus block"],
    completed: false
  };

  tasks = [task, ...tasks];
  res.status(201).json({ task, tasks });
});

app.patch("/api/tasks/:id", (req, res) => {
  const id = req.params.id;
  const existing = tasks.find((task) => task.id === id);
  if (!existing) {
    res.status(404).json({ error: "Task not found." });
    return;
  }

  tasks = tasks.map((task) => (task.id === id ? { ...task, ...req.body, id } : task));
  res.json({ task: tasks.find((task) => task.id === id), tasks });
});

app.post("/api/focus-blocks", (req, res) => {
  const title = String(req.body?.title || "").trim();
  const taskId = String(req.body?.taskId || "");
  if (!title || !taskId) {
    res.status(400).json({ error: "Focus block title and taskId are required." });
    return;
  }

  const start = req.body?.start || new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const end = req.body?.end || new Date(Date.now() + 90 * 60 * 1000).toISOString();
  const block = {
    id: `fb-${crypto.randomUUID()}`,
    taskId,
    title,
    start,
    end,
    mode: req.body?.mode || "deep",
    reason: req.body?.reason || "Scheduled by Deadline Lifeline."
  };

  focusBlocks = [...focusBlocks, block];
  res.status(201).json({ focusBlock: block, focusBlocks, googleCalendarUrl: buildCalendarLink(block) });
});

app.post("/api/plan", async (req, res) => {
  const plan = await generatePlan({
    tasks: req.body?.tasks || tasks,
    focusBlocks: req.body?.focusBlocks || focusBlocks,
    habits: req.body?.habits || habits,
    selectedTaskId: req.body?.selectedTaskId,
    userMessage: req.body?.userMessage
  });

  res.json({ plan });
});

app.get("/api/calendar/export", (req, res) => {
  const blockId = String(req.query.blockId || "");
  const block = focusBlocks.find((item) => item.id === blockId) || focusBlocks[0];
  if (!block) {
    res.status(404).json({ error: "No focus block available to export." });
    return;
  }

  const ics = buildIcs(block);
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${block.id}.ics"`);
  res.send(ics);
});

app.get("/api/calendar/link", (req, res) => {
  const blockId = String(req.query.blockId || "");
  const block = focusBlocks.find((item) => item.id === blockId) || focusBlocks[0];
  if (!block) {
    res.status(404).json({ error: "No focus block available to export." });
    return;
  }

  res.json({ url: buildCalendarLink(block) });
});

app.post("/api/reset-demo", (_req, res) => {
  tasks = structuredClone(seedTasks);
  focusBlocks = structuredClone(seedFocusBlocks);
  habits = structuredClone(seedHabits);
  res.json({ tasks, focusBlocks, habits });
});

const distPath = path.join(__dirname, "..", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(port, "0.0.0.0", () => {
  console.log(`Deadline Lifeline listening on http://localhost:${port}`);
});
