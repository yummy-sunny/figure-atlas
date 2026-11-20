import type { Vec } from "../data/dimensions";
import type { Figure, Gender } from "../data/figures";

export type GenderPref = Gender | "all";

export interface Match {
  figure: Figure;
  /** Pearson correlation between the two profiles, -1..1 */
  r: number;
  /** Display similarity, 0..99 */
  percent: number;
  /** Euclidean distance between z-scored profiles, used as a tie-breaker */
  distance: number;
}

const mean = (v: Vec) => v.reduce((s, x) => s + x, 0) / v.length;

export function zscore(v: Vec): number[] {
  const m = mean(v);
  const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) * (x - m), 0) / v.length);
  return v.map((x) => (sd > 0 ? (x - m) / sd : 0));
}

/** Pearson correlation; returns 0 when either side is flat. */
export function pearson(a: Vec, b: Vec): number {
  const ma = mean(a);
  const mb = mean(b);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] - ma;
    const y = b[i] - mb;
    num += x * y;
    da += x * x;
    db += y * y;
  }
  return da > 0 && db > 0 ? num / Math.sqrt(da * db) : 0;
}

function euclid(a: Vec, b: Vec): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) * (a[i] - b[i]);
  return Math.sqrt(s);
}

export function filterByGender(figures: readonly Figure[], pref: GenderPref): Figure[] {
  return figures.filter((x) => pref === "all" || x.gender === pref);
}

/**
 * Rank figures by profile *shape* (which dimensions stand out relative to the
 * rest), not absolute level. Every figure owns a distinct vector, so ties are
 * practically impossible; distance breaks any that remain.
 */
export function rankFigures(scores: Vec, figures: readonly Figure[]): Match[] {
  const zs = zscore(scores);
  return figures
    .map((figure) => {
      const r = pearson(scores, figure.vec);
      return {
        figure,
        r,
        percent: Math.round(50 + 49 * Math.max(-1, Math.min(1, r))),
        distance: euclid(zs, zscore(figure.vec)),
      };
    })
    .sort((a, b) => b.r - a.r || a.distance - b.distance);
}
