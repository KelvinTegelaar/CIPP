// Partner Tier 1/2 roles cannot be delegated through GDAP, so they are never offered as
// something to map. Existing mappings are still surfaced so a template never silently loses one.
const EXCLUDED_ROLE_IDS = [
  "7495fdc4-34c4-4d15-a289-98788ce399fd",
  "aaf43236-0c0d-4d5f-883a-6955382ac081",
];

export const GLOBAL_ADMIN_ROLE_ID = "62e90394-69f5-4237-9190-012177145e10";

export const MAPPED_GROUP_LABEL = "Mapped to a group";
export const UNMAPPED_GROUP_LABEL = "Not mapped yet";

/** Group a role targets: the suffix picks the group, so it applies to every selected role. */
export const gdapGroupName = (roleName, customSuffix) =>
  `M365 GDAP ${roleName}${customSuffix ? ` - ${customSuffix}` : ""}`;

/**
 * Splits a group name against the default convention: `{ pattern: "default", suffix }` when it is
 * `M365 GDAP <RoleName>` with an optional ` - <suffix>`, otherwise `{ pattern: "custom" }`.
 */
export const classifyGdapGroupName = (groupName, roleName) => {
  const base = `M365 GDAP ${roleName ?? ""}`;
  if (groupName === base) {
    return { pattern: "default", suffix: null };
  }
  if (typeof groupName === "string" && groupName.startsWith(`${base} - `)) {
    const suffix = groupName.slice(base.length + 3);
    if (suffix) {
      return { pattern: "default", suffix };
    }
  }
  return { pattern: "custom", suffix: null };
};

const normalizeMapping = (mapping) => ({
  RoleName: mapping.RoleName,
  GroupName: mapping.GroupName,
  GroupId: mapping.GroupId,
  roleDefinitionId: mapping.roleDefinitionId,
});

const findMappingByGroupName = (mappings, groupName) =>
  (mappings ?? []).find((mapping) => mapping?.GroupName === groupName) ?? null;

/** Option pinned to one specific group, for groups the suffix field cannot reproduce. */
export const gdapGroupOption = (mapping, note = "custom group") => ({
  label: mapping.RoleName,
  value: mapping.GroupId,
  kind: "group",
  description: `${mapping.GroupName} (${note})`,
  group: MAPPED_GROUP_LABEL,
  mapping: normalizeMapping(mapping),
});

const byLabel = (a, b) => String(a.label ?? "").localeCompare(String(b.label ?? ""));

/**
 * Builds the "Admin roles" option list: one option per catalog role, plus one per custom-named
 * mapping. Whether a role option is already mapped depends on the suffix, so the list has to be
 * rebuilt when the suffix changes or the group headings go stale.
 */
export const buildGdapRoleOptions = (catalog = [], mappings = [], customSuffix) => {
  const roleOptions = (catalog ?? [])
    .filter((role) => !EXCLUDED_ROLE_IDS.includes(role.ObjectId))
    .map((role) => {
      const groupName = gdapGroupName(role.Name, customSuffix);
      const mapping = findMappingByGroupName(mappings, groupName);
      return {
        label: role.Name,
        value: role.ObjectId,
        kind: "role",
        roleDefinitionId: role.ObjectId,
        description: mapping ? groupName : `${groupName} - group will be created`,
        group: mapping ? MAPPED_GROUP_LABEL : UNMAPPED_GROUP_LABEL,
      };
    });

  const groupOptions = (mappings ?? [])
    .filter(
      (mapping) =>
        mapping?.GroupId &&
        classifyGdapGroupName(mapping.GroupName, mapping.RoleName).pattern === "custom"
    )
    .map((mapping) => gdapGroupOption(mapping));

  const mapped = [...groupOptions, ...roleOptions.filter((o) => o.group === MAPPED_GROUP_LABEL)];
  const unmapped = roleOptions.filter((o) => o.group === UNMAPPED_GROUP_LABEL);
  return [...mapped.sort(byLabel), ...unmapped.sort(byLabel)];
};

/**
 * Resolves each selection to the group it will actually use. Role options follow the suffix;
 * group options stay pinned to theirs.
 */
export const resolveGdapSelections = (selected = [], mappings = [], customSuffix) =>
  (selected ?? [])
    .filter(Boolean)
    .map((option) => {
      if (option.kind === "group" && option.mapping) {
        const source = (mappings ?? []).find((item) => item?.GroupId === option.mapping.GroupId);
        return {
          option,
          groupName: option.mapping.GroupName,
          mapping: option.mapping,
          groupStatus: source?.GroupStatus ?? null,
          isNew: false,
        };
      }
      const groupName = gdapGroupName(option.label, customSuffix);
      const mapping = findMappingByGroupName(mappings, groupName);
      return {
        option,
        groupName,
        mapping: mapping ? normalizeMapping(mapping) : null,
        groupStatus: mapping?.GroupStatus ?? null,
        isNew: !mapping,
      };
    });

