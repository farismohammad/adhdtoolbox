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

        {actions ? <div className="site-header__actions">{actions}</div> : null}
      </div>
    </header>
  )
}
