import React, { useState } from 'react'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@mui/material'
import { renderWithTheme } from '../../test-utils'
import { CippOffCanvas } from '../../../src/components/CippComponents/CippOffCanvas'

const mockDeviceData = {
  displayName: 'DESKTOP-ENTRA-01',
  userPrincipalName: 'jdoe@domain.com',
  mdeStatus: 'Active',
  riskLevel: 'Low',
  nested: {
    osVersion: 'Windows 11',
  },
}

const InteractiveWrapper = ({ onClose, onNavigateUp, onNavigateDown, ...props }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open offcanvas
      </Button>
      <CippOffCanvas
        {...props}
        visible={open}
        onClose={(...args) => {
          setOpen(false)
          onClose?.(...args)
        }}
        onNavigateUp={onNavigateUp}
        onNavigateDown={onNavigateDown}
      />
    </>
  )
}

describe('CippOffCanvas', () => {
  it('opens drawer, shows content, navigates, and closes', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onNavigateUp = vi.fn()
    const onNavigateDown = vi.fn()

    renderWithTheme(
      <InteractiveWrapper
        title="Device Details"
        size="md"
        extendedData={mockDeviceData}
        extendedInfoFields={[
          'displayName',
          'userPrincipalName',
          'mdeStatus',
          'riskLevel',
          'nested.osVersion',
        ]}
        canNavigateUp={true}
        canNavigateDown={true}
        onClose={onClose}
        onNavigateUp={onNavigateUp}
        onNavigateDown={onNavigateDown}
        children={(data) => (
          <div data-testid="custom-children">
            <p>Investigate UPN: {data.userPrincipalName} in MDE Portal.</p>
          </div>
        )}
        footer={<button type="button">Force Sync</button>}
      />
    )

    await user.click(screen.getByRole('button', { name: /open offcanvas/i }))

    // MUI Drawer uses portal, query document.body
    const root = within(document.body)

    expect(root.getByText('Device Details')).toBeVisible()
    const customChild = root.getByTestId('custom-children')
    expect(customChild).toHaveTextContent('jdoe@domain.com')
    expect(root.getByRole('button', { name: /force sync/i })).toBeVisible()

    await user.click(root.getByTitle('Previous row'))
    await user.click(root.getByTitle('Next row'))
    expect(onNavigateUp).toHaveBeenCalledTimes(1)
    expect(onNavigateDown).toHaveBeenCalledTimes(1)

    await user.click(root.getByTestId('CloseIcon'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('maps extendedInfoFields to values, dotted paths resolve and missing fields fall back to N/A', () => {
    renderWithTheme(
      <CippOffCanvas
        visible={true}
        title="Device Details"
        extendedData={mockDeviceData}
        extendedInfoFields={['displayName', 'nested.osVersion', 'missingField']}
      />
    )
    const root = within(document.body)
    expect(root.getByText('DESKTOP-ENTRA-01')).toBeInTheDocument()
    // dotted path resolves into the nested object
    expect(root.getByText('Windows 11')).toBeInTheDocument()
    // field absent from extendedData renders the N/A fallback
    expect(root.getByText('N/A')).toBeInTheDocument()
  })
})
