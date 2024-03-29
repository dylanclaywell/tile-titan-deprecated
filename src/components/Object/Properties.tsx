import React, { useState } from 'react'
import z from 'zod'

import { ObjectType } from '../../types/object'
import { TextField } from '../TextField'
import { useKey } from '../../hooks/useKey'
import { zodStringToNumber } from '../../utils/zodStringToNumber'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { updateObjectSettings } from '../../features/editor/editorSlice'

export interface Props {
  object: ObjectType
}

function isPropertiesFormElement(
  element: HTMLElement | null | undefined
): element is HTMLFormElement {
  return (
    element instanceof HTMLFormElement && element.id === 'object-properties'
  )
}

const Form = z.object({
  name: z.string().min(1),
  width: z.string().transform(zodStringToNumber),
  height: z.string().transform(zodStringToNumber),
  x: z.string().transform(zodStringToNumber),
  y: z.string().transform(zodStringToNumber),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
})

type FormType = z.infer<typeof Form>
type Errors = {
  [key in keyof FormType]?: string
}

export function Properties({ object }: Props) {
  const [errors, setErrors] = useState<Errors>({})
  const { selectedLayerId, selectedFileId, files } = useAppSelector(
    (state) => ({
      selectedLayerId: state.editor.selectedLayerId,
      selectedFileId: state.editor.selectedFileId,
      files: state.editor.files,
    })
  )
  const dispatch = useAppDispatch()

  const currentFile = files.find((file) => file.id === selectedFileId)
  const currentLayer = currentFile?.layers.find(
    (layer) => layer.id === selectedLayerId
  )

  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    const parent = e.currentTarget.closest('form')
    if (isPropertiesFormElement(parent)) parent.requestSubmit()
  }

  function onEnter() {
    const parent = document.activeElement?.closest('form')
    if (isPropertiesFormElement(parent)) parent.requestSubmit()
  }

  useKey('Enter', onEnter)

  if (!currentLayer || currentLayer.type !== 'object') return null

  return (
    <div className="p-2 border-t border-gray-300 space-y-2 basis-1/2 flex-1 overflow-y-auto">
      <h2 className="text-gray-400">Properties</h2>
      <form
        key={object.id}
        id="object-properties"
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          const rawValues = Object.fromEntries(formData.entries())

          try {
            const values = Form.parse(rawValues)
            setErrors({})

            dispatch(
              updateObjectSettings({
                layerId: currentLayer.id,
                objectId: object.id,
                object: values,
              })
            )
          } catch (error) {
            console.log(error)

            if (error instanceof z.ZodError) {
              const errors: Errors = {}

              error.issues.forEach((issue) => {
                errors[issue.path[0] as keyof FormType] = issue.message
              })

              setErrors(errors)
            }
          }
        }}
      >
        <TextField
          label="Name"
          inputProps={{ defaultValue: object.name, name: 'name' }}
          onBlur={onBlur}
          hasError={errors.name !== undefined}
          hintText={errors.name}
        />
        <TextField
          label="Width"
          inputProps={{
            defaultValue: object.width.toString(),
            name: 'width',
          }}
          onBlur={onBlur}
          hasError={errors.width !== undefined}
          hintText={errors.width}
        />
        <TextField
          label="Height"
          inputProps={{
            defaultValue: object.height.toString(),
            name: 'height',
          }}
          onBlur={onBlur}
          hasError={errors.height !== undefined}
          hintText={errors.height}
        />
        <TextField
          label="X"
          inputProps={{
            defaultValue: object.x.toString(),
            name: 'x',
          }}
          onBlur={onBlur}
          hasError={errors.x !== undefined}
          hintText={errors.x}
        />
        <TextField
          label="Y"
          inputProps={{
            defaultValue: object.y.toString(),
            name: 'y',
          }}
          onBlur={onBlur}
          hasError={errors.y !== undefined}
          hintText={errors.y}
        />
        <TextField
          label="Color"
          inputProps={{
            defaultValue: object.color ?? '#000000',
            name: 'color',
          }}
          onBlur={onBlur}
          hasError={errors.color !== undefined}
          hintText={errors.color}
        />
      </form>
    </div>
  )
}
