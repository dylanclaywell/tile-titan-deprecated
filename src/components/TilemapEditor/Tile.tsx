import React from 'react'
import clsx from 'clsx'

export function Tile({
  x,
  y,
  classes,
  showGrid,
  tileWidth,
  tileHeight,
}: {
  x: number
  y: number
  classes?: string
  showGrid: boolean
  tileWidth: number
  tileHeight: number
}) {
  return (
    <div
      key={`tile-${x}`}
      data-type="tile"
      data-x={x}
      data-y={y}
      className={clsx(
        {
          'border-t border-r border-black border-opacity-25 select-none':
            showGrid,
        },
        classes
      )}
      style={{
        width: tileWidth,
        height: tileHeight,
      }}
    >
      <img className="pointer-events-none outline-none select-none" />
    </div>
  )
}
