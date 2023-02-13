import React, { ChangeEventHandler } from 'react'
import clsx from 'clsx'

export interface Props {
  label: string
  value?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
  hasError?: boolean
  hintText?: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  classes?: string
  leftIconName?: string
  rightIconName?: string
}

export default function TextField({
  label,
  value,
  onChange,
  hasError,
  hintText,
  inputProps,
  classes,
  rightIconName,
  leftIconName,
}: Props) {
  return (
    <div className={clsx('flex flex-col', classes)}>
      <label
        className={clsx(
          'relative rounded-md p-4 border-gray-400 border-solid border flex items-center gap-2',
          {
            ['cursor-text']: !inputProps?.readOnly,
            ['cursor-default']: inputProps?.readOnly,
            ['border-red-500']: hasError,
          }
        )}
      >
        <span className="absolute top-0 text-xs text-gray-500">{label}</span>
        {leftIconName && (
          <i className={`fa-solid fa-${leftIconName} text-gray-500`}></i>
        )}
        <input
          {...inputProps}
          className={clsx('outline-none flex-grow', {
            ['cursor-text']: !inputProps?.readOnly,
            ['cursor-default']: inputProps?.readOnly,
          })}
          value={value}
          onChange={onChange}
        />
        {rightIconName && (
          <i className={`fa-solid fa-${rightIconName} text-gray-500`}></i>
        )}
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
