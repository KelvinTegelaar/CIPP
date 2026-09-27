import { useState } from 'react'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import {
  BLOCK_CATEGORIES,
  STRUCTURED_BLOCK_TYPES,
  StructuredBlockCard,
  blockTypesFor,
  createStructuredBlock,
  isStructuredBlock,
} from '../../../src/components/ReportBuilder/ReportBuilderBlocks'

// The structured blocks carry data rather than prose, so their editors are small tables of values.
// What matters is that an edit reaches the parent in the shape the renderer reads, and that the
// list controls cannot leave a block with no rows at all.

// The Infographic card lists the branding gallery's covers; the hook behind it is replaced so the
// tests neither fetch nor depend on a tenant's gallery.
vi.mock('../../../src/components/CippPdf/useBrandingSettings', async (importOriginal) => ({
  ...(await importOriginal()),
  useBrandingSettings: () => ({ coverImages: [{ id: 'img-1', name: 'Board room' }, { id: 'img-2', name: '' }] }),
}))

// A reporting database with one collection, as the builder page hands it to the cards.
const dataShape = [
  {
    type: 'Devices',
    count: 4,
    fields: [
      { name: 'deviceName', type: 'string' },
      { name: 'operatingSystem', type: 'string' },
      { name: 'complianceState', type: 'string' },
    ],
  },
  {
    type: 'SecureScore',
    count: 14,
    fields: [
      { name: 'createdDateTime', type: 'date' },
      { name: 'currentScore', type: 'number' },
    ],
  },
]

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
  it('lists every structured type the builder offers, in picker order', () => {
    expect(STRUCTURED_BLOCK_TYPES.map((t) => t.value)).toEqual([
      'note',
      'richbullets',
      'numbered',
      'paragraphindent',
      'code',
      'infobox',
      'infoboxcolumns',
      'richtable',
      'chart',
      'sankey',
      'scorecard',
      'progress',
      'cover',
      'page',
      'hero',
      'hr',
      'pagebreak',
    ])
  })

  it('offers every block type in exactly one category, the text blocks included', () => {
    const values = BLOCK_CATEGORIES.flatMap((entry) => entry.blocks.map((b) => b.value))
    expect(new Set(values).size).toBe(values.length)
    expect(values).toEqual(expect.arrayContaining(['blank', 'test', 'database']))
    expect(blockTypesFor('layout').map((b) => b.value)).toEqual(['cover', 'page', 'hero', 'hr', 'pagebreak'])
    expect(blockTypesFor(undefined)).toEqual([])
  })

  it('recognises structured types, the callout styles included', () => {
    expect(isStructuredBlock('chart')).toBe(true)
    expect(isStructuredBlock('pagebreak')).toBe(true)
    expect(isStructuredBlock('alertbox')).toBe(true)
    expect(isStructuredBlock('clearbox')).toBe(true)
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

  it('gives a table keyed columns and a row keyed to them', () => {
    const block = createStructuredBlock('richtable', 'b1')
    expect(block.columns.map((c) => c.key)).toEqual(['c1', 'c2'])
    expect(Object.keys(block.rows[0])).toEqual(['c1', 'c2'])
  })

  it('lays a callout grid out two across with a callout to edit', () => {
    const block = createStructuredBlock('infoboxcolumns', 'b1')
    expect(block.columns).toBe(2)
    expect(block.items.length).toBeGreaterThan(0)
  })
})

describe('CoverBlockCard', () => {
  it('starts blank so the report name stays the title until one is typed', () => {
    const block = createStructuredBlock('cover', 'b1')
    expect(block.title).toBe('')
    expect(block.coverAccent).toBe('')
  })

  it('edits the title, accent, subtitle and label', async () => {
    const latest = renderLive(createStructuredBlock('cover', 'b1'))

    await userEvent.type(screen.getByLabelText('Cover title'), 'Quarterly Security')
    await userEvent.type(screen.getByLabelText('Accent'), 'Review')
    await userEvent.type(screen.getByLabelText('Subtitle'), 'Where we stand')
    await userEvent.type(screen.getByLabelText('Label'), 'Security Review')

    expect(latest.current).toMatchObject({
      title: 'Quarterly Security',
      coverAccent: 'Review',
      subtitle: 'Where we stand',
      coverLabel: 'Security Review',
    })
  })
})

