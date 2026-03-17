import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  SvgIcon,
  useMediaQuery,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { CippWizard } from "./CippWizard";
import { useRouter } from "next/router";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { CippHead } from "../CippComponents/CippHead";
import { CippWizardDialogContext } from "./CippWizardDialogContext";
import { useState, useCallback } from "react";

const CippWizardPage = (props) => {
  const router = useRouter();
  const {
    postUrl,
    initialState,
    steps,
    wizardTitle,
    backButton = true,
    wizardOrientation = "horizontal",
    maxWidth = "xl",
    dialogMode = false,
    open = false,
    onClose,
    dialogIcon,
    relatedQueryKeys,
    ...other
  } = props;

  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [actionsEl, setActionsEl] = useState(null);
  const actionsRef = useCallback((el) => setActionsEl(el), []);

  const wizardNode = (
    <CippWizard
      postUrl={postUrl}
      initialState={initialState}
      orientation={wizardOrientation}
      steps={steps}
    />
  );

  if (dialogMode) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="xl"
        fullScreen={mdDown}
        PaperProps={{
          sx: {
            display: "flex",
            flexDirection: "column",
            ...(!mdDown && { height: "90vh" }),
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, p: 2 }}>
          {dialogIcon}
          {wizardTitle}
          <IconButton aria-label="close" onClick={onClose} sx={{ ml: "auto" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ flex: 1, overflow: "auto", p: 2 }}>
          <CippWizardDialogContext.Provider value={{ actionsEl, relatedQueryKeys, onClose }}>
            {wizardNode}
          </CippWizardDialogContext.Provider>
        </DialogContent>
        <Divider />
        <DialogActions ref={actionsRef} sx={{ px: 3, py: 2 }} />
      </Dialog>
    );
  }

  return (
    <>
      <CippHead title={wizardTitle} />
      <Box
        sx={{
          backgroundColor: "background.default",
          flexGrow: 1,
          pb: 4,
        }}
      >
        <Container maxWidth={maxWidth}>
          <Stack spacing={6}>
            <Stack spacing={5}>
              <Stack spacing={1}>
                <CippWizardDialogContext.Provider value={{ actionsEl: null, relatedQueryKeys }}>
                  {wizardNode}
                </CippWizardDialogContext.Provider>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};
export default CippWizardPage;
