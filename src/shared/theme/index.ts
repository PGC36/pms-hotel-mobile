import { colors, statusColors } from './colors';
import { radius, spacing } from './spacing';
import { fontFamily, fontSize, fontWeight, lineHeight, typography } from './typography';

export * from './colors';
export * from './typography';
export * from './spacing';

export const theme = {
  colors,
  statusColors,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  typography,
  spacing,
  radius,
} as const;
