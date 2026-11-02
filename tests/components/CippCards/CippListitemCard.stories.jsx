import { CippListItemCard } from '../../../src/components/CippCards/CippListitemCard'

export default {
  title: 'Components/CippCards/CippListItemCard',
  component: CippListItemCard,
  tags: ['autodocs'],
  argTypes: {
    isFetching: { control: 'boolean' },
  },
}

export const Default = {
  args: {
    title: 'Notifications',
    listitems: [
      { id: '1', message: 'New user created' },
      { id: '2', message: 'License assigned' },
    ],
    textKey: 'message',
    seeAllLink: '/notifications',
    seeAllText: 'See All Notifications',
  },
}

export const EmptyList = {
  args: {
    title: 'Notifications',
    listitems: [],
    textKey: 'message',
  },
}

export const Loading = {
  args: {
    title: 'Loading...',
    isFetching: true,
    listitems: [],
    textKey: 'message',
  },
}
