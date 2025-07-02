import { useState, useEffect } from "react";
import { Typography, Box, Button, TextField, Chip, Stack } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useWatch } from "react-hook-form";

const CippAliasDialog = ({ formHook }) => {
  const [newAlias, setNewAlias] = useState("");

  // Initialize the form field if it doesn't exist
  useEffect(() => {
    // Set default empty array if AddedAliases doesn't exist in the form
    if (!formHook.getValues("AddedAliases")) {
      formHook.setValue("AddedAliases", []);
    }
  }, [formHook]);

  // Use useWatch to subscribe to form field changes
  const aliasList = useWatch({
    control: formHook.control,
    name: "AddedAliases",
    defaultValue: [],
  });

  const isPending = formHook.formState.isSubmitting;

  const handleAddAlias = () => {
    if (newAlias.trim()) {
      const currentAliases = formHook.getValues("AddedAliases") || [];
      const newList = [...currentAliases, newAlias.trim()];
      formHook.setValue("AddedAliases", newList, { shouldValidate: true });
      setNewAlias("");
    }
  };

  const handleDeleteAlias = (aliasToDelete) => {
    const currentAliases = formHook.getValues("AddedAliases") || [];
    const updatedList = currentAliases.filter((alias) => alias !== aliasToDelete);
    formHook.setValue("AddedAliases", updatedList, { shouldValidate: true });
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddAlias();
    }
  };

  return (
    <>
      <Stack spacing={3} sx={{ mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Add proxy addresses (aliases) for this user. Enter each alias and click Add or press
          Enter.
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            value={newAlias}
            onChange={(e) => setNewAlias(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter an alias"
            variant="outlined"
            disabled={isPending}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                fontFamily: "monospace",
                "& .MuiOutlinedInput-input": {
                  px: 2,
                },
              },
            }}
          />
          <Button
            onClick={handleAddAlias}
            variant="contained"
            disabled={!newAlias.trim() || isPending}
            startIcon={<Add />}
            size="small"
          >
            Add
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            minHeight: "40px",
            p: 1,
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {aliasList.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                px: 2,
                py: 1,
                textAlign: "center",
                width: "100%",
              }}
            >
              No aliases added yet
            </Typography>
          ) : (
            aliasList.map((alias) => (
              <Chip
                key={alias}
                label={alias}
                onDelete={() => handleDeleteAlias(alias)}
                color="primary"
                variant="outlined"
              />
            ))
          )}
        </Box>
      </Stack>
    </>
  );
};

export default CippAliasDialog;
