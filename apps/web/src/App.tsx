import { useEffect, useState } from 'react'

import { readLocalStorageJSON, writeLocalStorageJSON } from './browserStorage'
import { FocusTimerPanel } from './components/FocusTimerPanel'
import { Header } from './components/Header'
import { ReadAloudPanel } from './components/ReadAloudPanel'
import { TimeTrackerPanel } from './components/TimeTrackerPanel'
import { TinyTodoPanel } from './components/TinyTodoPanel'

const DEFAULT_TOOL: ToolId = 'focus-timer'
const READING_COMFORT_STORAGE_KEY = 'adhdtoolbox.readingComfort'
const LAST_TOOL_STORAGE_KEY = 'adhdtoolbox.lastTool'

type ReadingComfort = 'standard' | 'comfort' | 'hyperlegible' | 'dyslexia'
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

const readingComfortOptions: Array<{ id: ReadingComfort; label: string }> = [
  { id: 'standard', label: 'Standard' },
  { id: 'comfort', label: 'Comfort' },
  { id: 'hyperlegible', label: 'Hyperlegible' },
  { id: 'dyslexia', label: 'Dyslexia' },
]

function isReadingComfort(value: unknown): value is ReadingComfort {
  return (
    value === 'standard' ||
    value === 'comfort' ||
    value === 'hyperlegible' ||
    value === 'dyslexia'
  )
}

function isToolId(value: unknown): value is ToolId {
  return toolDefinitions.some((tool) => tool.id === value)
}

function getToolFromHash() {
  const hashValue = window.location.hash.slice(1)

  return isToolId(hashValue) ? hashValue : null
}

// A link like /#tiny-todo opens that tool; otherwise reopen the last tool used.
function getInitialTool() {
  return getToolFromHash() ?? readLocalStorageJSON(LAST_TOOL_STORAGE_KEY, DEFAULT_TOOL, isToolId)
}

function getInitialReadingComfort() {
  return readLocalStorageJSON<ReadingComfort>(
    READING_COMFORT_STORAGE_KEY,
    'standard',
    isReadingComfort,
  )
}

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

type ReadingComfortSelectorProps = {
  value: ReadingComfort
  onChange: (nextValue: ReadingComfort) => void
}

function ReadingComfortSelector({ value, onChange }: ReadingComfortSelectorProps) {
  return (
    <label className="reading-comfort">
      <span className="reading-comfort__label">Reading comfort</span>
      <span aria-hidden="true" className="reading-comfort__short-label">
        Aa
      </span>
      <select
        aria-label="Reading comfort"
        className="ui-input reading-comfort__select"
        onChange={(event) => {
          const nextValue = event.target.value

          if (isReadingComfort(nextValue)) {
            onChange(nextValue)
          }
        }}
        value={value}
      >
        {readingComfortOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function App() {
  const [selectedTool, setSelectedTool] = useState<ToolId>(getInitialTool)
  const [readingComfort, setReadingComfort] = useState(getInitialReadingComfort)

  useEffect(() => {
    writeLocalStorageJSON(READING_COMFORT_STORAGE_KEY, readingComfort)
  }, [readingComfort])

  useEffect(() => {
    writeLocalStorageJSON(LAST_TOOL_STORAGE_KEY, selectedTool)
  }, [selectedTool])

  // Keep the URL in step with the open tool so it can be bookmarked and the
  // browser's Back button returns to the previous tool.
  useEffect(() => {
    if (!getToolFromHash()) {
      window.history.replaceState(null, '', `#${selectedTool}`)
    }

    function handleHashChange() {
      const toolFromHash = getToolFromHash()

      if (toolFromHash) {
        setSelectedTool(toolFromHash)
      }
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
    // Only the initial tool needs writing to the URL; later changes push entries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function selectTool(toolId: ToolId) {
    if (toolId === selectedTool) {
      return
    }

    window.history.pushState(null, '', `#${toolId}`)
    setSelectedTool(toolId)
  }

  return (
    <div className={`app-shell reading-comfort--${readingComfort}`} id="top">
      <Header
        actions={
          <ReadingComfortSelector
            onChange={setReadingComfort}
            value={readingComfort}
          />
        }
      />
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
            onSelectTool={selectTool}
            selectedTool={selectedTool}
            tools={toolDefinitions}
          />
        </aside>

        <ActiveToolPanel selectedTool={selectedTool} tools={toolDefinitions} />
      </main>
    </div>
  )
}
