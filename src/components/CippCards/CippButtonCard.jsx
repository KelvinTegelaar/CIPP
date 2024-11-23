import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Skeleton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function CippButtonCard({
  title,
  CardButton,
  children,
  isFetching = false,
  cardSx,
  cardActions,
  variant,
  component = "card",
  accordionExpanded = false,
}) {
  return (
    <Card variant={variant} sx={cardSx}>
      {component === "card" && (
        <>
          <CardHeader action={cardActions} title={title} />
          <Divider />
          <CardContent style={{ marginBottom: "auto" }}>
            {isFetching ? <Skeleton /> : children}
          </CardContent>
          <Divider />
          {CardButton && <CardActions>{CardButton}</CardActions>}
        </>
      )}
      {component === "accordion" && (
        <Accordion expanded={accordionExpanded}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <CardHeader action={cardActions} title={title} sx={{ pl: 1, py: 0 }} />
          </AccordionSummary>
          <Divider />
          <AccordionDetails sx={{ p: 0 }}>
            <CardContent style={{ marginBottom: "auto" }}>
              {isFetching ? <Skeleton /> : children}
            </CardContent>
            {CardButton && <CardActions>{CardButton}</CardActions>}
          </AccordionDetails>
        </Accordion>
      )}
    </Card>
  );
}