/** Role definition id behind a selection, whichever kind of option it is. */
export const gdapSelectionRoleId = (option) =>
  option?.roleDefinitionId ?? option?.mapping?.roleDefinitionId ?? option?.value;

/** Resolves the CIPP default roles against a built option list. */
export const selectGdapDefaultOptions = (options = [], defaults = []) =>
  (defaults ?? [])
    .map(
      (role) =>
        (options ?? []).find((option) => option.kind === "role" && option.value === role.value) ??
        null
    )
    .filter(Boolean);

/** Payload for POST /api/ExecGDAPRoleTemplate?Action=Save. */
export const buildGdapTemplatePayload = (values, mappings = [], originalTemplateId) => {
  const resolved = resolveGdapSelections(values?.roleMappings, mappings, values?.customSuffix);
  const payload = {
    TemplateId: values?.templateId,
    RoleMappings: resolved.filter((item) => item.mapping).map((item) => item.mapping),
    NewRoles: resolved
      .filter((item) => !item.mapping)
      .map((item) => ({ label: item.option.label, value: gdapSelectionRoleId(item.option) })),
    CustomSuffix: values?.customSuffix,
  };
  if (originalTemplateId) {
    payload.OriginalTemplateId = originalTemplateId;
  }
  return payload;
};

/**
 * Turns a stored template into an editor selection. A template whose groups all follow the
 * convention with one shared suffix loads as role options plus that suffix; anything the suffix
 * cannot reproduce (a custom name, a second suffix, an unsuffixed group alongside a suffixed one)
 * is pinned to its own group so saving cannot silently re-target it.
 */
export const buildGdapTemplateSelection = (templateMappings = [], catalog = [], mappings = []) => {
  const roleOptions = buildGdapRoleOptions(catalog, mappings).filter(
    (option) => option.kind === "role"
  );

  const classified = (templateMappings ?? [])
    .filter((mapping) => mapping?.GroupId)
    .map((mapping) => ({
      mapping,
      ...classifyGdapGroupName(mapping.GroupName, mapping.RoleName),
    }));

  const suffixes = [
    ...new Set(
      classified.filter((item) => item.pattern === "default" && item.suffix).map((i) => i.suffix)
    ),
  ];
  const customSuffix = suffixes.length === 1 ? suffixes[0] : null;

  const selected = [];
  let mixedSuffixes = false;
  const extraOptions = [];

  classified.forEach((item) => {
    const reproducible =
      item.pattern === "default" && (item.suffix ?? null) === (customSuffix ?? null);
    const roleOption = reproducible
      ? roleOptions.find((option) => option.label === item.mapping.RoleName)
      : null;

    if (roleOption) {
      selected.push(roleOption);
      return;
    }

    if (item.pattern === "default") {
      mixedSuffixes = true;
    }
    const pinned = gdapGroupOption(
      item.mapping,
      item.pattern === "default" ? "fixed group" : "custom group"
    );
    selected.push(pinned);
    if (item.pattern === "default") {
      extraOptions.push(pinned);
    }
  });

  return { selected, customSuffix, mixedSuffixes, extraOptions };
};

/**
 * Preview chip for one resolved selection. A mapping whose group went missing or whose id went
 * stale is flagged rather than shown as a healthy existing group; onboarding still repairs it.
 */
export const gdapPreviewStatus = (item) => {
  if (item?.isNew) {
    return { label: "Will be created", color: "warning" };
  }
  if (item?.groupStatus === "Missing") {
    return { label: "Group missing", color: "error" };
  }
  if (item?.groupStatus === "Stale") {
    return { label: "Group stale", color: "warning" };
  }
  return { label: "Existing group", color: "success" };
};

/**
 * What "Repair mappings" would do, derived from a validated ListGDAPRoles response. Rows with no
 * status at all mean the check could not run, which repair still attempts to fix.
 */
export const buildGdapRepairPlan = (validatedRows = []) => {
  const rows = (validatedRows ?? []).filter(Boolean);
  const changes = rows
    .filter((row) => row.GroupStatus === "Stale" || row.GroupStatus === "Missing")
    .map((row) => ({
      RoleName: row.RoleName,
      GroupName: row.GroupName,
      GroupId: row.GroupId,
      Status: row.GroupStatus,
      action:
        row.GroupStatus === "Stale"
          ? `Re-link to the existing group named "${row.GroupName}" (new id)`
          : `Recreate "${row.GroupName || gdapGroupName(row.RoleName)}" as a new, empty security group`,
    }));

  return {
    changes,
    validCount: rows.filter((row) => row.GroupStatus === "Valid").length,
    unknown: rows.some((row) => !row.GroupStatus || row.GroupStatus === "Unknown"),
  };
};
