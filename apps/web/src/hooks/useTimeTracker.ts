import { useEffect, useState } from 'react'

import { readLocalStorageJSON, writeLocalStorageJSON } from '../browserStorage'

const STORAGE_KEY = 'adhdtoolbox.timeSessions'

export const TIME_TRACKER_QUICK_LABELS = ['studying', 'cleaning', 'admin', 'break'] as const

export type TimeSession = {
  id: string
  label?: string
  startedAt: string
  endedAt?: string
}

function isTimeSession(value: unknown): value is TimeSession {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<TimeSession>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.startedAt === 'string' &&
    (candidate.label === undefined || typeof candidate.label === 'string') &&
    (candidate.endedAt === undefined || typeof candidate.endedAt === 'string')
  )
}

function getInitialSessions() {
  return readLocalStorageJSON(STORAGE_KEY, [] as TimeSession[], (value): value is TimeSession[] => {
    return Array.isArray(value) && value.every(isTimeSession)
  })
}

export function useTimeTracker() {
  const [labelInput, setLabelInput] = useState('')
  const [sessions, setSessions] = useState<TimeSession[]>(getInitialSessions)
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    writeLocalStorageJSON(STORAGE_KEY, sessions)
  }, [sessions])

  const activeSession = sessions.find((session) => session.endedAt === undefined) ?? null

  useEffect(() => {
    if (!activeSession) {
      return
    }

    const intervalId = window.setInterval(() => {
      setNowMs(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [activeSession])

  function startSession(rawLabel?: string) {
    if (activeSession) {
      return false
    }

    const label = rawLabel?.trim() || labelInput.trim() || undefined

    setNowMs(Date.now())
    setSessions((currentSessions) => [
      {
        id: crypto.randomUUID(),
        label,
        startedAt: new Date().toISOString(),
      },
      ...currentSessions,
    ])
    setLabelInput('')

    return true
  }

  function stopSession() {
    if (!activeSession) {
      return
    }

    const endedAt = new Date().toISOString()

    setNowMs(Date.now())
    setSessions((currentSessions) =>
      currentSessions.map((session) =>
        session.id === activeSession.id
          ? {
              ...session,
              endedAt,
            }
          : session,
      ),
    )
  }

  function resetSessions() {
    if (typeof window !== 'undefined') {
      const shouldReset = window.confirm(
        'Reset all tracked sessions for this browser? This cannot be undone.',
      )

      if (!shouldReset) {
        return false
      }
    }

    setNowMs(Date.now())
    setSessions([])
    setLabelInput('')

    return true
  }

  return {
    activeSession,
    canReset: sessions.length > 0,
    canStart: activeSession === null,
    canStop: activeSession !== null,
    labelInput,
    nowMs,
    sessions,
    setLabelInput,
    startSession,
    stopSession,
    resetSessions,
  }
}
