import { Layout as DashboardLayout } from "/src/layouts/index.js";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
  SvgIcon,
  Skeleton,
  Chip,
} from "@mui/material";
import Head from "next/head";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { useRouter } from "next/router";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useSettings } from "../../../../hooks/use-settings";
import { useEffect, useState } from "react";
import CippButtonCard from "../../../../components/CippCards/CippButtonCard";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";
import { Api } from "@mui/icons-material";
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";
import { CippImageCard } from "../../../../components/CippCards/CippImageCard";

const Page = () => {
  const router = useRouter();
  const [blockCards, setBlockCards] = useState([]);
  const [layoutMode, setLayoutMode] = useState("");
  const bpaTemplateList = ApiGetCall({
    url: "/api/listBPATemplates",
    queryKey: "ListBPATemplates",
  });
  const tenantFilter = useSettings().currentTenant;
  const bpaData = ApiGetCall({
    url: "/api/listBPA",
    data: {
      tenantFilter: tenantFilter,
    },
    queryKey: "ListBPA",
  });
  const tenantInfo = ApiGetCall({
    url: "/api/ListTenants",
    queryKey: "TenantSelector",
  });
  const currentTenant = useSettings().currentTenant;

  useEffect(() => {
    if (bpaTemplateList.isSuccess) {
      const bpaTemplate = bpaTemplateList.data.find(
        (template) => template.Name === router.query.id
      );
      if (bpaTemplate) {
        setLayoutMode(bpaTemplate.Style);
        if (bpaTemplate.Style === "Tenant") {
          const frontendFields = bpaTemplate.Data.map((block) => block.FrontendFields[0]);

          if (bpaData.isSuccess) {
            const tenantId = tenantInfo?.data.find(
              (tenant) => tenant?.defaultDomainName === tenantFilter
            )?.customerId;

            const tenantData = bpaData?.data?.Data?.find((data) => data.GUID === tenantId);
            const cards = frontendFields.map((field) => {
              const blockData = field.value.split(".").reduce((obj, key) => obj[key], tenantData);
              return {
                name: field.name,
                value: field.value,
                desc: field.desc,
                formatter: field.formatter,
                data: blockData,
              };
            });
            setBlockCards(cards);
          }
        }
        if (bpaTemplate.Style === "Table") {
          if (bpaData.isSuccess) {
            //Table mode works slightly different; each Field is a datasource, but all we need is the frontEndfields and show them in a table. Field[0], Field[2]. etc all contain "FrontendFields". There can be an unlimited amount of frontendFields
            const frontendFields = bpaTemplate.Data.map((block) => block.FrontendFields);
            if (bpaData.isSuccess) {
              const tenantId = tenantInfo?.data.find(
                (tenant) => tenant?.defaultDomainName === tenantFilter
              )?.customerId;

              const tenantData = bpaData?.data?.Data?.find((data) => data.GUID === tenantId);
              //frontendfields is an array of arrays. We need to flatten it to a single array.
              const flatFrontendFields = frontendFields.flat();
              console.log(flatFrontendFields.map((subField) => subField.value));
              const cards = {
                simpleColumns: flatFrontendFields.map((subField) => subField.value),
                formatter: "table",
                name: "BPA Table Report",
                data: [tenantData],
              };
              setBlockCards([cards]);
            }
          }
        }
      }
    }
  }, [bpaTemplateList.isSuccess, bpaData.isSuccess, currentTenant]);

  const pageTitle = `BPA Report Viewer - ${currentTenant}`;
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Box
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth={false}>
          <Stack spacing={4}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button
                color="inherit"
                onClick={() => router.back()}
                startIcon={
                  <SvgIcon fontSize="small">
                    <ArrowLeftIcon />
                  </SvgIcon>
                }
              >
                Back to Templates
              </Button>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={10} sm={6} md={4}>
                <Typography variant="h4" gutterBottom>
                  {pageTitle}
                </Typography>
              </Grid>
            </Grid>
          </Stack>
          {bpaTemplateList.isLoading && <Skeleton />}

          <Grid container spacing={2}>
            {currentTenant === "AllTenants" && layoutMode !== "Table" ? (
              <Grid item xs={10} sm={6} md={4}>
                <CippImageCard
                  title="Not supported"
                  imageUrl="/assets/illustrations/undraw_website_ij0l.svg"
                  text={
                    "This report does not support All Tenants, please select a different tenant using the tenant selector."
                  }
                />
              </Grid>
            ) : (
              <>
                {blockCards.map((block, index) => (
                  <Grid
                    item
                    xs={10}
                    sm={layoutMode === "Table" ? 12 : 6}
                    md={layoutMode === "Table" ? 12 : 4}
                    key={block.name}
                  >
                    <CippButtonCard
                      cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
                      title={block.name}
                      CardButton={
                        <Typography color="text.secondary" variant="body2">
                          {block.desc}
                        </Typography>
                      }
                    >
                      {block.formatter === "String" ? (
                        <Typography variant="h6" color="textPrimary">
                          {block.data}
                        </Typography>
                      ) : block.formatter === "bool" ? (
                        <Chip
                          label={block.data ? "Yes" : "No"}
                          color={block.data ? "success" : "error"}
                        />
                      ) : block.formatter === "warnBool" ? (
                        <Chip
                          label={block.data ? "Yes" : "No"}
                          color={block.data ? "success" : "warning"}
                        />
                      ) : block.formatter === "reverseBool" ? (
                        <Chip
                          label={block.data ? "No" : "Yes"}
                          color={block.data ? "error" : "success"}
                        />
                      ) : block.formatter === "number" ? (
                        //really big number centered in the card.
                        <Typography variant="h1" color="textPrimary">
                          <center>{block.data}</center>
                        </Typography>
                      ) : block.formatter === "Percentage" ? (
                        <>{block.data}</>
                      ) : block.formatter === "table" ? (
                        <CippDataTable
                          data={block.data}
                          simple={true}
                          noCard={true}
                          simpleColumns={block?.simpleColumns}
                        />
                      ) : (
                        <Typography variant="h6" color="textPrimary">
                          Something is wrong with your report. This field is not formatted
                          correctly.
                        </Typography>
                      )}
                    </CippButtonCard>
                  </Grid>
                ))}
              </>
            )}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
