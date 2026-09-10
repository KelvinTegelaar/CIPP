import { ApiGetCall } from "../api/ApiCall.jsx";
import UnauthenticatedPage from "../pages/unauthenticated";
import LoadingPage from "../pages/loading";
import ApiOfflinePage from "../pages/api-offline";
import SetupGatePage from "./CippComponents/SetupGatePage.jsx";
import SetupPendingPage from "./CippComponents/SetupPendingPage.jsx";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { rememberSession } from "../utils/auth-session.js";

// EasyAuth exposes the signed-in identity in two shapes depending on the host:
//   - Static Web Apps:      { clientPrincipal: { userDetails, userRoles, ... } }
//   - App Service EasyAuth: [ { user_id, user_claims: [...], access_token, ... } ]
// an authenticated session must be detected from either populated shape.
const hasAuthenticatedSession = (data) =>
  Boolean(data?.clientPrincipal) || (Array.isArray(data) && data.length > 0);

// Being signed out and being signed in without access need different screens and
// different actions, so the unauthenticated page is told which one it is rather
// than guessing. SESSION means there is no identity at all; PERMISSIONS means a
// valid identity that CIPP won't let through.
export const UNAUTH_SESSION = "session";
export const UNAUTH_PERMISSIONS = "permissions";

export const PrivateRoute = ({ children, routeType }) => {
  const router = useRouter();
  const [unauthLatched, setUnauthLatched] = useState(false);

  const session = ApiGetCall({
    url: "/.auth/me",
    queryKey: "authmeswa",
    refetchOnWindowFocus: true,
    staleTime: 120000, // 2 minutes
  });

  // Latch the unauthenticated state so refetches from child components don't flip us
  // back to loading. Latch on a request error or a settled session with no identity;
  // clear it as soon as an authenticated session (either shape) is seen.
  useEffect(() => {
    if (
      !session.isLoading &&
      !session.isFetching &&
      (session.isError || !hasAuthenticatedSession(session.data))
    ) {
      setUnauthLatched(true);
    } else if (hasAuthenticatedSession(session.data)) {
      setUnauthLatched(false);
    }
  }, [session.isLoading, session.isFetching, session.isError, session.data]);

  const apiRoles = ApiGetCall({
    url: "/api/me",
    queryKey: "authmecipp",
    retry: 2,
    waiting: session.isSuccess && hasAuthenticatedSession(session.data),
  });

  // Record that a session existed on this device so the sign-in screen can tell
  // an expired session from a first visit.
  useEffect(() => {
    if (hasAuthenticatedSession(session.data)) {
      rememberSession();
    }
  }, [session.data]);

  // If latched as unauthenticated, always show unauthenticated page
  if (unauthLatched) {
    return <UnauthenticatedPage reason={UNAUTH_SESSION} />;
  }

  // Check if the session is still loading before determining authentication status
  // return loading page here when roles are loading to avoid showing 401
  if (
    session.isLoading ||
    apiRoles.isLoading ||
    (hasAuthenticatedSession(session.data) && apiRoles.isPending) ||
    (apiRoles.isFetching && !apiRoles.data?.clientPrincipal)
  ) {
    return <LoadingPage />;
  }

  // Check if the API is offline (404 error from /api/me endpoint)
  // Or other network errors that would indicate API is unavailable
  if (
    apiRoles?.error?.response?.status === 404 || // API endpoint not found
    apiRoles?.error?.response?.status === 502 || // Bad Gateway
    apiRoles?.error?.response?.status === 503 || // Service Unavailable
    (apiRoles?.isSuccess && !apiRoles?.data) // No client principal data, indicating API might be offline
  ) {
    return <ApiOfflinePage />;
  }

  let roles = null;

  if (
    session?.isSuccess &&
    apiRoles?.isSuccess &&
    undefined !== apiRoles?.data?.clientPrincipal &&
    session?.data?.clientPrincipal?.userDetails &&
    apiRoles?.data?.clientPrincipal?.userDetails &&
    session?.data?.clientPrincipal?.userDetails !== apiRoles?.data?.clientPrincipal?.userDetails
  ) {
    // refetch the profile if the user details are different
    apiRoles.refetch();
  }

  if (null !== apiRoles?.data?.clientPrincipal && undefined !== apiRoles?.data) {
    roles = apiRoles?.data?.clientPrincipal?.userRoles ?? [];
  } else if (null === apiRoles?.data?.clientPrincipal || undefined === apiRoles?.data) {
    // CIPP has no identity for this caller at all, so there is nothing to deny
    return <UnauthenticatedPage reason={UNAUTH_SESSION} />;
  }
  if (null === roles) {
    return <UnauthenticatedPage reason={UNAUTH_SESSION} />;
  } else {
    const blockedRoles = ["anonymous", "authenticated"];
    const userRoles = roles?.filter((role) => !blockedRoles.includes(role)) ?? [];
    const isAuthenticated = userRoles.length > 0 && !apiRoles?.error;
    const isAdmin = roles?.includes("admin") || roles?.includes("superadmin");
    // from here the identity is real, it just isn't allowed through
    if (routeType === "admin" && !isAdmin) {
      return <UnauthenticatedPage reason={UNAUTH_PERMISSIONS} />;
    }

    if (!isAuthenticated) {
      return <UnauthenticatedPage reason={UNAUTH_PERMISSIONS} />;
    }

    // Block the whole app until the SAM app is configured: admins get the setup
    // wizard full-screen, everyone else a hold page. Strict === false so an absent
    // field (prerender, early-return /api/me shapes) never gates. /authredirect is
    // the OAuth popup callback for the wizard's SAM-creation step (posts back via
    // BroadcastChannel('cipp_auth')) - gating it would hang the sign-in popup.
    if (apiRoles.data?.initialSetupComplete === false && router.pathname !== "/authredirect") {
      return isAdmin ? <SetupGatePage /> : <SetupPendingPage />;
    }

    return children;
  }
};
