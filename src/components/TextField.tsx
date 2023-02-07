import React, { ChangeEventHandler } from 'react'
import clsx from 'clsx'

export interface Props {
  label: string
  value?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
  hasError?: boolean
  hintText?: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export default function TextField({
  label,
  value,
  onChange,
  hasError,
  hintText,
  inputProps,
}: Props) {
  return (
    <div className="flex flex-col">
      <label
        className={clsx(
          'relative inline-block rounded-md p-4 border-gray-400 border-solid border',
          {
            ['border-red-500']: hasError,
          }
        )}
      >
        <span className="absolute top-0 text-xs text-gray-500">{label}</span>
        <input
          className="outline-none"
          value={value}
          onChange={onChange}
          {...inputProps}
        />
      </label>
      <span
        className={clsx('text-xs', {
          ['text-red-500']: hasError,
        })}
      >
        {hintText}
      </span>
    </div>
  )
}
