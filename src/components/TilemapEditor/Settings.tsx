import React, { useState } from 'react'
import z from 'zod'

import TextField from '../TextField'
import { Tilemap, TilemapType } from '../../types/tilemap'
import { generateMap } from '../../utils/generateMap'

const FormElement = z.instanceof(HTMLFormElement)
const FormData = z.object({
  name: z.instanceof(HTMLInputElement),
  width: z.instanceof(HTMLInputElement),
  height: z.instanceof(HTMLInputElement),
  tileWidth: z.instanceof(HTMLInputElement),
  tileHeight: z.instanceof(HTMLInputElement),
})

export interface Props {
  isOpen: boolean
  updateTilemap: (tilemap: TilemapType) => void
  tilemap: TilemapType
  onClose: () => void
}

export function TilemapEditorSettings({
  isOpen,
  updateTilemap,
  tilemap,
  onClose,
}: Props) {
  const [errors, setErrors] = useState<z.ZodIssue[]>()

  function hasError(name: string) {
    return errors?.some((error) => error.path.includes(name)) ?? false
  }

  function getErrorText(name: string) {
    const error = errors?.find((error) => error.path.includes(name))
    return error?.message ?? ''
  }

  if (!isOpen) return null

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
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

      updateTilemap({
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
  }

  return (
    <>
      <div className="absolute top-0 bottom-0 left-0 right-0 bg-gray-500 opacity-50 z-40" />
      <form
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 p-4 bg-white border border-gray-300 rounded-md shadow-md z-50"
        onSubmit={onSubmit}
      >
        <div className="flex flex-col gap-4">
          <TextField
            label="Name"
            hasError={hasError('name')}
            hintText={getErrorText('name')}
            inputProps={{ name: 'name', defaultValue: tilemap.name }}
          />
          <TextField
            label="Width"
            hasError={hasError('width')}
            hintText={getErrorText('width')}
            inputProps={{ name: 'width', defaultValue: tilemap.width }}
          />
          <TextField
            label="Height"
            hasError={hasError('height')}
            hintText={getErrorText('height')}
            inputProps={{
              name: 'height',
              defaultValue: tilemap.height,
            }}
          />
          <TextField
            label="Tile Width"
            hasError={hasError('tileWidth')}
            hintText={getErrorText('tileWidth')}
            inputProps={{
              name: 'tileWidth',
              defaultValue: tilemap.tileWidth,
            }}
          />
          <TextField
            label="Tile Height"
            hasError={hasError('tileHeight')}
            hintText={getErrorText('tileHeight')}
            inputProps={{
              name: 'tileHeight',
              defaultValue: tilemap.tileHeight,
            }}
          />
        </div>
        <div className="flex justify-end space-x-2 mt-2">
          <button
            type="button"
            className="p-2 bg-gray-200 cursor-default rounded-md hover:bg-gray-300"
            onClick={onClose}
          >
            Close
          </button>
          <button className="p-2 bg-gray-200 cursor-default rounded-md hover:bg-gray-300">
            Apply
          </button>
        </div>
      </form>
    </>
  )
}
