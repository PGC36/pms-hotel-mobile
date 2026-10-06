const secureItems = new Map<string, string>();

export function getWebSecureItem(key: string): string | null {
  return secureItems.get(key) ?? null;
}

export function setWebSecureItem(key: string, value: string): void {
  secureItems.set(key, value);
}

export function removeWebSecureItem(key: string): void {
  secureItems.delete(key);
}
