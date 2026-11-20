import { DIM_IDS } from "../data/dimensions";
import type { Question } from "../data/questions";

export interface Pick {
  question: Question;
  optionIndex: number;
}

/**
 * Turn answers into an 8-dim score vector on a 0–100 scale.
 *
 * Each dimension is normalised by how many points were actually *available*
 * for it in the questions this user saw, so a random draw that happens to
 * offer fewer chances for one dimension does not penalise it.
 * A square-root curve spreads mid-range ratios so bars stay readable.
 */
export function scoreAnswers(picks: readonly Pick[]): number[] {
  const earned = DIM_IDS.map(() => 0);
  const available = DIM_IDS.map(() => 0);

  picks.forEach(({ question, optionIndex }) => {
    const chosen = question.options[optionIndex];
    DIM_IDS.forEach((dim, i) => {
      let best = 0;
      question.options.forEach((o) => {
        best = Math.max(best, o.w[dim] || 0);
      });
      available[i] += best;
      earned[i] += (chosen && chosen.w[dim]) || 0;
    });
  });

  return earned.map((e, i) => {
    const ratio = available[i] > 0 ? e / available[i] : 0;
    return Math.round(25 + 75 * Math.sqrt(Math.min(1, ratio)));
  });
}
