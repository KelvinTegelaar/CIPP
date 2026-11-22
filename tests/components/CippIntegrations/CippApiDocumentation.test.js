import { describe, expect, it } from 'vitest'
import { rankOperations } from '../../../src/components/CippIntegrations/CippApiDocumentation'

// name / description / other as the Swagger filter builds them from backend/Config/openapi.json
const entry = (name, summary, description, tag, role) => ({
  name,
  description: `${summary} ${description}`,
  other: `${tag} ${role}`,
})

const entries = [
  entry(
    'ListTenantGroups',
    'Entrypoint for listing tenant groups',
    'Lists tenant groups (logical groupings of managed tenants) and optionally includes usage data.',
    'CIPP > Settings',
    'CIPP.Core.Read'
  ),
  entry(
    'ExecTenantGroup',
    'Entrypoint for tenant group management',
    'This function is used to manage tenant groups in CIPP',
    'CIPP > Settings',
    'Tenant.Groups.ReadWrite'
  ),
  entry(
    'ListUsersAndGroups',
    'ListUsersAndGroups',
    'Lists both users and groups for a tenant in a single batch call, returning ID and display name for selection/lookup purposes.',
    'Tenant > Administration > Tenant',
    'Tenant.Directory.Read'
  ),
  entry(
    'ListUserSettings',
    'ListUserSettings',
    "Retrieves the current CIPP user's personal settings and preferences.",
    'Identity > Administration > Users',
    'Identity.User.Read'
  ),
  entry(
    'ListUsers',
    'ListUsers',
    'Lists Entra ID users for a tenant with license and sign-in details, or retrieves a specific user by ID.',
    'Identity > Administration > Users',
    'Identity.User.Read'
  ),
  entry(
    'ExecOffboardUser',
    'ExecOffboardUser',
    'Runs the offboarding wizard: one scheduled offboarding job per user, immediately or at the scheduled time, reporting live progress under one job id.',
    'Identity > Administration > Users',
    'Identity.User.ReadWrite'
  ),
]

const names = (groups) => groups.map((group) => group.map((e) => e.name))

describe('rankOperations', () => {
  it('puts an endpoint whose name holds every word ahead of one that only describes it', () => {
    const [byName, byDescription] = names(
      rankOperations(entries, 'tenant groups')
    )
    expect(byName).toEqual(['ListTenantGroups'])
    expect(byDescription).toEqual(['ExecTenantGroup', 'ListUsersAndGroups'])
  })

  it('orders name matches exact first, then starts-with by length', () => {
    const [byName] = names(rankOperations(entries, 'ListUsers'))
    expect(byName).toEqual([
      'ListUsers',
      'ListUserSettings',
      'ListUsersAndGroups',
    ])
  })

  it('finds endpoints by role only in the last group', () => {
    expect(names(rankOperations(entries, 'Identity.User.ReadWrite'))).toEqual([
      [],
      [],
      ['ExecOffboardUser'],
    ])
  })

  it('requires every word, ignoring case, and lets words match across fields', () => {
    const groups = names(rankOperations(entries, 'OFFBOARD wizard'))
    expect(groups).toEqual([[], ['ExecOffboardUser'], []])
    expect(names(rankOperations(entries, 'offboard tenant')).flat()).toEqual([])
  })
})
