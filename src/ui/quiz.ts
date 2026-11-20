import type { Question } from "../data/questions";
import type { Pick } from "../engine/scoring";
import { clear, h } from "./dom";

const ADVANCE_DELAY = 380;
const LETTERS = "ABCD";

export function renderQuiz(opts: {
  questions: Question[];
  onExit: () => void;
  onComplete: (picks: Pick[]) => void;
}): HTMLElement {
  const { questions } = opts;
  const answers: (number | null)[] = questions.map(() => null);
  let index = 0;
  let timer = 0;

  const count = h("span", { class: "count" });
  const bar = h("i", { class: "bar" });
  const scene = h("p", { class: "scene" });
  const text = h("h2", { class: "q-text" });
  const list = h("div", { class: "choices", role: "radiogroup" });
  const source = h("p", { class: "source" });
  const prev = h("button", { class: "nav-btn", type: "button" }, "上一题");
  const next = h("button", { class: "nav-btn", type: "button" });

  const root = h(
    "section",
    { class: "quiz" },
    h("header", { class: "progress" }, count, h("span", { class: "track" }, bar)),
    h("article", { class: "card q-card" }, scene, text, list, source, h("nav", { class: "q-nav" }, prev, next)),
  );

  function finish(): void {
    opts.onComplete(questions.map((question, i) => ({ question, optionIndex: answers[i] as number })));
  }

  function go(delta: number): void {
    window.clearTimeout(timer);
    const target = index + delta;
    if (target < 0) return opts.onExit();
    if (target >= questions.length) return finish();
    index = target;
    render();
  }

  function choose(i: number): void {
    answers[index] = i;
    render();
    window.clearTimeout(timer);
    timer = window.setTimeout(() => go(1), ADVANCE_DELAY);
  }

  function render(): void {
    const q = questions[index];
    const n = index + 1;
    count.textContent = `${n} / ${questions.length}`;
    bar.style.width = `${(n / questions.length) * 100}%`;
    scene.textContent = q.scene;
    text.textContent = q.text;
    source.textContent = q.source ? `情境取材：${q.source}` : "";
    clear(list);
    q.options.forEach((o, i) => {
      const selected = answers[index] === i;
      list.appendChild(
        h(
          "button",
          {
            class: selected ? "choice answer selected" : "choice answer",
            type: "button",
            role: "radio",
            "aria-checked": selected ? "true" : "false",
            onClick: () => choose(i),
          },
          h("span", { class: "letter" }, LETTERS[i]),
          h("span", null, o.text),
        ),
      );
    });
    prev.textContent = index === 0 ? "返回" : "上一题";
    next.textContent = index === questions.length - 1 ? "查看结果" : "下一题";
    next.disabled = answers[index] === null;
  }

  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));

  // Keyboard: 1-4 / A-D to answer, arrows to move
  const onKey = (e: KeyboardEvent) => {
    if (!root.isConnected) return document.removeEventListener("keydown", onKey);
    const k = e.key.toUpperCase();
    const i = "1234".indexOf(k) >= 0 ? "1234".indexOf(k) : LETTERS.indexOf(k);
    if (i >= 0 && k.length === 1) choose(i);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight" && answers[index] !== null) go(1);
  };
  document.addEventListener("keydown", onKey);

  render();
  return root;
}
