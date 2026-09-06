import { shouldSimulateFailure, SimulatedNetworkError } from './simulate-error';

export const MIN_DELAY_MS = 300;
export const MAX_DELAY_MS = 600;

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Simula latencia de red. Todo servicio debe esperar esto antes de devolver
 * datos (architecture.md sección 2), lo que obliga a programar estados de
 * carga desde el primer día. Sin argumento, espera entre 300 y 600 ms
 * (MOV-05, criterio 2). También es el punto único donde se aplica un fallo
 * forzado con `forceNextFailure()` — ver `simulate-error.ts`.
 */
export async function delay(ms?: number): Promise<void> {
  const duration = ms ?? randomBetween(MIN_DELAY_MS, MAX_DELAY_MS);
  await new Promise<void>((resolve) => setTimeout(resolve, duration));
  if (shouldSimulateFailure()) {
    throw new SimulatedNetworkError();
  }
}
