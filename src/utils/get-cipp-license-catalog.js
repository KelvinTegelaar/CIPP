import M365LicensesDefault from "../data/M365Licenses.json";
import M365LicensesAdditional from "../data/M365Licenses-additional.json";

// Build an index keyed by lowercased GUID with one entry per SKU (collapsing the
// per-service-plan rows in the source JSON into a single record).
let catalogCache = null;

const buildCatalog = () => {
  const map = new Map();
  for (const row of [...M365LicensesDefault, ...M365LicensesAdditional]) {
    if (!row?.GUID) continue;
    const key = row.GUID.toLowerCase();
    let entry = map.get(key);
    if (!entry) {
      entry = {
        skuId: row.GUID,
        skuPartNumber: row.String_Id || "",
        displayName: row.Product_Display_Name || row.String_Id || "",
        servicePlans: [],
        _planSet: new Set(),
      };
      map.set(key, entry);
    }
    if (!entry.skuPartNumber && row.String_Id) entry.skuPartNumber = row.String_Id;
    if (!entry.displayName && row.Product_Display_Name) entry.displayName = row.Product_Display_Name;

    if (row.Service_Plan_Id) {
      const planKey = row.Service_Plan_Id.toLowerCase();
      if (!entry._planSet.has(planKey)) {
        entry._planSet.add(planKey);
        entry.servicePlans.push({
          servicePlanId: row.Service_Plan_Id,
          servicePlanName: row.Service_Plan_Name || "",
          friendlyName: row.Service_Plans_Included_Friendly_Names || "",
        });
      }
    }
  }
  // Drop the helper Set before exposing entries.
  return Array.from(map.values()).map(({ _planSet, ...rest }) => rest);
};

const getCatalog = () => {
  if (!catalogCache) catalogCache = buildCatalog();
  return catalogCache;
};

/**
 * Search the local M365 license catalog. Matches against skuId (GUID),
 * skuPartNumber (String_Id), display name, and any service plan name or
 * friendly name. Returns up to `limit` results in the same envelope shape
 * Universal Search uses for API results.
 */
export const searchLocalLicenseCatalog = (query, limit = 10) => {
  if (!query || typeof query !== "string") return [];
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matches = [];
  for (const entry of getCatalog()) {
    if (matches.length >= limit) break;
    const haystacks = [
      entry.skuId,
      entry.skuPartNumber,
      entry.displayName,
      ...entry.servicePlans.flatMap((p) => [p.servicePlanName, p.friendlyName]),
    ];
    if (haystacks.some((v) => v && v.toLowerCase().includes(q))) {
      matches.push({
        Tenant: "",
        Type: "Licenses",
        RowKey: `Licenses-${entry.skuId}`,
        Data: {
          skuId: entry.skuId,
          skuPartNumber: entry.skuPartNumber,
          displayName: entry.displayName,
          servicePlans: entry.servicePlans,
          tenantCount: 0,
          totalAssigned: 0,
          totalAvailable: 0,
          tenants: [],
          source: "catalog",
        },
      });
    }
  }
  return matches;
};
