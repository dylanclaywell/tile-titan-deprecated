import React, { ChangeEventHandler } from 'react'

export interface Props {
  label: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export default function TextField({
  label,
  value,
  onChange,
  inputProps,
}: Props) {
  return (
    <label className="relative inline-block rounded-md p-4 border-gray-400 border-solid border">
      <span className="absolute top-0 text-xs">{label}</span>
      <input value={value} onChange={onChange} {...inputProps} />
    </label>
  )
}
