/**
 * Muestra un monto que el backend entrega en centavos enteros (ej. 6500 →
 * "Q65.00"). Solo presentación: no suma, redondea ni calcula montos.
 */
export function formatMoney(cents: number, currency: string): string {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat('es-GT', { style: 'currency', currency }).format(amount);
  } catch {
    // Moneda que `Intl` no reconoce: se muestra igual, sin perder el código.
    return `${currency} ${amount.toFixed(2)}`;
  }
}
