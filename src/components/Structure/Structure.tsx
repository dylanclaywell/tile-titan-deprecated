import React from 'react'
import clsx from 'clsx'
import { useAppSelector } from '../../hooks/redux'

export interface Props {
  id: string
  isVisible: boolean
  src: string
  x: number
  y: number
  onClick: () => void
}

function StructureBase({ id, isVisible, src, x, y, onClick }: Props) {
  const toolType = useAppSelector((state) => state.cursor.toolType)

  return (
    <img
      key={`structure-${id}`}
      className={clsx('absolute select-none', {
        hidden: !isVisible,
        'hover:bg-blue-200': toolType !== 'remove',
        'hover:bg-red-200': toolType === 'remove',
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
