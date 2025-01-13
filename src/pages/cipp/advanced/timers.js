import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { SvgIcon, Button } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { ApiPostCall } from "../../../api/ApiCall";
import { useEffect, useState } from "react";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage";
import { useDialog } from "../../../hooks/use-dialog";
import { CippApiDialog } from "../../../components/CippComponents/CippApiDialog";

const Page = () => {
  const pageTitle = "Timers";
  const apiUrl = "/api/ExecCippFunction";
  const apiData = { FunctionName: "Get-CIPPTimerFunctions", Parameters: { ListAllTasks: true } };
  const [data, setData] = useState([]);
  const createDialog = useDialog();
  const simpleColumns = [
    "Priority",
    "Command",
    "Parameters",
    "Cron",
    "NextOccurrence",
    "LastOccurrence",
    "Status",
    "PreferredProcessor",
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
            <Refresh />
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
        cardButton={<ResetToDefaultButton />}
        offCanvas={offCanvas}
        actions={[]}
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
