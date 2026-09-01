import PropTypes from "prop-types";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import { Box, Button, SvgIcon, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTheme } from "@emotion/react";

const ResourceUnavailableRoot = styled("div")(({ theme }) => ({
  alignItems: "center",
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.neutral[900] : theme.palette.neutral[50],
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(3),
}));

export const ResourceUnavailable = (props) => {
  const { message = "", onCreate, createButtonText, sx, type, target } = props;
  const theme = useTheme();

  return (
    <ResourceUnavailableRoot sx={sx}>
      <Box
        sx={{
          "& img": {
            maxWidth: "100%",
          },
        }}
      >
        <img
          src="/assets/illustration-not-found.svg"
          //if dark mode convert colour.
          style={{ filter: theme.palette.mode === "dark" ? "invert(1)" : "none" }}
        />
      </Box>
      {message && (
        <Typography color="text.secondary" sx={{ mt: 2 }} variant="body2">
          {message}
        </Typography>
      )}
      {onCreate && (
        <Button
          href={type === "link" ? target : null}
          onClick={onCreate}
          startIcon={
            <SvgIcon fontSize="small">
              <PlusIcon />
            </SvgIcon>
          }
          sx={{ mt: 2 }}
          variant="contained"
        >
          {createButtonText || "Create"}
        </Button>
      )}
    </ResourceUnavailableRoot>
  );
};

ResourceUnavailable.propTypes = {
  message: PropTypes.string,
  onCreate: PropTypes.func,
  sx: PropTypes.object,
};
