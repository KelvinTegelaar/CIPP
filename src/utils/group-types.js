// Group rows reach the UI with two different `calculatedGroupType` vocabularies.
// The groups/user-groups APIs emit m365 | security | generic | distributionList,
// while pages that derive the type client side emit
// m365 | mailenabledsecurity | security | distribution. "security" means
// mail-enabled security in the first set and plain security in the second, so
// comparing that field directly is unreliable. Resolve from the Graph flags
// where they exist, then fall back to the unambiguous `groupType` label.

export const GROUP_TYPES = {
  m365: "m365",
  security: "security",
  mailEnabledSecurity: "mailEnabledSecurity",
  distributionList: "distributionList",
};

const LABEL_MAP = {
  "microsoft 365": GROUP_TYPES.m365,
  m365: GROUP_TYPES.m365,
  security: GROUP_TYPES.security,
  generic: GROUP_TYPES.security,
  "mail-enabled security": GROUP_TYPES.mailEnabledSecurity,
  mailenabledsecurity: GROUP_TYPES.mailEnabledSecurity,
  "distribution list": GROUP_TYPES.distributionList,
  distributionlist: GROUP_TYPES.distributionList,
  distribution: GROUP_TYPES.distributionList,
};

const fromFlags = (group) => {
  const groupTypes = group.groupTypes ?? group.GroupTypes;
  const unified = Array.isArray(groupTypes)
    ? groupTypes.includes("Unified")
    : typeof groupTypes === "string" && groupTypes.split(",").includes("Unified");
  if (unified) return GROUP_TYPES.m365;

  const mailEnabled = group.mailEnabled ?? group.MailEnabled;
  const securityEnabled = group.securityEnabled ?? group.SecurityGroup;
  if (typeof mailEnabled !== "boolean" || typeof securityEnabled !== "boolean") return null;

  if (mailEnabled && securityEnabled) return GROUP_TYPES.mailEnabledSecurity;
  if (!mailEnabled && securityEnabled) return GROUP_TYPES.security;
  if (mailEnabled && !securityEnabled) return GROUP_TYPES.distributionList;
  return null;
};

/**
 * Resolve a group row to a single canonical group type, regardless of which
 * endpoint or page produced it. Returns null when the type can't be determined.
 */
export const resolveGroupType = (group) => {
  if (!group || typeof group !== "object") return null;
  return (
    fromFlags(group) ??
    LABEL_MAP[String(group.groupType ?? "").toLowerCase()] ??
    LABEL_MAP[String(group.calculatedGroupType ?? "").toLowerCase()] ??
    null
  );
};

const TYPE_LABELS = {
  [GROUP_TYPES.m365]: "Microsoft 365",
  [GROUP_TYPES.security]: "Security",
  [GROUP_TYPES.mailEnabledSecurity]: "Mail-Enabled Security",
  [GROUP_TYPES.distributionList]: "Distribution List",
};

/**
 * Human readable group type, matching the `groupType` field the groups API
 * returns. Use this when a raw Graph group object needs to be handed to a page
 * that expects the labelled form.
 */
export const getGroupTypeLabel = (group) => TYPE_LABELS[resolveGroupType(group)] ?? null;

/** Only distribution lists and mail-enabled security groups can hold contacts. */
export const groupSupportsContacts = (group) => {
  const type = resolveGroupType(group);
  return type === GROUP_TYPES.distributionList || type === GROUP_TYPES.mailEnabledSecurity;
};

export const isUnifiedGroup = (group) => resolveGroupType(group) === GROUP_TYPES.m365;
