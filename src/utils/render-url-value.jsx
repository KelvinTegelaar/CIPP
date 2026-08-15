import { Link, SvgIcon } from "@mui/material";
import OpenInNew from "@mui/icons-material/OpenInNew";
import { portalIcons } from "./get-cipp-formatting";

const ABSOLUTE_URL = /^https?:\/\//i;
// A bare host like "contoso-admin.sharepoint.com" — a portal link often arrives without
// its scheme, which would otherwise be resolved against the CIPP origin.
const HOST_LIKE = /^[\w-]+(\.[\w-]+)+(\/|$)/;

/**
 * A tappable, self-describing link for a URL-valued field.
 *
 * Table cells render portals as a bare icon, which reads fine under a narrow column header
 * and not at all once the same value appears in a card or a labelled property list.
 * Returns null when the value isn't linkable, so callers fall back to normal formatting.
 */
export const renderUrlValue = (value, field = "") => {
  if (typeof value !== "string" || !value.trim()) return null;

  const isPortal = field.startsWith("portal_");
  const trimmed = value.trim();
  if (!isPortal && !ABSOLUTE_URL.test(trimmed)) return null;

  const href = ABSOLUTE_URL.test(trimmed)
    ? trimmed
    : HOST_LIKE.test(trimmed)
      ? `https://${trimmed}`
      : trimmed;

  const PortalIcon = portalIcons[field];

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      title={href}
      onClick={(event) => event.stopPropagation()}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        minWidth: 0,
        overflowWrap: "anywhere",
      }}
    >
      {PortalIcon && (
        <SvgIcon fontSize="small" sx={{ flexShrink: 0 }}>
          <PortalIcon />
        </SvgIcon>
      )}
      {isPortal ? "Open portal" : trimmed}
      <SvgIcon fontSize="inherit" sx={{ flexShrink: 0 }}>
        <OpenInNew fontSize="inherit" />
      </SvgIcon>
    </Link>
  );
};
