import React from 'react'
import clsx from 'clsx'

export function Tile({
  x,
  y,
  showGrid,
  tileWidth,
  tileHeight,
}: {
  x: number
  y: number
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
      className={clsx({
        'border-t border-r border-black border-opacity-10 select-none':
          showGrid,
      })}
      style={{
        width: tileWidth,
        height: tileHeight,
      }}
    >
      <img className="pointer-events-none outline-none select-none" />
    </div>
  )
}
