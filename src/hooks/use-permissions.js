import { useCallback } from "react";
import { ApiGetCall } from "../api/ApiCall";
import { hasAccess, hasPermission, hasRole } from "../utils/permissions";

/**
 * Hook for checking user permissions and roles
 * Integrates with the existing CIPP authentication system
 */
export const usePermissions = () => {
  const currentRole = ApiGetCall({
    url: "/api/me",
    queryKey: "authmecipp",
  });

  const userRoles = currentRole.data?.clientPrincipal?.userRoles || [];
  const userPermissions = currentRole.data?.permissions || [];
  const isLoading = currentRole.isLoading;
  const isAuthenticated = currentRole.isSuccess && userRoles.length > 0;

  /**
   * Check if user has specific permissions
   * @param {string[]} requiredPermissions - Array of required permissions (supports wildcards)
   * @returns {boolean} - True if user has at least one of the required permissions
   */
  const checkPermissions = useCallback(
    (requiredPermissions) => {
      if (!isAuthenticated) return false;
      return hasPermission(userPermissions, requiredPermissions);
    },
    [userPermissions, isAuthenticated]
  );

  /**
   * Check if user has specific roles
   * @param {string[]} requiredRoles - Array of required roles
   * @returns {boolean} - True if user has at least one of the required roles
   */
  const checkRoles = useCallback(
    (requiredRoles) => {
      if (!isAuthenticated) return false;
      return hasRole(userRoles, requiredRoles);
    },
    [userRoles, isAuthenticated]
  );

  /**
   * Check if user has access based on both permissions and roles
   * @param {Object} config - Configuration object
   * @param {string[]} config.requiredPermissions - Array of required permissions
   * @param {string[]} config.requiredRoles - Array of required roles
   * @returns {boolean} - True if user has access
   */
  const checkAccess = useCallback(
    (config = {}) => {
      if (!isAuthenticated) return false;

      const { requiredPermissions = [], requiredRoles = [] } = config;

      return hasAccess({
        userPermissions,
        userRoles,
        requiredPermissions,
        requiredRoles,
      });
    },
    [userPermissions, userRoles, isAuthenticated]
  );

  return {
    userPermissions,
    userRoles,
    isLoading,
    isAuthenticated,
    checkPermissions,
    checkRoles,
    checkAccess,
  };
};

/**
 * Hook specifically for checking permissions with a simpler API
 * @param {string[]} requiredPermissions - Array of required permissions
 * @param {string[]} requiredRoles - Array of required roles
 * @returns {Object} - Object containing hasAccess boolean and loading state
 */
export const useHasPermission = (requiredPermissions = [], requiredRoles = []) => {
  const { checkAccess, isLoading, isAuthenticated } = usePermissions();

  const hasAccess = checkAccess({ requiredPermissions, requiredRoles });

  return {
    hasAccess,
    isLoading,
    isAuthenticated,
  };
};
