import { CippAuthShell } from './CippAuthShell'
import { ApiGetCall } from '../../api/ApiCall'

// Hold screen for non-admin users while /api/me reports initialSetupComplete: false.
// Rendered by PrivateRoute in place of the entire app - nothing in CIPP works until
// an administrator finishes the setup wizard, so there is nothing to let them into.
const SetupPendingPage = () => {
  // Second observer on authmecipp purely to poll while this screen is mounted
  // (PrivateRoute's own observer has no interval), so the gate lifts on its own
  // once an admin finishes the wizard.
  ApiGetCall({ url: '/api/me', queryKey: 'authmecipp', refetchInterval: 30000 })

  return (
    <CippAuthShell
      title="CIPP is being set up"
      description="This CIPP instance has not finished its initial setup. Access is limited to administrators until setup is complete. This page checks automatically and will let you in as soon as setup finishes."
      actionText="Sign out"
      actionHref={'/.auth/logout?post_logout_redirect_uri=' + encodeURIComponent('/')}
      busy
    />
  )
}

export default SetupPendingPage
