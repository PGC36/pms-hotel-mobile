/**
 * Mecanismo para forzar un error de red simulado (MOV-05, criterio 4) y así
 * poder probar `ErrorState` y el manejo de fallos sin depender de que algo
 * realmente se rompa. `delay()` consulta esto en cada llamada, así que
 * cualquier servicio lo hereda gratis sin código adicional por función.
 */
export class SimulatedNetworkError extends Error {
  constructor(message = 'Error simulado de red: inténtalo de nuevo.') {
    super(message);
    this.name = 'SimulatedNetworkError';
  }
}

let pendingFailures = 0;

/** Hace que las próximas `times` llamadas a un servicio lancen `SimulatedNetworkError`. */
export function forceNextFailure(times = 1): void {
  pendingFailures += times;
}

export function clearForcedFailures(): void {
  pendingFailures = 0;
}

export function shouldSimulateFailure(): boolean {
  if (pendingFailures <= 0) return false;
  pendingFailures -= 1;
  return true;
}
