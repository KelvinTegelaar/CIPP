import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithProviders, settingsWith } from '../test-utils'
import { useIsMobileLayout, useTableViewMode } from '../../src/hooks/use-breakpoint'

// jsdom has no width-based matchMedia, so useIsMobileLayout is always false here —
// which is exactly why the explicit settings/prop path must exist and is what we test.
const Probe = (props) => <div data-testid="mode">{useTableViewMode(props)}</div>

const renderMode = (props, settings) =>
  renderWithProviders(<Probe {...props} />, settings ? { settings: settingsWith(settings) } : undefined)

describe('useTableViewMode', () => {
  it("defaults to 'table' on desktop-width (auto + not mobile)", () => {
    renderMode()
    expect(screen.getByTestId('mode')).toHaveTextContent('table')
  })

  it('settings.tableViewMode=cards forces cards', () => {
    renderMode({}, { tableViewMode: 'cards' })
    expect(screen.getByTestId('mode')).toHaveTextContent('cards')
  })

  it('accepts {value,label} shaped settings', () => {
    renderMode({}, { tableViewMode: { value: 'cards', label: 'Card list' } })
    expect(screen.getByTestId('mode')).toHaveTextContent('cards')
  })

  it('per-call viewMode prop beats settings', () => {
    renderMode({ viewMode: 'table' }, { tableViewMode: 'cards' })
    expect(screen.getByTestId('mode')).toHaveTextContent('table')
  })

  it('simple always forces table, even against explicit cards', () => {
    renderMode({ viewMode: 'cards', simple: true }, { tableViewMode: 'cards' })
    expect(screen.getByTestId('mode')).toHaveTextContent('table')
  })

  it('invalid mode values fall back to auto behavior', () => {
    renderMode({}, { tableViewMode: 'bogus' })
    expect(screen.getByTestId('mode')).toHaveTextContent('table')
  })
})

// Width-aware stub so the two thresholds can be told apart. MUI asks in '@media (max-width:Npx)'
// form; anything it doesn't ask about is left unmatched.
const atWidth = (width) => {
  const cache = new Map()
  window.matchMedia = (query) => {
    if (!cache.has(query)) {
      const max = /max-width:\s*([\d.]+)px/.exec(query)
      const min = /min-width:\s*([\d.]+)px/.exec(query)
      cache.set(query, {
        matches: (!max || width <= parseFloat(max[1])) && (!min || width >= parseFloat(min[1])),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })
    }
    return cache.get(query)
  }
}

afterEach(() => {
  delete window.matchMedia
})

const SplitProbe = () => (
  <>
    <div data-testid="chrome">{String(useIsMobileLayout())}</div>
    <div data-testid="mode">{useTableViewMode()}</div>
  </>
)

// The two thresholds are deliberately different. One query for both breaks an end either way:
// at md the 900-1200 band loses the side nav with no hamburger to open the drawer, at lg
// desktop-width tables become card lists.
describe('the chrome/table split', () => {
  it('treats the 900-1200 band as mobile chrome but keeps tables tabular', () => {
    atWidth(1000)
    renderWithProviders(<SplitProbe />)

    expect(screen.getByTestId('chrome')).toHaveTextContent('true')
    expect(screen.getByTestId('mode')).toHaveTextContent('table')
  })

  it('moves both to mobile on a phone', () => {
    atWidth(800)
    renderWithProviders(<SplitProbe />)

    expect(screen.getByTestId('chrome')).toHaveTextContent('true')
    expect(screen.getByTestId('mode')).toHaveTextContent('cards')
  })

  it('leaves both on desktop above lg', () => {
    atWidth(1300)
    renderWithProviders(<SplitProbe />)

    expect(screen.getByTestId('chrome')).toHaveTextContent('false')
    expect(screen.getByTestId('mode')).toHaveTextContent('table')
  })
})
