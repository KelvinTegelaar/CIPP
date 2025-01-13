import React, { useState } from "react";
import {
  TextField,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Button,
  Link,
} from "@mui/material";
import { ApiGetCall } from "../../api/ApiCall";

export const CippUniversalSearch = React.forwardRef(
  ({ onConfirm = () => {}, onChange = () => {}, maxResults = 7, value = "" }, ref) => {
    const [searchValue, setSearchValue] = useState(value);
    const handleChange = (event) => {
      const newValue = event.target.value;
      setSearchValue(newValue);
      onChange(newValue);
    };

    const search = ApiGetCall({
      url: `/api/ExecUniversalSearch?name=${searchValue}`,
      queryKey: `search-${searchValue}`,
      waiting: false,
    });
    const handleKeyDown = async (event) => {
      if (event.key === "Enter") {
        search.refetch();
      }
    };

    return (
      <Card>
        <CardHeader title="Universal Search" />
        <CardContent>
          <Box>
            <TextField
              ref={ref}
              fullWidth
              type="text"
              label="Search users in any tenant by UPN or Display Name. Requires Lighthouse onboarding"
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
              search.isSuccess && "No results found."
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }
);

CippUniversalSearch.displayName = "CippUniversalSearch";

const Results = ({ items = [], searchValue }) => (
  <Grid container spacing={2} mt={2}>
    {items.slice(0, 9).map((item, key) => (
      <Grid item xs={12} sm={6} md={4} key={key}>
        <ResultsRow match={item} searchValue={searchValue} />
      </Grid>
    ))}
  </Grid>
);

const ResultsRow = ({ match, searchValue }) => {
  const highlightMatch = (text) => {
    const parts = text?.split(new RegExp(`(${searchValue})`, "gi"));
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
  const currentTenantInfo = ApiGetCall({
    url: "/api/ListTenants",
    queryKey: `ListTenants`,
  });
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6">{highlightMatch(match.displayName)}</Typography>
        <Typography variant="body2" color="textSecondary">
          {highlightMatch(match.userPrincipalName)}
        </Typography>
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          Found in tenant{" "}
          {
            //translate match._tenantId to tenant name by finding it in currentTenantInfo, if its not there, show the ID. the prop we are matching on is customerId, the return is displayName (defaultDomainName)
            currentTenantInfo.data?.find((tenant) => tenant.customerId === match._tenantId)
              ?.defaultDomainName || match._tenantId
          }
          <Box ml={2} display="inline-flex" gap={1}>
            <Button
              component={Link}
              href={`identity/administration/users/user?tenantFilter=${
                currentTenantInfo.data?.find((tenant) => tenant.customerId === match._tenantId)
                  ?.defaultDomainName || match._tenantId
              }&userId=${match.userPrincipalName}`}
              variant="outlined"
              color="primary"
              size="small"
            >
              View User
            </Button>
            <Button
              component={Link}
              href={`identity/administration/users?tenantFilter=${
                currentTenantInfo.data?.find((tenant) => tenant.customerId === match._tenantId)
                  ?.defaultDomainName || match._tenantId
              }`}
              variant="outlined"
              color="primary"
              size="small"
            >
              View Tenant
            </Button>
          </Box>
        </Typography>
      </CardContent>
    </Card>
  );
};
