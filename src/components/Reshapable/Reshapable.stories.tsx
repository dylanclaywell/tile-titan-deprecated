import type { Meta, StoryObj } from '@storybook/react'

import { Reshapable } from './Reshapable'

const meta: Meta<typeof Reshapable> = {
  component: Reshapable,
}

export default meta

type Story = StoryObj<typeof Reshapable>

export const Default: Story = {
  render: () => (
    <Reshapable
      className={
        'border border-black w-40 h-40 flex justify-center items-center'
      }
    >
      Reshapable Div
    </Reshapable>
  ),
}

export const RelativeToContainer: Story = {
  render: () => (
    <div
      className={
        'border border-black relative w-96 h-96 flex justify-center items-center'
      }
      style={{
        zoom: 0.5,
      }}
    >
      <Reshapable scale={0.5} className={'border border-black w-40 h-40'}>
        Reshapable Div
      </Reshapable>
    </div>
  ),
}
