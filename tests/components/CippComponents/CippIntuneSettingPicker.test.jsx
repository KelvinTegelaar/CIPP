import { describe, expect, it } from 'vitest'
import { searchSettingIndex } from '../../../src/components/CippComponents/CippIntuneSettingPicker'

const rows = [
  {
    id: 'defender_scan',
    displayName: 'Scan Archives',
    technologies: 'mdm,microsoftSense',
  },
  {
    id: 'bitlocker_require',
    displayName: 'Require Device Encryption',
    categoryName: 'BitLocker',
    technologies: 'mdm',
  },
  {
    id: 'bitlocker_os',
    displayName: 'BitLocker OS drive',
    technologies: 'mdm',
  },
  { id: 'cm_only', displayName: 'BitLocker CM', technologies: 'configManager' },
]

describe('searchSettingIndex', () => {
  it('ranks a name match above a category match', () => {
    expect(
      searchSettingIndex(rows, 'bitlocker', { technology: 'mdm' }).map(
        (r) => r.id
      )
    ).toEqual(['bitlocker_os', 'bitlocker_require'])
  })

  it('matches any of a multi-technology policy rather than the whole string', () => {
    expect(
      searchSettingIndex(rows, 'scan', {
        technology: 'mdm,microsoftSense',
      }).map((r) => r.id)
    ).toEqual(['defender_scan'])
    expect(
      searchSettingIndex(rows, 'bitlocker', {
        technology: 'mdm,microsoftSense',
      })
    ).toHaveLength(2)
  })

  it('leaves out settings the policy already has', () => {
    expect(
      searchSettingIndex(rows, 'bitlocker', {
        technology: 'mdm',
        excludeIds: ['bitlocker_os'],
      }).map((r) => r.id)
    ).toEqual(['bitlocker_require'])
  })
})
