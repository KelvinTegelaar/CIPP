import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { ExclamationTriangleIcon, EyeIcon } from "@heroicons/react/24/outline";
import { ApiGetCall } from "../../../api/ApiCall";
import { Button, CircularProgress, SvgIcon } from "@mui/material";
import { useSettings } from "../../../hooks/use-settings";

const Page = () => {
  const tenantFilter = useSettings()?.currentTenant;
  const ApiCall = ApiGetCall({
    url: "/api/ExecBreachSearch",
    data: { tenantFilter: tenantFilter },
    waiting: false,
  });

  const pageTitle = "Potential Breached passwords and information";
  const apiUrl = "/api/ListBreachesTenant";
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
    <CippTablePage
      actions={actions}
      title={pageTitle}
      apiUrl={apiUrl}
      simpleColumns={["email", "password", "sources"]}
      tenantInTitle={false}
      cardButton={
        <>
          <Button onClick={ApiCall.refetch}>
            Run Breach Check
            {ApiCall.isFetching && (
              <SvgIcon>
                <CircularProgress size={10} />
              </SvgIcon>
            )}
            {ApiCall.isError && (
              <SvgIcon color="error">
                <ExclamationTriangleIcon />
              </SvgIcon>
            )}
            {ApiCall.isSuccess && <SvgIcon color="success">✓</SvgIcon>}
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
