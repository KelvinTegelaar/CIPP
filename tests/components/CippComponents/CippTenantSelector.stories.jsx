import { CippTenantSelector } from '../../../src/components/CippComponents/CippTenantSelector'

const meta = {
  component: CippTenantSelector,
  title: 'Components/CippComponents/CippTenantSelector',
  argTypes: {
    width: { control: 'number', defaultValue: 400 },
    tenant: {
      control: { type: 'text' },
    },
    onChange: { action: 'onChange' },
  },
}

export default meta

export const Default = {}
