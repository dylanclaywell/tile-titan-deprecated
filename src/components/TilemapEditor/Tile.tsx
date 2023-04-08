import React, { memo } from 'react'
import clsx from 'clsx'

function BaseTile({
  x,
  y,
  showGrid,
  tileWidth,
  tileHeight,
  src,
}: {
  x: number
  y: number
  showGrid: boolean
  tileWidth: number
  tileHeight: number
  src: string
}) {
  return (
    <div
      key={`tile-${x}`}
      data-type="tile"
      data-x={x}
      data-y={y}
      className={clsx({
        'select-none': showGrid,
      })}
      style={{
        width: tileWidth,
        height: tileHeight,
      }}
    >
      <img
        className="pointer-events-none outline-none select-none tile"
        src={src}
      />
    </div>
  )
}

export const Tile = memo(BaseTile)
