import type { Vec } from "../data/dimensions";
import { svg } from "./dom";

export interface Series {
  values: Vec;
  stroke: string;
  fill: string;
  dashed?: boolean;
}

/** Vertex positions for a radar polygon; first axis points straight up. */
export function radarPoints(values: Vec, cx: number, cy: number, r: number): [number, number][] {
  const n = values.length;
  return values.map((v, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const k = (Math.max(0, Math.min(100, v)) / 100) * r;
    return [cx + Math.cos(a) * k, cy + Math.sin(a) * k];
  });
}

const RINGS = [25, 50, 75, 100];

export function radarSvg(labels: readonly string[], series: readonly Series[], size = 300): SVGElement {
  const c = size / 2;
  const r = size / 2 - 42;
  const full = labels.map(() => 100);
  const toPath = (pts: [number, number][]) => pts.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");

  return svg(
    "svg",
    { viewBox: `0 0 ${size} ${size}`, class: "radar", role: "img", "aria-label": "八维能力雷达图" },
    RINGS.map((ring) =>
      svg("polygon", {
        points: toPath(radarPoints(labels.map(() => ring), c, c, r)),
        fill: "none",
        stroke: "var(--line)",
        "stroke-width": 1,
      }),
    ),
    radarPoints(full, c, c, r).map(([x, y]) =>
      svg("line", { x1: c, y1: c, x2: x, y2: y, stroke: "var(--line)", "stroke-width": 1 }),
    ),
    series.map((s) =>
      svg("polygon", {
        points: toPath(radarPoints(s.values, c, c, r)),
        fill: s.fill,
        stroke: s.stroke,
        "stroke-width": 2,
        "stroke-dasharray": s.dashed ? "5 4" : null,
        "stroke-linejoin": "round",
      }),
    ),
    radarPoints(full, c, c, r + 20).map(([x, y], i) =>
      svg(
        "text",
        {
          x,
          y: y + 5,
          "text-anchor": Math.abs(x - c) < 4 ? "middle" : x > c ? "start" : "end",
          class: "radar-label",
        },
        labels[i],
      ),
    ),
  );
}

/** Same chart drawn onto a canvas, used for the exported poster. */
export function drawRadar(
  ctx: CanvasRenderingContext2D,
  labels: readonly string[],
  series: readonly Series[],
  cx: number,
  cy: number,
  r: number,
  colors: { line: string; label: string },
  font: string,
): void {
  const poly = (pts: [number, number][]) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
  };
  ctx.save();
  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 2;
  RINGS.forEach((ring) => {
    poly(radarPoints(labels.map(() => ring), cx, cy, r));
    ctx.stroke();
  });
  radarPoints(labels.map(() => 100), cx, cy, r).forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();
  });
  series.forEach((s) => {
    poly(radarPoints(s.values, cx, cy, r));
    ctx.fillStyle = s.fill;
    ctx.fill();
    ctx.setLineDash(s.dashed ? [12, 9] : []);
    ctx.strokeStyle = s.stroke;
    ctx.lineWidth = 4;
    ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.fillStyle = colors.label;
  ctx.font = font;
  ctx.textBaseline = "middle";
  radarPoints(labels.map(() => 100), cx, cy, r + 46).forEach(([x, y], i) => {
    ctx.textAlign = Math.abs(x - cx) < 6 ? "center" : x > cx ? "left" : "right";
    ctx.fillText(labels[i], x, y);
  });
  ctx.restore();
}
