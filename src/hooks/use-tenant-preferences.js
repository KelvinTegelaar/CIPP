import { useCallback, useEffect, useState } from "react";
import {
  addRecentTenant,
  getFavoriteTenants,
  getRecentTenants,
  isFavoriteTenant,
  TENANT_FAVORITES_STORAGE_KEY,
  TENANT_PREFERENCES_CHANGE_EVENT,
  TENANT_RECENT_STORAGE_KEY,
  toggleFavoriteTenant,
} from "../utils/tenant-preferences";

/**
 * Browser-local recent + favorite tenants (localStorage).
 */
export function useTenantPreferences() {
  const [recent, setRecent] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const refresh = useCallback(() => {
    setRecent(getRecentTenants());
    setFavorites(getFavoriteTenants());
  }, []);

  useEffect(() => {
    refresh();

    const onStorage = (event) => {
      if (event.key === TENANT_RECENT_STORAGE_KEY || event.key === TENANT_FAVORITES_STORAGE_KEY || event.key === null) {
        refresh();
      }
    };
    const onCustom = () => refresh();

    window.addEventListener("storage", onStorage);
    window.addEventListener(TENANT_PREFERENCES_CHANGE_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(TENANT_PREFERENCES_CHANGE_EVENT, onCustom);
    };
  }, [refresh]);

  const trackRecent = useCallback(
    (tenant) => {
      addRecentTenant(tenant);
      refresh();
    },
    [refresh]
  );

  const toggleFavorite = useCallback(
    (tenant) => {
      const result = toggleFavoriteTenant(tenant);
      refresh();
      return result;
    },
    [refresh]
  );

  const isFavorite = useCallback((value) => isFavoriteTenant(value) || favorites.some((item) => item.value === value), [favorites]);

  return {
    recent,
    favorites,
    trackRecent,
    toggleFavorite,
    isFavorite,
  };
}
