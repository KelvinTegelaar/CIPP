import { useEffect, useState } from "react";
import { Box, Button, Divider, Typography, Alert } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm } from "react-hook-form";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { CippFormUserSelector } from "../../../../components/CippComponents/CippFormUserSelector";
import { CippFormUserAndGroupSelector } from "../../../../components/CippComponents/CippFormUserAndGroupSelector";
import { useRouter } from "next/router";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useSettings } from "../../../../hooks/use-settings";
import { CippFormContactSelector } from "../../../../components/CippComponents/CippFormContactSelector";
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";
import { CippFormLicenseSelector } from '../../../../components/CippComponents/CippFormLicenseSelector'
import { getCippLicenseTranslation } from '../../../../utils/get-cipp-license-translation'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog'
import CippAliasDialog from '../../../../components/CippComponents/CippAliasDialog'
import { useDialog } from '../../../../hooks/use-dialog'
import { CippIcons } from '../../../../utils/icon-registry'

const memberTypes = {
  '#microsoft.graph.group': 'Group',
  '#microsoft.graph.device': 'Device',
  '#microsoft.graph.orgContact': 'Contact',
  '#microsoft.graph.servicePrincipal': 'Service Principal',
}
const memberType = (member) => memberTypes[member?.['@odata.type']] ?? 'Member'

// Address changes apply immediately through row actions rather than on Submit, so the list loads
// under its own query key: refetching the page's ListGroups query resets the form and would
// discard whatever else the operator has edited but not yet saved.
const GroupEmailAddresses = ({ groupId, groupType, groupName, tenantFilter }) => {
  const aliasDialog = useDialog()
  const queryKey = `GroupEmailAddresses-${tenantFilter}-${groupId}`
  const addresses = ApiGetCall({
    url: `/api/ListGroups?groupID=${groupId}&tenantFilter=${tenantFilter}&groupType=${groupType}`,
    queryKey,
  })
  // Exchange marks the primary address with an upper-case SMTP: prefix and aliases with smtp:
  const rows = (addresses.data?.emailAddresses ?? [])
    .filter((address) => /^smtp:/i.test(address))
    .map((address) => ({
      Address: address.slice(5),
      Type: address.startsWith('SMTP:') ? 'Primary' : 'Alias',
    }))
    .sort((a, b) => (a.Type === b.Type ? 0 : a.Type === 'Primary' ? -1 : 1))

  const group = { groupId, groupType, groupName, tenantFilter }
  const api = { type: 'POST', url: '/api/EditGroup', multiPost: false, relatedQueryKeys: [queryKey] }
  const actions = [
    {
      ...api,
      label: 'Make Primary',
      icon: <CippIcons.Star />,
      data: { ...group, PrimarySmtpAddress: 'Address' },
      confirmText:
        'Make [Address] the primary email address of this group? The current primary address is kept as an alias.',
      condition: (row) => row?.Type === 'Alias',
    },
    {
      ...api,
      label: 'Remove Alias',
      icon: <CippIcons.Delete />,
      data: { ...group, RemovedAliases: 'Address' },
      confirmText: 'Remove the alias [Address] from this group?',
      condition: (row) => row?.Type === 'Alias',
    },
  ]

  return (
    <>
      <CippDataTable
        title="Email Addresses"
        data={rows}
        isFetching={addresses.isFetching}
        simpleColumns={['Address', 'Type']}
        actions={actions}
        refreshFunction={addresses.refetch}
        cardButton={
          <Button
            startIcon={<CippIcons.AlternateEmail />}
            onClick={() => aliasDialog.handleOpen()}
            variant="outlined"
            size="small"
          >
            Add Alias
          </Button>
        }
      />
      <CippApiDialog
        createDialog={aliasDialog}
        title="Add Aliases"
        row={group}
        api={{
          ...api,
          confirmText: 'Add the specified aliases to this group?',
          customDataformatter: (row, action, formData) => ({
            ...group,
            AddedAliases: formData?.AddedAliases ?? [],
          }),
        }}
      >
        {({ formHook }) => <CippAliasDialog formHook={formHook} target="group" />}
      </CippApiDialog>
    </>
  )
}

