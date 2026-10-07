import { describe, it, expect } from "vitest";
import { addLoginHint, getLoginHintUpn } from "../../src/utils/add-login-hint";

const upn = "admin@contoso.onmicrosoft.com";

describe("getLoginHintUpn", () => {
  it("is off unless Login_Hint is explicitly true", () => {
    expect(getLoginHintUpn({}, upn)).toBeUndefined();
    expect(getLoginHintUpn(undefined, upn)).toBeUndefined();
    expect(getLoginHintUpn({ portalLinks: { Login_Hint: "true" } }, upn)).toBeUndefined();
  });

  it("honours the tenant-level preference when no user-specific one exists", () => {
    expect(getLoginHintUpn({ portalLinks: { Login_Hint: true } }, upn)).toBe(upn);
  });

  it("prefers UserSpecificSettings over tenant-level portalLinks", () => {
    expect(
      getLoginHintUpn(
        { portalLinks: { Login_Hint: true }, UserSpecificSettings: { portalLinks: { Login_Hint: false } } },
        upn,
      ),
    ).toBeUndefined();
    expect(
      getLoginHintUpn(
        { portalLinks: { Login_Hint: false }, UserSpecificSettings: { portalLinks: { Login_Hint: true } } },
        upn,
      ),
    ).toBe(upn);
  });

  it("returns undefined when the preference is on but /api/me has not resolved a UPN yet", () => {
    expect(getLoginHintUpn({ portalLinks: { Login_Hint: true } }, undefined)).toBeUndefined();
  });
});

describe("addLoginHint", () => {
  it("appends login_hint to an absolute external link", () => {
    const result = new URL(addLoginHint("https://entra.microsoft.com/contoso.onmicrosoft.com", upn));
    expect(result.searchParams.get("login_hint")).toBe(upn);
    expect(result.pathname).toBe("/contoso.onmicrosoft.com");
  });

  it("keeps existing query parameters", () => {
    const result = new URL(
      addLoginHint("https://admin.cloud.microsoft/?delegatedOrg=contoso.onmicrosoft.com", upn),
    );
    expect(result.searchParams.get("delegatedOrg")).toBe("contoso.onmicrosoft.com");
    expect(result.searchParams.get("login_hint")).toBe(upn);
  });

  it("leaves relative in-app links untouched", () => {
    const link = "/api/ListSharePointAdminUrl?tenantFilter=contoso.onmicrosoft.com";
    expect(addLoginHint(link, upn)).toBe(link);
    expect(addLoginHint("/tenant/manage/edit", upn)).toBe("/tenant/manage/edit");
  });

  it("passes through when there is no UPN or no link", () => {
    expect(addLoginHint("https://portal.azure.com/x", undefined)).toBe("https://portal.azure.com/x");
    expect(addLoginHint(undefined, upn)).toBeUndefined();
    expect(addLoginHint(null, upn)).toBeNull();
  });
});