describe('CalloutGridBlockCard', () => {
  it('lays the callouts out in the grid the page will use', async () => {
    const latest = renderLive(createStructuredBlock('infoboxcolumns', 'b1'))
    expect(screen.getByTestId('callout-grid').dataset.columns).toBe('2')

    await userEvent.click(screen.getByRole('combobox', { name: 'Layout' }))
    await userEvent.click(within(await screen.findByRole('listbox')).getByText('1 across'))

    expect(latest.current.columns).toBe(1)
    expect(screen.getByTestId('callout-grid').dataset.columns).toBe('1')
  })

  it('adds and removes callouts, keeping at least one', async () => {
    const latest = renderLive(createStructuredBlock('infoboxcolumns', 'b1'))

    await userEvent.click(screen.getByLabelText('Add callout'))
    expect(latest.current.items).toHaveLength(3)

    await userEvent.click(screen.getAllByRole('button', { name: 'Remove callout' })[0])
    await userEvent.click(screen.getAllByRole('button', { name: 'Remove callout' })[0])
    expect(latest.current.items).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Remove callout' })).toBeDisabled()
  })

  it('edits one callout without disturbing the others', async () => {
    const latest = renderLive(createStructuredBlock('infoboxcolumns', 'b1'))

    await userEvent.type(screen.getAllByLabelText('Title')[1], '!')

    expect(latest.current.items[1].title).toBe('Point two!')
    expect(latest.current.items[0].title).toBe('Point one')
  })
})

describe('PageBlockCard', () => {
  it('edits the subtitle that goes in the page header', async () => {
    const latest = renderLive(createStructuredBlock('page', 'b1'))

    await userEvent.type(screen.getByLabelText('Subtitle'), 'Q3')

    expect(latest.current.subtitle).toBe('Q3')
  })
})

describe('NoteBlockCard', () => {
  it('edits the note text', async () => {
    const latest = renderLive({ ...createStructuredBlock('note', 'b1'), content: '' })

    await userEvent.type(screen.getByLabelText('Note'), 'Figures as of Monday.')

    expect(latest.current.content).toBe('Figures as of Monday.')
  })
})

describe('BulletsBlockCard', () => {
  it('edits a bullet without disturbing its lead', async () => {
    const latest = renderLive(createStructuredBlock('richbullets', 'b1'))

    await userEvent.type(screen.getByLabelText('Text'), ' Really.')

    expect(latest.current.items[0].text).toBe('What it means for the organisation. Really.')
    expect(latest.current.items[0].label).toBe('First point.')
  })
})

describe('CalloutBlockCard', () => {
  it('switches the block type with the style, so the renderer draws the right box', async () => {
    const latest = renderLive(createStructuredBlock('infobox', 'b1'))

    await userEvent.click(screen.getByRole('combobox', { name: 'Style' }))
    await userEvent.click(within(await screen.findByRole('listbox')).getByText('Warning'))

    expect(latest.current.type).toBe('alertbox')
  })

  it('keeps the title and text when the style changes', async () => {
    const latest = renderLive({ ...createStructuredBlock('clearbox', 'b1'), title: 'All good', content: 'Nothing to do.' })

    await userEvent.click(screen.getByRole('combobox', { name: 'Style' }))
    await userEvent.click(within(await screen.findByRole('listbox')).getByText('Info'))

    expect(latest.current).toMatchObject({ type: 'infobox', title: 'All good', content: 'Nothing to do.' })
  })
})

