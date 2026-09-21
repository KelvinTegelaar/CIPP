import Head from 'next/head'
import { CippIcons } from '../utils/icon-registry'
import { Provider as ReduxProvider } from 'react-redux'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ReleaseNotesProvider } from '../contexts/release-notes-context'
import { SettingsConsumer, SettingsProvider } from '../contexts/settings-context'
import { RTL } from '../components/rtl'
import { store } from '../store'
import { createTheme } from '../theme'
import { createEmotionCache } from '../utils/create-emotion-cache'
import '../libs/nprogress'
import 'driver.js/dist/driver.css'
import '../styles/tutorial-overrides.css'
import { PrivateRoute } from '../components/PrivateRoute'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSystemPrefersDark } from '../hooks/use-system-prefers-dark'
import Error500 from './500'
import { ErrorBoundary } from 'react-error-boundary'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import {
  enUS,
  enGB,
  nl,
  fr,
  de,
  es,
  it,
  pt,
  sv,
  da,
  nb,
  fi,
  is,
  pl,
  cs,
  sk,
  hu,
  ro,
  ru,
  enAU,
  enNZ,
} from 'date-fns/locale'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
import CippSpeedDial from '../components/CippComponents/CippSpeedDial'
import { getHelpLinks, clearCippCache } from '../utils/help-links'
import { Chip, SvgIcon } from '@mui/material'
import React, { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { TutorialProvider } from '../contexts/tutorial-context'
import CippTutorialDialog from '../components/CippComponents/CippTutorialDialog'
import CippSupportBundleDialog from '../components/CippComponents/CippSupportBundleDialog'

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then((d) => ({
    default: d.ReactQueryDevtools,
  }))
)
TimeAgo.addDefaultLocale(en)

const queryClient = new QueryClient()
const clientSideEmotionCache = createEmotionCache()

