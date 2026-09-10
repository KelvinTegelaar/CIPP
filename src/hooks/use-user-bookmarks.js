import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiGetCall, ApiPostCall } from "../api/ApiCall";

export const MAX_BOOKMARKS = 50;

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

  const isBookmarked = useCallback(
    (path) => bookmarks.some((bookmark) => bookmark.path === path),
    [bookmarks]
  );

  // Bookmarks are keyed on path alone, so adding and removing are the same gesture. Returns the
  // action taken so callers can react to hitting the cap instead of silently doing nothing.
  const toggleBookmark = useCallback(
    (bookmark) => {
      if (!bookmark?.path) {
        return "invalid";
      }

      if (bookmarks.some((existing) => existing.path === bookmark.path)) {
        setBookmarks(bookmarks.filter((existing) => existing.path !== bookmark.path));
        return "removed";
      }

      if (bookmarks.length >= MAX_BOOKMARKS) {
        return "limit";
      }

      setBookmarks([...bookmarks, bookmark]);
      return "added";
    },
    [bookmarks, setBookmarks]
  );

  return {
    bookmarks,
    setBookmarks,
    isBookmarked,
    toggleBookmark,
    isLoading: userSettings.isLoading,
    isSaving: saveBookmarksPost.isPending,
  };
};
