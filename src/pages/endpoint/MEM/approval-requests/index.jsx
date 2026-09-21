import { CippIcons } from '../../../../utils/icon-registry'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { useSettings } from '../../../../hooks/use-settings'
import { useDialog } from '../../../../hooks/use-dialog'

const Page = () => {
  const pageTitle = 'MAA Requests'
  const tenantFilter = useSettings().currentTenant
  const handoffDialog = useDialog()

  // This page deliberately has no row actions. Intune answers approve and reject with "Valid user
  // identity required while Multi Admin Approval is enabled" for the delegated partner identity and
  // for the application identity alike, and a requestor may never approve its own request - which
  // CIPP always is. Delete is not offered either: the request is the tenant's record of a pending
  // decision, and removing it neither applies nor cancels the change behind it. The decision has to
  // be made by an account inside the tenant, so all this page offers is a handoff to Intune.
  const offCanvas = {
    extendedInfoFields: [
      'id',
      'status',
      'operation',
      'target',
      'operationTypes',
      'requestJustification',
      'approvalJustification',
      'requestedBy',
      'approvedBy',
      'requestDateTime',
      'expirationDateTime',
      'lastModifiedDateTime',
    ],
  }

  // requestedBy and approvedBy are kept out of the table: Intune leaves the requestor and approver
  // identity sets null, so as columns they would be dead space on every row.
  const simpleColumns = [
    'status',
    'operation',
    'target',
    'operationTypes',
    'requestJustification',
    'requestDateTime',
    'expirationDateTime',
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        cardButton={
          <Button
            startIcon={<CippIcons.Launch />}
            onClick={() => handoffDialog.handleOpen()}
          >
            Action in Intune
          </Button>
        }
        tableFilter={
          <Alert severity="info">
            Multi-admin approval holds these changes until a second
            administrator approves them, and the decision cannot be made from
            CIPP. Once a request is approved, anything CIPP raised is reapplied
            automatically. Requests expire after 3 days.
          </Alert>
        }
        apiUrl="/api/ListIntuneApprovalRequests"
        queryKey="ListIntuneApprovalRequests"
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
      />
      <Dialog
        open={handoffDialog.open}
        onClose={handoffDialog.handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approvals cannot be made through CIPP</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <p>
              Intune rejects a multi-admin approval decision from a GDAP
              delegated identity and from an application identity alike, so
              neither CIPP nor any other partner tooling can approve or reject
              these requests.
            </p>
            <p>
              The decision has to come from an account signed in to the customer
              tenant that is a member of the approver group on the access
              policy, and it cannot be the account that raised the request.
              Approve or reject under{' '}
              <strong>
                Tenant administration &gt; Multi Admin Approval &gt; Received
                requests
              </strong>
              .
            </p>
            <p>
              A JIT admin account may be able to fill this role, provided it is
              added to the approver security group and that group is directly
              assigned to an Intune RBAC role. This is untested.
            </p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handoffDialog.handleClose}>Cancel</Button>
          <Button
            component="a"
            href={`https://intune.microsoft.com/${tenantFilter}`}
            target="_blank"
            rel="noreferrer"
            variant="contained"
            startIcon={<CippIcons.Launch />}
            onClick={handoffDialog.handleClose}
          >
            Open Intune
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
