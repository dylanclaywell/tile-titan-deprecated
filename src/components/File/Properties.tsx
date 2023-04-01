import React, { useState } from 'react'
import z from 'zod'

import { TextField } from '../TextField'
import { useKey } from '../../hooks/useKey'
import {
  zodCheckboxValueToBoolean,
  zodStringToNumber,
} from '../../utils/zodStringToNumber'
import { updateFileSettings } from '../../features/editor/editorSlice'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'

function isPropertiesFormElement(
  element: HTMLElement | null | undefined
): element is HTMLFormElement {
  return element instanceof HTMLFormElement && element.id === 'file-properties'
}

const Form = z.object({
  name: z.string().min(1),
  width: z.string().transform(zodStringToNumber),
  height: z.string().transform(zodStringToNumber),
  tileWidth: z.string().transform(zodStringToNumber),
  tileHeight: z.string().transform(zodStringToNumber),
  isStructure: z.string().optional().transform(zodCheckboxValueToBoolean),
})

type FormType = z.infer<typeof Form>
type Errors = {
  [key in keyof FormType]?: string
}

export function Properties() {
  const { selectedFileId, files } = useAppSelector((state) => ({
    selectedFileId: state.editor.selectedFileId,
    files: state.editor.files,
  }))
  const [errors, setErrors] = useState<Errors>({})
  const dispatch = useAppDispatch()

  const currentFile = files.find((file) => file.id === selectedFileId)

  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    const parent = e.currentTarget.closest('form')
    if (isPropertiesFormElement(parent)) parent.requestSubmit()
  }

  function onEnter() {
    const parent = document.activeElement?.closest('form')
    if (isPropertiesFormElement(parent)) parent.requestSubmit()
  }

  useKey('Enter', onEnter)

  if (!currentFile) return null

  return (
    <div className="p-2 border-t border-gray-300 space-y-2 basis-1/2 flex-1 overflow-y-auto">
      <h2 className="text-gray-400">Properties</h2>
      <form
        key={currentFile.id}
        id="file-properties"
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          const rawValues = Object.fromEntries(formData.entries())
          try {
            const values = Form.parse(rawValues)
            setErrors({})

            dispatch(updateFileSettings(values))
          } catch (error) {
            console.error(error)

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
          inputProps={{ defaultValue: currentFile.name, name: 'name' }}
          onBlur={onBlur}
          hasError={errors.name !== undefined}
          hintText={errors.name}
        />
        <TextField
          label="Width"
          inputProps={{
            defaultValue: currentFile.width.toString(),
            name: 'width',
          }}
          onBlur={onBlur}
          hasError={errors.width !== undefined}
          hintText={errors.width}
        />
        <TextField
          label="Height"
          inputProps={{
            defaultValue: currentFile.height.toString(),
            name: 'height',
          }}
          onBlur={onBlur}
          hasError={errors.height !== undefined}
          hintText={errors.height}
        />
        <TextField
          label="Tile Width"
          inputProps={{
            defaultValue: currentFile.tileWidth.toString(),
            name: 'tileWidth',
          }}
          onBlur={onBlur}
          hasError={errors.tileWidth !== undefined}
          hintText={errors.tileWidth}
        />
        <TextField
          label="Tile Height"
          inputProps={{
            defaultValue: currentFile.tileHeight.toString(),
            name: 'tileHeight',
          }}
          onBlur={onBlur}
          hasError={errors.tileHeight !== undefined}
          hintText={errors.tileHeight}
        />
        <label className="flex items-center space-x-2">
          <input
            name="isStructure"
            type="checkbox"
            defaultChecked={currentFile.isStructure}
            onChange={() => onEnter()}
          />
          <span>Is Structure</span>
        </label>
      </form>
    </div>
  )
}
