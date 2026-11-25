import { describe, expect, it } from 'vitest'
import {
  applyIntuneSettingEdits,
  buildIntunePropertyLeaves,
  buildIntuneSettingLeaves,
  defaultValueForLeaf,
} from '../../src/utils/intune-template-leaves'
import { VALUE_CHECKS } from '../../src/components/CippComponents/CippIntuneSettingsEditor'
import schema from '../../public/intune-graph-schema.json'
import { capturedTemplates, deployedPolicies } from '../mocks/intune-catalog'

// Classic policy fields are typed by what Graph declares, not by how the template stored them. Issue
// 1421: a feature update template stored installFeatureUpdatesOptional as the text "false", so the
// editor showed a text box and saved text forever, and every compare against the tenant's boolean
// reported a difference.

const leavesFor = (policy, templateType) =>
  buildIntunePropertyLeaves(
    policy,
    (key) => key,
    schema,
    schema.templateTypes[templateType] ?? null
  )

const save = (policy, templateType, edit = () => {}) => {
  const leaves = leavesFor(policy, templateType)
  const values = leaves.map(defaultValueForLeaf)
  edit(leaves, values)
  return applyIntuneSettingEdits(policy, leaves, values)
}

const leafAt = (leaves, definitionId) =>
  leaves.find((leaf) => leaf.definitionId === definitionId)

// The stored payload of the template in issue 1421.
const featureUpdate = {
  displayName: 'CBTS Feature Update - Test Devices V2',
  featureUpdateVersion: 'Windows 11, version 26H2',
  roleScopeTagIds: ['0'],
  deployableContentDisplayName: 'Windows 11, version 26H2',
  endOfSupportDate: '2029-10-09T00:00:00Z',
  installLatestWindows10OnWindows11IneligibleDevice: false,
  installFeatureUpdatesOptional: 'false',
  rolloutSettings: { offerStartDateTimeInUTC: '%FUdateTest%' },
}

describe('schema-typed classic policy fields', () => {
  it('edits a boolean stored as text as a boolean, and saves it as one', () => {
    const leaves = leavesFor(featureUpdate, 'windowsFeatureUpdateProfiles')
    expect(leafAt(leaves, 'installFeatureUpdatesOptional')).toMatchObject({
      kind: 'boolean',
      value: false,
    })

    const saved = save(featureUpdate, 'windowsFeatureUpdateProfiles')
    expect(saved).toEqual({
      ...featureUpdate,
      installFeatureUpdatesOptional: false,
    })
  })

  it('without the schema keeps the stored type, as before', () => {
    const leaves = buildIntunePropertyLeaves(featureUpdate)
    expect(leafAt(leaves, 'installFeatureUpdatesOptional').kind).toBe('simple')
  })

  it('keeps a variable in a boolean field, and the field stays boolean', () => {
    const policy = {
      ...featureUpdate,
      installFeatureUpdatesOptional: '%FUOptional%',
    }
    const leaves = leavesFor(policy, 'windowsFeatureUpdateProfiles')
    const leaf = leafAt(leaves, 'installFeatureUpdatesOptional')
    expect(leaf).toMatchObject({ kind: 'boolean', value: '%FUOptional%' })
    expect(defaultValueForLeaf(leaf)).toEqual({
      label: '%FUOptional%',
      value: '%FUOptional%',
    })
    expect(
      save(policy, 'windowsFeatureUpdateProfiles').installFeatureUpdatesOptional
    ).toBe('%FUOptional%')
  })

  it('types nested properties through their complex type', () => {
    const leaves = leavesFor(featureUpdate, 'windowsFeatureUpdateProfiles')
    expect(
      leafAt(leaves, 'rolloutSettings.offerStartDateTimeInUTC').valueType
    ).toBe('dateTime')
  })

  it('offers an enum as a closed choice of its members', () => {
    const policy = {
      '@odata.type': '#microsoft.graph.windows10GeneralConfiguration',
      displayName: 'x',
      defenderCloudBlockLevel: 'high',
    }
    const leaf = leafAt(leavesFor(policy, 'Device'), 'defenderCloudBlockLevel')
    expect(leaf.kind).toBe('choice')
    expect(leaf.options.map((option) => option.value)).toEqual(
      schema.enums['microsoft.graph.defenderCloudBlockLevelType'].members
    )
    expect(save(policy, 'Device')).toEqual(policy)
  })

  it('saves an integer stored as text as a number', () => {
    const policy = {
      '@odata.type': '#microsoft.graph.windows10GeneralConfiguration',
      displayName: 'x',
      passwordMinimumLength: '8',
    }
    expect(save(policy, 'Device').passwordMinimumLength).toBe(8)
  })

  it('follows a subtype named by @odata.type below the root', () => {
    const policy = {
      '@odata.type': '#microsoft.graph.windows10CustomConfiguration',
      displayName: 'x',
      omaSettings: [],
      nested: {
        '@odata.type': '#microsoft.graph.omaSettingBoolean',
        omaUri: './Device/x',
        value: 'true',
      },
    }
    const leaves = leavesFor(policy, 'Device')
    expect(leafAt(leaves, 'nested.value')).toMatchObject({
      kind: 'boolean',
      value: true,
    })
  })

  it('falls back to the stored type for a property Graph does not declare', () => {
    const policy = { ...featureUpdate, notInGraph: 'false' }
    const leaf = leafAt(
      leavesFor(policy, 'windowsFeatureUpdateProfiles'),
      'notInGraph'
    )
    expect(leaf).toMatchObject({ kind: 'simple', valueType: 'string' })
  })

  it('keeps an edit to the boolean as a boolean', () => {
    const saved = save(
      featureUpdate,
      'windowsFeatureUpdateProfiles',
      (leaves, values) => {
        values[leafAt(leaves, 'installFeatureUpdatesOptional').index] = {
          label: 'True',
          value: true,
        }
      }
    )
    expect(saved.installFeatureUpdatesOptional).toBe(true)
  })
})

