import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Stack } from "@mui/system";
import { CippDataTable } from "../CippTable/CippDataTable";

export const CippTableDialog = (props) => {
  const { createDialog, title, fields, api, simpleColumns, ...other } = props;

  return (
    <Dialog fullWidth maxWidth="lg" onClose={createDialog.handleClose} open={createDialog.open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <CippDataTable
            {...other}
            title={title}
            data={other.data}
            simpleColumns={simpleColumns}
            simple={false}
            isInDialog={true} // Flag to indicate table is inside a dialog
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={createDialog.handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
