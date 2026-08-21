// Help/support destinations shared by CippSpeedDial (desktop FAB) and AccountPopover
// (mobile, where the FAB corner belongs to page actions). One definition so the two
// surfaces can't drift.

export const getHelpLinks = (pathname = "") => [
  {
    id: "bug-report",
    name: "Report Bug",
    href: "https://github.com/CyberDrain/CIPP/issues/new?template=bug.yml",
  },
  {
    id: "feature-request",
    name: "Request Feature",
    href: "https://github.com/CyberDrain/CIPP/issues/new?template=feature.yml",
  },
  {
    id: "discord",
    name: "Join the Discord!",
    href: "https://discord.gg/cyberdrain",
  },
  {
    id: "documentation",
    name: "Check the Documentation",
    href: `https://docs.cipp.app/user-documentation${pathname}`,
  },
];

// Clears the TanStack Query cache (memory + the persisted localStorage copy) and hard-reloads.
export const clearCippCache = (queryClient) => {
  queryClient.clear();

  if (typeof window !== "undefined") {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("REACT_QUERY_OFFLINE_CACHE")) {
        localStorage.removeItem(key);
      }
    });
    // Force refresh the page to bypass browser cache and reload JavaScript
    window.location.reload(true);
  }
};
