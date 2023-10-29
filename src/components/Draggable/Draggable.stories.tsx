import type { Meta, StoryObj } from '@storybook/react'

import { Draggable } from './Draggable'

const meta: Meta<typeof Draggable> = {
  component: Draggable,
}

export default meta

type Story = StoryObj<typeof Draggable>

export const Default: Story = {
  render: () => (
    <Draggable className="border border-black">Draggable Div</Draggable>
  ),
}
