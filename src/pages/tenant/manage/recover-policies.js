import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useRouter } from "next/router";
import { Policy, Restore, ExpandMore } from "@mui/icons-material";
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { HeaderedTabbedLayout } from "/src/layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions.json";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";
import { CippHead } from "/src/components/CippComponents/CippHead";
import { CippFormComponent } from "/src/components/CippComponents/CippFormComponent";
import { ApiPostCall } from "/src/api/ApiCall";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";
import { createDriftManagementActions } from "./driftManagementActions";
import { useSettings } from "/src/hooks/use-settings";

const RecoverPoliciesPage = () => {
  const router = useRouter();
  const { templateId } = router.query;
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const userSettings = useSettings();
  // Prioritize URL query parameter, then fall back to settings
  const currentTenant = router.query.tenantFilter || userSettings.currentTenant;

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
  const actions = createDriftManagementActions({
    templateId,
    onRefresh: () => {
      // Refresh any relevant data here
    },
    currentTenant,
  });

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
