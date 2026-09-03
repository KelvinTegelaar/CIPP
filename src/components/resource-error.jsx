import PropTypes from "prop-types";
import { CippIcons } from "../utils/icon-registry";
import { Button, SvgIcon, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const ResourceErrorRoot = styled("div")(({ theme }) => ({
  alignItems: "center",
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.neutral[900] : theme.palette.neutral[50],
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(3),
}));

export const ResourceError = (props) => {
  const { message = "Something went wrong, please try again.", onReload, sx } = props;

  return (
    <ResourceErrorRoot sx={sx}>
      <SvgIcon fontSize="large">
        <CippIcons.ExclamationTriangleIcon />
      </SvgIcon>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          mt: 2
        }}>
        {message}
      </Typography>
      {onReload && (
        <Button
          onClick={onReload}
          startIcon={
            <SvgIcon fontSize="small">
              <CippIcons.ArrowPathIcon />
            </SvgIcon>
          }
          sx={{ mt: 2 }}
          variant="text"
        >
          Reload Data
        </Button>
      )}
    </ResourceErrorRoot>
  );
};

ResourceError.propTypes = {
  message: PropTypes.string,
  onReload: PropTypes.func,
  sx: PropTypes.object,
};
