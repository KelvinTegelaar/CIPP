import { useSettings } from "../../hooks/use-settings";
import { Button, Card, CardHeader, Divider, CardContent, SvgIcon } from "@mui/material";
import { CodeBracketIcon, CogIcon } from "@heroicons/react/24/outline";

export const CippDevOptions = () => {
  const settings = useSettings();

  const handleDevToolsToggle = () => {
    settings.handleUpdate({
      showDevtools: !settings.showDevtools,
    });
  };

  return (
    <Card>
      <CardHeader title="Developer Options" />
      <Divider />
      <CardContent>
        <Button
          color="inherit"
          onClick={handleDevToolsToggle}
          startIcon={
            <SvgIcon fontSize="small">
              <CodeBracketIcon />
            </SvgIcon>
          }
        >
          {settings.showDevtools ? "Disable" : "Enable"} TanStack Query Tools
        </Button>
      </CardContent>
    </Card>
  );
};

export default CippDevOptions;
