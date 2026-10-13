import type { KeyboardEvent } from 'react'

import { clipDurationToLocalDay, formatLocalDayDuration } from '../time'
import { useDocumentTitlePart } from '../hooks/useDocumentTitle'
import { TIME_TRACKER_QUICK_LABELS, useTimeTracker, type TimeSession } from '../hooks/useTimeTracker'
import { Button } from './Button'

const clockFormat = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
})

function getSessionDurationForToday(session: TimeSession, nowMs: number) {
  const startedAtMs = new Date(session.startedAt).getTime()
  const endedAtMs = session.endedAt ? new Date(session.endedAt).getTime() : nowMs

  return clipDurationToLocalDay(startedAtMs, endedAtMs, nowMs)
}

function formatClock(dateIso: string) {
  return clockFormat.format(new Date(dateIso))
}

function formatTimeRange(startIso: string, endIso: string) {
  const start = new Date(startIso)
  const end = new Date(endIso)

  try {
    return clockFormat.formatRange(start, end)
  } catch {
    return `${clockFormat.format(start)} – ${clockFormat.format(end)}`
  }
}

export function TimeTrackerPanel() {
  const {
    activeSession,
    canReset,
    canStart,
    canStop,
    deleteSession,
    labelInput,
    nowMs,
    sessions,
    setLabelInput,
    startSession,
    stopSession,
    resetSessions,
  } = useTimeTracker()

  const todaySessions = sessions
    .map((session) => ({
      ...session,
      todayDurationMs: getSessionDurationForToday(session, nowMs),
    }))
    .filter((session) => session.todayDurationMs > 0)

  const totalTodayMs = todaySessions.reduce(
    (totalDurationMs, session) => totalDurationMs + session.todayDurationMs,
    0,
  )

  const activeDurationMs = activeSession
    ? nowMs - new Date(activeSession.startedAt).getTime()
    : 0

  useDocumentTitlePart(
    activeSession
      ? `⏱ ${formatLocalDayDuration(activeDurationMs)} ${activeSession.label || 'Tracking'}`
      : null,
  )

  function handleLabelKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    startSession()
  }

  return (
    <div className="time-tracker-panel section-stack">
      <div className="time-tracker-panel__composer section-stack tool-input-group">
        <label className="field">
          <span className="field__label">Optional label</span>
          <input
            className="ui-input"
            enterKeyHint="go"
            onChange={(event) => setLabelInput(event.target.value)}
            onKeyDown={handleLabelKeyDown}
            placeholder="What are you working on?"
            value={labelInput}
          />
        </label>

        <div className="time-tracker-panel__action-bar">
          <div className="time-tracker-panel__quick" role="group" aria-labelledby="quick-start-label">
            <span className="time-tracker-panel__quick-label" id="quick-start-label">
              Quick start
            </span>
            {TIME_TRACKER_QUICK_LABELS.map((label) => (
              <Button key={label} disabled={!canStart} onClick={() => startSession(label)} variant="chip">
                {label}
              </Button>
            ))}
          </div>

          <div className="control-row tool-control-row time-tracker-panel__controls" role="group" aria-label="Tracking controls">
            <Button disabled={!canStart} onClick={() => startSession()} variant="primary">
              Start
            </Button>
            <Button disabled={!canStop} onClick={stopSession}>
              Stop
            </Button>
          </div>
        </div>
      </div>

      <div className="preview-grid time-tracker-panel__grid">
        <div className="tracker-active section-stack tool-card">
          <div className="tracker-active__header">
            <span className="tiny-todo-focus__eyebrow">Active session</span>
            <Button className="tracker-reset" disabled={!canReset} onClick={resetSessions}>
              Reset data
            </Button>
          </div>

          {activeSession ? (
            <div className="tracker-session tracker-session--active tool-card" aria-live="polite">
              <div className="tracker-session__header">
                <strong>{activeSession.label || 'Unlabeled session'}</strong>
                <span className="tracker-session__badge">Tracking</span>
              </div>
              <div className="tracker-session__meta">
                <span>
                  Started {formatClock(activeSession.startedAt)} · {formatLocalDayDuration(activeDurationMs)} elapsed
                </span>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <strong>No session running.</strong>
              <p>Start with a label, pick a quick label, or leave it blank when naming the work would slow you down.</p>
            </div>
          )}
        </div>

        <div className="tracker-today section-stack tool-card">
          <div className="tracker-today__header">
            <div className="tracker-today__headline">
              <span className="tiny-todo-focus__eyebrow">Today</span>
              <strong>{formatLocalDayDuration(totalTodayMs)} tracked</strong>
            </div>
          </div>

          {todaySessions.length ? (
            <ul className="tracker-session-list" aria-label="Today's sessions">
              {todaySessions.map((session) => (
                <li key={session.id} className="tracker-session tool-card">
                  <div className="tracker-session__header">
                    <strong>{session.label || 'Unlabeled session'}</strong>
                    <span>{formatLocalDayDuration(session.todayDurationMs)}</span>
                  </div>
                  <div className="tracker-session__meta">
                    <span>
                      {session.endedAt
                        ? formatTimeRange(session.startedAt, session.endedAt)
                        : `${formatClock(session.startedAt)} – now`}
                    </span>
                    <Button
                      aria-label={`Delete ${session.label || 'unlabeled'} session from ${formatClock(session.startedAt)}`}
                      className="tracker-session__delete"
                      onClick={() => deleteSession(session.id)}
                      variant="chip"
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <strong>Nothing tracked today.</strong>
              <p>Sessions crossing midnight still count here only for the portion that falls in today.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
