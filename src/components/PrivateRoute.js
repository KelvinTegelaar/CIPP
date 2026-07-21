import { ApiGetCall } from "../api/ApiCall.jsx";
import UnauthenticatedPage from "../pages/unauthenticated.js";
import LoadingPage from "../pages/loading.js";
import ApiOfflinePage from "../pages/api-offline.js";
import { useState, useEffect } from "react";

// EasyAuth exposes the signed-in identity in two shapes depending on the host:
//   - Static Web Apps:      { clientPrincipal: { userDetails, userRoles, ... } }
//   - App Service EasyAuth: [ { user_id, user_claims: [...], access_token, ... } ]
// an authenticated session must be detected from either populated shape.
const hasAuthenticatedSession = (data) =>
  Boolean(data?.clientPrincipal) || (Array.isArray(data) && data.length > 0);

export const PrivateRoute = ({ children, routeType }) => {
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

  // If latched as unauthenticated, always show unauthenticated page
  if (unauthLatched) {
    return <UnauthenticatedPage />;
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
    return <UnauthenticatedPage />;
  }
  if (null === roles) {
    return <UnauthenticatedPage />;
  } else {
    const blockedRoles = ["anonymous", "authenticated"];
    const userRoles = roles?.filter((role) => !blockedRoles.includes(role)) ?? [];
    const isAuthenticated = userRoles.length > 0 && !apiRoles?.error;
    const isAdmin = roles?.includes("admin") || roles?.includes("superadmin");
    if (routeType === "admin" && !isAdmin) {
      return <UnauthenticatedPage />;
    }

    if (!isAuthenticated) {
      return <UnauthenticatedPage />;
    }

    return children;
  }
};
