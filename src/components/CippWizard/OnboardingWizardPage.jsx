import { CippWizardConfirmation } from './CippWizardConfirmation.jsx'
import { CippIcons } from '../../utils/icon-registry'
import { CippDeploymentStep } from './CIPPDeploymentStep.jsx'
import CippWizardPage from './CippWizardPage.jsx'
import { CippWizardOptionsList } from './CippWizardOptionsList.jsx'
import { CippSAMDeploy } from './CippSAMDeploy.jsx'
import { CippTenantModeDeploy } from './CippTenantModeDeploy.jsx'
import { CippBaselinesStep } from './CippBaselinesStep.jsx'
import { CippNotificationsStep } from './CippNotificationsStep.jsx'
import { CippAlertsStep } from './CippAlertsStep.jsx'
import { CippAddTenantTypeSelection } from './CippAddTenantTypeSelection.jsx'
import { CippDirectTenantDeploy } from './CippDirectTenantDeploy.jsx'
import { CippGDAPTenantSetup } from './CippGDAPTenantSetup.jsx'
import { CippIndirectResellerLink } from './CippIndirectResellerLink.jsx'
import { CippGDAPTenantOnboarding } from './CippGDAPTenantOnboarding.jsx'
import { CippCertificateAuthStep } from './CippCertificateAuthStep.jsx'
import { useRouter } from 'next/router'

