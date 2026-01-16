import { Layout as DashboardLayout } from "/src/layouts/index.js";
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
import { Alert, Link } from "@mui/material";
import CIPPDefaultGDAPRoles from "/src/data/CIPPDefaultGDAPRoles.json";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { Schedule } from "@mui/icons-material";
import { useEffect, useState } from "react";
import CippGdapActions from "../../../../../components/CippComponents/CippGdapActions";

const Page = () => {
  const router = useRouter();
  const { id } = router.query;
  const [relationshipProperties, setRelationshipProperties] = useState([]);
  const [relationshipData, setRelationshipData] = useState({});

  const relationshipRequest = ApiGetCall({
    url: `/api/ListGraphRequest?Endpoint=tenantRelationships/delegatedAdminRelationships/${id}`,
    queryKey: `ListRelationships-${id}`,
  });

  const getRelationshipType = (relationshipName) => {
    if (relationshipName.startsWith("MLT_")) {
      return "Microsoft-Led Transition (MLT)";
    } else if (
      relationshipName.startsWith("CIPP_") ||
      relationshipName.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    ) {
      return "CIPP";
    } else if (relationshipName.startsWith("LHSetup_")) {
      return "Lighthouse";
    } else {
      return "Manual";
    }
  };

  // Set the title and subtitle for the layout
  const title = relationshipRequest.isSuccess
    ? (relationshipRequest.data?.Results?.[0]?.customer?.displayName ?? "No Customer Set") +
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

  useEffect(() => {
    if (relationshipRequest.isSuccess) {
      const data = relationshipRequest?.data?.Results?.[0];
      setRelationshipData(data);
      var properties = [
        {
          label: "Customer",
          value: data?.customer?.displayName ?? "N/A",
        },
        {
          label: "Tenant ID",
          value: data?.customer?.tenantId ?? "N/A",
        },
        {
          label: "Relationship Type",
          value: getRelationshipType(data?.displayName),
        },
        {
          label: "Relationship ID",
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
              : getCippFormatting(data?.autoExtendDuration, "autoExtendDuration", "text"),
        },
        {
          label: "Activated Date",
          value: getCippFormatting(data?.activatedDateTime, "activatedDateTime", "date"),
        },
        {
          label: "Last Modified Date",
          value: getCippFormatting(data?.lastModifiedDateTime, "lastModifiedDateTime", "date"),
        },
        {
          label: "End Date",
          value: getCippFormatting(data?.endDateTime, "endDateTime", "date"),
        },
      ];
      if (data?.status === "approvalPending") {
        properties.push({
          label: "Invite URL",
          value: getCippFormatting(
            "https://admin.cloud.microsoft/?#/partners/invitation/granularAdminRelationships/" +
              data?.id,
            "InviteUrl",
            "url"
          ),
        });
      }
      setRelationshipProperties(properties);
    }
  }, [relationshipRequest.isSuccess]);

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      isFetching={relationshipRequest.isLoading}
      actions={CippGdapActions()}
      actionsData={relationshipData}
      backUrl="/tenant/gdap-management/relationships"
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
            {relationshipRequest?.data?.Results?.[0]?.displayName.startsWith("MLT_") && (
              <Alert severity="warning">
                This relationship is a Microsoft-Led Transition (MLT) relationship and only has Read
                permissions.
              </Alert>
            )}
            {/* create alert for relationship with global administrator */}
            {relationshipRequest?.data?.Results?.[0]?.accessDetails?.unifiedRoles?.find((role) => {
              return role.roleDefinitionId === "62e90394-69f5-4237-9190-012177145e10";
            }) && (
              <Alert severity="warning">
                This relationship has Global Administrator access and is not eligible for automatic
                extension.
              </Alert>
            )}
            {CIPPDefaultGDAPRoles.every((role) =>
              relationshipRequest?.data?.Results?.[0]?.accessDetails?.unifiedRoles?.some(
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
              <Grid size={{ xs: 12, md: 8 }}>
                <CippPropertyListCard
                  layout="double"
                  title="Relationship Details"
                  showDivider={false}
                  propertyItems={relationshipProperties}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <CippDataTable
                  title="Approved Roles"
                  simple={true}
                  data={relationshipRequest?.data?.Results?.[0]?.accessDetails.unifiedRoles}
                  simpleColumns={["roleDefinitionId"]}
                />
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
