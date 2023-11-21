import 'react-app-polyfill/stable'
import 'core-js'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from 'src/App'
import { Provider } from 'react-redux'
import { store, persistor } from 'src/store'
import { PersistGate } from 'redux-persist/integration/react'
import { FullScreenLoading } from 'src/components/utilities'
import { HelmetProvider } from 'react-helmet-async'

const container = document.getElementById('root')

const root = createRoot(container)

root.render(
  // @TODO fix issues preventing app from running with StrictMode enabled
  // <React.StrictMode>
  <Provider store={store}>
    <PersistGate loading={<FullScreenLoading />} persistor={persistor}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </PersistGate>
  </Provider>,
  // </React.StrictMode>,
)
