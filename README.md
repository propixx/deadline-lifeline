# Deadline Lifeline

Deadline Lifeline is an AI-powered productivity companion for the **Last-Minute Life Saver** hackathon problem statement. It moves beyond passive reminders by prioritizing at-risk tasks, generating a concrete rescue plan, scheduling focus blocks, and exporting calendar events.

## Features

- **Rescue Queue:** ranks tasks by urgency, consequence, effort, and deadline proximity.
- **AI Plan:** uses Gemini structured JSON output when a key is present, with a demo planner fallback for public judging links.
- **Next Best Action:** highlights the task that reduces the most deadline risk right now.
- **Focus Blocks:** schedules deep work or admin blocks and exports `.ics` files.
- **Calendar Integration:** opens Google Calendar event creation links and downloads calendar files.
- **Habit Tracking:** keeps momentum visible through daily focus and reset habits.
- **Assistant Composer:** lets the user ask Lifeline for a revised plan in natural language.

## Tech Stack

- React, TypeScript, Vite
- Node.js, Express
- `@google/genai` for Gemini API structured planning
- Google Firebase Hosting public deployment
- Cloud Run-ready Dockerfile for teams with billing-enabled projects

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal. The API runs on `http://localhost:8787` and Vite proxies `/api`.

Without an API key, the app uses a deterministic demo plan so every workflow remains testable. To enable Gemini:

```bash
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.5-flash
```

## Verification

```bash
npm run build
npm start
npm run smoke
```

Smoke tests cover `/api/health`, `/api/tasks`, and `/api/plan`.

## Public Deployment

Current public Google-hosted deployment:

- https://gen-lang-client-0265064402.web.app

This build is deployed on Firebase Hosting so the judging link remains public and stable even without a billing-enabled Cloud Run project. The backend is still included and Cloud Run-ready for a billing-enabled Google Cloud project.

Firebase Hosting deployment:

```bash
npm run build
npx firebase-tools deploy --only hosting --project gen-lang-client-0265064402
```

Cloud Run source deployment path:

```bash
gcloud run deploy deadline-lifeline \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_MODEL=gemini-3.5-flash
```

Then add `GEMINI_API_KEY` as a Cloud Run environment variable or secret-backed variable in the Google Cloud Console.

If deploying from the Cloud Console, choose Cloud Run, create a service from source, connect the GitHub repo, and use the included Dockerfile.

Official references:

- Gemini API docs: https://ai.google.dev/gemini-api/docs
- Google Gen AI SDK: https://ai.google.dev/gemini-api/docs/libraries
- Structured output: https://ai.google.dev/gemini-api/docs/structured-output
- Cloud Run source deploy: https://cloud.google.com/run/docs/deploying-source-code
- Firebase Hosting deploy: https://firebase.google.com/docs/hosting

## Submission Notes

Submit these three links on BlockseBlock:

- Public Google-hosted deploy URL
- GitHub repository URL
- Public Google Doc with the project description

Use `PROJECT_DESCRIPTION.md` as the source content for the Google Doc.
