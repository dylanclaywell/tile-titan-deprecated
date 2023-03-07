import React from 'react'

export interface Props {
  name: string
  iconName: string
  onClick: () => void
  classes?: string
}

export function LayerButton({ name, iconName, onClick, classes }: Props) {
  return (
    <button className={classes} onClick={onClick}>
      <i title={name} className={`fa-solid fa-${iconName}`}></i>
    </button>
  )
}
