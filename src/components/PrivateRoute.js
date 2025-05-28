import { ApiGetCall } from "../api/ApiCall.jsx";
import UnauthenticatedPage from "../pages/unauthenticated.js";
import LoadingPage from "../pages/loading.js";

export const PrivateRoute = ({ children, routeType }) => {
  const {
    data: profile,
    error,
    isLoading,
    isSuccess,
    refetch,
  } = ApiGetCall({
    url: "/api/me",
    queryKey: "authmecipp",
  });

  const session = ApiGetCall({
    url: "/.auth/me",
    queryKey: "authmeswa",
    refetchOnWindowFocus: true,
    staleTime: 120000, // 2 minutes
  });

  // Check if the session is still loading before determining authentication status
  if (session.isLoading || isLoading) {
    return <LoadingPage />;
  }

  // if not logged into swa
  if (null === session?.data?.clientPrincipal || session?.data === undefined) {
    return <UnauthenticatedPage />;
  }

  let roles = null;

  if (
    session?.isSuccess &&
    isSuccess &&
    undefined !== profile &&
    session?.data?.clientPrincipal?.userDetails &&
    profile?.userDetails &&
    session?.data?.clientPrincipal?.userDetails !== profile?.userDetails
  ) {
    // refetch the profile if the user details are different
    refetch();
  }

  if (null !== profile?.clientPrincipal && undefined !== profile) {
    roles = profile?.clientPrincipal?.userRoles;
  } else if (null === profile?.clientPrincipal || undefined === profile) {
    return <UnauthenticatedPage />;
  }
  if (null === roles) {
    return <UnauthenticatedPage />;
  } else {
    const blockedRoles = ["anonymous", "authenticated"];
    const userRoles = roles?.filter((role) => !blockedRoles.includes(role)) ?? [];
    const isAuthenticated = userRoles.length > 0 && !error;
    const isAdmin = roles.includes("admin") || roles.includes("superadmin");
    if (routeType === "admin") {
      return !isAdmin ? <UnauthenticatedPage /> : children;
    } else {
      return !isAuthenticated ? <UnauthenticatedPage /> : children;
    }
  }
};
