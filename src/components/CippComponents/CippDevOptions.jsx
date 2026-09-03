import { useSettings } from "../../hooks/use-settings";
import { CippIcons } from "../../utils/icon-registry";
import {
  Button,
  Card,
  CardHeader,
  Divider,
  CardContent,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";

export const CippDevOptions = () => {
  const settings = useSettings();

  const handleDevToolsToggle = () => {
    settings.handleUpdate({
      showDevtools: !settings.showDevtools,
    });
  };

  const handleAdvancedToggle = () => {
    settings.handleUpdate({
      showAdvancedTools: !settings.showAdvancedTools,
    });
  };

  return (
    <Card>
      <CardHeader title="Developer Options" />
      <Divider />
      <CardContent>
        <Stack direction="row" spacing={2} useFlexGap sx={{
          flexWrap: "wrap"
        }}>
          <Button
            color="inherit"
            onClick={handleDevToolsToggle}
            startIcon={
              <SvgIcon fontSize="small">
                <CippIcons.CodeBracketIcon />
              </SvgIcon>
            }
          >
            {settings.showDevtools ? "Disable" : "Enable"} TanStack Query Tools
          </Button>
          <Button
            color="inherit"
            onClick={handleAdvancedToggle}
            startIcon={
              <SvgIcon fontSize="small">
                <CippIcons.BeakerIcon />
              </SvgIcon>
            }
          >
            {settings.showAdvancedTools ? "Disable" : "Enable"} Advanced Views
          </Button>
        </Stack>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "block",
            mt: 1
          }}>
          Advanced Views reveal diagnostic pages (such as audit-log Search Coverage) that are hidden
          from day-to-day operations. This preference is per-user, stored in this browser.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CippDevOptions;
