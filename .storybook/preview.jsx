import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { withThemeFromJSXProvider } from '@storybook/addon-themes'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupWorker } from 'msw/browser'
import { mswLoader } from 'msw-storybook-addon/csf3'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
import { createTheme } from '../src/theme'
import { SettingsContext } from '../src/contexts/settings-context'
import { handlers } from '../tests/mocks/handlers'
// require.context polyfill must load in the storybook dev server too, the vitest
// setup files don't run there
import '../tests/mocks/require-context'

const mockSettings = {
  currentTenant: 'testdomain.com',
  currentTheme: { value: 'light', label: 'light' },
  paletteMode: 'light',
  direction: 'ltr',
  pinNav: true,
  showDevtools: false,
  handleUpdate: () => {},
  handleReset: () => {},
  isCustom: false,
}

TimeAgo.addDefaultLocale(en)

const darkTheme = createTheme({
  colorPreset: 'orange',
  direction: 'ltr',
  paletteMode: 'dark',
  contrast: 'high',
})

const lightTheme = createTheme({
  colorPreset: 'orange',
  direction: 'ltr',
  paletteMode: 'light',
  contrast: 'high',
})

const mockStore = configureStore({
  reducer: {
    toasts: (state = { toasts: [] }) => state,
  },
})

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    msw: {
      handlers,
    },
  },
  // custom setup instead of the addon default: 'bypass' silences MSW warnings for
  // unhandled requests (Vite module imports, static assets, unmocked /api routes),
  // 'quiet' suppresses console logging for handled requests
  loaders: [
    mswLoader(async () => {
      const worker = setupWorker()
      await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
      return worker
    }),
  ],
  decorators: [
    withThemeFromJSXProvider({
      themes: {
        light: lightTheme,
        dark: darkTheme,
      },
      defaultTheme: 'light',
      Provider: ThemeProvider,
      GlobalStyles: CssBaseline,
    }),
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      })
      return (
        <Provider store={mockStore}>
          <QueryClientProvider client={queryClient}>
            <SettingsContext.Provider value={mockSettings}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Story />
              </LocalizationProvider>
            </SettingsContext.Provider>
          </QueryClientProvider>
        </Provider>
      )
    },
  ],
}

export default preview
