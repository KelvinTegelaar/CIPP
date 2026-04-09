import { Button, Chip, SvgIcon, Tooltip, Typography } from "@mui/material";
import CippButtonCard from "../CippCards/CippButtonCard";
import { useRouter } from "next/router";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { ApiGetCall } from "../../api/ApiCall";

// Password configuration constants
const PASSWORD_TYPES = {
  CLASSIC: 'Classic',
  PASSPHRASE: 'Passphrase'
};

const DEFAULT_VALUES = {
  CHAR_COUNT: 14,
  WORD_COUNT: 4,
  SPECIAL_CHAR_SET: '$%&*#',
  SEPARATOR: '-'
};

const CippPasswordSettings = () => {
  const router = useRouter();
  const passwordSetting = ApiGetCall({
    url: "/api/ExecPasswordConfig?list=true",
    queryKey: "PasswordSettings",
  });

  // Validate API response structure and handle loading/error states
  const isValidResponse = passwordSetting.data && 
    passwordSetting.data.Results && 
    typeof passwordSetting.data.Results === 'object' &&
    Object.prototype.hasOwnProperty.call(passwordSetting.data.Results, 'passwordType');

  const isLoading = passwordSetting.isLoading;
  const hasError = passwordSetting.isError || (!isLoading && !isValidResponse);
  
  // Use defaults when data is not available
  const r = isValidResponse ? passwordSetting.data.Results : null;
  const isClassic = !r || r?.passwordType === PASSWORD_TYPES.CLASSIC;

  const currentLabel = isClassic
    ? `Classic — ${r?.charCount || DEFAULT_VALUES.CHAR_COUNT} characters`
    : `Passphrase — ${r?.wordCount || DEFAULT_VALUES.WORD_COUNT} words`;

  const getErrorMessage = () => {
    if (passwordSetting.isError) {
      return "Network error loading settings. Click Configure to update.";
    }
    if (!isLoading && !isValidResponse) {
      return "Invalid server response. Click Configure to update settings.";
    }
    return "";
  };

  const handleConfigureClick = () => {
    router.push("/cipp/settings/password-config");
  };

  return (
    <CippButtonCard
      title="Password Style"
      cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
      CardButton={
        <Tooltip title="Configure password settings">
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={
              <SvgIcon fontSize="small">
                <Cog6ToothIcon />
              </SvgIcon>
            }
            onClick={handleConfigureClick}
          >
            Configure
          </Button>
        </Tooltip>
      }
    >
      <Typography variant="body2">
        Configure password generation settings including type, length, character sets, and
        passphrase options.
      </Typography>
      <Chip
        label={isLoading ? "Loading..." : currentLabel}
        size="small"
        color={hasError ? "error" : isClassic ? "primary" : "success"}
        variant="outlined"
        sx={{ mt: 1, fontWeight: 600 }}
      />
      {hasError && !isLoading && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {getErrorMessage()}
        </Typography>
      )}
    </CippButtonCard>
  );
};

export default CippPasswordSettings;
