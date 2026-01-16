import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { EyeIcon } from "@heroicons/react/24/outline";
import { Button } from "@mui/material";
import { Search } from "@mui/icons-material";
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
      icon: <EyeIcon />,
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
            <Button onClick={breachSearchDialog.handleOpen} startIcon={<Search />}>
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