// Typing from the schema must not change any captured policy that was already stored correctly.
const isClassic = (policy) =>
  policy &&
  !Array.isArray(policy.settings) &&
  !Array.isArray(policy.omaSettings) &&
  !Array.isArray(policy.added) &&
  !Array.isArray(policy.definitionValues)

describe('saving a captured classic policy unchanged with the schema', () => {
  const cases = [
    ...capturedTemplates
      .filter((template) => isClassic(template.Policy))
      .map((template) => [template.name, template.Type, template.Policy]),
    ...deployedPolicies
      .filter((policy) => isClassic(policy.Recaptured))
      .map((policy) => [
        `${policy.name} (recaptured)`,
        policy.Type,
        policy.Recaptured,
      ]),
  ]

  it('has classic policies to check', () => {
    expect(cases.length).toBeGreaterThan(0)
  })

  it.each(cases)('gives back %s exactly', (_, type, policy) => {
    expect(JSON.stringify(save(policy, type))).toBe(JSON.stringify(policy))
  })
})

describe('value checks for typed text fields', () => {
  it.each([
    ['integer', '8', true],
    ['integer', '8.5', false],
    ['integer', 'eight', false],
    ['number', '8.5', true],
    ['number', 'x', false],
    ['dateTime', '2026-12-01T09:00:00Z', true],
    ['dateTime', '2026-12-01T09:00:00.161Z', true],
    ['dateTime', '2026-12-01', false],
    ['dateTime', 'next week', false],
  ])('%s accepts %s: %s', (valueType, entered, accepted) => {
    expect(VALUE_CHECKS[valueType].test(entered)).toBe(accepted)
  })
})

describe('OMA-URI boolean settings', () => {
  // The shipped "CIPP: Skip Autopilot User Setup Page" template stores this value as text; Intune holds true.
  const skipUserSetup = {
    '@odata.type': '#microsoft.graph.windows10CustomConfiguration',
    displayName: 'CIPP: Skip Autopilot User Setup Page',
    omaSettings: [
      {
        '@odata.type': '#microsoft.graph.omaSettingBoolean',
        displayName: 'SkipUserSetupPage',
        omaUri:
          './Device/Vendor/MSFT/DMClient/Provider/MS DM Server/FirstSyncStatus/SkipUserStatusPage',
        value: 'true',
      },
    ],
  }

  it('edits and saves an omaSettingBoolean as a boolean', () => {
    const leaves = buildIntuneSettingLeaves(skipUserSetup, () => undefined)
    expect(leaves[0]).toMatchObject({ kind: 'boolean', value: true })
    const saved = applyIntuneSettingEdits(
      skipUserSetup,
      leaves,
      leaves.map(defaultValueForLeaf)
    )
    expect(saved.omaSettings[0].value).toBe(true)
  })
})
