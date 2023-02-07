import React, { useEffect } from 'react'
import html2canvas from 'html2canvas'

import { TilesetUploader } from './TilesetUploader'
import { TilesetType, getTilesets } from '../indexedDB/tileset'

export default function TilesetViewer() {
  const [tilesets, setTilesets] = React.useState<TilesetType[]>([])
  const [imageIsLoaded, setImageIsLoaded] = React.useState(false)
  const [cursorRef, setCursorRef] = React.useState<HTMLDivElement | null>(null)
  const [imageRef, setImageRef] = React.useState<HTMLImageElement | null>(null)
  const [canvas, setCanvas] = React.useState<HTMLCanvasElement | null>(null)

  async function refreshTilesets() {
    setTilesets(await getTilesets())
  }

  useEffect(() => {
    refreshTilesets()
  }, [])

  function handleAreaHover(e: React.MouseEvent<HTMLAreaElement, MouseEvent>) {
    if (!(e.target instanceof HTMLAreaElement) || !cursorRef) return

    const coords = e.target.coords
    const [x, y] = coords.split(',').map((n) => parseInt(n))

    cursorRef.style.top = `${y}px`
    cursorRef.style.left = `${x}px`
  }

  async function handleAreaClick(
    e: React.MouseEvent<HTMLAreaElement, MouseEvent>
  ) {
    e.preventDefault()

    if (!(e.target instanceof HTMLAreaElement) || !imageRef) return

    const coords = e.target.coords
    const [x1, y1, x2, y2] = coords.split(',').map((n) => parseInt(n))

    const image = await html2canvas(imageRef, {
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1,
    })
    setCanvas(image)
  }

  const imageWidth = imageIsLoaded && imageRef ? imageRef.width : 0
  const imageHeight = imageIsLoaded && imageRef ? imageRef.height : 0

  const rows = new Array(imageHeight / 32).fill(0)
  const columns = new Array(imageWidth / 32).fill(0)

  const grid = rows.map(() => columns.map(() => 0))

  const map =
    imageWidth && imageHeight ? (
      <map name={`testmap`}>
        {grid.map((row, i) => {
          return row.map((tile, j) => {
            return (
              <area
                key={`${i}-${j}`}
                onClick={handleAreaClick}
                onMouseOver={handleAreaHover}
                shape="rect"
                coords={`${j * 32},${i * 32},${j * 32 + 32},${i * 32 + 32}`}
                href="#"
                alt="tile"
              />
            )
          })
        })}
      </map>
    ) : null

  return (
    <div>
      {canvas && (
        <div className="p-4">
          <img className="w-8 h-8" src={canvas.toDataURL()} />
        </div>
      )}
      {tilesets.map((tileset) => (
        <div key={tileset.id} className="relative">
          <img
            ref={(el) => setImageRef(el)}
            className="max-w-none"
            src={tileset.blob}
            alt="tileset"
            useMap={`#testmap`}
            onLoad={() => {
              setImageIsLoaded(true)
            }}
          />
          <div
            ref={(el) => setCursorRef(el)}
            className="absolute bg-blue-600 z-50 w-8 h-8 pointer-events-none opacity-50"
          />
          {map}
        </div>
      ))}
      <TilesetUploader refreshTilesets={refreshTilesets} />
    </div>
  )
}
