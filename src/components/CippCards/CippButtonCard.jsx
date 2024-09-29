import React from "react";
import { Card, CardHeader, CardContent, CardActions, Skeleton } from "@mui/material";

export default function CippButtonCard({ title, CardButton, children, isFetching = false }) {
  return (
    <Card sx={{ width: "100%" }}>
      <CardHeader title={title} />
      <CardContent sx={{ padding: "1rem" }}>{isFetching ? <Skeleton /> : children}</CardContent>
      {CardButton && <CardActions>{CardButton}</CardActions>}
    </Card>
  );
}
