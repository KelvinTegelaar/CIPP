import { Button, Typography, Alert, Box, TextField, InputAdornment } from "@mui/material";
import { Key } from "@mui/icons-material";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiPostCall } from "../../api/ApiCall";
import { CippCopyToClipBoard } from "../CippComponents/CippCopyToClipboard";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { useForm } from "react-hook-form";

const CippSiemSettings = () => {
  const generateSas = ApiPostCall({
    datafromUrl: true,
  });

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      Days: { label: "365 days", value: "365" },
    },
  });

  const handleGenerate = () => {
    const formData = formControl.getValues();
    const days = formData.Days?.value ?? "365";
    generateSas.mutate({
      url: "/api/ExecCippLogsSas",
      data: { Days: parseInt(days, 10) },
      queryKey: "ExecCippLogsSas",
    });
  };

  return (
    <CippButtonCard
      title="CIPP Logs Table Access"
      cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
      CardButton={
        <Button
          variant="contained"
          size="small"
          onClick={handleGenerate}
          disabled={generateSas.isPending || !formControl.formState.isValid}
          startIcon={<Key style={{ width: 16, height: 16 }} />}
        >
          Generate SAS Token
        </Button>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        <Alert severity="info">
          Generate a read-only SAS token for the CIPP Logs table. This token can be used to query
          log data from external SIEM tools or scripts using the Azure Table Storage REST API. Note
          that generating a new URL does not invalidate previous URLs.
        </Alert>

        <Box>
          <CippFormComponent
            type="autoComplete"
            name="Days"
            label="Token Validity"
            helperText="Select how long the SAS token should be valid for. Enter a custom value in days if needed."
            multiple={false}
            creatable={true}
            options={[
              { label: "30 days", value: "30" },
              { label: "60 days", value: "60" },
              { label: "90 days", value: "90" },
              { label: "180 days", value: "180" },
              { label: "365 days", value: "365" },
              { label: "730 days (2 years)", value: "730" },
              { label: "1095 days (3 years)", value: "1095" },
              { label: "1825 days (5 years)", value: "1825" },
              { label: "3650 days (10 years)", value: "3650" },
            ]}
            formControl={formControl}
            validators={{ required: "Please select a validity period" }}
          />
        </Box>

        {generateSas.isError && (
          <Alert severity="error">
            {generateSas.error?.response?.data?.Results ||
              generateSas.error?.message ||
              "Failed to generate SAS token"}
          </Alert>
        )}

        {generateSas.isSuccess && generateSas.data?.data?.Results && (
          <>
            <Alert severity="success">
              SAS URL generated successfully. Copy this for your records, it will only be shown
              once.
            </Alert>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                SAS URL
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={generateSas.data.data.Results.SASUrl}
                slotProps={{
                  input: {
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <CippCopyToClipBoard text={generateSas.data.data.Results.SASUrl} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Expires On
              </Typography>
              <Typography variant="body2">
                {new Date(generateSas.data.data.Results.ExpiresOn).toLocaleString()}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </CippButtonCard>
  );
};

export default CippSiemSettings;
