import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { Provider as ReduxProvider } from "react-redux";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SettingsConsumer, SettingsProvider } from "../contexts/settings-context";
import { RTL } from "../components/rtl";
import { store } from "../store";
import { createTheme } from "../theme";
import { createEmotionCache } from "../utils/create-emotion-cache";
import "../libs/nprogress";
import { PrivateRoute } from "../components/PrivateRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMediaPredicate } from "react-media-hook";
import Error500 from "./500";
import { ErrorBoundary } from "react-error-boundary";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import CippSpeedDial from "../components/CippComponents/CippSpeedDial";
import {
  Help as HelpIcon,
  BugReport as BugReportIcon,
  Feedback as FeedbackIcon,
  AutoStories,
  Gavel,
  Celebration,
} from "@mui/icons-material";
import { SvgIcon } from "@mui/material";
import discordIcon from "../../public/discord-mark-blue.svg";
import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import("@tanstack/react-query-devtools/build/modern/production.js").then((d) => ({
    default: d.ReactQueryDevtools,
  }))
);
TimeAgo.addDefaultLocale(en);

const queryClient = new QueryClient();
const clientSideEmotionCache = createEmotionCache();
const App = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page) => page);
  const preferredTheme = useMediaPredicate("(prefers-color-scheme: dark)") ? "dark" : "light";
  const pathname = usePathname();
  const route = useRouter();
  const [_0x8h9i, _0x2j3k] = useState(false); // toRemove

  const excludeQueryKeys = ["authmeswa", "alertsDashboard"];

  const _0x4f2d = [1772236800, 1772391599]; // toRemove
  const _0x2e1f = () => {
    // toRemove
    const _0x1a2b = Date.now() / 1000; // toRemove
    return _0x1a2b >= _0x4f2d[0] && _0x1a2b <= _0x4f2d[1]; // toRemove
  };

  // 👇 Persist TanStack Query cache to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const localStoragePersister = createSyncStoragePersister({
        storage: window.localStorage,
      });

      persistQueryClient({
        queryClient,
        persister: localStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        staleTime: 1000 * 60 * 5, // optional: 5 minutes
        buster: "v1",
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const queryIsReadyForPersistence = query.state.status === "success";
            if (queryIsReadyForPersistence) {
              const { queryKey } = query;
              // Check if queryKey exists and has elements before accessing index 0
              if (!queryKey || !queryKey.length) {
                return false;
              }
              const queryKeyString = String(queryKey[0] || "");
              const excludeFromPersisting = excludeQueryKeys.some((key) =>
                queryKeyString.includes(key)
              );
              return !excludeFromPersisting;
            }
            return queryIsReadyForPersistence;
          },
        },
      });
    }
  }, []);

  useEffect(() => {
    // toRemove
    if (_0x8h9i) {
      // toRemove
      const _0x3c4d = Array.from(document.querySelectorAll("*")).filter((_0x5e6f) => {
        // toRemove
        const _0x7g8h = document.querySelector('[aria-label="Navigation SpeedDial"]'); // toRemove
        return !_0x7g8h?.contains(_0x5e6f); // toRemove
      });

      _0x3c4d.forEach((_0x9i0j, _0x1k2l) => {
        // toRemove
        const _0x3m4n = Math.random() * 10 - 5; // toRemove
        const _0x5o6p = Math.random() * 10 - 5; // toRemove
        const _0x7q8r = Math.random() * 10 - 5; // toRemove
        const _0x9s0t = Math.random() * 0.5; // toRemove
        const _0x1u2v = 0.3 + Math.random() * 0.4; // toRemove

        const _0x3w4x = `_${_0x1k2l}`; // toRemove
        const _0x5y6z = document.styleSheets[0]; // toRemove
        _0x5y6z.insertRule(
          ` // toRemove
          @keyframes ${_0x3w4x} { // toRemove
            0% { transform: translate(0, 0) rotate(0deg); } // toRemove
            25% { transform: translate(${_0x3m4n}px, ${_0x5o6p}px) rotate(${_0x7q8r}deg); } // toRemove
            50% { transform: translate(0, 0) rotate(0deg); } // toRemove
            75% { transform: translate(${-_0x3m4n}px, ${_0x5o6p}px) rotate(${-_0x7q8r}deg); } // toRemove
            100% { transform: translate(0, 0) rotate(0deg); } // toRemove
          }
        `,
          _0x5y6z.cssRules.length
        ); // toRemove

        _0x9i0j.style.animation = `${_0x3w4x} ${_0x1u2v}s infinite ${_0x9s0t}s`; // toRemove
      });

      const _0x1a2b = setTimeout(() => {
        // toRemove
        _0x2j3k(false); // toRemove
        _0x3c4d.forEach((_0x5e6f) => {
          // toRemove
          _0x5e6f.style.animation = ""; // toRemove
        });
        const _0x7g8h = document.styleSheets[0]; // toRemove
        while (_0x7g8h.cssRules.length > 0) {
          // toRemove
          _0x7g8h.deleteRule(0); // toRemove
        }
      }, 5000); // toRemove

      return () => {
        // toRemove
        clearTimeout(_0x1a2b); // toRemove
        _0x3c4d.forEach((_0x5e6f) => {
          // toRemove
          _0x5e6f.style.animation = ""; // toRemove
        });
        const _0x7g8h = document.styleSheets[0]; // toRemove
        while (_0x7g8h.cssRules.length > 0) {
          // toRemove
          _0x7g8h.deleteRule(0); // toRemove
        }
      };
    }
  }, [_0x8h9i]); // toRemove

  const speedDialActions = [
    ...(_0x2e1f()
      ? [
          {
            // toRemove
            id: "_", // toRemove
            icon: <Celebration />, // toRemove
            name: String.fromCharCode(
              68,
              111,
              32,
              116,
              104,
              101,
              32,
              72,
              97,
              114,
              108,
              101,
              109,
              32,
              83,
              104,
              97,
              107,
              101,
              33
            ), // toRemove
            onClick: () => _0x2j3k(true), // toRemove
          },
        ]
      : []), // toRemove
    {
      id: "license",
      icon: <Gavel />,
      name: "License",
      href: "/license",
      onClick: () => route.push("/license"),
    },
    {
      id: "bug-report",
      icon: <BugReportIcon />,
      name: "Report Bug",
      href: "https://github.com/KelvinTegelaar/CIPP/issues/new?template=bug.yml",
      onClick: () =>
        window.open("https://github.com/KelvinTegelaar/CIPP/issues/new?template=bug.yml", "_blank"),
    },
    {
      id: "feature-request",
      icon: <FeedbackIcon />,
      name: "Request Feature",
      href: "https://github.com/KelvinTegelaar/CIPP/issues/new?template=feature.yml",
      onClick: () =>
        window.open(
          "https://github.com/KelvinTegelaar/CIPP/issues/new?template=feature.yml",
          "_blank"
        ),
    },
    {
      id: "discord",
      icon: (
        <SvgIcon
          component={discordIcon}
          viewBox="0 0 127.14 96.36"
          sx={{ fontSize: "1.5rem" }}
        ></SvgIcon>
      ),
      name: "Join the Discord!",
      href: "https://discord.gg/cyberdrain",
      onClick: () => window.open("https://discord.gg/cyberdrain", "_blank"),
    },
    {
      id: "documentation",
      icon: <AutoStories />,
      name: "Check the Documentation",
      href: `https://docs.cipp.app/user-documentation${pathname}`,
      onClick: () => window.open(`https://docs.cipp.app/user-documentation${pathname}`, "_blank"),
    },
  ];

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>CIPP</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <SettingsConsumer>
                {(settings) => {
                  if (!settings.isInitialized) {
                  }
                  const theme = createTheme({
                    colorPreset: "orange",
                    direction: settings.direction,
                    paletteMode:
                      settings.currentTheme?.value !== "browser"
                        ? settings.currentTheme?.value
                        : preferredTheme,
                    contrast: "high",
                  });

                  return (
                    <>
                      <ThemeProvider theme={theme}>
                        <RTL direction={settings.direction}>
                          <CssBaseline />
                          <ErrorBoundary FallbackComponent={Error500}>
                            <PrivateRoute>{getLayout(<Component {...pageProps} />)}</PrivateRoute>
                          </ErrorBoundary>
                          <Toaster position="top-center" />
                          <CippSpeedDial
                            actions={speedDialActions}
                            icon={<HelpIcon />}
                            position={{
                              bottom: 12,
                              right:
                                settings.isInitialized && settings?.showDevtools === true ? 60 : 12,
                            }}
                          />
                        </RTL>
                      </ThemeProvider>
                      {settings.isInitialized && settings?.showDevtools === true ? (
                        <React.Suspense fallback={null}>
                          <ReactQueryDevtoolsProduction />
                        </React.Suspense>
                      ) : null}
                    </>
                  );
                }}
              </SettingsConsumer>
            </LocalizationProvider>
          </SettingsProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </CacheProvider>
  );
};

export default App;
