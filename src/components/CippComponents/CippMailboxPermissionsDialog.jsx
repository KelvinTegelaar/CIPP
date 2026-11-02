import { Box, FormControlLabel, Stack, Switch } from '@mui/material'
import { useEffect } from 'react'
import CippFormComponent from './CippFormComponent'
import { useWatch } from 'react-hook-form'
import { GroupHeader, GroupItems } from './CippAutocompleteGrouping'

const CippMailboxPermissionsDialog = ({
  formHook,
  combinedOptions,
  isUserGroupLoading,
  includeGroups,
  onIncludeGroupsChange,
  defaultAutoMap = false,
}) => {
  const fullAccess = useWatch({
    control: formHook.control,
    name: 'permissions.AddFullAccess',
  })

  // Set the default AutoMap value when component mounts
  useEffect(() => {
    formHook.setValue('permissions.AutoMap', defaultAutoMap)
  }, [formHook, defaultAutoMap])

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <FormControlLabel
        control={
          <Switch
            checked={includeGroups}
            onChange={(_, checked) => onIncludeGroupsChange(checked)}
          />
        }
        label="Include mail-enabled security groups"
      />
      <Box>
        <CippFormComponent
          type="autoComplete"
          label="Add Full Access"
          name="permissions.AddFullAccess"
          formControl={formHook}
          isFetching={isUserGroupLoading}
          creatable={false}
          options={combinedOptions}
          groupBy={(option) => option.group}
          renderGroup={(params) => (
            <li key={params.key}>
              <GroupHeader>{params.group}</GroupHeader>
              <GroupItems>{params.children}</GroupItems>
            </li>
          )}
        />
      </Box>
      <Box>
        <CippFormComponent
          type="switch"
          label="Enable Automapping"
          name="permissions.AutoMap"
          formControl={formHook}
          disabled={!fullAccess?.length}
          sx={{ ml: 1.5, mt: 0, mb: 0 }}
        />
      </Box>
      <Box>
        <CippFormComponent
          type="autoComplete"
          label="Add Send-as Permissions"
          name="permissions.AddSendAs"
          formControl={formHook}
          isFetching={isUserGroupLoading}
          creatable={false}
          options={combinedOptions}
          groupBy={(option) => option.group}
          renderGroup={(params) => (
            <li key={params.key}>
              <GroupHeader>{params.group}</GroupHeader>
              <GroupItems>{params.children}</GroupItems>
            </li>
          )}
        />
      </Box>
      <Box>
        <CippFormComponent
          type="autoComplete"
          label="Add Send On Behalf Permissions"
          name="permissions.AddSendOnBehalf"
          formControl={formHook}
          isFetching={isUserGroupLoading}
          creatable={false}
          options={combinedOptions}
          groupBy={(option) => option.group}
          renderGroup={(params) => (
            <li key={params.key}>
              <GroupHeader>{params.group}</GroupHeader>
              <GroupItems>{params.children}</GroupItems>
            </li>
          )}
        />
      </Box>
    </Stack>
  )
}

export default CippMailboxPermissionsDialog
