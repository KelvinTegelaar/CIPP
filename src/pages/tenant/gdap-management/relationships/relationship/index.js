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
      {relationshipRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 2]} />}
      {relationshipRequest.isSuccess && (
        <Box
          sx={{
            flexGrow: 1,
            pt: 2,
          }}
        >
          <Stack spacing={3}>
            {data?.displayName.startsWith("MLT_") && (
              <Alert severity="warning">
                This relationship is a Microsoft-Led Transition (MLT) relationship and only has Read
                permissions.
              </Alert>
            )}
            {/* create alert for relationship with global administrator */}
            {data?.accessDetails?.unifiedRoles?.find((role) => {
              return role.roleDefinitionId === "62e90394-69f5-4237-9190-012177145e10";
            }) && (
              <Alert severity="warning">
                This relationship has Global Administrator access and is not eligible for automatic
                extension.
              </Alert>
            )}
            {CIPPDefaultGDAPRoles.every((role) =>
              data?.accessDetails?.unifiedRoles?.some(
                (relationshipRole) => relationshipRole.roleDefinitionId === role.value
              )
            ) ? (
              <Alert severity="success">
                This relationship has all the CIPP recommended roles.
              </Alert>
            ) : (
              <Alert severity="warning">
                This relationship does not have all the CIPP recommended roles. See the{" "}
                <Link
                  href="https://docs.cipp.app/setup/gdap/recommended-roles"
                  target="_blank"
                  rel="noreferrer"
                >
                  Recommended Roles
                </Link>{" "}
                documentation for more information.
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, md: 8 }}>
                <CippPropertyListCard
                  layout="double"
                  title="Relationship Details"
                  showDivider={false}
                  propertyItems={[
                    {
                      label: "ID",
                      value: (
                        <>
                          {data?.id}
                          <CippCopyToClipBoard text={data?.id} />
                        </>
                      ),
                    },
                    {
                      label: "Status",
                      value: getCippTranslation(data?.status, "status"),
                    },
                    {
                      label: "Auto Extend Duration",
                      value:
                        data?.autoExtendDuration == "PT0S"
                          ? "Not eligible for auto-extend"
                          : getCippFormatting(
                              data?.autoExtendDuration,
                              "autoExtendDuration",
                              "text"
                            ),
                    },
                    {
                      label: "Activated Date",
                      value: getCippFormatting(
                        data?.activatedDateTime,
                        "activatedDateTime",
                        "date"
                      ),
                    },
                    {
                      label: "Last Modified Date",
                      value: getCippFormatting(
                        data?.lastModifiedDateTime,
                        "lastModifiedDateTime",
                        "date"
                      ),
                    },
                    {
                      label: "End Date",
                      value: getCippFormatting(data?.endDateTime, "endDateTime", "date"),
                    },
                  ]}
                />
              </Grid>
              <Grid item size={{ xs: 12, md: 4 }}>
                <CippDataTable
                  title="Approved Roles"
                  simple={true}
                  data={data?.accessDetails.unifiedRoles}
                  simpleColumns={["roleDefinitionId"]}
                />

                {/* create an alert if the relationship name starts with MLT_ */}
              </Grid>
            </Grid>
          </Stack>
        </Box>
      )}
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
