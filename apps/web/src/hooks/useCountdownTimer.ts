import { useEffect, useRef, useState } from 'react'

import { readLocalStorageJSON, writeLocalStorageJSON } from '../browserStorage'
import { useCountdown } from './useCountdown'
import { playGentleChime } from './timerAudio'
import {
  canUseNotifications,
  hasNotificationPermission,
  requestNotificationPermission,
  showTimeUpNotification,
} from './timerNotifications'

const DEFAULT_DURATION_MINUTES = 25
const FIVE_MINUTES_MS = 5 * 60 * 1000
const ONE_MINUTE_MS = 60 * 1000
const STORAGE_KEY = 'adhdtoolbox.focusTimer.lastDurationMinutes'
const TIMER_STORAGE_KEY = 'adhdtoolbox.focusTimer.timer'
const SOUND_STORAGE_KEY = 'adhdtoolbox.focusTimer.soundEnabled'
const NOTIFY_STORAGE_KEY = 'adhdtoolbox.focusTimer.notifyEnabled'

export const FOCUS_TIMER_PRESETS = [2, 5, 10, 15, 25] as const

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

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
  const [soundEnabled, setSoundEnabled] = useState(() =>
    readLocalStorageJSON(SOUND_STORAGE_KEY, true, isBoolean),
  )
  const [notifyEnabled, setNotifyEnabled] = useState(
    () => readLocalStorageJSON(NOTIFY_STORAGE_KEY, false, isBoolean) && hasNotificationPermission(),
  )

  const soundEnabledRef = useRef(soundEnabled)
  const notifyEnabledRef = useRef(notifyEnabled)

  soundEnabledRef.current = soundEnabled
  notifyEnabledRef.current = notifyEnabled

  const countdown = useCountdown({
    durationMs: selectedDurationMinutes * ONE_MINUTE_MS,
    storageKey: TIMER_STORAGE_KEY,
    onComplete: () => {
      if (soundEnabledRef.current) {
        void playGentleChime()
      }

      if (notifyEnabledRef.current) {
        showTimeUpNotification('Your focus session is complete.')
      }
    },
  })

  const isTimerActive = countdown.status === 'running' || countdown.status === 'paused'

  useEffect(() => {
    writeLocalStorageJSON(STORAGE_KEY, selectedDurationMinutes)
  }, [selectedDurationMinutes])

  useEffect(() => {
    writeLocalStorageJSON(SOUND_STORAGE_KEY, soundEnabled)
  }, [soundEnabled])

  useEffect(() => {
    writeLocalStorageJSON(NOTIFY_STORAGE_KEY, notifyEnabled)
  }, [notifyEnabled])

  // The length is locked while a session runs so a stray tap cannot reset progress.
  function selectPreset(minutes: number) {
    if (isTimerActive) {
      return
    }

    setSelectedDurationMinutes(minutes)
    setCustomMinutesInput(String(minutes))
    countdown.setIdleDuration(minutes * ONE_MINUTE_MS)
  }

  function commitCustomMinutes() {
    const parsedMinutes = parseWholeMinutes(customMinutesInput)

    if (isTimerActive || parsedMinutes === null) {
      setCustomMinutesInput(String(selectedDurationMinutes))
      return false
    }

    setSelectedDurationMinutes(parsedMinutes)
    setCustomMinutesInput(String(parsedMinutes))
    countdown.setIdleDuration(parsedMinutes * ONE_MINUTE_MS)

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

  async function toggleNotify(nextValue: boolean) {
    if (!nextValue) {
      setNotifyEnabled(false)
      return
    }

    setNotifyEnabled(await requestNotificationPermission())
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
    canChangeDuration: !isTimerActive,
    canNotify: canUseNotifications(),
    canPause: countdown.canPause,
    canResume: countdown.canResume,
    canStart: countdown.canStart,
    canStop: countdown.canStop,
    commitCustomMinutes,
    countdownLabel,
    customMinutesInput,
    formattedTime,
    notifyEnabled,
    pause: countdown.pause,
    progress: countdown.progress,
    resume: countdown.resume,
    selectedDurationMinutes,
    setCustomMinutesInput,
    soundEnabled,
    start,
    status: countdown.status,
    statusMessage,
    stop: () => countdown.stop(selectedDurationMinutes * ONE_MINUTE_MS),
    selectPreset,
    toggleNotify,
    toggleSound,
  }
}
