import { createContext, useContext } from "react";

/**
 * When CippWizardPage is used in dialogMode, it provides this context with a
 * reference to the DialogActions DOM node. CippWizardStepButtons checks for
 * it and portals its navigation buttons there, keeping the main content area
 * clean while anchoring controls at the bottom of the dialog.
 */
export const CippWizardDialogContext = createContext(null);
export const useCippWizardDialog = () => useContext(CippWizardDialogContext);
