/**
 * Escala de espaciado y radios — PMS Hoteles Boutique.
 * Progresión de 4px. Ningún componente debe usar un valor de margen, padding,
 * gap o radio escrito a mano; siempre a través de estos tokens.
 */

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
