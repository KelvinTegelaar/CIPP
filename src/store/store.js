import { createStore, applyMiddleware, compose } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import ApiClient from './ApiClient'
import clientMiddleware from './middleware'
import rootReducer from './modules/root'

const client = new ApiClient()

const persistConfig = {
  key: 'root',
  storage,
  // dont store the modal state
  blacklist: ['modal'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const configure = () => {
  let store = createStore(
    persistedReducer,
    composeEnhancers(applyMiddleware(clientMiddleware(client))),
  )
  let persistor = persistStore(store)
  return { store, persistor }
}

export default configure
