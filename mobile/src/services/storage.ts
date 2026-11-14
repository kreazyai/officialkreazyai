// =====================================================================
// KREAZYAI SECURE STORAGE LAYER
// Persists tokens, user session, and mobile configuration
// =====================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'kreazy_mobile_auth_token',
  USER_DATA: 'kreazy_mobile_user_data',
  API_URL: 'kreazy_mobile_api_url',
  NOTIFICATIONS_ENABLED: 'kreazy_mobile_notif_pref',
  OFFLINE_CACHE: 'kreazy_mobile_cache'
} as const;

export const storage = {
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch {
      return null;
    }
  },

  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (err) {
      console.warn('[STORAGE] Failed to save auth token:', err);
    }
  },

  async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (err) {
      console.warn('[STORAGE] Failed to remove auth token:', err);
    }
  },

  async getUserData<T = any>(): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async setUserData(data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
    } catch (err) {
      console.warn('[STORAGE] Failed to save user data:', err);
    }
  },

  async removeUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (err) {
      console.warn('[STORAGE] Failed to remove user data:', err);
    }
  },

  async getCustomApiUrl(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.API_URL);
    } catch {
      return null;
    }
  },

  async setCustomApiUrl(url: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.API_URL, url);
    } catch (err) {
      console.warn('[STORAGE] Failed to set custom API url:', err);
    }
  },

  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA]);
    } catch (err) {
      console.warn('[STORAGE] Failed to clear session:', err);
    }
  }
};

export default storage;
