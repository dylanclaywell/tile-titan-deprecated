import React, { useCallback, useContext, useState } from 'react'
import z from 'zod'

import { TextField } from '../TextField'
import { generateMap } from '../../utils/generateMap'
import { LayerType } from '../../types/layer'
import { EditorContext } from '../../contexts/EditorContext'
import { Overlay } from '../Overlay'
import { useKey } from '../../hooks/useKey'
import { zodStringToNumber } from '../../utils/zodStringToNumber'

const Form = z.object({
  name: z.string().min(1),
  width: z.string().min(1).transform(zodStringToNumber),
  height: z.string().min(1).transform(zodStringToNumber),
  tileWidth: z.string().min(1).transform(zodStringToNumber),
  tileHeight: z.string().min(1).transform(zodStringToNumber),
})

export interface Props {
  isOpen: boolean
  layer: LayerType
  onClose: () => void
}

export function SettingsModal({ isOpen, layer, onClose }: Props) {
  const close = useCallback(() => {
    onClose()
  }, [])
  useKey('Escape', close)

  const [
    { width, height, tileWidth, tileHeight },
    { updateLayerSettings, updateTilemapSettings, regenerateMap },
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

    if (!(e.target instanceof HTMLFormElement)) return

    const formData = Object.fromEntries(new FormData(e.target).entries())

    console.log(formData)

    try {
      const form = Form.parse(formData)
      updateLayerSettings(layer.id, {
        name: form.name,
      })

      if (layer.type === 'tilelayer') {
        regenerateMap(layer.id, form.width, form.height)
      }
      updateTilemapSettings({
        width: form.width,
        height: form.height,
        tileWidth: form.tileWidth,
        tileHeight: form.tileHeight,
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
      <Overlay onClick={onClose} />
      <form
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 p-4 bg-white border border-gray-300 rounded-md shadow-md z-50 space-y-2"
        onSubmit={onSubmit}
      >
        <h1>Tilemap Settings</h1>
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
        <div className="flex justify-end space-x-2">
          <button type="button" className="button" onClick={onClose}>
            Close
          </button>
          <button className="button">Apply</button>
        </div>
      </form>
    </>
  )
}
