export type Urgency = 'critical' | 'high' | 'medium' | 'low'
export type TaskStatus = 'at-risk' | 'planned' | 'ready' | 'done'
export type FocusMode = 'deep' | 'admin' | 'quick' | 'recovery'

export interface Task {
  id: string
  title: string
  category: string
  due: string
  effortMinutes: number
  urgency: Urgency
  priority: number
  status: TaskStatus
  energy: 'deep' | 'light'
  context: string
  blockers: string[]
  steps: string[]
  completed: boolean
}

export interface Habit {
  id: string
  label: string
  streak: number
  target: string
  doneToday: number
}

export interface FocusBlock {
  id?: string
  taskId: string
  title: string
  start: string
  end: string
  mode: FocusMode
  reason: string
}

export interface Recommendation {
  title: string
  detail: string
  impact: 'high' | 'medium' | 'low'
}

export interface AiPlan {
  generatedAt: string
  mode: 'gemini' | 'demo' | 'fallback'
  model: string
  summary: string
  riskScore: number
  nextBestAction: string
  priorityRationale: string
  estimatedWin: string
  focusBlocks: FocusBlock[]
  recommendations: Recommendation[]
  nudges: string[]
}

export interface DashboardPayload {
  tasks: Task[]
  focusBlocks: FocusBlock[]
  habits: Habit[]
}
