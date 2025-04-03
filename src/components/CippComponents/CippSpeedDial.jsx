import React, { useState, useEffect } from "react";
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { CippFormComponent } from "../../components/CippComponents/CippFormComponent";

const CippSpeedDial = ({
  actions = [],
  position = { bottom: 16, right: 16 },
  icon,
  openIcon = <CloseIcon />,
}) => {
  const [openDialogs, setOpenDialogs] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const formControls = actions.reduce((acc, action) => {
    if (action.form) {
      acc[action.id] = useForm({
        mode: "onChange",
        defaultValues: action.form.defaultValues || {},
      });
    }
    return acc;
  }, {});

  const handleSpeedDialClose = () => {
    if (!isHovering) {
      setTimeout(() => {
        setSpeedDialOpen(false);
      }, 200);
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    setSpeedDialOpen(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    handleSpeedDialClose();
  };

  const handleDialogOpen = (actionId) => {
    setOpenDialogs((prev) => ({ ...prev, [actionId]: true }));
  };

  const handleDialogClose = (actionId) => {
    setOpenDialogs((prev) => ({ ...prev, [actionId]: false }));
  };

  const handleSubmit = async (actionId, data) => {
    if (!actions.find((a) => a.id === actionId)?.onSubmit) return;

    setLoading(true);
    try {
      const action = actions.find((a) => a.id === actionId);
      const result = await action.onSubmit(data);

      if (result.success) {
        formControls[actionId]?.reset();
        handleDialogClose(actionId);
      }
      setSnackbarMessage(result.message);
      setShowSnackbar(true);
    } catch (error) {
      console.error(`Error submitting ${actionId}:`, error);
      setSnackbarMessage("An error occurred while submitting");
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (speedDialOpen) {
        const speedDial = document.querySelector('[aria-label="Navigation SpeedDial"]');
        if (speedDial && !speedDial.contains(event.target)) {
          setSpeedDialOpen(false);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [speedDialOpen]);

  return (
    <>
      <SpeedDial
        ariaLabel="Navigation SpeedDial"
        sx={{
          position: "fixed",
          ...position,
          "& .MuiFab-primary": {
            width: 46,
            height: 46,
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          },
        }}
        icon={<SpeedDialIcon icon={icon} openIcon={openIcon} />}
        open={speedDialOpen}
        onClose={handleSpeedDialClose}
        onOpen={() => setSpeedDialOpen(true)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.id}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              if (action.form) {
                handleDialogOpen(action.id);
              } else if (action.onClick) {
                action.onClick();
              }
              setSpeedDialOpen(false);
            }}
            tooltipOpen
            sx={{
              "&.MuiSpeedDialAction-fab": {
                backgroundColor: "background.paper",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              },
              "& .MuiSpeedDialAction-staticTooltipLabel": {
                cursor: "pointer",
                whiteSpace: "nowrap",
                marginRight: "10px",
                padding: "6px 10px",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              },
            }}
          />
        ))}
      </SpeedDial>

      {actions
        .filter((action) => action.form)
        .map((action) => (
          <Dialog
            key={action.id}
            open={openDialogs[action.id] || false}
            onClose={() => handleDialogClose(action.id)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>{action.form.title}</DialogTitle>
            <DialogContent>
              <CippFormComponent
                type="richText"
                name={action.form.fieldName}
                required
                formControl={formControls[action.id]}
                style={{ minHeight: "150px" }}
                editorProps={{
                  attributes: {
                    style: "min-height: 150px; font-size: 1.1rem; padding: 1rem;",
                  },
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleDialogClose(action.id)} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={formControls[action.id]?.handleSubmit((data) =>
                  handleSubmit(action.id, data)
                )}
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? "Submitting..." : action.form.submitText || "Submit"}
              </Button>
            </DialogActions>
          </Dialog>
        ))}

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setShowSnackbar(false)} severity="success" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CippSpeedDial;
