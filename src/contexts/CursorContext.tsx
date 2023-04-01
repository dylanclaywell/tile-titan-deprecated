import React from 'react'

export const CursorContext = React.createContext<
  [
    HTMLDivElement | null,
    React.Dispatch<React.SetStateAction<HTMLDivElement | null>>
  ]
>([null, () => undefined])

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const state = React.useState<HTMLDivElement | null>(null)

  return (
    <CursorContext.Provider value={state}>{children}</CursorContext.Provider>
  )
}
