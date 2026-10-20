import axios from 'axios';
import API_URL from '@/constants/api_url';
import useAuthStore from '@/store/auth_store';
import authClient from './auth_api';

/** The app's API. The server takes the restaurant and branch from the sign-in, so requests never send them. */
const api = axios.create({ baseURL: `${API_URL}/api/v1`, timeout: 20_000 });

// Native apps have no browser cookies: the sign-in's cookie comes from the secure store.
api.interceptors.request.use(async (config) => {
  const cookie = await authClient.getCookie();
  if (cookie) config.headers.set('Cookie', cookie);
  return config;
});

api.interceptors.response.use(undefined, (error) => {
  const status = error.response?.status;
  const data = error.response?.data;
  // Signed out: the route guards send them to sign in.
  if (status === 401 && (data?.code === 'signed_out' || data?.code === 'pos_locked')) {
    useAuthStore.getState().setMe(null, data.code === 'pos_locked');
  }
  // Removed, suspended, or the restaurant is closing: the answer carries where they work now.
  if (status === 403 && data?.code === 'context_lost') useAuthStore.getState().setMe(data.me);
  return Promise.reject(error);
});

export default api;
