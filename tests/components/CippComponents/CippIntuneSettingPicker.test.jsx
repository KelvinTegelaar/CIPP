import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import {
  CippIntuneSettingPicker,
  searchSettingIndex,
} from '../../../src/components/CippComponents/CippIntuneSettingPicker'
import { renderWithTheme } from '../../test-utils'
import {
  forceListCategory,
  forceListChildren,
  forceListDefinition,
  forceListIdsDefinition,
  forceListIndexRows,
} from '../../mocks/intune-chrome-forcelist'

vi.mock('../../../src/hooks/use-intune-collection', () => ({
  useIntuneSettingIndex: () => ({
    rows: forceListIndexRows,
    isLoading: false,
    isError: false,
  }),
  useIntuneCategories: () =>
    new Map([[forceListCategory.id, forceListCategory]]),
  fetchIntuneDefinitions: vi.fn(async (ids) =>
    ids.map((id) =>
      id === forceListDefinition.id ? forceListDefinition : null
    )
  ),
  fetchIntuneDescendants: vi.fn(async () => forceListChildren),
}))

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

describe('CippIntuneSettingPicker', () => {
  it('adds a nested setting through its parent, on the option that leads to it', async () => {
    const onAdd = vi.fn(() => true)
    renderWithTheme(
      <CippIntuneSettingPicker
        open
        onClose={() => {}}
        onAdd={onAdd}
        platform="windows10"
        technology="mdm"
      />
    )

    fireEvent.change(screen.getByLabelText('Search settings'), {
      target: { value: 'silently installed' },
    })
    fireEvent.click(await screen.findByText(forceListIdsDefinition.displayName))

    await waitFor(() => expect(onAdd).toHaveBeenCalled())
    const [definition, children, wanted] = onAdd.mock.calls[0]
    expect(definition).toBe(forceListDefinition)
    expect(children).toBe(forceListChildren)
    expect([...wanted]).toEqual([forceListIdsDefinition.id])
  })

  it('names the setting a nested result sits under', async () => {
    renderWithTheme(
      <CippIntuneSettingPicker
        open
        onClose={() => {}}
        onAdd={() => true}
        platform="windows10"
        technology="mdm"
      />
    )

    fireEvent.change(screen.getByLabelText('Search settings'), {
      target: { value: 'silently installed' },
    })

    expect(
      await screen.findByText(`Under ${forceListDefinition.displayName}.`, {
        exact: false,
      })
    ).toBeInTheDocument()
  })

  it('labels results with the category path, which tells Edge and Chrome settings apart', async () => {
    renderWithTheme(
      <CippIntuneSettingPicker
        open
        onClose={() => {}}
        onAdd={() => true}
        platform="windows10"
        technology="mdm"
      />
    )

    fireEvent.change(screen.getByLabelText('Search settings'), {
      target: { value: 'silently installed' },
    })

    expect(
      await screen.findByText(forceListCategory.description)
    ).toBeInTheDocument()
    expect(screen.queryByText(forceListCategory.displayName)).toBeNull()
  })
})
