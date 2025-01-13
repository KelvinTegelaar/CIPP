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
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";
import { CippImageCard } from "../../../../components/CippCards/CippImageCard";
import _ from "lodash";
const Page = () => {
  const router = useRouter();
  const [blockCards, setBlockCards] = useState([]);
  const [layoutMode, setLayoutMode] = useState("Table");
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
              //instead of this, use lodash to get the data for blockData
              const blockData = _.get(tenantData, field.value)
                ? _.get(tenantData, field.value)
                : ["No Data"];
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

              let tenantData =
                currentTenant !== "AllTenants"
                  ? bpaData?.data?.Data?.find((data) => data.GUID === tenantId)
                  : bpaData?.data?.Data;
              const flatFrontendFields = frontendFields.flat();
              const listOfFrontEndFields = flatFrontendFields.map((subField) =>
                //sometimes the subField contains a space. Only take the first part of the subField if it does.
                subField?.value?.includes(" ") ? subField.value.split(" ")[0] : subField.value
              );
              tenantData = Array.isArray(tenantData) ? tenantData : [tenantData];
              //filter down tenantData to only the fields listOfFrontEndFields
              tenantData = tenantData.map((data) => {
                const filteredData = {};
                listOfFrontEndFields.unshift("Tenant");
                listOfFrontEndFields.forEach((field) => {
                  //we need to get the correct key, but the key is nested and can contain dots, or []. So we use lodash get to get the correct key.
                  const dataField = _.get(data, field) ? _.get(data, field) : "No Data";
                  if (dataField === "FAILED") {
                    filteredData[field] = "Failed";
                  } else {
                    filteredData[field] = dataField;
                  }
                });
                return filteredData;
              });
              const cards = {
                simpleColumns: listOfFrontEndFields,
                formatter: "table",
                name: "BPA Table Report",
                data: tenantData,
              };
              setBlockCards([cards]);
            }
          }
        }
      }
    }
  }, [bpaTemplateList.isSuccess, bpaData.isSuccess, currentTenant, router]);

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
                          simple={false}
                          noCard={true}
                          incorrectDataMessage={"No data has been found for this report."}
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
