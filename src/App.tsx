import {
  AlarmClock,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Cloud,
  Download,
  Flame,
  Goal,
  LayoutDashboard,
  LifeBuoy,
  LoaderCircle,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Target,
  Timer,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createFocusBlock, createTask, fetchDashboard, requestAiPlan, updateTask } from './api'
import { createDemoPlan, demoDashboard } from './demoData'
import { blockRange, downloadIcs, formatDateTime, taskDeadlineLabel } from './format'
import type { AiPlan, FocusBlock, Habit, Task, Urgency } from './types'

const urgencyLabels: Record<Urgency, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

function taskSort(a: Task, b: Task) {
  return Number(b.priority) - Number(a.priority)
}

function nextHourBlock(task: Task): FocusBlock {
  const start = new Date(Date.now() + 30 * 60 * 1000)
  const end = new Date(start.getTime() + Math.min(Math.max(task.effortMinutes, 30), 90) * 60000)
  return {
    taskId: task.id,
    title: `Focus: ${task.title}`,
    start: start.toISOString(),
    end: end.toISOString(),
    mode: task.energy === 'deep' ? 'deep' : 'quick',
    reason: `Protect time before ${formatDateTime(task.due)}.`,
  }
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'danger' | 'good' | 'info' }) {
  return (
    <div className={`metric ${tone ?? ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Sidebar() {
  const items = [
    { label: 'Today', icon: LayoutDashboard, active: true },
    { label: 'Rescue Queue', icon: LifeBuoy },
    { label: 'AI Plan', icon: Sparkles },
    { label: 'Calendar', icon: CalendarDays },
    { label: 'Goals', icon: Goal },
  ]

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <LifeBuoy size={20} />
        </div>
        <div>
          <strong>Deadline Lifeline</strong>
          <span>Agentic deadline rescue</span>
        </div>
      </div>
      <nav className="nav-list" aria-label="Primary">
        {items.map((item) => (
          <button className={`nav-item ${item.active ? 'active' : ''}`} key={item.label}>
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-note">
        <Zap size={18} />
        <p>Blocks passive reminders and turns deadlines into scheduled action.</p>
      </div>
    </aside>
  )
}

function Header({
  onPlan,
  isPlanning,
  mode,
  model,
}: {
  onPlan: () => void
  isPlanning: boolean
  mode: AiPlan['mode'] | 'loading'
  model: string
}) {
  return (
    <header className="topbar">
      <div className="search-shell">
        <Search size={18} />
        <input aria-label="Search tasks" placeholder="Search tasks, deadlines, blockers" />
      </div>
      <div className="topbar-actions">
        <div className={`model-chip ${mode}`}>
          <Cloud size={15} />
          <span>{mode === 'gemini' ? model : mode === 'loading' ? 'Loading' : 'Demo planner'}</span>
        </div>
        <button className="icon-button" type="button" onClick={onPlan} aria-label="Refresh AI plan">
          {isPlanning ? <LoaderCircle className="spin" size={18} /> : <RefreshCw size={18} />}
        </button>
      </div>
    </header>
  )
}

function RescueQueue({
  tasks,
  selectedTask,
  onSelect,
  onComplete,
}: {
  tasks: Task[]
  selectedTask: Task
  onSelect: (id: string) => void
  onComplete: (task: Task) => void
}) {
  return (
    <section className="panel rescue-panel">
      <div className="panel-heading">
        <div>
          <p className="section-label">Rescue Queue</p>
          <h2>What can still slip?</h2>
        </div>
        <Metric label="Open" value={`${tasks.filter((task) => !task.completed).length}`} tone="danger" />
      </div>
      <div className="task-list">
        {tasks.toSorted(taskSort).map((task) => (
          <button
            className={`task-row ${task.id === selectedTask.id ? 'selected' : ''} ${task.completed ? 'done' : ''}`}
            key={task.id}
            type="button"
            onClick={() => onSelect(task.id)}
          >
            <span className={`priority-dot ${task.urgency}`} />
            <span className="task-main">
              <strong>{task.title}</strong>
              <small>{task.category} · {taskDeadlineLabel(task)} · {task.effortMinutes}m</small>
            </span>
            <span className={`urgency ${task.urgency}`}>{urgencyLabels[task.urgency]}</span>
            <span
              className="complete-control"
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation()
                onComplete(task)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onComplete(task)
                }
              }}
              aria-label={`Mark ${task.title} complete`}
            >
              {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function SelectedTaskPanel({
  task,
  onSchedule,
  onExport,
}: {
  task: Task
  onSchedule: () => void
  onExport: () => void
}) {
  return (
    <section className="panel selected-task-panel">
      <div className="panel-heading">
        <div>
          <p className="section-label">Next best action</p>
          <h2>{task.title}</h2>
        </div>
        <div className={`score-ring ${task.urgency}`}>
          <span>{task.priority}</span>
        </div>
      </div>
      <p className="task-context">{task.context}</p>
      <div className="step-list">
        {task.steps.map((step, index) => (
          <div className="step-item" key={step}>
            <span>{index + 1}</span>
            <p>{step}</p>
          </div>
        ))}
      </div>
      {task.blockers.length > 0 && (
        <div className="blockers">
          <Flame size={16} />
          <span>{task.blockers.join(' · ')}</span>
        </div>
      )}
      <div className="action-row">
        <button className="primary-button" type="button" onClick={onSchedule}>
          <Timer size={17} />
          <span>Schedule focus block</span>
        </button>
        <button className="secondary-button" type="button" onClick={onExport}>
          <Download size={17} />
          <span>Export to Calendar</span>
        </button>
      </div>
    </section>
  )
}

function AiPlanPanel({
  plan,
  onAddBlock,
  isPlanning,
}: {
  plan: AiPlan | null
  onAddBlock: (block: FocusBlock) => void
  isPlanning: boolean
}) {
  return (
    <section className="panel ai-panel">
      <div className="panel-heading">
        <div>
          <p className="section-label">AI Plan</p>
          <h2>Deadline rescue strategy</h2>
        </div>
        <div className="risk-meter">
          <span>{plan?.riskScore ?? '--'}</span>
          <small>risk</small>
        </div>
      </div>
      <p className="plan-summary">
        {isPlanning ? 'Generating a fresh plan from task context...' : plan?.summary ?? 'Ask Lifeline to generate a rescue plan.'}
      </p>
      <div className="next-action-box">
        <Sparkles size={18} />
        <div>
          <span>Next best action</span>
          <strong>{plan?.nextBestAction ?? 'Select a task and generate the first plan.'}</strong>
        </div>
      </div>
      <div className="recommendation-list">
        {plan?.recommendations.slice(0, 3).map((item) => (
          <div className="recommendation" key={item.title}>
            <span className={`impact ${item.impact}`}>{item.impact}</span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="generated-blocks">
        {plan?.focusBlocks.slice(0, 3).map((block) => (
          <div className="mini-block" key={`${block.taskId}-${block.start}`}>
            <Clock3 size={16} />
            <div>
              <strong>{block.title}</strong>
              <span>{blockRange(block)}</span>
            </div>
            <button type="button" onClick={() => onAddBlock(block)} aria-label={`Add ${block.title}`}>
              <Plus size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

function Timeline({ focusBlocks, tasks }: { focusBlocks: FocusBlock[]; tasks: Task[] }) {
  const lanes = [
    { time: '3 PM', label: 'Triage' },
    { time: '4 PM', label: 'Build' },
    { time: '5 PM', label: 'Deploy' },
    { time: '6 PM', label: 'Docs' },
    { time: '7 PM', label: 'Submit' },
  ]

  return (
    <section className="panel timeline-panel">
      <div className="panel-heading compact">
        <div>
          <p className="section-label">Today</p>
          <h2>Protected schedule</h2>
        </div>
        <AlarmClock size={20} />
      </div>
      <div className="timeline">
        {lanes.map((lane, index) => {
          const block = focusBlocks[index % Math.max(focusBlocks.length, 1)]
          const task = tasks.find((item) => item.id === block?.taskId)
          return (
            <div className="timeline-row" key={lane.time}>
              <span className="timeline-time">{lane.time}</span>
              <div className={`timeline-block mode-${block?.mode ?? 'quick'}`}>
                <strong>{block?.title ?? lane.label}</strong>
                <span>{task?.category ?? lane.label} · {block ? blockRange(block) : 'Open'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function HabitPanel({
  habits,
  onToggle,
}: {
  habits: Habit[]
  onToggle: (id: string) => void
}) {
  return (
    <section className="panel habit-panel">
      <div className="panel-heading compact">
        <div>
          <p className="section-label">Goals</p>
          <h2>Momentum</h2>
        </div>
        <Target size={20} />
      </div>
      <div className="habit-list">
        {habits.map((habit) => (
          <button className="habit-row" key={habit.id} type="button" onClick={() => onToggle(habit.id)}>
            <span className="habit-check">{habit.doneToday > 0 ? <CheckCircle2 size={17} /> : <Circle size={17} />}</span>
            <span>
              <strong>{habit.label}</strong>
              <small>{habit.streak} day streak · {habit.target}</small>
            </span>
            <b>{habit.doneToday}</b>
          </button>
        ))}
      </div>
    </section>
  )
}

function AssistantComposer({
  message,
  setMessage,
  onSubmit,
  disabled,
}: {
  message: string
  setMessage: (value: string) => void
  onSubmit: () => void
  disabled: boolean
}) {
  return (
    <section className="panel assistant-panel">
      <div className="panel-heading compact">
        <div>
          <p className="section-label">Ask Lifeline</p>
          <h2>Agent command</h2>
        </div>
        <MessageSquare size={20} />
      </div>
      <form
        className="assistant-form"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="What should I do in the next 90 minutes?"
          aria-label="Ask Lifeline"
        />
        <button className="primary-button" type="submit" disabled={disabled}>
          {disabled ? <LoaderCircle className="spin" size={17} /> : <Send size={17} />}
          <span>Ask Lifeline</span>
        </button>
      </form>
    </section>
  )
}

function QuickAdd({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim())
    setTitle('')
  }

  return (
    <form className="quick-add" onSubmit={submit}>
      <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Capture a new deadline" />
      <button type="submit" aria-label="Add task">
        <Plus size={17} />
      </button>
    </form>
  )
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [focusBlocks, setFocusBlocks] = useState<FocusBlock[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [plan, setPlan] = useState<AiPlan | null>(null)
  const [message, setMessage] = useState('Create a last-minute rescue plan for my highest risk deadline.')
  const [isPlanning, setIsPlanning] = useState(false)
  const [notice, setNotice] = useState('Loading Deadline Lifeline...')

  const selectedTask = useMemo(() => {
    return tasks.find((task) => task.id === selectedTaskId) ?? tasks.toSorted(taskSort)[0]
  }, [selectedTaskId, tasks])

  const runPlan = useCallback(
    async (overrideMessage = message) => {
      if (!tasks.length) return
      setIsPlanning(true)
      setNotice('Lifeline is reasoning over deadlines, effort, and schedule risk.')
      try {
        const response = await requestAiPlan({
          tasks,
          focusBlocks,
          habits,
          selectedTaskId: selectedTask?.id ?? '',
          userMessage: overrideMessage,
        })
        setPlan(response.plan)
        setNotice(response.plan.mode === 'gemini' ? 'Gemini plan generated.' : 'Demo rescue plan ready.')
      } catch (error) {
        const demoPlan = createDemoPlan(overrideMessage)
        setPlan(demoPlan)
        setNotice(error instanceof Error ? 'Static demo plan ready.' : 'Demo rescue plan ready.')
      } finally {
        setIsPlanning(false)
      }
    },
    [focusBlocks, habits, message, selectedTask?.id, tasks],
  )

  useEffect(() => {
    let mounted = true
    fetchDashboard()
      .then((payload) => {
        if (!mounted) return
        setTasks(payload.tasks)
        setFocusBlocks(payload.focusBlocks)
        setHabits(payload.habits)
        setSelectedTaskId(payload.tasks.toSorted(taskSort)[0]?.id ?? '')
        setNotice('Dashboard loaded. Generate or adjust the AI Plan.')
      })
      .catch((error: unknown) => {
        if (!mounted) return
        setTasks(demoDashboard.tasks)
        setFocusBlocks(demoDashboard.focusBlocks)
        setHabits(demoDashboard.habits)
        setSelectedTaskId(demoDashboard.tasks.toSorted(taskSort)[0]?.id ?? '')
        setNotice(error instanceof Error ? 'Google-hosted static demo loaded.' : 'Demo dashboard loaded.')
      })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (tasks.length && !plan && !isPlanning) {
      void runPlan()
    }
  }, [isPlanning, plan, runPlan, tasks.length])

  async function handleAddTask(title: string) {
    const due = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
    const localTask: Task = {
      id: `t-${crypto.randomUUID()}`,
      title,
      category: 'Inbox',
      due,
      effortMinutes: 30,
      urgency: 'medium',
      priority: 62,
      status: 'ready',
      energy: 'light',
      context: 'Quick-captured by the user. Lifeline should clarify and schedule it.',
      blockers: [],
      steps: ['Clarify next action', 'Schedule focus block'],
      completed: false,
    }
    try {
      const response = await createTask({
        title,
        category: 'Inbox',
        due,
        context: localTask.context,
      })
      setTasks(response.tasks)
      setSelectedTaskId(response.task.id)
    } catch {
      setTasks((current) => [localTask, ...current])
      setSelectedTaskId(localTask.id)
    }
    setNotice('Task captured. Ask Lifeline to re-plan around it.')
  }

  async function handleComplete(task: Task) {
    const patch: Partial<Task> = {
      completed: !task.completed,
      status: task.completed ? 'ready' : 'done',
    }
    try {
      const response = await updateTask(task.id, patch)
      setTasks(response.tasks)
    } catch {
      setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, ...patch } : item)))
    }
    setNotice(task.completed ? 'Task reopened.' : 'Task marked complete. Risk reduced.')
  }

  async function handleSchedule(block?: FocusBlock) {
    if (!selectedTask && !block) return
    const nextBlock = { ...(block ?? nextHourBlock(selectedTask)), id: block?.id ?? `fb-${crypto.randomUUID()}` }
    try {
      const response = await createFocusBlock(nextBlock)
      setFocusBlocks(response.focusBlocks)
    } catch {
      setFocusBlocks((current) => [...current, nextBlock])
    }
    setNotice('Focus block scheduled. Calendar export is ready.')
  }

  function handleExport() {
    const block = focusBlocks[0] ?? plan?.focusBlocks[0]
    if (block) {
      downloadIcs(block)
      setNotice('Calendar file downloaded.')
    }
  }

  function handleHabitToggle(id: string) {
    setHabits((current) =>
      current.map((habit) => (habit.id === id ? { ...habit, doneToday: habit.doneToday > 0 ? 0 : 1 } : habit)),
    )
  }

  const activePlanMode = plan?.mode ?? (isPlanning ? 'loading' : 'demo')

  if (!selectedTask) {
    return (
      <main className="empty-state">
        <LoaderCircle className="spin" size={24} />
        <span>{notice}</span>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="workspace">
        <Header onPlan={() => void runPlan()} isPlanning={isPlanning} mode={activePlanMode} model={plan?.model ?? 'gemini-3.5-flash'} />
        <section className="status-strip" aria-live="polite">
          <div>
            <p className="section-label">Today</p>
            <h1>Deadline command center</h1>
          </div>
          <Metric label="Risk score" value={`${plan?.riskScore ?? 86}%`} tone="danger" />
          <Metric label="Deep work" value={`${focusBlocks.filter((block) => block.mode === 'deep').length} blocks`} tone="good" />
          <Metric label="Status" value={notice} tone="info" />
        </section>

        <div className="dashboard-grid">
          <div className="main-column">
            <QuickAdd onAdd={(title) => void handleAddTask(title)} />
            <RescueQueue tasks={tasks} selectedTask={selectedTask} onSelect={setSelectedTaskId} onComplete={(task) => void handleComplete(task)} />
            <SelectedTaskPanel task={selectedTask} onSchedule={() => void handleSchedule()} onExport={handleExport} />
          </div>
          <div className="plan-column">
            <AiPlanPanel plan={plan} onAddBlock={(block) => void handleSchedule(block)} isPlanning={isPlanning} />
          </div>
          <div className="side-column">
            <Timeline focusBlocks={focusBlocks} tasks={tasks} />
            <HabitPanel habits={habits} onToggle={handleHabitToggle} />
            <AssistantComposer
              message={message}
              setMessage={setMessage}
              onSubmit={() => void runPlan(message)}
              disabled={isPlanning}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
