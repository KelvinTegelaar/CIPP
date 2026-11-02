import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../../test-utils'
import { CippImageCard } from '../../../src/components/CippCards/CippImageCard'

describe('CippImageCard', () => {
  it('renders title, text, and link', () => {
    renderWithTheme(
      <CippImageCard
        title="Reports Illustration"
        text="This is a card showing reports and analytics."
        imageUrl="/assets/illustrations/undraw_lost_re_xqjt.svg"
        linkText="View Reports"
        link="/reports"
      />
    )
    expect(screen.getByText('Reports Illustration')).toBeInTheDocument()
    expect(screen.getByText('This is a card showing reports and analytics.')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /View Reports/i })
    expect(link).toHaveAttribute('href', '/reports')
  })

  it('renders step progress indicator', () => {
    renderWithTheme(
      <CippImageCard
        title="Onboarding Step"
        text="Please complete your company profile."
        imageUrl="/assets/illustrations/undraw_website_ij0l.svg"
        step={2}
        maxstep={5}
        linkText="Continue"
        link="/onboarding"
      />
    )
    expect(screen.getByText('2/5')).toBeInTheDocument()
    // 2/5 -> 40
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40')
  })

  it('calls onButtonClick when custom button is clicked', async () => {
    const user = userEvent.setup()
    const onButtonClick = vi.fn()
    renderWithTheme(
      <CippImageCard
        title="Action Card"
        text="This card triggers a custom action."
        imageUrl="/assets/illustrations/undraw_website_ij0l.svg"
        linkText="Click Me"
        onButtonClick={onButtonClick}
      />
    )
    await user.click(screen.getByRole('button', { name: /Click Me/i }))
    expect(onButtonClick).toHaveBeenCalledTimes(1)
  })

  it('renders skeleton when loading', () => {
    const { container } = renderWithTheme(
      <CippImageCard
        title="Loading Reports"
        isFetching={true}
        imageUrl="/assets/illustrations/undraw_website_ij0l.svg"
      />
    )
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
  })
})
