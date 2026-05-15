import React, { useState, useEffect } from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  IconButton,
  Link,
  Typography,
  Button,
  Tooltip,
  CircularProgress,
  Stack,
} from '@mui/material'
import { Grid } from '@mui/system'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { PropertyListItem } from '../property-list-item'
import { PropertyList } from '../property-list'
import { getCippTranslation } from '../../utils/get-cipp-translation'
import { getCippFormatting } from '../../utils/get-cipp-formatting'
import { CippCodeBlock } from '../CippComponents/CippCodeBlock'
import intuneCollection from '../../data/intuneCollection.json'
import { useGuidResolver } from '../../hooks/use-guid-resolver'
import { useAdminTemplateDefinitions } from '../../hooks/use-admin-template-definitions'
import {
  definitionBindPattern,
  presentationBindPattern,
  extractBindGuid,
} from '../../utils/intune-bind-helpers'

const intuneCollectionMap = new Map(
  (intuneCollection || []).filter((item) => item?.id).map((item) => [item.id, item])
)

const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>)]+)/g

const renderTextWithLinks = (text) => {
  if (!text) {
    return null
  }

  const parts = []
  let lastIndex = 0
  let match
  linkPattern.lastIndex = 0

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const label = match[1] || match[3]
    const href = match[2] || match[3]

    parts.push(
      <Link
        key={`${href}-${match.index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
        sx={{ color: 'inherit', fontWeight: 600, textDecorationColor: 'currentColor' }}
      >
        {label}
      </Link>
    )

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

const cleanObject = (obj) => {
  if (Array.isArray(obj)) {
    return obj
      .map((item) => cleanObject(item))
      .filter((item) => item !== null && item !== undefined && item !== '')
  } else if (typeof obj === 'object' && obj !== null) {
    const cleanedObj = {}
    Object.entries(obj).forEach(([key, value]) => {
      const cleanedValue = cleanObject(value)
      if (cleanedValue !== null && cleanedValue !== undefined && cleanedValue !== '') {
        cleanedObj[key] = cleanedValue
      }
    })
    return Object.keys(cleanedObj).length > 0 ? cleanedObj : null
  } else {
    return obj
  }
}

const renderListItems = (data, onItemClick, guidMapping = {}, isLoadingGuids = false, isGuid) => {
  // Check if this data object is from a diff
  const isDiffData = data?.__isDiffData === true

  // Helper to try parsing JSON strings
  const tryParseJson = (str) => {
    if (typeof str !== 'string') return null
    try {
      return JSON.parse(str)
    } catch {
      return null
    }
  }

  // Helper to get deep object differences
  const getObjectDiff = (oldObj, newObj, path = '') => {
    const changes = []
    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})])

    allKeys.forEach((key) => {
      const currentPath = path ? `${path}.${key}` : key
      const oldVal = oldObj?.[key]
      const newVal = newObj?.[key]

      if (oldVal === undefined && newVal !== undefined) {
        changes.push({ path: currentPath, type: 'added', newValue: newVal })
      } else if (oldVal !== undefined && newVal === undefined) {
        changes.push({ path: currentPath, type: 'removed', oldValue: oldVal })
      } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        if (typeof oldVal === 'object' && typeof newVal === 'object' && oldVal && newVal) {
          changes.push(...getObjectDiff(oldVal, newVal, currentPath))
        } else {
          changes.push({ path: currentPath, type: 'modified', oldValue: oldVal, newValue: newVal })
        }
      }
    })

    return changes
  }

  return Object.entries(data).map(([key, value]) => {
    // Skip the diff marker key
    if (key === '__isDiffData') {
      return null
    }

    // Special handling for oldValue/newValue pairs
    if (key === 'oldValue' && data.newValue !== undefined) {
      const oldObj = tryParseJson(value)
      const newObj = tryParseJson(data.newValue)

      // If both are JSON objects, show detailed diff
      if (oldObj && newObj) {
        const diff = getObjectDiff(oldObj, newObj)
        if (diff.length > 0) {
          return (
            <PropertyListItem
              key={key}
              label="Changes"
              value={
                <Button variant="text" onClick={() => onItemClick({ changes: diff })}>
                  View {diff.length} change{diff.length > 1 ? 's' : ''}
                </Button>
              }
            />
          )
        }
      } else {
        // For simple strings or non-JSON values, show old → new
        return (
          <PropertyListItem
            key={key}
            label="Change"
            value={`${getCippFormatting(value, key)} → ${getCippFormatting(
              data.newValue,
              'newValue'
            )}`}
          />
        )
      }
    }

    // Skip newValue if we already handled it with oldValue
    if (key === 'newValue' && data.oldValue !== undefined) {
      return null
    }

    if (Array.isArray(value)) {
      return (
        <PropertyListItem
          key={key}
          label={getCippTranslation(key)}
          disabled={value.length === 0}
          value={
            <Button variant="text" onClick={() => onItemClick(value)}>
              {value.length} item{value.length > 1 ? 's' : ''}
            </Button>
          }
        />
      )
    } else if (typeof value === 'object' && value !== null) {
      return (
        <PropertyListItem
          key={key}
          label={getCippTranslation(key)}
          value={
            <Button variant="text" onClick={() => onItemClick(value)}>
              View Details
            </Button>
          }
        />
      )
    } else if (typeof value === 'string' && isGuid(value) && guidMapping[value]) {
      return (
        <PropertyListItem
          key={key}
          label={getCippTranslation(key)}
          value={
            <Tooltip title={`GUID: ${value}`} placement="top">
              <div>{guidMapping[value]}</div>
            </Tooltip>
          }
        />
      )
    } else if (typeof value === 'string' && isGuid(value) && isLoadingGuids) {
      return (
        <PropertyListItem
          key={key}
          label={getCippTranslation(key)}
          value={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <span>{getCippFormatting(value, key)}</span>
            </div>
          }
        />
      )
    } else {
      // If this is diff data, show the value directly without formatting
      const displayValue = isDiffData ? value : getCippFormatting(value, key)

      return <PropertyListItem key={key} label={getCippTranslation(key)} value={displayValue} />
    }
  })
}

function CippJsonView({
  object = { 'No Data Selected': 'No Data Selected' },
  type,
  defaultOpen = false,
  title = 'Policy Details',
  tenant = null,
}) {
  const [viewJson, setViewJson] = useState(false)
  const [accordionOpen, setAccordionOpen] = useState(defaultOpen)
  const [drilldownData, setDrilldownData] = useState([]) // Array of { data, title }

  const objectTenant =
    tenant || object?.Tenant || object?.tenant || object?.TenantFilter || object?.tenantFilter || null

  // Use the GUID resolver hook
  const { guidMapping, isLoadingGuids, resolveGuids, isGuid } = useGuidResolver(objectTenant)
  const resolvedType =
    type ||
    (object?.omaSettings || object?.settings || object?.definitionValues || object?.added
      ? 'intune'
      : undefined)
  const {
    definitionsMap: addedDefinitionsMap,
    isLoadingDefinitions,
    isDefinitionsError,
  } = useAdminTemplateDefinitions({
    added: object?.added,
    manualTenant: objectTenant,
    waiting: resolvedType === 'intune',
  })

  const renderIntuneItems = (data) => {
    const items = []
    const liveDefinitions = new Map()

    if (Array.isArray(data.settings)) {
      data.settings.forEach((setting) => {
        ;(setting?.settingDefinitions || []).forEach((definition) => {
          if (definition?.id) {
            liveDefinitions.set(definition.id, definition)
          }
        })
      })
    }

    const getSettingDefinition = (settingDefinitionId, setting) => {
      const settingDefinitions = setting?.settingDefinitions || []
      return (
        settingDefinitions.find((definition) => definition?.id === settingDefinitionId) ||
        liveDefinitions.get(settingDefinitionId) ||
        intuneCollectionMap.get(settingDefinitionId)
      )
    }

    const hasSettingValue = (settingValue) =>
      settingValue &&
      Object.prototype.hasOwnProperty.call(settingValue, 'value') &&
      settingValue.value !== undefined &&
      settingValue.value !== null

    const getOptionDefinition = (definition, value) => {
      if (!Array.isArray(definition?.options)) {
        return null
      }

      return (
        definition.options.find((option) => option.id === value || option.itemId === value) || null
      )
    }

    const renderDefinitionTooltip = (definition, optionDefinition) => {
      const description = definition?.helpText || definition?.description || definition?.explainText
      const optionDescription = optionDefinition?.helpText || optionDefinition?.description
      const infoUrls = Array.isArray(definition?.infoUrls) ? definition.infoUrls : []

      if (!description && !optionDescription && infoUrls.length === 0) {
        return null
      }

      return (
        <Box sx={{ maxWidth: 360 }}>
          {description && (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {renderTextWithLinks(description)}
            </Typography>
          )}
          {optionDescription && (
            <Typography variant="body2" sx={{ mt: description ? 1 : 0, whiteSpace: 'pre-line' }}>
              Selected value: {renderTextWithLinks(optionDescription)}
            </Typography>
          )}
          {infoUrls.length > 0 && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8 }}>
              More info:{' '}
              {infoUrls.map((url, index) => (
                <React.Fragment key={url}>
                  {index > 0 ? ', ' : ''}
                  <Link
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    sx={{ color: 'inherit', fontWeight: 600, textDecorationColor: 'currentColor' }}
                  >
                    {url}
                  </Link>
                </React.Fragment>
              ))}
            </Typography>
          )}
        </Box>
      )
    }

    const renderSettingLabel = (label, definition, optionDefinition) => {
      const tooltip = renderDefinitionTooltip(definition, optionDefinition)

      if (!tooltip) {
        return label
      }

      return (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <Box component="span">{label}</Box>
          <Tooltip
            title={tooltip}
            placement="top"
            arrow
            enterTouchDelay={0}
            leaveTouchDelay={8000}
            disableInteractive={false}
          >
            <IconButton
              aria-label={`Description for ${label}`}
              size="small"
              sx={{ p: 0.25, color: 'text.secondary' }}
              onClick={(event) => event.stopPropagation()}
            >
              <InfoOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }

    const renderSettingValue = (value) => {
      if (typeof value === 'string' && isGuid(value) && guidMapping[value]) {
        return (
          <Tooltip title={`GUID: ${value}`} placement="top">
            <div>
              {guidMapping[value]}
              <Typography
                variant="caption"
                sx={{ fontStyle: 'italic', ml: 1, color: 'text.secondary' }}
              >
                (GUID)
              </Typography>
            </div>
          </Tooltip>
        )
      }

      return value
    }

    const getChoiceValue = (definition, rawValue) => {
      const optionDefinition = getOptionDefinition(definition, rawValue)

      return {
        optionDefinition,
        value: optionDefinition?.displayName || rawValue,
      }
    }

    const getDisplayValue = (value) => {
      if (value === null || value === undefined || value === '') {
        return ''
      }

      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No'
      }

      if (typeof value === 'string' || typeof value === 'number') {
        return value
      }

      try {
        return JSON.stringify(value)
      } catch {
        return String(value)
      }
    }

    const getAdministrativeTemplatePresentationValue = (presentationValue) => {
      if (!presentationValue || typeof presentationValue !== 'object') {
        return 'Not configured'
      }

      if (Object.prototype.hasOwnProperty.call(presentationValue, 'value')) {
        const displayValue = getDisplayValue(presentationValue.value)
        if (displayValue !== '') {
          return displayValue
        }
      }

      if (Array.isArray(presentationValue.values)) {
        const values = presentationValue.values
          .map((entry) => {
            if (entry && typeof entry === 'object') {
              const entryLabel =
                entry.name ||
                entry.key ||
                entry.displayName ||
                entry.id ||
                entry.PresentationDefinitionLabel ||
                ''
              const entryValue = getDisplayValue(
                entry.value ?? entry.text ?? entry.Value ?? entry.StringValue ?? entry
              )

              if (entryLabel && entryValue !== '') {
                return `${entryLabel}: ${entryValue}`
              }

              return entryValue
            }

            return getDisplayValue(entry)
          })
          .filter((entry) => entry !== null && entry !== undefined && entry !== '')

        if (values.length > 0) {
          return values.join(', ')
        }
      }

      return 'Not configured'
    }

    const getStatusText = (enabled) =>
      enabled === true ? 'Enabled' : enabled === false ? 'Disabled' : 'Configured'

    const addAdministrativeTemplateValue = (
      value,
      index,
      { definition, definitionId, label, keyPrefix, presentationKeyInfix, resolvePresentationLabel }
    ) => {
      if (!value || typeof value !== 'object') {
        return
      }

      const categoryPath = definition?.categoryPath
      const presentationValues = Array.isArray(value.presentationValues)
        ? value.presentationValues
        : []
      const itemKey = value.id || definitionId || index

      items.push(
        <PropertyListItem
          key={`${keyPrefix}-${itemKey}`}
          label={renderSettingLabel(label, definition)}
          value={
            <Stack spacing={0.5} sx={{ py: 0.25 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {getStatusText(value.enabled)}
              </Typography>
              {categoryPath && (
                <Typography variant="caption" color="text.secondary">
                  {categoryPath}
                </Typography>
              )}
              {!definition && definitionId && (
                <Typography variant="caption" color="text.secondary">
                  Definition ID: {definitionId}
                </Typography>
              )}
              {presentationValues.map((presentationValue, presentationIndex) => {
                const presentationLabel = resolvePresentationLabel(
                  definition,
                  presentationValue,
                  presentationIndex
                )
                const presentationDisplayValue = getAdministrativeTemplatePresentationValue(
                  presentationValue
                )

                return (
                  <Box
                    key={`${itemKey}-${presentationKeyInfix}-${presentationValue?.id || presentationIndex}`}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      {presentationLabel}:
                    </Box>{' '}
                    {renderSettingValue(presentationDisplayValue)}
                  </Box>
                )
              })}
            </Stack>
          }
        />
      )
    }

    const getPresentationTypeLabel = (odataType) => {
      switch (odataType) {
        case '#microsoft.graph.groupPolicyPresentationValueBoolean':
          return 'Boolean value'
        case '#microsoft.graph.groupPolicyPresentationValueDecimal':
        case '#microsoft.graph.groupPolicyPresentationValueLongDecimal':
          return 'Numeric value'
        case '#microsoft.graph.groupPolicyPresentationValueMultiText':
          return 'Text list'
        case '#microsoft.graph.groupPolicyPresentationValueList':
          return 'List value'
        case '#microsoft.graph.groupPolicyPresentationValueText':
          return 'Text value'
        default:
          return 'Value'
      }
    }

    const getAddedPresentationLabel = (definition, presentationValue) => {
      const presentationId = extractBindGuid(
        presentationValue?.['presentation@odata.bind'],
        presentationBindPattern
      )

      if (presentationId && Array.isArray(definition?.presentations)) {
        const resolvedPresentation = definition.presentations.find(
          (presentation) => String(presentation?.id || '').toLowerCase() === presentationId
        )

        if (resolvedPresentation) {
          return (
            resolvedPresentation.label ||
            resolvedPresentation.displayName ||
            resolvedPresentation.id ||
            getPresentationTypeLabel(presentationValue?.['@odata.type'])
          )
        }
      }

      return getPresentationTypeLabel(presentationValue?.['@odata.type'])
    }

    const resolveLivePresentationLabel = (_definition, presentationValue, presentationIndex) =>
      presentationValue?.presentation?.label ||
      presentationValue?.presentation?.displayName ||
      presentationValue?.presentation?.id ||
      `Value ${presentationIndex + 1}`

    const addSettingInstance = (settingInstance, setting, keyPrefix) => {
      if (!settingInstance) {
        return
      }

      const definition = getSettingDefinition(settingInstance.settingDefinitionId, setting)
      const label = definition?.displayName || settingInstance.settingDefinitionId || 'Setting'
      const key = `${keyPrefix}-${items.length}`

      if (Array.isArray(settingInstance.groupSettingCollectionValue)) {
        settingInstance.groupSettingCollectionValue.forEach((groupValue, groupIndex) => {
          ;(groupValue?.children || []).forEach((child, childIndex) =>
            addSettingInstance(child, setting, `${key}-group-${groupIndex}-child-${childIndex}`)
          )
        })
        return
      }

      if (hasSettingValue(settingInstance.simpleSettingValue)) {
        items.push(
          <PropertyListItem
            key={key}
            label={renderSettingLabel(label, definition)}
            value={renderSettingValue(settingInstance.simpleSettingValue.value)}
          />
        )
        return
      }

      if (hasSettingValue(settingInstance.choiceSettingValue)) {
        const choiceValue = getChoiceValue(definition, settingInstance.choiceSettingValue.value)
        items.push(
          <PropertyListItem
            key={key}
            label={renderSettingLabel(label, definition, choiceValue.optionDefinition)}
            value={renderSettingValue(choiceValue.value)}
          />
        )

        ;(settingInstance.choiceSettingValue.children || []).forEach((child, childIndex) =>
          addSettingInstance(child, setting, `${key}-choice-child-${childIndex}`)
        )
        return
      }

      if (Array.isArray(settingInstance.choiceSettingCollectionValue)) {
        const values = settingInstance.choiceSettingCollectionValue.map(
          (choiceSetting) => getChoiceValue(definition, choiceSetting.value).value
        )
        items.push(
          <PropertyListItem
            key={key}
            label={renderSettingLabel(label, definition)}
            value={values.join(', ')}
          />
        )
        return
      }

      if (Array.isArray(settingInstance.simpleSettingCollectionValue)) {
        const values = settingInstance.simpleSettingCollectionValue.map(
          (simpleSetting) => simpleSetting.value
        )
        items.push(
          <PropertyListItem
            key={key}
            label={renderSettingLabel(label, definition)}
            value={values.join(', ')}
          />
        )
        return
      }

      items.push(
        <PropertyListItem
          key={key}
          label={renderSettingLabel(label, definition)}
          value="This setting could not be resolved"
        />
      )
    }

    const policyNameKey = ['Name', 'DisplayName', 'displayName', 'name'].find((key) => key in data)
    if (policyNameKey) {
      items.push(
        <PropertyListItem key="policyName" label="Policy Name" value={data[policyNameKey]} />
      )
    }

    if (data.omaSettings) {
      data.omaSettings.forEach((omaSetting, index) => {
        items.push(
          <PropertyListItem
            key={`omaSetting-${index}`}
            label={`${omaSetting.displayName} (${omaSetting.omaUri})`}
            value={renderSettingValue(omaSetting.value)}
          />
        )
      })
    } else if (data.settings) {
      data.settings.forEach((setting, index) => {
        addSettingInstance(setting.settingInstance, setting, `setting-${index}`)
      })
    } else if (Array.isArray(data.definitionValues)) {
      if (data.definitionValues.length === 0) {
        items.push(
          <PropertyListItem
            key="definitionValues-empty"
            label="Administrative Template"
            value="This administrative template policy did not return any configured settings."
          />
        )
      }

      data.definitionValues.forEach((definitionValue, index) => {
        const definition = definitionValue?.definition
        addAdministrativeTemplateValue(definitionValue, index, {
          definition,
          definitionId: null,
          label: definition?.displayName || definition?.id || definitionValue?.id || 'Setting',
          keyPrefix: 'definitionValue',
          presentationKeyInfix: 'presentation',
          resolvePresentationLabel: resolveLivePresentationLabel,
        })
      })
    } else if (Array.isArray(data.added)) {
      const hasResolvedDefinitions = Object.keys(addedDefinitionsMap).length > 0

      if (isLoadingDefinitions && !hasResolvedDefinitions) {
        items.push(
          <PropertyListItem
            key="added-loading"
            label="Administrative Template"
            value={
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} />
                <Typography variant="body2">Resolving administrative template settings...</Typography>
              </Stack>
            }
          />
        )
        return items
      }

      if (data.added.length === 0) {
        items.push(
          <PropertyListItem
            key="added-empty"
            label="Administrative Template"
            value="This administrative template policy did not return any configured settings."
          />
        )
      }

      if (isDefinitionsError && !hasResolvedDefinitions) {
        items.push(
          <PropertyListItem
            key="added-definition-error"
            label="Definition Lookup"
            value="Microsoft definition metadata could not be resolved for this tenant. Rendering fallback values."
          />
        )
      }

      data.added.forEach((addedValue, index) => {
        const definitionId = extractBindGuid(
          addedValue?.['definition@odata.bind'],
          definitionBindPattern
        )
        const definition = definitionId ? addedDefinitionsMap[definitionId] : null
        addAdministrativeTemplateValue(addedValue, index, {
          definition,
          definitionId,
          label: definition?.displayName || definitionId || `Setting ${index + 1}`,
          keyPrefix: 'addedDefinition',
          presentationKeyInfix: 'added-presentation',
          resolvePresentationLabel: getAddedPresentationLabel,
        })
      })
    } else {
      Object.entries(data).forEach(([key, value]) => {
        // Check if value is a GUID that we've resolved
        if (typeof value === 'string' && isGuid(value) && guidMapping[value]) {
          items.push(
            <PropertyListItem
              key={key}
              label={getCippTranslation(key)}
              value={
                <Tooltip title={`GUID: ${value}`} placement="top">
                  <div>
                    {guidMapping[value]}
                    <Typography
                      variant="caption"
                      sx={{ fontStyle: 'italic', ml: 1, color: 'text.secondary' }}
                    >
                      (GUID)
                    </Typography>
                  </div>
                </Tooltip>
              }
            />
          )
        } else if (typeof value === 'string' && isGuid(value) && isLoadingGuids) {
          items.push(
            <PropertyListItem
              key={key}
              label={getCippTranslation(key)}
              value={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <span>{getCippFormatting(value, key)}</span>
                </div>
              }
            />
          )
        } else {
          items.push(
            <PropertyListItem
              key={key}
              label={getCippTranslation(key)}
              value={getCippFormatting(value, key)}
            />
          )
        }
      })
    }

    return items
  }

  useEffect(() => {
    const blacklist = [
      'selectedOption',
      'GUID',
      'ID',
      'id',
      'noSubmitButton',
      'createdDateTime',
      'modifiedDateTime',
    ]
    const cleanedObj = cleanObject(object) || {}
    const filteredObj = Object.fromEntries(
      Object.entries(cleanedObj).filter(([key]) => !blacklist.includes(key))
    )
    setDrilldownData([{ data: filteredObj, title: null }])

    // Using the resolveGuids function from the hook to handle GUID resolution
    resolveGuids(cleanedObj)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object])

  const toggleView = () => setViewJson(!viewJson)

  const handleItemClick = (itemData, level) => {
    const updatedData = drilldownData.slice(0, level + 1)

    // Helper to check if an array contains only simple key/value objects
    const isArrayOfKeyValuePairs = (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) return false
      return arr.every((item) => {
        if (typeof item !== 'object' || item === null || Array.isArray(item)) return false
        // Check if all values are primitives (not nested objects/arrays)
        return Object.values(item).every((val) => typeof val !== 'object' || val === null)
      })
    }

    // Compress single-property objects and single-item arrays into the same pane
    let dataToAdd = itemData
    const compressedKeys = []
    let wasCompressed = false

    // Special handling for diff changes object
    if (dataToAdd?.changes && Array.isArray(dataToAdd.changes)) {
      const diffObject = {}
      const blacklistFields = ['createdDateTime', 'modifiedDateTime', 'id']

      dataToAdd.changes.forEach((change) => {
        const label = change.path

        // Skip blacklisted fields in nested paths
        const pathParts = label.split('.')
        const lastPart = pathParts[pathParts.length - 1]
        if (blacklistFields.includes(lastPart)) {
          return
        }

        let hasValue = false
        let displayValue = ''

        if (change.type === 'added') {
          if (change.newValue !== null && change.newValue !== undefined && change.newValue !== '') {
            displayValue = `[ADDED] ${JSON.stringify(change.newValue)}`
            hasValue = true
          }
        } else if (change.type === 'removed') {
          if (change.oldValue !== null && change.oldValue !== undefined && change.oldValue !== '') {
            displayValue = `[REMOVED] ${JSON.stringify(change.oldValue)}`
            hasValue = true
          }
        } else if (change.type === 'modified') {
          const oldHasValue =
            change.oldValue !== null && change.oldValue !== undefined && change.oldValue !== ''
          const newHasValue =
            change.newValue !== null && change.newValue !== undefined && change.newValue !== ''

          // Only show if at least one side has a meaningful value (not both empty)
          if (oldHasValue || newHasValue) {
            // If both have values, show the change
            if (oldHasValue && newHasValue) {
              displayValue = `${JSON.stringify(change.oldValue)} → ${JSON.stringify(
                change.newValue
              )}`
              hasValue = true
            }
            // If only new has value, treat as added
            else if (newHasValue) {
              displayValue = `[ADDED] ${JSON.stringify(change.newValue)}`
              hasValue = true
            }
            // If only old has value, treat as removed
            else if (oldHasValue) {
              displayValue = `[REMOVED] ${JSON.stringify(change.oldValue)}`
              hasValue = true
            }
          }
        }

        if (hasValue) {
          diffObject[label] = displayValue
        }
      })
      // Mark this object as containing diff data
      dataToAdd = { ...diffObject, __isDiffData: true }
    }

    // Check if this is an array of items with oldValue/newValue (modifiedProperties pattern)
    const hasOldNewValues = (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) return false
      return arr.some((item) => item?.oldValue !== undefined || item?.newValue !== undefined)
    }

    // If the data is an array of key/value pairs, convert to a flat object
    // But skip if it's an array with oldValue/newValue properties (let normal rendering handle it)
    if (isArrayOfKeyValuePairs(dataToAdd) && !hasOldNewValues(dataToAdd)) {
      const flatObject = {}
      dataToAdd.forEach((item) => {
        const key = item.key || item.name || item.displayName
        const value = item.value || item.newValue || ''
        if (key) {
          flatObject[key] = value
        }
      })
      dataToAdd = flatObject
    }

    while (dataToAdd && typeof dataToAdd === 'object') {
      // Handle single-item arrays
      if (Array.isArray(dataToAdd) && dataToAdd.length === 1) {
        const singleItem = dataToAdd[0]
        if (singleItem && typeof singleItem === 'object') {
          compressedKeys.push('[0]')
          dataToAdd = singleItem
          wasCompressed = true
          continue
        } else {
          break
        }
      }

      // Handle single-property objects
      if (!Array.isArray(dataToAdd) && Object.keys(dataToAdd).length === 1) {
        const singleKey = Object.keys(dataToAdd)[0]
        const singleValue = dataToAdd[singleKey]

        // Only compress if the value is also an object or single-item array
        if (singleValue && typeof singleValue === 'object') {
          compressedKeys.push(singleKey)
          dataToAdd = singleValue
          wasCompressed = true
          continue
        }
      }

      break
    }

    // Create title from compressed keys if compression occurred
    const title = wasCompressed ? compressedKeys.join(' > ') : null

    updatedData[level + 1] = { data: dataToAdd, title }
    setDrilldownData(updatedData)

    // Use the resolveGuids function from the hook to handle GUID resolution for drill-down data
    resolveGuids(dataToAdd)
  }

  return (
    <Accordion
      variant="outlined"
      expanded={accordionOpen}
      onChange={() => setAccordionOpen(!accordionOpen)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <Stack direction="row" spacing={1} alignItems="space-between" sx={{ width: '100%' }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {isLoadingGuids && (
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} sx={{ mr: 1 }} /> Resolving object identifiers...
            </Typography>
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <IconButton onClick={toggleView} sx={{ ml: 1 }}>
          {viewJson ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
        {viewJson ? (
          <CippCodeBlock type="editor" code={JSON.stringify(cleanObject(object), null, 2)} />
        ) : (
          <Grid container spacing={2}>
            {drilldownData
              ?.filter((item) => item !== null && item !== undefined)
              .map((item, index) => (
                <Grid
                  size={{ sm: resolvedType === 'intune' ? 12 : 3, xs: 12 }}
                  key={index}
                  sx={{
                    //give a top border if the item is > 4, and add spacing between the top and bottom items
                    paddingTop: index === 0 ? 0 : 2,
                    borderTop:
                      index >= 4 && resolvedType !== 'intune' ? '1px solid lightgrey' : 'none',
                    borderRight: index < drilldownData.length - 1 ? '1px solid lightgrey' : 'none',
                    overflowWrap: 'anywhere',
                    whiteSpace: 'pre-line',
                    paddingRight: 2,
                  }}
                >
                  {item.title && (
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {getCippTranslation(item.title)}
                    </Typography>
                  )}
                  {resolvedType !== 'intune' && (
                    <PropertyList>
                      {renderListItems(
                        item.data,
                        (itemData) => handleItemClick(itemData, index),
                        guidMapping,
                        isLoadingGuids,
                        isGuid
                      )}
                    </PropertyList>
                  )}
                  {resolvedType === 'intune' && (
                    <PropertyList>{renderIntuneItems(item.data)}</PropertyList>
                  )}
                </Grid>
              ))}
          </Grid>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default CippJsonView
