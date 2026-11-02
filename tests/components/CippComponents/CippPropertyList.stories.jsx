import { CippPropertyList } from '../../../src/components/CippComponents/CippPropertyList'

const tenantPropertyItems = [
  { label: 'Display Name', value: 'Contoso Ltd' },
  { label: 'Default Domain', value: 'contoso.onmicrosoft.com' },
  { label: 'Custom Domain', value: 'contoso.com' },
  { label: 'Tenant ID', value: '72f988bf-86f1-41af-91ab-2d7cd011db47' },
  { label: 'License Count', value: '250' },
  { label: 'Created', value: '2021-01-15' },
]

export default {
  title: 'Components/CippComponents/CippPropertyList',
  component: CippPropertyList,
  tags: ['autodocs'],
  argTypes: {
    align: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
    },
    layout: {
      control: { type: 'select' },
      options: ['single', 'dual'],
    },
    isFetching: { control: 'boolean' },
    copyItems: { control: 'boolean' },
    showDivider: { control: 'boolean' },
  },
}

export const SingleLayout = {
  args: {
    propertyItems: tenantPropertyItems,
  },
}

export const DualLayout = {
  args: {
    propertyItems: tenantPropertyItems,
    layout: 'dual',
  },
}

export const Loading = {
  args: {
    propertyItems: tenantPropertyItems,
    isFetching: true,
  },
}

export const NoDividers = {
  args: {
    propertyItems: tenantPropertyItems,
    showDivider: false,
  },
}
