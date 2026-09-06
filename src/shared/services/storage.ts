import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Única puerta de entrada a almacenamiento persistente en el dispositivo.
 * Hoy usa `@react-native-async-storage/async-storage` (datos no sensibles,
 * como qué sesión estaba activa); si más adelante hay tokens de sesión
 * reales contra un backend, ese cambio queda contenido aquí — ningún
 * consumidor debe importar AsyncStorage directamente. Ver architecture.md
 * sección 7.
 */
export async function getStorageItem(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function setStorageItem(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function removeStorageItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function getStorageJSON<T>(key: string): Promise<T | null> {
  const raw = await getStorageItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setStorageJSON<T>(key: string, value: T): Promise<void> {
  await setStorageItem(key, JSON.stringify(value));
}
