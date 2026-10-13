import { useEffect, useRef, useState } from 'react'

import { readLocalStorageJSON, writeLocalStorageJSON } from '../browserStorage'
import { useCountdown, type TimerStatus } from './useCountdown'
import { playGentleChime } from './timerAudio'
import {
  canUseNotifications,
  hasNotificationPermission,
  requestNotificationPermission,
  showTimeUpNotification,
} from './timerNotifications'

const STORAGE_KEY = 'adhdtoolbox.tasks'
const SOUND_STORAGE_KEY = 'adhdtoolbox.tasks.soundEnabled'
const NOTIFY_STORAGE_KEY = 'adhdtoolbox.tasks.notifyEnabled'
const ACTIVE_TASK_STORAGE_KEY = 'adhdtoolbox.tasks.activeTaskId'
const TIMER_STORAGE_KEY = 'adhdtoolbox.tasks.timer'
const ONE_MINUTE_MS = 60 * 1000
const DEFAULT_IDLE_DURATION_MS = 5 * ONE_MINUTE_MS

export const TINY_TODO_PRESETS = [2, 5, 10, 15, 25] as const

export type Task = {
  id: string
  title: string
  durationMinutes?: number
  completed: boolean
  createdAt: string
  completedAt?: string
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<Task>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.completed === 'boolean' &&
    typeof candidate.createdAt === 'string' &&
    (candidate.durationMinutes === undefined ||
      (typeof candidate.durationMinutes === 'number' &&
        Number.isSafeInteger(candidate.durationMinutes) &&
        candidate.durationMinutes > 0)) &&
    (candidate.completedAt === undefined || typeof candidate.completedAt === 'string')
  )
}

function getInitialTasks() {
  return readLocalStorageJSON(STORAGE_KEY, [] as Task[], (value): value is Task[] => {
    return Array.isArray(value) && value.every(isTask)
  })
}

function getInitialSoundEnabled() {
  return readLocalStorageJSON(SOUND_STORAGE_KEY, true, (value): value is boolean => {
    return typeof value === 'boolean'
  })
}

function getInitialActiveTaskId(tasks: Task[]) {
  const storedTaskId = readLocalStorageJSON<string | null>(
    ACTIVE_TASK_STORAGE_KEY,
    null,
    (value): value is string => typeof value === 'string',
  )
  const isValid = tasks.some((task) => task.id === storedTaskId && !task.completed)

  if (!isValid) {
    // Drop a saved timer that no longer belongs to an open task.
    writeLocalStorageJSON(TIMER_STORAGE_KEY, null)
    return null
  }

  return storedTaskId
}

function getInitialNotifyEnabled() {
  return (
    readLocalStorageJSON(NOTIFY_STORAGE_KEY, false, (value): value is boolean => {
      return typeof value === 'boolean'
    }) && hasNotificationPermission()
  )
}

