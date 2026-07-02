import type { KeyboardEvent } from 'react'

import { FOCUS_TIMER_PRESETS, useCountdownTimer } from '../hooks/useCountdownTimer'
import { Button } from './Button'

export function FocusTimerPanel() {
  const {
    addFiveMinutes,
    canAddFiveMinutes,
    canPause,
    canResume,
    canStart,
    canStop,
    commitCustomMinutes,
    countdownLabel,
    customMinutesInput,
    formattedTime,
    pause,
    resume,
    selectedDurationMinutes,
    setCustomMinutesInput,
    soundEnabled,
    start,
    status,
    statusMessage,
    stop,
    selectPreset,
    toggleSound,
  } = useCountdownTimer()

  function handleCustomMinutesEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    event.currentTarget.blur()
  }

  return (
    <div className="focus-timer-panel section-stack">
      <div className="preview-grid focus-timer-panel__grid">
        <div aria-live="polite" className={`countdown-display countdown-display--${status} tool-card`}>
          <span className="countdown-display__label">{countdownLabel}</span>
          <strong>{formattedTime}</strong>
          <p className="countdown-display__status">{statusMessage}</p>
        </div>

        <div className="focus-timer-panel__controls tool-card section-stack">
          <div className="control-row tool-control-row focus-timer-panel__preset-row" aria-label="Preset focus times">
            {FOCUS_TIMER_PRESETS.map((minutes) => (
              <Button
                key={minutes}
                aria-pressed={selectedDurationMinutes === minutes}
                className="focus-preset"
                onClick={() => selectPreset(minutes)}
                variant="chip"
              >
                {minutes} min
              </Button>
            ))}
          </div>

          <div className="control-row tool-control-row focus-timer-panel__actions" aria-label="Timer controls">
            <Button disabled={!canStart} onClick={start} variant="primary">
              Start
            </Button>
            <Button
              disabled={!canPause && !canResume}
              onClick={status === 'paused' ? resume : pause}
              variant={status === 'paused' ? 'primary' : 'secondary'}
            >
              {status === 'paused' ? 'Continue' : 'Pause'}
            </Button>
            <Button disabled={!canAddFiveMinutes} onClick={addFiveMinutes}>
              Add 5 min
            </Button>
            <Button disabled={!canStop} onClick={stop}>
              Stop
            </Button>
          </div>

          <div className="focus-timer-panel__sidebar section-stack tool-input-group">
            <label className="field">
              <span className="field__label">Custom minutes</span>
              <input
                className="ui-input"
                inputMode="numeric"
                min={1}
                onBlur={commitCustomMinutes}
                onChange={(event) => setCustomMinutesInput(event.target.value)}
                onKeyDown={handleCustomMinutesEnter}
                pattern="[0-9]*"
                placeholder="30"
                value={customMinutesInput}
              />
            </label>

            <label className="toggle-row">
              <input
                checked={soundEnabled}
                className="toggle-row__checkbox"
                onChange={(event) => toggleSound(event.target.checked)}
                type="checkbox"
              />
              <span>Play gentle sound on complete</span>
            </label>

            <p className="focus-timer-panel__meta">
              Selected duration is saved in this browser. Sound stays off unless you switch it on
              for this session.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
