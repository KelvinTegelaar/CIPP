import { render, screen } from '@testing-library/react'
import { TutorialProvider, useTutorials } from '../../src/contexts/tutorial-context'

// TutorialProvider loads its tours through webpack's require.context, which vite has no
// equivalent for. tests/mocks/require-context.js maps it onto import.meta.glob, so this
// render is what proves the polyfill actually reaches a src module.
const TutorialProbe = () => {
  const { tutorials, getTutorialsForPage } = useTutorials()
  return (
    <>
      <div data-testid="ids">{tutorials.map((t) => t.id).join(',')}</div>
      <div data-testid="home">{getTutorialsForPage('/').map((t) => t.id).join(',')}</div>
    </>
  )
}

describe('TutorialProvider', () => {
  it('loads the tutorial json off require.context', () => {
    render(
      <TutorialProvider>
        <TutorialProbe />
      </TutorialProvider>
    )

    const ids = screen.getByTestId('ids').textContent.split(',')
    expect(ids).toEqual(
      expect.arrayContaining(['getting-started', 'dashboard-overview', 'tenant-management'])
    )
  })

  it('scopes tutorials to the page they declare', () => {
    render(
      <TutorialProvider>
        <TutorialProbe />
      </TutorialProvider>
    )

    // getting-started declares pages: ['/'], the other two declare other routes
    expect(screen.getByTestId('home').textContent).toBe('getting-started')
  })
})
