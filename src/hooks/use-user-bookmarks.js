import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiGetCall, ApiPostCall } from "../api/ApiCall";

const SETTINGS_STORAGE_KEY = "app.settings";

const sanitizeBookmark = (bookmark) => {
  if (!bookmark || typeof bookmark !== "object") {
    return null;
  }

  if (typeof bookmark.path !== "string") {
    return null;
  }

  const path = bookmark.path.trim();
  if (!path) {
    return null;
  }

  const label =
    typeof bookmark.label === "string" && bookmark.label.trim()
      ? bookmark.label.trim()
      : path;

  return {
    ...bookmark,
    path,
    label,
  };
};

const normalizeBookmarks = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeBookmark).filter(Boolean);
  }

  const singleBookmark = sanitizeBookmark(value);
  if (singleBookmark) {
    return [singleBookmark];
  }

  return [];
};

const getLocalStoredBookmarks = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const restored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!restored) {
      return [];
    }

    const parsed = JSON.parse(restored);
    return normalizeBookmarks(parsed?.bookmarks);
  } catch {
    return [];
  }
};

const clearLocalStoredBookmarks = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const restored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!restored) {
      return;
    }

    const parsed = JSON.parse(restored);
    if (!parsed || typeof parsed !== "object" || !Object.prototype.hasOwnProperty.call(parsed, "bookmarks")) {
      return;
    }

    delete parsed.bookmarks;
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    return;
  }
};

const getBookmarksFromSettings = (settingsData) => {
  if (!settingsData) {
    return [];
  }

  if (settingsData.UserBookmarks) {
    return normalizeBookmarks(settingsData.UserBookmarks);
  }

  if (settingsData.bookmarks) {
    return normalizeBookmarks(settingsData.bookmarks);
  }

  return [];
};

export const useUserBookmarks = () => {
  const queryClient = useQueryClient();
  const localMigrationComplete = useRef(false);
  const localMigrationInFlight = useRef(false);

  const userSettings = ApiGetCall({
    url: "/api/ListUserSettings",
    queryKey: "userSettings",
  });

  const auth = ApiGetCall({
    url: "/api/me",
    queryKey: "authmecipp",
  });

  const saveBookmarksPost = ApiPostCall({
    relatedQueryKeys: "userSettings",
  });

  const bookmarks = useMemo(() => {
    return getBookmarksFromSettings(userSettings.data);
  }, [userSettings.data]);

  const persistBookmarks = useCallback(
    (nextBookmarks, callbacks = {}) => {
      const safeBookmarks = normalizeBookmarks(nextBookmarks);

      queryClient.setQueryData(["userSettings"], (previous) => ({
        ...(previous || {}),
        UserBookmarks: safeBookmarks,
        bookmarks: safeBookmarks,
      }));

      const user = auth.data?.clientPrincipal?.userDetails;
      if (!user) {
        return false;
      }

      saveBookmarksPost.mutate(
        {
          url: "/api/ExecUserBookmarks",
          data: {
            user,
            currentSettings: {
              bookmarks: safeBookmarks,
            },
          },
        },
        callbacks
      );

      return true;
    },
    [auth.data?.clientPrincipal?.userDetails, queryClient, saveBookmarksPost]
  );

  const setBookmarks = useCallback(
    (nextBookmarks) => {
      persistBookmarks(nextBookmarks);
    },
    [persistBookmarks]
  );

  useEffect(() => {
    if (localMigrationComplete.current || localMigrationInFlight.current) {
      return;
    }

    if (!auth.data?.clientPrincipal?.userDetails) {
      return;
    }

    if (bookmarks.length > 0) {
      localMigrationComplete.current = true;
      return;
    }

    const localBookmarks = getLocalStoredBookmarks();
    if (localBookmarks.length === 0) {
      localMigrationComplete.current = true;
      return;
    }

    localMigrationInFlight.current = true;
    const didPost = persistBookmarks(localBookmarks, {
      onSuccess: () => {
        clearLocalStoredBookmarks();
        localMigrationInFlight.current = false;
        localMigrationComplete.current = true;
      },
      onError: () => {
        localMigrationInFlight.current = false;
      },
    });

    if (!didPost) {
      localMigrationInFlight.current = false;
    }
  }, [auth.data?.clientPrincipal?.userDetails, bookmarks.length, persistBookmarks]);

  return {
    bookmarks,
    setBookmarks,
    isLoading: userSettings.isLoading,
    isSaving: saveBookmarksPost.isPending,
  };
};