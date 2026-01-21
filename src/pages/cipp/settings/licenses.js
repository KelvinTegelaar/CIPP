import tabOptions from "./tabOptions";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button, SvgIcon, Stack } from "@mui/material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Add, RestartAlt } from "@mui/icons-material";
import { CippApiDialog } from "../../../components/CippComponents/CippApiDialog";
import { useDialog } from "../../../hooks/use-dialog";

const Page = () => {
  const pageTitle = "Excluded Licenses";
  const apiUrl = "/api/ListExcludedLicenses";
  const createDialog = useDialog();
  const resetDialog = useDialog();
  const simpleColumns = ["Product_Display_Name", "GUID"];

  const actions = [
    {
      label: "Delete Exclusion",
      type: "POST",
      url: "/api/ExecExcludeLicenses",
      data: { Action: "!RemoveExclusion", GUID: "GUID" },
      confirmText: "Do you want to delete this exclusion?",
      color: "error",
      icon: (
        <SvgIcon fontSize="small">
          <TrashIcon />
        </SvgIcon>
      ),
    },
  ];

  const CardButtons = () => {
    return (
      <Stack spacing={2} direction="row">
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={createDialog.handleOpen}
          startIcon={
            <SvgIcon fontSize="small">
              <Add />
            </SvgIcon>
          }
        >
          Add Excluded License
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="primary"
          onClick={resetDialog.handleOpen}
          startIcon={<RestartAlt />}
        >
          Restore Defaults
        </Button>
      </Stack>
    );
  };

  const offCanvas = {
    extendedInfoFields: ["Product_Display_Name", "GUID"],
    actions: actions,
  };

  return (
    <>
      <CippTablePage
        title={pageTitle}
        queryKey="ExcludedLicenses"
        apiUrl={apiUrl}
        cardButton={<CardButtons />}
        actions={actions}
        apiDataKey="Results"
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        tenantInTitle={false}
      />
      <CippApiDialog
        title="Add Excluded License"
        createDialog={createDialog}
        fields={[
          {
            type: "textField",
            name: "GUID",
            label: "GUID",
            disableVariables: true,
          },
          {
            type: "textField",
            name: "SKUName",
            label: "SKU Name",
            disableVariables: true,
          },
        ]}
        api={{
          url: "/api/ExecExcludeLicenses",
          confirmText:
            "Add a license to the exclusion table, make sure to enter the correct GUID and SKU Name",
          type: "POST",
          data: { Action: "!AddExclusion" },
          replacementBehaviour: "removeNulls",
          relatedQueryKeys: ["ExcludedLicenses"],
        }}
      />
      <CippApiDialog
        title="Restore Defaults"
        createDialog={resetDialog}
        fields={[
          {
            type: "switch",
            name: "FullReset",
            label: "Full Reset (clear all entries including manually added ones)",
          },
        ]}
        api={{
          url: "/api/ExecExcludeLicenses",
          confirmText:
            "This will restore default licenses from the config file. If 'Full Reset' is enabled, all existing entries will be cleared first.",
          type: "POST",
          data: { Action: "!RestoreDefaults" },
          relatedQueryKeys: ["ExcludedLicenses"],
        }}
      />
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
