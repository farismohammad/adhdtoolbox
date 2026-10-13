import { useEffect, useRef, useState } from 'react'

import { readLocalStorageJSON, writeLocalStorageJSON } from '../browserStorage'
import { Button } from './Button'

const DEFAULT_TEXT = 'Paste text here, then press Play to hear it aloud.'
const VOICE_STORAGE_KEY = 'adhdtoolbox.readAloud.voiceUri'
const RATE_STORAGE_KEY = 'adhdtoolbox.readAloud.rate'
// Voices that tend to sound natural; they are listed first when installed.
const PREFERRED_VOICE_NAMES = ['Samantha', 'Daniel', 'Karen', 'Microsoft Aria', 'Microsoft Jenny']

type SpeechStatus = 'ready' | 'speaking' | 'paused' | 'stopped' | 'unsupported'

function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

function getBaseLanguage(lang: string) {
  return lang.toLowerCase().split(/[-_]/)[0]
}

function getVoiceRank(voice: SpeechSynthesisVoice, userLang: string) {
  const preferredIndex = PREFERRED_VOICE_NAMES.findIndex((name) => voice.name.startsWith(name))

  if (preferredIndex !== -1 && getBaseLanguage(voice.lang) === getBaseLanguage(userLang)) {
    return preferredIndex
  }

  if (voice.lang.toLowerCase() === userLang.toLowerCase()) {
    return 100
  }

  return getBaseLanguage(voice.lang) === getBaseLanguage(userLang) ? 200 : 300
}

/**
 * Lists the voices in the reader's language (and English) with the best-sounding
 * ones first. Falls back to every installed voice if none match.
 */
function sortVoices(allVoices: SpeechSynthesisVoice[]) {
  const userLang = navigator.language || 'en-US'
  const relevantLanguages = new Set([getBaseLanguage(userLang), 'en'])
  const relevantVoices = allVoices.filter((voice) => relevantLanguages.has(getBaseLanguage(voice.lang)))
  const voices = relevantVoices.length ? relevantVoices : allVoices

  // On-device voices come first: online ones send the text to the browser vendor.
  return [...voices].sort(
    (a, b) =>
      Number(b.localService) - Number(a.localService) ||
      getVoiceRank(a, userLang) - getVoiceRank(b, userLang) ||
      Number(b.default) - Number(a.default) ||
      a.name.localeCompare(b.name),
  )
}

function getInitialRate() {
  return readLocalStorageJSON(
    RATE_STORAGE_KEY,
    1,
    (value): value is number => typeof value === 'number' && value >= 0.5 && value <= 2,
  )
}

export function ReadAloudPanel() {
  const [text, setText] = useState(DEFAULT_TEXT)
  const [isSupported] = useState(isSpeechSynthesisSupported)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceUri, setSelectedVoiceUri] = useState(() =>
    readLocalStorageJSON(VOICE_STORAGE_KEY, '', (value): value is string => typeof value === 'string'),
  )
  const [rate, setRate] = useState(getInitialRate)
  const [pitch, setPitch] = useState(1)
  const [status, setStatus] = useState<SpeechStatus>(isSupported ? 'ready' : 'unsupported')
  const [message, setMessage] = useState(
    isSupported
      ? 'Your browser reads the text aloud. With an on-device voice, the text never leaves your device.'
      : 'Read aloud is not available in this browser. Try a recent Chrome, Edge, Safari, or Firefox.',
  )
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const cleanedText = text.trim()
  const selectedVoice = voices.find((voice) => voice.voiceURI === selectedVoiceUri)

  useEffect(() => {
    if (!isSupported) {
      return
    }

    const speechSynthesis = window.speechSynthesis

    function updateVoices() {
      const availableVoices = sortVoices(speechSynthesis.getVoices())
      setVoices(availableVoices)
      setSelectedVoiceUri((currentVoiceUri) =>
        availableVoices.some((voice) => voice.voiceURI === currentVoiceUri)
          ? currentVoiceUri
          : (availableVoices[0]?.voiceURI ?? ''),
      )
    }

    updateVoices()
    speechSynthesis.addEventListener('voiceschanged', updateVoices)

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', updateVoices)
      utteranceRef.current = null
      speechSynthesis.cancel()
    }
  }, [isSupported])

  useEffect(() => {
    if (selectedVoiceUri) {
      writeLocalStorageJSON(VOICE_STORAGE_KEY, selectedVoiceUri)
    }
  }, [selectedVoiceUri])

  useEffect(() => {
    writeLocalStorageJSON(RATE_STORAGE_KEY, rate)
  }, [rate])

  function stop() {
    if (!isSupported) {
      return
    }

    utteranceRef.current = null
    window.speechSynthesis.cancel()
    setStatus('stopped')
    setMessage('Speech stopped.')
  }

  function play() {
    if (!isSupported || !cleanedText) {
      return
    }

    const speechSynthesis = window.speechSynthesis
    const utterance = new SpeechSynthesisUtterance(cleanedText)
    // Without a matching voice the browser uses its default one.
    if (selectedVoice) {
      utterance.voice = selectedVoice
      utterance.lang = selectedVoice.lang
    }

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
          {status === 'unsupported' ? 'Unavailable' : status === 'speaking' ? 'Speaking' : status === 'paused' ? 'Paused' : 'Ready'}
        </span>
        <p>{message}</p>
      </div>

      <div className="read-aloud-panel__editor">
        <label className="field">
          <span className="field__label">Text to read</span>
          <textarea
            className="ui-input ui-textarea read-aloud-panel__textarea"
            onChange={(event) => setText(event.target.value)}
            rows={7}
            value={text}
          />
        </label>
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
              {voices.length === 0 && <option value="">Browser default voice</option>}
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang}){voice.localService ? '' : ' · online'}
                </option>
              ))}
            </select>
            {selectedVoice && !selectedVoice.localService ? (
              <span className="read-aloud-panel__voice-note">
                Online voice: your browser sends the text to its provider to speak it.
              </span>
            ) : null}
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
            disabled={!isSupported || !cleanedText}
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
