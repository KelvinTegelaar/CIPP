import React from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTheme } from '../src/theme'
import { SettingsContext } from '../src/contexts/settings-context'

const defaultTheme = createTheme({
  colorPreset: 'orange',
  direction: 'ltr',
  paletteMode: 'light',
  contrast: 'high',
})

const defaultSettings = {
  currentTenant: 'testdomain.com',
  currentTheme: { value: 'light', label: 'light' },
  paletteMode: 'light',
  direction: 'ltr',
  pinNav: true,
  handleUpdate: () => {},
  handleReset: () => {},
  isCustom: false,
}

const defaultStore = configureStore({
  reducer: {
    toasts: (state = { toasts: [] }) => state,
  },
})

export const settingsWith = (overrides = {}) => ({ ...defaultSettings, ...overrides })

export function renderWithTheme(ui, options = {}) {
  const { theme = defaultTheme, ...renderOptions } = options
  return render(
    <ThemeProvider theme={theme}>{ui}</ThemeProvider>,
    renderOptions
  )
}

export function renderWithProviders(ui, options = {}) {
  const {
    theme = defaultTheme,
    store = defaultStore,
    settings = defaultSettings,
    queryClientOptions = { defaultOptions: { queries: { retry: false } } },
    ...renderOptions
  } = options

  const queryClient = new QueryClient(queryClientOptions)

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SettingsContext.Provider value={settings}>
          <ThemeProvider theme={theme}>{ui}</ThemeProvider>
        </SettingsContext.Provider>
      </QueryClientProvider>
    </Provider>,
    renderOptions
  )
}
