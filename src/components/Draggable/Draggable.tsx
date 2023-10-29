import React, { useEffect } from 'react'

export type Props = {} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

export function Draggable({ ...props }: Props) {
  useEffect(() => {
    function onMouseMove(event: MouseEvent) {}

    document.addEventListener('mousemove', onMouseMove)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return <div {...props}></div>
}
