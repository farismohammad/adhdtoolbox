import type { InputHTMLAttributes } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export function Input({ className = '', label, ...props }: InputProps) {
  const control = <input className={['ui-input', className].filter(Boolean).join(' ')} {...props} />

  if (!label) {
    return control
  }

  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {control}
    </label>
  )
}
