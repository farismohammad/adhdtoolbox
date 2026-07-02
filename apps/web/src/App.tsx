import { useState } from 'react'

import { FocusTimerPanel } from './components/FocusTimerPanel'
import { Header } from './components/Header'
import { ReadAloudPanel } from './components/ReadAloudPanel'
import { TimeTrackerPanel } from './components/TimeTrackerPanel'
import { TinyTodoPanel } from './components/TinyTodoPanel'

const DEFAULT_TOOL: ToolId = 'focus-timer'

type ToolId = 'read-aloud' | 'focus-timer' | 'tiny-todo' | 'time-tracker'
type ToolAccent = 'mauve' | 'blue' | 'teal' | 'peach'
type ToolDefinition = {
  id: ToolId
  name: string
  selectorLabel: string
  summary: string
  accent: ToolAccent
}

const toolDefinitions: ToolDefinition[] = [
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
    summary: 'Make it small enough to start.',
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

function renderToolPanel(toolId: ToolId) {
  switch (toolId) {
    case 'read-aloud':
      return <ReadAloudPanel />
    case 'focus-timer':
      return <FocusTimerPanel />
    case 'tiny-todo':
      return <TinyTodoPanel />
    case 'time-tracker':
      return <TimeTrackerPanel />
  }
}

type ToolSelectorProps = {
  selectedTool: ToolId
  tools: ToolDefinition[]
  onSelectTool: (toolId: ToolId) => void
}

function ToolSelector({ selectedTool, tools, onSelectTool }: ToolSelectorProps) {
  return (
    <nav aria-label="Choose a tool" className="tool-selector">
      {tools.map((tool) => {
        const isSelected = selectedTool === tool.id

        return (
          <button
            key={tool.id}
            aria-controls={`${tool.id}-panel`}
            aria-pressed={isSelected}
            className="tool-selector__button"
            data-accent={tool.accent}
            onClick={() => onSelectTool(tool.id)}
            type="button"
          >
            <span className="tool-selector__eyebrow">{tool.name}</span>
            <span className="tool-selector__label">{tool.selectorLabel}</span>
            <span className="tool-selector__hint" id={`${tool.id}-hint`}>
              {isSelected ? 'Selected' : tool.summary}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

type ActiveToolPanelProps = {
  selectedTool: ToolId
  tools: ToolDefinition[]
}

function ActiveToolPanel({ selectedTool, tools }: ActiveToolPanelProps) {
  return (
    <section className="active-tool" aria-label="Selected tool">
      {tools.map((tool) => {
        const isSelected = selectedTool === tool.id

        return (
          <section
            key={tool.id}
            aria-labelledby={`${tool.id}-title`}
            className="active-tool__panel"
            data-accent={tool.accent}
            hidden={!isSelected}
            id={`${tool.id}-panel`}
          >
            <header className="active-tool__header">
              <p>{tool.summary}</p>
              <h2 id={`${tool.id}-title`}>{tool.name}</h2>
            </header>

            <div className="active-tool__body">{renderToolPanel(tool.id)}</div>
          </section>
        )
      })}
    </section>
  )
}

export default function App() {
  const [selectedTool, setSelectedTool] = useState<ToolId>(DEFAULT_TOOL)

  return (
    <div className="app-shell" id="top">
      <Header />
      <main className="page-frame app-main">
        <aside className="tool-picker" aria-labelledby="tool-picker-title">
          <div className="tool-picker__intro">
            <p className="tool-picker__eyebrow">Workspace</p>
            <h1 id="tool-picker-title">Choose one tool.</h1>
            <p className="tool-picker__copy">
              Keep one focused screen open at a time.
            </p>
          </div>
          <ToolSelector
            onSelectTool={setSelectedTool}
            selectedTool={selectedTool}
            tools={toolDefinitions}
          />
        </aside>

        <ActiveToolPanel selectedTool={selectedTool} tools={toolDefinitions} />
      </main>
    </div>
  )
}