const App = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  const getLayout = Component.getLayout ?? ((page) => page)
  const preferredTheme = useSystemPrefersDark() ? 'dark' : 'light'

  // The _document.js init style painted the page dark and hid the stale light
  // prerender for dark-mode users. By the time passive effects run, the themed
  // UI is committed and painted (useSystemPrefersDark flushes pre-paint), so
  // the guard style has done its job.
  useEffect(() => {
    document.getElementById('cipp-color-init')?.remove()
  }, [])

  const pathname = usePathname()
  const route = useRouter()
  const [dateLocale, setDateLocale] = useState(enUS)
  const [tutorialDialogOpen, setTutorialDialogOpen] = useState(false)
  const [supportBundleOpen, setSupportBundleOpen] = useState(false)
  const [supportRecording, setSupportRecording] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Register minimal service worker for Chrome installability
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    const language = navigator.language || navigator.userLanguage || 'en-US'
    const baseLang = language.split('-')[0]

    const localeMap = {
      // English variants
      en: enUS,
      'en-US': enUS,
      'en-GB': enGB,
      'en-AU': enAU,
      'en-NZ': enNZ,

      // Western Europe
      nl: nl,
      'nl-NL': nl,
      fr: fr,
      'fr-FR': fr,
      de: de,
      'de-DE': de,
      es: es,
      'es-ES': es,
      it: it,
      'it-IT': it,
      pt: pt,
      'pt-PT': pt,
      'pt-BR': pt,

      // Scandinavia / Nordics
      sv: sv,
      'sv-SE': sv,
      da: da,
      'da-DK': da,
      nb: nb,
      'nb-NO': nb,
      fi: fi,
      'fi-FI': fi,
      is: is,
      'is-IS': is,

      // Eastern Europe
      pl: pl,
      'pl-PL': pl,
      cs: cs,
      'cs-CZ': cs,
      sk: sk,
      'sk-SK': sk,
      hu: hu,
      'hu-HU': hu,
      ro: ro,
      'ro-RO': ro,
      ru: ru,
      'ru-RU': ru,
    }

    const resolvedLocale = localeMap[language] || localeMap[baseLang] || enUS
    setDateLocale(resolvedLocale)
  }, [])

  // authmecipp not persisted, stale clientPrincipal:null flashes 401 on post-login reload
  const excludeQueryKeys = ['authmeswa', 'authmecipp', 'alertsDashboard']

  // 👇 Persist TanStack Query cache to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const localStoragePersister = createSyncStoragePersister({
        storage: window.localStorage,
      })

      persistQueryClient({
        queryClient,
        persister: localStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        staleTime: 1000 * 60 * 5, // optional: 5 minutes
        buster: 'v2',
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const queryIsReadyForPersistence = query.state.status === 'success'
            if (queryIsReadyForPersistence) {
              const { queryKey } = query
              // Check if queryKey exists and has elements before accessing index 0
              if (!queryKey || !queryKey.length) {
                return false
              }
              const queryKeyString = String(queryKey[0] || '')
              const excludeFromPersisting = excludeQueryKeys.some((key) =>
                queryKeyString.includes(key)
              )
              return !excludeFromPersisting
            }
            return queryIsReadyForPersistence
          },
        },
      })
    }
  }, [])

  // Link/cache destinations are shared with AccountPopover's mobile help section — see
  // utils/help-links.js. Only the icons and SpeedDial-specific actions live here.
  const helpLinkIcons = {
    'bug-report': <CippIcons.BugReport />,
    'feature-request': <CippIcons.Feedback />,
    discord: <img src="/discord-mark-blue.svg" alt="Discord" style={{ width: 24, height: 24 }} />,
    documentation: <CippIcons.AutoStories />,
  }

  const speedDialActions = [
    {
      id: 'clearCache',
      icon: <CippIcons.ClearAll />,
      name: 'Clear Cache and Reload',
      onClick: () => clearCippCache(queryClient),
    },
    {
      id: 'license',
      icon: <CippIcons.Gavel />,
      name: 'License',
      href: '/license',
      onClick: () => route.push('/license'),
    },
    {
      id: 'supportBundle',
      icon: <CippIcons.SupportAgent />,
      name: 'Generate Support File',
      onClick: () => setSupportBundleOpen(true),
    },
    ...getHelpLinks(pathname).map((link) => ({
      ...link,
      icon: helpLinkIcons[link.id],
      onClick: () => window.open(link.href, '_blank'),
    })),
    {
      id: 'tutorials',
      icon: <CippIcons.School />,
      name: 'Tutorials',
      onClick: () => setTutorialDialogOpen(true),
    },
  ]

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>CIPP</title>
        <meta name="viewport" content="initial-scale=1, width=device-width, viewport-fit=cover" />
      </Head>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateLocale}>
              <SettingsConsumer>
                {(settings) => {
                  // Create theme even while initializing to avoid blank screen
                  const theme = createTheme({
                    colorPreset: 'orange',
                    direction: settings.direction || 'ltr',
                    paletteMode:
                      settings.currentTheme?.value !== 'browser'
                        ? settings.currentTheme?.value || 'light'
                        : preferredTheme,
                    contrast: 'high',
                  })

                  return (
                    <>
                      <ThemeProvider theme={theme}>
                        <RTL direction={settings.direction}>
                          <CssBaseline />
                          <ErrorBoundary FallbackComponent={Error500}>
                            <PrivateRoute>
                              <TutorialProvider>
                                <ReleaseNotesProvider>
                                  {getLayout(<Component {...pageProps} />)}
                                </ReleaseNotesProvider>
                                <CippTutorialDialog
                                  open={tutorialDialogOpen}
                                  onClose={() => setTutorialDialogOpen(false)}
                                />
                                <CippSupportBundleDialog
                                  open={supportBundleOpen}
                                  onClose={() => setSupportBundleOpen(false)}
                                  onRecordingChange={setSupportRecording}
                                />
                              </TutorialProvider>
                            </PrivateRoute>
                          </ErrorBoundary>
                          {supportRecording && !supportBundleOpen && (
                            <Chip
                              icon={<CippIcons.FiberManualRecord />}
                              label="Recording — click to stop"
                              color="error"
                              onClick={() => setSupportBundleOpen(true)}
                              sx={{
                                position: 'fixed',
                                bottom: 20,
                                // Pinned left of the speed dial FAB (46px wide + 12px gap),
                                // which itself shifts left when devtools is enabled.
                                right:
                                  (settings.isInitialized && settings?.showDevtools === true
                                    ? 60
                                    : 12) + 58,
                                zIndex: (muiTheme) => muiTheme.zIndex.speedDial,
                              }}
                            />
                          )}
                          <CippSpeedDial
                            actions={speedDialActions}
                            icon={<CippIcons.Help />}
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
                  )
                }}
              </SettingsConsumer>
            </LocalizationProvider>
          </SettingsProvider>
        </QueryClientProvider>
      </ReduxProvider>
    </CacheProvider>
  )
}

export default App
