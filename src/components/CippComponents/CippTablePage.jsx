import { Alert, Card, Divider } from "@mui/material";
import { Box, Container, Stack } from "@mui/system";
import { CippDataTable } from "../CippTable/CippDataTable";
import { useSettings } from "../../hooks/use-settings";
import { useTableViewMode } from "../../hooks/use-breakpoint";
import { CippHead } from "./CippHead";
import { useState, useEffect } from "react";

export const CippTablePage = (props) => {
  const {
    title,
    cardButton,
    noDataButton,
    actions,
    apiUrl,
    apiData,
    apiDataKey,
    columns,
    columnsFromApi,
    name,
    options,
    onChange,
    offCanvas,
    queryKey,
    tableFilter,
    tenantInTitle = true,
    filters,
    initialFilters,
    sx = {},
    ...other
  } = props;
  const tenant = useSettings().currentTenant;
  const viewMode = useTableViewMode({ viewMode: other.viewMode });
  const isCardView = viewMode === "cards";

  // Use initialFilters if provided, otherwise use regular filters
  const activeFilters = initialFilters || filters;

  // Pages without an explicit queryKey have always keyed their query on the title —
  // which embeds the tenant. Card view drops the tenant from the DISPLAY title, so the
  // cache key must keep carrying it explicitly or tenant switches serve stale data.
  const effectiveQueryKey =
    queryKey ?? (tenantInTitle && tenant !== null ? `${title} - ${tenant}` : title);

  const table = (
    <CippDataTable
      queryKey={effectiveQueryKey}
      cardButton={cardButton}
      // Card view drops the tenant suffix: the tenant lives in the top bar there, and
      // the concatenated string wraps to multiple lines at phone widths.
      title={tenantInTitle && tenant !== null && !isCardView ? `${title} - ${tenant}` : title}
      noDataButton={noDataButton}
      actions={actions}
      simple={false}
      api={{
        url: apiUrl,
        data: { tenantFilter: tenant, ...apiData },
        dataKey: apiDataKey,
      }}
      columns={columns}
      columnsFromApi={columnsFromApi}
      offCanvas={offCanvas}
      filters={activeFilters}
      onChange={onChange}
      {...other}
    />
  );

  return (
    <>
      <CippHead title={title} />
      <Box sx={sx}>
        <Container maxWidth={false} sx={{ height: "100%", ...(isCardView && { px: 0.5 }) }}>
          <Stack spacing={isCardView ? 1 : 2} sx={{ height: "100%" }}>
            {tableFilter}
            {tenantInTitle && (!tenant || tenant === null) && (
              <Alert severity="warning">
                No tenant selected. Please select a tenant from the dropdown above.
              </Alert>
            )}
            {isCardView ? (
              // No Card chrome in card view: the cards are the surface, and a Card
              // ancestor's overflow:hidden would break the sticky control row.
              table
            ) : (
              <Card
                sx={{
                  display: "flex",
                }}
              >
                <Divider />

                {table}
              </Card>
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default CippTablePage;
