import React from "react";
import { Card, CardHeader, CardContent, CardActions, Skeleton, Box, Divider } from "@mui/material";

export default function CippButtonCard({
  title,
  CardButton,
  children,
  isFetching = false,
  cardSx,
}) {
  return (
    <Card sx={cardSx}>
      <CardHeader title={title} />
      <Divider />
      <CardContent style={{ marginBottom: "auto" }}>
        {isFetching ? <Skeleton /> : children}
      </CardContent>
      <Divider />
      {CardButton && <CardActions>{CardButton}</CardActions>}
    </Card>
  );
}
