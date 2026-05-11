import { useEffect, useMemo } from 'react'
import { Alert, Box, Skeleton, Stack, TextField, Typography } from '@mui/material'
import { ApiGetCall } from '../../api/ApiCall'
import { CippWizardStepButtons } from './CippWizardStepButtons'
import { CippCopyToClipBoard } from '../CippComponents/CippCopyToClipboard'
import CippFormComponent from '../CippComponents/CippFormComponent'
import { useWatch } from 'react-hook-form'

export const CippIndirectResellerLink = (props) => {
  const { formControl, currentStep, onPreviousStep, onNextStep } = props

  const linkData = ApiGetCall({
    url: '/api/ListResellerRelationshipLink',
    queryKey: 'ListResellerRelationshipLink',
  })

  const inviteUrl = linkData.data?.inviteUrl ?? null
  const indirectProviders = linkData.data?.indirectProviders ?? []
  const inviteUrlError = linkData.data?.inviteUrlError ?? null

  const noneOption = { label: 'None (no indirect provider)', value: null }

  const providerOptions = useMemo(() => {
    const providers = indirectProviders.map((p) => ({
      label: `${p.name} — MPN: ${p.mpnId} (${p.location})`,
      value: p.id,
    }))
    return [noneOption, ...providers]
  }, [indirectProviders])

  useEffect(() => {
    if (!linkData.isFetching && providerOptions.length > 0) {
      const current = formControl.getValues('indirectProviderId')
      if (!current) {
        formControl.setValue('indirectProviderId', noneOption)
      }
    }
  }, [linkData.isFetching, providerOptions])

  const selectedProvider = useWatch({ control: formControl.control, name: 'indirectProviderId' })

  const finalUrl = useMemo(() => {
    if (!inviteUrl) return null
    if (!selectedProvider?.value) return inviteUrl
    const hashIndex = inviteUrl.indexOf('#')
    const base = hashIndex !== -1 ? inviteUrl.slice(0, hashIndex) : inviteUrl
    const hash = hashIndex !== -1 ? inviteUrl.slice(hashIndex) : ''
    return `${base}&indirectCSPId=${selectedProvider.value}${hash}`
  }, [inviteUrl, selectedProvider])

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Indirect Reseller Relationship Link
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate an invite link to send to a customer so they can authorize you as their indirect
          reseller. This does <strong>not</strong> add the tenant to CIPP — it only provides the
          Microsoft Admin Portal invitation link.
        </Typography>
      </Box>

      {linkData.isFetching && (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={56} />
          <Stack spacing={0.5}>
            <Skeleton variant="text" width={80} />
            <Skeleton variant="rounded" height={40} />
            <Skeleton variant="text" width="60%" />
          </Stack>
        </Stack>
      )}

      {linkData.isError && (
        <Alert severity="error">
          Failed to load relationship link from the Partner Center API. Ensure your CIPP application
          has the required Partner Center permissions.
        </Alert>
      )}

      {inviteUrlError && !linkData.isError && <Alert severity="warning">{inviteUrlError}</Alert>}

      {!linkData.isFetching && !linkData.isError && inviteUrl && (
        <>
          <CippFormComponent
            formControl={formControl}
            name="indirectProviderId"
            label="Indirect Provider"
            type="autoComplete"
            options={providerOptions}
            multiple={false}
            creatable={false}
            isFetching={linkData.isFetching}
            helperText="Select an indirect provider to include their ID in the invite link, or leave as None."
          />

          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Invite Link</strong>
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                value={finalUrl}
                slotProps={{ input: { readOnly: true } }}
                size="small"
              />
              <CippCopyToClipBoard text={finalUrl} />
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Send this link to your customer. When they follow it, they will be linked to your
              reseller account in the Microsoft Admin Portal.
            </Typography>
          </Box>

          <Alert severity="info">
            There is no automatic confirmation when the customer accepts this invite. You can verify
            the relationship in Partner Center once the customer has completed the process.
          </Alert>
        </>
      )}

      <CippWizardStepButtons
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
        noSubmitButton
      />
    </Stack>
  )
}
