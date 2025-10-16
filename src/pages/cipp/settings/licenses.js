import tabOptions from "./tabOptions";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button, SvgIcon } from "@mui/material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Add } from "@mui/icons-material";
import { CippApiDialog } from "../../../components/CippComponents/CippApiDialog";
import { useDialog } from "../../../hooks/use-dialog";

const Page = () => {
  const pageTitle = "Excluded Licenses";
  const apiUrl = "/api/ExecExcludeLicenses";
  const apiData = { List: true };
  const createDialog = useDialog();
  const simpleColumns = ["Product_Display_Name", "GUID"];

  const actions = [
    {
      label: "Delete Exclusion",
      type: "POST",
      url: "/api/ExecExcludeLicenses?RemoveExclusion=true",
      data: { GUID: "GUID" },
      confirmText: "Do you want to delete this exclusion?",
      color: "error",
      icon: (
        <SvgIcon fontSize="small">
          <TrashIcon />
        </SvgIcon>
      ),
    },
  ];

  const AddExcludedLicense = () => {
    return (
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
        cardButton={<AddExcludedLicense />}
        apiData={apiData}
        actions={actions}
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
          url: "/api/ExecExcludeLicenses?AddExclusion=true",
          confirmText:
            "Add a license to the exclusion table, make sure to enter the correct GUID and SKU Name",
          type: "POST",
          data: {},
          replacementBehaviour: "removeNulls",
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
