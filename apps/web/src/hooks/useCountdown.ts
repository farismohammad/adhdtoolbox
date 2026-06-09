import { useEffect, useRef, useState } from 'react'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'complete'

type UseCountdownOptions = {
  durationMs: number
  onComplete?: () => void
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
  remainingMs: number
  resume: () => void
  setIdleDuration: (nextDurationMs: number) => void
  start: (durationOverrideMs?: number) => void
  status: TimerStatus
  stop: (durationOverrideMs?: number) => void
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
}: UseCountdownOptions): UseCountdownResult {
  const [idleDurationMs, setIdleDurationMs] = useState(durationMs)
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [remainingMs, setRemainingMs] = useState(durationMs)
  const [endTimestampMs, setEndTimestampMs] = useState<number | null>(null)

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

  useEffect(() => {
    setIdleDurationMs(durationMs)

    if (status === 'idle' || status === 'complete') {
      setRemainingMs(durationMs)
    }
  }, [durationMs, status])

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
    setEndTimestampMs(null)
    setStatus('idle')
  }

  function addTime(additionalMs: number) {
    if (additionalMs <= 0) {
      return
    }

    if (status === 'paused') {
      setRemainingMs((currentRemainingMs) => currentRemainingMs + additionalMs)
      return
    }

    if (status !== 'running' || endTimestampMs === null) {
      return
    }

    clearIntervalRef()

    const nextRemainingMs = Math.max(endTimestampMs - Date.now(), 0) + additionalMs

    setRemainingMs(nextRemainingMs)
    setEndTimestampMs(Date.now() + nextRemainingMs)
  }

  return {
    addTime,
    canAddTime: status === 'running' || status === 'paused',
    canPause: status === 'running',
    canResume: status === 'paused',
    canStart: status === 'idle' || status === 'complete',
    canStop: status !== 'idle',
    formattedTime: formatCountdown(remainingMs),
    pause,
    remainingMs,
    resume,
    setIdleDuration,
    start,
    status,
    stop,
  }
}
