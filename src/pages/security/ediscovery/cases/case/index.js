import { Layout as DashboardLayout } from "../../../../../layouts/index.js";
import { useRouter } from "next/router";
import { ApiGetCall } from "../../../../../api/ApiCall";
import CippFormSkeleton from "../../../../../components/CippFormPages/CippFormSkeleton";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions.json";
import { Box, Stack, Grid } from "@mui/system";
import { Alert, Chip } from "@mui/material";
import { CippPropertyListCard } from "../../../../../components/CippCards/CippPropertyListCard";
import { CippTimeAgo } from "../../../../../components/CippComponents/CippTimeAgo";
import { getCippFormatting } from "../../../../../utils/get-cipp-formatting";
import { Schedule, Gavel } from "@mui/icons-material";
import { useEffect, useState } from "react";

const Page = () => {
  const router = useRouter();
  const { caseId } = router.query;
  const [caseProperties, setCaseProperties] = useState([]);
  const [caseData, setCaseData] = useState({});

  const caseRequest = ApiGetCall({
    url: `/api/ListEdiscoveryCases`,
    queryKey: `ListEdiscoveryCases-${caseId}`,
  });

  const currentCase =
    caseRequest.isSuccess && caseId
      ? caseRequest.data?.Results?.find((c) => c.id === caseId)
      : null;

  const title = currentCase
    ? currentCase.displayName
    : caseRequest.isLoading
      ? "Loading..."
      : "Case Not Found";

  const subtitle = currentCase
    ? [
        {
          icon: <Schedule />,
          text: (
            <>
              Created <CippTimeAgo data={new Date(currentCase.createdDate)} />
            </>
          ),
        },
      ]
    : [];

  const actions = currentCase
    ? [
        ...(currentCase.status === "active"
          ? [
              {
                label: "Close Case",
                category: "manage",
                type: "POST",
                url: "/api/ExecEdiscoveryCase",
                data: {
                  caseId: currentCase.id,
                  action: "close",
                },
                confirmText:
                  "Are you sure you want to close this case? Holds will remain active.",
                relatedQueryKeys: [`ListEdiscoveryCases-${caseId}`],
              },
            ]
          : []),
        ...(currentCase.status === "closed"
          ? [
              {
                label: "Reopen Case",
                category: "manage",
                type: "POST",
                url: "/api/ExecEdiscoveryCase",
                data: {
                  caseId: currentCase.id,
                  action: "reopen",
                },
                confirmText: "Are you sure you want to reopen this case?",
                relatedQueryKeys: [`ListEdiscoveryCases-${caseId}`],
              },
            ]
          : []),
      ]
    : [];

  useEffect(() => {
    if (currentCase) {
      setCaseData(currentCase);
      setCaseProperties([
        {
          label: "Case Name",
          value: currentCase.displayName,
        },
        {
          label: "Status",
          value: (
            <Chip
              label={currentCase.status}
              color={currentCase.status === "active" ? "success" : "default"}
              size="small"
            />
          ),
        },
        {
          label: "Description",
          value: currentCase.description || "N/A",
        },
        {
          label: "Created By",
          value: currentCase.createdBy || "N/A",
        },
        {
          label: "Created Date",
          value: getCippFormatting(currentCase.createdDate, "createdDate", "date"),
        },
        {
          label: "Last Modified",
          value: getCippFormatting(currentCase.lastModified, "lastModified", "date"),
        },
        ...(currentCase.closedBy
          ? [
              {
                label: "Closed By",
                value: currentCase.closedBy,
              },
              {
                label: "Closed Date",
                value: getCippFormatting(currentCase.closedDate, "closedDate", "date"),
              },
            ]
          : []),
        ...(currentCase.externalId
          ? [
              {
                label: "External ID",
                value: currentCase.externalId,
              },
            ]
          : []),
      ]);
    }
  }, [currentCase?.id, currentCase?.status]);

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      isFetching={caseRequest.isLoading}
      actions={actions}
      actionsData={caseData}
      backUrl="/security/ediscovery/cases"
    >
      {caseRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 2]} />}
      {caseRequest.isSuccess && !currentCase && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Case not found. It may have been deleted.
        </Alert>
      )}
      {currentCase && (
        <Box sx={{ flexGrow: 1, pt: 2 }}>
          <Stack spacing={3}>
            {currentCase.status === "closed" && (
              <Alert severity="info" icon={<Gavel />}>
                This case is closed. Reopen it to modify holds, run new searches, or export results.
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <CippPropertyListCard
                  layout="double"
                  title="Case Details"
                  showDivider={false}
                  propertyItems={caseProperties}
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
