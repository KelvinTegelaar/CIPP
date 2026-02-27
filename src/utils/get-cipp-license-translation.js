import M365LicensesDefault from "../data/M365Licenses.json";
import M365LicensesAdditional from "../data/M365Licenses-additional.json";
import { getCachedLicense } from "./cipp-license-cache";
import licenseBackfillManager from "./cipp-license-backfill-manager";

export const getCippLicenseTranslation = (licenseArray) => {
  //combine M365LicensesDefault and M365LicensesAdditional to one array
  const M365Licenses = [...M365LicensesDefault, ...M365LicensesAdditional];
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

    // First, check static JSON files
    for (let x = 0; x < M365Licenses.length; x++) {
      if (licenseAssignment.skuId === M365Licenses[x].GUID) {
        licenses.push(
          M365Licenses[x].Product_Display_Name
            ? M365Licenses[x].Product_Display_Name
            : licenseAssignment.skuPartNumber,
        );
        found = true;
        break;
      }
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
