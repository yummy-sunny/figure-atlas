import { DIMENSIONS, DIM_IDS } from "../data/dimensions";
import { archetypeLine, type Report } from "../engine/profile";
import { h } from "./dom";
import { radarSvg } from "./radar";
import { THEME } from "./theme";

export interface ResultActions {
  own: boolean;
  onSave: () => void;
  /** null when sharing links is impossible (opened as a local file) */
  onCopyLink: (() => void) | null;
  onRestart: () => void;
}

const section = (no: string, title: string, ...body: Parameters<typeof h>[2][]) =>
  h("section", { class: "card report" }, h("h3", { class: "section-title" }, h("span", null, no), title), ...body);

export function renderResult(report: Report, actions: ResultActions): HTMLElement {
  const { figure } = report;
  const labels = DIM_IDS.map((d) => DIMENSIONS[d].name);
  const top = DIMENSIONS[report.top];
  const lowest = DIMENSIONS[report.lowest];

  return h(
    "div",
    { class: "result" },
    !actions.own &&
      h("p", { class: "banner" }, "这是一份朋友分享的测试结果。想知道你自己像谁？点页面底部开始测试。"),

    h(
      "section",
      { class: "card hero" },
      h("p", { class: "kicker" }, "与你最相似的历史人物"),
      h("div", { class: "name-seal", "aria-hidden": "true" }, figure.name.slice(0, 1)),
      h("h1", { class: "figure-name" }, figure.name),
      h("p", { class: "figure-meta" }, `${figure.era} · ${figure.role}`),
      figure.legendary && h("p", { class: "legend-note" }, "※ 传说或文学人物"),
      h("p", { class: "percent" }, h("b", null, `${report.percent}%`), " 轮廓相似度"),
      h("p", { class: "chip" }, `你的原型：${archetypeLine(report)}`),
      h(
        "blockquote",
        { class: "says" },
        h("span", null, `如果${figure.name}在场，可能会对你说`),
        `“${figure.says}”`,
      ),
    ),

    section("一", "生平简介", h("p", { class: "body" }, figure.bio)),

    section(
      "二",
      "八维轮廓",
      h(
        "div",
        { class: "radar-wrap" },
        radarSvg(labels, [
          { values: figure.vec, stroke: THEME.gold, fill: THEME.goldFill, dashed: true },
          { values: report.scores, stroke: THEME.seal, fill: THEME.sealFill },
        ]),
        h(
          "p",
          { class: "legend" },
          h("i", { class: "dot you" }),
          "你",
          h("i", { class: "dot fig" }),
          figure.name,
        ),
      ),
      h(
        "div",
        { class: "bars" },
        DIM_IDS.map((d, i) =>
          h(
            "div",
            { class: "bar-row" },
            h("span", null, DIMENSIONS[d].name),
            h("span", { class: "bar-track" }, h("i", { style: `width:${report.scores[i]}%` })),
            h("b", null, String(report.scores[i])),
          ),
        ),
      ),
    ),

    section(
      "三",
      `你与${figure.name}的共同底色`,
      h(
        "div",
        { class: "grid3" },
        report.common.map((d) =>
          h("div", { class: "note" }, h("b", null, DIMENSIONS[d].name), DIMENSIONS[d].strength),
        ),
      ),
    ),

    section(
      "四",
      `你的原型 · ${top.archetype}`,
      h("p", { class: "motto" }, top.motto),
      h("p", { class: "body" }, top.portrait),
      h("p", { class: "body muted" }, top.reality),
    ),

    section(
      "五",
      "盲点与建议",
      h(
        "div",
        { class: "grid3" },
        h("div", { class: "note" }, h("b", null, "可能的盲点"), top.blind),
        h("div", { class: "note" }, h("b", null, "给你的建议"), top.advice),
        h("div", { class: "note" }, h("b", null, `可以补强 · ${lowest.name}`), lowest.grow),
      ),
    ),

    section(
      "六",
      "与你相近的其他人物",
      h(
        "div",
        { class: "others" },
        report.others.map((m) =>
          h(
            "div",
            { class: "other" },
            h("strong", null, m.figure.name),
            h("small", null, `${m.figure.era} · ${m.figure.role}`),
            h("b", null, `${m.percent}%`),
          ),
        ),
      ),
    ),

    h(
      "div",
      { class: "actions" },
      h("button", { class: "btn primary", type: "button", onClick: actions.onSave }, "保存结果图"),
      actions.onCopyLink &&
        h("button", { class: "btn ghost", type: "button", onClick: actions.onCopyLink }, "复制分享链接"),
      h(
        "button",
        { class: actions.own ? "btn ghost" : "btn primary", type: "button", onClick: actions.onRestart },
        actions.own ? "重新测试" : "我也来测一测",
      ),
    ),
    h("p", { class: "fine" }, "本测试仅供趣味性自我探索，不构成心理测评，也不代表对历史人物的评价。"),
  );
}
