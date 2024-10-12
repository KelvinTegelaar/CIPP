import React from "react";
import { Card, CardHeader, CardContent, CardActions, Skeleton, Divider } from "@mui/material";
import { ActionsMenu } from "../actions-menu";

export default function CippButtonCard({
  title,
  CardButton,
  children,
  isFetching = false,
  cardSx,
  cardActions,
}) {
  return (
    <Card sx={cardSx}>
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
