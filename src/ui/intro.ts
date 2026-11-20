import { FIGURES } from "../data/figures";
import { QUESTIONS, QUIZ_LENGTH } from "../data/questions";
import type { GenderPref } from "../engine/matching";
import { h } from "./dom";

export function renderIntro(opts: { onStart: () => void }): HTMLElement {
  return h(
    "section",
    { class: "card intro" },
    h("div", { class: "seal", "aria-hidden": "true" }, "史鉴"),
    h("p", { class: "kicker" }, "FIGURE ATLAS · 历史人物原型测试"),
    h("h1", { class: "title" }, "你最像哪一位", h("br"), h("em", null, "中国历史人物"), "？"),
    h(
      "p",
      { class: "lead" },
      "一组取材于真实史事的情境题，读取你的决断、共情、洞察与担当，再从先秦到明末的人物里，找出和你处世方式最接近的那一位。",
    ),
    h(
      "ul",
      { class: "stats" },
      h("li", null, h("b", null, String(FIGURES.length)), "位人物 · 男女各半"),
      h("li", null, h("b", null, String(QUIZ_LENGTH)), `道情境题 · 题库 ${QUESTIONS.length} 道`),
      h("li", null, h("b", null, "8"), "维性格画像"),
      h("li", null, h("b", null, "5"), "分钟左右"),
    ),
    h("button", { class: "btn primary", type: "button", onClick: opts.onStart }, "开始测试"),
    h(
      "details",
      { class: "explain" },
      h("summary", null, "它是怎么匹配的？"),
      h(
        "p",
        null,
        "每个选项都对应一两个性格维度。答完后，系统按你实际遇到的题目，计算八个维度各自的倾向，得到一张“性格轮廓”。",
      ),
      h(
        "p",
        null,
        "每位历史人物也有一张独立绘制的轮廓。匹配看的是两张轮廓的“形状”是否相近——也就是哪些方面突出、哪些方面平淡——而不是分数高低。",
      ),
      h("p", null, "题目没有对错，选项顺序每次随机。请选最接近你真实反应的那一个。"),
    ),
  );
}

const GENDER_CHOICES: { value: GenderPref; mark: string; title: string; desc: string }[] = [
  { value: "female", mark: "女", title: "女性人物", desc: "从 22 位女性历史人物中匹配" },
  { value: "male", mark: "男", title: "男性人物", desc: "从 22 位男性历史人物中匹配" },
  { value: "all", mark: "全", title: "不限", desc: "在全部人物中纯粹按性格匹配" },
];

export function renderPreference(opts: { onBack: () => void; onPick: (g: GenderPref) => void }): HTMLElement {
  return h(
    "section",
    { class: "card" },
    h("p", { class: "kicker" }, "第一步"),
    h("h2", { class: "subtitle" }, "你想在哪些人物里寻找自己？"),
    h("p", { class: "hint" }, "只影响候选范围，不影响题目和计分。"),
    h(
      "div",
      { class: "choices" },
      GENDER_CHOICES.map((c) =>
        h(
          "button",
          { class: "choice", type: "button", onClick: () => opts.onPick(c.value) },
          h("span", { class: "mark" }, c.mark),
          h("span", null, h("strong", null, c.title), h("small", null, c.desc)),
        ),
      ),
    ),
    h("button", { class: "btn ghost", type: "button", onClick: opts.onBack }, "返回"),
  );
}
