import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import ArrowLeftIcon from "@heroicons/react/24/outline/ArrowLeftIcon";
import {
  Box,
  Button,
  Container,
  Divider,
  Skeleton,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { ActionsMenu } from "/src/components/actions-menu";
import { useMediaQuery } from "@mui/material";

export const HeaderedTabbedLayout = (props) => {
  const {
    children,
    tabOptions,
    title,
    subtitle,
    actions,
    actionsData,
    isFetching = false,
    backUrl,
  } = props;

  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const router = useRouter();
  const pathname = usePathname();
  const queryParams = router.query;
  const handleTabsChange = useCallback(
    (event, value) => {
      //if we have query params, we need to append them to the new path
      router.push(
        {
          pathname: value,
          query: queryParams,
        },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  const currentTab = tabOptions.find((option) => option.path === pathname);

  return (
    <Box
      sx={{
        flexGrow: 1,
        pb: 4,
      }}
    >
      <Container maxWidth="xl" sx={{ height: "100%" }}>
        <Stack spacing={1} sx={{ height: "100%" }}>
          <Stack spacing={2}>
            <Stack
              alignItems="flex-start"
              direction="row"
              justifyContent="space-between"
              spacing={1}
            >
              <Stack spacing={1}>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={1}
                  justifyContent="space-between"
                >
                  <Typography variant={mdDown ? "h6" : "h4"}>{title}</Typography>
                </Stack>
                {isFetching ? (
                  <Skeleton variant="text" width={200} />
                ) : (
                  subtitle && (
                    <Stack alignItems="center" flexWrap="wrap" direction="row" spacing={2}>
                      {subtitle.map((item, index) =>
                        item.component ? (
                          <Box key={index}>{item.component}</Box>
                        ) : (
                          <Stack key={index} alignItems="center" direction="row" spacing={1}>
                            <SvgIcon fontSize="small">{item.icon}</SvgIcon>
                            <Typography color="text.secondary" variant="body2">
                              {item.text}
                            </Typography>
                          </Stack>
                        )
                      )}
                    </Stack>
                  )
                )}
              </Stack>
              {actions && actions.length > 0 && (
                <ActionsMenu actions={actions} data={actionsData} disabled={isFetching} />
              )}
            </Stack>
            <div>
              <Tabs onChange={handleTabsChange} value={currentTab?.path} variant="scrollable">
                {tabOptions.map((option) => (
                  <Tab key={option.path} label={option.label} value={option.path} />
                ))}
              </Tabs>
              <Divider />
            </div>
          </Stack>
          <Box
            sx={
              !mdDown && {
                flexGrow: 1,
                overflow: "auto",
                height: "calc(100vh - 350px)",
              }
            }
          >
            {children}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

HeaderedTabbedLayout.propTypes = {
  children: PropTypes.node,
  tabOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      text: PropTypes.string.isRequired,
    })
  ),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      handler: PropTypes.func.isRequired,
    })
  ),
  isFetching: PropTypes.bool,
};
