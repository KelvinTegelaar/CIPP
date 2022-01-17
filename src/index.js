import 'react-app-polyfill/stable'
import 'core-js'
import React from 'react'
import ReactDOM from 'react-dom'
import App from 'src/App'
import * as serviceWorker from 'src/serviceWorker'
import { Provider } from 'react-redux'
import { store, persistor } from 'src/store'
import { PersistGate } from 'redux-persist/integration/react'
import { FullScreenLoading } from 'src/components/utilities'

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<FullScreenLoading />} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
