import { DIMENSIONS, DIM_IDS, type DimId } from "../data/dimensions";
import type { Figure } from "../data/figures";
import { zscore, type Match } from "./matching";

export interface Report {
  figure: Figure;
  percent: number;
  scores: number[];
  /** User's strongest, second strongest and weakest dimensions */
  top: DimId;
  second: DimId;
  lowest: DimId;
  /** Dimensions where both user and figure stand out */
  common: DimId[];
  /** Runners-up */
  others: Match[];
}

function order(scores: readonly number[]): DimId[] {
  return DIM_IDS.map((id, i) => ({ id, s: scores[i], i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.id);
}

export function buildReport(scores: number[], ranked: readonly Match[]): Report {
  const best = ranked[0];
  const sorted = order(scores);
  const zu = zscore(scores);
  const zf = zscore(best.figure.vec);
  const common = DIM_IDS.map((id, i) => ({ id, v: zu[i] + zf[i], i }))
    .sort((a, b) => b.v - a.v || a.i - b.i)
    .slice(0, 3)
    .map((x) => x.id);

  return {
    figure: best.figure,
    percent: best.percent,
    scores,
    top: sorted[0],
    second: sorted[1],
    lowest: sorted[sorted.length - 1],
    common,
    others: ranked.slice(1, 3),
  };
}

export function archetypeLine(report: Report): string {
  const top = DIMENSIONS[report.top];
  const second = DIMENSIONS[report.second];
  return `${top.archetype} · 带一点「${second.name}」的底色`;
}
