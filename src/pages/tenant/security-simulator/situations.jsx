import { useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/router'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import { useForm, useWatch } from 'react-hook-form'
import { Layout as DashboardLayout } from '../../../layouts/index'
import { TabbedLayout } from '../../../layouts/TabbedLayout'
import tabOptions from './tabOptions.json'
import { CippHead } from '../../../components/CippComponents/CippHead'
import CippFormSkeleton from '../../../components/CippFormPages/CippFormSkeleton'
import CippFormComponent from '../../../components/CippComponents/CippFormComponent'
import { CippFormUserSelector } from '../../../components/CippComponents/CippFormUserSelector'
import { ApiGetCall } from '../../../api/ApiCall'
import { useSettings } from '../../../hooks/use-settings'
import countryList from '../../../data/countryList.json'

const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : [])
const optionValue = (option) =>
  option && typeof option === 'object' ? option.value : option
const countryOptions = countryList.map((country) => ({
  label: country.Name,
  value: country.Code,
}))
const identityOption = (identity) =>
  identity?.userId
    ? {
        label: `${identity.displayName} (${identity.userPrincipalName})`,
        value: identity.userId,
      }
    : null

const GROUP_ORDER = ['Admin accounts', 'Standard users', 'Guests']
const emptySelection = {
  adminUserId: null,
  userUserId: null,
  guestUserId: null,
  country: null,
}

const outcomeColor = (situation) => {
  if (situation.pass === true) return 'success.main'
  if (situation.pass === false) return 'error.main'
  return 'text.secondary'
}

