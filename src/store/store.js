import { configureStore } from '@reduxjs/toolkit'
import { persistStore, FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist'
import { modalSlice } from './features/modal'
import { unauthenticatedMiddleware } from './middleware/unauthenticatedMiddleware'
import { errorMiddleware } from './middleware/errorMiddleware'
import { rootReducer, apiMiddleware } from './root'

const modalActionTypes = Object.keys(modalSlice.actions).map(
  (action) => modalSlice.actions[action].type,
)

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, ...modalActionTypes],
      },
    }).concat([unauthenticatedMiddleware, ...apiMiddleware, errorMiddleware]),
})

// enable redux module hot reload
if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./root', () => store.replaceReducer(rootReducer))
}

export const persistor = persistStore(store)
