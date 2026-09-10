import { useState } from 'react'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import {
  STRUCTURED_BLOCK_TYPES,
  StructuredBlockCard,
  createStructuredBlock,
  isStructuredBlock,
} from '../../../src/components/ReportBuilder/ReportBuilderBlocks'

// The structured blocks carry data rather than prose, so their editors are small tables of values.
// What matters is that an edit reaches the parent in the shape the renderer reads, and that the
// list controls cannot leave a block with no rows at all.

const shell = (overrides = {}) => ({
  index: 0,
  totalBlocks: 3,
  onRemove: vi.fn(),
  onUpdate: vi.fn(),
  onMoveUp: vi.fn(),
  onMoveDown: vi.fn(),
  ...overrides,
})

/**
 * The editors are controlled: they render the block they are given and report edits upward. A test
 * that passes a bare mock for onUpdate never feeds the edit back, so the field keeps showing its
 * original value and each keystroke overwrites the last. This harness closes the loop the way the
 * builder page does, and exposes the latest block for assertions.
 */
const Harness = ({ initial, onChange, ...props }) => {
  const [block, setBlock] = useState(initial)
  return (
    <StructuredBlockCard
      block={block}
      {...props}
      onUpdate={(index, next) => {
        setBlock(next)
        onChange?.(next)
      }}
    />
  )
}

const renderLive = (initial, props = {}) => {
  const latest = { current: initial }
  renderWithProviders(
    <Harness
      initial={initial}
      onChange={(next) => {
        latest.current = next
      }}
      {...shell(props)}
    />
  )
  return latest
}

describe('block type registry', () => {
  it('lists every structured type the builder offers', () => {
    expect(STRUCTURED_BLOCK_TYPES.map((t) => t.value)).toEqual([
      'chart',
      'scorecard',
      'progress',
      'hero',
      'pagebreak',
    ])
  })

  it('recognises structured types', () => {
    expect(isStructuredBlock('chart')).toBe(true)
    expect(isStructuredBlock('pagebreak')).toBe(true)
  })

  it('leaves the text block types to the page that owns their editors', () => {
    expect(isStructuredBlock('blank')).toBe(false)
    expect(isStructuredBlock('test')).toBe(false)
    expect(isStructuredBlock('database')).toBe(false)
    expect(isStructuredBlock(undefined)).toBe(false)
  })
})

describe('createStructuredBlock', () => {
  it('gives a chart something to render straight away', () => {
    const block = createStructuredBlock('chart', 'b1')
    expect(block.chartKind).toBe('donut')
    expect(block.chartData.length).toBeGreaterThan(0)
  })

  it('gives a scorecard starter cards', () => {
    expect(createStructuredBlock('scorecard', 'b1').stats.length).toBeGreaterThan(0)
  })

  it('gives a progress block a bar with a sane maximum', () => {
    const block = createStructuredBlock('progress', 'b1')
    expect(block.items[0].max).toBe(100)
  })

  it('gives a hero block a background so the page is not plain black', () => {
    expect(createStructuredBlock('hero', 'b1').heroImage).toBeTruthy()
  })

  it('marks every structured block static, since none is re-fetched', () => {
    for (const { value } of STRUCTURED_BLOCK_TYPES) {
      expect(createStructuredBlock(value, 'b1').static).toBe(true)
    }
  })

  it('carries the id it was given', () => {
    expect(createStructuredBlock('chart', 'block-123').id).toBe('block-123')
  })
})

