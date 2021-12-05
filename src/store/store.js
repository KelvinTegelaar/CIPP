import { applyMiddleware, compose, createStore } from 'redux'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import ApiClient from './ApiClient'
import clientMiddleware, { errorMiddleware } from './middleware'
import rootReducer from './modules/root'

const client = new ApiClient()
let middleware = [clientMiddleware(client), errorMiddleware()]

if (process.env.NODE_ENV !== 'production') {
  middleware = [require('redux-immutable-state-invariant').default(), ...middleware]
}

const persistConfig = {
  key: 'root',
  storage,
  // dont store the modal/toast state
  blacklist: ['modal', 'toast'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
// @todo check if this works in prod
const composeEnhancers =
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ trace: true, traceLimit: 25 })) ||
  compose

const configure = () => {
  let store = createStore(persistedReducer, composeEnhancers(applyMiddleware(...middleware)))
  let persistor = persistStore(store)

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./modules/root', () => store.replaceReducer(rootReducer))
  }

  return { store, persistor }
}

export default configure
