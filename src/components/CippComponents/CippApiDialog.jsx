import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  SvgIcon,
  Tooltip,
} from "@mui/material";
import { Stack } from "@mui/system";
import CopyToClipboard from "react-copy-to-clipboard";
import { CopyAll } from "@mui/icons-material";

export const CippApiDialog = (props) => {
  const { createDialog, title, fields, api, ...other } = props;

  return (
    <Dialog fullWidth maxWidth="sm" onClose={createDialog.handleClose} open={createDialog.open}>
      <form>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>{api.confirmText}</Stack>
        </DialogContent>
        <DialogContent>
          <>
            <Alert severity="success">
              This alert box should only show on success
              <CopyToClipboard text={"hi my text here"}>
                <Tooltip title="Copy to clipboard">
                  <IconButton size="small">
                    <SvgIcon>
                      <CopyAll />
                    </SvgIcon>
                  </IconButton>
                </Tooltip>
              </CopyToClipboard>
            </Alert>
          </>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={createDialog.handleClose}>
            Close
          </Button>
          <Button variant="contained" type="submit">
            Confirm
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
