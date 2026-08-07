import { useCallback, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useDispatch } from "react-redux";
import axios from "axios";
import { buildVersionedHeaders } from "../../utils/cippVersion";
import { showToast } from "../../store/toasts";
import { getCippError } from "../../utils/get-cipp-error";
import { ConfirmationDialog } from "../confirmation-dialog";
import { CippApiDialog } from "./CippApiDialog";
import { useDialog } from "../../hooks/use-dialog";
import { ADD_CLIENT_SECRET_FIELDS } from "./AppRegistrationActions.jsx";

const credentialPrimaryLabel = (cred, credentialType) => {
  if (credentialType === "password") {
    const name = cred.displayName || cred.hint || "Secret";
    return cred.endDateTime
      ? `${name} (expires ${new Date(cred.endDateTime).toLocaleString()})`
      : name;
  }
  const name =
    cred.displayName || cred.customKeyIdentifier || cred.subject || "Certificate";
  return cred.endDateTime
    ? `${name} (expires ${new Date(cred.endDateTime).toLocaleString()})`
    : name;
};

export const CippCredentialExpandList = ({
  credentials = [],
  credentialType,
  appType,
  graphObjectId,
  tenantFilter,
  canRemove,
  onRemoved,
  canAdd = false,
  onAdded,
}) => {
  const dispatch = useDispatch();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuCred, setMenuCred] = useState(null);
  const [pendingKeyId, setPendingKeyId] = useState(null);
  const [removalConfirmOpen, setRemovalConfirmOpen] = useState(false);
  const [credPendingRemoval, setCredPendingRemoval] = useState(null);
  const [removalSubmitting, setRemovalSubmitting] = useState(false);
  const addDialog = useDialog();
  const rotateDialog = useDialog();
  const [rotateCred, setRotateCred] = useState(null);

  const canAddSecret = canAdd && credentialType === "password";
  const canRotate = canRemove && credentialType === "password";

  const closeMenu = useCallback(() => {
    setMenuAnchor(null);
    setMenuCred(null);
  }, []);

  const removalMessage =
    credentialType === "password"
      ? "Remove this client secret? Applications using it will stop authenticating."
      : "Remove this certificate credential?";

  const executeRemove = useCallback(
    async (cred) => {
      if (!cred?.keyId || !graphObjectId || !tenantFilter) {
        return;
      }
      const keyId = cred.keyId;
      setPendingKeyId(keyId);
      try {
        const response = await axios.post(
          "/api/ExecManageAppCredentials",
          {
            tenantFilter,
            Action: "Remove",
            AppType: appType,
            CredentialType: credentialType,
            KeyId: keyId,
            Id: graphObjectId,
          },
          { headers: await buildVersionedHeaders() },
        );
        const result = response.data?.Results;
        const msg = result?.resultText || "Credential removed.";
        const isError = result?.state === "error";
        dispatch(
          showToast({
            title: isError ? "Error" : "Success",
            message: msg,
            toastError: isError ? new Error(msg) : undefined,
          }),
        );
        if (!isError && typeof onRemoved === "function") {
          onRemoved();
        }
      } catch (e) {
        dispatch(
          showToast({
            title: "Error",
            message: getCippError(e),
            toastError: e,
          }),
        );
      } finally {
        setPendingKeyId(null);
      }
    },
    [graphObjectId, tenantFilter, credentialType, appType, dispatch, onRemoved],
  );

  const openRemovalConfirm = useCallback(() => {
    if (!menuCred) {
      return;
    }
    const c = menuCred;
    closeMenu();
    setCredPendingRemoval(c);
    setRemovalConfirmOpen(true);
  }, [menuCred, closeMenu]);

  const handleConfirmRemoval = useCallback(async () => {
    const cred = credPendingRemoval;
    if (!cred) {
      return;
    }
    setRemovalSubmitting(true);
    try {
      await executeRemove(cred);
      setRemovalConfirmOpen(false);
      setCredPendingRemoval(null);
    } finally {
      setRemovalSubmitting(false);
    }
  }, [credPendingRemoval, executeRemove]);

  const handleCancelRemoval = useCallback(() => {
    if (removalSubmitting) {
      return;
    }
    setRemovalConfirmOpen(false);
    setCredPendingRemoval(null);
  }, [removalSubmitting]);

  const openRotate = useCallback(() => {
    if (!menuCred) {
      return;
    }
    setRotateCred(menuCred);
    closeMenu();
    rotateDialog.handleOpen();
  }, [menuCred, closeMenu, rotateDialog]);

  const addSecretButton = canAddSecret ? (
    <Box sx={{ px: 1, pb: 1 }}>
      <Button size="small" startIcon={<AddIcon />} onClick={() => addDialog.handleOpen()}>
        Add secret
      </Button>
    </Box>
  ) : null;

  const addSecretDialog = canAddSecret ? (
    <CippApiDialog
      createDialog={addDialog}
      title="Add client secret"
      allowResubmit={true}
      dialogAfterEffect={() => {
        if (typeof onAdded === "function") {
          onAdded();
        }
      }}
      row={{ id: graphObjectId, Tenant: tenantFilter }}
      fields={ADD_CLIENT_SECRET_FIELDS}
      api={{
        type: "POST",
        url: "/api/ExecManageAppCredentials",
        data: {
          Id: "id",
          AppType: `!${appType}`,
          Action: "!Add",
          CredentialType: "!password",
        },
      }}
    />
  ) : null;

  const rotateSecretDialog = canRotate ? (
    <CippApiDialog
      createDialog={rotateDialog}
      title="Rotate client secret"
      allowResubmit={true}
      dialogAfterEffect={() => {
        if (typeof onAdded === "function") {
          onAdded();
        } else if (typeof onRemoved === "function") {
          onRemoved();
        }
      }}
      row={{ id: graphObjectId, Tenant: tenantFilter, keyId: rotateCred?.keyId }}
      api={{
        type: "POST",
        url: "/api/ExecManageAppCredentials",
        data: {
          Id: "id",
          AppType: `!${appType}`,
          Action: "!Rotate",
          CredentialType: "!password",
          KeyId: "keyId",
        },
      }}
      confirmText="Rotate this client secret? A new secret with the same name is created and the current one is deleted immediately - anything still using the old secret will stop working until updated with the new value."
    />
  ) : null;

  if (!credentials.length) {
    return (
      <Box sx={{ py: 2, px: 3 }}>
        {addSecretButton}
        <Typography variant="body2" color="text.secondary">
          No {credentialType === "password" ? "secrets" : "certificates"} configured.
        </Typography>
        {addSecretDialog}
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, pb: 2 }}>
      {addSecretButton}
      <List dense disablePadding>
        {credentials.map((cred, idx) => {
          const keyId = cred.keyId;
          const busy = pendingKeyId === keyId;
          return (
            <ListItem
              key={keyId || idx}
              divider={idx < credentials.length - 1}
              secondaryAction={
                canRemove && keyId ? (
                  <IconButton
                    edge="end"
                    aria-label="credential actions"
                    disabled={busy}
                    onClick={(e) => {
                      setMenuAnchor(e.currentTarget);
                      setMenuCred(cred);
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                ) : null
              }
            >
              <ListItemText
                primary={credentialPrimaryLabel(cred, credentialType)}
                secondary={keyId ? `keyId: ${keyId}` : undefined}
                primaryTypographyProps={{ variant: "body2" }}
                secondaryTypographyProps={{ variant: "caption" }}
              />
            </ListItem>
          );
        })}
      </List>
      {canRemove && (
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
          {canRotate && (
            <MenuItem onClick={openRotate} disabled={Boolean(pendingKeyId)}>
              Rotate
            </MenuItem>
          )}
          <MenuItem
            onClick={openRemovalConfirm}
            disabled={Boolean(pendingKeyId)}
            sx={{ color: "error.main" }}
          >
            Remove
          </MenuItem>
        </Menu>
      )}
      <ConfirmationDialog
        open={removalConfirmOpen}
        title={credentialType === "password" ? "Remove client secret" : "Remove certificate"}
        message={removalMessage}
        variant="warning"
        confirmLoading={removalSubmitting}
        onCancel={handleCancelRemoval}
        onConfirm={handleConfirmRemoval}
      />
      {addSecretDialog}
      {rotateSecretDialog}
    </Box>
  );
};

CippCredentialExpandList.propTypes = {
  credentials: PropTypes.array,
  credentialType: PropTypes.oneOf(["password", "key"]).isRequired,
  appType: PropTypes.oneOf(["applications", "servicePrincipals"]).isRequired,
  graphObjectId: PropTypes.string,
  tenantFilter: PropTypes.string,
  canRemove: PropTypes.bool,
  onRemoved: PropTypes.func,
  canAdd: PropTypes.bool,
  onAdded: PropTypes.func,
};
