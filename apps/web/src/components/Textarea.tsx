import type { TextareaHTMLAttributes } from 'react'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
}

export function Textarea({ className = '', label, ...props }: TextareaProps) {
  const control = (
    <textarea className={['ui-input', 'ui-textarea', className].filter(Boolean).join(' ')} {...props} />
  )

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
