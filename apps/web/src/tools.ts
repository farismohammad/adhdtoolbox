export type ToolId = 'read-aloud' | 'focus-timer' | 'tiny-todo' | 'time-tracker'

export type ToolAccent = 'mauve' | 'blue' | 'teal' | 'peach'

export type ToolDefinition = {
  id: ToolId
  name: string
  selectorLabel: string
  summary: string
  accent: ToolAccent
}

export const toolDefinitions: ToolDefinition[] = [
  {
    id: 'read-aloud',
    name: 'Read Aloud',
    selectorLabel: 'Read aloud',
    summary: 'Paste text and listen.',
    accent: 'mauve',
  },
  {
    id: 'focus-timer',
    name: 'Focus Timer',
    selectorLabel: 'Start focusing',
    summary: 'Start a focus timer.',
    accent: 'blue',
  },
  {
    id: 'tiny-todo',
    name: 'Tiny Todo',
    selectorLabel: 'Capture one task',
    summary: 'Write one tiny next step.',
    accent: 'teal',
  },
  {
    id: 'time-tracker',
    name: 'Time Tracker',
    selectorLabel: 'Track time',
    summary: 'Track what you are doing.',
    accent: 'peach',
  },
]
