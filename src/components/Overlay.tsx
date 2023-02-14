import React from 'react'

export interface Props {
  onClick?: () => void
}

export function Overlay({ onClick }: Props) {
  return (
    <div
      className="absolute top-0 bottom-0 left-0 right-0 bg-gray-500 opacity-50 z-40"
      onClick={onClick}
    />
  )
}
