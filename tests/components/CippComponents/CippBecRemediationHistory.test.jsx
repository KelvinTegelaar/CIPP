import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import { CippBecRemediationHistory } from '../../../src/components/CippComponents/CippBecRemediationHistory'

vi.mock('../../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: ({ data }) => <div data-testid="rows">{data.length}</div>,
}))

const entry = (at, actions) => ({
  At: at,
  By: 'tech@msp.com',
  Actions: actions,
  Results: actions.map((a) => ({
    Action: a,
    state: 'success',
    resultText: 'ok',
  })),
})

describe('CippBecRemediationHistory', () => {
  it('renders nothing before anything has run', () => {
    const { container } = renderWithProviders(
      <CippBecRemediationHistory becData={{ Run: { Containment: [] } }} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows a single run as an open accordion with its run count', () => {
    renderWithProviders(
      <CippBecRemediationHistory
        becData={{
          Run: {
            Containment: [entry('2026-09-23T08:53:49Z', ['RevokeSessions'])],
          },
        }}
      />
    )
    expect(screen.getByText('Remediation taken')).toBeInTheDocument()
    expect(screen.getByText('1 run')).toBeInTheDocument()
    expect(screen.getByTestId('rows')).toHaveTextContent('1')
  })

  it('lists several runs newest first', () => {
    renderWithProviders(
      <CippBecRemediationHistory
        becData={{
          Run: {
            Containment: [
              entry('2026-09-23T08:00:00Z', ['RevokeSessions']),
              entry('2026-09-23T09:00:00Z', [
                'RevokeSessions',
                'ClearAutoReply',
              ]),
            ],
          },
        }}
      />
    )
    expect(screen.getByText('2 runs')).toBeInTheDocument()
    const counts = screen.getAllByTestId('rows').map((el) => el.textContent)
    expect(counts).toEqual(['2', '1'])
  })
})
