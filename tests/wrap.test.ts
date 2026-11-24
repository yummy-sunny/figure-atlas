import { describe, expect, it } from "vitest";
import { wrapText } from "../src/export/wrap";

// Every character is one unit wide, so maxW is "characters per line".
const measure = (s: string) => Array.from(s).length;

describe("wrapText", () => {
  it("breaks plain text at the width limit", () => {
    expect(wrapText("一二三四五六七", 3, measure)).toEqual(["一二三", "四五六", "七"]);
  });

  it("never starts a line with closing punctuation", () => {
    const rows = wrapText("一二三。四五", 3, measure);
    expect(rows).toEqual(["一二", "三。四", "五"]);
    rows.forEach((r) => expect("，。、；：！？）」”》").not.toContain(r[0]));
  });

  it("never ends a line with opening punctuation", () => {
    expect(wrapText("一二「三四」", 3, measure)).toEqual(["一二", "「三", "四」"]);
    const rows = wrapText("一二「三四五", 3, measure);
    rows.slice(0, -1).forEach((r) => expect("「“《（").not.toContain(r[r.length - 1]));
  });

  it("keeps every character exactly once", () => {
    const text = "韩国贵族之后，青年时曾谋刺秦始皇。后来辅佐刘邦定天下，屡献关键之策；汉朝建立后主动淡出权力中心，得以善终。";
    for (const w of [5, 7, 9, 12]) expect(wrapText(text, w, measure).join("")).toBe(text);
  });
});
