import GDAPRoles from "../data/GDAPRoles.json";

export const getCippRoleTranslation = (role) => {
  let found = false;
  for (let x = 0; x < GDAPRoles.length; x++) {
    if (role === GDAPRoles?.[x]?.ObjectId) {
      return GDAPRoles?.[x]?.Name;
    }
  }
  if (!found) {
    return role;
  }
};
