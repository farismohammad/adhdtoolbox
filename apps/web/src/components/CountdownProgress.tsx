import type { TimerStatus } from '../hooks/useCountdown'

type CountdownProgressProps = {
  progress: number
  status: TimerStatus
}

/** A bar that empties as time runs out, so the remaining time is visible at a glance. */
export function CountdownProgress({ progress, status }: CountdownProgressProps) {
  return (
    <div aria-hidden="true" className={`countdown-progress countdown-progress--${status}`}>
      <span className="countdown-progress__fill" style={{ width: `${progress * 100}%` }} />
    </div>
  )
}
