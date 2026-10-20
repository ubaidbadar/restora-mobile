import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/client';
import * as SecureStore from 'expo-secure-store';
import API_URL from '@/constants/api_url';

/**
 * Better Auth (sign in, sign up, passwords). The session cookie is kept in the device's secure store, never in the
 * app's memory or files; `config/api` sends it with every request.
 */
const authClient = createAuthClient({
  baseURL: `${API_URL}/api/v1/auth`,
  plugins: [expoClient({ scheme: 'restora', storagePrefix: 'restora', storage: SecureStore })],
});

export default authClient;
