import type { KeyboardEvent } from 'react'

import { TINY_TODO_PRESETS, useTinyTodo } from '../hooks/useTinyTodo'
import { Button } from './Button'

export function TinyTodoPanel() {
  const {
    activeTask,
    activeTaskDurationMs,
    addFiveMinutes,
    addTask,
    canAddTime,
    canPause,
    canRestart,
    canResume,
    canStop,
    clearCompleted,
    completeActiveTask,
    countdownLabel,
    deleteTask,
    formattedTime,
    hasCompletedTasks,
    pauseActiveTask,
    restartActiveTaskTimer,
    resumeActiveTask,
    selectedDurationMinutes,
    setTitleInput,
    soundEnabled,
    startTask,
    status,
    statusMessage,
    stopActiveTask,
    tasks,
    titleInput,
    toggleSelectedDuration,
    toggleSoundWhenDone,
    toggleTask,
  } = useTinyTodo()

  function handleTaskInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    addTask()
  }

  return (
    <div className="tiny-todo-panel section-stack">
      <div className="tiny-todo-panel__composer">
        <label className="field">
          <span className="field__label">Next step</span>
          <input
            className="ui-input"
            onChange={(event) => setTitleInput(event.target.value)}
            onKeyDown={handleTaskInputKeyDown}
            placeholder="What’s one tiny thing you can do next?"
            value={titleInput}
          />
        </label>

        <div className="control-row" aria-label="Suggested task lengths">
          {TINY_TODO_PRESETS.map((minutes) => (
            <Button
              key={minutes}
              aria-pressed={selectedDurationMinutes === minutes}
              onClick={() => toggleSelectedDuration(minutes)}
              variant="chip"
            >
              {minutes} min
            </Button>
          ))}
          <Button disabled={!titleInput.trim()} onClick={addTask} variant="primary">
            Add
          </Button>
        </div>
      </div>

      <div className="preview-grid tiny-todo-panel__grid todo-main-grid">
        <div className="tiny-todo-focus focused-task-card section-stack" aria-live="polite">
          <div className="tiny-todo-focus__header">
            <div>
              <span className="tiny-todo-focus__eyebrow">Now focusing</span>
              <strong>{activeTask?.title ?? 'Nothing running yet'}</strong>
            </div>

            {activeTask?.durationMinutes ? (
              <span className="tag-chip">{activeTask.durationMinutes} min</span>
            ) : null}
          </div>

          <label className="toggle-row tiny-todo-focus__sound-toggle">
            <input
              checked={soundEnabled}
              className="toggle-row__checkbox"
              onChange={(event) => toggleSoundWhenDone(event.target.checked)}
              type="checkbox"
            />
            <span>Chime when done</span>
          </label>

          {activeTask ? (
            activeTaskDurationMs ? (
              <>
                <div className={`countdown-display countdown-display--${status}`}>
                  <span className="countdown-display__label">{countdownLabel}</span>
                  <strong>{formattedTime}</strong>
                  <p className="countdown-display__status">{statusMessage}</p>
                </div>

                <div className="control-row" aria-label="Active task timer controls">
                  <Button
                    disabled={!canPause && !canResume}
                    onClick={status === 'paused' ? resumeActiveTask : pauseActiveTask}
                    variant={status === 'paused' ? 'primary' : 'secondary'}
                  >
                    {status === 'paused' ? 'Continue' : 'Pause'}
                  </Button>
                  <Button disabled={!canAddTime} onClick={addFiveMinutes}>
                    Add 5 min
                  </Button>
                  <Button disabled={!canRestart} onClick={restartActiveTaskTimer}>
                    Restart
                  </Button>
                  <Button disabled={!canStop} onClick={completeActiveTask} variant="primary">
                    Done
                  </Button>
                  <Button disabled={!canStop} onClick={stopActiveTask}>
                    Stop
                  </Button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <strong>Untimed task</strong>
                <p>{statusMessage}</p>
                <div className="control-row">
                  <Button onClick={completeActiveTask} variant="primary">
                    Done
                  </Button>
                  <Button onClick={stopActiveTask}>Stop</Button>
                </div>
              </div>
            )
          ) : (
            <div className="empty-state">
              <strong>Start a task to focus here.</strong>
              <p>Your list is saved in this browser. Timers reset on refresh.</p>
            </div>
          )}
        </div>

        <div className="tiny-todo-list task-list-card section-stack">
          <div className="tiny-todo-list__header task-list-header">
            <strong>Up next</strong>
            <Button disabled={!hasCompletedTasks} onClick={clearCompleted}>
              Clear done
            </Button>
          </div>

          <div className="tiny-todo-list__body task-list-body">
            {tasks.length ? (
              <ul className="task-list" aria-label="Up next">
                {tasks.map((task) => {
                  const isActiveTask = activeTask?.id === task.id

                  return (
                    <li
                      key={task.id}
                      className={`task-row${task.completed ? ' task-row--completed' : ''}${isActiveTask ? ' task-row--active' : ''}`}
                    >
                      <label className="task-row__toggle">
                        <input
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                          type="checkbox"
                        />
                        <span className="sr-only">Mark {task.title} complete</span>
                      </label>

                      <div className="task-row__content">
                        <strong>{task.title}</strong>
                        <div className="task-row__meta">
                          {task.durationMinutes ? <span className="tag-chip">{task.durationMinutes} min</span> : null}
                          {isActiveTask ? <span className="task-row__status">Active</span> : null}
                          {task.completed ? <span className="task-row__status">Completed</span> : null}
                        </div>
                      </div>

                      <div className="task-row__actions">
                        <Button disabled={task.completed} onClick={() => startTask(task)} variant="primary">
                          Focus
                        </Button>
                        <Button onClick={() => deleteTask(task.id)}>Remove</Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="empty-state tiny-todo-list__empty-state">
                <strong>No tasks yet.</strong>
                <p>Add a single next step and optionally pair it with a short timer.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