export function useTinyTodo() {
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks)
  const [titleInput, setTitleInput] = useState('')
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState<number | null>(null)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(() =>
    getInitialActiveTaskId(tasks),
  )
  const [soundEnabled, setSoundEnabled] = useState(getInitialSoundEnabled)
  const [notifyEnabled, setNotifyEnabled] = useState(getInitialNotifyEnabled)
  const soundEnabledRef = useRef(soundEnabled)
  const notifyEnabledRef = useRef(notifyEnabled)
  const activeTaskTitleRef = useRef<string | null>(null)

  const countdown = useCountdown({
    durationMs: DEFAULT_IDLE_DURATION_MS,
    storageKey: TIMER_STORAGE_KEY,
    onComplete: () => {
      if (soundEnabledRef.current) {
        void playGentleChime()
      }

      if (notifyEnabledRef.current) {
        showTimeUpNotification(
          activeTaskTitleRef.current
            ? `Timer finished for “${activeTaskTitleRef.current}”.`
            : 'Your task timer is finished.',
        )
      }
    },
  })

  soundEnabledRef.current = soundEnabled
  notifyEnabledRef.current = notifyEnabled

  useEffect(() => {
    writeLocalStorageJSON(STORAGE_KEY, tasks)
  }, [tasks])

  useEffect(() => {
    writeLocalStorageJSON(SOUND_STORAGE_KEY, soundEnabled)
  }, [soundEnabled])

  useEffect(() => {
    writeLocalStorageJSON(NOTIFY_STORAGE_KEY, notifyEnabled)
  }, [notifyEnabled])

  useEffect(() => {
    writeLocalStorageJSON(ACTIVE_TASK_STORAGE_KEY, activeTaskId)
  }, [activeTaskId])

  const activeTask = tasks.find((task) => task.id === activeTaskId) ?? null

  activeTaskTitleRef.current = activeTask?.title ?? null
  const activeTaskDurationMs = activeTask?.durationMinutes
    ? activeTask.durationMinutes * ONE_MINUTE_MS
    : null

  function resetActiveTask() {
    setActiveTaskId(null)
    countdown.stop(DEFAULT_IDLE_DURATION_MS)
  }

  function toggleSelectedDuration(minutes: number) {
    setSelectedDurationMinutes((currentValue) => (currentValue === minutes ? null : minutes))
  }

  function toggleSoundWhenDone(nextValue: boolean) {
    setSoundEnabled(nextValue)
  }

  async function toggleNotifyWhenDone(nextValue: boolean) {
    if (!nextValue) {
      setNotifyEnabled(false)
      return
    }

    setNotifyEnabled(await requestNotificationPermission())
  }

  function addTask() {
    const title = titleInput.trim()

    if (!title) {
      return false
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      durationMinutes: selectedDurationMinutes ?? undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setTasks((currentTasks) => [newTask, ...currentTasks])
    setTitleInput('')
    setSelectedDurationMinutes(null)

    return true
  }

  function toggleTask(taskId: string) {
    const nextCompleted = !tasks.find((task) => task.id === taskId)?.completed

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : undefined,
            }
          : task,
      ),
    )

    if (nextCompleted && activeTaskId === taskId) {
      resetActiveTask()
    }
  }

  function deleteTask(taskId: string) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))

    if (activeTaskId === taskId) {
      resetActiveTask()
    }
  }

  function clearCompleted() {
    const hasActiveCompletedTask = activeTask ? activeTask.completed : false

    setTasks((currentTasks) => currentTasks.filter((task) => !task.completed))

    if (hasActiveCompletedTask) {
      resetActiveTask()
    }
  }

  function startTask(task: Task) {
    setActiveTaskId(task.id)

    if (task.durationMinutes) {
      countdown.start(task.durationMinutes * ONE_MINUTE_MS)
      return
    }

    countdown.stop(DEFAULT_IDLE_DURATION_MS)
  }

  function stopActiveTask() {
    resetActiveTask()
  }

  function completeActiveTask() {
    if (!activeTask) {
      return
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === activeTask.id
          ? {
              ...task,
              completed: true,
              completedAt: new Date().toISOString(),
            }
          : task,
      ),
    )

    resetActiveTask()
  }

  function pauseActiveTask() {
    countdown.pause()
  }

  function resumeActiveTask() {
    countdown.resume()
  }

  function addFiveMinutes() {
    countdown.addTime(5 * ONE_MINUTE_MS)
  }

  function restartActiveTaskTimer() {
    if (!activeTaskDurationMs) {
      return
    }

    countdown.start(activeTaskDurationMs)
  }

  return {
    activeTask,
    activeTaskDurationMs,
    addFiveMinutes,
    addTask,
    canAddTime: activeTaskDurationMs !== null && countdown.canAddTime,
    canNotify: canUseNotifications(),
    canPause: activeTaskDurationMs !== null && countdown.canPause,
    canRestart: activeTaskDurationMs !== null,
    canResume: activeTaskDurationMs !== null && countdown.canResume,
    canStop: activeTask !== null,
    clearCompleted,
    completeActiveTask,
    countdownLabel:
      countdown.status === 'complete'
        ? 'Timer complete'
        : countdown.status === 'paused'
          ? 'Paused'
          : countdown.status === 'running'
            ? 'Time remaining'
            : activeTaskDurationMs
              ? 'Ready to start'
              : 'Untimed task',
    deleteTask,
    formattedTime: countdown.formattedTime,
    hasCompletedTasks: tasks.some((task) => task.completed),
    notifyEnabled,
    pauseActiveTask,
    progress: countdown.progress,
    resetActiveTask,
    restartActiveTaskTimer,
    resumeActiveTask,
    selectedDurationMinutes,
    setTitleInput,
    soundEnabled,
    startTask,
    status: countdown.status as TimerStatus,
    statusMessage:
      countdown.status === 'complete'
        ? 'The timer hit zero. Mark the task done or stop the timer.'
        : countdown.status === 'paused'
          ? 'Pause holds your place until you are ready to continue.'
          : countdown.status === 'running'
            ? 'One task, one clock, no extra bookkeeping.'
            : activeTaskDurationMs
              ? 'Start from the task row to begin the countdown.'
              : 'This task has no timer. Use Done when you finish it.',
    stopActiveTask,
    tasks,
    titleInput,
    toggleSelectedDuration,
    toggleNotifyWhenDone,
    toggleSoundWhenDone,
    toggleTask,
  }
}
