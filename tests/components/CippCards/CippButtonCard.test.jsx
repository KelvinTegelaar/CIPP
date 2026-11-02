import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../../test-utils'
import CippButtonCard from '../../../src/components/CippCards/CippButtonCard'

describe('CippButtonCard', () => {
  it('renders title and children in card mode', () => {
    renderWithTheme(
      <CippButtonCard title="My Card Title">
        <span>Card child content</span>
      </CippButtonCard>
    )
    expect(screen.getByText('My Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card child content')).toBeInTheDocument()
  })

  it('renders skeleton when isFetching and does not show children text', () => {
    const { container } = renderWithTheme(
      <CippButtonCard title="Loading Card" isFetching={true}>
        <span>Should not be visible</span>
      </CippButtonCard>
    )
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
    expect(screen.queryByText('Should not be visible')).not.toBeInTheDocument()
  })

  it('renders CardButton when provided', () => {
    renderWithTheme(
      <CippButtonCard title="Card with Button" CardButton={<button>Click Me</button>}>
        <span>Some content</span>
      </CippButtonCard>
    )
    expect(screen.getByRole('button', { name: /Click Me/i })).toBeInTheDocument()
  })

  it('renders without title and has no card header', () => {
    renderWithTheme(
      <CippButtonCard>
        <span>No title content</span>
      </CippButtonCard>
    )
    expect(screen.getByText('No title content')).toBeInTheDocument()
    const { container } = renderWithTheme(
      <CippButtonCard>
        <span>Check no header</span>
      </CippButtonCard>
    )
    expect(container.querySelector('.MuiCardHeader-root')).not.toBeInTheDocument()
  })

  it('renders as accordion and toggles expand on click', async () => {
    const user = userEvent.setup()
    const onAccordionChange = vi.fn()

    renderWithTheme(
      <CippButtonCard
        component="accordion"
        title="Accordion Title"
        accordionExpanded={false}
        onAccordionChange={onAccordionChange}
      >
        <span>Accordion content</span>
      </CippButtonCard>
    )

    expect(screen.getByText('Accordion Title')).toBeInTheDocument()

    const summary = screen.getByRole('button', { name: /Accordion Title/i })
    await user.click(summary)

    expect(onAccordionChange).toHaveBeenCalledWith(true)
  })
})
