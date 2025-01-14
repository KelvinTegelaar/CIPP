import React from "react";
import { Box, Typography } from "@mui/material";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { CippPropertyListCard } from "../CippCards/CippPropertyListCard";

const ConnectorTemplateDetails = ({ data }) => {
  const properties = Object.keys(data);

  return (
    <Box>
      <Typography variant="h6">Connector Template Details</Typography>
      <CippPropertyListCard
        propertyItems={properties.map((prop) => {
          return { label: getCippTranslation(prop), value: data[prop] };
        })}
        isFetching={false}
      />
    </Box>
  );
};

export default ConnectorTemplateDetails;