const Page = () => {
  const pageTitle = 'Sign-in Situations'
  const router = useRouter()
  const tenant = useSettings().currentTenant
  const tenantSelected = Boolean(tenant) && tenant !== 'AllTenants'

  const formControl = useForm({
    mode: 'onChange',
    defaultValues: emptySelection,
  })
  const [adminSelection, userSelection, guestSelection, countrySelection] =
    useWatch({
      control: formControl.control,
      name: ['adminUserId', 'userUserId', 'guestUserId', 'country'],
    })

  // The accounts and country the API picked on its own for this tenant. A selection only
  // becomes a query parameter when it differs from them, so the first load and a selection that
  // matches it share one cached result.
  const autoRef = useRef({})
  useEffect(() => {
    autoRef.current = {}
    formControl.reset(emptySelection)
  }, [tenant])

  const overrides = useMemo(() => {
    const auto = autoRef.current
    const out = {}
    const pick = (selection, key, autoKey) => {
      const value = optionValue(selection)
      if (value && value !== auto[autoKey]) out[key] = value
    }
    pick(adminSelection, 'adminUserId', 'admin')
    pick(userSelection, 'userUserId', 'user')
    pick(guestSelection, 'guestUserId', 'guest')
    pick(countrySelection, 'country', 'country')
    return out
  }, [adminSelection, userSelection, guestSelection, countrySelection])
  const overrideKey = JSON.stringify(overrides)

  const battery = ApiGetCall({
    url: '/api/ListCASituations',
    data: { tenantFilter: tenant, ...overrides },
    queryKey: `ListCASituations-${tenant}-${overrideKey}`,
    waiting: tenantSelected,
  })

  const data = battery.data
  const situations = asArray(data?.situations)

  const retriedRef = useRef(false)
  useEffect(() => {
    if (
      battery.isFetching ||
      data === undefined ||
      (data && typeof data === 'object')
    )
      return
    if (retriedRef.current) return
    retriedRef.current = true
    battery.refetch()
  }, [data, battery.isFetching, battery])

  const adminOptions = asArray(data?.candidates?.admins).map((admin) =>
    identityOption(admin)
  )

  useEffect(() => {
    if (!data || typeof data !== 'object' || !data.identities) return
    if (Object.keys(overrides).length === 0) {
      autoRef.current = {
        admin: data.identities.admin?.userId,
        user: data.identities.user?.userId,
        guest: data.identities.guest?.userId,
        country: data.country,
      }
    }
    const seed = (name, option) => {
      if (option && !formControl.getValues(name))
        formControl.setValue(name, option)
    }
    seed(
      'adminUserId',
      adminOptions.find(
        (option) => option.value === data.identities.admin?.userId
      ) ?? identityOption(data.identities.admin)
    )
    seed('userUserId', identityOption(data.identities.user))
    seed('guestUserId', identityOption(data.identities.guest))
    seed(
      'country',
      countryOptions.find((option) => option.value === data.country)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const summary = data?.summary
  const groups = [
    ...GROUP_ORDER.filter((group) => situations.some((s) => s.group === group)),
    ...[...new Set(situations.map((s) => s.group))].filter(
      (g) => !GROUP_ORDER.includes(g)
    ),
  ]

  return (
    <>
      <CippHead title={pageTitle} />
      <Container maxWidth={false}>
        <Stack spacing={3}>
          {!tenantSelected && (
            <Alert severity="info">
              Select a tenant to evaluate its sign-in situations.
            </Alert>
          )}
          {tenantSelected && data?.licensed === false && (
            <Alert severity="warning">
              This tenant has no Entra ID P1 or P2 license, so there are no
              Conditional Access policies to evaluate sign-ins against.
            </Alert>
          )}
          {tenantSelected && (
            <Card>
              <CardHeader
                title="Sign in as"
                subheader="Every situation below is evaluated live through the What If API as these accounts. Nothing signs in and nothing changes. Pick other accounts or another country to re-evaluate."
                slotProps={{ subheader: { variant: 'caption' } }}
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <CippFormComponent
                      type="autoComplete"
                      name="adminUserId"
                      label="Admin account"
                      formControl={formControl}
                      multiple={false}
                      creatable={false}
                      options={adminOptions}
                      isFetching={
                        battery.isFetching && adminOptions.length === 0
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <CippFormUserSelector
                      formControl={formControl}
                      name="userUserId"
                      label="Standard user account"
                      multiple={false}
                      select="id,userPrincipalName,displayName,userType,accountEnabled"
                      dataFilter={(user) =>
                        user.userType !== 'Guest' &&
                        user.accountEnabled !== false
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <CippFormUserSelector
                      formControl={formControl}
                      name="guestUserId"
                      label="Guest account"
                      multiple={false}
                      select="id,userPrincipalName,displayName,userType,accountEnabled"
                      dataFilter={(user) => user.userType === 'Guest'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <CippFormComponent
                      type="autoComplete"
                      name="country"
                      label="Foreign country"
                      formControl={formControl}
                      multiple={false}
                      creatable={false}
                      options={countryOptions}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
          {tenantSelected && summary && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {summary.total} sign-ins evaluated ·{' '}
              <Typography
                component="span"
                variant="body2"
                sx={{ color: 'success.main', fontWeight: 600 }}
              >
                {summary.protected} protected
              </Typography>{' '}
              ·{' '}
              <Typography
                component="span"
                variant="body2"
                sx={{ color: 'error.main', fontWeight: 600 }}
              >
                {summary.unprotected} get through
              </Typography>
              {summary.reportOnly > 0 && (
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: 'warning.main' }}
                >
                  {' '}
                  ({summary.reportOnly} only because a policy is report-only)
                </Typography>
              )}
              {summary.notEvaluated > 0 &&
                ` · ${summary.notEvaluated} could not be evaluated`}
              {asArray(data?.excluded).length > 0 &&
                ` · ${asArray(data.excluded).length} risk-based sign-in${asArray(data.excluded).length === 1 ? '' : 's'} excluded without Entra ID P2`}
            </Typography>
          )}
          {tenantSelected && battery.isFetching && !data && (
            <CippFormSkeleton layout={[1, 1, 1, 1, 1]} />
          )}
          {tenantSelected && !battery.isFetching && battery.isError && (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => battery.refetch()}
                >
                  Retry
                </Button>
              }
            >
              The sign-in situations could not be evaluated through the API.
            </Alert>
          )}
          {groups.map((group) => {
            const rows = situations.filter((s) => s.group === group)
            return (
              <Box key={group}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 1,
                  }}
                >
                  {group}
                </Typography>
                <Card>
                  <Stack divider={<Divider />}>
                    {rows.map((situation) => (
                      <Box
                        key={situation.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          px: 2.25,
                          py: 1.5,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ minWidth: 280, flex: '1 1 280px' }}
                        >
                          {situation.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: outcomeColor(situation),
                            fontWeight: 600,
                            minWidth: 150,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {situation.error
                            ? 'Not evaluated'
                            : situation.outcome}
                        </Typography>
                        <Box
                          sx={{
                            flex: '2 1 320px',
                            minWidth: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                          }}
                        >
                          {situation.error && (
                            <Typography
                              variant="body2"
                              sx={{ color: 'text.secondary' }}
                            >
                              {situation.error}
                            </Typography>
                          )}
                          {!situation.error && situation.pass === false && (
                            <>
                              <Typography
                                variant="body2"
                                sx={{ color: 'text.secondary' }}
                              >
                                {situation.missingControl}
                                {asArray(situation.reportOnlyWouldStop).length >
                                  0 && (
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{ color: 'warning.main' }}
                                  >
                                    {' '}
                                    - a report-only policy would stop it:{' '}
                                    {asArray(
                                      situation.reportOnlyWouldStop
                                    ).join(', ')}
                                  </Typography>
                                )}
                              </Typography>
                              {situation.fix?.caTemplate && (
                                <Button
                                  size="small"
                                  sx={{
                                    py: 0,
                                    minWidth: 0,
                                    whiteSpace: 'nowrap',
                                  }}
                                  onClick={() =>
                                    router.push(
                                      '/tenant/conditional/list-template'
                                    )
                                  }
                                >
                                  Deploy a CA template
                                </Button>
                              )}
                            </>
                          )}
                          {!situation.error &&
                            situation.pass === true &&
                            asArray(situation.blockedBy).length > 0 && (
                              <Typography
                                variant="body2"
                                sx={{ color: 'text.secondary' }}
                              >
                                by {asArray(situation.blockedBy).join(', ')}
                              </Typography>
                            )}
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Box>
            )
          })}
        </Stack>
      </Container>
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
