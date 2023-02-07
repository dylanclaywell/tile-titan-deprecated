import React from 'react'

export interface Props {
  label: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function FileUploader({ label, onChange }: Props) {
  return (
    <label className="relative bg-blue inline-block">
      <div className="p-2 rounded-md bg-cyan-600 hover:bg-cyan-700 transition-colors">
        {label}
      </div>
      <input type="file" className="w-0 h-0" onChange={onChange} />
    </label>
  )
}
