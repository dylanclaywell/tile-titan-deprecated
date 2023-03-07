import React from 'react'
import { TextField } from './TextField'
import { Overlay } from './Overlay'

export interface Props {
  isOpen: boolean
  onSubmit: ({ name }: { name: string }) => void
  onClose: () => void
}

export function TilesetSettingsModal({ isOpen, onClose, onSubmit }: Props) {
  if (!isOpen) return null

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.target as HTMLFormElement)
    const name = form.get('name') as string

    onSubmit({ name })
    onClose()
  }

  return (
    <>
      <Overlay onClick={onClose} />
      <form
        onSubmit={submit}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 z-50 bg-white rounded-md space-y-2"
      >
        <TextField inputProps={{ name: 'name' }} label="Name" />
        <div className="flex justify-end space-x-2">
          <button type="button" className="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button">Apply</button>
        </div>
      </form>
    </>
  )
}
