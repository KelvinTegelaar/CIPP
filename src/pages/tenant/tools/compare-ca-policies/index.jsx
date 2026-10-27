import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippIcons } from '../../../../utils/icon-registry'
import { useForm, useWatch } from 'react-hook-form'
import { ApiPostCall } from '../../../../api/ApiCall'
import { CippFormComponent } from '../../../../components/CippComponents/CippFormComponent'
import { CippFormCondition } from '../../../../components/CippComponents/CippFormCondition'
import { CippFormTenantSelector } from '../../../../components/CippComponents/CippFormTenantSelector'
import CippJsonView from '../../../../components/CippFormPages/CippJSONView'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Stack,
} from '@mui/material'
import { CippPolicyDiffTable } from '../../../../components/CippComponents/CippPolicyDiffTable'
import { useMemo } from 'react'
import { Grid } from '@mui/system'
import CippPageCard from '../../../../components/CippCards/CippPageCard'

const sourceTypeOptions = [
  { label: 'CIPP Template', value: 'template' },
  { label: 'Tenant Policy', value: 'tenantPolicy' },
]

const SourceSelector = ({ prefix, formControl, label }) => {
  const tenantValue = useWatch({
    control: formControl.control,
    name: `${prefix}.tenantFilter`,
  })

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardHeader title={label} slotProps={{ title: { variant: 'h6' } }} />
      <CardContent>
        <Stack spacing={2}>
          <CippFormComponent
            type="radio"
            name={`${prefix}.type`}
            label="Source Type"
            formControl={formControl}
            options={sourceTypeOptions}
            row
          />

          <CippFormCondition
            field={`${prefix}.type`}
            compareType="is"
            compareValue="template"
            formControl={formControl}
          >
            <CippFormComponent
              type="autoComplete"
              name={`${prefix}.template`}
              label="Select Template"
              formControl={formControl}
              multiple={false}
              creatable={false}
              api={{
                url: '/api/ListCATemplates',
                queryKey: `ListCATemplates-${prefix}`,
                labelField: 'displayName',
                valueField: 'GUID',
              }}
              validators={{
                required: { value: true, message: 'Template is required' },
              }}
            />
          </CippFormCondition>

          <CippFormCondition
            field={`${prefix}.type`}
            compareType="is"
            compareValue="tenantPolicy"
            formControl={formControl}
          >
            <Stack spacing={2}>
              <CippFormTenantSelector
                formControl={formControl}
                name={`${prefix}.tenantFilter`}
                type="single"
                allTenants={false}
                required={true}
                preselectedEnabled={true}
              />
              <CippFormComponent
                type="autoComplete"
                name={`${prefix}.policy`}
                label="Select Policy"
                formControl={formControl}
                multiple={false}
                creatable={false}
                isFetching={!tenantValue}
                api={
                  tenantValue
                    ? {
                        url: '/api/ListGraphRequest',
                        queryKey: `ListConditionalAccessPolicies-${tenantValue?.value}`,
                        data: {
                          tenantFilter: tenantValue?.value,
                          Endpoint: 'conditionalAccess/policies',
                          AsApp: true,
                        },
                        dataKey: 'Results',
                        labelField: 'displayName',
                        valueField: 'id',
                      }
                    : undefined
                }
                validators={{
                  required: { value: true, message: 'Policy is required' },
                }}
              />
            </Stack>
          </CippFormCondition>
        </Stack>
      </CardContent>
    </Card>
  )
}

const Page = () => {
  const formControl = useForm({
    mode: 'onChange',
    defaultValues: {
      sourceA: { type: 'template' },
      sourceB: { type: 'tenantPolicy' },
    },
  })
  const compareApi = ApiPostCall({ relatedQueryKeys: [] })
  const [sourceA, sourceB] = useWatch({
    control: formControl.control,
    name: ['sourceA', 'sourceB'],
  })

  const isReady = (source) =>
    source?.type === 'template'
      ? !!source.template?.value
      : !!source?.policy?.value
  const canCompare = isReady(sourceA) && isReady(sourceB)

  const handleCompare = () => {
    const values = formControl.getValues()
    // A template is resolved for the tenant it is compared with, so %variables% do not show as differences.
    const buildPayload = (source, other) =>
      source.type === 'template'
        ? {
            type: 'template',
            templateGuid: source.template?.value,
            tenantFilter:
              other.type === 'tenantPolicy'
                ? other.tenantFilter?.value
                : undefined,
          }
        : {
            type: 'tenantPolicy',
            tenantFilter: source.tenantFilter?.value,
            policyId: source.policy?.value,
          }

    compareApi.mutate({
      url: '/api/ExecCompareCAPolicy',
      data: {
        sourceA: buildPayload(values.sourceA, values.sourceB),
        sourceB: buildPayload(values.sourceB, values.sourceA),
      },
    })
  }

  const results = compareApi.isSuccess
    ? compareApi.data?.data || compareApi.data
    : null
  const errorMessage = compareApi.isError
    ? compareApi.error?.response?.data?.Results ||
      compareApi.error?.message ||
      'An error occurred'
    : null

  const comparisonRows = useMemo(() => {
    const raw = results?.Results
    const rows = Array.isArray(raw) ? raw : raw ? [raw] : []
    return rows.filter((row) => row && typeof row === 'object')
  }, [results?.Results])

  return (
    <CippPageCard
      title="Compare Conditional Access Policies"
      backButtonTitle="Back"
    >
      <CardContent>
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SourceSelector
                prefix="sourceA"
                formControl={formControl}
                label="Source A"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SourceSelector
                prefix="sourceB"
                formControl={formControl}
                label="Source B"
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<CippIcons.CompareArrows />}
              onClick={handleCompare}
              disabled={!canCompare || compareApi.isPending}
            >
              {compareApi.isPending ? 'Comparing...' : 'Compare'}
            </Button>
          </Box>

          {compareApi.isPending && (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="rectangular" height={200} />
                </Stack>
              </CardContent>
            </Card>
          )}

          {errorMessage && (
            <Alert severity="error" icon={<CippIcons.Error />}>
              {errorMessage}
            </Alert>
          )}

          {results && (
            <Stack spacing={3}>
              <Alert
                severity={results.identical ? 'success' : 'warning'}
                icon={
                  results.identical ? (
                    <CippIcons.CheckCircle />
                  ) : (
                    <CippIcons.CompareArrows />
                  )
                }
              >
                {results.identical
                  ? 'Policies are identical - no differences found.'
                  : `${comparisonRows.length} difference${comparisonRows.length === 1 ? '' : 's'} found between policies.`}
                <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                  <strong>A:</strong> {results.sourceALabel} &mdash;{' '}
                  <strong>B:</strong> {results.sourceBLabel}
                </Box>
              </Alert>

              {!results.identical && comparisonRows.length > 0 && (
                <CippPolicyDiffTable rows={comparisonRows} />
              )}

              <CippJsonView
                object={results.sourceAData}
                tenant={compareApi.variables?.data?.sourceA?.tenantFilter}
                title={`Source A Settings — ${results.sourceALabel}`}
              />
              <CippJsonView
                object={results.sourceBData}
                tenant={compareApi.variables?.data?.sourceB?.tenantFilter}
                title={`Source B Settings — ${results.sourceBLabel}`}
              />
            </Stack>
          )}
        </Stack>
      </CardContent>
    </CippPageCard>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
