import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'chip'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export function Button({ className = '', type = 'button', variant = 'secondary', ...props }: ButtonProps) {
  const classes = [
    'ui-button',
    'tool-button',
    `ui-button--${variant}`,
    `tool-button--${variant}`,
    variant === 'chip' ? 'tool-pill' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <button className={classes} type={type} {...props} />
}
