import React, { useState } from "react";
import { Box, Link } from "@mui/material";

export const CollapsibleChipList = ({ children, maxItems = 4 }) => {
  const [expanded, setExpanded] = useState(false);
  const childArray = React.Children.toArray(children);
  const hasMoreItems = childArray.length > maxItems;

  const toggleExpanded = (e) => {
    e.preventDefault();
    setExpanded(!expanded);
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
      {expanded ? childArray : childArray.slice(0, maxItems)}

      {hasMoreItems && (
        <Link
          href="#"
          onClick={toggleExpanded}
          sx={{ ml: 0.5, fontSize: "0.8rem", whiteSpace: "nowrap" }}
        >
          {expanded ? "Show less" : `+${childArray.length - maxItems} more`}
        </Link>
      )}
    </Box>
  );
};
