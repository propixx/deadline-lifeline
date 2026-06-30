# Deadline Lifeline Project Description

## Problem Statement Selected

**The Last-Minute Life Saver**

Students, professionals, and entrepreneurs frequently miss deadlines because passive reminders do not help them decide what to do next. Deadline Lifeline solves this by turning deadlines into prioritized next actions, scheduled focus blocks, and calendar-ready execution plans.

## Solution Overview

Deadline Lifeline is an AI-powered productivity companion that continuously answers one question: **what should I do next so I do not miss an important deadline?**

The app ranks tasks by urgency, effort, deadline proximity, blockers, and consequence. It then generates a rescue strategy, recommends next actions, schedules work blocks, and supports calendar export. Instead of merely reminding the user, it actively converts vague obligations into a plan that can be executed today.

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
- **Google Cloud Run:** required deployment target for the public application link.

## Evaluation Fit

- **Problem Solving & Impact:** addresses missed deadlines by converting reminders into action.
- **Agentic Depth:** reasons over task context, risk, blockers, effort, and schedule capacity.
- **Innovation & Creativity:** combines rescue planning, calendar export, and behavioral nudges.
- **Usage of Google Technologies:** Gemini API and Google Cloud Run are core parts of the build.
- **Product Experience & Design:** dashboard-first interface with a polished Rescue Queue and AI Plan.
- **Technical Implementation:** full-stack app with resilient API fallback, structured model output, and Cloud Run packaging.
- **Completeness & Usability:** public deploy remains usable even without live Gemini credentials.
