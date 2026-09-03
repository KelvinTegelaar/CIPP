import { Layout as DashboardLayout } from "../../../layouts/index";
import { CippIcons } from "../../../utils/icon-registry"
import { CippTablePage } from "../../../components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import { BreachSearchDialog } from "../../../components/CippComponents/BreachSearchDialog";
import { useDialog } from "../../../hooks/use-dialog";

const Page = () => {
  const pageTitle = "Potential Breached passwords and information";
  const apiUrl = "/api/ListBreachesTenant";
  const breachSearchDialog = useDialog();
  
  const actions = [
    {
      label: "View User",
      link: "/tools/breachlookup?account=[email]",
      multiPost: false,
      icon: <CippIcons.EyeIcon />,
      color: "success",
    },
  ];

  return (
    <>
      <CippTablePage
        actions={actions}
        title={pageTitle}
        apiUrl={apiUrl}
        simpleColumns={["email", "password", "sources"]}
        tenantInTitle={false}
        cardButton={
          <>
            <Button onClick={breachSearchDialog.handleOpen} startIcon={<CippIcons.MagnifyingGlassIcon />}>
              Run Breach Check
            </Button>
          </>
        }
      />
      <BreachSearchDialog createDialog={breachSearchDialog} />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
