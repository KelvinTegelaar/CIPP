import { Button, Chip, SvgIcon, Tooltip } from "@mui/material";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog.jsx";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Edit, Add, Book, Sync, CloudDone, Bolt } from "@mui/icons-material";
import { Stack } from "@mui/system";
import { useSettings } from "../../../../hooks/use-settings";
import { useDialog } from "../../../../hooks/use-dialog.js";
import { CippQueueTracker } from "../../../../components/CippTable/CippQueueTracker";
import { useEffect, useState } from "react";

const Page = () => {
  const pageTitle = "Assignment Filters";
  const { currentTenant } = useSettings();
  const isAllTenants = currentTenant === "AllTenants";
  const syncDialog = useDialog();
  const [syncQueueId, setSyncQueueId] = useState(null);
  const [useReportDB, setUseReportDB] = useState(isAllTenants);

  useEffect(() => {
    setUseReportDB(currentTenant === "AllTenants");
  }, [currentTenant]);

  const actions = [
    {
      label: "Create template based on filter",
      type: "POST",
      url: "/api/AddAssignmentFilterTemplate",
      icon: <Book />,
      data: {
        displayName: "displayName",
        description: "description",
        platform: "platform",
        rule: "rule",
        assignmentFilterManagementType: "assignmentFilterManagementType",
      },
      confirmText: "Are you sure you want to create a template based on this filter?",
      multiPost: false,
    },
    {
      label: "Edit Filter",
      link: "/endpoint/MEM/assignment-filters/edit?filterId=[id]",
      multiPost: false,
      icon: <Edit />,
      color: "success",
    },
    {
      label: "Delete Filter",
      type: "POST",
      url: "/api/ExecAssignmentFilter",
      icon: <TrashIcon />,
      data: {
        ID: "id",
        Action: "Delete",
      },
      confirmText: "Are you sure you want to delete this assignment filter?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "displayName",
      "description",
      "id",
      "platform",
      "rule",
      "assignmentFilterManagementType",
      "createdDateTime",
      "lastModifiedDateTime",
    ],
    actions: actions,
  };

  const simpleColumns = [
    ...(useReportDB ? ["CacheTimestamp"] : []),
    ...(useReportDB && isAllTenants ? ["Tenant"] : []),
    "displayName",
    "description",
    "platform",
    "assignmentFilterManagementType",
    "rule",
  ];

  const pageActions = [
    <Stack key="actions-stack" direction="row" spacing={1} alignItems="center">
      {useReportDB && (
        <>
          <CippQueueTracker
            queueId={syncQueueId}
            queryKey={`assignment-filters-${currentTenant}`}
            title="Assignment Filters Sync"
          />
          <Button
            startIcon={
              <SvgIcon fontSize="small">
                <Sync />
              </SvgIcon>
            }
            size="xs"
            onClick={syncDialog.handleOpen}
          >
            Sync
          </Button>
        </>
      )}
      <Tooltip
        title={
          isAllTenants
            ? "AllTenants always uses cached data"
            : useReportDB
              ? "Showing cached data from the Reporting Database - click to switch to live"
              : "Showing live data - click to switch to cache"
        }
      >
        <span>
          <Chip
            icon={useReportDB ? <CloudDone /> : <Bolt />}
            label={useReportDB ? "Cached" : "Live"}
            color="primary"
            size="small"
            onClick={isAllTenants ? undefined : () => setUseReportDB((prev) => !prev)}
            clickable={!isAllTenants}
            disabled={isAllTenants}
            variant="outlined"
          />
        </span>
      </Tooltip>
    </Stack>,
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        cardButton={
          <Stack direction="row" spacing={1} alignItems="center">
            <Button component={Link} href="assignment-filters/add" startIcon={<Add />}>
              Add Assignment Filter
            </Button>
            {pageActions}
          </Stack>
        }
        apiUrl={`/api/ListAssignmentFilters${useReportDB ? "?UseReportDB=true" : ""}`}
        queryKey={`assignment-filters-${currentTenant}-${useReportDB}`}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
      />
      <CippApiDialog
        createDialog={syncDialog}
        title="Sync Assignment Filters Report"
        fields={[]}
        api={{
          type: "GET",
          url: "/api/ExecCIPPDBCache",
          confirmText: `Run assignment filters cache sync for ${currentTenant}? This will update data immediately.`,
          relatedQueryKeys: [`assignment-filters-${currentTenant}-true`],
          data: {
            Name: "IntuneAssignmentFilters",
          },
          onSuccess: (result) => {
            if (result?.Metadata?.QueueId) {
              setSyncQueueId(result?.Metadata?.QueueId);
            }
          },
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
