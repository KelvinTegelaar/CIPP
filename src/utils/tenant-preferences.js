const RECENT_KEY = "cipp:recentTenants";
const FAVORITES_KEY = "cipp:favoriteTenants";
const CHANGE_EVENT = "cipp:tenant-preferences";
const MAX_RECENT = 8;

/**
 * @typedef {{ value: string, label: string, customerId?: string }} TenantPreference
 */

function readList(key) {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item) => item && typeof item.value === "string" && item.value.length > 0);
  } catch {
    return [];
  }
}

function writeList(key, list) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch (error) {
    console.warn(`Failed to write ${key} to localStorage:`, error);
  }
}

/**
 * @param {Partial<TenantPreference> & { addedFields?: { customerId?: string, displayName?: string } }} tenant
 * @returns {TenantPreference | null}
 */
function normalizeTenant(tenant) {
  if (!tenant) {
    return null;
  }
  const value = tenant.value ?? tenant.defaultDomainName;
  if (!value || typeof value !== "string") {
    return null;
  }
  return {
    value,
    label: tenant.label || tenant.addedFields?.displayName || value,
    customerId: tenant.customerId ?? tenant.addedFields?.customerId,
  };
}

export function getRecentTenants() {
  return readList(RECENT_KEY);
}

export function getFavoriteTenants() {
  return readList(FAVORITES_KEY);
}

/**
 * @param {Partial<TenantPreference>} tenant
 */
export function addRecentTenant(tenant) {
  const normalized = normalizeTenant(tenant);
  if (!normalized || normalized.value === "AllTenants") {
    return getRecentTenants();
  }

  const next = [normalized, ...getRecentTenants().filter((item) => item.value !== normalized.value)].slice(0, MAX_RECENT);
  writeList(RECENT_KEY, next);
  return next;
}

/**
 * @param {string} value
 */
export function isFavoriteTenant(value) {
  if (!value) {
    return false;
  }
  return getFavoriteTenants().some((item) => item.value === value);
}

/**
 * @param {Partial<TenantPreference>} tenant
 * @returns {{ favorites: TenantPreference[], isFavorite: boolean }}
 */
export function toggleFavoriteTenant(tenant) {
  const normalized = normalizeTenant(tenant);
  if (!normalized || normalized.value === "AllTenants") {
    return { favorites: getFavoriteTenants(), isFavorite: false };
  }

  const current = getFavoriteTenants();
  const exists = current.some((item) => item.value === normalized.value);
  const favorites = exists ? current.filter((item) => item.value !== normalized.value) : [...current, normalized];

  writeList(FAVORITES_KEY, favorites);
  return { favorites, isFavorite: !exists };
}

export const TENANT_PREFERENCES_CHANGE_EVENT = CHANGE_EVENT;
export const TENANT_RECENT_STORAGE_KEY = RECENT_KEY;
export const TENANT_FAVORITES_STORAGE_KEY = FAVORITES_KEY;
