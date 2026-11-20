import type { Question } from "../data/questions";
import { shuffle } from "./random";

const SEEN_KEY = "figure-atlas:seen-questions";

function readSeen(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(SEEN_KEY) || "[]");
    return new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function writeSeen(ids: Set<string>): void {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Private mode or storage disabled: repeats are acceptable
  }
}

/**
 * Pick `count` questions, preferring ones this browser has not seen recently.
 * Options inside each question are shuffled so position carries no meaning.
 */
export function pickQuestions(bank: readonly Question[], count: number): Question[] {
  const seen = readSeen();
  const unseen = shuffle(bank.filter((x) => !seen.has(x.id)));
  const filler = shuffle(bank.filter((x) => seen.has(x.id)));
  const chosen = shuffle(unseen.concat(filler).slice(0, count));

  const nextSeen = new Set(seen);
  chosen.forEach((x) => nextSeen.add(x.id));
  // Once the whole bank has been seen, start a fresh cycle from this round
  writeSeen(nextSeen.size >= bank.length ? new Set(chosen.map((x) => x.id)) : nextSeen);

  return chosen.map((x) => ({ ...x, options: shuffle(x.options) }));
}
