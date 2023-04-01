import React, { useEffect } from 'react'

import { useAppSelector } from '../hooks/redux'

export const CursorContext = React.createContext<
  [
    HTMLDivElement | null,
    React.Dispatch<React.SetStateAction<HTMLDivElement | null>>
  ]
>([null, () => undefined])

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const image = useAppSelector((state) => state.cursor.image)
  const x = useAppSelector((state) => state.cursor.x)
  const y = useAppSelector((state) => state.cursor.y)

  const [cursor, dispatch] = React.useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!cursor) return

    cursor.style.left = `${x}px`
    cursor.style.top = `${y}px`

    const img = cursor.querySelector('img')

    if (!img) return

    img.src = image ?? ''
  }, [x, y])

  useEffect(() => {
    if (!cursor) return

    const img = cursor.querySelector('img')

    if (!img) return

    img.src = image ?? ''
  }, [image])

  return (
    <CursorContext.Provider value={[cursor, dispatch]}>
      {children}
    </CursorContext.Provider>
  )
}
