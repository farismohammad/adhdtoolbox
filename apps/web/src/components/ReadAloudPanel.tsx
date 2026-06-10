import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from './Button'
import { Textarea } from './Textarea'

const DEFAULT_TEXT =
  'Paste text here. Generate local audio when you are ready to listen.'
const TTS_API_URL = (import.meta.env.VITE_TTS_API_URL ?? '/api').replace(/\/$/, '')
const LOCAL_TTS_TIMEOUT_MS = 130_000

type LocalHealthStatus = 'checking' | 'online' | 'offline'

type HealthResponse = {
  status: string
  engine: string
  mode: string
  reference_audio?: string | null
  detail?: string | null
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong.'
}

export function ReadAloudPanel() {
  const [text, setText] = useState(DEFAULT_TEXT)
  const [localHealth, setLocalHealth] = useState<LocalHealthStatus>('checking')
  const [localHealthMessage, setLocalHealthMessage] = useState('')
  const [localAudioUrl, setLocalAudioUrl] = useState('')
  const [localAudioLabel, setLocalAudioLabel] = useState('')
  const [localError, setLocalError] = useState('')
  const [isGeneratingLocalAudio, setIsGeneratingLocalAudio] = useState(false)
  const localAudioUrlRef = useRef('')
  const cleanedText = text.trim()

  const clearLocalAudio = useCallback(() => {
    if (localAudioUrlRef.current) {
      URL.revokeObjectURL(localAudioUrlRef.current)
      localAudioUrlRef.current = ''
    }

    setLocalAudioUrl('')
    setLocalAudioLabel('')
  }, [])

  const checkLocalHealth = useCallback(async (signal?: AbortSignal) => {
    setLocalHealth('checking')
    setLocalHealthMessage('')

    try {
      const response = await fetch(`${TTS_API_URL}/health`, { signal })
      if (!response.ok) {
        throw new Error(`Health check failed with ${response.status}.`)
      }

      const health = (await response.json()) as HealthResponse
      if (health.status !== 'ok') {
        setLocalHealth('offline')
        setLocalHealthMessage(health.detail ?? 'Local moss-tts is not ready.')
        return
      }

      setLocalHealth('online')
      setLocalHealthMessage(
        `TTS is online.`,
      )
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      setLocalHealth('offline')
      setLocalHealthMessage('Local moss-tts is offline.')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void checkLocalHealth(controller.signal)

    return () => controller.abort()
  }, [checkLocalHealth])

  useEffect(() => clearLocalAudio, [clearLocalAudio])

  function clearText() {
    clearLocalAudio()
    setText('')
    setLocalError('')
  }

  async function generateLocalAudio() {
    setLocalError('')
    clearLocalAudio()

    if (!cleanedText) {
      setLocalError('Add text before generating local speech.')
      return
    }

    setIsGeneratingLocalAudio(true)

    try {
      const controller = new AbortController()
      const timeoutId = window.setTimeout(() => controller.abort(), LOCAL_TTS_TIMEOUT_MS)
      let response: Response
      try {
        response = await fetch(`${TTS_API_URL}/tts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            text: cleanedText,
          }),
        })
      } finally {
        window.clearTimeout(timeoutId)
      }

      if (!response.ok) {
        let message = `Local TTS failed with ${response.status}.`

        try {
          const payload = (await response.json()) as { detail?: string | Array<{ msg?: string }> }
          if (typeof payload.detail === 'string') {
            message = payload.detail
          } else if (Array.isArray(payload.detail) && payload.detail[0]?.msg) {
            message = payload.detail[0].msg
          }
        } catch {
          // Keep the status-based message when the backend does not return JSON.
        }

        throw new Error(message)
      }

      const audioBlob = await response.blob()
      const nextAudioUrl = URL.createObjectURL(audioBlob)
      localAudioUrlRef.current = nextAudioUrl
      setLocalAudioUrl(nextAudioUrl)
      setLocalAudioLabel(`Generated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`)
      setLocalHealth('online')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setLocalError(`Local TTS timed out after ${Math.floor(LOCAL_TTS_TIMEOUT_MS / 1000)} seconds.`)
        setLocalHealth('offline')
        return
      }
      setLocalError(getErrorMessage(error))
      setLocalHealth('offline')
    } finally {
      setIsGeneratingLocalAudio(false)
    }
  }

  return (
    <div className="read-aloud-panel section-stack">
      <div className="read-aloud-panel__topbar">
        <div
          className={`read-aloud-panel__health read-aloud-panel__health--${localHealth} tool-card`}
          aria-live="polite"
        >
          <span className="read-aloud-panel__health-badge">
            {localHealth === 'checking'
              ? 'Checking backend'
              : localHealth === 'online'
                ? 'Backend online'
                : 'Backend offline'}
          </span>
          <p>{localHealthMessage || 'Uses the local moss-tts service at the configured API URL.'}</p>
        </div>


      </div>

      <div className="read-aloud-panel__editor">
        <Textarea
          className="read-aloud-panel__textarea"
          label="Text to read"
          onChange={(event) => setText(event.target.value)}
          rows={7}
          value={text}
        />
      </div>

      <div className="read-aloud-panel__footer">
        <div className="control-row tool-control-row read-aloud-panel__controls" aria-label="Local speech controls">
          <Button
            className="read-aloud-panel__primary-action"
            disabled={!cleanedText || isGeneratingLocalAudio}
            onClick={generateLocalAudio}
            variant="primary"
          >
            {isGeneratingLocalAudio ? 'Generating' : 'Generate WAV'}
          </Button>
          <Button disabled={isGeneratingLocalAudio} onClick={() => void checkLocalHealth()}>
            Check backend
          </Button>
          <Button disabled={!text && !localAudioUrl} onClick={clearText}>
            Clear
          </Button>
        </div>

        {localError ? (
          <p className="read-aloud-panel__error" role="alert">
            {localError}
          </p>
        ) : null}

        {localAudioUrl ? (
          <div className="read-aloud-panel__audio tool-card">
            <span>{localAudioLabel}</span>
            <audio controls src={localAudioUrl} />
          </div>
        ) : (
          <div className="empty-state read-aloud-panel__empty-state tool-card">
            <strong>No local audio generated yet.</strong>
            <p>Start the FastAPI service to create a local WAV.</p>
          </div>
        )}
      </div>
    </div>
  )
}
