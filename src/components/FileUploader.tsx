import React from 'react'

export interface Props {
  name: string
  label: string | React.ReactNode
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function FileUploader({ name, label, onChange }: Props) {
  return (
    <label title={name} className="relative bg-blue inline-block">
      {label}
      <input type="file" className="hidden" onChange={onChange} />
    </label>
  )
}
