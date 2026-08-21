import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import ArrowLeftIcon from "@heroicons/react/24/outline/ArrowLeftIcon";
import {
  Box,
  Container,
  Divider,
  Skeleton,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { ActionsMenu } from "../components/actions-menu";
import { getIconByName } from "../utils/icon-registry";
import { useIsMobileLayout } from "../hooks/use-breakpoint";
import { useActionsDispatch } from "../hooks/use-actions-dispatch";
import { TabNavigationContext, useTabNavigationValue } from "./tab-navigation-context";
import { CippPageActionsFab } from "../components/CippComponents/CippPageActionsFab";
import { CippTabPicker } from "../components/CippComponents/CippTabPicker";

export const HeaderedTabbedLayout = (props) => {
  const {
    children,
    tabOptions,
    title,
    subtitle,
    actions,
    actionsData,
    // Without this the dispatch falls back to CippApiDialog's hardcoded title, so a header
    // action mutates successfully and never invalidates the page query.
    queryKeys,
    isFetching = false,
    backUrl,
    // Optional replacement for the title Typography — same slot, same truncation duties.
    titleControl,
  } = props;

  // The shared hook rather than an inline useMediaQuery: same threshold, but only this one is
  // mockable, and jsdom has no width-based matchMedia to drive the mobile branch with.
  const isMobile = useIsMobileLayout();
  const router = useRouter();
  const pathname = usePathname();
  const queryParams = router.query;
  const navigateToTab = useCallback(
    (value) => {
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
    [router, queryParams]
  );

  const handleTabsChange = useCallback((event, value) => navigateToTab(value), [navigateToTab]);

  const currentTab = tabOptions.find((option) => option.path === pathname);

  // Below md the tab row scrolls horizontally and still hides tabs off the right edge, so
  // navigation collapses to a picker in the title row — the one part of that row that is
  // empty at this width, since the Actions menu gets clipped here and moves to the FAB.
  const actionsDispatch = useActionsDispatch({ actions, data: actionsData, queryKeys });
  // No isFetching term: the desktop menu's equivalent `disabled` prop is swallowed by
  // ActionsMenu's unspread ...other, so including it here greyed out every action on mobile
  // during a background refetch while desktop left them clickable. Actions operate on
  // stale-but-present data quite happily; aligning down keeps the two surfaces identical
  // without changing desktop.
  const { visibleActions, isDisabled, dispatch } = actionsDispatch;
  const sheetActions = useMemo(
    () =>
      isMobile
        ? visibleActions.map((action) => ({
            label: action.label,
            icon: action.icon ? <SvgIcon fontSize="small">{action.icon}</SvgIcon> : null,
            disabled: isDisabled(action),
            onClick: () => dispatch(action),
          }))
        : [],
    [isMobile, visibleActions, isDisabled, dispatch]
  );

  const tabNavValue = useTabNavigationValue({
    tabs: tabOptions,
    currentPath: pathname,
    onNavigate: navigateToTab,
    actions: sheetActions,
    enabled: isMobile,
    providesGutters: true,
  });

  const subtitleBlock = isFetching ? (
    <Skeleton variant="text" width={200} />
  ) : (
    subtitle && (
      // useFlexGap: Stack's default spacing is a margin-left between children, which every
      // wrapped row inherits — that margin is why the icon/chip pairs sat indented from the
      // title above them. Gap applies to both axes, so the row gap is set separately or the
      // stacked pairs end up as far apart vertically as they are horizontally.
      <Stack
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        direction="row"
        sx={{ columnGap: 2, rowGap: 0.5, minWidth: 0 }}
      >
        {/* minWidth: 0 down the whole chain, and flexShrink: 0 on the icon. A copy-chip
            already carries MUI's ellipsis and maxWidth: 100%, but flex items default to
            min-width: auto, so every ancestor grew to fit instead of letting it truncate —
            which is how a guest UPN (user_domain.onmicrosoft.com#EXT#@tenant...) ran off the
            right edge of the screen. */}
        {subtitle.map((item, index) =>
          item.component ? (
            <Box key={index} sx={{ minWidth: 0, maxWidth: "100%" }}>
              {item.component}
            </Box>
          ) : (
            <Stack
              key={index}
              alignItems="center"
              direction="row"
              spacing={1}
              sx={{ minWidth: 0, maxWidth: "100%" }}
            >
              <SvgIcon fontSize="small" sx={{ flexShrink: 0 }}>
                {item.icon}
              </SvgIcon>
              <Typography
                color="text.secondary"
                variant="body2"
                sx={{ minWidth: 0, "& .MuiChip-root": { maxWidth: "100%" } }}
              >
                {item.text}
              </Typography>
            </Stack>
          )
        )}
      </Stack>
    )
  );

  return (
    <TabNavigationContext.Provider value={tabNavValue}>
      <Box
        sx={{
          flexGrow: 1,
          pb: 4,
        }}
      >
        {/* One gutter for the whole page, matching the layout's breadcrumb rail
            (mx: {xs: 2, md: 3}): the breadcrumbs, this header's text and the left edge of
            every card below it then share a single left edge. */}
        <Container maxWidth="xl" sx={{ height: "100%", px: { xs: 2, md: 3 } }}>
          <Stack spacing={1} sx={{ height: "100%" }}>
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Stack
                  alignItems={isMobile ? "center" : "flex-start"}
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                >
                  {/* minWidth: 0 so a long tenant/entity name truncates in the space the
                      picker leaves rather than pushing it off the right edge of the row.
                      Scoped to the picker's own breakpoint — above md this is unchanged. */}
                  <Stack spacing={1} sx={{ minWidth: { xs: 0, md: "auto" } }}>
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={1}
                      justifyContent="space-between"
                    >
                      {/* A name-shaped skeleton, not the word "Loading...": the header is
                          the entity's identity, and a text placeholder reads as a title.
                          titleControl lets a page swap the text for an interactive control
                          in the same clothes (the View User pages mount a user switcher). */}
                      {isFetching ? (
                        <Typography
                          variant={isMobile ? "h6" : "h4"}
                          noWrap={isMobile}
                          sx={{ minWidth: 0, flex: 1 }}
                        >
                          <Skeleton variant="text" sx={{ maxWidth: 280 }} />
                        </Typography>
                      ) : (
                        titleControl ?? (
                          <Typography variant={isMobile ? "h6" : "h4"} noWrap={isMobile} sx={{ minWidth: 0 }}>
                            {title}
                          </Typography>
                        )
                      )}
                    </Stack>
                    {!isMobile && subtitleBlock}
                  </Stack>
                  {/* The right half of this row is free below md, which is where the tab
                      picker goes. Above md it belongs to the Actions menu, as it always did. */}
                  {isMobile ? (
                    <CippTabPicker variant="compact" />
                  ) : (
                    actions &&
                    actions.length > 0 && (
                      <ActionsMenu actions={actions} data={actionsData} disabled={isFetching} />
                    )
                  )}
                </Stack>
                {/* Below md the subtitle gets the full width instead of sharing the title's
                    row: a UPN copy-chip squeezed beside a half-width picker has nowhere to go
                    and runs off the right edge of the screen. */}
                {isMobile && subtitleBlock}
              </Stack>
              {!isMobile && (
                <div>
                  <Tabs
                    onChange={handleTabsChange}
                    value={currentTab?.path}
                    variant="scrollable"
                    sx={{
                      "& .MuiTab-root:first-of-type": {
                        ml: 2,
                      },
                    }}
                  >
                    {tabOptions.map((option) => {
                      const icon = getIconByName(option.icon, { fontSize: "small" });
                      const iconPosition = option.iconPosition ?? "start";
                      const compactIcon = icon && ["end", "start"].includes(iconPosition);

                      return (
                        <Tab
                          key={option.path}
                          label={option.label}
                          value={option.path}
                          icon={icon ?? undefined}
                          iconPosition={icon ? iconPosition : undefined}
                          sx={compactIcon ? { minHeight: 48, py: 1.5 } : undefined}
                        />
                      );
                    })}
                  </Tabs>
                  <Divider />
                </div>
              )}
            </Stack>
            <Box
              sx={
                !isMobile && {
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
      {/* Not gated on isMobile: crossing the breakpoint with a dialog open — a rotate, or a
          tablet at 900px — would unmount it mid-request, taking CippApiResults with it.
          The hook already renders nothing until an action is dispatched. */}
      {actionsDispatch.dialog}
      {/* Actions only, and only when no page FAB claimed the corner — otherwise they ride in
          that sheet. Tabs are in the title row and never come down here. */}
      {isMobile && sheetActions.length > 0 && !tabNavValue.isActionCornerClaimed && (
        <CippPageActionsFab ariaLabel="Page actions" claimActionCorner={false} />
      )}
    </TabNavigationContext.Provider>
  );
};

HeaderedTabbedLayout.propTypes = {
  children: PropTypes.node,
  tabOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      icon: PropTypes.string,
      iconPosition: PropTypes.oneOf(["bottom", "end", "start", "top"]),
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
