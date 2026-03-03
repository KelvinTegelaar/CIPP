import { useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from './root-reducer'
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist'

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.REACT_APP_ENABLE_REDUX_DEV_TOOLS === 'true',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat([]),
})

export const useSelector = useReduxSelector

export const useDispatch = () => useReduxDispatch()