describe('ChartBlockCard', () => {
  it('sends a title change up to the parent', async () => {
    const latest = renderLive(createStructuredBlock('chart', 'b1'))

    await userEvent.type(screen.getByLabelText('Block title'), ' of doom')

    expect(latest.current.title).toBe('Chart of doom')
  })

  it('changes the chart kind', async () => {
    const latest = renderLive(createStructuredBlock('chart', 'b1'))

    await userEvent.click(screen.getByRole('combobox', { name: 'Chart type' }))
    await userEvent.click(within(await screen.findByRole('listbox')).getByText('Bar'))

    expect(latest.current.chartKind).toBe('bar')
  })

  it('offers a centre label for a donut, and not an axis maximum', () => {
    renderLive(createStructuredBlock('chart', 'b1'))

    expect(screen.getByLabelText('Centre label')).toBeInTheDocument()
    expect(screen.queryByLabelText('Axis maximum')).not.toBeInTheDocument()
  })

  it('offers an axis maximum for a trend, and not a centre label', () => {
    // Rendered fresh rather than re-rendered: RTL's rerender drops the provider wrapper these
    // components need.
    renderLive({ ...createStructuredBlock('chart', 'b1'), chartKind: 'trend' })

    expect(screen.queryByLabelText('Centre label')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Axis maximum')).toBeInTheDocument()
  })

  it('adds a data point', async () => {
    const block = createStructuredBlock('chart', 'b1')
    const latest = renderLive(block)

    await userEvent.click(screen.getByLabelText('Add data point'))

    expect(latest.current.chartData).toHaveLength(block.chartData.length + 1)
  })

  it('removes a data point', async () => {
    const block = createStructuredBlock('chart', 'b1')
    const latest = renderLive(block)

    await userEvent.click(screen.getAllByRole('button', { name: 'Remove row' })[0])

    expect(latest.current.chartData).toHaveLength(block.chartData.length - 1)
  })

  it('will not let the last row be removed, leaving a chart with nothing to draw', () => {
    const block = { ...createStructuredBlock('chart', 'b1'), chartData: [{ label: 'A', value: 1 }] }
    renderLive(block)

    expect(screen.getByRole('button', { name: 'Remove row' })).toBeDisabled()
  })
})

describe('ScorecardBlockCard', () => {
  it('edits a card value', async () => {
    const latest = renderLive(createStructuredBlock('scorecard', 'b1'))
    const field = screen.getAllByLabelText('Figure')[0]

    await userEvent.clear(field)
    await userEvent.type(field, '128')

    expect(latest.current.stats[0].value).toBe('128')
  })

  it('edits a card label without disturbing the others', async () => {
    const latest = renderLive(createStructuredBlock('scorecard', 'b1'))
    const field = screen.getAllByLabelText('Label')[0]

    await userEvent.clear(field)
    await userEvent.type(field, 'Licensed users')

    expect(latest.current.stats[0].label).toBe('Licensed users')
    expect(latest.current.stats[1].label).toBe('Devices')
  })

  it('warns once a row holds more cards than will read at PDF width', () => {
    renderLive({
      ...createStructuredBlock('scorecard', 'b1'),
      stats: Array.from({ length: 5 }, (_, i) => ({ label: `S${i}`, value: `${i}` })),
    })

    expect(screen.getByText(/too narrow to read/i)).toBeInTheDocument()
  })

  it('does not warn at four cards', () => {
    renderLive({
      ...createStructuredBlock('scorecard', 'b1'),
      stats: Array.from({ length: 4 }, (_, i) => ({ label: `S${i}`, value: `${i}` })),
    })

    expect(screen.queryByText(/too narrow to read/i)).not.toBeInTheDocument()
  })
})

describe('ProgressBlockCard', () => {
  it('edits a bar value', async () => {
    const latest = renderLive(createStructuredBlock('progress', 'b1'))
    const field = screen.getByLabelText('Value')

    await userEvent.clear(field)
    await userEvent.type(field, '92')

    expect(latest.current.items[0].value).toBe('92')
  })

  it('edits the maximum a bar is measured against', async () => {
    const latest = renderLive(createStructuredBlock('progress', 'b1'))
    const field = screen.getByLabelText('Out of')

    await userEvent.clear(field)
    await userEvent.type(field, '250')

    expect(latest.current.items[0].max).toBe('250')
  })
})

describe('HeroBlockCard', () => {
  it('edits the big figure', async () => {
    const latest = renderLive(createStructuredBlock('hero', 'b1'))

    await userEvent.type(screen.getByLabelText('Big figure'), '83%')

    expect(latest.current.heroHighlight).toBe('83%')
  })

  it('edits the supporting text', async () => {
    const latest = renderLive(createStructuredBlock('hero', 'b1'))

    await userEvent.type(screen.getByLabelText('Supporting text'), 'of orgs were breached')

    expect(latest.current.heroSubText).toBe('of orgs were breached')
  })

  it('clears the background when "No cover image" is chosen', async () => {
    const latest = renderLive(createStructuredBlock('hero', 'b1'))

    await userEvent.click(screen.getByRole('combobox', { name: 'Background' }))
    await userEvent.click(within(await screen.findByRole('listbox')).getByText('No cover image'))

    expect(latest.current.heroImage).toBe('')
  })

  it('says the block takes a whole page, which is not obvious from the editor', () => {
    renderLive(createStructuredBlock('hero', 'b1'))
    expect(screen.getByText(/full page of its own/i)).toBeInTheDocument()
  })
})

describe('PageBreakBlockCard', () => {
  it('explains what it does, having nothing to edit', () => {
    renderLive(createStructuredBlock('pagebreak', 'b1'))
    expect(screen.getByText(/starts on a new page/i)).toBeInTheDocument()
  })
})

describe('block controls', () => {
  it('disables move-up on the first block', () => {
    renderLive(createStructuredBlock('chart', 'b1'), { index: 0 })
    expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled()
  })

  it('disables move-down on the last block', () => {
    renderLive(createStructuredBlock('chart', 'b1'), { index: 2, totalBlocks: 3 })
    expect(screen.getByRole('button', { name: 'Move down' })).toBeDisabled()
  })

  it('enables both in the middle of the list', () => {
    renderLive(createStructuredBlock('chart', 'b1'), { index: 1, totalBlocks: 3 })
    expect(screen.getByRole('button', { name: 'Move up' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Move down' })).toBeEnabled()
  })

  it('removes the block by index', async () => {
    const props = shell({ index: 1 })
    renderWithProviders(<StructuredBlockCard block={createStructuredBlock('chart', 'b1')} {...props} />)

    await userEvent.click(screen.getByRole('button', { name: 'Remove block' }))

    expect(props.onRemove).toHaveBeenCalledWith(1)
  })

  it('moves the block by index', async () => {
    const props = shell({ index: 1 })
    renderWithProviders(<StructuredBlockCard block={createStructuredBlock('chart', 'b1')} {...props} />)

    await userEvent.click(screen.getByRole('button', { name: 'Move up' }))

    expect(props.onMoveUp).toHaveBeenCalledWith(1)
  })

  it('returns nothing for a block type it does not own', () => {
    const { container } = renderWithProviders(
      <StructuredBlockCard block={{ type: 'blank' }} {...shell()} />
    )
    expect(container).toBeEmptyDOMElement()
  })
})
