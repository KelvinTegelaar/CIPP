import { describe, it, expect } from "vitest";
import {
  buildGdapRoleOptions,
  buildGdapTemplatePayload,
  buildGdapRepairPlan,
  buildGdapTemplateSelection,
  classifyGdapGroupName,
  gdapPreviewStatus,
  resolveGdapSelections,
  selectGdapDefaultOptions,
} from "../../src/utils/gdap-role-options";

const catalog = [
  { Name: "User Administrator", ObjectId: "role-user-admin" },
  { Name: "Intune Administrator", ObjectId: "role-intune" },
  { Name: "Exchange Administrator", ObjectId: "role-exchange" },
  // Partner Tier 1 / Tier 2 - never delegable through GDAP.
  { Name: "Partner Tier1 Support", ObjectId: "7495fdc4-34c4-4d15-a289-98788ce399fd" },
  { Name: "Partner Tier2 Support", ObjectId: "aaf43236-0c0d-4d5f-883a-6955382ac081" },
];

const plainMapping = {
  RoleName: "User Administrator",
  GroupName: "M365 GDAP User Administrator",
  GroupId: "group-user-admin",
  roleDefinitionId: "role-user-admin",
};

const suffixedMapping = {
  RoleName: "User Administrator",
  GroupName: "M365 GDAP User Administrator - Test",
  GroupId: "group-user-admin-test",
  roleDefinitionId: "role-user-admin",
};

const customMapping = {
  RoleName: "Exchange Administrator",
  GroupName: "Legacy Helpdesk Group",
  GroupId: "group-legacy",
  roleDefinitionId: "role-exchange",
};

const roleOption = (options, label) =>
  options.find((option) => option.kind === "role" && option.label === label);

describe("classifyGdapGroupName", () => {
  it("splits default, suffixed and custom names", () => {
    expect(classifyGdapGroupName("M365 GDAP User Administrator", "User Administrator")).toEqual({
      pattern: "default",
      suffix: null,
    });
    expect(
      classifyGdapGroupName("M365 GDAP User Administrator - Test", "User Administrator")
    ).toEqual({ pattern: "default", suffix: "Test" });
    expect(classifyGdapGroupName("Legacy Helpdesk Group", "Exchange Administrator")).toEqual({
      pattern: "custom",
      suffix: null,
    });
  });
});

describe("buildGdapRoleOptions", () => {
  it("offers one option per catalog role, excluding the Partner Tier roles", () => {
    const options = buildGdapRoleOptions(catalog, []);

    expect(options.filter((option) => option.kind === "role")).toHaveLength(3);
    expect(options.map((option) => option.value)).not.toContain(
      "7495fdc4-34c4-4d15-a289-98788ce399fd"
    );
    expect(options.map((option) => option.value)).not.toContain(
      "aaf43236-0c0d-4d5f-883a-6955382ac081"
    );
  });

  it("does not add a separate option for a suffixed default-pattern mapping", () => {
    const options = buildGdapRoleOptions(catalog, [plainMapping, suffixedMapping]);

    expect(options.filter((option) => option.label === "User Administrator")).toHaveLength(1);
    expect(options.every((option) => option.kind === "role")).toBe(true);
  });

  it("adds an option for a custom-named mapping", () => {
    const options = buildGdapRoleOptions(catalog, [customMapping]);
    const custom = options.find((option) => option.kind === "group");

    expect(custom).toMatchObject({
      label: "Exchange Administrator",
      value: "group-legacy",
      description: "Legacy Helpdesk Group (custom group)",
      group: "Mapped to a group",
    });
  });

  it("re-labels the mapped/unmapped headings from the suffix", () => {
    const withoutSuffix = buildGdapRoleOptions(catalog, [plainMapping]);
    expect(roleOption(withoutSuffix, "User Administrator").group).toBe("Mapped to a group");

    const withSuffix = buildGdapRoleOptions(catalog, [plainMapping], "Test");
    expect(roleOption(withSuffix, "User Administrator").group).toBe("Not mapped yet");
    expect(roleOption(withSuffix, "User Administrator").description).toBe(
      "M365 GDAP User Administrator - Test - group will be created"
    );

    const suffixMatched = buildGdapRoleOptions(catalog, [suffixedMapping], "Test");
    expect(roleOption(suffixMatched, "User Administrator").group).toBe("Mapped to a group");
  });

  it("tolerates missing arguments", () => {
    expect(buildGdapRoleOptions()).toEqual([]);
    expect(buildGdapRoleOptions(catalog, null)).toHaveLength(3);
  });
});

