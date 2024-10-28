import React from "react";
import { Card, CardHeader, CardContent, CardActions, Skeleton, Divider } from "@mui/material";

export default function CippButtonCard({
  title,
  CardButton,
  children,
  isFetching = false,
  cardSx,
  cardActions,
  variant,
}) {
  return (
    <Card variant={variant} sx={cardSx}>
      <CardHeader action={cardActions} title={title} />
      <Divider />
      <CardContent style={{ marginBottom: "auto" }}>
        {isFetching ? <Skeleton /> : children}
      </CardContent>
      <Divider />
      {CardButton && <CardActions>{CardButton}</CardActions>}
    </Card>
  );
}
