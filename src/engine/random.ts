/** Uniform integer in [0, maxExclusive), using crypto when available. */
export function randomInt(maxExclusive: number): number {
  try {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % maxExclusive;
  } catch {
    return Math.floor(Math.random() * maxExclusive);
  }
}

/** Fisher–Yates shuffle returning a new array. */
export function shuffle<T>(items: readonly T[], rand: (n: number) => number = randomInt): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}
