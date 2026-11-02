import { fn } from 'storybook/test'
import { CippCopyToClipBoard } from '../../../src/components/CippComponents/CippCopyToClipboard'

export default {
  title: 'Components/CippComponents/CippCopyToClipboard',
  component: CippCopyToClipBoard,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['button', 'chip', 'password'],
    },
    visible: { control: 'boolean' },
  },
  args: {
    onClick: fn(),
  },
}

export const Default = {
  args: {
    text: 'Copy me!',
    type: 'button',
    visible: true,
  },
}

export const Chip = {
  args: {
    text: 'cipp-secret-key',
    type: 'chip',
    visible: true,
  },
}

export const Password = {
  args: {
    text: 'S3cr3tP@ssw0rd',
    type: 'password',
    visible: true,
  },
}
