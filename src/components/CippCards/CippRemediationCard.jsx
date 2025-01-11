import React from "react";
import { Button, Typography, List, ListItem, SvgIcon } from "@mui/material";
import CippButtonCard from "./CippButtonCard"; // Adjust the import path as needed
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import { useDialog } from "../../hooks/use-dialog";
import { Sync } from "@mui/icons-material";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function CippRemediationCard(props) {
  const { userPrincipalName, isFetching, userId, tenantFilter, restartProcess } = props;
  const createDialog = useDialog();
  return (
    <CippButtonCard
      title={
        <Typography variant="h6">
          Business Email Compromise Overview - {userPrincipalName}
        </Typography>
      }
      cardActions={
        <Button
          variant="outlined"
          size="small"
          onClick={() => restartProcess()}
          disabled={isFetching}
          startIcon={
            <SvgIcon fontSize="small">
              <Sync />
            </SvgIcon>
          }
        >
          Refresh Data
        </Button>
      }
      CardButton={
        <Button
          variant="contained"
          color="primary"
          onClick={() => createDialog.handleOpen()}
          startIcon={
            <SvgIcon fontSize="small">
              <ShieldCheckIcon />
            </SvgIcon>
          }
        >
          Remediate User
        </Button>
      }
      isFetching={isFetching}
    >
      <Typography>
        Use this information as a guide to check if a tenant or e-mail address might have been
        compromised. All data is retrieved from the last 7 days of logs.
      </Typography>

      <Typography color="text.secondary">
        Hit the button below to execute the following tasks:
      </Typography>
      <List>
        <ListItem>Block user sign-in</ListItem>
        <ListItem>Reset user password</ListItem>
        <ListItem>Disconnect all current sessions</ListItem>
        <ListItem>Disable all inbox rules for the user</ListItem>
      </List>
      <CippApiDialog
        title="Remediate User"
        createDialog={createDialog}
        api={{
          url: "/api/execBecRemediate",
          confirmText:
            "This will remediate this user, blocking their signin, resetting their password, disconnecting their sessions, and disabling all their inbox rules. Are you sure you want to continue?",
          type: "POST",
          data: { tenantFilter: tenantFilter, userId: "userId", username: "userPrincipalName" },
          replacementBehaviour: "removeNulls",
        }}
        row={props}
      />
    </CippButtonCard>
  );
}
