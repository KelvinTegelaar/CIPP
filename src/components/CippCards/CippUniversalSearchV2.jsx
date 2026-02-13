import React, { useState } from "react";
import {
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Skeleton,
  Button,
  Link,
} from "@mui/material";
import { Grid } from "@mui/system";
import { ApiGetCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";

export const CippUniversalSearchV2 = React.forwardRef(
  ({ onConfirm = () => {}, onChange = () => {}, maxResults = 10, value = "" }, ref) => {
    const [searchValue, setSearchValue] = useState(value);
    const settings = useSettings();
    const { currentTenant } = settings;

    const handleChange = (event) => {
      const newValue = event.target.value;
      setSearchValue(newValue);
      onChange(newValue);
    };

    const search = ApiGetCall({
      url: `/api/ExecUniversalSearchV2`,
      data: {
        tenantFilter: currentTenant,
        searchTerms: searchValue,
        limit: maxResults,
      },
      queryKey: `searchV2-${currentTenant}-${searchValue}`,
      waiting: false,
    });

    const handleKeyDown = async (event) => {
      if (event.key === "Enter") {
        search.refetch();
      }
    };

    return (
      <Box sx={{ p: 0.5 }}>
        <TextField
          ref={ref}
          fullWidth
          type="text"
          label="Search users by UPN or Display Name..."
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          value={searchValue}
        />

        {search.isFetching && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Skeleton width={"100%"} />
          </Box>
        )}
        {search.isSuccess && search?.data?.length > 0 ? (
          <Results items={search.data} searchValue={searchValue} />
        ) : (
          search.isSuccess && searchValue.length > 0 && "No results found."
        )}
      </Box>
    );
  }
);

CippUniversalSearchV2.displayName = "CippUniversalSearchV2";

const Results = ({ items = [], searchValue }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 9;
  const totalResults = items.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const displayedResults = items.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      <Typography variant="body2" color="textSecondary" mt={2}>
        {totalResults} results (Page {currentPage} of {totalPages})
      </Typography>
      <Grid container spacing={2} mt={2}>
        {displayedResults.map((item, key) => (
          <Grid size={{ md: 4, sm: 6, xs: 12 }} key={key}>
            <ResultsRow match={item} searchValue={searchValue} />
          </Grid>
        ))}
      </Grid>
      {totalPages > 1 && (
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button variant="outlined" disabled={currentPage === 1} onClick={handlePreviousPage}>
            Previous
          </Button>
          <Button
            variant="outlined"
            disabled={currentPage === totalPages}
            onClick={handleNextPage}
          >
            Next
          </Button>
        </Box>
      )}
    </>
  );
};

const ResultsRow = ({ match, searchValue }) => {
  const highlightMatch = (text) => {
    if (!text || !searchValue) return text;
    const escapedSearch = searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text?.split(new RegExp(`(${escapedSearch})`, "gi"));
    return parts?.map((part, index) =>
      part.toLowerCase() === searchValue.toLowerCase() ? (
        <Typography component="span" fontWeight="bold" key={index}>
          {part}
        </Typography>
      ) : (
        part
      )
    );
  };

  const userData = match.Data || {};
  const tenantDomain = match.Tenant || "";

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardActionArea
        component={Link}
        href={`identity/administration/users/user?tenantFilter=${tenantDomain}&userId=${userData.id}`}
        sx={{ height: "100%" }}
      >
        <CardContent>
          <Typography variant="h6">{highlightMatch(userData.displayName || "")}</Typography>
          <Typography variant="body2" color="textSecondary">
            {highlightMatch(userData.userPrincipalName || "")}
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: "block" }}>
            Found in tenant {tenantDomain}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
