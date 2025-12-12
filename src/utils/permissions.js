import Button from "@mui/material/Button";
import { usePermissions } from "/src/hooks/use-permissions.js";
/**
 * Permission Helper Utilities
 *
 * This module provides utilities for checking user permissions with pattern matching support.
 * It uses the same logic as the navigation system to ensure consistency across the application.
 */

/**
 * Check if user has permission using pattern matching
 * @param {string[]} userPermissions - Array of user permissions
 * @param {string[]} requiredPermissions - Array of required permissions (can include wildcards)
 * @returns {boolean} - True if user has at least one of the required permissions
 */
export const hasPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !requiredPermissions) {
    return false;
  }

  if (!Array.isArray(userPermissions) || !Array.isArray(requiredPermissions)) {
    return false;
  }

  if (requiredPermissions.length === 0) {
    return true; // No permissions required
  }

  return userPermissions.some((userPerm) => {
    return requiredPermissions.some((requiredPerm) => {
      // Exact match
      if (userPerm === requiredPerm) {
        return true;
      }

      // Pattern matching - check if required permission contains wildcards
      if (requiredPerm.includes("*")) {
        // Convert wildcard pattern to regex
        const regexPattern = requiredPerm
          .replace(/\./g, "\\.") // Escape dots
          .replace(/\*/g, ".*"); // Convert * to .*
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(userPerm);
      }

      return false;
    });
  });
};

/**
 * Check if user has any of the required roles
 * @param {string[]} userRoles - Array of user roles
 * @param {string[]} requiredRoles - Array of required roles
 * @returns {boolean} - True if user has at least one of the required roles
 */
export const hasRole = (userRoles, requiredRoles) => {
  if (!userRoles || !requiredRoles) {
    return false;
  }

  if (!Array.isArray(userRoles) || !Array.isArray(requiredRoles)) {
    return false;
  }

  if (requiredRoles.length === 0) {
    return true; // No roles required
  }

  return requiredRoles.some((requiredRole) => userRoles.includes(requiredRole));
};

/**
 * Check if user has access based on both permissions and roles
 * @param {Object} config - Configuration object
 * @param {string[]} config.userPermissions - Array of user permissions
 * @param {string[]} config.userRoles - Array of user roles
 * @param {string[]} config.requiredPermissions - Array of required permissions (can include wildcards)
 * @param {string[]} config.requiredRoles - Array of required roles
 * @returns {boolean} - True if user has access
 */
export const hasAccess = ({
  userPermissions,
  userRoles,
  requiredPermissions = [],
  requiredRoles = [],
}) => {
  // Check roles first (if any are required)
  if (requiredRoles.length > 0) {
    const hasRequiredRole = hasRole(userRoles, requiredRoles);
    if (!hasRequiredRole) {
      return false;
    }
  }

  // Check permissions (if any are required)
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = hasPermission(userPermissions, requiredPermissions);
    if (!hasRequiredPermission) {
      return false;
    }
  }

  return true;
};

/**
 * Hook for checking permissions in React components
 * @param {string[]} requiredPermissions - Array of required permissions (can include wildcards)
 * @param {string[]} requiredRoles - Array of required roles
 * @returns {boolean} - True if user has access
 */
export const useHasAccess = (requiredPermissions = [], requiredRoles = []) => {
  // This would typically use a context or hook to get current user permissions
  // For now, we'll return a function that can be called with user data
  return (userPermissions, userRoles) => {
    return hasAccess({
      userPermissions,
      userRoles,
      requiredPermissions,
      requiredRoles,
    });
  };
};

/**
 * Higher-order component to conditionally render based on permissions
 * @param {Object} config - Configuration object
 * @param {React.Component} config.component - Component to render if user has access
 * @param {string[]} config.requiredPermissions - Array of required permissions
 * @param {string[]} config.requiredRoles - Array of required roles
 * @param {React.Component} config.fallback - Component to render if user doesn't have access
 * @returns {React.Component} - Conditional component
 */
export const withPermissions = ({
  component: Component,
  requiredPermissions = [],
  requiredRoles = [],
  fallback = null,
}) => {
  return (props) => {
    const { userPermissions, userRoles, ...restProps } = props;

    const hasRequiredAccess = hasAccess({
      userPermissions,
      userRoles,
      requiredPermissions,
      requiredRoles,
    });

    if (hasRequiredAccess) {
      return <Component {...restProps} />;
    }

    return fallback;
  };
};

/**
 * Permission-aware Button component
 * @param {Object} props - Button props
 * @param {string[]} props.requiredPermissions - Array of required permissions
 * @param {string[]} props.requiredRoles - Array of required roles
 * @param {boolean} props.hideIfNoAccess - Hide button if user doesn't have access (default: false)
 * @returns {React.Component} - Permission-aware button
 */
export const PermissionButton = ({
  requiredPermissions = [],
  requiredRoles = [],
  hideIfNoAccess = false,
  children,
  ...buttonProps
}) => {
  const { userPermissions, userRoles, isAuthenticated } = usePermissions();

  const hasRequiredAccess =
    isAuthenticated &&
    hasAccess({
      userPermissions,
      userRoles,
      requiredPermissions,
      requiredRoles,
    });

  if (!hasRequiredAccess && hideIfNoAccess) {
    return null;
  }

  return (
    <Button disabled={!hasRequiredAccess} {...buttonProps}>
      {children}
    </Button>
  );
};

/**
 * Permission-aware conditional rendering component
 * @param {Object} props - Component props
 * @param {string[]} props.requiredPermissions - Array of required permissions
 * @param {string[]} props.requiredRoles - Array of required roles
 * @param {React.ReactNode} props.children - Content to render if user has access
 * @param {React.ReactNode} props.fallback - Content to render if user doesn't have access
 * @returns {React.Component} - Conditional component
 */
export const PermissionCheck = ({
  requiredPermissions = [],
  requiredRoles = [],
  children,
  fallback = null,
}) => {
  const { userPermissions, userRoles, isAuthenticated } = usePermissions();

  const hasRequiredAccess =
    isAuthenticated &&
    hasAccess({
      userPermissions,
      userRoles,
      requiredPermissions,
      requiredRoles,
    });

  if (hasRequiredAccess) {
    return children;
  }

  return fallback;
};
