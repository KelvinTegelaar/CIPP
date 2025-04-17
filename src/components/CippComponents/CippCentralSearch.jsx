import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
} from "@mui/material";
import { useRouter } from "next/router";
import { nativeMenuItems } from "/src/layouts/config";

/**
 * Recursively collects only leaf items (those without sub-items).
 * If an item has an `items` array, we skip that item itself (treat it as a "folder")
 * and continue flattening deeper.
 */
function getLeafItems(items = []) {
  let result = [];

  for (const item of items) {
    if (item.items && Array.isArray(item.items) && item.items.length > 0) {
      // recurse into children
      result = result.concat(getLeafItems(item.items));
    } else {
      // no child items => this is a leaf
      result.push(item);
    }
  }

  return result;
}

export const CippCentralSearch = ({ handleClose, open }) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  // Flatten the menu items once
  const flattenedMenuItems = getLeafItems(nativeMenuItems);

  const handleChange = (event) => {
    setSearchValue(event.target.value);
  };

  // Optionally handle Enter key
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      // do something if needed, e.g., analytics or highlight
    }
  };

  // Filter leaf items by matching title or path
  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredItems = flattenedMenuItems.filter((leaf) => {
    const inTitle = leaf.title?.toLowerCase().includes(normalizedSearch);
    const inPath = leaf.path?.toLowerCase().includes(normalizedSearch);
    // If there's no search value, show no results (you could change this logic)
    return normalizedSearch ? inTitle || inPath : false;
  });

  // Helper to bold‐highlight the matched text
  const highlightMatch = (text = "") => {
    if (!normalizedSearch) return text;
    const parts = text.split(new RegExp(`(${normalizedSearch})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === normalizedSearch ? (
        <Typography component="span" fontWeight="bold" key={i}>
          {part}
        </Typography>
      ) : (
        part
      )
    );
  };

  // Click handler: shallow navigate with Next.js
  const handleCardClick = (path) => {
    router.push(path, undefined, { shallow: true });
    handleClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={handleClose} open={open}>
      <DialogTitle>CIPP Search</DialogTitle>
      <DialogContent />
      <DialogContent>
        <Box>
          <TextField
            fullWidth
            label="Search any menu item or page in CIPP"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={(event) => {
              // Select all text on focus if there's content
              if (event.target.value) {
                event.target.select();
              }
            }}
            value={searchValue}
            autoFocus
          />

          {/* Show results or "No results" */}
          {searchValue.trim().length > 0 ? (
            filteredItems.length > 0 ? (
              <Grid container spacing={2} mt={2}>
                {filteredItems.map((item, index) => (
                  <Grid item xs={12} sm={12} md={12} key={index}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardActionArea
                        onClick={() => handleCardClick(item.path)}
                        aria-label={`Navigate to ${item.title}`}
                      >
                        <CardContent>
                          <Typography variant="h6">{highlightMatch(item.title)}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            Path: {highlightMatch(item.path)}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box mt={2}>No results found.</Box>
            )
          ) : (
            <Box mt={2}>
              <Typography variant="body2">Type something to search by title or path.</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
