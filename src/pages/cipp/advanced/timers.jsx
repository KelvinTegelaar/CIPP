import { Layout as DashboardLayout } from "../../../layouts/index";
import { CippIcons } from "../../../utils/icon-registry"
import { SvgIcon, Button } from "@mui/material";
import { ApiPostCall } from "../../../api/ApiCall";
import { useEffect, useState } from "react";
import { CippTablePage } from "../../../components/CippComponents/CippTablePage";
import { useDialog } from "../../../hooks/use-dialog";
import { CippApiDialog } from "../../../components/CippComponents/CippApiDialog";

const Page = () => {
  const pageTitle = "Timers";
  const apiUrl = "/api/ExecCippFunction";
  const apiData = { FunctionName: "Get-CIPPTimerFunctions", Parameters: { ListAllTasks: true } };
  const [data, setData] = useState([]);
  const createDialog = useDialog();
  // Craft (CIPPNG) rows carry the scheduler's timezone and jitter instead of the Functions status fields
  const isCraft = Array.isArray(data) && data.some((row) => "JitterMinutes" in row);
  const simpleColumns = isCraft
    ? [
        "Priority",
        "Command",
        "Parameters",
        "Cron",
        "Timezone",
        "JitterMinutes",
        "JitterDelay",
        "NextOccurrence",
        "LastOccurrence",
      ]
    : [
        "Priority",
        "Command",
        "Parameters",
        "Cron",
        "NextOccurrence",
        "LastOccurrence",
        "Status",
        "PreferredProcessor",
        "ErrorMsg",
      ];

  const offCanvas = {
    extendedInfoFields: simpleColumns,
    actions: [],
  };

  const fetchData = ApiPostCall({
    relatedQueryKeys: ["CippTimers"],
    onResult: (result) => setData(result),
  });

  const handleRefresh = () => {
    fetchData.mutate({ url: apiUrl, data: apiData });
  };

  useEffect(() => {
    if (!fetchData.isSuccess) {
      handleRefresh();
    }
  }, [fetchData.isSuccess]);

  const ResetToDefaultButton = () => {
    return (
      <Button
        variant="contained"
        size="small"
        onClick={createDialog.handleOpen}
        startIcon={
          <SvgIcon fontSize="small">
            <CippIcons.Refresh />
          </SvgIcon>
        }
      >
        Reset to Default
      </Button>
    );
  };

  return (
    <>
      <CippTablePage
        title={pageTitle}
        data={data}
        simpleColumns={simpleColumns}
        tenantInTitle={false}
        refreshFunction={handleRefresh}
        isFetching={fetchData.isPending}
        cardButton={isCraft ? undefined : <ResetToDefaultButton />}
        offCanvas={offCanvas}
        actions={[
          {
            label: "Run Now",
            type: "POST",
            url: apiUrl,
            data: { FunctionName: "Command", Parameters: "Parameters" },
            confirmText: "Do you want to run this task now?",
            allowResubmit: true,
            icon: <CippIcons.PlayArrow />,
          },
        ]}
      />
      <CippApiDialog
        title="Reset to Default"
        createDialog={createDialog}
        fields={[]}
        api={{
          url: apiUrl,
          confirmText: "Do you want to reset all timers to default?",
          type: "POST",
          data: { FunctionName: "!Get-CIPPTimerFunctions", Parameters: { ResetToDefault: true } },
          relatedQueryKeys: ["CippTimers"],
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
