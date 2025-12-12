import { getCippLicenseTranslation } from "./get-cipp-license-translation";

/**
 * Extracts unique licenses from assignedLicenses data
 * @param {Array} dataArray - Array of user data containing assignedLicenses
 * @returns {Array} Array of unique license objects with skuId and translated name
 */
export const getCippUniqueLicenses = (dataArray) => {
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return [];
  }

  const uniqueLicensesMap = new Map();

  // Iterate through all users and their assigned licenses
  dataArray.forEach((user) => {
    if (user.assignedLicenses && Array.isArray(user.assignedLicenses)) {
      user.assignedLicenses.forEach((license) => {
        if (license && license.skuId) {
          // Use skuId as the unique key
          if (!uniqueLicensesMap.has(license.skuId)) {
            // Get the translated name for this license
            const translatedName = getCippLicenseTranslation([license]);
            const displayName = Array.isArray(translatedName) ? translatedName[0] : translatedName;

            uniqueLicensesMap.set(license.skuId, {
              skuId: license.skuId,
              displayName: displayName,
              // Store the original license object for reference
              originalLicense: license,
            });
          }
        }
      });
    }
  });

  // Convert map to array and sort by display name
  return Array.from(uniqueLicensesMap.values()).sort((a, b) => {
    const nameA = a?.displayName || '';
    const nameB = b?.displayName || '';
    return nameA.localeCompare(nameB);
  });
};

/**
 * Checks if a user has all the specified licenses
 * @param {Array} userLicenses - User's assigned licenses array
 * @param {Array} requiredLicenseSkuIds - Array of required license skuIds
 * @returns {boolean} True if user has all required licenses
 */
export const userHasAllLicenses = (userLicenses, requiredLicenseSkuIds) => {
  if (!Array.isArray(userLicenses) || !Array.isArray(requiredLicenseSkuIds)) {
    return false;
  }

  if (requiredLicenseSkuIds.length === 0) {
    return true; // No licenses required
  }

  const userSkuIds = userLicenses.map((license) => license.skuId).filter(Boolean);

  // Check if user has all required licenses
  return requiredLicenseSkuIds.every((requiredSkuId) => userSkuIds.includes(requiredSkuId));
};

/**
 * Checks if a user has any of the specified licenses
 * @param {Array} userLicenses - User's assigned licenses array
 * @param {Array} licenseSkuIds - Array of license skuIds to check
 * @returns {boolean} True if user has any of the specified licenses
 */
export const userHasAnyLicense = (userLicenses, licenseSkuIds) => {
  if (!Array.isArray(userLicenses) || !Array.isArray(licenseSkuIds)) {
    return false;
  }

  if (licenseSkuIds.length === 0) {
    return true; // No licenses specified
  }

  const userSkuIds = userLicenses.map((license) => license.skuId).filter(Boolean);

  // Check if user has any of the specified licenses
  return licenseSkuIds.some((licenseSkuId) => userSkuIds.includes(licenseSkuId));
};
