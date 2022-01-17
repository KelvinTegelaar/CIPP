import { configureStore } from '@reduxjs/toolkit'
import { persistStore, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist'
import { unauthenticatedMiddleware } from 'src/store/middleware/unauthenticatedMiddleware'
import { errorMiddleware } from 'src/store/middleware/errorMiddleware'
import { rootReducer, apiMiddleware } from 'src/store/root'

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat([unauthenticatedMiddleware, ...apiMiddleware, errorMiddleware]),
})

// enable redux module hot reload
if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./root', () => store.replaceReducer(rootReducer))
}

export const persistor = persistStore(store)
