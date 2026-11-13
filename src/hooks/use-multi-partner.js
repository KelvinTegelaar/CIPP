import { ApiGetCall } from "../api/ApiCall";
import { usePermissions } from "./use-permissions";

// Multi-partner UI gate: MultiPartner feature flag + superadmin role, plus the partner list.
export const useMultiPartner = () => {
  const { checkRoles } = usePermissions();
  const featureFlags = ApiGetCall({
    url: "/api/ListFeatureFlags",
    queryKey: "featureFlags",
    staleTime: 600000,
  });
  const multiPartnerEnabled =
    Array.isArray(featureFlags.data) &&
    featureFlags.data.some((flag) => flag.Id === "MultiPartner" && flag.Enabled === true) &&
    checkRoles(["superadmin"]);

  const partnerTenants = ApiGetCall({
    url: "/api/ListPartnerTenants",
    queryKey: "partnerTenants",
    waiting: multiPartnerEnabled,
  });
  const partners = partnerTenants.data?.Results || [];

  return {
    multiPartnerEnabled,
    partners,
    partnerTenants,
    hasMultiplePartners: multiPartnerEnabled && partners.length > 1,
    partnerOptions: partners.map((partner) => ({
      label: partner.displayName,
      value: partner.partnerTenantId,
    })),
  };
};

export default useMultiPartner;
