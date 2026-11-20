import { describe, expect, it } from "vitest";
import { DIM_IDS } from "../src/data/dimensions";
import { FIGURES } from "../src/data/figures";
import { QUESTIONS, QUIZ_LENGTH } from "../src/data/questions";
import { filterByGender, rankFigures, type GenderPref } from "../src/engine/matching";
import { shuffle } from "../src/engine/random";
import { scoreAnswers } from "../src/engine/scoring";
import { decodeResult, encodeResult } from "../src/engine/share";

// Deterministic PRNG so the simulation is reproducible
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("figures", () => {
  it("has 22 male and 22 female figures with unique ids", () => {
    expect(FIGURES.filter((x) => x.gender === "male")).toHaveLength(22);
    expect(FIGURES.filter((x) => x.gender === "female")).toHaveLength(22);
    expect(new Set(FIGURES.map((x) => x.id)).size).toBe(FIGURES.length);
  });

  it("every vector has 8 values in 0..100", () => {
    FIGURES.forEach((x) => {
      expect(x.vec).toHaveLength(DIM_IDS.length);
      x.vec.forEach((v) => expect(v >= 0 && v <= 100).toBe(true));
    });
  });

  it("every figure is the best match for its own profile (no shadowed figures)", () => {
    FIGURES.forEach((x) => {
      expect(rankFigures(x.vec, FIGURES)[0].figure.id).toBe(x.id);
    });
  });
});

describe("questions", () => {
  it("has 32 questions with 4 options each", () => {
    expect(QUESTIONS).toHaveLength(32);
    QUESTIONS.forEach((q) => expect(q.options).toHaveLength(4));
  });

  it("primary weights are roughly balanced across dimensions", () => {
    const counts: Record<string, number> = {};
    QUESTIONS.forEach((q) =>
      q.options.forEach((o) => {
        const primary = Object.keys(o.w).find((k) => o.w[k as keyof typeof o.w] === 2);
        expect(primary).toBeTruthy();
        counts[primary!] = (counts[primary!] || 0) + 1;
      }),
    );
    DIM_IDS.forEach((d) => expect(counts[d] >= 12 && counts[d] <= 20).toBe(true));
  });
});

describe("matching under random play", () => {
  const simulate = (pref: GenderPref, runs: number) => {
    const rng = mulberry32(42);
    const rand = (n: number) => Math.floor(rng() * n);
    const pool = filterByGender(FIGURES, pref);
    const hits = new Map<string, number>();
    for (let i = 0; i < runs; i++) {
      const qs = shuffle(QUESTIONS, rand).slice(0, QUIZ_LENGTH);
      // Biased players: favour two random dimensions, like real people do
      const fav = [rand(8), rand(8)].map((k) => DIM_IDS[k]);
      const picks = qs.map((question) => {
        const idx = question.options.findIndex((o) => fav.some((d) => (o.w[d] || 0) >= 2));
        return { question, optionIndex: idx >= 0 && rng() < 0.7 ? idx : rand(4) };
      });
      const top = rankFigures(scoreAnswers(picks), pool)[0].figure.name;
      hits.set(top, (hits.get(top) || 0) + 1);
    }
    return { pool, hits };
  };

  (["male", "female", "all"] as const).forEach((pref) => {
    it(`reaches most figures and none dominates (${pref})`, () => {
      const runs = 6000;
      const { pool, hits } = simulate(pref, runs);
      const share = Math.max(...hits.values()) / runs;
      console.log(pref, `reached ${hits.size}/${pool.length}`, `max share ${(share * 100).toFixed(1)}%`);
      expect(hits.size / pool.length).toBeGreaterThanOrEqual(0.8);
      expect(share).toBeLessThan(0.2);
      if (pref === "all") {
        const names = new Set(hits.keys());
        expect(FIGURES.some((x) => x.gender === "female" && names.has(x.name))).toBe(true);
        expect(FIGURES.some((x) => x.gender === "male" && names.has(x.name))).toBe(true);
      }
    });
  });
});

describe("share codes", () => {
  it("round-trips and rejects garbage", () => {
    const r = { gender: "female" as const, scores: [25, 100, 63, 47, 88, 30, 71, 55] };
    expect(decodeResult(encodeResult(r))).toEqual(r);
    expect(decodeResult("x.123")).toBeNull();
    expect(decodeResult("m.zzzzzzzzzzzzzzzz")).toBeNull();
    expect(decodeResult(null)).toBeNull();
  });
});
