import { useCallback } from "react";
import NextLink from "next/link";
import PropTypes from "prop-types";
import Bars3Icon from "@heroicons/react/24/outline/Bars3Icon";
import MoonIcon from "@heroicons/react/24/outline/MoonIcon";
import SunIcon from "@heroicons/react/24/outline/SunIcon";
import { Box, Divider, IconButton, Stack, SvgIcon, useMediaQuery } from "@mui/material";
import { Logo } from "../components/logo";
import { useSettings } from "../hooks/use-settings";
import { paths } from "../paths";
import { AccountPopover } from "./account-popover";
import { CippTenantSelector } from "../components/CippComponents/CippTenantSelector";
import { NotificationsPopover } from "./notifications-popover";
const TOP_NAV_HEIGHT = 64;

export const TopNav = (props) => {
  const { onNavOpen } = props;
  const settings = useSettings();
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const handleThemeSwitch = useCallback(() => {
    const themeName = settings.currentTheme?.value === "light" ? "dark" : "light";
    settings.handleUpdate({
      currentTheme: { value: themeName, label: themeName },
    });
  }, [settings]);

  return (
    <Box
      component="header"
      sx={{
        backgroundColor: "neutral.900",
        color: "common.white",
        position: "fixed",
        width: "100%",
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{
          minHeight: TOP_NAV_HEIGHT,
          px: 3,
        }}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing={3}
          divider={
            <Divider
              orientation="vertical"
              sx={{
                borderColor: "neutral.500",
                height: 36,
              }}
            />
          }
        >
          <Box
            component={NextLink}
            href={paths.index}
            sx={{
              display: "inline-flex",
              height: 24,
              width: 24,
            }}
          >
            <Logo />
          </Box>
          {!mdDown && <CippTenantSelector refreshButton={true} tenantButton={true} />}
          {mdDown && (
            <IconButton color="inherit" onClick={onNavOpen}>
              <SvgIcon color="action" fontSize="small">
                <Bars3Icon />
              </SvgIcon>
            </IconButton>
          )}
        </Stack>
        <Stack alignItems="center" direction="row" spacing={2}>
          {!mdDown && (
            <IconButton color="inherit" onClick={handleThemeSwitch}>
              <SvgIcon color="action" fontSize="small">
                {settings?.currentTheme?.value === "dark" ? <SunIcon /> : <MoonIcon />}
              </SvgIcon>
            </IconButton>
          )}
          <NotificationsPopover />
          <AccountPopover
            onThemeSwitch={handleThemeSwitch}
            paletteMode={settings.currentTheme?.value === "light" ? "dark" : "light"}
          />
        </Stack>
      </Stack>
    </Box>
  );
};

TopNav.propTypes = {
  onNavOpen: PropTypes.func,
  openNav: PropTypes.bool,
};
