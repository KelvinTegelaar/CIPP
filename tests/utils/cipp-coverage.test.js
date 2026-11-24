import { describe, it, expect } from 'vitest'
import { classifyRow, tenantWindowGrid, windowColumns } from '../../src/utils/cipp-coverage'

// Push-AuditLogProcessingBatchV2 claims a downloaded window by setting State = 'Processing'
// until AuditLogTenantProcessV2 marks it Processed. a crash in between leaves it there.
const processing = {
  Tenant: 'contoso.onmicrosoft.com',
  Type: 'Window',
  WindowStart: '2026-11-24T10:00:00Z',
  WindowEnd: '2026-11-24T10:30:00Z',
  State: 'Processing',
  Attempts: 0,
}

describe('cipp-coverage classification', () => {
  it('reads a window claimed for processing as in-flight, not processed', () => {
    expect(classifyRow(processing)).toBe('InFlight')
  })

  it('reads a retried window still processing as retrying', () => {
    expect(classifyRow({ ...processing, Attempts: 2 })).toBe('Retrying')
  })

  it('does not paint a processing window green on the heatmap', () => {
    const rows = [processing]
    const [tenant] = tenantWindowGrid(rows, windowColumns(rows))
    expect(tenant.states).toEqual(['InFlight'])
  })
})