describe("resolveGdapSelections", () => {
  it("reuses the plain mapping when there is no suffix", () => {
    const options = buildGdapRoleOptions(catalog, [plainMapping]);
    const [resolved] = resolveGdapSelections(
      [roleOption(options, "User Administrator")],
      [plainMapping],
      ""
    );

    expect(resolved.groupName).toBe("M365 GDAP User Administrator");
    expect(resolved.isNew).toBe(false);
    expect(resolved.mapping).toEqual(plainMapping);
  });

  it("retargets to the suffixed group and reuses an existing one", () => {
    const options = buildGdapRoleOptions(catalog, [plainMapping, suffixedMapping], "Test");
    const [resolved] = resolveGdapSelections(
      [roleOption(options, "User Administrator")],
      [plainMapping, suffixedMapping],
      "Test"
    );

    expect(resolved.groupName).toBe("M365 GDAP User Administrator - Test");
    expect(resolved.isNew).toBe(false);
    expect(resolved.mapping).toEqual(suffixedMapping);
  });

  it("treats a suffixed group that does not exist as new", () => {
    const options = buildGdapRoleOptions(catalog, [plainMapping], "Test");
    const [resolved] = resolveGdapSelections(
      [roleOption(options, "User Administrator")],
      [plainMapping],
      "Test"
    );

    expect(resolved.groupName).toBe("M365 GDAP User Administrator - Test");
    expect(resolved.isNew).toBe(true);
    expect(resolved.mapping).toBeNull();
  });

  it("keeps a custom-group option pinned whatever the suffix", () => {
    const options = buildGdapRoleOptions(catalog, [customMapping], "Test");
    const custom = options.find((option) => option.kind === "group");
    const [resolved] = resolveGdapSelections([custom], [customMapping], "Test");

    expect(resolved.groupName).toBe("Legacy Helpdesk Group");
    expect(resolved.isNew).toBe(false);
    expect(resolved.mapping).toEqual(customMapping);
  });
});

describe("selectGdapDefaultOptions", () => {
  it("selects the catalog option for each default role", () => {
    const options = buildGdapRoleOptions(catalog, [plainMapping]);
    const selected = selectGdapDefaultOptions(options, [
      { label: "User Administrator", value: "role-user-admin" },
      { label: "Intune Administrator", value: "role-intune" },
      { label: "Nonexistent Administrator", value: "role-missing" },
    ]);

    expect(selected.map((option) => option.value)).toEqual(["role-user-admin", "role-intune"]);
  });
});

describe("buildGdapTemplatePayload", () => {
  it("splits selections into existing mappings and new roles", () => {
    const mappings = [plainMapping, customMapping];
    const options = buildGdapRoleOptions(catalog, mappings);
    const payload = buildGdapTemplatePayload(
      {
        templateId: "Helpdesk",
        roleMappings: [
          roleOption(options, "User Administrator"),
          roleOption(options, "Intune Administrator"),
          options.find((option) => option.kind === "group"),
        ],
      },
      mappings,
      "Helpdesk Old"
    );

    expect(payload).toEqual({
      TemplateId: "Helpdesk",
      OriginalTemplateId: "Helpdesk Old",
      CustomSuffix: undefined,
      RoleMappings: [plainMapping, customMapping],
      NewRoles: [{ label: "Intune Administrator", value: "role-intune" }],
    });
  });

  it("sends the suffix and the roles whose suffixed group is missing", () => {
    const mappings = [plainMapping, suffixedMapping];
    const options = buildGdapRoleOptions(catalog, mappings, "Test");
    const payload = buildGdapTemplatePayload(
      {
        templateId: "Helpdesk",
        customSuffix: "Test",
        roleMappings: [
          roleOption(options, "User Administrator"),
          roleOption(options, "Intune Administrator"),
        ],
      },
      mappings
    );

    expect(payload.CustomSuffix).toBe("Test");
    expect(payload.RoleMappings).toEqual([suffixedMapping]);
    expect(payload.NewRoles).toEqual([{ label: "Intune Administrator", value: "role-intune" }]);
    expect(payload).not.toHaveProperty("OriginalTemplateId");
  });
});

describe("buildGdapTemplateSelection", () => {
  it("loads a plain template as catalog options with no suffix", () => {
    const selection = buildGdapTemplateSelection([plainMapping], catalog, [plainMapping]);

    expect(selection.customSuffix).toBeNull();
    expect(selection.mixedSuffixes).toBe(false);
    expect(selection.extraOptions).toEqual([]);
    expect(selection.selected[0]).toMatchObject({ kind: "role", value: "role-user-admin" });
  });

  it("recovers a single shared suffix", () => {
    const mappings = [suffixedMapping];
    const selection = buildGdapTemplateSelection(mappings, catalog, mappings);

    expect(selection.customSuffix).toBe("Test");
    expect(selection.mixedSuffixes).toBe(false);
    expect(selection.selected[0]).toMatchObject({ kind: "role", value: "role-user-admin" });
  });

  it("pins the odd ones out when suffixes disagree", () => {
    const other = {
      RoleName: "Intune Administrator",
      GroupName: "M365 GDAP Intune Administrator - Other",
      GroupId: "group-intune-other",
      roleDefinitionId: "role-intune",
    };
    const mappings = [suffixedMapping, other];
    const selection = buildGdapTemplateSelection(mappings, catalog, mappings);

    expect(selection.customSuffix).toBeNull();
    expect(selection.mixedSuffixes).toBe(true);
    expect(selection.selected.every((option) => option.kind === "group")).toBe(true);
    expect(selection.extraOptions).toHaveLength(2);
    expect(selection.selected[0].description).toContain("fixed group");
  });

  it("pins an unsuffixed mapping that sits alongside a suffixed one", () => {
    const mappings = [plainMapping, suffixedMapping];
    const template = [
      suffixedMapping,
      {
        RoleName: "Intune Administrator",
        GroupName: "M365 GDAP Intune Administrator",
        GroupId: "group-intune",
        roleDefinitionId: "role-intune",
      },
    ];
    const selection = buildGdapTemplateSelection(template, catalog, mappings);

    expect(selection.customSuffix).toBe("Test");
    expect(selection.mixedSuffixes).toBe(true);
    expect(selection.selected[0]).toMatchObject({ kind: "role", label: "User Administrator" });
    expect(selection.selected[1]).toMatchObject({ kind: "group", value: "group-intune" });
    expect(selection.extraOptions).toHaveLength(1);
  });

  it("loads a custom-named mapping as a pinned group option", () => {
    const selection = buildGdapTemplateSelection([customMapping], catalog, [customMapping]);

    expect(selection.mixedSuffixes).toBe(false);
    expect(selection.extraOptions).toEqual([]);
    expect(selection.selected[0]).toMatchObject({ kind: "group", value: "group-legacy" });
  });
});

