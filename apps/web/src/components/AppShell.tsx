import type { ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
  header: ReactNode
  readingComfort: string
}

export function AppShell({ children, header, readingComfort }: AppShellProps) {
  return (
    <div className={`app-shell reading-comfort--${readingComfort}`} id="top">
      {header}
      <main className="page-frame app-main">{children}</main>
    </div>
  )
}
