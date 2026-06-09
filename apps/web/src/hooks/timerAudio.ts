type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

export async function playGentleChime() {
  if (typeof window === 'undefined') {
    return
  }

  const audioWindow = window as AudioWindow
  const AudioContextConstructor = window.AudioContext ?? audioWindow.webkitAudioContext

  if (!AudioContextConstructor) {
    return
  }

  try {
    const audioContext = new AudioContextConstructor()
    await audioContext.resume()

    const notes = [659.25, 783.99, 987.77]

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      const startTime = audioContext.currentTime + index * 0.14

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, startTime)

      gainNode.gain.setValueAtTime(0.0001, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.08, startTime + 0.03)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.34)

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.start(startTime)
      oscillator.stop(startTime + 0.38)
    })

    window.setTimeout(() => {
      void audioContext.close().catch(() => undefined)
    }, 950)
  } catch {
    // Ignore browsers that block or do not support audio playback here.
  }
}
