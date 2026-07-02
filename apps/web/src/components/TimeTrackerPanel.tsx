import { clipDurationToLocalDay, formatLocalDayDuration } from '../time'
import { TIME_TRACKER_QUICK_LABELS, useTimeTracker, type TimeSession } from '../hooks/useTimeTracker'
import { Button } from './Button'

function getSessionDurationForToday(session: TimeSession, nowMs: number) {
  const startedAtMs = new Date(session.startedAt).getTime()
  const endedAtMs = session.endedAt ? new Date(session.endedAt).getTime() : nowMs

  return clipDurationToLocalDay(startedAtMs, endedAtMs, nowMs)
}

function formatClock(dateIso: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateIso))
}

export function TimeTrackerPanel() {
  const {
    activeSession,
    canReset,
    canStart,
    canStop,
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

  return (
    <div className="time-tracker-panel section-stack">
      <div className="time-tracker-panel__composer section-stack tool-input-group">
        <label className="field">
          <span className="field__label">Optional label</span>
          <input
            className="ui-input"
            onChange={(event) => setLabelInput(event.target.value)}
            placeholder="What are you about to spend time on?"
            value={labelInput}
          />
        </label>

        <div className="control-row tool-control-row time-tracker-panel__controls" aria-label="Quick labels">
          {TIME_TRACKER_QUICK_LABELS.map((label) => (
            <Button key={label} disabled={!canStart} onClick={() => startSession(label)} variant="chip">
              {label}
            </Button>
          ))}
          <Button disabled={!canStart} onClick={() => startSession()} variant="primary">
            Start
          </Button>
          <Button disabled={!canStop} onClick={stopSession}>
            Stop
          </Button>
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
                <span>Started {formatClock(activeSession.startedAt)}</span>
                <span>{formatLocalDayDuration(activeDurationMs)} elapsed</span>
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
                    <span>{formatClock(session.startedAt)}</span>
                    <span>{session.endedAt ? formatClock(session.endedAt) : 'Now'}</span>
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
