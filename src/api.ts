import type { AiPlan, DashboardPayload, FocusBlock, Task } from './types'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `${path} failed with ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function fetchDashboard() {
  return request<DashboardPayload>('/api/tasks')
}

export function createTask(input: Pick<Task, 'title' | 'category' | 'due' | 'context'>) {
  return request<{ task: Task; tasks: Task[] }>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateTask(id: string, patch: Partial<Task>) {
  return request<{ task: Task; tasks: Task[] }>(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function requestAiPlan(payload: {
  tasks: Task[]
  focusBlocks: FocusBlock[]
  habits: DashboardPayload['habits']
  selectedTaskId: string
  userMessage: string
}) {
  return request<{ plan: AiPlan }>('/api/plan', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function createFocusBlock(block: FocusBlock) {
  return request<{ focusBlock: FocusBlock; focusBlocks: FocusBlock[]; googleCalendarUrl: string }>(
    '/api/focus-blocks',
    {
      method: 'POST',
      body: JSON.stringify(block),
    },
  )
}
