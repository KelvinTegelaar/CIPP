import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useSettings } from "/src/hooks/use-settings";
import { useRouter } from "next/router";
import { Policy, Restore, ExpandMore, Sync, PlayArrow } from "@mui/icons-material";
import {
  Box,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
} from "@mui/material";
import { Grid } from "@mui/system";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { HeaderedTabbedLayout } from "/src/layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions.json";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";
import { CippHead } from "/src/components/CippComponents/CippHead";
import { CippFormComponent } from "/src/components/CippComponents/CippFormComponent";
import { ApiPostCall } from "/src/api/ApiCall";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";

const RecoverPoliciesPage = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const [selectedPolicies, setSelectedPolicies] = useState([]);

  const formControl = useForm({ mode: "onChange" });

  const selectedBackup = formControl.watch("backupDateTime");

  // Mock data for policies in selected backup - replace with actual API call
  const backupPolicies = [
    {
      id: 1,
      name: "Multi-Factor Authentication Policy",
      type: "Conditional Access",
      lastModified: "2024-01-15",
      settings: "Require MFA for all users",
    },
    {
      id: 2,
      name: "Password Policy Standard",
      type: "Security Standard",
      lastModified: "2024-01-10",
      settings: "14 character minimum, complexity required",
    },
    {
      id: 3,
      name: "Device Compliance Policy",
      type: "Intune Policy",
      lastModified: "2024-01-08",
      settings: "Require encryption, PIN/Password",
    },
  ];

  // Recovery API call
  const recoverApi = ApiPostCall({
    relatedQueryKeys: ["ListBackupPolicies", "ListPolicyBackups"],
  });

  const handleRecover = () => {
    if (selectedPolicies.length === 0 || !selectedBackup) {
      return;
    }

    recoverApi.mutate({
      url: "/api/RecoverPolicies",
      data: {
        templateId,
        backupDateTime: selectedBackup,
        policyIds: selectedPolicies.map((policy) => policy.id),
      },
    });
  };

  // Actions for the ActionsMenu
  const actions = [
    {
      label: "Refresh Data",
      icon: <Sync />,
      noConfirm: true,
      customFunction: () => {
        // Refresh any relevant data here
      },
    },
    ...(templateId
      ? [
          {
            label: "Run Standard Now (Currently Selected Tenant only)",
            type: "GET",
            url: "/api/ExecStandardsRun",
            icon: <PlayArrow />,
            data: {
              TemplateId: templateId,
            },
            confirmText: "Are you sure you want to force a run of this standard?",
            multiPost: false,
          },
          {
            label: "Run Standard Now (All Tenants in Template)",
            type: "GET",
            url: "/api/ExecStandardsRun",
            icon: <PlayArrow />,
            data: {
              TemplateId: templateId,
              tenantFilter: "allTenants",
            },
            confirmText: "Are you sure you want to force a run of this standard?",
            multiPost: false,
          },
        ]
      : []),
  ];

  const title = "Manage Drift";
  const subtitle = [
    {
      icon: <Policy />,
      text: `Template ID: ${templateId || "Loading..."}`,
    },
  ];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      backUrl="/tenant/standards/list-standards"
      actions={actions}
      actionsData={{}}
      isFetching={recoverApi.isPending}
    >
      <CippHead title="Recover Policies" />
      <Box sx={{ py: 2 }}>
        <Stack spacing={3}>
          {/* Backup Date Selection */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box display="flex" alignItems="center" gap={1}>
                <Restore color="primary" />
                <Typography variant="h6">Select Backup Date & Time</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <CippFormComponent
                    type="autoComplete"
                    label="Backup Date & Time"
                    name="backupDateTime"
                    formControl={formControl}
                    api={{
                      url: "/api/ExecListBackup",
                      queryKey: `PolicyBackups-${templateId}`,
                      labelField: (option) => {
                        const date = new Date(option.dateTime);
                        return `${date.toLocaleDateString()} @ ${date.toLocaleTimeString()} (${
                          option.policyCount
                        } policies)`;
                      },
                      valueField: "dateTime",
                    }}
                    required={true}
                    validators={{
                      validate: (value) => !!value || "Please select a backup date & time",
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Recovery Results */}
          <CippApiResults apiObject={recoverApi} />

          {/* Backup Policies Section */}
          {selectedBackup && (
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Policy color="primary" />
                  <Typography variant="h6">Policies in Selected Backup</Typography>
                  <Chip label={backupPolicies.length} size="small" color="primary" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Select policies to recover from backup:{" "}
                      {new Date(selectedBackup).toLocaleString()}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleRecover}
                      disabled={selectedPolicies.length === 0 || recoverApi.isPending}
                      startIcon={<Restore />}
                    >
                      Recover Selected Policies ({selectedPolicies.length})
                    </Button>
                  </Box>
                  <CippDataTable
                    title="Backup Policies"
                    data={backupPolicies}
                    simpleColumns={["name", "type", "lastModified", "settings"]}
                    noCard={true}
                    enableRowSelection={true}
                    onChange={(selectedRows) => setSelectedPolicies(selectedRows)}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}
        </Stack>
      </Box>
    </HeaderedTabbedLayout>
  );
};

RecoverPoliciesPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default RecoverPoliciesPage;
