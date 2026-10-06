import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { getWebSecureItem, removeWebSecureItem, setWebSecureItem } from './web-secure-storage';

/**
 * Almacenamiento seguro para tokens y credenciales sensibles.
 * En plataformas nativas (iOS/Android), usa `expo-secure-store` con hardware keystore/Keychain.
 * En Web no existe un almacén equivalente protegido frente a JavaScript; los tokens
 * se mantienen solo en memoria y se pierden al recargar la página.
 */
export async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return getWebSecureItem(key);
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    setWebSecureItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function removeSecureItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    removeWebSecureItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
