import { ApiGetCall } from "../api/ApiCall.jsx";
import UnauthenticatedPage from "../pages/unauthenticated.js";

export const PrivateRoute = ({ children, routeType }) => {
  const {
    data: profile,
    error,
    isLoading,
  } = ApiGetCall({
    url: "/.auth/me",
    queryKey: "authmecipp",
    refetchOnWindowFocus: true,
    staleTime: 120000, // 2 minutes
  });

  if (isLoading) {
    return "Loading...";
  }

  let roles = null;
  if (null !== profile?.clientPrincipal) {
    roles = profile?.clientPrincipal.userRoles;
  } else if (null === profile?.clientPrincipal) {
    return <UnauthenticatedPage />;
  }
  if (null === roles) {
    return <UnauthenticatedPage />;
  } else {
    const blockedRoles = ["anonymous", "authenticated"];
    const userRoles = roles.filter((role) => !blockedRoles.includes(role));
    const isAuthenticated = userRoles.length > 0 && !error;
    const isAdmin = roles.includes("admin");
    if (routeType === "admin") {
      return !isAdmin ? <UnauthenticatedPage /> : children;
    } else {
      return !isAuthenticated ? <UnauthenticatedPage /> : children;
    }
  }
};
