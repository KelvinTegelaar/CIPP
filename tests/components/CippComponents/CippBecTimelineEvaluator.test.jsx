import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippBecTimelineEvaluator } from '../../../src/components/CippComponents/CippBecTimelineEvaluator'

vi.mock('../../../src/components/CippComponents/CippBecTimelineCustom', () => ({
  CippBecTimelineCustom: () => <div data-testid="timeline" />,
}))
vi.mock(
  '../../../src/components/CippComponents/CippBecCorrelationGraph',
  () => ({
    CippBecCorrelationGraph: ({ fill }) => (
      <div data-testid="graph" data-fill={String(fill)} />
    ),
  })
)

describe('CippBecTimelineEvaluator', () => {
  it('opens the selected view full screen, with the graph filling the dialog, and closes again', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippBecTimelineEvaluator becData={{}} />)
    expect(screen.getByTestId('timeline')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /correlation graph/i }))
    expect(screen.getByTestId('graph')).toHaveAttribute('data-fill', 'false')

    await user.click(screen.getByRole('button', { name: /full screen/i }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Attack timeline')
    // only the dialog copy is mounted while full screen, and it fills the space
    expect(screen.getAllByTestId('graph')).toHaveLength(1)
    expect(screen.getByTestId('graph')).toHaveAttribute('data-fill', 'true')

    await user.click(screen.getByRole('button', { name: /close full screen/i }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    expect(screen.getByTestId('graph')).toHaveAttribute('data-fill', 'false')
  }, 30000)
})
