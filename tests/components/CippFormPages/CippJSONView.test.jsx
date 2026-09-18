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
