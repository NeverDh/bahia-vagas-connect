/**
 * Contador global de requisições HTTP em voo (via `api.ts`).
 * Usado pela barra de loading; não acopla React ao módulo de fetch.
 */

type Listener = (inFlightCount: number) => void;

let inFlight = 0;
const listeners = new Set<Listener>();

export function subscribeApiLoading(listener: Listener): () => void {
  listeners.add(listener);
  listener(inFlight);
  return () => {
    listeners.delete(listener);
  };
}

export function getApiInFlightCount(): number {
  return inFlight;
}

export function beginApiRequest(): void {
  inFlight += 1;
  listeners.forEach((l) => l(inFlight));
}

export function endApiRequest(): void {
  inFlight = Math.max(0, inFlight - 1);
  listeners.forEach((l) => l(inFlight));
}
