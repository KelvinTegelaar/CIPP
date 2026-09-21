import { useEffect } from 'react'
import { Box, FormControlLabel, Stack, Switch, Tooltip } from '@mui/material'
import CippFormComponent from './CippFormComponent'
import { useWatch } from 'react-hook-form'
import { GroupHeader, GroupItems } from './CippAutocompleteGrouping'

const CippContactPermissionsDialog = ({
  formHook,
  combinedOptions,
  isUserGroupLoading,
  includeGroups,
  onIncludeGroupsChange,
}) => {
  const permissionLevel = useWatch({
    control: formHook.control,
    name: 'Permissions',
  })

  // default SendNotificationToUser to false on mount
  useEffect(() => {
    formHook.setValue('SendNotificationToUser', false)
  }, [formHook])

  // Only certain permission levels support sending a notification when contact permissions are added
  const notifyAllowed = ['AvailabilityOnly', 'LimitedDetails', 'Reviewer', 'Editor']
  const isNotifyAllowed = notifyAllowed.includes(permissionLevel?.value ?? permissionLevel)

  return (
    <Stack spacing={3} sx={{ mt: 1 }}>
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
          label="Add Access"
          name="UserToGetPermissions"
          multiple={true}
          formControl={formHook}
          isFetching={isUserGroupLoading}
          options={combinedOptions}
          groupBy={(option) => option.group}
          renderGroup={(params) => (
            <li key={params.key}>
              <GroupHeader>{params.group}</GroupHeader>
              <GroupItems>{params.children}</GroupItems>
            </li>
          )}
          creatable={false}
          validators={{ required: 'Select a user or group to assign permissions to' }}
          placeholder="Select a user or group to assign permissions to"
        />
      </Box>
      <Box>
        <CippFormComponent
          type="autoComplete"
          label="Permission Level"
          name="Permissions"
          creatable={false}
          validators={{
            validate: (value) => (value ? true : 'Select the permission level for the contact'),
          }}
          options={[
            { value: 'Author', label: 'Author' },
            { value: 'Contributor', label: 'Contributor' },
            { value: 'Editor', label: 'Editor' },
            { value: 'Owner', label: 'Owner' },
            { value: 'NonEditingAuthor', label: 'Non Editing Author' },
            { value: 'PublishingAuthor', label: 'Publishing Author' },
            { value: 'PublishingEditor', label: 'Publishing Editor' },
            { value: 'Reviewer', label: 'Reviewer' },
            { value: 'LimitedDetails', label: 'Limited Details' },
            { value: 'AvailabilityOnly', label: 'Availability Only' },
            { value: 'None', label: 'None' },
          ]}
          multiple={false}
          formControl={formHook}
        />
      </Box>

      <Box>
        <Tooltip
          title={
            !isNotifyAllowed
              ? `Send notification is only supported for: ${notifyAllowed.join(', ')}`
              : ''
          }
          followCursor
          placement="right"
        >
          <span>
            <CippFormComponent
              type="switch"
              label="Send notification"
              name="SendNotificationToUser"
              formControl={formHook}
              disabled={!isNotifyAllowed}
              sx={{ ml: 1.5, mt: 0, mb: 0 }}
            />
          </span>
        </Tooltip>
      </Box>
    </Stack>
  )
}

export default CippContactPermissionsDialog
