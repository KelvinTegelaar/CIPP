import { ApiGetCall } from "../api/ApiCall.jsx";
import UnauthenticatedPage from "../pages/unauthenticated.js";
import LoadingPage from "../pages/loading.js";
import ApiOfflinePage from "../pages/api-offline.js";

export const PrivateRoute = ({ children, routeType }) => {
  const apiRoles = ApiGetCall({
    url: "/api/me",
    queryKey: "authmecipp",
    retry: 2, // Reduced retry count to show offline message sooner
  });

  const session = ApiGetCall({
    url: "/.auth/me",
    queryKey: "authmeswa",
    refetchOnWindowFocus: true,
    staleTime: 120000, // 2 minutes
  });

  // Check if the session is still loading before determining authentication status
  if (
    session.isLoading ||
    apiRoles.isLoading ||
    (apiRoles.isFetching && (apiRoles.data === null || apiRoles.data === undefined))
  ) {
    return <LoadingPage />;
  }

  // Check if the API is offline (404 error from /api/me endpoint)
  // Or other network errors that would indicate API is unavailable
  if (
    apiRoles?.error?.response?.status === 404 || // API endpoint not found
    apiRoles?.error?.response?.status === 502 || // Service unavailable
    (apiRoles?.isSuccess && !apiRoles?.data) // No client principal data, indicating API might be offline
  ) {
    return <ApiOfflinePage />;
  }

  // if not logged into swa
  if (null === session?.data?.clientPrincipal || session?.data === undefined) {
    return <UnauthenticatedPage />;
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
    if (routeType === "admin") {
      return !isAdmin ? <UnauthenticatedPage /> : children;
    } else {
      return !isAuthenticated ? <UnauthenticatedPage /> : children;
    }
  }
};
