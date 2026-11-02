import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '../../test-utils'
import { CippListItemCard } from '../../../src/components/CippCards/CippListitemCard'

const sampleItems = [
  { id: '1', message: 'New user created' },
  { id: '2', message: 'License assigned' },
]

describe('CippListItemCard', () => {
  it('renders title, list items, and seeAll link', () => {
    renderWithTheme(
      <CippListItemCard
        title="Notifications"
        listitems={sampleItems}
        textKey="message"
        seeAllLink="/notifications"
        seeAllText="See All Notifications"
      />
    )
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('New user created')).toBeInTheDocument()
    expect(screen.getByText('License assigned')).toBeInTheDocument()
    const seeAll = screen.getByRole('link', { name: /See All Notifications/i })
    expect(seeAll).toHaveAttribute('href', '/notifications')
  })

  it('shows fallback text and hides seeAll button when list is empty', () => {
    renderWithTheme(
      <CippListItemCard
        title="Notifications"
        listitems={[]}
        textKey="message"
        seeAllLink="/notifications"
        seeAllText="See All Notifications"
      />
    )
    expect(screen.getByText("No messages found. You're good to go!")).toBeInTheDocument()
    expect(screen.queryByText('See All Notifications')).not.toBeInTheDocument()
  })
})