const OnboardingWizardPage = ({ mode, samAppPresent, completionButton }) => {
  const router = useRouter()
  const isSetupGate = mode === 'setupGate'
  const selectedOptionQuery = router.query?.selectedOption
  const deepLinkedOption = Array.isArray(selectedOptionQuery)
    ? selectedOptionQuery[0]
    : selectedOptionQuery

  const tenantTypeQuery = router.query?.tenantType
  const deepLinkedTenantType = Array.isArray(tenantTypeQuery)
    ? tenantTypeQuery[0]
    : tenantTypeQuery

  const setupOptions = [
    {
      description:
        "Choose this option if this is your first setup, or if you'd like to redo the previous setup.",
      icon: <CippIcons.CpuChipIcon />,
      label: 'First Setup',
      value: 'FirstSetup',
    },
    {
      description:
        'Choose this option if you would like to add a tenant to your environment.',
      icon: <CippIcons.CpuChipIcon />,
      label: 'Add a tenant',
      value: 'AddTenant',
    },
    {
      description:
        'Choose this option if you want to setup which application registration is used to connect to your tenants.',
      icon: <CippIcons.CpuChipIcon />,
      label:
        'Create a new application registration for me and connect to my tenants',
      value: 'CreateApp',
    },
    {
      description:
        "I would like to refresh my token or replace the account I've used.",
      icon: <CippIcons.CloudIcon />,
      label: 'Refresh Tokens for existing application registration',
      value: 'UpdateTokens',
    },
    {
      description:
        'I have an existing application and would like to manually enter my token, or update them. This is only recommended for advanced users.',
      icon: <CippIcons.BuildingOfficeIcon />,
      label: 'Manually enter credentials',
      value: 'Manual',
    },
    {
      description:
        'Switch an existing setup to authenticate with the SAM certificate instead of the client secret. The client secret is kept as a rollback.',
      icon: <CippIcons.Key />,
      label: 'Use certificate authentication',
      value: 'CertificateAuth',
    },
  ]

  // On the blocking first-run gate, AddTenant and CreateApp are noise: both need an
  // existing SAM app or are a subset of First Setup. Refresh Tokens only helps when
  // an app registration already exists (credentials stored but the token is dead).
  const visibleOptions = isSetupGate
    ? setupOptions.filter((option) =>
        [
          'FirstSetup',
          'Manual',
          ...(samAppPresent ? ['UpdateTokens'] : []),
        ].includes(option.value)
      )
    : setupOptions

  const hasDeepLinkedOption =
    !isSetupGate &&
    typeof deepLinkedOption === 'string' &&
    setupOptions.some((option) => option.value === deepLinkedOption)

  // A deep link that already names the tenant type skips the type selection and lands the user
  // straight on that type's step, e.g. re-authenticating a direct tenant from the tenants list.
  const hasDeepLinkedTenantType =
    hasDeepLinkedOption &&
    deepLinkedOption === 'AddTenant' &&
    ['GDAP', 'Direct', 'IndirectReseller'].includes(deepLinkedTenantType)

  const steps = [
    {
      description: 'Onboarding',
      component: CippWizardOptionsList,
      hideStepWhen: () => hasDeepLinkedOption,
      componentProps: {
        title: 'Select your setup method',
        subtext:
          'This wizard will guide you through setting up CIPPs access to your client tenants. If this is your first time setting up CIPP you will want to choose the option "First Setup".',
        valuesKey: 'SyncTool',
        options: visibleOptions,
      },
    },
    {
      description: 'Application',
      component: CippSAMDeploy,
      showStepWhen: (values) =>
        values?.selectedOption === 'CreateApp' ||
        values?.selectedOption === 'FirstSetup',
    },
    {
      description: 'Tenants',
      component: CippTenantModeDeploy,
      showStepWhen: (values) =>
        values?.selectedOption === 'CreateApp' ||
        values?.selectedOption === 'FirstSetup',
    },
    {
      description: 'Tenant Type',
      component: CippAddTenantTypeSelection,
      showStepWhen: (values) =>
        values?.selectedOption === 'AddTenant' && !hasDeepLinkedTenantType,
    },
    {
      description: 'Direct Tenant',
      component: CippDirectTenantDeploy,
      showStepWhen: (values) =>
        values?.selectedOption === 'AddTenant' &&
        values?.tenantType === 'Direct',
    },
    {
      description: 'GDAP Setup',
      component: CippGDAPTenantSetup,
      showStepWhen: (values) =>
        values?.selectedOption === 'AddTenant' && values?.tenantType === 'GDAP',
    },
    {
      description: 'Reseller Link',
      component: CippIndirectResellerLink,
      showStepWhen: (values) =>
        values?.selectedOption === 'AddTenant' &&
        values?.tenantType === 'IndirectReseller',
    },
    {
      description: 'GDAP Onboarding',
      component: CippGDAPTenantOnboarding,
      showStepWhen: (values) =>
        values?.selectedOption === 'AddTenant' &&
        values?.tenantType === 'GDAP' &&
        values?.GDAPInviteAccepted === true,
    },
    {
      description: 'Baselines',
      component: CippBaselinesStep,
      showStepWhen: (values) => values?.selectedOption === 'FirstSetup',
    },
    {
      description: 'Notifications',
      component: CippNotificationsStep,
      showStepWhen: (values) => values?.selectedOption === 'FirstSetup',
    },
    {
      description: 'Next Steps',
      component: CippAlertsStep,
      showStepWhen: (values) => values?.selectedOption === 'FirstSetup',
    },
    {
      description: 'Refresh Tokens',
      component: CippDeploymentStep,
      showStepWhen: (values) => values?.selectedOption === 'UpdateTokens',
    },
    {
      description: 'Manually enter credentials',
      component: CippDeploymentStep,
      showStepWhen: (values) => values?.selectedOption === 'Manual',
    },
    {
      description: 'Certificate Authentication',
      component: CippCertificateAuthStep,
      showStepWhen: (values) => values?.selectedOption === 'CertificateAuth',
    },
    {
      description: 'Confirmation',
      component: CippWizardConfirmation,
    },
  ]

  return (
    <CippWizardPage
      backButton={false}
      steps={steps}
      wizardTitle="Setup Wizard"
      postUrl="/api/ExecCombinedSetup"
      completionButton={completionButton}
      initialState={
        hasDeepLinkedOption
          ? {
              selectedOption: deepLinkedOption,
              ...(hasDeepLinkedTenantType && {
                tenantType: deepLinkedTenantType,
              }),
            }
          : undefined
      }
    />
  )
}

export default OnboardingWizardPage
