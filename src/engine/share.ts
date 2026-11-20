import { DIM_IDS } from "../data/dimensions";
import type { GenderPref } from "./matching";

export interface SharedResult {
  gender: GenderPref;
  scores: number[];
}

const G_TO_CODE: Record<GenderPref, string> = { male: "m", female: "f", all: "a" };
const CODE_TO_G: Record<string, GenderPref> = { m: "male", f: "female", a: "all" };

/**
 * Compact, URL-safe encoding: "<gender>.<2 base36 chars per score>".
 * The figure is NOT stored — it is recomputed from the scores, so a shared
 * link always shows exactly what the matching algorithm produces.
 */
export function encodeResult(r: SharedResult): string {
  const body = r.scores
    .map((s) => Math.max(0, Math.min(100, Math.round(s))).toString(36).padStart(2, "0"))
    .join("");
  return `${G_TO_CODE[r.gender]}.${body}`;
}

export function decodeResult(code: string | null): SharedResult | null {
  if (!code) return null;
  const m = /^([mfa])\.([0-9a-z]+)$/.exec(code.trim());
  if (!m || m[2].length !== DIM_IDS.length * 2) return null;
  const scores: number[] = [];
  for (let i = 0; i < m[2].length; i += 2) {
    const v = parseInt(m[2].slice(i, i + 2), 36);
    if (!(v >= 0 && v <= 100)) return null;
    scores.push(v);
  }
  return { gender: CODE_TO_G[m[1]], scores };
}
