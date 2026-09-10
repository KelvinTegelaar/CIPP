import { useState } from "react";
import { CippIcons } from "../../../../utils/icon-registry"
import { Box, Button, Container } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useWatch } from "react-hook-form";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import { useSettings } from "../../../../hooks/use-settings";
import CippButtonCard from "../../../../components/CippCards/CippButtonCard";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { CippBitlockerKeySearch } from "../../../../components/CippComponents/CippBitlockerKeySearch";
import { CippHead } from "../../../../components/CippComponents/CippHead";

const Page = () => {
  const currentTenant = useSettings().currentTenant;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      lookupType: "keyId",
      searchTerm: "",
    },
  });

  const lookupType = useWatch({ control: formControl.control, name: "lookupType" });
  const searchTerm = useWatch({ control: formControl.control, name: "searchTerm" });

  const [submitted, setSubmitted] = useState(null);

  const handleSearch = () => {
    const trimmed = searchTerm?.trim();
    if (!trimmed) return;
    setSubmitted({
      term: trimmed,
      type: lookupType || "keyId",
      key: Date.now(),
    });
  };

  return (
    <>
      <CippHead title="BitLocker Key Search" />
      <Box
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth={false}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <CippButtonCard title="BitLocker Key Search">
                <Grid container spacing={2} sx={{
                  alignItems: "flex-end"
                }}>
                  <Grid size={{ xs: 12 }}>
                    <CippFormComponent
                      type="radio"
                      name="lookupType"
                      label="Lookup Type"
                      formControl={formControl}
                      row
                      options={[
                        { label: "Key ID", value: "keyId" },
                        { label: "Device ID", value: "deviceId" },
                      ]}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <CippFormComponent
                      formControl={formControl}
                      name="searchTerm"
                      type="textField"
                      label={
                        lookupType === "deviceId"
                          ? "Azure AD Device ID"
                          : "BitLocker Recovery Key ID"
                      }
                      required
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleSearch();
                        }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<CippIcons.MagnifyingGlassIcon />}
                      onClick={handleSearch}
                      disabled={!searchTerm?.trim()}
                    >
                      Search
                    </Button>
                  </Grid>
                </Grid>
              </CippButtonCard>
            </Grid>

            {submitted && (
              <Grid size={{ xs: 12 }}>
                <CippBitlockerKeySearch
                  key={submitted.key}
                  initialSearchTerm={submitted.term}
                  initialSearchType={submitted.type}
                  autoSearch
                  tenantFilter={currentTenant}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
