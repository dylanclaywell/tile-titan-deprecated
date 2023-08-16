import React, { useCallback } from 'react'
import z from 'zod'

import { TextField } from '../TextField'
import { Overlay } from '../Overlay'
import { useKey } from '../../hooks/useKey'

const FormElement = z.instanceof(HTMLFormElement)
const FormData = z.object({
  name: z.instanceof(HTMLInputElement),
})

export interface Props {
  currentLayerName: string
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => void
}

export function RenameLayerModal({
  isOpen,
  onClose,
  onSubmit: onFormSubmit,
  currentLayerName,
}: Props) {
  const close = useCallback(() => {
    onClose()
  }, [onClose])

  useKey('Escape', close)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    try {
      const form = FormElement.parse(e.target)
      const formData = FormData.parse(form)

      const name = z.string().parse(formData.name.value)

      onFormSubmit(name)

      onClose()
    } catch (error) {
      console.error(error)
    }
  }

  if (!isOpen) return null

  return (
    <div>
      <Overlay onClick={onClose} />
      <form
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 p-4 bg-white border border-gray-300 rounded-md shadow-md z-50 space-y-2"
        onSubmit={onSubmit}
      >
        <h1>Rename Layer</h1>
        <TextField
          inputProps={{ name: 'name', defaultValue: currentLayerName }}
          label="Name"
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="button">
            Close
          </button>
          <button className="button">Apply</button>
        </div>
      </form>
    </div>
  )
}
