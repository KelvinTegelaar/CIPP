import { useMemo, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { CippAutoComplete } from './CippAutocomplete'
import { CippApiResults } from './CippApiResults'

// Both template types store "package" as a free-text tag on the template row, and both list
// endpoints already expose the same ?mode=Tag shape (label/value/templateCount/templates) that
// the Standards Template builder uses for its "select a package" pickers. One component reused
// across both types avoids building two near-identical package management screens.
const TEMPLATE_TYPES = {
  CA: {
    label: 'Conditional Access Templates',
    listUrl: '/api/ListCATemplates',
    queryKeyBase: 'ListCATemplates',
    displayField: 'displayName',
  },
  Intune: {
    label: 'Policy Templates',
    listUrl: '/api/ListIntuneTemplates',
    queryKeyBase: 'ListIntuneTemplates',
    displayField: 'Displayname',
  },
}

const getDisplayName = (tpl, typeConfig) =>
  tpl?.[typeConfig.displayField] || tpl?.displayName || tpl?.Displayname || tpl?.GUID

export const CippTemplatePackageManager = () => {
  const [activeTypeKey, setActiveTypeKey] = useState('CA')
  const typeConfig = TEMPLATE_TYPES[activeTypeKey]

  const [renameTarget, setRenameTarget] = useState(null) // { value, templates }
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null) // { value, templates }
  const [addMemberTarget, setAddMemberTarget] = useState(null) // package value
  const [addMemberSelection, setAddMemberSelection] = useState(null)

  const relatedQueryKeys = [
    `${typeConfig.queryKeyBase}-tag-packagemanager`,
    `${typeConfig.queryKeyBase}-packagemanager-all`,
  ]

  const packages = ApiGetCall({
    url: `${typeConfig.listUrl}${typeConfig.listUrl.includes('?') ? '&' : '?'}mode=Tag`,
    queryKey: `${typeConfig.queryKeyBase}-tag-packagemanager`,
  })

  const allTemplates = ApiGetCall({
    url: typeConfig.listUrl,
    queryKey: `${typeConfig.queryKeyBase}-packagemanager-all`,
  })

  const renameMutation = ApiPostCall({ urlFromData: true, relatedQueryKeys })
  const deleteMutation = ApiPostCall({ urlFromData: true, relatedQueryKeys })
  const addMemberMutation = ApiPostCall({ urlFromData: true, relatedQueryKeys })
  const removeMemberMutation = ApiPostCall({ urlFromData: true, relatedQueryKeys })

  const packageList = Array.isArray(packages.data) ? packages.data : []

  const allTemplateOptions = useMemo(() => {
    if (!Array.isArray(allTemplates.data)) return []
    return allTemplates.data.map((tpl) => ({
      label: getDisplayName(tpl, typeConfig),
      value: tpl.GUID,
      package: tpl.package,
    }))
  }, [allTemplates.data, typeConfig])

  const getAddMemberOptions = (pkgValue) =>
    allTemplateOptions.filter((option) => option.package !== pkgValue)

  const handleTypeChange = (event, newType) => {
    if (!newType) return
    setActiveTypeKey(newType)
  }

  return (
    <Stack spacing={2}>
      <ToggleButtonGroup
        color="primary"
        exclusive
        value={activeTypeKey}
        onChange={handleTypeChange}
        size="small"
      >
        {Object.entries(TEMPLATE_TYPES).map(([key, cfg]) => (
          <ToggleButton key={key} value={key}>
            {cfg.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {packages.isLoading && (
        <Stack spacing={1}>
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
        </Stack>
      )}

      {packages.isSuccess && packageList.length === 0 && (
        <Typography variant="body2" sx={{
          color: "text.secondary"
        }}>
          No packages yet for {typeConfig.label.toLowerCase()}. Use the "Add to package" action on
          the template list to create one.
        </Typography>
      )}

      {packages.isSuccess &&
        packageList.map((pkg) => (
          <Accordion key={pkg.value} disableGutters>
            <AccordionSummary expandIcon={<CippIcons.ExpandMore />}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: '100%',
                  pr: 1
                }}>
                <Stack direction="row" spacing={1} sx={{
                  alignItems: "center"
                }}>
                  <CippIcons.LocalOffer fontSize="small" color="action" />
                  <Typography variant="subtitle1">{pkg.value}</Typography>
                  <Chip size="small" label={`${pkg.templateCount} templates`} />
                </Stack>
                <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Rename package">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setRenameTarget(pkg)
                        setRenameValue(pkg.value)
                      }}
                    >
                      <CippIcons.DriveFileRenameOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete package">
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(pkg)}>
                      <CippIcons.Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} sx={{
                  alignItems: "center"
                }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <CippAutoComplete
                      size="small"
                      multiple={false}
                      creatable={false}
                      label="Add an existing template to this package"
                      placeholder="Select a template"
                      value={addMemberTarget === pkg.value ? addMemberSelection : null}
                      onChange={(value) => {
                        setAddMemberTarget(pkg.value)
                        setAddMemberSelection(value)
                      }}
                      options={getAddMemberOptions(pkg.value)}
                      isFetching={allTemplates.isFetching}
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<CippIcons.Add />}
                    disabled={
                      addMemberTarget !== pkg.value ||
                      !addMemberSelection?.value ||
                      addMemberMutation.isPending
                    }
                    onClick={() =>
                      addMemberMutation.mutate(
                        {
                          url: '/api/ExecSetPackageTag',
                          data: { GUID: [addMemberSelection.value], Package: pkg.value },
                        },
                        { onSuccess: () => setAddMemberSelection(null) }
                      )
                    }
                  >
                    Add
                  </Button>
                </Stack>

                <Divider />

                <Stack spacing={1}>
                  {pkg.templates.map((tpl) => (
                    <Stack
                      key={tpl.GUID}
                      direction="row"
                      sx={{
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}>
                      <Typography variant="body2">{getDisplayName(tpl, typeConfig)}</Typography>
                      <Tooltip title="Remove from package">
                        <IconButton
                          size="small"
                          onClick={() =>
                            removeMemberMutation.mutate({
                              url: '/api/ExecSetPackageTag',
                              data: { GUID: [tpl.GUID], Remove: true },
                            })
                          }
                        >
                          <CippIcons.Close fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}

      <CippApiResults apiObject={addMemberMutation} />
      <CippApiResults apiObject={removeMemberMutation} />

      {/* Rename package dialog */}
      <Dialog fullWidth maxWidth="sm" open={!!renameTarget} onClose={() => setRenameTarget(null)}>
        <DialogTitle>Rename Package</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{
              color: "text.secondary"
            }}>
              Renames the package tag on all {renameTarget?.templateCount} member template(s).
            </Typography>
            <CippAutoComplete
              size="small"
              multiple={false}
              creatable={true}
              label="New package name"
              placeholder="Type a new name, or pick an existing package to merge into it"
              value={{ label: renameValue, value: renameValue }}
              onChange={(value) => setRenameValue(value?.value ?? '')}
              options={packageList
                .filter((p) => p.value !== renameTarget?.value)
                .map((p) => ({ label: p.value, value: p.value }))}
            />
          </Stack>
          <CippApiResults apiObject={renameMutation} />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setRenameTarget(null)} startIcon={<CippIcons.Close />}>
            Close
          </Button>
          <Button
            variant="contained"
            disabled={
              !renameValue ||
              renameValue === renameTarget?.value ||
              renameMutation.isPending
            }
            onClick={() =>
              renameMutation.mutate({
                url: '/api/ExecSetPackageTag',
                data: {
                  GUID: renameTarget.templates.map((tpl) => tpl.GUID),
                  Package: renameValue,
                },
              })
            }
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete package dialog */}
      <Dialog fullWidth maxWidth="sm" open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Package</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete the package '{deleteTarget?.value}'? Its{' '}
            {deleteTarget?.templateCount} member template(s) are not deleted — they are just
            removed from the package.
          </Typography>
          <CippApiResults apiObject={deleteMutation} />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDeleteTarget(null)} startIcon={<CippIcons.Close />}>
            Close
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            onClick={() =>
              deleteMutation.mutate({
                url: '/api/ExecSetPackageTag',
                data: {
                  GUID: deleteTarget.templates.map((tpl) => tpl.GUID),
                  Remove: true,
                },
              })
            }
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
