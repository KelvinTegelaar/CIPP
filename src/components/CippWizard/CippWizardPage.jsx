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
  SvgIcon,
} from "@mui/material";
import { CippIcons } from "../../utils/icon-registry";
import { CippWizard } from "./CippWizard";
import { useRouter } from "next/router";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { CippHead } from "../CippComponents/CippHead";
import { CippWizardDialogContext } from "./CippWizardDialogContext";
import { useIsMobileLayout } from "../../hooks/use-breakpoint";
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
    completionButton,
    ...other
  } = props;

  const isMobile = useIsMobileLayout();
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
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: {
              display: "flex",
              flexDirection: "column",
              ...(!isMobile && { height: "90vh" }),
            },
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, p: 2 }}>
          {dialogIcon}
          {wizardTitle}
          <IconButton aria-label="close" onClick={onClose} sx={{ ml: "auto" }}>
            <CippIcons.Close />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ flex: 1, overflow: "auto", p: { xs: 1, md: 2 } }}>
          <CippWizardDialogContext.Provider
            value={{ actionsEl, relatedQueryKeys, onClose, completionButton }}
          >
            {wizardNode}
          </CippWizardDialogContext.Provider>
        </DialogContent>
        <Divider />
        <DialogActions ref={actionsRef} sx={{ px: { xs: 2, md: 3 }, py: 2 }} />
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
          pb: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth={maxWidth}>
          {/* Three nested Stacks used to sit here, each wrapping exactly one child. Stack
              spacing only emits a margin on :not(:first-of-type), so all three were inert
              at every width. */}
          <CippWizardDialogContext.Provider
            value={{ actionsEl: null, relatedQueryKeys, completionButton }}
          >
            {wizardNode}
          </CippWizardDialogContext.Provider>
        </Container>
      </Box>
    </>
  );
};
export default CippWizardPage;
