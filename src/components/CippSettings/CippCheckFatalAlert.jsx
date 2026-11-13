import { CippAlertWithDetails } from "../CippComponents/CippAlertWithDetails";
import { Link as MuiLink } from "@mui/material";
import Link from "next/link";

const partnerTenantsPage = { href: "/cipp/advanced/super-admin/partner-tenants", text: "Open Partner Tenants" };
const setupWizard = { href: "/onboardingv2?selectedOption=UpdateTokens", text: "Open Setup Wizard" };

// Plain-language explanations for sign-in errors we know how to interpret, with a link to
// where the fix happens. The raw error stays available behind Show Details.
const knownErrors = [
  {
    code: "AADSTS90002",
    simple:
      "This partner tenant could not be found. It may have been deleted, or the tenant ID stored for it is incorrect. Remove and re-add the partner tenant if this persists.",
    link: partnerTenantsPage,
  },
  {
    code: "AADSTS700016",
    simple:
      "The CIPP application is not set up in this partner tenant yet. Reconnect it to install the application.",
    link: partnerTenantsPage,
  },
  {
    code: "AADSTS65001",
    simple:
      "This partner tenant has not granted CIPP permission to act on its behalf. An administrator in that tenant needs to approve the CIPP application, then reconnect it.",
    link: partnerTenantsPage,
  },
  {
    code: "AADSTS7000215",
    simple:
      "CIPP's application secret is invalid or not active yet. New secrets can take a few minutes to activate; if this persists, refresh the credentials.",
    link: setupWizard,
  },
  {
    code: "AADSTS50173",
    simple:
      "The saved sign-in for this partner tenant has expired or its password changed. Reconnect the partner tenant to sign in again.",
    link: partnerTenantsPage,
  },
  {
    code: "AADSTS700082",
    simple:
      "The saved sign-in for this partner tenant expired from inactivity. Reconnect the partner tenant to sign in again.",
    link: partnerTenantsPage,
  },
  {
    code: "AADSTS50020",
    simple:
      "The service account used for this partner tenant does not have access to it. Sign in with an account that lives in this partner tenant.",
    link: partnerTenantsPage,
  },
];

// Splits a check-card failure message into a short summary and the raw provider error
// (AADSTS codes, trace ids), rendered via the shared details alert.
export const CippCheckFatalAlert = ({ message, sx, isPrimaryPartner = false }) => {
  const text = String(message ?? "").replace("No other results on this card are valid.", "").trim();

  const markers = ["The returned error is:", "Could not get token", "AADSTS"];
  let idx = -1;
  for (const marker of markers) {
    const i = text.indexOf(marker);
    if (i > 0 && (idx === -1 || i < idx)) idx = i;
  }

  const known = knownErrors.find((entry) => text.includes(entry.code));
  // The primary partner's credentials are managed in the Setup Wizard, additional
  // partners on the Partner Tenants page
  const fixLink = known?.link === setupWizard || isPrimaryPartner ? setupWizard : known?.link;
  const summary = known ? (
    <>
      {known.simple}
      {fixLink && (
        <>
          {" "}
          <MuiLink component={Link} href={fixLink.href}>
            {fixLink.text}
          </MuiLink>
        </>
      )}
    </>
  ) : (
    (idx > 0 ? text.slice(0, idx) : text).replace(/[:\s.]+$/, "") + "."
  );
  const details = known
    ? text
    : idx > 0
      ? text.slice(idx).replace(/^The returned error is:\s*/, "")
      : null;

  return (
    <CippAlertWithDetails
      severity="error"
      summary={summary}
      details={details}
      copyText={String(message ?? "")}
      sx={{ mx: 3, my: 1, ...sx }}
    />
  );
};

export default CippCheckFatalAlert;
