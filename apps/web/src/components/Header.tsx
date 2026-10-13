import { useEffect, useRef, type ReactNode } from 'react'

type HeaderProps = {
  actions?: ReactNode
}

export function Header({ actions }: HeaderProps) {
  const privacyRef = useRef<HTMLDetailsElement>(null)

  // Close the privacy popover on an outside click or Escape, like a menu.
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const details = privacyRef.current

      if (details?.open && !details.contains(event.target as Node)) {
        details.open = false
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      const details = privacyRef.current

      if (event.key === 'Escape' && details?.open) {
        details.open = false
        details.querySelector('summary')?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <header className="site-header">
      <div className="page-frame site-header__inner">
        <a className="brand-mark" href="#top">
          <span className="brand-mark__name">ADHDToolbox</span>
          <span className="brand-mark__meta">Quick tools. No account. Private by default.</span>
        </a>

        <div className="site-header__actions">
          <details className="privacy-note" ref={privacyRef}>
            <summary>Privacy</summary>
            <div className="privacy-note__popover">
              <p>
                Tasks, timers, and pasted text stay in your browser. Nothing you type is sent to our
                server.
              </p>
              <p>
                We count anonymous page visits with Umami, which uses no cookies and collects no
                personal data.
              </p>
            </div>
          </details>

          {actions}
        </div>
      </div>
    </header>
  )
}
