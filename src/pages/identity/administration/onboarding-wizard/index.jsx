import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippIcons } from '../../../../utils/icon-registry'
import { CippWizardConfirmation } from '../../../../components/CippWizard/CippWizardConfirmation'
import CippWizardPage from '../../../../components/CippWizard/CippWizardPage.jsx'
import { CippTenantStep } from '../../../../components/CippWizard/CippTenantStep.jsx'
import { CippWizardOptionsList } from '../../../../components/CippWizard/CippWizardOptionsList'
import { CippWizardOnboardingAddUser } from '../../../../components/CippWizard/CippWizardOnboardingAddUser'
import { CippWizardOnboardingScan } from '../../../../components/CippWizard/CippWizardOnboardingScan'
import { CippWizardOnboardingReentitle } from '../../../../components/CippWizard/CippWizardOnboardingReentitle'
import { useSettings } from '../../../../hooks/use-settings'
import CippTablePage from '../../../../components/CippComponents/CippTablePage'
import { Button } from '@mui/material'
import { useState } from 'react'
import { useRouter } from 'next/router'
import ScheduledTaskDetails from '../../../../components/CippComponents/ScheduledTaskDetails'
import { CippScheduledTaskActions } from '../../../../components/CippComponents/CippScheduledTaskActions'
import { CippSchedulerDrawer } from '../../../../components/CippComponents/CippSchedulerDrawer'
import { ONBOARDING_PROGRESS_ACTIONS } from '../../../../components/CippComponents/CippJobProgress'

const isExisting = (values) => values?.onboardingType === 'existing'
const isNew = (values) => values?.onboardingType === 'new'

// Defined once: a new jobProgress object on each render would restart the progress polling.
const steps = [
  {
    title: 'Step 1',
    description: 'Tenant Selection',
    component: CippTenantStep,
    componentProps: { allTenants: false, type: 'single' },
  },
  {
    title: 'Step 2',
    description: 'Onboarding Type',
    component: CippWizardOptionsList,
    componentProps: {
      name: 'onboardingType',
      keepFormValues: true,
      title: 'Who are you onboarding?',
      subtext:
        'Create a new account, or bring an existing or offboarded user back into service.',
      options: [
        {
          value: 'new',
          label: 'New user',
          description:
            'Create a new user with the Add User form, from scratch or from a user template.',
          icon: <CippIcons.PersonAdd />,
        },
        {
          value: 'existing',
          label: 'Existing user',
          description:
            'Scan an existing or deleted user for anything left over from offboarding, then fix it and restore licenses and groups.',
          icon: <CippIcons.PersonSearch />,
        },
      ],
    },
  },
  {
    title: 'Step 3',
    description: 'User Details',
    component: CippWizardOnboardingAddUser,
    maxWidth: 'lg',
    showStepWhen: isNew,
  },
  {
    title: 'Step 3',
    description: 'Scan and Review',
    component: CippWizardOnboardingScan,
    maxWidth: 'lg',
    showStepWhen: isExisting,
  },
  {
    title: 'Step 4',
    description: 'Re-entitle',
    component: CippWizardOnboardingReentitle,
    maxWidth: 'lg',
    showStepWhen: isExisting,
  },
  {
    title: 'Step 5',
    description: 'Confirmation',
    component: CippWizardConfirmation,
    maxWidth: 'lg',
    // Until a type is chosen the wizard still needs a step after the choice.
    hideStepWhen: isNew,
    componentProps: {
      columns: 3,
      jobProgress: {
        idField: 'DeploymentId',
        title: 'Onboarding Progress',
        url: (id) => `/api/ListOnboardingProgress?DeploymentId=${id}`,
        actions: ONBOARDING_PROGRESS_ACTIONS,
      },
    },
  },
]

const filterList = ['Running', 'Planned', 'Failed', 'Completed'].map(
  (state) => ({
    filterName: state,
    value: [{ id: 'TaskState', value: state }],
    type: 'column',
  })
)

const Page = () => {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [editTaskId, setEditTaskId] = useState(null)
  const [cloneTaskId, setCloneTaskId] = useState(null)
  const currentTenant = useSettings().currentTenant
  const router = useRouter()
  // Deep link: ?tenantFilter=<tenant>&users=<upn> opens the wizard on the existing user path
  const linkedUser = router.query.users
    ? String(router.query.users).split(',')[0]
    : null

  // Closing the wizard strips `users` from the URL, which also closes a deep-linked wizard.
  const linkOpen = Boolean(
    router.query.users &&
    (!router.query.tenantFilter || currentTenant === router.query.tenantFilter)
  )

  const closeWizard = () => {
    setWizardOpen(false)
    if (router.query.users) {
      const { users, ...query } = router.query
      router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
      })
    }
  }

  const actions = CippScheduledTaskActions(
    {
      openEditDrawer: (row) => setEditTaskId(row.RowKey),
      openCloneDrawer: (row) => setCloneTaskId(row.RowKey),
    },
    { hideActions: ['Edit Job', 'Clone Job'] }
  )

  return (
    <>
      <CippTablePage
        cardButton={
          <Button
            onClick={() => setWizardOpen(true)}
            startIcon={<CippIcons.PersonAdd />}
          >
            Start Onboarding
          </Button>
        }
        title="User Onboarding"
        apiUrl="/api/ListScheduledItems?Type=Invoke-CIPPOnboardingJob&"
        queryKey={`OnboardingJobs-${currentTenant}`}
        actions={actions}
        simpleColumns={[
          'Tenant',
          'Parameters.Username',
          'TaskState',
          'ScheduledTime',
          'ExecutedTime',
        ]}
        filters={filterList}
        offCanvas={{
          children: (extendedData) => (
            <ScheduledTaskDetails
              data={extendedData}
              showActions={true}
              showTitle={false}
            />
          ),
          size: 'xl',
          actions: actions,
        }}
        rowOpen={{
          link: '/cipp/scheduler/task?id=[RowKey]',
          condition: (row) => Boolean(row?.RowKey),
        }}
      />

      {editTaskId && (
        <CippSchedulerDrawer
          key={`edit-${editTaskId}`}
          taskId={editTaskId}
          onSuccess={() => setEditTaskId(null)}
          onClose={() => setEditTaskId(null)}
          PermissionButton={({ children }) => <>{children}</>}
        />
      )}

      {cloneTaskId && (
        <CippSchedulerDrawer
          key={`clone-${cloneTaskId}`}
          taskId={cloneTaskId}
          cloneMode={true}
          onSuccess={() => setCloneTaskId(null)}
          onClose={() => setCloneTaskId(null)}
          PermissionButton={({ children }) => <>{children}</>}
        />
      )}
      <CippWizardPage
        dialogMode={true}
        open={wizardOpen || linkOpen}
        onClose={closeWizard}
        dialogIcon={<CippIcons.PersonAdd />}
        relatedQueryKeys={[`OnboardingJobs-${currentTenant}`]}
        // A re-onboard link already names the tenant and the user, so it opens on Scan and Review.
        initialStep={linkedUser ? 2 : 0}
        initialState={{
          Scheduled: { enabled: false },
          ...(linkedUser && {
            tenantFilter: { label: currentTenant, value: currentTenant },
            onboardingType: 'existing',
            user: { label: linkedUser, value: linkedUser },
          }),
        }}
        steps={steps}
        postUrl="/api/ExecOnboardUser"
        wizardTitle="User Onboarding Wizard"
      />
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout usesTenant={false}>{page}</DashboardLayout>
)

export default Page
