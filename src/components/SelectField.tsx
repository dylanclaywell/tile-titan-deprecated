import React, { useState } from 'react'
import clsx from 'clsx'

import TextField from './TextField'

export interface Props {
  options: {
    value: string
    label: string
  }[]
  onChange: (value: string) => void
  value: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export function SelectField({ options, onChange, value, inputProps }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <TextField
        classes={clsx(
          '[&_i]:transition-all [&_i]:duration-300 [&_i]:ease-in-out',
          {
            ['[&_i]:rotate-0']: !isOpen,
            ['[&_i]:-rotate-180']: isOpen,
            ['[&_label]:border-b-0 [&_label]:rounded-bl-none [&_label]:rounded-br-none']:
              isOpen,
          }
        )}
        label="Tileset"
        inputProps={{
          ...inputProps,
          readOnly: true,
          onClick: () => setIsOpen(!isOpen),
          placeholder: 'Select a tileset',
        }}
        value={options.find((option) => option.value === value)?.label ?? ''}
        rightIconName="chevron-down"
      />
      {isOpen && (
        <menu className="absolute border-x border-b border-gray-400 rounded-b-md bg-white z-50 top-full w-full flex flex-col rotate">
          {options.map((option) => (
            <button
              key={option.value}
              className={clsx(
                'text-left p-4 hover:bg-gray-300 last:rounded-b-md transition-all',
                {
                  ['bg-blue-400']: option.value === value,
                }
              )}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
            >
              {option.label}
            </button>
          ))}
        </menu>
      )}
    </div>
  )
}
