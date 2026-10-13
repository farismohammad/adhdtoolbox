import type { KeyboardEvent } from 'react'

import { FOCUS_TIMER_PRESETS, useCountdownTimer } from '../hooks/useCountdownTimer'
import { getTimerTitlePart, useDocumentTitlePart } from '../hooks/useDocumentTitle'
import { Button } from './Button'
import { CountdownProgress } from './CountdownProgress'

export function FocusTimerPanel() {
  const {
    addFiveMinutes,
    canAddFiveMinutes,
    canChangeDuration,
    canNotify,
    canPause,
    canResume,
    canStart,
    canStop,
    commitCustomMinutes,
    countdownLabel,
    customMinutesInput,
    formattedTime,
    notifyEnabled,
    pause,
    progress,
    resume,
    selectedDurationMinutes,
    setCustomMinutesInput,
    soundEnabled,
    start,
    status,
    statusMessage,
    stop,
    selectPreset,
    toggleNotify,
    toggleSound,
  } = useCountdownTimer()

  useDocumentTitlePart(getTimerTitlePart(status, formattedTime, 'Focus'))

  function handleCustomMinutesEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    event.currentTarget.blur()
  }

  return (
    <div className="focus-timer-panel section-stack">
      <div className={`countdown-display countdown-display--${status} countdown-display--hero tool-card`}>
        <span className="countdown-display__label">{countdownLabel}</span>
        <strong>{formattedTime}</strong>
        <CountdownProgress progress={progress} status={status} />
        <p aria-live="polite" className="countdown-display__status">
          {statusMessage}
        </p>
      </div>

      <div className="focus-timer-panel__controls tool-card">
        <div className="focus-timer-panel__main-controls section-stack">
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

          <div
            className="control-row tool-control-row focus-timer-panel__preset-row"
            role="group"
            aria-label="Preset focus times"
          >
            {FOCUS_TIMER_PRESETS.map((minutes) => (
              <Button
                key={minutes}
                aria-pressed={selectedDurationMinutes === minutes}
                className="focus-preset"
                disabled={!canChangeDuration}
                onClick={() => selectPreset(minutes)}
                variant="chip"
              >
                {minutes} min
              </Button>
            ))}
          </div>

          {!canChangeDuration ? (
            <p className="focus-timer-panel__meta">
              Length is locked while the timer runs. Use Add 5 min, or Stop to pick a new length.
            </p>
          ) : null}
        </div>

        <div className="focus-timer-panel__sidebar section-stack tool-input-group">
          <label className="field">
            <span className="field__label">Custom minutes</span>
            <input
              className="ui-input"
              disabled={!canChangeDuration}
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

          <div className="focus-timer-panel__toggles">
            <label className="toggle-row">
              <input
                checked={soundEnabled}
                className="toggle-row__checkbox"
                onChange={(event) => toggleSound(event.target.checked)}
                type="checkbox"
              />
              <span>Play gentle sound when done</span>
            </label>

            {canNotify ? (
              <label className="toggle-row">
                <input
                  checked={notifyEnabled}
                  className="toggle-row__checkbox"
                  onChange={(event) => void toggleNotify(event.target.checked)}
                  type="checkbox"
                />
                <span>Notify me when time is up</span>
              </label>
            ) : null}
          </div>

          <p className="focus-timer-panel__meta">
            Your length, sound choice, and running timer are saved in this browser.
          </p>
        </div>
      </div>
    </div>
  )
}
