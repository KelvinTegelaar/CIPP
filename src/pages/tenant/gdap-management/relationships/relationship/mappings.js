import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import { HeaderedTabbedLayout } from "/src/layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions.json";
import { CippTimeAgo } from "../../../../../components/CippComponents/CippTimeAgo";
import { CippDataTable } from "../../../../../components/CippTable/CippDataTable";
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
      backUrl="/tenant/gdap-management/relationships"
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
          maxHeightOffset="550px"
        />
      )}
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
