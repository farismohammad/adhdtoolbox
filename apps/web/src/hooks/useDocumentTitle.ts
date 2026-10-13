import { useEffect, useId } from 'react'

const BASE_TITLE = 'ADHDToolbox'
const titleParts = new Map<string, string>()

function syncDocumentTitle() {
  const parts = [...titleParts.values()]

  document.title = parts.length ? `${parts.join(' · ')} · ${BASE_TITLE}` : BASE_TITLE
}

/**
 * Adds a short status (such as a countdown) to the browser tab title while `part`
 * is set. Several components can contribute at once.
 */
export function useDocumentTitlePart(part: string | null) {
  const id = useId()

  useEffect(() => {
    if (part) {
      titleParts.set(id, part)
    } else {
      titleParts.delete(id)
    }

    syncDocumentTitle()
  }, [id, part])

  useEffect(() => {
    return () => {
      titleParts.delete(id)
      syncDocumentTitle()
    }
  }, [id])
}

export function getTimerTitlePart(
  status: 'idle' | 'running' | 'paused' | 'complete',
  formattedTime: string,
  label: string,
) {
  switch (status) {
    case 'running':
      return `${formattedTime} ${label}`
    case 'paused':
      return `⏸ ${formattedTime} ${label}`
    case 'complete':
      return `⏰ Time's up – ${label}`
    default:
      return null
  }
}
