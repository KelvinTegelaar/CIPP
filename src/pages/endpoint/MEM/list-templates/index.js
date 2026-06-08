import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Edit, GitHub, LocalOffer, LocalOfferOutlined, CopyAll } from '@mui/icons-material'
import CippJsonView from '../../../../components/CippFormPages/CippJSONView'
import { ApiGetCall } from '../../../../api/ApiCall'
import { CippPolicyImportDrawer } from '../../../../components/CippComponents/CippPolicyImportDrawer.jsx'
import { PermissionButton } from '../../../../utils/permissions.js'
import {
  Box,
  Chip,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import NextLink from 'next/link'

const Page = () => {
  const pageTitle = 'Available Endpoint Manager Templates'
  const cardButtonPermissions = ['Endpoint.MEM.ReadWrite']

  const integrations = ApiGetCall({
    url: '/api/ListExtensionsConfig',
    queryKey: 'Integrations',
    refetchOnMount: false,
    refetchOnReconnect: false,
  })
  const actions = [
    {
      label: 'Edit Template',
      link: `/endpoint/MEM/list-templates/edit?id=[GUID]`,
      icon: <Edit />,
      color: 'info',
      condition: (row) => row.isSynced === false,
    },
    {
      label: 'Edit Template Name and Description',
      type: 'POST',
      url: '/api/ExecEditTemplate',
      fields: [
        {
          type: 'textField',
          name: 'displayName',
          label: 'Display Name',
        },
        {
          type: 'textField',
          name: 'description',
          label: 'Description',
        },
      ],
      data: { GUID: 'GUID', Type: '!IntuneTemplate' },
      defaultvalues: (row) => ({
        displayName: row.displayName,
        description: row.description,
      }),
      confirmText:
        'Enter the new name and description for the template. Warning: This will disconnect the template from a template library if applied.',
      multiPost: false,
      icon: <PencilIcon />,
      color: 'info',
    },
    {
      label: 'Clone Template',
      type: 'POST',
      url: '/api/ExecCloneTemplate',
      data: { GUID: 'GUID', Type: '!IntuneTemplate' },
      confirmText:
        'Are you sure you want to clone [displayName]? Cloned template are no longer synced with a template library.',
      multiPost: false,
      icon: <CopyAll />,
      color: 'info',
    },
    {
      label: 'Add to package',
      type: 'POST',
      url: '/api/ExecSetPackageTag',
      data: { GUID: 'GUID' },
      fields: [
        {
          type: 'textField',
          name: 'Package',
          label: 'Package Name',
          required: true,
          validators: {
            required: { value: true, message: 'Package name is required' },
          },
        },
      ],
      confirmText: 'Enter the package name to assign to the selected template(s).',
      multiPost: true,
      icon: <LocalOffer />,
      color: 'info',
    },
    {
      label: 'Remove from package',
      type: 'POST',
      url: '/api/ExecSetPackageTag',
      data: { GUID: 'GUID', Remove: true },
      confirmText: 'Are you sure you want to remove the selected template(s) from their package?',
      multiPost: true,
      icon: <LocalOfferOutlined />,
      color: 'warning',
    },
    {
      label: 'Save to GitHub',
      type: 'POST',
      url: '/api/ExecCommunityRepo',
      icon: <GitHub />,
      data: {
        Action: 'UploadTemplate',
        GUID: 'GUID',
      },
      fields: [
        {
          label: 'Repository',
          name: 'FullName',
          type: 'select',
          api: {
            url: '/api/ListCommunityRepos',
            data: {
              WriteAccess: true,
            },
            queryKey: 'CommunityRepos-Write',
            dataKey: 'Results',
            valueField: 'FullName',
            labelField: 'FullName',
          },
          multiple: false,
          creatable: false,
          required: true,
          validators: {
            required: { value: true, message: 'This field is required' },
          },
        },
        {
          label: 'Commit Message',
          placeholder: 'Enter a commit message for adding this file to GitHub',
          name: 'Message',
          type: 'textField',
          multiline: true,
          required: true,
          rows: 4,
        },
      ],
      confirmText: 'Are you sure you want to save this template to the selected repository?',
      condition: () => integrations.isSuccess && integrations?.data?.GitHub?.Enabled,
    },
    {
      label: 'Delete Template',
      type: 'POST',
      url: '/api/RemoveIntuneTemplate',
      data: { ID: 'GUID' },
      confirmText: 'Do you want to delete the template?',
      multiPost: false,
      icon: <TrashIcon />,
      color: 'danger',
    },
  ]

  const offCanvas = {
    children: (row) => (
      <Stack spacing={2} sx={{ p: 2 }}>
        {Array.isArray(row.usage) && row.usage.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'text.secondary',
                letterSpacing: 0.5,
              }}
            >
              Used in Standards Templates
            </Typography>
            <Table size="small" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Template Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Included In</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {row.usage.map((u, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Link
                        component={NextLink}
                        href={
                          u.cippLink ?? `/tenant/standards/templates/template?id=${u.templateId}`
                        }
                        underline="hover"
                      >
                        {u.templateName ?? u.templateId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {u.matchType === 'package' ? (
                        <Tooltip title={`Included via package tag "${u.package}"`} arrow>
                          <Chip
                            label={u.package}
                            size="small"
                            color="warning"
                            icon={<LocalOffer style={{ fontSize: 14 }} />}
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip
                          title="This template is directly referenced by GUID in the standards template"
                          arrow
                        >
                          <Chip label="Direct" size="small" variant="outlined" />
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
        <CippJsonView object={row} type={'intune'} defaultOpen={true} />
      </Stack>
    ),
    size: 'lg',
  }

  const simpleColumns = ['displayName', 'isSynced', 'package', 'description', 'Type', 'usage']

  const filterList = [
    {
      filterName: 'Synced Templates',
      value: [{ id: 'isSynced', value: 'Yes' }],
      type: 'column',
    },
    {
      filterName: 'Custom Templates',
      value: [{ id: 'isSynced', value: 'No' }],
      type: 'column',
    },
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListIntuneTemplates?View=true"
        tenantInTitle={false}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        filters={filterList}
        queryKey="ListIntuneTemplates-table"
        cardButton={
          <CippPolicyImportDrawer
            buttonText="Browse Catalog"
            requiredPermissions={cardButtonPermissions}
            PermissionButton={PermissionButton}
            mode="Intune"
          />
        }
      />
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>
export default Page
