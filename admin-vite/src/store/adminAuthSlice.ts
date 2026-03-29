import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    setAdminCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_token', action.payload.token);
        localStorage.setItem('admin_user', JSON.stringify(action.payload.user));
      }
    },
    adminLogout(state) {
      state.user = null;
      state.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    },
    rehydrate(state) {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('admin_token');
        const user = localStorage.getItem('admin_user');
        if (token && user) {
          state.token = token;
          state.user = JSON.parse(user);
        }
      }
    },
  },
});

export const { setAdminCredentials, adminLogout, rehydrate } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
