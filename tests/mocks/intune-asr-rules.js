// Two of the 19 ASR rules, copied from frontend/public/intune-definitions (catalog bundles + _index).
// A rule's per-rule exclusion list hangs off its Block, Audit and Warn options as an optional child,
// and the catalog marks it template-only: it exists only in the Endpoint security ASR Rules profile.
const PREFIX = '#microsoft.graph.deviceManagementConfiguration'
const ASR =
  'device_vendor_msft_policy_config_defender_attacksurfacereductionrules'

export const asrGroupId = ASR
export const adobeRuleId = `${ASR}_blockadobereaderfromcreatingchildprocesses`
export const adobeExclusionsId = `${adobeRuleId}_perruleexclusions`
export const webshellRuleId = `${ASR}_blockwebshellcreationforservers`

const ruleDefinition = (id, displayName) => ({
  id,
  '@odata.type': `${PREFIX}ChoiceSettingDefinition`,
  displayName,
  defaultOptionId: `${id}_off`,
  options: [
    { id: `${id}_off`, displayName: 'Off', dependedOnBy: [] },
    ...['block', 'audit', 'warn'].map((mode) => ({
      id: `${id}_${mode}`,
      displayName: mode[0].toUpperCase() + mode.slice(1),
      dependedOnBy: [
        { dependedOnBy: `${id}_perruleexclusions`, required: false },
      ],
    })),
  ],
})

export const adobeExclusionsDefinition = {
  id: adobeExclusionsId,
  '@odata.type': `${PREFIX}SimpleSettingCollectionDefinition`,
  displayName: 'ASR Only Per Rule Exclusions',
  minimumCount: 0,
  maximumCount: 1000,
  visibility: 'template',
  valueDefinition: {
    '@odata.type': `${PREFIX}StringSettingValueDefinition`,
    format: 'regEx',
    inputValidationSchema: '^[^|=>]+$',
    maximumLength: 1024,
    minimumLength: 0,
    isSecret: false,
  },
}

export const asrGroupDefinition = {
  id: ASR,
  '@odata.type': `${PREFIX}SettingGroupCollectionDefinition`,
  displayName: 'Attack Surface Reduction Rules',
  minimumCount: 0,
  maximumCount: 1,
  childIds: [adobeRuleId, webshellRuleId],
}

export const asrChildren = {
  [adobeRuleId]: ruleDefinition(
    adobeRuleId,
    'Block Adobe Reader from creating child processes'
  ),
  [webshellRuleId]: ruleDefinition(
    webshellRuleId,
    'Block Webshell creation for Servers'
  ),
  [adobeExclusionsId]: adobeExclusionsDefinition,
}

export const asrIndexRows = [
  {
    id: ASR,
    displayName: asrGroupDefinition.displayName,
    categoryName: 'Defender',
    technologies: 'mdm,configManager,microsoftSense',
  },
  {
    id: adobeRuleId,
    displayName: asrChildren[adobeRuleId].displayName,
    categoryName: 'Defender',
    technologies: 'mdm,configManager,microsoftSense',
    parentId: ASR,
  },
  {
    id: adobeExclusionsId,
    displayName: adobeExclusionsDefinition.displayName,
    categoryName: 'Defender',
    technologies: 'mdm,microsoftSense',
    templateOnly: true,
    parentId: adobeRuleId,
  },
]
