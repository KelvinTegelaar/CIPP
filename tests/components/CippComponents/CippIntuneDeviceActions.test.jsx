import { describe, expect, it } from 'vitest'
import { getIntuneDeviceActions } from '../../../src/components/CippComponents/CippIntuneDeviceActions'

const windowsRow = { id: 'device-1', deviceName: 'WIN-1', operatingSystem: 'Windows' }
const macRow = { id: 'device-2', deviceName: 'MAC-1', operatingSystem: 'macOS' }

const getActions = () => getIntuneDeviceActions({ tenantFilter: 'contoso.onmicrosoft.com' })

const findWipeActions = (actions) => actions.filter((action) => action.label === 'Wipe Device')

describe('getIntuneDeviceActions wipe/reset consolidation', () => {
  it('hides the Windows wipe entry for a macOS row and shows it for a Windows row', () => {
    const actions = getActions()
    const windowsWipe = findWipeActions(actions).find(
      (action) => action.data?.keepUserData === false && !action.fields?.some((f) => f.name === 'macOsUnlockCode')
    )
    expect(windowsWipe).toBeDefined()
    expect(windowsWipe.hideCondition(macRow)).toBe(true)
    expect(windowsWipe.hideCondition(windowsRow)).toBe(false)
  })

  it('hides the macOS wipe entry for a Windows row and shows it for a macOS row', () => {
    const actions = getActions()
    const macWipe = findWipeActions(actions).find((action) =>
      action.fields?.some((f) => f.name === 'macOsUnlockCode')
    )
    expect(macWipe).toBeDefined()
    expect(macWipe.hideCondition(windowsRow)).toBe(true)
    expect(macWipe.hideCondition(macRow)).toBe(false)
  })

  it('keeps the Autopilot Reset payload as keepUserData:false, keepEnrollmentData:true', () => {
    const actions = getActions()
    const autopilotReset = actions.find((action) => action.label === 'Autopilot Reset')
    expect(autopilotReset).toBeDefined()
    expect(autopilotReset.data).toMatchObject({
      GUID: 'id',
      Action: 'wipe',
      keepUserData: false,
      keepEnrollmentData: true,
    })
    expect(autopilotReset.hideCondition(macRow)).toBe(true)
    expect(autopilotReset.hideCondition(windowsRow)).toBe(false)
  })

  it('declares the consolidated Windows wipe action with required radio fields for keepEnrollmentData and useProtectedWipe with boolean option values', () => {
    const actions = getActions()
    const windowsWipe = findWipeActions(actions).find(
      (action) => action.data?.keepUserData === false && !action.fields?.some((f) => f.name === 'macOsUnlockCode')
    )
    expect(windowsWipe).toBeDefined()

    const keepEnrollmentField = windowsWipe.fields.find((f) => f.name === 'keepEnrollmentData')
    expect(keepEnrollmentField.type).toBe('radio')
    expect(keepEnrollmentField.validators?.required).toBeTruthy()
    expect(keepEnrollmentField.options.map((o) => o.value).sort()).toEqual([false, true])

    const protectedWipeField = windowsWipe.fields.find((f) => f.name === 'useProtectedWipe')
    expect(protectedWipeField.type).toBe('radio')
    expect(protectedWipeField.validators?.required).toBeTruthy()
    expect(protectedWipeField.options.map((o) => o.value).sort()).toEqual([false, true])
  })

  it('declares the consolidated Fresh Start action with a required keepUserData radio field', () => {
    const actions = getActions()
    const freshStart = actions.find((action) => action.label === 'Fresh Start')
    expect(freshStart).toBeDefined()
    expect(freshStart.data).toMatchObject({ GUID: 'id', Action: 'cleanWindowsDevice' })

    const keepUserDataField = freshStart.fields.find((f) => f.name === 'keepUserData')
    expect(keepUserDataField.type).toBe('radio')
    expect(keepUserDataField.validators?.required).toBeTruthy()
    expect(keepUserDataField.options.map((o) => o.value).sort()).toEqual([false, true])

    expect(freshStart.hideCondition(macRow)).toBe(true)
    expect(freshStart.hideCondition(windowsRow)).toBe(false)
  })

  it('no action in the file uses a pure-OS condition any more', () => {
    const actions = getActions()
    const pureOsConditionActions = actions.filter((action) => typeof action.condition === 'function')
    expect(pureOsConditionActions).toEqual([])
  })
})
