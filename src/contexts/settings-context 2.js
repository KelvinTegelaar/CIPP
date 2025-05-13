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

  return value;
};

const deleteSettings = () => {
  storage.removeItem(STORAGE_KEY);
};

const storeSettings = (value) => {
  storage.setItem(STORAGE_KEY, JSON.stringify(value));
};

const initialSettings = {
  direction: "ltr",
  paletteMode: "light",
  pinNav: true,
  currentTenant: null,
  showDevtools: false,
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
});

export const SettingsProvider = (props) => {
  const { children } = props;
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const restored = restoreSettings();

    if (restored) {
      setState((prevState) => ({
        ...prevState,
        ...restored,
        isInitialized: true,
      }));
    }
  }, []);

  const handleReset = useCallback(() => {
    deleteSettings();
    setState((prevState) => ({
      ...prevState,
      ...initialSettings,
    }));
  }, []);

  const handleUpdate = useCallback((settings) => {
    setState((prevState) => {
      storeSettings({
        ...prevState,
        ...settings,
      });

      return {
        ...prevState,
        ...settings,
      };
    });
  }, []);

  const isCustom = useMemo(() => {
    return !isEqual(initialSettings, {
      direction: state.direction,
      paletteMode: state.paletteMode,
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
