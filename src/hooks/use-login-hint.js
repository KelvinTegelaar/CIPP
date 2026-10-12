import { useCallback } from "react";
import { ApiGetCall } from "../api/ApiCall";
import { useSettings } from "./use-settings";
import { addLoginHint, getLoginHintUpn } from "../utils/add-login-hint";

// Returns a stable `(link) => link` mapper that appends login_hint=<UPN> to external portal links
// when the user turned the portalLinks.Login_Hint preference on. The signed-in UPN comes from the
// authmecipp query that PrivateRoute and the layout already hold, so this never issues its own
// /api/me request - it only subscribes to the cached result.
export const useLoginHint = () => {
  const settings = useSettings();
  const me = ApiGetCall({ url: "/api/me", queryKey: "authmecipp" });
  const upn = getLoginHintUpn(settings, me.data?.clientPrincipal?.userDetails);
  return useCallback((link) => addLoginHint(link, upn), [upn]);
};
