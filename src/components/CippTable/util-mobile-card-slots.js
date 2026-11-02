// Pure slotting function for the mobile card list: decides which visible columns become
// the card title, subtitle, status chips, and detail rows. Runs unattended across every
// table page, so the rules are deliberate:
//
//   primary   — first NAME_FIELDS match, else first non-status textual column, else the
//               first column. Never naively "first column": the users page's first
//               simpleColumn is accountEnabled, which would title every card "Yes".
//   secondary — first IDENTIFIER_FIELDS match that isn't the primary.
//   chips     — up to 3 status-like columns (boolean sortingFn, known status ids, or
//               small select filters).
//   details   — up to 3 of whatever remains, in simpleColumns order.
//   rest      — everything else, surfaced as "+N more fields" -> detail drawer.
//
// Pages that know better pass mobileCard={{primary, secondary, chips, details}} to
// override any slot; ids not present in the visible columns are ignored.

const NAME_FIELDS = [
  "displayName",
  "DisplayName",
  "Name",
  "name",
  "Title",
  "title",
  "deviceName",
  "hostname",
  "TenantName",
  "Tenant",
  "subject",
  "RowKey",
];

const IDENTIFIER_FIELDS = [
  "userPrincipalName",
  "UPN",
  "mail",
  "primarySmtpAddress",
  "defaultDomainName",
  "serialNumber",
  "id",
  "RowKey",
];

// Known enum-ish ids that read as status even when their filter variant doesn't say so.
// accountEnabled is here because get-cipp-filter-variant gives it an explicit select case
// with alphanumeric sorting and no options — none of the generic signals fire for it.
const STATUS_FIELDS = new Set(
  [
    "severity",
    "risk",
    "result",
    "status",
    "state",
    "compliancestate",
    "risklevel",
    "riskstate",
    "usertype",
    "outcome",
    "healthstate",
    "isenabled",
    "enabled",
    "accountenabled",
  ].map((f) => f.toLowerCase())
);

const columnId = (col) => col?.id ?? col?.columnDef?.id ?? col?.accessorKey;
const columnDef = (col) => col?.columnDef ?? col;

export const isStatusLike = (col) => {
  const def = columnDef(col);
  if (def?.sortingFn === "boolean") return true;
  const id = String(columnId(col) ?? "").toLowerCase();
  if (STATUS_FIELDS.has(id)) return true;
  if (
    def?.filterVariant === "select" &&
    Array.isArray(def?.filterSelectOptions) &&
    def.filterSelectOptions.length > 0 &&
    def.filterSelectOptions.length <= 6
  ) {
    return true;
  }
  return false;
};

const firstMatch = (columns, priorityList, exclude = new Set()) => {
  for (const fieldName of priorityList) {
    const match = columns.find((col) => columnId(col) === fieldName && !exclude.has(col));
    if (match) return match;
  }
  return null;
};

/**
 * @param {Array} visibleColumns columns from table.getVisibleLeafColumns() (or any array of
 *   objects carrying id + columnDef); mrt-* utility columns are filtered out here.
 * @param {Object} [override] optional mobileCard prop: {primary, secondary, chips, details} as ids.
 * @returns {{primary, secondary, chips: [], details: [], rest: [], restCount: number}}
 *   primary/secondary are columns (or null); chips/details/rest are column arrays.
 */
export const getMobileCardSlots = (visibleColumns, override = {}) => {
  const columns = (visibleColumns ?? []).filter(
    (col) => !String(columnId(col) ?? "").startsWith("mrt-")
  );

  if (columns.length === 0) {
    return { primary: null, secondary: null, chips: [], details: [], rest: [], restCount: 0 };
  }

  const byId = (id) => columns.find((col) => columnId(col) === id);
  const used = new Set();

  const primary =
    (override.primary && byId(override.primary)) ||
    firstMatch(columns, NAME_FIELDS) ||
    columns.find((col) => !isStatusLike(col)) ||
    columns[0];
  used.add(primary);

  const secondary =
    (override.secondary && override.secondary !== columnId(primary) && byId(override.secondary)) ||
    firstMatch(columns, IDENTIFIER_FIELDS, used) ||
    null;
  if (secondary) used.add(secondary);

  let chips;
  if (Array.isArray(override.chips)) {
    chips = override.chips.map(byId).filter((col) => col && !used.has(col));
  } else {
    chips = columns.filter((col) => !used.has(col) && isStatusLike(col)).slice(0, 3);
  }
  chips.forEach((col) => used.add(col));

  let details;
  if (Array.isArray(override.details)) {
    details = override.details.map(byId).filter((col) => col && !used.has(col));
  } else {
    details = columns.filter((col) => !used.has(col)).slice(0, 3);
  }
  details.forEach((col) => used.add(col));

  const rest = columns.filter((col) => !used.has(col));

  return { primary, secondary, chips, details, rest, restCount: rest.length };
};
