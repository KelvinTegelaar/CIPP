import { useState, useEffect, useMemo } from "react";
import { Typography, Box, Button, TextField, Chip, Stack } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useWatch } from "react-hook-form";
import { CippFormDomainSelector } from "./CippFormDomainSelector";

const CippAliasDialog = ({ formHook }) => {
  const [aliasPrefix, setAliasPrefix] = useState("");

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

  const selectedDomain = useWatch({
    control: formHook.control,
    name: "AliasDomain",
  });

  const isPending = formHook.formState.isSubmitting;

  const selectedDomainValue = useMemo(() => {
    if (!selectedDomain) return "";
    if (Array.isArray(selectedDomain)) {
      return selectedDomain[0]?.value || selectedDomain[0] || "";
    }
    if (typeof selectedDomain === "object") {
      return selectedDomain?.value || "";
    }
    return selectedDomain;
  }, [selectedDomain]);

  const handleAddAlias = () => {
    const prefix = aliasPrefix.trim();
    const domain = selectedDomainValue;

    if (!prefix || !domain) {
      return;
    }

    const formattedAlias = `${prefix}@${domain}`;
    const currentAliases = formHook.getValues("AddedAliases") || [];

    if (currentAliases.some((alias) => alias.toLowerCase() === formattedAlias.toLowerCase())) {
      setAliasPrefix("");
      return;
    }

    const newList = [...currentAliases, formattedAlias];
    formHook.setValue("AddedAliases", newList, { shouldValidate: true });
    setAliasPrefix("");
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
          Add proxy addresses (aliases) for this user. Enter a prefix, choose a verified tenant
          domain, and click Add or press Enter.
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: { xs: "wrap", sm: "nowrap" },
            alignItems: "flex-start",
          }}
        >
          <TextField
            fullWidth
            value={aliasPrefix}
            onChange={(e) => setAliasPrefix(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter alias prefix"
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
          <Box sx={{ minWidth: { xs: "100%", sm: 240 } }}>
            <CippFormDomainSelector
              formControl={formHook}
              name="AliasDomain"
              label="Domain"
              multiple={false}
              size="small"
              preselectDefaultDomain
            />
          </Box>
          <Button
            onClick={handleAddAlias}
            variant="contained"
            disabled={!aliasPrefix.trim() || !selectedDomainValue || isPending}
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
