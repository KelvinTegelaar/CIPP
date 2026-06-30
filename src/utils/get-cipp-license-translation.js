import { getM365Licenses } from "./m365-licenses-data";
import { getCachedLicense } from "./cipp-license-cache";
import licenseBackfillManager from "./cipp-license-backfill-manager";

// Lazily build a Map for O(1) GUID -> Product_Display_Name lookups once the license data has loaded.
let _licenseByGuid = null;
const licenseByGuidMap = () => {
  if (!_licenseByGuid) {
    const all = getM365Licenses();
    if (all.length) {
      _licenseByGuid = new Map();
      all.forEach((entry) => {
        if (entry.GUID) {
          const key = entry.GUID.toLowerCase();
          if (!_licenseByGuid.has(key)) {
            _licenseByGuid.set(key, entry.Product_Display_Name);
          }
        }
      });
    }
  }
  return _licenseByGuid || new Map();
};

export const getCippLicenseTranslation = (licenseArray) => {
  let licenses = [];
  let missingSkuIds = [];

  if (Array.isArray(licenseArray) && typeof licenseArray[0] === "string") {
    return licenseArray;
  }

  if (!Array.isArray(licenseArray) && typeof licenseArray === "object") {
    licenseArray = [licenseArray];
  }

  if (!licenseArray || licenseArray.length === 0) {
    return ["No Licenses Assigned"];
  }

  licenseArray?.forEach((licenseAssignment) => {
    let found = false;

    // First, check static JSON map (O(1) lookup)
    const skuLower = licenseAssignment.skuId?.toLowerCase();
    const displayName = skuLower ? licenseByGuidMap().get(skuLower) : undefined;
    if (displayName) {
      licenses.push(displayName);
      found = true;
    } else if (skuLower && licenseByGuidMap().has(skuLower)) {
      // Entry exists but Product_Display_Name is falsy — fall back to skuPartNumber
      licenses.push(licenseAssignment.skuPartNumber || licenseAssignment.skuId);
      found = true;
    }

    // Second, check dynamic cache
    if (!found && licenseAssignment.skuId) {
      const cachedName = getCachedLicense(licenseAssignment.skuId);
      if (cachedName) {
        licenses.push(cachedName);
        found = true;
      }
    }

    // Finally, fall back to skuPartNumber, then skuId, then "Unknown License"
    if (!found) {
      const fallbackName =
        licenseAssignment.skuPartNumber || licenseAssignment.skuId || "Unknown License";
      licenses.push(fallbackName);

      // Queue this skuId for backfill if we have it
      if (licenseAssignment.skuId) {
        missingSkuIds.push(licenseAssignment.skuId);
      }
    }
  });

  // Trigger backfill for missing licenses
  if (missingSkuIds.length > 0) {
    licenseBackfillManager.addMissingSkuIds(missingSkuIds);
  }

  if (!licenses || licenses.length === 0) {
    return ["No Licenses Assigned"];
  }
  return licenses;
};
