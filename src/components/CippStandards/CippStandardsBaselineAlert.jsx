import { Alert, AlertTitle, Link } from '@mui/material'
import NextLink from 'next/link'

export const CippStandardsBaselineAlert = () => (
  <Alert severity="warning">
    <AlertTitle>Standards are moving to Baselines</AlertTitle>
    Standards and Drift only receive bug fixes from now on. New settings and
    features are added to Baselines, so we recommend moving your templates over.
    Baselines can convert your existing templates for you. Read the{' '}
    <Link
      component={NextLink}
      href="https://docs.cipp.app/user-documentation/tenant/baselines/migrating-from-standards"
      target="_blank"
      rel="noreferrer"
    >
      migration guide
    </Link>
    , then turn on Baselines under{' '}
    <Link component={NextLink} href="/cipp/settings/features">
      CIPP Settings &gt; Features
    </Link>{' '}
    when you are ready.
  </Alert>
)
