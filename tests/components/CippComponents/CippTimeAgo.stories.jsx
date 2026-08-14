import { CippTimeAgo } from '../../../src/components/CippComponents/CippTimeAgo'

export default {
  title: 'Components/CippComponents/CippTimeAgo',
  component: CippTimeAgo,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'chip'],
    },
    timeStyle: {
      control: { type: 'select' },
      options: ['round-minute', 'round', 'mini', 'short', 'long'],
    },
  },
}

export const RecentDate = {
  args: {
    data: new Date(Date.now() - 300000).toISOString(),
    type: 'text',
  },
}

export const OldDate = {
  args: {
    data: '2024-01-15T10:30:00Z',
    type: 'text',
  },
}

export const ChipType = {
  args: {
    data: new Date(Date.now() - 3600000).toISOString(),
    type: 'chip',
  },
}

export const InvalidDate = {
  args: {
    data: 'not-a-date',
    type: 'text',
  },
}

export const Never = {
  args: {
    data: 0,
    type: 'text',
  },
}
