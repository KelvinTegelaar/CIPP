import React, { useState } from "react";
import {
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
} from "@mui/material";
import PropTypes from "prop-types";
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

const Results = ({ items = [] }) => (
  <List>
    {items.map((item, key) => (
      <ResultsRow key={key} match={item} />
    ))}
  </List>
);

const ResultsRow = ({ match }) => (
  <ListItem style={{ cursor: "pointer" }}>
    <ListItemText
      primary={match.displayName}
      secondary={
        <>
          <Typography variant="body2">{match.userPrincipalName}</Typography>
          <Typography variant="caption">Found in tenant {match._tenantId}</Typography>
        </>
      }
    />
  </ListItem>
);
