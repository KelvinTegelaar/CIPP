import { CippInfoCard } from '../../../src/components/CippCards/CippInfoCard'

export default {
  title: 'Components/CippCards/CippInfoCard',
  component: CippInfoCard,
  tags: ['autodocs'],
  argTypes: {
    isFetching: { control: 'boolean' },
  },
}

export const Default = {
  args: {
    label: 'Total Users',
    value: '1,234',
  },
}

export const WithActionLink = {
  args: {
    label: 'Total Users',
    value: '1,234',
    actionLink: '/users',
    actionText: 'View All',
  },
}

export const Loading = {
  args: {
    label: 'Total Users',
    value: '1,234',
    isFetching: true,
  },
}
