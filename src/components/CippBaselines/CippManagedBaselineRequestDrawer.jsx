import { useEffect, useState } from 'react'
import { Alert, Button } from '@mui/material'
import { Grid, Stack } from '@mui/system'
import { useForm, useFormState } from 'react-hook-form'
import { CippIcons } from '../../utils/icon-registry'
import { CippOffCanvas } from '../CippComponents/CippOffCanvas'
import { CippApiResults } from '../CippComponents/CippApiResults'
import CippFormComponent from '../CippComponents/CippFormComponent'
import { CippFormTenantSelector } from '../CippComponents/CippFormTenantSelector'
import { ApiPostCall } from '../../api/ApiCall'

const toOptions = (values) => values.map((value) => ({ label: value, value }))

const industryOptions = toOptions([
  'Healthcare',
  'Finance',
  'Legal',
  'Education',
  'Government',
  'Manufacturing',
  'Retail',
  'Non-profit',
  'Professional services',
  'Technology',
  'Construction',
])

const clientSizeOptions = [
  '1-25',
  '26-100',
  '101-500',
  '501-2000',
  '2000+',
].map((value) => ({ label: `${value} seats`, value }))

const frameworkOptions = toOptions([
  'CIS',
  'NIST CSF',
  'ISO 27001',
  'SOC 2',
  'Cyber Essentials',
  'Essential Eight',
  'NIS2',
  'HIPAA',
  'PCI DSS',
  'CMMC',
])

const required = { required: 'This field is required.' }
const requiredOption = {
  validate: (option) => (option?.value ? true : 'This field is required.'),
}
const defaultValues = { Action: 'Create' }

export const CippManagedBaselineRequestDrawer = ({
  buttonText = 'Request Custom Baseline',
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const formControl = useForm({ mode: 'onChange', defaultValues })
  const { isValid, isDirty } = useFormState({ control: formControl.control })

  const createRequest = ApiPostCall({
    relatedQueryKeys: ['ListManagedBaselineRequests*'],
  })

  useEffect(() => {
    if (createRequest.isSuccess) {
      formControl.reset(defaultValues)
    }
  }, [createRequest.isSuccess, formControl])

  const handleSubmit = (values) => {
    createRequest.mutate({
      url: '/api/ExecManagedBaselineRequest',
      data: values,
    })
  }

  const handleCloseDrawer = () => {
    setDrawerVisible(false)
    formControl.reset(defaultValues)
  }

  return (
    <>
      <Button
        onClick={() => setDrawerVisible(true)}
        startIcon={<CippIcons.AddBox />}
      >
        {buttonText}
      </Button>
      <CippOffCanvas
        title="Request Custom Baseline"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <Stack spacing={2}>
            <CippApiResults apiObject={createRequest} />
            <div
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-start',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={formControl.handleSubmit(handleSubmit)}
                disabled={
                  createRequest.isPending ||
                  !isValid ||
                  (!isDirty && !createRequest.isSuccess)
                }
              >
                {createRequest.isPending
                  ? 'Sending Request...'
                  : createRequest.isSuccess
                    ? 'Request Another Baseline'
                    : 'Send Request'}
              </Button>
              <Button variant="outlined" onClick={handleCloseDrawer}>
                Close
              </Button>
            </div>
          </Stack>
        }
      >
        <Grid container spacing={2}>
          <Grid size={12}>
            <CippFormTenantSelector
              label="Typical tenant to snapshot"
              formControl={formControl}
              type="single"
              allTenants={false}
              validators={{ required: 'A tenant must be selected' }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="autoComplete"
              name="industry"
              label="Main industry of your clients"
              multiple={false}
              creatable={true}
              options={industryOptions}
              formControl={formControl}
              validators={requiredOption}
              required={true}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="select"
              name="clientSize"
              label="Typical client size"
              creatable={false}
              options={clientSizeOptions}
              formControl={formControl}
              validators={required}
              required={true}
            />
          </Grid>
          <Grid size={12}>
            <CippFormComponent
              type="textField"
              name="wants"
              label="What do you expect from this baseline?"
              placeholder="For example: our clients have to pass a cyber insurance questionnaire, external forwarding must be blocked, guest sharing must be locked down. Tell us whether to start in report only or to remediate straight away."
              formControl={formControl}
              disableVariables={true}
              multiline={true}
              rows={4}
              validators={required}
              required={true}
            />
          </Grid>
          <Grid size={12}>
            <CippFormComponent
              type="textField"
              name="exceptions"
              label="Which exceptions must exist?"
              placeholder="For example: scanners that still need SMTP basic authentication, a break-glass account outside Conditional Access, a legal hold that cannot change. Describe the kind of thing, not the people or addresses."
              formControl={formControl}
              disableVariables={true}
              multiline={true}
              rows={3}
            />
          </Grid>
          <Grid size={12}>
            <CippFormComponent
              type="autoComplete"
              name="frameworks"
              label="Frameworks your clients have to meet"
              multiple={true}
              creatable={true}
              options={frameworkOptions}
              formControl={formControl}
            />
          </Grid>
          <Grid size={12}>
            <CippFormComponent
              type="textField"
              name="comments"
              label="Anything else we should know?"
              formControl={formControl}
              disableVariables={true}
              multiline={true}
              rows={3}
            />
          </Grid>
          <Grid size={12}>
            <Alert severity="info">
              CIPP compares this tenant against every available standard and
              sends the results to CyberDrain together with what you type here.
              Domains, email addresses, IP addresses, IDs and the tenant&apos;s
              name are removed from the results first. The request is refused
              when what you type names the tenant, so describe things instead of
              naming them.
            </Alert>
          </Grid>
        </Grid>
      </CippOffCanvas>
    </>
  )
}

export default CippManagedBaselineRequestDrawer
