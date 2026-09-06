/**
 * Escala tipográfica — PMS Hoteles Boutique.
 *
 * La identidad de marca (docs/paletaColores.md) define Playfair Display para
 * encabezados y DM Sans para cuerpo de texto. Cargar esas fuentes en Expo requiere
 * `expo-font` + los paquetes de Google Fonts y registrarlas en App.tsx, lo cual
 * queda fuera del alcance de MOV-03. Mientras tanto `fontFamily` usa la fuente del
 * sistema; cuando se agreguen los assets de fuente, solo hay que actualizar los
 * valores de `fontFamily` de abajo — el resto de la escala no cambia.
 */

export const fontFamily = {
  heading: 'System',
  body: 'System',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 34,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 26,
  xl: 30,
  xxl: 36,
  display: 42,
} as const;

export const typography = {
  display: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.display,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.display,
  },
  h1: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.xxl,
  },
  h2: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.xl,
  },
  bodyLarge: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.lg,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.md,
  },
  bodySmall: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.sm,
  },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.xs,
  },
  button: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.md,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
