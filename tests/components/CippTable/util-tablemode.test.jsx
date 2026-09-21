import { utilTableMode } from '../../../src/components/CippTable/util-tablemode'

const defaultSettings = { tablePageSize: { value: 25 } }

describe('utilTableMode', () => {
  it('simple mode disables selection and row actions', () => {
    const result = utilTableMode({}, true, null, [], false, null, '380px', defaultSettings)
    expect(result.enableRowSelection).toBe(false)
    expect(result.enableRowActions).toBe(false)
  })

  it('full mode enables selection when onChange is provided', () => {
    const result = utilTableMode({}, false, null, [], false, () => {}, '380px', defaultSettings)
    expect(result.enableRowSelection).toBe(true)
  })

  it('full mode enables selection when actions are provided', () => {
    const actions = [{ label: 'Edit', customFunction: () => {} }]
    const result = utilTableMode({}, false, actions, [], false, null, '380px', defaultSettings)
    expect(result.enableRowSelection).toBe(true)
  })

  it('full mode enables selection when export is available even without actions or onChange', () => {
    const result = utilTableMode({}, false, null, [], false, null, '380px', defaultSettings)
    expect(result.enableRowSelection).toBe(true)
  })

  it('full mode disables selection when no actions, onChange, or export', () => {
    const result = utilTableMode({}, false, null, [], false, null, '380px', defaultSettings, 'table', false, false)
    expect(result.enableRowSelection).toBe(false)
  })

  it('enables row actions when actions are provided', () => {
    const actions = [{ label: 'Edit', customFunction: () => {} }]
    const result = utilTableMode({}, false, actions, [], false, null, '380px', defaultSettings)
    expect(result.enableRowActions).toBe(true)
  })

  it('disables row actions when no actions or offCanvas', () => {
    const result = utilTableMode({}, false, null, [], false, null, '380px', defaultSettings)
    expect(result.enableRowActions).toBe(false)
  })

  it('returns pagination config', () => {
    const result = utilTableMode({}, false, null, [], false, null, '380px', defaultSettings)
    expect(result.muiPaginationProps).toBeDefined()
    expect(result.muiPaginationProps.rowsPerPageOptions).toBeDefined()
  })

  it('narrow table slims the footer so it cannot wrap below MRT 720px pivot', () => {
    const result = utilTableMode({}, false, null, [], false, null, '380px', defaultSettings, 'table', true)
    expect(result.muiPaginationProps.showRowsPerPage).toBe(false)
    expect(result.muiPaginationProps.showFirstButton).toBe(false)
    expect(result.muiPaginationProps.showLastButton).toBe(false)
  })

  it('narrow table page-scrolls instead of keeping an inner scroll viewport', () => {
    const result = utilTableMode({}, false, null, [], false, null, '380px', defaultSettings, 'table', true)
    expect(result.muiTableContainerProps.sx.maxHeight).toBe('none')
  })

  it('wide table keeps the full footer and the viewport-budget maxHeight', () => {
    const result = utilTableMode({}, false, null, [], false, null, '380px', defaultSettings, 'table', false)
    expect(result.muiPaginationProps.showRowsPerPage).toBeUndefined()
    expect(result.muiPaginationProps.showFirstButton).toBeUndefined()
    expect(result.muiPaginationProps.showLastButton).toBeUndefined()
    expect(result.muiTableContainerProps.sx.maxHeight).toBe('calc(100vh - 380px)')
  })

  it('returns table container height config', () => {
    const result = utilTableMode({}, false, null, [], false, null, '500px', defaultSettings)
    expect(result.muiTableContainerProps).toBeDefined()
  })

  it('parses string tablePageSize setting to a number', () => {
    const settings = { tablePageSize: { value: '50' } }
    const simple = utilTableMode({}, true, null, [], false, null, '380px', settings)
    expect(simple.initialState.pagination.pageSize).toBe(50)
    const full = utilTableMode({}, false, null, [], false, null, '380px', settings)
    expect(full.initialState.pagination.pageSize).toBe(50)
  })

  it('defaults pageSize to 25 without a tablePageSize setting', () => {
    const simple = utilTableMode({}, true, null, [], false, null, '380px')
    expect(simple.initialState.pagination.pageSize).toBe(25)
    const full = utilTableMode({}, false, null, [], false, null, '380px')
    expect(full.initialState.pagination.pageSize).toBe(25)
  })
})
