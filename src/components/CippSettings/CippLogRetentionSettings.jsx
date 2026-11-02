import { Button, Typography, TextField, Box } from "@mui/material";
import CippButtonCard from "../CippCards/CippButtonCard";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { useState, useEffect } from "react";

const CippLogRetentionSettings = ({
  title = "Log Retention",
  endpoint = "ExecLogRetentionConfig",
  defaultDays = 90,
  description = "Configure how long to keep CIPP log entries. Logs will be automatically deleted after this period.",
}) => {
  const retentionSetting = ApiGetCall({
    url: `/api/${endpoint}?List=true`,
    queryKey: `${endpoint}Settings`,
  });

  const retentionChange = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: `${endpoint}Settings`,
  });

  const [retentionDays, setRetentionDays] = useState(defaultDays);
  const [error, setError] = useState("");

  useEffect(() => {
    if (retentionSetting?.data?.Results?.RetentionDays) {
      setRetentionDays(retentionSetting.data.Results.RetentionDays);
    }
  }, [retentionSetting.data]);

  const handleRetentionChange = () => {
    const days = parseInt(retentionDays);

    if (isNaN(days) || days < 7) {
      setError("Retention must be at least 7 days");
      return;
    }

    if (days > 365) {
      setError("Retention must be at most 365 days");
      return;
    }

    setError("");
    retentionChange.mutate({
      url: `/api/${endpoint}`,
      data: { RetentionDays: days },
      queryKey: `${endpoint}Post`,
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setRetentionDays(value);

    const days = parseInt(value);
    if (!isNaN(days) && days < 7) {
      setError("Retention must be at least 7 days");
    } else if (!isNaN(days) && days > 365) {
      setError("Retention must be at most 365 days");
    } else if (isNaN(days) && value !== "") {
      setError("Please enter a valid number");
    } else {
      setError("");
    }
  };

  return (
    <CippButtonCard
      title={title}
      cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
      CardButton={
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <TextField
            size="small"
            type="number"
            value={retentionDays}
            onChange={handleInputChange}
            disabled={retentionChange.isPending || retentionSetting.isLoading}
            error={!!error}
            helperText={error}
            sx={{ width: "120px" }}
            label="Days"
            slotProps={{
              htmlInput: { min: 7, max: 365 }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={retentionChange.isPending || retentionSetting.isLoading || !!error}
            onClick={handleRetentionChange}
            sx={{ mt: 0.5 }}
          >
            Save
          </Button>
        </Box>
      }
    >
      <Typography variant="body2">
        {description} Minimum retention is 7 days, maximum is 365 days, default is {defaultDays} days.
      </Typography>
      <CippApiResults apiObject={retentionChange} />
    </CippButtonCard>
  );
};

export default CippLogRetentionSettings;
