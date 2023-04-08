import React from 'react'
import clsx from 'clsx'

export interface Props {
  id: string
  isVisible: boolean
  src: string
  x: number
  y: number
  onClick: () => void
}

function StructureBase({ id, isVisible, src, x, y, onClick }: Props) {
  return (
    <img
      key={`structure-${id}`}
      className={clsx('absolute select-none', {
        hidden: !isVisible,
      })}
      data-type="structure"
      data-id={id}
      src={src}
      style={{
        top: y,
        left: x,
      }}
      draggable={false}
      onClick={onClick}
    />
  )
}

export const Structure = React.memo(StructureBase, (prev, next) => {
  return prev.id !== next.id
})
