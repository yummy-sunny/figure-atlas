import { DIMENSIONS, DIM_IDS } from "../data/dimensions";
import { archetypeLine, type Report } from "../engine/profile";
import { drawRadar } from "../ui/radar";
import { SERIF, THEME } from "../ui/theme";
import { wrapText } from "./wrap";

const W = 1080;
const M = 72;
const INNER = W - M * 2;

/**
 * Draw the shareable result poster. Layout runs twice: a measuring pass to
 * find the total height, then a painting pass on a correctly sized canvas.
 */
export function drawPoster(report: Report): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not supported");
  const c = ctx;
  const font = (size: number, weight = 400) => `${weight} ${size}px ${SERIF}`;

  const wrap = (text: string, maxW: number, size: number, weight = 400): string[] => {
    c.font = font(size, weight);
    return wrapText(text, maxW, (s) => c.measureText(s).width);
  };

  const layout = (paint: boolean): number => {
    const text = (s: string, x: number, y: number, size: number, color: string, weight = 400, align: CanvasTextAlign = "left") => {
      if (!paint) return;
      c.font = font(size, weight);
      c.fillStyle = color;
      c.textAlign = align;
      c.textBaseline = "top";
      c.fillText(s, x, y);
    };
    const para = (s: string, x: number, y: number, maxW: number, size: number, lh: number, color: string, align: CanvasTextAlign = "left") => {
      const rows = wrap(s, maxW, size);
      rows.forEach((row, i) => text(row, x, y + i * lh, size, color, 400, align));
      return y + rows.length * lh;
    };
    const rule = (y: number) => {
      if (!paint) return;
      c.fillStyle = THEME.line;
      c.fillRect(M, y, INNER, 2);
    };
    const heading = (s: string, y: number) => {
      text(s, M, y, 34, THEME.ink, 700);
      if (paint) {
        c.fillStyle = THEME.seal;
        c.fillRect(M, y + 50, 48, 4);
      }
      return y + 76;
    };

    const { figure } = report;
    let y = M + 20;

    text("FIGURE ATLAS · 历史人物原型测试", W / 2, y, 24, THEME.muted, 400, "center");
    y += 64;
    text("与你最相似的历史人物", W / 2, y, 32, THEME.inkSoft, 400, "center");
    y += 70;
    text(figure.name, W / 2, y, 112, THEME.ink, 900, "center");
    y += 140;
    text(`${figure.era} · ${figure.role}${figure.legendary ? "（传说人物）" : ""}`, W / 2, y, 30, THEME.muted, 400, "center");
    y += 64;

    // Seal-style similarity stamp
    const stamp = `轮廓相似度 ${report.percent}%`;
    c.font = font(34, 700);
    const sw = c.measureText(stamp).width + 64;
    if (paint) {
      c.fillStyle = THEME.seal;
      c.fillRect((W - sw) / 2, y, sw, 70);
    }
    text(stamp, W / 2, y + 17, 34, "#FFFFFF", 700, "center");
    y += 104;
    text(`你的原型：${archetypeLine(report)}`, W / 2, y, 30, THEME.inkSoft, 400, "center");
    y += 72;

    // Radar
    const radius = 250;
    const cy = y + radius + 60;
    if (paint) {
      drawRadar(
        c,
        DIM_IDS.map((d) => DIMENSIONS[d].name),
        [
          { values: figure.vec, stroke: THEME.gold, fill: THEME.goldFill, dashed: true },
          { values: report.scores, stroke: THEME.seal, fill: THEME.sealFill },
        ],
        W / 2,
        cy,
        radius,
        { line: THEME.line, label: THEME.inkSoft },
        font(28, 600),
      );
    }
    y = cy + radius + 90;
    text(`实线：你　　虚线：${figure.name}`, W / 2, y, 24, THEME.muted, 400, "center");
    y += 64;

    // Quote
    rule(y);
    y += 40;
    text(`如果${figure.name}在场，可能会对你说`, W / 2, y, 26, THEME.muted, 400, "center");
    y += 52;
    y = para(`“${figure.says}”`, W / 2, y, INNER - 80, 38, 58, THEME.ink, "center");
    y += 36;
    rule(y);
    y += 52;

    y = heading("生平简介", y);
    y = para(figure.bio, M, y, INNER, 28, 48, THEME.inkSoft) + 44;

    y = heading("共同底色", y);
    report.common.forEach((d) => {
      text(DIMENSIONS[d].name, M, y, 28, THEME.seal, 700);
      y = para(DIMENSIONS[d].strength, M + 90, y, INNER - 90, 28, 46, THEME.inkSoft) + 14;
    });
    y += 30;

    const top = DIMENSIONS[report.top];
    y = heading(`给${top.archetype}的建议`, y);
    y = para(top.advice, M, y, INNER, 28, 48, THEME.inkSoft) + 56;

    rule(y);
    y += 36;
    text("史鉴 · 仅供趣味性自我探索", W / 2, y, 22, THEME.muted, 400, "center");
    return y + 40 + M;
  };

  const height = Math.ceil(layout(false));
  canvas.width = W;
  canvas.height = height;
  c.fillStyle = THEME.paper;
  c.fillRect(0, 0, W, height);
  c.strokeStyle = THEME.line;
  c.lineWidth = 3;
  c.strokeRect(28, 28, W - 56, height - 56);
  c.lineWidth = 1;
  c.strokeRect(40, 40, W - 80, height - 80);
  layout(true);
  return canvas;
}
