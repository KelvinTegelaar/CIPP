import Portals from "../data/portals";

// Which M365 portal links the user wants shown, resolved from user-specific settings
// (preferred), tenant-level settings, or the all-on defaults. Pure so both the dashboard
// menu and the mobile FAB sheet share one filter (and it stays unit-testable).
export const getFilteredPortals = (settings) => {
  const defaultLinks = {
    M365_Portal: true,
    Exchange_Portal: true,
    Entra_Portal: true,
    Teams_Portal: true,
    Azure_Portal: true,
    Intune_Portal: true,
    SharePoint_Admin: true,
    Security_Portal: true,
    Compliance_Portal: true,
    Power_Platform_Portal: true,
    Power_BI_Portal: true,
  };

  let portalLinks;
  if (settings?.UserSpecificSettings?.portalLinks) {
    portalLinks = {
      ...defaultLinks,
      ...settings.UserSpecificSettings.portalLinks,
    };
  } else if (settings?.portalLinks) {
    portalLinks = { ...defaultLinks, ...settings.portalLinks };
  } else {
    portalLinks = defaultLinks;
  }

  return Portals.filter((portal) => {
    const settingKey = portal.name;
    return settingKey ? portalLinks[settingKey] === true : true;
  });
};
