import { Button, SvgIcon, Typography } from "@mui/material";
import CippButtonCard from "/src/components/CippCards/CippButtonCard";
import { ApiPostCall } from "/src/api/ApiCall";
import { useDialog } from "/src/hooks/use-dialog";
import { SettingsBackupRestore } from "@mui/icons-material";
import Link from "next/link";

const CippBackupSettings = () => {
  const createDialog = useDialog();
  const backupAction = ApiPostCall({
    datafromUrl: true,
  });

  const BackupButtons = () => {
    return (
      <>
        <Button
          variant="contained"
          size="small"
          component={Link}
          disabled={backupAction.isPending}
          href="/cipp/settings/backup"
        >
          <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
            <SettingsBackupRestore />
          </SvgIcon>
          Manage Backups
        </Button>
      </>
    );
  };

  return (
    <>
      <CippButtonCard title="Backup" cardSx={{ height: "100%" }} CardButton={<BackupButtons />}>
        <Typography variant="body2">
          Use this button to backup the system configuration for CIPP. This will not include
          authentication information or extension configuration. You can also set an automated daily
          backup schedule by clicking the button below. This will create a scheduled task for you.s
        </Typography>
      </CippButtonCard>
    </>
  );
};

export default CippBackupSettings;
