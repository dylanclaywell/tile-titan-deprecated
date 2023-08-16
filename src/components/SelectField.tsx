import React, { useState } from 'react'
import clsx from 'clsx'

import { TextField } from './TextField'

export interface Props {
  options: {
    value: string
    label: string
  }[]
  onChange: (value: string) => void
  value: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

function calculatePosition(anchor: HTMLDivElement | null): React.CSSProperties {
  if (!anchor) return {}

  const { top, left, width, height } = anchor.getBoundingClientRect()

  return {
    // Minus 1 to close the gap between the menu and the anchor (where the bottom border would be)
    top: `${top + height - 1}px`,
    left: `${left}px`,
    width: `${width}px`,
    maxHeight: `calc(100vh - ${top + height}px - 1rem)`,
  }
}

export function SelectField({ options, onChange, value, inputProps }: Props) {
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <TextField
        forwardRef={(el) => setAnchor(el)}
        classes={clsx(
          '[&_i]:transition-all [&_i]:duration-300 [&_i]:ease-in-out min-w-[10rem]',
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
        <menu
          className="absolute border-x border-b border-gray-400 rounded-b-md bg-white z-50 top-full w-full flex flex-col rotate overflow-y-auto"
          style={calculatePosition(anchor)}
        >
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
