import PropTypes from "prop-types";
import { Box, Container, Stack } from "@mui/material";
import { paths } from "../../paths";

const tabOptions = [
  {
    label: "Overview",
    path: paths.index,
  },
];

export const Layout = (props) => {
  const { children } = props;

  return (
    <Box
      sx={{
        flexGrow: 1,
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={4}>
          <Stack spacing={2}></Stack>
          {children}
        </Stack>
      </Container>
    </Box>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
};
