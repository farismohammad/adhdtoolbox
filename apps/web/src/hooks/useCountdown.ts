import { useEffect, useRef, useState } from 'react'

import { readLocalStorageJSON, writeLocalStorageJSON } from '../browserStorage'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'complete'

type UseCountdownOptions = {
  durationMs: number
  onComplete?: () => void
  /** When set, a running, paused, or finished countdown survives a page refresh. */
  storageKey?: string
}

type UseCountdownResult = {
  addTime: (additionalMs: number) => void
  canAddTime: boolean
  canPause: boolean
  canResume: boolean
  canStart: boolean
  canStop: boolean
  formattedTime: string
  pause: () => void
  /** Share of the current session still left, from 1 (full) to 0 (done). */
  progress: number
  remainingMs: number
  resume: () => void
  setIdleDuration: (nextDurationMs: number) => void
  start: (durationOverrideMs?: number) => void
  status: TimerStatus
  stop: (durationOverrideMs?: number) => void
}

type StoredCountdown = {
  status: Exclude<TimerStatus, 'idle'>
  endTimestampMs: number | null
  remainingMs: number
  totalMs: number
  idleDurationMs: number
}

type CountdownState = {
  status: TimerStatus
  endTimestampMs: number | null
  remainingMs: number
  totalMs: number
  idleDurationMs: number
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isStoredCountdown(value: unknown): value is StoredCountdown {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<StoredCountdown>

  return (
    (candidate.status === 'running' ||
      candidate.status === 'paused' ||
      candidate.status === 'complete') &&
    (candidate.endTimestampMs === null || isFiniteNumber(candidate.endTimestampMs)) &&
    isFiniteNumber(candidate.remainingMs) &&
    isFiniteNumber(candidate.totalMs) &&
    isFiniteNumber(candidate.idleDurationMs)
  )
}

function getInitialState(durationMs: number, storageKey?: string): CountdownState {
  const idleState: CountdownState = {
    status: 'idle',
    endTimestampMs: null,
    remainingMs: durationMs,
    totalMs: durationMs,
    idleDurationMs: durationMs,
  }

  if (!storageKey) {
    return idleState
  }

  const stored = readLocalStorageJSON<StoredCountdown | null>(storageKey, null, (value) =>
    isStoredCountdown(value),
  )

  if (!stored) {
    return idleState
  }

  if (stored.status === 'running') {
    if (stored.endTimestampMs === null) {
      return idleState
    }

    const remainingMs = stored.endTimestampMs - Date.now()

    // The timer ran out while the page was closed.
    if (remainingMs <= 0) {
      return { ...stored, status: 'complete', endTimestampMs: null, remainingMs: 0 }
    }

    return { ...stored, remainingMs }
  }

  return { ...stored, endTimestampMs: null }
}

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function useCountdown({
  durationMs,
  onComplete,
  storageKey,
}: UseCountdownOptions): UseCountdownResult {
  const [initialState] = useState(() => getInitialState(durationMs, storageKey))
  const [idleDurationMs, setIdleDurationMs] = useState(initialState.idleDurationMs)
  const [status, setStatus] = useState<TimerStatus>(initialState.status)
  const [remainingMs, setRemainingMs] = useState(initialState.remainingMs)
  const [totalMs, setTotalMs] = useState(initialState.totalMs)
  const [endTimestampMs, setEndTimestampMs] = useState<number | null>(initialState.endTimestampMs)

  const intervalIdRef = useRef<number | null>(null)
  const onCompleteRef = useRef(onComplete)
  const completeCountdownRef = useRef<() => void>(() => undefined)

  onCompleteRef.current = onComplete

  function clearIntervalRef() {
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current)
      intervalIdRef.current = null
    }
  }

  completeCountdownRef.current = () => {
    clearIntervalRef()
    setStatus('complete')
    setRemainingMs(0)
    setEndTimestampMs(null)
    onCompleteRef.current?.()
  }

  // Remaining time only changes on its own while running, and is then derived
  // from the end timestamp, so it is only stored for paused or finished timers.
  const storedRemainingMs = status === 'running' ? null : remainingMs

  useEffect(() => {
    if (!storageKey) {
      return
    }

    if (status === 'idle') {
      writeLocalStorageJSON(storageKey, null)
      return
    }

    const stored: StoredCountdown = {
      status,
      endTimestampMs,
      remainingMs: storedRemainingMs ?? 0,
      totalMs,
      idleDurationMs,
    }

    writeLocalStorageJSON(storageKey, stored)
  }, [endTimestampMs, idleDurationMs, status, storageKey, storedRemainingMs, totalMs])

  useEffect(() => {
    if (status !== 'running' || endTimestampMs === null) {
      return
    }

    const syncRemainingTime = () => {
      const nextRemainingMs = Math.max(endTimestampMs - Date.now(), 0)

      if (nextRemainingMs === 0) {
        completeCountdownRef.current()
        return
      }

      setRemainingMs(nextRemainingMs)
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncRemainingTime()
      }
    }

    syncRemainingTime()
    intervalIdRef.current = window.setInterval(syncRemainingTime, 250)
    window.addEventListener('focus', syncRemainingTime)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearIntervalRef()
      window.removeEventListener('focus', syncRemainingTime)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [endTimestampMs, status])

  useEffect(() => {
    return () => {
      clearIntervalRef()
    }
  }, [])

  function setIdleDuration(nextDurationMs: number) {
    setIdleDurationMs(nextDurationMs)

    if (status === 'idle' || status === 'complete') {
      setRemainingMs(nextDurationMs)
      setTotalMs(nextDurationMs)
    }
  }

  function start(durationOverrideMs?: number) {
    const nextDurationMs = durationOverrideMs ?? idleDurationMs

    if (nextDurationMs < 1) {
      return
    }

    clearIntervalRef()
    setIdleDurationMs(nextDurationMs)
    setRemainingMs(nextDurationMs)
    setTotalMs(nextDurationMs)
    setEndTimestampMs(Date.now() + nextDurationMs)
    setStatus('running')
  }

  function pause() {
    if (status !== 'running' || endTimestampMs === null) {
      return
    }

    clearIntervalRef()

    const nextRemainingMs = Math.max(endTimestampMs - Date.now(), 0)

    if (nextRemainingMs === 0) {
      completeCountdownRef.current()
      return
    }

    setRemainingMs(nextRemainingMs)
    setEndTimestampMs(null)
    setStatus('paused')
  }

  function resume() {
    if (status !== 'paused') {
      return
    }

    clearIntervalRef()
    setEndTimestampMs(Date.now() + remainingMs)
    setStatus('running')
  }

  function stop(durationOverrideMs?: number) {
    const nextDurationMs = durationOverrideMs ?? idleDurationMs

    clearIntervalRef()
    setIdleDurationMs(nextDurationMs)
    setRemainingMs(nextDurationMs)
    setTotalMs(nextDurationMs)
    setEndTimestampMs(null)
    setStatus('idle')
  }

  function addTime(additionalMs: number) {
    if (additionalMs <= 0) {
      return
    }

    if (status === 'paused') {
      setRemainingMs((currentRemainingMs) => currentRemainingMs + additionalMs)
      setTotalMs((currentTotalMs) => currentTotalMs + additionalMs)
      return
    }

    if (status !== 'running' || endTimestampMs === null) {
      return
    }

    clearIntervalRef()

    const nextRemainingMs = Math.max(endTimestampMs - Date.now(), 0) + additionalMs

    setRemainingMs(nextRemainingMs)
    setTotalMs((currentTotalMs) => currentTotalMs + additionalMs)
    setEndTimestampMs(Date.now() + nextRemainingMs)
  }

  const progress =
    status === 'idle' ? 1 : totalMs > 0 ? Math.min(Math.max(remainingMs / totalMs, 0), 1) : 0

  return {
    addTime,
    canAddTime: status === 'running' || status === 'paused',
    canPause: status === 'running',
    canResume: status === 'paused',
    canStart: status === 'idle' || status === 'complete',
    canStop: status !== 'idle',
    formattedTime: formatCountdown(remainingMs),
    pause,
    progress,
    remainingMs,
    resume,
    setIdleDuration,
    start,
    status,
    stop,
  }
}
