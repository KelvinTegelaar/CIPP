// Appends login_hint=<UPN> to an external portal link so Microsoft preselects the account the
// user signed in to CIPP with, instead of whichever account the browser/device has registered.
// Relative (in-app) links and a missing UPN are returned untouched.
// The UPN to hint with, or undefined when the user turned the portalLinks.Login_Hint setting off
// (user-specific settings win over global; off unless explicitly true).
export const getLoginHintUpn = (settings, upn) =>
  (settings?.UserSpecificSettings?.portalLinks ?? settings?.portalLinks)?.Login_Hint !== true
    ? undefined
    : upn;

export const addLoginHint = (link, upn) => {
  if (!upn || !/^https?:\/\//i.test(link ?? "")) return link;
  const url = new URL(link);
  url.searchParams.set("login_hint", upn);
  return url.toString();
};
