import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { CippIcons } from "../../../../utils/icon-registry"
import { Layout as DashboardLayout } from "../../../../layouts/index";
import tabOptions from "../tabOptions";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Alert, Button, Link as MuiLink, SvgIcon, Tooltip, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { ApiGetCall } from "../../../../api/ApiCall";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog";
import { CippPropertyList } from "../../../../components/CippComponents/CippPropertyList";
import { useDialog } from "../../../../hooks/use-dialog";
import { buildGdapRepairPlan } from "../../../../utils/gdap-role-options";

const pageTitle = "GDAP Group Mappings";

const repairQueryKeys = ["ListGDAPRoles", "ListGDAPRolesValidated", "ListGDAPRoleTemplates"];

const actions = [
  {
    label: "Delete Mapping",
    icon: <CippIcons.Delete />,
    type: "POST",
    url: "/api/ExecDeleteGDAPRoleMapping",
    data: {
      GroupId: "GroupId",
    },
    confirmText:
      "Are you sure you want to delete this role mapping? Any role template that uses it loses the role. (Note: This does not delete the associated security groups or modify any GDAP relationships.)",
    relatedQueryKeys: repairQueryKeys,
  },
];

const simpleColumns = ["RoleName", "GroupName", "GroupStatus", "UsedInTemplates"];

const offCanvas = {
  extendedInfoFields: ["RoleName", "GroupName", "GroupStatus", "GroupStatusMessage"],
};

const Page = () => {
  const repairDialog = useDialog();

  // Validation costs a partner tenant Graph call, so it is fetched once here and folded into the
  // table's rows rather than being asked for again by the table's own query.
  const groupCheck = ApiGetCall({
    url: "/api/ListGDAPRoles?validate=true",
    queryKey: "ListGDAPRolesValidated",
  });

  const templates = ApiGetCall({
    url: "/api/ExecGDAPRoleTemplate",
    queryKey: "ListGDAPRoleTemplates-mappings",
  });

  const repairPlan = useMemo(() => buildGdapRepairPlan(groupCheck.data), [groupCheck.data]);
  const hasGroupIssues = repairPlan.changes.length > 0;
  const nothingToRepair =
    groupCheck.isSuccess && !repairPlan.unknown && repairPlan.changes.length === 0;

  const statusByGroup = useMemo(() => {
    const lookup = {};
    (groupCheck.data ?? []).forEach((row) => {
      if (row?.GroupId) {
        lookup[row.GroupId] = {
          GroupStatus: row.GroupStatus,
          GroupStatusMessage: row.GroupStatusMessage,
        };
      }
    });
    return lookup;
  }, [groupCheck.data]);

  // Which templates each group is used by. The API has no such view, so it is joined here.
  const templatesByGroup = useMemo(() => {
    const lookup = {};
    (templates.data?.Results ?? []).forEach((template) => {
      (template?.RoleMappings ?? []).forEach((mapping) => {
        if (!mapping?.GroupId) return;
        lookup[mapping.GroupId] = [...(lookup[mapping.GroupId] ?? []), template.TemplateId];
      });
    });
    return lookup;
  }, [templates.data]);

  // Memoized: CippDataTable re-maps its rows whenever this identity changes.
  const dataMap = useCallback(
    (row) => ({
      ...row,
      GroupStatus: statusByGroup[row?.GroupId]?.GroupStatus ?? "Unknown",
      GroupStatusMessage: statusByGroup[row?.GroupId]?.GroupStatusMessage ?? "",
      UsedInTemplates: templatesByGroup[row?.GroupId] ?? [],
    }),
    [templatesByGroup, statusByGroup]
  );

  const repairButton = (
    <Button startIcon={<CippIcons.Healing />} disabled={nothingToRepair} onClick={() => repairDialog.handleOpen()}>
      Repair mappings
    </Button>
  );

  return (
    <Stack spacing={2} sx={{ mt: 3 }}>
      <Box sx={{ px: 3 }}>
        <Stack spacing={2}>
          <Alert severity="info">
            <Typography variant="body2">
              Each mapping ties a GDAP admin role to a security group in your partner tenant, and a
              technician gains that role by being a member of the group. Mapping a group by hand is
              an advanced option for groups that already exist and do not follow the M365 GDAP
              naming - templates create and name groups for you.
            </Typography>
          </Alert>
          {hasGroupIssues && (
            <Alert severity="warning">
              <Typography variant="body2">
                Some mappings point at groups that no longer exist. Repair re-links or recreates the
                M365 GDAP groups and updates every template.
              </Typography>
            </Alert>
          )}
        </Stack>
      </Box>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListGDAPRoles"
        dataMap={dataMap}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        tenantInTitle={false}
        sx={{ flexGrow: 1, pb: 4 }}
        cardButton={
          <>
            {nothingToRepair ? (
              // A disabled MUI Button swallows pointer events, so the tooltip needs a live wrapper.
              <Tooltip title="All mappings reference existing groups; nothing to repair.">
                <span>{repairButton}</span>
              </Tooltip>
            ) : (
              repairButton
            )}
            <Button component={Link} href="/tenant/gdap-management/roles/add" startIcon={<CippIcons.Tune />}>
              Map an existing group (Advanced)
            </Button>
            {/* The parent tab stays highlighted here, so it cannot be clicked to go back. */}
            <Button
              component={Link}
              href="/tenant/gdap-management/role-templates"
              startIcon={
                <SvgIcon fontSize="small">
                  <CippIcons.ArrowLeft />
                </SvgIcon>
              }
            >
              Back
            </Button>
          </>
        }
        queryKey="ListGDAPRoles"
        maxHeightOffset="460px"
      />
      <CippApiDialog
        title="Repair group mappings"
        createDialog={repairDialog}
        api={{
          url: "/api/ExecGDAPRepairRoleMappings",
          type: "POST",
          data: {},
          relatedQueryKeys: repairQueryKeys,
        }}
        row={{}}
      >
        <Stack spacing={2}>
          {repairPlan.unknown && (
            <Alert severity="info">
              The group check could not run for every mapping, so this list may be incomplete.
              Repair still checks each mapping and fixes what it can.
            </Alert>
          )}
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              What will change
            </Typography>
            {repairPlan.changes.length > 0 ? (
              <CippPropertyList
                align="horizontal"
                showDivider={false}
                propertyItems={repairPlan.changes.map((change) => ({
                  label: change.RoleName,
                  value: change.action,
                }))}
              />
            ) : (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No mapping needs re-linking or recreating.
              </Typography>
            )}
            {repairPlan.validCount > 0 && (
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                {repairPlan.validCount} mapping{repairPlan.validCount === 1 ? " is" : "s are"}{" "}
                already valid and won&apos;t change.
              </Typography>
            )}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Next steps
            </Typography>
            <ul style={{ paddingLeft: "20px", margin: 0 }}>
              <li>
                <Typography variant="body2">
                  Recreated groups start empty. Re-add your technicians to them before they regain
                  access.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Every role template is updated automatically with the corrected group ids.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Relationships that already had assignments against a missing group need the Reset
                  Role Mapping action on the{" "}
                  <MuiLink component={Link} href="/tenant/gdap-management/relationships">
                    relationship
                  </MuiLink>
                  , or a re-run of onboarding.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Re-run the GDAP check on the overview to confirm the result.
                </Typography>
              </li>
            </ul>
          </Box>
        </Stack>
      </CippApiDialog>
    </Stack>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions} activePath="/tenant/gdap-management/role-templates">
      {page}
    </TabbedLayout>
  </DashboardLayout>
);

export default Page;
