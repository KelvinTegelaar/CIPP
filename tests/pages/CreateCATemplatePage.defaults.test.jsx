import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders } from '../test-utils'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)

const pageProps = vi.fn()
vi.mock('../../src/components/CippFormPages/CippFormPage', () => ({
  default: (props) => {
    pageProps(props)
    return null
  },
}))

import CreateCATemplate from '../../src/pages/tenant/conditional/list-template/create.jsx'

describe('Create CA template page', () => {
  it('starts with the fields that would otherwise block Submit already filled', () => {
    renderWithProviders(<CreateCATemplate />)
    const { formControl, customDataformatter } = pageProps.mock.calls.at(-1)[0]
    const values = formControl.getValues()

    expect(values.conditions.clientAppTypes).toEqual([
      { label: 'All', value: 'all' },
    ])
    expect(values.grantControls.operator.value).toBe('OR')

    const sessionOnly = customDataformatter({ ...values, displayName: 'CA1' })
    expect(sessionOnly.conditions.clientAppTypes).toEqual(['all'])
    expect(sessionOnly.grantControls).toBeUndefined()

    const blocking = customDataformatter({
      ...values,
      displayName: 'CA2',
      grantControls: {
        ...values.grantControls,
        builtInControls: [{ label: 'Block access', value: 'block' }],
      },
    })
    expect(blocking.grantControls).toEqual({
      operator: 'OR',
      builtInControls: ['block'],
    })
  })
})
