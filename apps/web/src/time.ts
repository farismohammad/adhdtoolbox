const ONE_MINUTE_MS = 60 * 1000
const ONE_DAY_MS = 24 * 60 * 60 * 1000

export function getLocalDayBounds(referenceMs = Date.now()) {
  const referenceDate = new Date(referenceMs)
  const dayStartMs = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  ).getTime()

  return {
    dayStartMs,
    dayEndMs: dayStartMs + ONE_DAY_MS,
  }
}

export function clipDurationToLocalDay(startMs: number, endMs: number, referenceMs = Date.now()) {
  const { dayStartMs, dayEndMs } = getLocalDayBounds(referenceMs)

  return Math.max(0, Math.min(endMs, dayEndMs) - Math.max(startMs, dayStartMs))
}

export function formatLocalDayDuration(durationMs: number) {
  if (durationMs <= 0) {
    return '0m'
  }

  const wholeMinutes = Math.floor(durationMs / ONE_MINUTE_MS)

  if (wholeMinutes <= 0) {
    return '<1m'
  }

  const hours = Math.floor(wholeMinutes / 60)
  const minutes = wholeMinutes % 60

  if (hours === 0) {
    return `${minutes}m`
  }

  if (minutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}m`
}
