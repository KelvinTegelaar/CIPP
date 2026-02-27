/**
 * License cache manager for dynamically loaded licenses
 * Uses localStorage to permanently cache licenses fetched from the API
 * Cache only grows (appends missing licenses) and never expires
 */

const CACHE_KEY = "cipp_dynamic_licenses";
const CACHE_VERSION = "1.0";

/**
 * Get the license cache from localStorage
 * @returns {Object} Cache object with version, timestamp, and licenses map
 */
const getCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return { version: CACHE_VERSION, timestamp: Date.now(), licenses: {} };
    }

    const parsed = JSON.parse(cached);

    // Check cache version - clear if outdated
    if (parsed.version !== CACHE_VERSION) {
      localStorage.removeItem(CACHE_KEY);
      return { version: CACHE_VERSION, timestamp: Date.now(), licenses: {} };
    }

    return parsed;
  } catch (error) {
    console.error("Error reading license cache:", error);
    return { version: CACHE_VERSION, timestamp: Date.now(), licenses: {} };
  }
};

/**
 * Save the license cache to localStorage
 * @param {Object} cache - Cache object to save
 */
const saveCache = (cache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Error saving license cache:", error);
  }
};

/**
 * Get a license from the cache by skuId
 * @param {string} skuId - The license skuId (GUID)
 * @returns {string|null} The display name if found, null otherwise
 */
export const getCachedLicense = (skuId) => {
  if (!skuId) return null;

  const cache = getCache();
  return cache.licenses[skuId.toLowerCase()] || null;
};

/**
 * Add licenses to the cache
 * @param {Array} licenses - Array of license objects with skuId and displayName
 */
export const addLicensesToCache = (licenses) => {
  if (!Array.isArray(licenses) || licenses.length === 0) return;

  const cache = getCache();

  licenses.forEach((license) => {
    if (license.skuId && license.displayName) {
      cache.licenses[license.skuId.toLowerCase()] = license.displayName;
    }
  });

  cache.timestamp = Date.now();
  saveCache(cache);
};

/**
 * Check if licenses exist in cache
 * @param {Array<string>} skuIds - Array of skuIds to check
 * @returns {Array<string>} Array of skuIds that are NOT in cache
 */
export const getMissingFromCache = (skuIds) => {
  if (!Array.isArray(skuIds) || skuIds.length === 0) return [];

  const cache = getCache();
  return skuIds.filter((skuId) => !cache.licenses[skuId.toLowerCase()]);
};

/**
 * Clear the entire license cache
 */
export const clearLicenseCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error("Error clearing license cache:", error);
  }
};

/**
 * Get all cached licenses
 * @returns {Object} Map of skuId -> displayName
 */
export const getAllCachedLicenses = () => {
  const cache = getCache();
  return cache.licenses;
};
