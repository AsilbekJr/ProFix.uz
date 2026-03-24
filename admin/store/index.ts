import { configureStore } from '@reduxjs/toolkit';
import { adminApi } from './adminApiSlice';
import adminAuthReducer from './adminAuthSlice';

export const store = configureStore({
  reducer: {
    adminAuth: adminAuthReducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(adminApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
