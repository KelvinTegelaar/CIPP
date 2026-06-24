import { useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from './root-reducer'

const IGNORED_ACTIONS = ['persist/FLUSH', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/PERSIST', 'persist/PURGE', 'persist/REGISTER']

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: IGNORED_ACTIONS,
      },
    }).concat([]),
})

export const useSelector = useReduxSelector

export const useDispatch = () => useReduxDispatch()
