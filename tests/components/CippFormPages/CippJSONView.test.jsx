import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())

import CippJsonView from '../../../src/components/CippFormPages/CippJSONView'

describe('CippJsonView drilldown', () => {
  it('lists flat records (no key/value fields) as an indexed pane instead of collapsing to nothing', () => {
    // Shape of the teamsvoice / intuneconfig backup arrays: every value primitive, no key/name/displayName
    const object = {
      teamsvoice: [
        { telephoneNumber: '+4512345678', assignmentTargetId: 'a' },
        { telephoneNumber: '+4587654321', assignmentTargetId: 'b' },
      ],
    }
    renderWithProviders(<CippJsonView object={object} defaultOpen />)

    fireEvent.click(screen.getByRole('button', { name: '2 items' }))

    expect(screen.getAllByRole('button', { name: 'View Details' })).toHaveLength(2)
  })

  it('still flattens genuine key/value pair arrays into one pane', () => {
    // not `settings`: that key flips the component into its Intune policy renderer
    const object = { properties: [{ key: 'Color', value: 'Blue' }] }
    renderWithProviders(<CippJsonView object={object} defaultOpen />)

    fireEvent.click(screen.getByRole('button', { name: '1 item' }))

    expect(screen.getByText('Color')).toBeInTheDocument()
    expect(screen.getByText('Blue')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View Details' })).toBeNull()
  })
})

describe('CippJsonView administrative template settings', () => {
  it('labels settings and presentations from the identity captured in the template when the tenant cannot resolve the ids', () => {
    // Imported ADMX definitions are minted with a new id in every tenant, so the definition lookup
    // for the viewed tenant returns nothing for a template captured elsewhere.
    const object = {
      added: [
        {
          'definition@odata.bind':
            "https://graph.microsoft.com/beta/deviceManagement/groupPolicyDefinitions('f65370a6-bc40-40af-b0f3-b6f5481478c0')",
          enabled: true,
          definition: {
            id: 'f65370a6-bc40-40af-b0f3-b6f5481478c0',
            displayName: 'SPNEGO',
            categoryPath: '\Mozilla\Firefox\Authentication',
            classType: 'machine',
          },
          presentationValues: [
            {
              '@odata.type': '#microsoft.graph.groupPolicyPresentationValueList',
              'presentation@odata.bind':
                "https://graph.microsoft.com/beta/deviceManagement/groupPolicyDefinitions('f65370a6-bc40-40af-b0f3-b6f5481478c0')/presentations('a73dada5-9cfc-44e7-b560-ebc1e1a1f1a9')",
              values: [{ name: 'https://intranet.example' }],
              presentation: {
                id: 'a73dada5-9cfc-44e7-b560-ebc1e1a1f1a9',
                label: 'Servers',
                '@odata.type': '#microsoft.graph.groupPolicyPresentationListBox',
                index: 0,
              },
            },
          ],
        },
      ],
    }
    renderWithProviders(<CippJsonView object={object} defaultOpen type="intune" />)

    expect(screen.getByText('SPNEGO')).toBeInTheDocument()
    expect(screen.getByText('\Mozilla\Firefox\Authentication')).toBeInTheDocument()
    expect(screen.getByText('Servers:')).toBeInTheDocument()
    expect(screen.queryByText(/f65370a6-bc40-40af-b0f3-b6f5481478c0/)).toBeNull()
  })
})
