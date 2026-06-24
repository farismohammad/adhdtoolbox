import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from './Button'
import { Textarea } from './Textarea'

const DEFAULT_TEXT = 'Paste text here, then press Play to hear it aloud.'
const SUPPORTED_VOICES = [
  { name: 'Daniel', lang: 'en-GB' },
  { name: 'Samantha', lang: 'en-US' },
  { name: 'Karen', lang: 'en-AU' },
] as const

type SpeechStatus = 'ready' | 'speaking' | 'paused' | 'stopped' | 'unsupported'

function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

function isSupportedVoice(voice: SpeechSynthesisVoice) {
  return SUPPORTED_VOICES.some(({ name, lang }) => voice.name === name && voice.lang === lang)
}

export function ReadAloudPanel() {
  const [text, setText] = useState(DEFAULT_TEXT)
  const [isSupported] = useState(isSpeechSynthesisSupported)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceUri, setSelectedVoiceUri] = useState('')
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [status, setStatus] = useState<SpeechStatus>(isSupported ? 'ready' : 'unsupported')
  const [message, setMessage] = useState(
    isSupported
      ? 'Text is spoken using your browser’s built-in voice engine. Audio is generated on your device, not on the server.'
      : 'Browser TTS is not supported in this browser.',
  )
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const cleanedText = text.trim()

  const updateVoices = useCallback(() => {
    if (!isSpeechSynthesisSupported()) {
      return
    }

    const availableVoices = window.speechSynthesis.getVoices().filter(isSupportedVoice)
    setVoices(availableVoices)
    setSelectedVoiceUri((currentVoiceUri) =>
      availableVoices.some((voice) => voice.voiceURI === currentVoiceUri)
        ? currentVoiceUri
        : (availableVoices[0]?.voiceURI ?? ''),
    )
  }, [])

  useEffect(() => {
    if (!isSupported) {
      return
    }

    const speechSynthesis = window.speechSynthesis
    updateVoices()
    speechSynthesis.addEventListener('voiceschanged', updateVoices)

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', updateVoices)
      utteranceRef.current = null
      speechSynthesis.cancel()
    }
  }, [isSupported, updateVoices])

  const stop = useCallback(() => {
    if (!isSupported) {
      return
    }

    utteranceRef.current = null
    window.speechSynthesis.cancel()
    setStatus('stopped')
    setMessage('Speech stopped.')
  }, [isSupported])

  function play() {
    if (!isSupported || !cleanedText) {
      return
    }

    const speechSynthesis = window.speechSynthesis
    const utterance = new SpeechSynthesisUtterance(cleanedText)
    const selectedVoice = voices.find((voice) => voice.voiceURI === selectedVoiceUri)

    if (!selectedVoice) {
      setMessage('None of the supported voices are installed in this browser.')
      return
    }

    utterance.voice = selectedVoice

    utterance.rate = rate
    utterance.pitch = pitch
    utterance.onstart = () => {
      if (utteranceRef.current === utterance) {
        setStatus('speaking')
        setMessage('Speaking text on this device.')
      }
    }
    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null
        setStatus('ready')
        setMessage('Finished speaking.')
      }
    }
    utterance.onerror = (event) => {
      if (utteranceRef.current === utterance && event.error !== 'canceled' && event.error !== 'interrupted') {
        utteranceRef.current = null
        setStatus('ready')
        setMessage('The browser could not speak this text. Try a different voice.')
      }
    }

    speechSynthesis.cancel()
    utteranceRef.current = utterance
    setStatus('speaking')
    setMessage('Starting speech on this device.')
    speechSynthesis.speak(utterance)
  }

  function pause() {
    if (!isSupported || status !== 'speaking') {
      return
    }

    window.speechSynthesis.pause()
    setStatus('paused')
    setMessage('Speech paused.')
  }

  function resume() {
    if (!isSupported || status !== 'paused') {
      return
    }

    window.speechSynthesis.resume()
    setStatus('speaking')
    setMessage('Speech resumed.')
  }

  function clearText() {
    stop()
    setText('')
  }

  return (
    <div className="read-aloud-panel section-stack">
      <div
        className={`read-aloud-panel__health read-aloud-panel__health--${status === 'unsupported' ? 'offline' : 'online'} tool-card`}
        aria-live="polite"
      >
        <span className="read-aloud-panel__health-badge">
          {status === 'unsupported' ? 'Unavailable' : status === 'speaking' ? 'Speaking' : status === 'paused' ? 'Paused' : 'Browser TTS'}
        </span>
        <p>{message}</p>
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
        <div className="read-aloud-panel__settings tool-card">
          <label className="field">
            <span className="field__label">Voice</span>
            <select
              aria-label="Voice"
              className="ui-input"
              disabled={!isSupported}
              onChange={(event) => setSelectedVoiceUri(event.target.value)}
              value={selectedVoiceUri}
            >
              {voices.length === 0 && <option value="">No supported voices installed</option>}
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </label>

          <label className="field read-aloud-panel__range-field">
            <span className="field__label">Rate: {rate.toFixed(1)}×</span>
            <input
              aria-label="Speech rate"
              className="read-aloud-panel__range"
              disabled={!isSupported}
              max="2"
              min="0.5"
              onChange={(event) => setRate(Number(event.target.value))}
              step="0.1"
              type="range"
              value={rate}
            />
          </label>

          <label className="field read-aloud-panel__range-field">
            <span className="field__label">Pitch: {pitch.toFixed(1)}</span>
            <input
              aria-label="Speech pitch"
              className="read-aloud-panel__range"
              disabled={!isSupported}
              max="2"
              min="0"
              onChange={(event) => setPitch(Number(event.target.value))}
              step="0.1"
              type="range"
              value={pitch}
            />
          </label>
        </div>

        <div className="control-row tool-control-row read-aloud-panel__controls" aria-label="Speech controls">
          <Button
            className="read-aloud-panel__primary-action"
            disabled={!isSupported || !cleanedText || !selectedVoiceUri}
            onClick={play}
            variant="primary"
          >
            Play
          </Button>
          <Button disabled={!isSupported || status !== 'speaking'} onClick={pause}>
            Pause
          </Button>
          <Button disabled={!isSupported || status !== 'paused'} onClick={resume}>
            Resume
          </Button>
          <Button disabled={!isSupported || (status !== 'speaking' && status !== 'paused')} onClick={stop}>
            Stop
          </Button>
          <Button disabled={!text} onClick={clearText}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}
