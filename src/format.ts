import type { FocusBlock, Task } from './types'

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
})

export function formatTime(value: string) {
  return timeFormatter.format(new Date(value))
}

export function formatDateTime(value: string) {
  const date = new Date(value)
  return `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`
}

export function minutesUntil(value: string) {
  return Math.max(0, Math.round((new Date(value).getTime() - Date.now()) / 60000))
}

export function taskDeadlineLabel(task: Task) {
  const minutes = minutesUntil(task.due)
  if (minutes < 60) return `${minutes}m left`
  if (minutes < 1440) return `${Math.round(minutes / 60)}h left`
  return `${Math.round(minutes / 1440)}d left`
}

export function blockRange(block: FocusBlock) {
  return `${formatTime(block.start)} - ${formatTime(block.end)}`
}

export function googleCalendarUrl(block: FocusBlock) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: block.title,
    dates: `${toUtc(block.start)}/${toUtc(block.end)}`,
    details: block.reason,
    location: 'Deadline Lifeline',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function toUtc(value: string) {
  const date = new Date(value)
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}
