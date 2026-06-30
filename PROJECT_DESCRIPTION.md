# Deadline Lifeline Project Description

## Problem Statement Selected

**The Last-Minute Life Saver**

Students, professionals, and entrepreneurs frequently miss deadlines because passive reminders do not help them decide what to do next. Deadline Lifeline solves this by turning deadlines into prioritized next actions, scheduled focus blocks, and calendar-ready execution plans.

## Solution Overview

Deadline Lifeline is an AI-powered productivity companion that continuously answers one question: **what should I do next so I do not miss an important deadline?**

The app ranks tasks by urgency, effort, deadline proximity, blockers, and consequence. It then generates a rescue strategy, recommends next actions, schedules work blocks, and supports calendar export. Instead of merely reminding the user, it actively converts vague obligations into a plan that can be executed today.

## Why It Matters

Before Deadline Lifeline, a user has scattered deadlines and passive reminders. After using it, the app identifies the highest-risk commitment, explains why it matters, creates a timed rescue schedule, and gives exportable calendar actions. The user leaves with an execution plan, not another notification.

## Agent Loop

Deadline Lifeline runs an agent loop: ingest tasks, classify urgency and blockers, score deadline risk, choose the next best action, generate focus blocks, expose calendar actions, then re-plan when the user adds tasks or asks Lifeline a new instruction.

## Key Features

- Rescue Queue for urgent and at-risk work.
- AI Plan with risk score, priority rationale, next best action, and generated focus blocks.
- Context-aware nudges for deadline pressure and submission risk.
- Focus block scheduling with `.ics` export and Google Calendar links.
- Habit and goal tracking for momentum.
- Assistant composer for natural-language re-planning.
- Demo fallback when Gemini credentials are unavailable, keeping the public deploy fully usable.

## Technologies Used

- React and TypeScript for the frontend.
- Vite for development and optimized production build.
- Node.js and Express for backend APIs.
- `@google/genai` SDK for Gemini-powered planning.
- Docker for deployment packaging.

## Google Technologies Utilized

- **Gemini API:** structured JSON planning endpoint for task prioritization and next-action generation.
- **Google Gen AI SDK:** official JavaScript SDK integration through `@google/genai`.
- **Google Calendar:** generated calendar event links and downloadable `.ics` focus blocks.
- **Firebase Hosting:** public Google-hosted deployment for the judging link.
- **Cloud Run-ready backend:** Express API and Dockerfile are included for billing-enabled Cloud Run deployment.

## Evaluation Fit

- **Problem Solving & Impact:** converts scattered deadlines into a ranked rescue plan and scheduled work blocks.
- **Agentic Depth:** follows an observe-score-plan-act-replan loop over task context, risk, blockers, effort, and schedule capacity.
- **Innovation & Creativity:** combines rescue planning, behavioral nudges, Google Calendar actions, and habit momentum.
- **Usage of Google Technologies:** Gemini API, Google Gen AI SDK, Firebase Hosting, Google Calendar links, and Cloud Run-ready packaging are core parts of the build.
- **Product Experience & Design:** dashboard-first interface with a polished Rescue Queue and AI Plan.
- **Technical Implementation:** full-stack app with resilient API fallback, structured model output, Firebase deploy, and Cloud Run packaging.
- **Completeness & Usability:** public deploy remains usable even without live Gemini credentials.
