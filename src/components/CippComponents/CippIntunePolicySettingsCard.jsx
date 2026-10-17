import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'
import { CippIntuneSettingPicker } from './CippIntuneSettingPicker'
import {
  canAddCollectionEntry,
  canRemoveCollectionEntry,
  isGroupCollectionInstance,
} from '../../utils/intune-setting-builder'
import { collectSettingDefinitionIds } from '../../utils/intune-setting-definition-ids'

// The list of settings in a settings catalog policy, with add/remove for settings and group rows.
// `editor` is the object returned by useIntunePolicyEditor.
export const CippIntunePolicySettingsCard = ({
  policy,
  editor,
  platform,
  technology,
  emptyText,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const settings = policy?.settings ?? []
  const {
    getDefinition,
    addSetting,
    removeSetting,
    addGroupRow,
    removeGroupRow,
  } = editor

  return (
    <Card variant="outlined">
      <CardHeader
        title="Configured settings"
        subheader={`${settings.length} setting(s) in this policy`}
        slotProps={{ title: { variant: 'h6' } }}
        onClick={() => setOpen((current) => !current)}
        sx={{ cursor: 'pointer' }}
        avatar={
          open ? <CippIcons.ExpandMore /> : <CippIcons.KeyboardArrowRight />
        }
        action={
          <Button
            variant="outlined"
            size="small"
            startIcon={<CippIcons.Add />}
            disabled={!platform}
            onClick={(event) => {
              event.stopPropagation()
              setPickerOpen(true)
            }}
          >
            Add setting
          </Button>
        }
      />
      <Collapse in={open || settings.length === 0} unmountOnExit>
        <CardContent>
          {settings.length === 0 ? (
            <Alert severity="info">{emptyText}</Alert>
          ) : (
            <List dense disablePadding>
              {settings.map((setting, index) => {
                const instance = setting?.settingInstance
                const definitionId = instance?.settingDefinitionId
                const definition = getDefinition(definitionId)
                const rows = instance?.groupSettingCollectionValue ?? []
                return (
                  <ListItem
                    key={`${definitionId}-${index}`}
                    divider
                    secondaryAction={
                      <Tooltip title="Remove this setting">
                        <IconButton
                          edge="end"
                          size="small"
                          color="error"
                          onClick={() => removeSetting(index)}
                        >
                          <CippIcons.Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={definition?.displayName || definitionId}
                      secondary={
                        <Box component="span" sx={{ display: 'block' }}>
                          <Typography
                            variant="caption"
                            component="span"
                            sx={{
                              color: 'text.secondary',
                              wordBreak: 'break-all',
                            }}
                          >
                            {definition?.categoryName || definitionId}
                          </Typography>
                          {isGroupCollectionInstance(instance) && (
                            <Stack
                              direction="row"
                              spacing={1}
                              useFlexGap
                              component="span"
                              sx={{
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                mt: 0.5,
                              }}
                            >
                              <Typography variant="caption" component="span">
                                {rows.length} row(s)
                              </Typography>
                              <Button
                                size="small"
                                disabled={
                                  !canAddCollectionEntry(
                                    definition,
                                    rows.length
                                  )
                                }
                                onClick={() => addGroupRow(index)}
                              >
                                Add row
                              </Button>
                              {rows.map((_, rowIndex) => (
                                <Button
                                  key={rowIndex}
                                  size="small"
                                  color="error"
                                  disabled={
                                    !canRemoveCollectionEntry(
                                      definition,
                                      rows.length
                                    )
                                  }
                                  onClick={() =>
                                    removeGroupRow(index, rowIndex)
                                  }
                                >
                                  Remove row {rowIndex + 1}
                                </Button>
                              ))}
                            </Stack>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                )
              })}
            </List>
          )}
        </CardContent>
      </Collapse>

      <CippIntuneSettingPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={(definition, children, wanted) => {
          const added = addSetting(definition, children, wanted)
          if (added) setPickerOpen(false)
          return added
        }}
        platform={platform}
        technology={technology}
        existingIds={collectSettingDefinitionIds(policy)}
      />
    </Card>
  )
}

export default CippIntunePolicySettingsCard
