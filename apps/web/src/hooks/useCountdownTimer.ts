import { useEffect, useRef, useState } from 'react'

import { readLocalStorageJSON, writeLocalStorageJSON } from '../browserStorage'
import { useCountdown } from './useCountdown'
import { playGentleChime } from './timerAudio'

const DEFAULT_DURATION_MINUTES = 25
const FIVE_MINUTES_MS = 5 * 60 * 1000
const ONE_MINUTE_MS = 60 * 1000
const STORAGE_KEY = 'adhdtoolbox.focusTimer.lastDurationMinutes'

export const FOCUS_TIMER_PRESETS = [2, 5, 10, 15, 25] as const

function getInitialSelectedDuration() {
  return readLocalStorageJSON(
    STORAGE_KEY,
    DEFAULT_DURATION_MINUTES,
    (value): value is number =>
      typeof value === 'number' && Number.isSafeInteger(value) && value >= 1,
  )
}

function parseWholeMinutes(value: string) {
  const trimmedValue = value.trim()

  if (!/^\d+$/.test(trimmedValue)) {
    return null
  }

  const minutes = Number.parseInt(trimmedValue, 10)

  if (!Number.isSafeInteger(minutes) || minutes < 1) {
    return null
  }

  return minutes
}

export function useCountdownTimer() {
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState(getInitialSelectedDuration)
  const [customMinutesInput, setCustomMinutesInput] = useState(() =>
    String(getInitialSelectedDuration()),
  )
  const [soundEnabled, setSoundEnabled] = useState(false)

  const soundEnabledRef = useRef(soundEnabled)

  soundEnabledRef.current = soundEnabled

  const countdown = useCountdown({
    durationMs: selectedDurationMinutes * ONE_MINUTE_MS,
    onComplete: () => {
      if (soundEnabledRef.current) {
        void playGentleChime()
      }
    },
  })

  useEffect(() => {
    writeLocalStorageJSON(STORAGE_KEY, selectedDurationMinutes)
  }, [selectedDurationMinutes])

  function selectPreset(minutes: number) {
    setSelectedDurationMinutes(minutes)
    setCustomMinutesInput(String(minutes))

    countdown.setIdleDuration(minutes * ONE_MINUTE_MS)

    if (countdown.status === 'running') {
      countdown.start(minutes * ONE_MINUTE_MS)
    }
  }

  function commitCustomMinutes() {
    const parsedMinutes = parseWholeMinutes(customMinutesInput)

    if (parsedMinutes === null) {
      setCustomMinutesInput(String(selectedDurationMinutes))
      return false
    }

    setSelectedDurationMinutes(parsedMinutes)
    setCustomMinutesInput(String(parsedMinutes))

    countdown.setIdleDuration(parsedMinutes * ONE_MINUTE_MS)

    if (countdown.status === 'running') {
      countdown.start(parsedMinutes * ONE_MINUTE_MS)
    }

    return true
  }

  function start() {
    if (!countdown.canStart) {
      return
    }

    countdown.start(selectedDurationMinutes * ONE_MINUTE_MS)
  }

  function addFiveMinutes() {
    countdown.addTime(FIVE_MINUTES_MS)
  }

  function toggleSound(nextValue: boolean) {
    setSoundEnabled(nextValue)
  }

  const formattedTime = countdown.formattedTime
  const countdownLabel =
    countdown.status === 'complete'
      ? 'Complete'
      : countdown.status === 'paused'
        ? 'Paused'
        : countdown.status === 'running'
          ? 'Time remaining'
          : 'Next session'
  const statusMessage =
    countdown.status === 'complete'
      ? 'Session complete. What next?'
      : countdown.status === 'paused'
        ? 'Paused in place. Continue when you are ready.'
        : countdown.status === 'running'
          ? 'Stay with the current sprint.'
          : 'Pick a preset or enter your own duration.'

  return {
    addFiveMinutes,
    canAddFiveMinutes: countdown.canAddTime,
    canPause: countdown.canPause,
    canResume: countdown.canResume,
    canStart: countdown.canStart,
    canStop: countdown.canStop,
    commitCustomMinutes,
    countdownLabel,
    customMinutesInput,
    formattedTime,
    pause: countdown.pause,
    resume: countdown.resume,
    selectedDurationMinutes,
    setCustomMinutesInput,
    soundEnabled,
    start,
    status: countdown.status,
    statusMessage,
    stop: () => countdown.stop(selectedDurationMinutes * ONE_MINUTE_MS),
    selectPreset,
    toggleSound,
  }
}
