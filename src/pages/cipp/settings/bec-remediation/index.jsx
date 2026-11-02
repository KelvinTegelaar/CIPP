import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  Stack,
  SvgIcon,
  Switch,
  Typography,
} from '@mui/material'
import { CippIcons } from '../../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { ApiGetCall, ApiPostCall } from '../../../../api/ApiCall'
import { CippHead } from '../../../../components/CippComponents/CippHead'
import { CippApiResults } from '../../../../components/CippComponents/CippApiResults'

const impactColor = {
  Low: 'default',
  Medium: 'info',
  High: 'warning',
  Critical: 'error',
}

const Page = () => {
  const router = useRouter()
  const [selected, setSelected] = useState({})
  const defaults = ApiGetCall({
    url: '/api/ExecBECRemediationDefaults?List=true',
    queryKey: 'BecRemediationDefaults',
  })
  const save = ApiPostCall({
    relatedQueryKeys: ['BecRemediationDefaults', 'ListBECRemediationActions'],
  })
  const actions = Array.isArray(defaults.data?.Results)
    ? defaults.data.Results
    : []

  useEffect(() => {
    if (!Array.isArray(defaults.data?.Results)) return
    setSelected(
      Object.fromEntries(
        defaults.data.Results.map((a) => [a.Id, !!a.DefaultSelected])
      )
    )
  }, [defaults.data])

  const handleSave = () =>
    save.mutate({
      url: '/api/ExecBECRemediationDefaults',
      data: {
        DefaultActions: actions.filter((a) => selected[a.Id]).map((a) => a.Id),
      },
    })

  return (
    <>
      <CippHead title="BEC Remediation Defaults" noTenant />
      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth="lg">
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={2}
              useFlexGap
              sx={{
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h4">BEC Remediation Defaults</Typography>
              <Button
                size="small"
                startIcon={
                  <SvgIcon fontSize="small">
                    <CippIcons.ArrowLeftIcon />
                  </SvgIcon>
                }
                onClick={() => router.push('/cipp/settings')}
              >
                Settings
              </Button>
            </Stack>
            <Card>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    spacing={2}
                    useFlexGap
                    sx={{
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      Actions switched on here start selected in the BEC
                      containment drawer, and run when remediation is called
                      without a selection. Operators can still change the
                      selection per case.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={
                        save.isPending || !actions.some((a) => selected[a.Id])
                      }
                      startIcon={
                        <SvgIcon fontSize="small">
                          <CippIcons.CheckIcon />
                        </SvgIcon>
                      }
                    >
                      {save.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </Stack>
                  <Divider />
                  {defaults.isLoading && (
                    <Typography variant="body2">Loading...</Typography>
                  )}
                  <CippApiResults apiObject={defaults} errorsOnly />
                  {actions.map((action) => (
                    <Stack key={action.Id} spacing={0.25}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center' }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={!!selected[action.Id]}
                              onChange={(e) =>
                                setSelected((s) => ({
                                  ...s,
                                  [action.Id]: e.target.checked,
                                }))
                              }
                            />
                          }
                          label={
                            <Typography variant="subtitle2">
                              {action.Label}
                            </Typography>
                          }
                        />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={action.Impact}
                          color={impactColor[action.Impact] || 'default'}
                        />
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', pl: 5.5 }}
                      >
                        {action.Description}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
                <CippApiResults apiObject={save} />
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
