import { describe, it, expect } from 'vitest'
import {
  computeCanSaveToGitHub,
  buildSyncedTemplateFields,
  buildStandardsTemplatePayload,
} from '../../../src/components/CippStandards/CippStandardsSideBar'

const writableRepos = [{ FullName: 'Org/repo-a' }, { FullName: 'Org/repo-b' }]

describe('CippStandardsSideBar GitHub save gating', () => {
  it('shows the option when the template source is a writable repo', () => {
    expect(computeCanSaveToGitHub('Org/repo-a', writableRepos)).toBe(true)
  })

  it('hides the option when the source is not in the writable repo list', () => {
    expect(computeCanSaveToGitHub('Org/not-writable', writableRepos)).toBe(false)
  })

  it('hides the option when the template has no source', () => {
    expect(computeCanSaveToGitHub(null, writableRepos)).toBe(false)
    expect(computeCanSaveToGitHub(undefined, writableRepos)).toBe(false)
  })
})

describe('CippStandardsSideBar GitHub save payload', () => {
  const row = {
    tenantFilter: ['AllTenants'],
    excludedTenants: [],
    description: 'desc',
    templateName: 'My Template',
    standards: { AuditLog: { action: ['Report'] } },
    GUID: 'guid-1',
    runManually: false,
    isDriftTemplate: false,
  }

  it('adds a GitHub block with the template source when the switch is on', () => {
    const payload = buildStandardsTemplatePayload({
      row,
      formData: { saveToGitHub: true, GitHubMessage: 'sync from CIPP' },
      edit: true,
      savedItem: null,
      isDriftMode: false,
      source: 'Org/repo-a',
    })

    expect(payload.GitHub).toEqual({ FullName: 'Org/repo-a', Message: 'sync from CIPP' })
    expect(payload.saveToGitHub).toBeUndefined()
    expect(payload.GitHubMessage).toBeUndefined()
  })

  it('omits GitHub entirely when the switch is off', () => {
    const payload = buildStandardsTemplatePayload({
      row,
      formData: { saveToGitHub: false, GitHubMessage: '' },
      edit: true,
      savedItem: null,
      isDriftMode: false,
      source: 'Org/repo-a',
    })

    expect(payload).not.toHaveProperty('GitHub')
    expect(payload).not.toHaveProperty('saveToGitHub')
    expect(payload).not.toHaveProperty('GitHubMessage')
  })

  it('omits GitHub when the switch is on but the template has no source', () => {
    const payload = buildStandardsTemplatePayload({
      row,
      formData: { saveToGitHub: true, GitHubMessage: 'sync from CIPP' },
      edit: true,
      savedItem: null,
      isDriftMode: false,
      source: null,
    })

    expect(payload).not.toHaveProperty('GitHub')
  })
})

describe('buildSyncedTemplateFields', () => {
  it('returns no fields for a template without a source', () => {
    expect(buildSyncedTemplateFields({ source: null, canSaveToGitHub: false })).toBeUndefined()
  })

  it('shows only a warning for a source the user cannot push to', () => {
    const fields = buildSyncedTemplateFields({ source: 'Org/repo', canSaveToGitHub: false })
    expect(fields.map((f) => f.type)).toEqual(['alert'])
    expect(fields[0].label).toContain('cannot push to')
    expect(fields[0].label).toContain('Clone & Edit Template')
  })

  it('shows the warning, switch and message for a writable source', () => {
    const fields = buildSyncedTemplateFields({ source: 'Org/repo', canSaveToGitHub: true })
    expect(fields.map((f) => f.type)).toEqual(['alert', 'switch', 'textField'])
    expect(fields[0].condition).toEqual({ field: 'saveToGitHub', compareType: 'isNot', compareValue: true })
    expect(fields[0].label).toContain('does not push your changes upstream')
  })
})

describe('buildSyncedTemplateFields local-change states', () => {
  it('warns that local changes are not in the repo yet', () => {
    const fields = buildSyncedTemplateFields({ source: 'Org/repo', canSaveToGitHub: true, hasLocalChanges: true })
    expect(fields[0].severity).toBe('warning')
    expect(fields[0].label).toContain('already has changes that are not in Org/repo')
  })

  it('downgrades to an info note when the copy matches the repo', () => {
    const fields = buildSyncedTemplateFields({ source: 'Org/repo', canSaveToGitHub: true, hasLocalChanges: false })
    expect(fields[0].severity).toBe('info')
  })

  it('keeps the warning when the state is unknown', () => {
    const fields = buildSyncedTemplateFields({ source: 'Org/repo', canSaveToGitHub: true, hasLocalChanges: null })
    expect(fields[0].severity).toBe('warning')
  })
})
