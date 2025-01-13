import { ApiGetCall } from "../api/ApiCall.jsx";
import UnauthenticatedPage from "../pages/unauthenticated.js";

export const PrivateRoute = ({ children, routeType }) => {
  const {
    data: profile,
    error,
    isFetching,
  } = ApiGetCall({
    url: "/.auth/me",
    queryKey: "authmecipp",
  });

  if (isFetching) {
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
    const isAuthenticated = roles.includes("authenticated") && !error;
    const isAdmin = roles.includes("admin");
    if (routeType === "admin") {
      return !isAdmin ? <UnauthenticatedPage /> : children;
    } else {
      return !isAuthenticated ? <UnauthenticatedPage /> : children;
    }
  }
};
