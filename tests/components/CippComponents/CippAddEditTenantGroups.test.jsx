import { useEffect } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { renderWithProviders } from '../../test-utils'
import CippAddEditTenantGroups from '../../../src/components/CippComponents/CippAddEditTenantGroups'

// the member picker and rule builder are not part of the name field
vi.mock(
  '../../../src/components/CippComponents/CippFormTenantSelector',
  () => ({
    CippFormTenantSelector: () => null,
  })
)
vi.mock(
  '../../../src/components/CippComponents/CippTenantGroupRuleBuilder',
  () => ({
    default: () => null,
  })
)

const controlRef = { current: null }
const Harness = () => {
  const formControl = useForm({
    mode: 'onChange',
    defaultValues: { groupName: '', groupType: 'static' },
  })
  useEffect(() => {
    controlRef.current = formControl
  }, [formControl])
  return <CippAddEditTenantGroups formControl={formControl} />
}

const typeName = async (name) => {
  const user = userEvent.setup()
  renderWithProviders(<Harness />)
  await user.type(screen.getByRole('textbox', { name: /^Group Name/ }), name)
  return controlRef.current.trigger('groupName')
}

describe('CippAddEditTenantGroups group name', () => {
  // the API refuses these too; onboarding owns one and baselines/templates treat the others as placeholders
  it.each([
    'Exported Template',
    'template tenant',
    'AllTenants',
    'Excluded onboarded tenants',
  ])('refuses the reserved name %s before it is sent', async (name) => {
    expect(await typeName(name)).toBe(false)
    expect(await screen.findByText(/is a reserved name/)).toBeInTheDocument()
  })

  it('accepts an ordinary name', async () => {
    expect(await typeName('Customers')).toBe(true)
    await waitFor(() =>
      expect(screen.queryByText(/is a reserved name/)).not.toBeInTheDocument()
    )
  })
})
