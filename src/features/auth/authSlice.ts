import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserAddress } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const getStoredToken = () => {
  try {
    return localStorage.getItem('novara_token');
  } catch {
    return null;
  }
};

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('novara_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const token = getStoredToken();
const user = getStoredUser();

const initialState: AuthState = {
  user,
  token,
  isAuthenticated: !!token && !!user,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      try {
        localStorage.setItem('novara_token', action.payload.token);
        localStorage.setItem('novara_user', JSON.stringify(action.payload.user));
      } catch (e) {
        console.error(e);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      try {
        localStorage.removeItem('novara_token');
        localStorage.removeItem('novara_user');
      } catch (e) {
        console.error(e);
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        try {
          localStorage.setItem('novara_user', JSON.stringify(state.user));
        } catch (e) {
          console.error(e);
        }
      }
    },
    updateAddresses: (state, action: PayloadAction<UserAddress[]>) => {
      if (state.user) {
        state.user.addresses = action.payload;
        try {
          localStorage.setItem('novara_user', JSON.stringify(state.user));
        } catch (e) {
          console.error(e);
        }
      }
    },
  },
});

export const { loginSuccess, logout, updateUser, updateAddresses } = authSlice.actions;
export const setCredentials = loginSuccess;
export default authSlice.reducer;
