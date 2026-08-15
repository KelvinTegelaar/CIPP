import { describe, it, expect } from "vitest";
import { getFilteredPortals } from "../../src/utils/get-filtered-portals";
import Portals from "../../src/data/portals";

const names = (portals) => portals.map((p) => p.name);

// Pre-existing mismatch, documented rather than fixed here: portals.json splits Power
// Platform into _Admin/_Maker entries, while the defaults map (and the preferences toggle,
// and dashboardv1) still key on the un-suffixed Power_Platform_Portal — so those two are
// filtered out for everyone and their preference toggle controls nothing.
const UNREACHABLE_BY_DEFAULT = ["Power_Platform_Portal_Admin", "Power_Platform_Portal_Maker"];
const defaultVisible = names(Portals).filter((n) => !UNREACHABLE_BY_DEFAULT.includes(n));

describe("getFilteredPortals", () => {
  it("returns every default-on portal when settings carry no preferences", () => {
    expect(names(getFilteredPortals({}))).toEqual(defaultVisible);
  });

  it("tolerates undefined settings", () => {
    expect(names(getFilteredPortals(undefined))).toEqual(defaultVisible);
  });

  it("hides a portal turned off in UserSpecificSettings", () => {
    const result = getFilteredPortals({
      UserSpecificSettings: { portalLinks: { Exchange_Portal: false } },
    });

    expect(names(result)).not.toContain("Exchange_Portal");
    expect(names(result)).toContain("M365_Portal");
  });

  it("falls back to tenant-level portalLinks when no user-specific ones exist", () => {
    const result = getFilteredPortals({ portalLinks: { Azure_Portal: false } });

    expect(names(result)).not.toContain("Azure_Portal");
    expect(names(result)).toContain("M365_Portal");
  });

  it("prefers UserSpecificSettings over tenant-level portalLinks", () => {
    const result = getFilteredPortals({
      portalLinks: { Teams_Portal: false },
      UserSpecificSettings: { portalLinks: { Entra_Portal: false } },
    });

    // The user-specific object wins outright — the tenant-level opt-out is not merged in.
    expect(names(result)).toContain("Teams_Portal");
    expect(names(result)).not.toContain("Entra_Portal");
  });
});
