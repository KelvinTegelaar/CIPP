import { describe, expect, it } from 'vitest'
import { fromCraftRun } from '../../src/utils/craft-run'

// What Craft pushes for a 16-tenant fan-out with one failure (QueueStatusBridge.GetRun); the backend test
// ConvertFrom-CIPPCraftRunStatus.Tests.ps1 maps the same status, so both must give the same entry.
const run = {
  runName: 'GraphRequestOrchestrator-f761aa95-044c-4b22-8cb4-fb7938aceb95',
  reference: 'AllTenants-725f6f8c',
  label: 'Users (All Tenants)',
  link: '/identity/administration/users',
  status: 'CompletedWithErrors',
  total: 16,
  queued: 0,
  running: 0,
  completed: 15,
  failed: 1,
  startedUtc: '2026-10-07T18:16:54.1065695Z',
  tasks: [
    {
      name: 'ListGraphRequestQueue_test02.onmicrosoft.com',
      status: 'Completed',
      at: '2026-10-07T18:17:24Z',
    },
    {
      name: 'ListGraphRequestQueue_test01.onmicrosoft.com',
      status: 'Failed',
      at: '2026-10-07T18:17:00Z',
    },
  ],
}

describe('fromCraftRun', () => {
  it('gives the CippQueue entry ListCippQueue returns for the same run', () => {
    expect(fromCraftRun(run)).toMatchObject({
      PartitionKey: 'CippQueue',
      RowKey: run.runName,
      Name: 'Users (All Tenants)',
      Link: '/identity/administration/users',
      TotalTasks: 16,
      CompletedTasks: 16,
      FailedTasks: 1,
      PercentComplete: 100,
      PercentFailed: 6.3,
      Status: 'Completed (with errors)',
    })
  })

  it('shows each task by its tenant, not its Function_Tenant job name', () => {
    expect(fromCraftRun(run).Tasks.map((t) => [t.Name, t.Status])).toEqual([
      ['test02.onmicrosoft.com', 'Completed'],
      ['test01.onmicrosoft.com', 'Failed'],
    ])
  })

  it('turns a status-only end into just a status, so the counts already shown survive', () => {
    expect(fromCraftRun({ status: 'NotFound' })).toEqual({
      Status: 'Not found',
    })
  })
})
