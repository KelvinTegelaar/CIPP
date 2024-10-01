import React from "react";
import { Card, CardHeader, CardContent, CardActions, Skeleton, Box } from "@mui/material";

export default function CippButtonCard({ title, CardButton, children, isFetching = false }) {
  return (
    <Box
      sx={{
        py: 4,
      }}
    >
      <Card>
        <CardHeader title={title} />
        <CardContent>{isFetching ? <Skeleton /> : children}</CardContent>
        {CardButton && <CardActions>{CardButton}</CardActions>}
      </Card>
    </Box>
  );
}
