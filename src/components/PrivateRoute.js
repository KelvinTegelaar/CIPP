import { useRef } from "react";
import { ApiGetCall } from "../api/ApiCall.jsx";
import UnauthenticatedPage from "../pages/unauthenticated.js";
import LoadingPage from "../pages/loading.js";
import ApiOfflinePage from "../pages/api-offline.js";

export const PrivateRoute = ({ children, routeType }) => {
  // Track if we've ever been authenticated to prevent flashing loading/unauthenticated during navigation
  // Once authenticated, we render children immediately and let auth checks happen in background
  const wasAuthenticated = useRef(false);

  const session = ApiGetCall({
    url: "/.auth/me",
    queryKey: "authmeswa",
    refetchOnWindowFocus: true,
    staleTime: 120000, // 2 minutes
  });

  const apiRoles = ApiGetCall({
    url: "/api/me",
    queryKey: "authmecipp",
    retry: 2,
    staleTime: 60000, // 1 minute - cache API roles to prevent unnecessary refetches
    waiting: !session.isSuccess || session.data?.clientPrincipal === null,
  });

  // FAST PATH: If already authenticated, render children immediately
  // Auth checks continue in background - no loading screen during navigation
  if (wasAuthenticated.current) {
    // Still check for critical errors that require immediate action
    if (
      apiRoles?.error?.response?.status === 404 ||
      apiRoles?.error?.response?.status === 502 ||
      apiRoles?.error?.response?.status === 503
    ) {
      return <ApiOfflinePage />;
    }
    
    // Check if session has definitively expired (not just loading/refetching)
    if (
      session?.isSuccess && 
      session?.data?.clientPrincipal === null &&
      !session.isFetching
    ) {
      wasAuthenticated.current = false;
      return <UnauthenticatedPage />;
    }
    
    // Render children - auth is validated in background
    return children;
  }

  // INITIAL LOAD PATH: Only show loading on first authentication
  // return loading page here when roles are loading to avoid showing 401
  if (
    session.isLoading ||
    apiRoles.isLoading ||
    (session.data?.clientPrincipal && apiRoles.isPending) ||
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

  // If not logged into SWA
  if (session?.data?.clientPrincipal === null || session?.data === undefined) {
    return <UnauthenticatedPage />;
  }

  // Handle user detail mismatch - trigger refetch but don't block rendering
  if (
    session?.isSuccess &&
    apiRoles?.isSuccess &&
    apiRoles?.data?.clientPrincipal !== undefined &&
    session?.data?.clientPrincipal?.userDetails &&
    apiRoles?.data?.clientPrincipal?.userDetails &&
    session?.data?.clientPrincipal?.userDetails !== apiRoles?.data?.clientPrincipal?.userDetails
  ) {
    // Refetch in background, don't block
    apiRoles.refetch();
  }

  // Extract roles
  let roles = null;
  if (apiRoles?.data?.clientPrincipal !== null && apiRoles?.data !== undefined) {
    roles = apiRoles?.data?.clientPrincipal?.userRoles ?? [];
  } else {
    return <UnauthenticatedPage />;
  }

  if (roles === null) {
    return <UnauthenticatedPage />;
  }

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

  // Mark as successfully authenticated - future renders will use fast path
  wasAuthenticated.current = true;
  
  return children;
};
