import {
  Box,
  Button,
  Container,
  Typography,
  Skeleton,
  Link,
  Chip,
  Avatar,
  Alert,
} from "@mui/material";
import { Grid } from "@mui/system";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import { Search } from "@mui/icons-material";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { ApiGetCall } from "/src/api/ApiCall";
import DOMPurify from "dompurify";
import { getCippTranslation } from "/src/utils/get-cipp-translation";
import { useRouter } from "next/router";
import { useEffect } from "react";
import CippCsvExportButton from "/src/components/CippComponents/CippCsvExportButton";
import { CippCopyToClipBoard } from "../../../components/CippComponents/CippCopyToClipboard";

const Page = () => {
  const formControl = useForm({ mode: "onBlur" });
  const account = useWatch({ control: formControl.control, name: "account" });
  const getGeoIP = ApiGetCall({
    url: "/api/ListBreachesAccount",
    data: { account: account },
    queryKey: `breaches-${account}`,
    waiting: false,
  });

  const router = useRouter();
  useEffect(() => {
    if (!router.query.account) return;
    formControl.setValue("account", router.query.account);
    //sleep 200 ms to allow update
    setTimeout(() => {
      getGeoIP.refetch();
    }, 200);
  }, [router.query.account]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        py: 4,
      }}
    >
      <Container maxWidth={false}>
        <Grid container spacing={3}>
          <Grid container spacing={4}>
            <Grid spacing={4} size={{ xs: 12 }}>
              <Alert severity="info">
                <Typography variant="body1" color="textPrimary">
                  This page is in beta and may not always give expected results.
                </Typography>
              </Alert>

              <CippButtonCard title="Breach lookup">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 8 }}>
                    <CippFormComponent
                      formControl={formControl}
                      name="account"
                      type="textField"
                      label="Email address or domain name"
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Button
                      type="submit"
                      onClick={() => getGeoIP.refetch()}
                      variant="contained"
                      startIcon={<Search />}
                    >
                      Check
                    </Button>
                  </Grid>
                </Grid>
              </CippButtonCard>
            </Grid>
          </Grid>
          {/* Export Button */}
          {getGeoIP.data && getGeoIP.data.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <CippCsvExportButton
                rawData={getGeoIP.data} // Pass raw breaches data
                reportName="User_Breaches"
              />
            </Grid>
          )}
          {getGeoIP.isFetching ? (
            <Grid size={{ xs: 8 }}>
              <CippButtonCard title="Fetching Results">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }} textAlign="center">
                    <Skeleton width={"100%"} />
                  </Grid>
                </Grid>
              </CippButtonCard>
            </Grid>
          ) : getGeoIP.data ? (
            <>
              {getGeoIP.data.length === 0 && (
                <Grid size={{ xs: 8 }}>
                  <CippButtonCard title="No breaches detected">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="body1" color="textPrimary">
                          No breaches have been detected for this account
                        </Typography>
                      </Grid>
                    </Grid>
                  </CippButtonCard>
                </Grid>
              )}
              {getGeoIP.data?.map((breach, index) => (
                <Grid key={index} spacing={2} size={{ xs: 3 }}>
                  <CippButtonCard
                    cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
                    title={<>{breach.Title}</>}
                    cardActions={
                      <Avatar
                        sx={{ width: 20, height: 20, ml: 1 }}
                        variant="square"
                        src={breach.LogoPath}
                      />
                    }
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                          Partial Password Available
                        </Typography>
                        <Typography variant="body2" color="textPrimary">
                          {breach.password ? (
                            <>
                              Yes
                              <CippCopyToClipBoard text={breach.password} type="password" />
                            </>
                          ) : (
                            "No"
                          )}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                          Description
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textPrimary"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(breach.Description),
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="body1" gutterBottom>
                          <Link href={breach.Domain} target="_blank">
                            {breach.Domain}
                          </Link>
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                          Leaked Data classes
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", mt: 1 }}>
                          {breach.DataClasses?.map((threat, idx) => (
                            <Chip
                              key={idx}
                              label={threat}
                              size="small"
                              color="info"
                              sx={{ mr: 1, mt: 1 }}
                            />
                          ))}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                          Breach Information
                        </Typography>
                        <Typography variant="body1" color="textPrimary">
                          {
                            //make a chip for each item that is boolean and true in the breach object
                            Object.keys(breach).map((key) => {
                              if (typeof breach[key] === "boolean" && breach[key]) {
                                return (
                                  <Chip
                                    key={key}
                                    label={getCippTranslation(key)}
                                    size="small"
                                    color="info"
                                    sx={{ mr: 1, mt: 1 }}
                                  />
                                );
                              }
                            })
                          }
                        </Typography>
                      </Grid>
                    </Grid>
                  </CippButtonCard>
                </Grid>
              ))}
            </>
          ) : (
            <>
              {getGeoIP.isSuccess && (
                <Grid size={{ xs: 8 }}>
                  <CippButtonCard title="No breaches detected">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="body1" color="textPrimary">
                          No breaches have been detected for this account
                        </Typography>
                      </Grid>
                    </Grid>
                  </CippButtonCard>
                </Grid>
              )}
              {getGeoIP.isError && (
                <Grid size={{ xs: 8 }}>
                  <CippButtonCard title="Error">
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="body1" color="textPrimary">
                          An error occurred while connecting to the HIBP API.
                        </Typography>
                        {getGeoIP.error?.response?.data && (
                          <Typography variant="body2" color="textSecondary">
                            {getGeoIP.error.response.data}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </CippButtonCard>
                </Grid>
              )}
            </>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