describe("gdapPreviewStatus", () => {
  const statusFor = (mapping, suffix) => {
    const options = buildGdapRoleOptions(catalog, [mapping], suffix);
    const [resolved] = resolveGdapSelections(
      [roleOption(options, mapping.RoleName)],
      [mapping],
      suffix
    );
    return gdapPreviewStatus(resolved);
  };

  it("flags a group that will be created", () => {
    expect(statusFor(plainMapping, "Test")).toEqual({
      label: "Will be created",
      color: "warning",
    });
  });

  it("reports a healthy mapping as an existing group", () => {
    expect(statusFor({ ...plainMapping, GroupStatus: "Valid" })).toEqual({
      label: "Existing group",
      color: "success",
    });
  });

  it("flags a stale mapping", () => {
    expect(statusFor({ ...plainMapping, GroupStatus: "Stale" })).toEqual({
      label: "Group stale",
      color: "warning",
    });
  });

  it("flags a missing group", () => {
    expect(statusFor({ ...plainMapping, GroupStatus: "Missing" })).toEqual({
      label: "Group missing",
      color: "error",
    });
  });

  it("falls back to existing group when the list was not validated", () => {
    expect(statusFor(plainMapping)).toEqual({ label: "Existing group", color: "success" });
  });

  it("carries the status through a pinned custom-group option", () => {
    const validated = { ...customMapping, GroupStatus: "Missing" };
    const options = buildGdapRoleOptions(catalog, [validated]);
    const custom = options.find((option) => option.kind === "group");
    const [resolved] = resolveGdapSelections([custom], [validated]);

    expect(gdapPreviewStatus(resolved)).toEqual({ label: "Group missing", color: "error" });
  });
});

describe("buildGdapRepairPlan", () => {
  const row = (overrides) => ({
    RoleName: "User Administrator",
    GroupName: "M365 GDAP User Administrator",
    GroupId: "group-user-admin",
    ...overrides,
  });

  it("describes a stale mapping as a re-link", () => {
    const plan = buildGdapRepairPlan([row({ GroupStatus: "Stale" })]);

    expect(plan.changes).toHaveLength(1);
    expect(plan.changes[0]).toMatchObject({
      RoleName: "User Administrator",
      GroupName: "M365 GDAP User Administrator",
      Status: "Stale",
    });
    expect(plan.changes[0].action).toBe(
      'Re-link to the existing group named "M365 GDAP User Administrator" (new id)'
    );
    expect(plan.unknown).toBe(false);
  });

  it("describes a missing mapping as a recreate under its stored name", () => {
    const plan = buildGdapRepairPlan([
      row({ GroupStatus: "Missing", GroupName: "M365 GDAP User Administrator - Test" }),
    ]);

    expect(plan.changes[0].action).toBe(
      'Recreate "M365 GDAP User Administrator - Test" as a new, empty security group'
    );
  });

  it("counts valid mappings instead of listing them", () => {
    const plan = buildGdapRepairPlan([
      row({ GroupStatus: "Valid" }),
      row({ GroupStatus: "Valid", GroupId: "group-2" }),
      row({ GroupStatus: "Missing", GroupId: "group-3" }),
    ]);

    expect(plan.validCount).toBe(2);
    expect(plan.changes).toHaveLength(1);
    expect(plan.unknown).toBe(false);
  });

  it("flags an unvalidated list", () => {
    expect(buildGdapRepairPlan([row({ GroupStatus: "Unknown" })]).unknown).toBe(true);
    // A row with no status at all means the check never ran for it.
    expect(buildGdapRepairPlan([row()]).unknown).toBe(true);
  });

  it("returns an empty plan for no rows", () => {
    expect(buildGdapRepairPlan()).toEqual({ changes: [], validCount: 0, unknown: false });
    expect(buildGdapRepairPlan([])).toEqual({ changes: [], validCount: 0, unknown: false });
  });
});
