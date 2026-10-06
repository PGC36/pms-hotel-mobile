import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { getStorageItem, removeStorageItem, setStorageItem } from './storage';

/**
 * Almacenamiento seguro para tokens y credenciales sensibles.
 * En plataformas nativas (iOS/Android), usa `expo-secure-store` con hardware keystore/Keychain.
 * En Web (entorno de pruebas en navegador), fallback a AsyncStorage para evitar caídas de ejecución.
 */
export async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return getStorageItem(key);
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await setStorageItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function removeSecureItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await removeStorageItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
