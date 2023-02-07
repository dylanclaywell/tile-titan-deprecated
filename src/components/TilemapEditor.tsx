import React from 'react'

import TextField from './TextField'

interface Tilemap {
  name: string
  tileWidth: number
  tileHeight: number
  width: number
  height: number
  data: number[][]
}

function generateMap(width: number, height: number) {
  const rows = new Array(height).fill(0)
  const columns = new Array(width).fill(0)

  return rows.map(() => columns.map(() => 0))
}

export default function TilemapEditor() {
  const [tilemap, setTilemap] = React.useState<Tilemap>({
    name: 'Test',
    tileWidth: 32,
    tileHeight: 32,
    width: 10,
    height: 10,
    data: generateMap(10, 10),
  })

  return (
    <div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${tilemap.width}, ${tilemap.tileWidth}px)`,
          gridTemplateRows: `repeat(${tilemap.height}, ${tilemap.tileHeight}px)`,
        }}
      >
        {tilemap.data.map((row) => {
          return row.map((tile, i) => {
            return (
              <div
                key={i}
                className="border"
                style={{
                  width: tilemap.tileWidth,
                  height: tilemap.tileHeight,
                }}
              ></div>
            )
          })
        })}
      </div>

      <TextField value="" onChange={() => undefined} label="Width" />
      <TextField value="" onChange={() => undefined} label="Height" />
    </div>
  )
}
