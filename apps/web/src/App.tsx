import { useEffect, useState } from 'react'

import { readLocalStorageJSON, writeLocalStorageJSON } from './browserStorage'
import { AppShell } from './components/AppShell'
import { FocusTimerPanel } from './components/FocusTimerPanel'
import { Header } from './components/Header'
import { PrivacyNote } from './components/PrivacyNote'
import { ReadAloudPanel } from './components/ReadAloudPanel'
import { TimeTrackerPanel } from './components/TimeTrackerPanel'
import { TinyTodoPanel } from './components/TinyTodoPanel'
import { toolDefinitions, type ToolDefinition, type ToolId } from './tools'

type ReadingComfort = 'standard' | 'comfort' | 'hyperlegible' | 'dyslexia'

const DEFAULT_TOOL: ToolId = 'focus-timer'
const READING_COMFORT_STORAGE_KEY = 'adhdtoolbox.readingComfort'

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

type ReadingComfortSelectorProps = {
  value: ReadingComfort
  onChange: (nextValue: ReadingComfort) => void
}

function ReadingComfortSelector({ value, onChange }: ReadingComfortSelectorProps) {
  return (
    <label className="reading-comfort">
      <span>Reading comfort</span>
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
  const [readingComfort, setReadingComfort] = useState(getInitialReadingComfort)

  useEffect(() => {
    writeLocalStorageJSON(READING_COMFORT_STORAGE_KEY, readingComfort)
  }, [readingComfort])

  return (
    <AppShell
      header={
        <Header
          actions={
            <>
              <PrivacyNote />
              <ReadingComfortSelector
                onChange={setReadingComfort}
                value={readingComfort}
              />
            </>
          }
        />
      }
      readingComfort={readingComfort}
    >
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
    </AppShell>
  )
}
