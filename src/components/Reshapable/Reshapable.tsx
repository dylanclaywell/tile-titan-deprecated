import clsx from 'clsx'
import React, { useEffect, useRef } from 'react'

export type Box = {
  x: number
  y: number
  width: number
  height: number
}

export type ReshapableEvent = {
  box: Box
  deltaX: number
  deltaY: number
}

export type Props = {
  scale?: number
  onUpdate?: (data: ReshapableEvent) => void
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

// This sets the drag image to be a transparent image, so that the
// default drag image (which is the element being dragged) doesn't
// show up.
function preventDragImage(event: React.DragEvent<HTMLDivElement>) {
  const rect = document.createElement('img')
  rect.style.display = 'none'
  document.body.appendChild(rect)
  event.dataTransfer.setDragImage(rect, 0, 0)
}

export function Reshapable(props: Props) {
  const mouseOffset = useRef({
    originX: 0,
    originY: 0,
    relativeX: 0,
    relativeY: 0,
  })

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseMove(event: MouseEvent) {}
    function onDragOver(event: DragEvent) {
      event.preventDefault()

      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('dragover', onDragOver)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('dragover', onDragOver)
    }
  }, [])

  function updatePosition(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (!ref.current) return

    const { left, top } = ref.current.getBoundingClientRect()

    const deltaX = event.clientX - left
    const deltaY = event.clientY - top

    ref.current.style.left = `${
      left + deltaX - mouseOffset.current.relativeX
    }px`
    ref.current.style.top = `${top + deltaY - mouseOffset.current.relativeY}px`

    props.onUpdate?.({
      box: ref.current.getBoundingClientRect(),
      deltaX,
      deltaY,
    })
  }

  return (
    <div
      {...props}
      ref={ref}
      draggable
      onDragStart={(event) => {
        if (!ref.current) return

        const { left, top } = ref.current.getBoundingClientRect()

        mouseOffset.current = {
          originX: left,
          originY: top,
          relativeX: (event.clientX - left) * (props.scale ?? 1),
          relativeY: (event.clientY - top) * (props.scale ?? 1),
        }

        preventDragImage(event)
      }}
      onDrag={updatePosition}
      onDragEnd={updatePosition}
      className={clsx(props.className, 'absolute cursor-move select-none')}
    >
      {props.children}
      <div
        className="absolute cursor-n-resize bg-transparent w-full h-4 top-0 -translate-y-1/2"
        onDragStart={(event) => {
          preventDragImage(event)
        }}
        draggable
        onDrag={(event) => {
          if (!ref.current) return

          const { top, height } = ref.current.getBoundingClientRect()

          const deltaY = event.clientY - top

          ref.current.style.top = `${top + deltaY}px`
          ref.current.style.height = `${height - deltaY}px`

          props.onUpdate?.({
            box: ref.current.getBoundingClientRect(),
            deltaX: 0,
            deltaY,
          })

          event.preventDefault()
          event.stopPropagation()
        }}
        onDragEnd={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
      />
      <div
        className="absolute cursor-s-resize bg-transparent w-full h-4 bottom-0 translate-y-1/2"
        onDragStart={(event) => {
          preventDragImage(event)
        }}
        draggable
        onDrag={(event) => {
          if (!ref.current) return

          const { top, height } = ref.current.getBoundingClientRect()

          const deltaY = event.clientY - top - height
          ref.current.style.height = `${height + deltaY}px`

          props.onUpdate?.({
            box: ref.current.getBoundingClientRect(),
            deltaX: 0,
            deltaY,
          })

          event.preventDefault()
          event.stopPropagation()
        }}
        onDragEnd={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
      />
      <div
        className="absolute cursor-w-resize bg-transparent w-4 h-full left-0 -translate-x-1/2"
        onDragStart={(event) => {
          preventDragImage(event)
        }}
        draggable
        onDrag={(event) => {
          if (!ref.current) return

          const { left, width } = ref.current.getBoundingClientRect()

          const deltaX = event.clientX - left
          ref.current.style.left = `${left + deltaX}px`
          ref.current.style.width = `${width - deltaX}px`

          props.onUpdate?.({
            box: ref.current.getBoundingClientRect(),
            deltaX,
            deltaY: 0,
          })

          event.preventDefault()
          event.stopPropagation()
        }}
        onDragEnd={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
      />
      <div
        className="absolute cursor-e-resize bg-transparent w-4 h-full right-0 translate-x-1/2"
        onDragStart={(event) => {
          preventDragImage(event)
        }}
        draggable
        onDrag={(event) => {
          if (!ref.current) return

          const { left, width } = ref.current.getBoundingClientRect()

          const deltaX = event.clientX - left - width
          ref.current.style.width = `${width + deltaX}px`

          props.onUpdate?.({
            box: ref.current.getBoundingClientRect(),
            deltaX,
            deltaY: 0,
          })

          event.preventDefault()
          event.stopPropagation()
        }}
        onDragEnd={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
      />
    </div>
  )
}
