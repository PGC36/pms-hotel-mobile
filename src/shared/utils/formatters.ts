/**
 * Moneda única del proyecto (quetzales guatemaltecos). Cerrada a un solo
 * literal, igual que el contrato de la web (docs/HANDOFF-MOVIL.md sección 2)
 * — nunca una unión abierta de monedas.
 */
export type Currency = 'GTQ';

/**
 * Formatea un monto en centavos (entero) como texto de moneda, ej.
 * `formatCurrency(32000)` → `"Q320.00"`. Lanza si `amountCents` no es
 * entero: es la trampa exacta que documenta el contrato de la web — si
 * alguien migra un campo de decimal a centavos sin multiplicar por 100, el
 * error aparece aquí en vez de mostrar un precio cien veces menor en
 * silencio.
 */
export function formatCurrency(amountCents: number, currency: Currency = 'GTQ'): string {
  if (!Number.isInteger(amountCents)) {
    throw new Error(`formatCurrency: amountCents debe ser un entero, recibió ${amountCents}`);
  }

  return new Intl.NumberFormat('es-GT', { style: 'currency', currency }).format(amountCents / 100);
}