describe('TableBlockCard', () => {
  it('gives a new column the next free key', async () => {
    const latest = renderLive(createStructuredBlock('richtable', 'b1'))

    await userEvent.click(screen.getByLabelText('Add column'))

    expect(latest.current.columns.map((c) => c.key)).toEqual(['c1', 'c2', 'c3'])
  })

  it('takes a removed column\'s cells with it', async () => {
    const latest = renderLive({
      ...createStructuredBlock('richtable', 'b1'),
      rows: [{ c1: 'a', c2: 'b' }],
    })

    // the columns editor renders first, so its remove buttons come first
    await userEvent.click(screen.getAllByRole('button', { name: 'Remove row' })[0])

    expect(latest.current.columns.map((c) => c.key)).toEqual(['c2'])
    expect(latest.current.rows).toEqual([{ c2: 'b' }])
  })

  it('fills the rows from a collection and offers its fields on each column', async () => {
    const latest = renderLive(createStructuredBlock('richtable', 'b1'), { dataShape })
    expect(screen.getByLabelText('Add row')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Reporting database' }))
    expect(screen.queryByLabelText('Add row')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('combobox', { name: 'Collection' }))
    await userEvent.click(within(await screen.findByRole('listbox')).getByText('Devices (4)'))
    expect(latest.current.dataSource).toEqual({ type: 'Devices', field: null, valueField: null, aggregate: null, filter: null })

    const fieldInput = screen.getAllByLabelText('Field')[0]
    const list = document.getElementById(fieldInput.getAttribute('list'))
    expect(Array.from(list.options).map((o) => o.value)).toEqual(['deviceName', 'operatingSystem', 'complianceState'])

    await userEvent.type(fieldInput, 'deviceName')
    expect(latest.current.columns[0]).toMatchObject({ key: 'c1', field: 'deviceName' })
  })

  it('labels the row fields after the column headers', () => {
    renderLive(createStructuredBlock('richtable', 'b1'))

    expect(screen.getByLabelText('Item')).toBeInTheDocument()
    expect(screen.getByLabelText('Value')).toBeInTheDocument()
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

  it('switches to the reporting database, then picks a collection and the field to count by', async () => {
    const latest = renderLive(createStructuredBlock('chart', 'b1'), { dataShape })
    expect(screen.getByLabelText('Add data point')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Reporting database' }))
    expect(latest.current.chartSource).toEqual({ type: null, field: null, valueField: null, aggregate: null, filter: null })
    expect(screen.queryByLabelText('Add data point')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('combobox', { name: 'Collection' }))
    await userEvent.click(within(await screen.findByRole('listbox')).getByText('Devices (4)'))
    expect(latest.current.chartSource).toEqual({ type: 'Devices', field: null, valueField: null, aggregate: null, filter: null })

    await userEvent.click(screen.getByRole('combobox', { name: 'Per' }))
    await userEvent.click(within(await screen.findByRole('listbox')).getByText('operatingSystem (string)'))
    expect(latest.current.chartSource).toMatchObject({ type: 'Devices', field: 'operatingSystem', valueField: null })
  })

  it('plots a field\'s value per date field, the way a Secure Score trend is built', async () => {
    const latest = renderLive(
      { ...createStructuredBlock('chart', 'b1'), chartKind: 'trend', chartSource: { type: 'SecureScore', field: null, valueField: null, aggregate: null, filter: null } },
      { dataShape }
    )

    await userEvent.click(screen.getByRole('combobox', { name: 'Show' }))
    await userEvent.click(within(await screen.findByRole('listbox')).getByText('currentScore (number)'))
    await userEvent.click(screen.getByRole('combobox', { name: 'Per' }))
    await userEvent.click(within(await screen.findByRole('listbox')).getByText('createdDateTime (date)'))

    expect(latest.current.chartSource).toMatchObject({ type: 'SecureScore', field: 'createdDateTime', valueField: 'currentScore', aggregate: null })
    expect(screen.getByRole('combobox', { name: 'Rows sharing a label' })).toBeInTheDocument()
  })

  it('shows the picker, not the typed points, while the source is the reporting database', () => {
    renderLive(
      { ...createStructuredBlock('chart', 'b1'), chartSource: { type: 'Devices', field: null, valueField: null, aggregate: null, filter: null } },
      { dataShape }
    )

    expect(screen.queryByLabelText('Add data point')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Collection' })).toBeInTheDocument()
  })

  it('adds a condition the rows must meet', async () => {
    const latest = renderLive(
      { ...createStructuredBlock('chart', 'b1'), chartSource: { type: 'Devices', field: 'operatingSystem', valueField: null, aggregate: null, filter: null } },
      { dataShape }
    )

    await userEvent.click(screen.getByRole('combobox', { name: 'Only rows where' }))
    await userEvent.click(within(await screen.findByRole('listbox')).getByText('complianceState (string)'))
    // the chart's own data points have a Value column too; the condition's field renders last
    await userEvent.type(screen.getAllByLabelText('Value').at(-1), 'compliant')

    expect(latest.current.chartSource.filter).toEqual({ field: 'complianceState', op: '=', value: 'compliant' })
  })

  it('switching back to Manual drops the source and shows the typed points again', async () => {
    const latest = renderLive(
      { ...createStructuredBlock('chart', 'b1'), chartSource: { type: 'Devices', field: 'operatingSystem', valueField: null, aggregate: null, filter: null } },
      { dataShape }
    )

    await userEvent.click(screen.getByRole('button', { name: 'Manual' }))

    expect(latest.current.chartSource).toBeNull()
    expect(screen.getByLabelText('Add data point')).toBeInTheDocument()
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

  it('offers the uploaded covers by the names given in the branding gallery', async () => {
    const latest = renderLive(createStructuredBlock('hero', 'b1'))

    await userEvent.click(screen.getByRole('combobox', { name: 'Background' }))
    const listbox = within(await screen.findByRole('listbox'))
    expect(listbox.getByText('Uploaded: cover 2')).toBeInTheDocument()
    await userEvent.click(listbox.getByText('Uploaded: Board room'))

    expect(latest.current.heroImage).toBe('gallery:img-1')
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