const EditGroup = () => {
  const router = useRouter()
  const { groupId, groupType } = router.query
  const [groupIdReady, setGroupIdReady] = useState(false)
  const [showMembershipTable, setShowMembershipTable] = useState(false)
  const [combinedData, setCombinedData] = useState([])
  const [initialValues, setInitialValues] = useState({})
  const tenantFilter = useSettings().currentTenant

  const groupInfo = ApiGetCall({
    url: `/api/ListGroups?groupID=${groupId}&tenantFilter=${tenantFilter}&members=true&owners=true&sendPermissions=true&groupType=${groupType}`,
    queryKey: `ListGroups-${groupId}`,
    waiting: groupIdReady,
  })

  useEffect(() => {
    if (groupId) {
      setGroupIdReady(true)
      groupInfo.refetch()
    }
  }, [router.query, groupId, tenantFilter])

  const formControl = useForm({
    mode: 'onChange',
    defaultValues: {
      tenantFilter: tenantFilter,
      AddMember: [],
      RemoveMember: [],
      AddOwner: [],
      RemoveOwner: [],
      AddContact: [],
      RemoveContact: [],
      AddDevice: [],
      RemoveDevice: [],
      AddLicenses: [],
      RemoveLicenses: [],
      AddSendAs: [],
      RemoveSendAs: [],
      AddSendOnBehalf: [],
      RemoveSendOnBehalf: [],
      visibility: 'Public',
    },
  })

  useEffect(() => {
    if (groupInfo.isSuccess) {
      const group = groupInfo.data?.groupInfo
      if (group) {
        // Create combined data for the table
        const combinedData = [
          ...(groupInfo.data?.owners?.map((o) => ({
            type: 'Owner',
            userPrincipalName: o.userPrincipalName,
            displayName: o.displayName,
          })) || []),
          ...(groupInfo.data?.members?.map((m) => ({
            type: memberType(m),
            userPrincipalName: m.userPrincipalName ?? m.mail,
            displayName: m.displayName,
          })) || []),
        ]
        setCombinedData(combinedData)

        // Create initial values object
        const formValues = {
          tenantFilter: tenantFilter,
          mail: group.mail,
          mailNickname: group.mailNickname || '',
          allowExternal: groupInfo?.data?.allowExternal,
          sendCopies: groupInfo?.data?.sendCopies,
          hideFromOutlookClients: groupInfo?.data?.hideFromOutlookClients,
          visibility: group?.visibility ?? 'Public',
          displayName: group.displayName,
          description: group.description || '',
          membershipRules: group.membershipRule || '',
          groupId: group.id,
          groupType: (() => {
            if (group.groupTypes?.includes('Unified')) {
              return 'Microsoft 365'
            }
            if (!group.mailEnabled && group.securityEnabled) {
              return 'Security'
            }
            if (group.mailEnabled && group.securityEnabled) {
              return 'Mail-Enabled Security'
            }

            if (
              (!group.groupTypes || group.groupTypes.length === 0) &&
              group.mailEnabled &&
              !group.securityEnabled
            ) {
              return 'Distribution List'
            }
            return null
          })(),
          securityEnabled: group.securityEnabled,
          // Initialize empty arrays for add/remove actions
          AddMember: [],
          RemoveMember: [],
          AddOwner: [],
          RemoveOwner: [],
          AddContact: [],
          RemoveContact: [],
          AddDevice: [],
          RemoveDevice: [],
          AddLicenses: [],
          RemoveLicenses: [],
          AddSendAs: [],
          RemoveSendAs: [],
          AddSendOnBehalf: [],
          RemoveSendOnBehalf: [],
        }

        // Store initial values for comparison
        setInitialValues({
          allowExternal: groupInfo?.data?.allowExternal,
          sendCopies: groupInfo?.data?.sendCopies,
          hideFromOutlookClients: groupInfo?.data?.hideFromOutlookClients,
          securityEnabled: group.securityEnabled,
          visibility: group.visibility ?? 'Public',
        })

        // Reset the form with all values
        formControl.reset(formValues)
      }
    }
  }, [groupInfo.isSuccess, router.query, groupInfo.isFetching])

  // Custom data formatter to only send changed values
  const customDataFormatter = (formData) => {
    const cleanedData = { ...formData }

    // Properties that should only be sent if they've changed from initial values
    const changeDetectionProperties = [
      'allowExternal',
      'sendCopies',
      'hideFromOutlookClients',
      'securityEnabled',
      'visibility',
    ]

    changeDetectionProperties.forEach((property) => {
      if (formData[property] === initialValues[property]) {
        delete cleanedData[property]
      }
    })

    return cleanedData
  }

  return (
    <>
      <CippFormPage
        formControl={formControl}
        queryKey={[`ListGroups-${groupId}`, `Licenses-${tenantFilter}`]}
        title={
          groupInfo.data?.groupInfo?.displayName
            ? `Group - ${groupInfo.data.groupInfo.displayName}`
            : 'Group'
        }
        formPageType="Edit"
        hideSubmit={!groupId}
        backButtonTitle="Group Overview"
        postUrl="/api/EditGroup"
        customDataformatter={customDataFormatter}
        titleButton={
          <>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setShowMembershipTable(!showMembershipTable)}
              sx={{ mb: 2 }}
            >
              {showMembershipTable ? 'Edit Membership' : 'View members'}
            </Button>
          </>
        }
      >
        {!groupId && (
          <Alert severity="info" sx={{ mb: 1 }}>
            No group selected. Open this page from the Groups list to edit a group.
          </Alert>
        )}
        {groupInfo.isSuccess && groupInfo.data?.groupInfo?.onPremisesSyncEnabled && (
          <Alert severity="error" sx={{ mb: 1 }}>
            This group is synced from on-premises Active Directory. Changes should be made in the
            on-premises environment instead.
          </Alert>
        )}
        {groupId &&
          (showMembershipTable ? (
          <Box sx={{ my: 2 }}>
            <CippDataTable
              data={combinedData}
              isFetching={groupInfo.isFetching}
              simpleColumns={['type', 'userPrincipalName', 'displayName']}
              refreshFunction={groupInfo.refetch}
            />
          </Box>
        ) : (
          <Box sx={{ my: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6">Group Properties</Typography>
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Display Name"
                  name="displayName"
                  formControl={formControl}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Description"
                  name="description"
                  formControl={formControl}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Mail Nickname"
                  name="mailNickname"
                  formControl={formControl}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                />
              </Grid>

              {groupInfo.data?.groupInfo?.groupTypes?.includes('DynamicMembership') && (
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="textField"
                    fullWidth
                    label="Membership Rules"
                    name="membershipRules"
                    formControl={formControl}
                    isFetching={groupInfo.isFetching}
                    disabled={groupInfo.isFetching}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Add Members</Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CippFormUserAndGroupSelector
                  formControl={formControl}
                  name="AddMember"
                  label="Add Members (Users or Groups)"
                  multiple={true}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                  addedField={{
                    id: 'id',
                    displayName: 'displayName',
                    userPrincipalName: 'userPrincipalName',
                  }}
                  dataFilter={(option) =>
                    !groupInfo.data?.members?.some((m) => m.id === option.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CippFormUserSelector
                  formControl={formControl}
                  name="AddOwner"
                  label="Add Owners"
                  multiple={true}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                  addedField={{
                    id: 'id',
                    displayName: 'displayName',
                    userPrincipalName: 'userPrincipalName',
                  }}
                  dataFilter={(option) =>
                    !groupInfo.data?.owners?.some((o) => o.id === option.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CippFormContactSelector
                  formControl={formControl}
                  name="AddContact"
                  label="Add Contacts"
                  multiple={true}
                  addedField={{
                    id: 'Guid',
                    displayName: 'displayName',
                    WindowsEmailAddress: 'WindowsEmailAddress',
                  }}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                  dataFilter={(option) =>
                    !groupInfo.data?.members
                      ?.filter((m) => m?.['@odata.type'] === '#microsoft.graph.orgContact')
                      ?.some((c) => c.id === option.value)
                  }
                />
              </Grid>

              {groupType !== 'Distribution List' && groupType !== 'Mail-Enabled Security' && (
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="autoComplete"
                    name="AddDevice"
                    label="Add Devices"
                    formControl={formControl}
                    multiple={true}
                    creatable={false}
                    isFetching={groupInfo.isFetching}
                    disabled={groupInfo.isFetching}
                    api={{
                      url: '/api/ListGraphRequest',
                      dataKey: 'Results',
                      data: {
                        Endpoint: 'devices',
                        manualPagination: true,
                        $select: 'id,displayName,operatingSystem',
                        $count: true,
                        $orderby: 'displayName',
                        $top: 999,
                      },
                      labelField: (option) =>
                        option?.operatingSystem
                          ? `${option.displayName} (${option.operatingSystem})`
                          : (option?.displayName ?? ''),
                      valueField: 'id',
                      addedField: {
                        displayName: 'displayName',
                      },
                      queryKey: `ListDevices-${tenantFilter}`,
                      dataFilter: (options) =>
                        options.filter(
                          (option) => !groupInfo.data?.members?.some((m) => m.id === option.value)
                        ),
                      showRefresh: true,
                    }}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Remove Members</Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="autoComplete"
                  name="RemoveMember"
                  label="Remove Members (Users or Groups)"
                  formControl={formControl}
                  multiple={true}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                  options={
                    groupInfo.data?.members
                      ?.filter((m) => !['Contact', 'Device'].includes(memberType(m)))
                      ?.map((m) => {
                        const type =
                          memberType(m) !== 'Group'
                            ? memberType(m)
                            : m.mailEnabled && !m.securityEnabled
                              ? 'Distribution Group'
                              : m.mailEnabled && m.securityEnabled
                                ? 'Mail-Enabled Security Group'
                                : 'Security Group'
                        return {
                          label: `${m.displayName} (${m.userPrincipalName || type})`,
                          value: m.id,
                          addedFields: {
                            userPrincipalName: m.userPrincipalName,
                            displayName: m.displayName,
                            id: m.id,
                          },
                        }
                      }) || []
                  }
                  sortOptions={true}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="autoComplete"
                  name="RemoveOwner"
                  label="Remove Owners"
                  formControl={formControl}
                  multiple={true}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                  options={
                    groupInfo.data?.owners?.map((o) => ({
                      label: `${o.displayName} (${o.userPrincipalName})`,
                      value: o.id,
                      addedFields: {
                        userPrincipalName: o.userPrincipalName,
                        displayName: o.displayName,
                        id: o.id,
                      },
                    })) || []
                  }
                  sortOptions={true}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="autoComplete"
                  name="RemoveContact"
                  label="Remove Contacts"
                  formControl={formControl}
                  multiple={true}
                  isFetching={groupInfo.isFetching}
                  disabled={groupInfo.isFetching}
                  options={
                    groupInfo.data?.members
                      ?.filter((m) => m?.['@odata.type'] === '#microsoft.graph.orgContact')
                      ?.map((m) => ({
                        label: `${m.displayName} (${m.mail})`,
                        value: m.mail,
                        addedFields: { id: m.id },
                      })) || []
                  }
                  sortOptions={true}
                />
              </Grid>

              {groupType !== 'Distribution List' && groupType !== 'Mail-Enabled Security' && (
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="autoComplete"
                    name="RemoveDevice"
                    label="Remove Devices"
                    formControl={formControl}
                    multiple={true}
                    creatable={false}
                    isFetching={groupInfo.isFetching}
                    disabled={groupInfo.isFetching}
                    options={
                      groupInfo.data?.members
                        ?.filter((m) => memberType(m) === 'Device')
                        ?.map((m) => ({
                          label: m.operatingSystem
                            ? `${m.displayName} (${m.operatingSystem})`
                            : m.displayName,
                          value: m.id,
                          addedFields: { displayName: m.displayName },
                        })) || []
                    }
                    sortOptions={true}
                  />
                </Grid>
              )}

              {['Distribution List', 'Mail-Enabled Security', 'Microsoft 365'].includes(groupType) && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6">Send Permissions</Typography>
                  </Grid>

                  <Grid size={{ md: 6, xs: 12 }}>
                    <CippFormUserSelector
                      formControl={formControl}
                      name="AddSendAs"
                      label="Add Send As"
                      multiple={true}
                      isFetching={groupInfo.isFetching}
                      disabled={groupInfo.isFetching}
                      addedField={{
                        id: 'id',
                        displayName: 'displayName',
                        userPrincipalName: 'userPrincipalName',
                      }}
                      dataFilter={(option) =>
                        !groupInfo.data?.sendAs?.some(
                          (p) =>
                            p.Trustee?.toLowerCase() ===
                            option.addedFields?.userPrincipalName?.toLowerCase()
                        )
                      }
                    />
                  </Grid>

                  <Grid size={{ md: 6, xs: 12 }}>
                    <CippFormComponent
                      type="autoComplete"
                      name="RemoveSendAs"
                      label="Remove Send As"
                      formControl={formControl}
                      multiple={true}
                      creatable={false}
                      isFetching={groupInfo.isFetching}
                      disabled={groupInfo.isFetching}
                      options={
                        groupInfo.data?.sendAs?.map((p) => ({
                          label: p.Trustee,
                          value: p.Trustee,
                        })) || []
                      }
                      sortOptions={true}
                    />
                  </Grid>

                  <Grid size={{ md: 6, xs: 12 }}>
                    <CippFormUserSelector
                      formControl={formControl}
                      name="AddSendOnBehalf"
                      label="Add Send on Behalf"
                      multiple={true}
                      isFetching={groupInfo.isFetching}
                      disabled={groupInfo.isFetching}
                      addedField={{
                        id: 'id',
                        displayName: 'displayName',
                        userPrincipalName: 'userPrincipalName',
                      }}
                      dataFilter={(option) =>
                        !groupInfo.data?.sendOnBehalf?.some((p) => p.id === option.value)
                      }
                    />
                  </Grid>

                  <Grid size={{ md: 6, xs: 12 }}>
                    <CippFormComponent
                      type="autoComplete"
                      name="RemoveSendOnBehalf"
                      label="Remove Send on Behalf"
                      formControl={formControl}
                      multiple={true}
                      creatable={false}
                      isFetching={groupInfo.isFetching}
                      disabled={groupInfo.isFetching}
                      options={
                        groupInfo.data?.sendOnBehalf?.map((p) => ({
                          label: `${p.displayName} (${p.userPrincipalName ?? p.mail})`,
                          value: p.userPrincipalName ?? p.mail ?? p.id,
                        })) || []
                      }
                      sortOptions={true}
                    />
                  </Grid>
                </>
              )}

              {['Distribution List', 'Mail-Enabled Security', 'Microsoft 365'].includes(groupType) && (
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }} />
                  <GroupEmailAddresses
                    groupId={groupId}
                    groupType={groupType}
                    groupName={groupInfo.data?.groupInfo?.displayName}
                    tenantFilter={tenantFilter}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Group Settings</Typography>
              </Grid>

              {groupType === 'Microsoft 365' && (
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="radio"
                    label="Group visibility"
                    name="visibility"
                    formControl={formControl}
                    isFetching={groupInfo.isFetching}
                    disabled={groupInfo.isFetching}
                    options={[
                      { label: 'Public', value: 'Public' },
                      { label: 'Private', value: 'Private' },
                    ]}
                  />
                </Grid>
              )}

              {(groupType === 'Microsoft 365' || groupType === 'Distribution List') && (
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    label="Let people outside the organization email the group"
                    name="allowExternal"
                    formControl={formControl}
                    isFetching={groupInfo.isFetching}
                    disabled={groupInfo.isFetching}
                  />
                </Grid>
              )}

              {groupType === 'Microsoft 365' && (
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    label="Send Copies of team emails and events to team members inboxes"
                    name="sendCopies"
                    formControl={formControl}
                    isFetching={groupInfo.isFetching}
                    disabled={groupInfo.isFetching}
                  />
                </Grid>
              )}

              {groupType === 'Microsoft 365' && (
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    label="Hide group mailbox from Outlook"
                    name="hideFromOutlookClients"
                    formControl={formControl}
                    isFetching={groupInfo.isFetching}
                    disabled={groupInfo.isFetching}
                  />
                </Grid>
              )}
              {groupType === 'Microsoft 365' && (
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    label="Security Enabled"
                    name="securityEnabled"
                    formControl={formControl}
                    isFetching={groupInfo.isFetching}
                    disabled={groupInfo.isFetching}
                  />
                </Grid>
              )}

              {groupInfo.data?.groupInfo?.securityEnabled && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6">Licenses</Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mb: 1
                      }}>
                      Licenses assigned to this group are automatically applied to all members.
                      Changes can take 2-5 minutes to propagate.
                    </Typography>
                  </Grid>

                  {groupInfo.data?.groupInfo?.assignedLicenses?.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Currently assigned licenses:
                      </Typography>
                      {groupInfo.data.groupInfo.assignedLicenses.map((lic) => (
                        <Typography key={lic.skuId} variant="body2">
                          - {getCippLicenseTranslation([lic])}
                        </Typography>
                      ))}
                    </Grid>
                  )}

                  <Grid size={{ xs: 12 }}>
                    <CippFormLicenseSelector
                      formControl={formControl}
                      name="AddLicenses"
                      label="Add Licenses"
                      multiple={true}
                      isFetching={groupInfo.isFetching}
                      disabled={groupInfo.isFetching}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <CippFormComponent
                      type="autoComplete"
                      name="RemoveLicenses"
                      label="Remove Licenses"
                      formControl={formControl}
                      multiple={true}
                      creatable={false}
                      isFetching={groupInfo.isFetching}
                      disabled={groupInfo.isFetching}
                      options={
                        groupInfo.data?.groupInfo?.assignedLicenses?.map((lic) => ({
                          label: getCippLicenseTranslation([lic]),
                          value: lic.skuId,
                        })) || []
                      }
                      sortOptions={true}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
          ))}
      </CippFormPage>
    </>
  );
}

EditGroup.getLayout = (page) => <DashboardLayout usesTenant={false}>{page}</DashboardLayout>

export default EditGroup
