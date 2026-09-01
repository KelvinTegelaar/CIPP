import { ApiGetCall } from "../api/ApiCall";

/**
 * Resolves which directory roles the current user may assign via JIT Admin, based on the JIT Role
 * Template(s) attached to their CIPP custom role(s). When the user is unrestricted (no template, or a
 * base/admin role), all roles are available so existing configurations are not disturbed.
 *
 * Backend enforcement in ExecJitAdmin is authoritative; this hook only shapes the picker options.
 */
export const useJitAllowedRoles = () => {
  const query = ApiGetCall({
    url: "/api/ListJITAllowedRoles",
    queryKey: "JITAllowedRoles",
  });

  const restricted = query.data?.Restricted === true;
  const allowedRoleIds = query.data?.AllowedRoleIds || [];

  // Filter a list of role catalog entries ({ Name, ObjectId }) down to the allowed set.
  const filterRoles = (roles = []) =>
    restricted ? roles.filter((role) => allowedRoleIds.includes(role.ObjectId)) : roles;

  return {
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
    restricted,
    allowedRoleIds,
    filterRoles,
  };
};
