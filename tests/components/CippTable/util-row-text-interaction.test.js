import { describe, expect, it } from 'vitest'
import {
  hasTextSelection,
  isPointerDrag,
  isRowTextInteraction,
} from '../../../src/components/CippTable/util-row-text-interaction'

describe('hasTextSelection', () => {
  it('returns false when selection is empty', () => {
    window.getSelection = () => ({ type: 'Caret', toString: () => '' })
    expect(hasTextSelection()).toBe(false)
  })

  it('returns true when text is selected', () => {
    window.getSelection = () => ({ type: 'Range', toString: () => 'alice@contoso.com' })
    expect(hasTextSelection()).toBe(true)
  })
})

describe('isPointerDrag', () => {
  it('returns false for a click without movement', () => {
    expect(
      isPointerDrag({ x: 10, y: 10 }, { clientX: 11, clientY: 12 })
    ).toBe(false)
  })

  it('returns true when the pointer moved far enough to select', () => {
    expect(
      isPointerDrag({ x: 10, y: 10 }, { clientX: 20, clientY: 10 })
    ).toBe(true)
  })
})

describe('isRowTextInteraction', () => {
  it('returns true when either selection or drag is present', () => {
    window.getSelection = () => ({ type: 'Range', toString: () => 'selected' })
    expect(isRowTextInteraction(null, { clientX: 0, clientY: 0 })).toBe(true)
  })
})
