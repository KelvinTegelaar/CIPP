import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist'
import { unauthenticatedMiddleware } from './middleware/unauthenticatedMiddleware'
import { rootReducer, apiMiddleware } from './root'

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat([unauthenticatedMiddleware, ...apiMiddleware]),
})

export const persistor = persistStore(store)
