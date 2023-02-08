import React, { useContext, useEffect } from 'react'
import z from 'zod'

import TextField from './TextField'
import { ToolContext } from '../contexts/ToolContext'

const FormElement = z.instanceof(HTMLFormElement)
const FormData = z.object({
  name: z.instanceof(HTMLInputElement),
  width: z.instanceof(HTMLInputElement),
  height: z.instanceof(HTMLInputElement),
  tileWidth: z.instanceof(HTMLInputElement),
  tileHeight: z.instanceof(HTMLInputElement),
})
const Tilemap = z.object({
  name: z.string().min(1),
  tileWidth: z.number().positive(),
  tileHeight: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  data: z.array(z.array(z.number())),
})
type TilemapType = z.infer<typeof Tilemap>

function generateMap(width: number, height: number) {
  const rows = new Array(height).fill(0)
  const columns = new Array(width).fill(0)

  return rows.map(() => columns.map(() => 0))
}

const initialTilemap: TilemapType = {
  name: 'Test',
  tileWidth: 32,
  tileHeight: 32,
  width: 10,
  height: 10,
  data: generateMap(10, 10),
}

export default function TilemapEditor() {
  const [cursorRef, setCursorRef] = React.useState<HTMLDivElement | null>(null)
  const [toolState, { updateTileCanvas }] = useContext(ToolContext)
  const [tilemap, setTilemap] = React.useState<TilemapType>(initialTilemap)
  const [errors, setErrors] = React.useState<z.ZodIssue[]>()

  function hasError(name: string) {
    return errors?.some((error) => error.path.includes(name)) ?? false
  }

  function getErrorText(name: string) {
    const error = errors?.find((error) => error.path.includes(name))
    return error?.message ?? ''
  }

  useEffect(
    function registerTileTool() {
      function onMouseMove(e: MouseEvent) {
        if (toolState.tool.type !== 'tile') return

        const { clientX, clientY } = e

        if (e.target instanceof HTMLDivElement) {
          const isHoveringTilemapEditor =
            e.target.id === 'tilemap-editor' ||
            e.target.parentElement?.id === 'tilemap-grid'

          if (!cursorRef) return

          if (isHoveringTilemapEditor) {
            cursorRef.classList.remove('hidden')
            cursorRef.style.top = `${clientY - tilemap.tileHeight / 2}px`
            cursorRef.style.left = `${clientX - tilemap.tileWidth / 2}px`
          } else {
            cursorRef.classList.add('hidden')
          }
        }
      }

      document.addEventListener('mousemove', onMouseMove)

      return () => {
        document.removeEventListener('mousemove', onMouseMove)
      }
    },
    [tilemap, cursorRef]
  )

  return (
    <div>
      <div
        id="tilemap-editor"
        className="flex justify-center items-center bg-slate-200"
      >
        <div
          className="p-4 absolute pointer-events-none bg-sky-900 bg-opacity-50"
          ref={(el) => setCursorRef(el)}
          style={{
            width: tilemap.tileWidth,
            height: tilemap.tileHeight,
          }}
        >
          <img
            className="absolute top-0 left-0"
            style={{
              width: tilemap.tileWidth,
              height: tilemap.tileHeight,
            }}
            src={toolState.tool.tileCanvas.toDataURL()}
          />
        </div>

        <div
          id="tilemap-grid"
          className="grid border-l border-b border-black"
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
                  className="border-t border-r border-black"
                  style={{
                    width: tilemap.tileWidth,
                    height: tilemap.tileHeight,
                  }}
                ></div>
              )
            })
          })}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()

          try {
            const form = FormElement.parse(e.target)
            const formData = FormData.parse(form)
            const newTilemap = Tilemap.omit({ data: true }).parse({
              name: formData.name.value,
              width: Number(formData.width.value),
              height: Number(formData.height.value),
              tileWidth: Number(formData.tileWidth.value),
              tileHeight: Number(formData.tileHeight.value),
            })

            setTilemap({
              ...newTilemap,
              data: generateMap(
                Number(formData.width.value),
                Number(formData.height.value)
              ),
            })
            setErrors([])
          } catch (error) {
            if (error instanceof z.ZodError) {
              setErrors(error.errors)
            }
          }
        }}
      >
        <div className="flex flex-col gap-4">
          <TextField
            label="Name"
            hasError={hasError('name')}
            hintText={getErrorText('name')}
            inputProps={{ name: 'name', defaultValue: initialTilemap.name }}
          />
          <TextField
            label="Width"
            hasError={hasError('width')}
            hintText={getErrorText('width')}
            inputProps={{ name: 'width', defaultValue: initialTilemap.width }}
          />
          <TextField
            label="Height"
            hasError={hasError('height')}
            hintText={getErrorText('height')}
            inputProps={{ name: 'height', defaultValue: initialTilemap.height }}
          />
          <TextField
            label="Tile Width"
            hasError={hasError('tileWidth')}
            hintText={getErrorText('tileWidth')}
            inputProps={{
              name: 'tileWidth',
              defaultValue: initialTilemap.tileWidth,
            }}
          />
          <TextField
            label="Tile Height"
            hasError={hasError('tileHeight')}
            hintText={getErrorText('tileHeight')}
            inputProps={{
              name: 'tileHeight',
              defaultValue: initialTilemap.tileHeight,
            }}
          />
        </div>
        <button className="p-2 bg-gray-200 cursor-default hover:bg-gray-300">
          Apply
        </button>
      </form>
    </div>
  )
}
