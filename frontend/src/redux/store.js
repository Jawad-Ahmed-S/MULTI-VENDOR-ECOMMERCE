import { configureStore, combineReducers} from '@reduxjs/toolkit'
import userReducer from './userSlice/userSlice.js'
import {persistStore,persistReducer }from 'redux-persist'
import storage from "redux-persist/es/storage"

const rootReducer= combineReducers({user:userReducer})
console.log(storage);
const persistConfig = {
  key: 'user',
  storage
}

const persistedReducer = persistReducer(persistConfig,rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware)=>getDefaultMiddleware({
    serializableCheck:false
  })
}) 

export const persistor = persistStore(store);