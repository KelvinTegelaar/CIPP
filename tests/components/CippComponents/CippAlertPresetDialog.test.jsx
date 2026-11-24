import { render } from '@testing-library/react'
import { CippAlertPresetDialog } from '../../../src/components/CippComponents/CippAlertPresetDialog'

const captured = { props: null }
vi.mock('../../../src/components/CippComponents/CippApiDialog', () => ({
  CippApiDialog: (props) => {
    captured.props = props
    return null
  },
}))
vi.mock(
  '../../../src/components/CippComponents/CippFormTenantSelector',
  () => ({
    CippFormTenantSelector: () => null,
  })
)

const renderDialog = () => {
  render(
    <CippAlertPresetDialog
      createDialog={{ open: true, handleClose: () => {} }}
      tenant="contoso.onmicrosoft.com"
      operation="New-InboxRule"
      logbook="Audit.Exchange"
    />
  )
  const { api, defaultvalues } = captured.props
  return {
    defaultvalues,
    send: (formData) =>
      api.customDataformatter({}, {}, { Actions: [], ...formData }),
  }
}

describe('CippAlertPresetDialog scope', () => {
  it('defaults to the current tenant and sends it', () => {
    const { defaultvalues, send } = renderDialog()
    const tenant = {
      value: 'contoso.onmicrosoft.com',
      label: 'contoso.onmicrosoft.com',
      type: 'Tenant',
    }
    expect(defaultvalues.tenantFilter).toEqual([tenant])
    const body = send(defaultvalues)
    expect(body.tenantFilter).toEqual([tenant])
    expect(body.excludedTenants).toEqual([])
  })

  it('sends All Tenants when chosen', () => {
    const allTenants = [
      { value: 'AllTenants', label: 'All Tenants', type: 'Tenant' },
    ]
    const body = renderDialog().send({ tenantFilter: allTenants })
    expect(body.tenantFilter).toEqual(allTenants)
  })

  it('passes excluded tenants through', () => {
    const excluded = [
      { value: 'fabrikam.onmicrosoft.com', label: 'Fabrikam', type: 'Tenant' },
    ]
    const body = renderDialog().send({
      tenantFilter: [
        { value: 'AllTenants', label: 'All Tenants', type: 'Tenant' },
      ],
      excludedTenants: excluded,
    })
    expect(body.excludedTenants).toEqual(excluded)
  })
})
