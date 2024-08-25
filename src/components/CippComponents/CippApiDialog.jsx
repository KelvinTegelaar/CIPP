import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Stack } from "@mui/system";
import { CippApiResults } from "./CippAPIResults";

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
            <CippApiResults apiObject={api.apiObject} />
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
