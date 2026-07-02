import type { ReactNode } from 'react'

type HeaderProps = {
  actions?: ReactNode
}

export function Header({ actions }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="page-frame site-header__inner">
        <a className="brand-mark" href="#top">
          <span className="brand-mark__name">ADHDToolbox</span>
          <span className="brand-mark__meta">Quick tools. No account. Private by default.</span>
        </a>

        <details className="privacy-note">
          <summary>Privacy</summary>
          <p>
            Private by default. Tasks, timers, and pasted text stay in your browser.
          </p>
        </details>

        {actions ? <div className="site-header__actions">{actions}</div> : null}
      </div>
    </header>
  )
}
