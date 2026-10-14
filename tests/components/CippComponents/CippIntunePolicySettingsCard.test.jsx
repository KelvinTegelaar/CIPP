import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { CippIntunePolicySettingsCard } from '../../../src/components/CippComponents/CippIntunePolicySettingsCard'
import { renderWithTheme } from '../../test-utils'
import {
  forceListChildren,
  forceListDefinition,
  forceListIdsDefinition,
} from '../../mocks/intune-chrome-forcelist'

const wanted = new Set([forceListIdsDefinition.id])

vi.mock(
  '../../../src/components/CippComponents/CippIntuneSettingPicker',
  () => ({
    CippIntuneSettingPicker: ({ onAdd }) => (
      <button
        type="button"
        onClick={() => onAdd(forceListDefinition, forceListChildren, wanted)}
      >
        pick nested
      </button>
    ),
  })
)

describe('CippIntunePolicySettingsCard', () => {
  it('passes the nested setting the picker asked for through to the editor', () => {
    const addSetting = vi.fn(() => true)
    renderWithTheme(
      <CippIntunePolicySettingsCard
        policy={{ settings: [] }}
        editor={{ getDefinition: () => undefined, addSetting }}
        platform="windows10"
        technology="mdm"
        emptyText="No settings yet."
      />
    )

    fireEvent.click(screen.getByText('pick nested'))

    expect(addSetting).toHaveBeenCalledWith(
      forceListDefinition,
      forceListChildren,
      wanted
    )
  })
})
