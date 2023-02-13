import React, { useContext, useState } from 'react'
import z from 'zod'

import TextField from '../TextField'
import { generateMap } from '../../utils/generateMap'
import { Layer, LayerType } from '../../types/layer'
import { EditorContext } from '../../contexts/EditorContext'

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
  layer: LayerType
  onClose: () => void
}

export function TilemapEditorSettings({ isOpen, layer, onClose }: Props) {
  const [
    { width, height, tileWidth, tileHeight },
    { updateLayerSettings, updateTilemapSettings },
  ] = useContext(EditorContext)
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

      const name = z.string().parse(formData.name.value)
      const width = z
        .number()
        .positive()
        .min(1)
        .parse(Number(formData.width.value))
      const height = z
        .number()
        .positive()
        .min(1)
        .parse(Number(formData.height.value))
      const tileWidth = z
        .number()
        .positive()
        .min(1)
        .parse(Number(formData.tileWidth.value))
      const tileHeight = z
        .number()
        .positive()
        .min(1)
        .parse(Number(formData.tileHeight.value))

      console.log({
        name,
        width,
        height,
        tileWidth,
        tileHeight,
      })

      updateLayerSettings(layer.id, {
        name,
        tilemap: generateMap(width, height),
      })
      updateTilemapSettings({
        width,
        height,
        tileWidth,
        tileHeight,
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
            inputProps={{ name: 'name', defaultValue: layer.name }}
          />
          <TextField
            label="Width"
            hasError={hasError('width')}
            hintText={getErrorText('width')}
            inputProps={{ name: 'width', defaultValue: width }}
          />
          <TextField
            label="Height"
            hasError={hasError('height')}
            hintText={getErrorText('height')}
            inputProps={{
              name: 'height',
              defaultValue: height,
            }}
          />
          <TextField
            label="Tile Width"
            hasError={hasError('tileWidth')}
            hintText={getErrorText('tileWidth')}
            inputProps={{
              name: 'tileWidth',
              defaultValue: tileWidth,
            }}
          />
          <TextField
            label="Tile Height"
            hasError={hasError('tileHeight')}
            hintText={getErrorText('tileHeight')}
            inputProps={{
              name: 'tileHeight',
              defaultValue: tileHeight,
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
