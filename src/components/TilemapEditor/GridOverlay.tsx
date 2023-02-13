import React from 'react'
import clsx from 'clsx'

export interface Props {
  width: number
  height: number
  tileWidth: number
  tileHeight: number
  show: boolean
}

export function GridOverlay({
  width,
  height,
  tileWidth,
  tileHeight,
  show,
}: Props) {
  return (
    <div
      className="grid absolute z-30 pointer-events-none box-border"
      style={{
        gridTemplateColumns: `repeat(${width}, ${tileWidth}px)`,
        gridTemplateRows: `repeat(${height}, ${tileHeight}px)`,
      }}
    >
      {Array.from({ length: width * height }, (_, i) => {
        return (
          <div
            key={`grid-${i}`}
            className={clsx(
              'border-t border-r border-black border-opacity-25',
              {
                'border-transparent': !show,
              }
            )}
            style={{ width: tileWidth, height: tileHeight }}
          />
        )
      })}
    </div>
  )
}
