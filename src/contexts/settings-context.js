import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import isEqual from "lodash.isequal";

const STORAGE_KEY = "app.settings";

let storage;

class MemoryStorage {
  get length() {
    return this.store.size;
  }

  store = new Map();

  clear() {
    this.store.clear();
  }

  getItem(key) {
    return this.store.get(key);
  }

  removeItem(key) {
    this.store.delete(key);
  }

  setItem(key, value) {
    this.store.set(key, value);
  }

  key(index) {
    return Array.from(this.store.values())[index] || null;
  }
}

try {
  storage = globalThis.localStorage;
} catch (err) {
  console.error("[Settings Context] Local storage is not available", err);
  storage = new MemoryStorage();
}

const restoreSettings = () => {
  let value = null;

  try {
    const restored = storage.getItem(STORAGE_KEY);

    if (restored) {
      value = JSON.parse(restored);
    }
  } catch (err) {
    console.error(err);
    // If stored data is not a strigified JSON this will fail,
    // that's why we catch the error
  }

  return value ? stripPersistedBrandingBlobs(stripServerManagedSettings(value)) : null;
};

const deleteSettings = () => {
  storage.removeItem(STORAGE_KEY);
};

/**
 * Branding is server state now, read via `useBrandingSettings`. Anything a previous version
 * persisted here is dropped on load rather than migrated - it is a stale copy, and its image
 * payloads used to exhaust the localStorage quota.
 */
const stripPersistedBrandingBlobs = (settings) => {
  if (!settings || typeof settings !== "object" || !("customBranding" in settings)) {
    return settings;
  }

  const { customBranding: _legacyBranding, ...rest } = settings;
  return rest;
};

const storeSettings = (value) => {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(stripPersistedBrandingBlobs(value)));
  } catch (err) {
    console.error("[Settings Context] Failed to persist settings", err);
    try {
      // Drop a bloated legacy blob so future writes can succeed
      storage.removeItem(STORAGE_KEY);
      storage.setItem(STORAGE_KEY, JSON.stringify(stripPersistedBrandingBlobs(value)));
    } catch (retryErr) {
      console.error("[Settings Context] Failed to recover settings storage", retryErr);
    }
  }
};

const stripServerManagedSettings = (settings) => {
  if (!settings || typeof settings !== "object") {
    return settings;
  }

  const { bookmarks, ...cleanedSettings } = settings;
  return cleanedSettings;
};

// First visit (no stored preference): follow the OS. 'browser' resolves against
// prefers-color-scheme at render time in _app.js, so the app keeps tracking the
// system preference until the user explicitly picks a mode with the theme toggle.
const systemPrefersDark =
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-color-scheme: dark)").matches;

const initialSettings = {
  direction: "ltr",
  paletteMode: systemPrefersDark ? "dark" : "light",
  currentTheme: { value: "browser", label: "Browser Default" },
  pinNav: true,
  currentTenant: null,
  showDevtools: false,
  showAdvancedTools: false,
  persistFilters: false,
  lastUsedFilters: {},
  breadcrumbMode: "hierarchical",
  bookmarkSidebar: true,
  bookmarkPopover: false,
  compactNav: false,
};

const initialState = {
  ...initialSettings,
  isInitialized: false,
};

export const SettingsContext = createContext({
  ...initialState,
  handleReset: () => {},
  handleUpdate: () => {},
  isCustom: false,
  setLastUsedFilter: () => {},
});

export const SettingsProvider = (props) => {
  const { children } = props;
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const restored = restoreSettings();

    if (restored) {
      const cleanedRestored = restored;

      if (!cleanedRestored.currentTheme && cleanedRestored.paletteMode) {
        cleanedRestored.currentTheme = {
          value: cleanedRestored.paletteMode,
          label: cleanedRestored.paletteMode,
        };
      }

      storeSettings(cleanedRestored);

      setState((prevState) => ({
        ...prevState,
        ...cleanedRestored,
        isInitialized: true,
      }));
    } else {
      // No stored settings found, initialize with defaults
      setState((prevState) => ({
        ...prevState,
        isInitialized: true,
      }));
    }
  }, []);

  useEffect(() => {
    if (state.isInitialized) {
      storeSettings(state);
    }
  }, [state]);

  const handleReset = useCallback(() => {
    deleteSettings();
    setState((prevState) => ({
      ...prevState,
      ...initialSettings,
    }));
  }, []);

  const handleUpdate = useCallback((settings) => {
    setState((prevState) => {
      // Filter out null and undefined values to prevent resetting settings
      const filteredSettings = Object.entries(settings).reduce((acc, [key, value]) => {
        if (key !== "bookmarks" && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const updatedSettings = stripServerManagedSettings({
        ...prevState,
        ...filteredSettings,
      });

      storeSettings(updatedSettings);

      return updatedSettings;
    });
  }, []);

  const isCustom = useMemo(() => {
    return !isEqual(initialSettings, {
      direction: state.direction,
      paletteMode: state.paletteMode,
      currentTheme: state.currentTheme,
      pinNav: state.pinNav,
    });
  }, [state]);

  return (
    <SettingsContext.Provider
      value={{
        ...state,
        handleReset,
        handleUpdate,
        isCustom,
        setLastUsedFilter: (page, filter) => {
          setState((prevState) => {
            const updated = stripServerManagedSettings({
              ...prevState,
              lastUsedFilters: {
                ...prevState.lastUsedFilters,
                [page]: filter,
              },
            });
            storeSettings(updated);
            return updated;
          });
        },
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const SettingsConsumer = SettingsContext.Consumer;
