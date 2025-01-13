import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useSettings } from "/src/hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import { HeaderedTabbedLayout } from "/src/layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions.json";
import { Box, Grid, Stack } from "@mui/system";
import { CippTimeAgo } from "../../../../../components/CippComponents/CippTimeAgo";
import { getCippTranslation } from "../../../../../utils/get-cipp-translation";
import { CippPropertyListCard } from "../../../../../components/CippCards/CippPropertyListCard";
import { getCippFormatting } from "../../../../../utils/get-cipp-formatting";
import { CippDataTable } from "../../../../../components/CippTable/CippDataTable";
import { Alert, Divider, Link, Typography } from "@mui/material";
import CIPPDefaultGDAPRoles from "/src/data/CIPPDefaultGDAPRoles.json";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { Schedule } from "@mui/icons-material";

const Page = () => {
  const router = useRouter();
  const { id } = router.query;

  const relationshipRequest = ApiGetCall({
    url: `/api/ListGraphRequest?Endpoint=tenantRelationships/delegatedAdminRelationships/${id}`,
    queryKey: `ListRelationships-${id}`,
  });

  // Set the title and subtitle for the layout
  const title = relationshipRequest.isSuccess
    ? relationshipRequest.data?.Results?.[0]?.customer?.displayName +
      " - " +
      relationshipRequest.data?.Results?.[0]?.displayName
    : "Loading...";

  const subtitle = relationshipRequest.isSuccess
    ? [
        {
          icon: <Schedule />,
          text: (
            <>
              Created{" "}
              <CippTimeAgo
                data={new Date(relationshipRequest.data?.Results?.[0]?.createdDateTime)}
              />{" "}
            </>
          ),
        },
      ]
    : [];

  const data = relationshipRequest?.data?.Results?.[0];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      isFetching={relationshipRequest.isLoading}
    >
      {id && (
        <CippDataTable
          title="Role Mappings"
          api={{
            url: `/api/ListGDAPAccessAssignments`,
            data: { id },
            dataKey: "Results",
            queryKey: `AccessAssignments-${id}`,
          }}
          simpleColumns={["group.displayName", "status", "createdDateTime", "roles", "members"]}
        />
      )}
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
