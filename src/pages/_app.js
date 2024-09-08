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
import Toasts from "../components/toaster";
import { PrivateRoute } from "../components/PrivateRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const clientSideEmotionCache = createEmotionCache();

const App = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>CyberDrain User Manager</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <Toasts />
          <SettingsProvider>
            <SettingsConsumer>
              {(settings) => {
                // Prevent theme flicker when restoring custom settings from browser storage
                if (!settings.isInitialized) {
                  // return null;
                }
                const theme = createTheme({
                  colorPreset: "orange",
                  direction: settings.direction,
                  paletteMode: settings.paletteMode,
                  contrast: "high",
                });

                return (
                  <ThemeProvider theme={theme}>
                    <RTL direction={settings.direction}>
                      <CssBaseline />
                      <PrivateRoute>{getLayout(<Component {...pageProps} />)}</PrivateRoute>
                      <Toaster position="top-center" />
                    </RTL>
                  </ThemeProvider>
                );
              }}
            </SettingsConsumer>
          </SettingsProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </CacheProvider>
  );
};

export default App;
