import "./styles/main.css";
import { FIGURES } from "./data/figures";
import { QUESTIONS, QUIZ_LENGTH } from "./data/questions";
import { filterByGender, rankFigures, type GenderPref } from "./engine/matching";
import { buildReport } from "./engine/profile";
import { pickQuestions } from "./engine/quiz";
import { scoreAnswers, type Pick } from "./engine/scoring";
import { decodeResult, encodeResult, type SharedResult } from "./engine/share";
import { savePoster } from "./export/save";
import { clear } from "./ui/dom";
import { renderIntro, renderPreference } from "./ui/intro";
import { renderQuiz } from "./ui/quiz";
import { renderResult } from "./ui/result";
import { copyText, toast } from "./ui/toast";

const OWN_KEY = "figure-atlas:own-result";
const app = document.getElementById("app") as HTMLElement;

function mount(node: HTMLElement): void {
  clear(app);
  app.appendChild(node);
  window.scrollTo(0, 0);
}

// Opened straight from disk (double-clicked .html): links are not shareable
const IS_LOCAL_FILE = window.location.protocol === "file:";

function setResultParam(code: string | null): void {
  if (IS_LOCAL_FILE) return;
  try {
    const url = new URL(window.location.href);
    if (code) url.searchParams.set("r", code);
    else url.searchParams.delete("r");
    window.history.replaceState(null, "", url.toString());
  } catch {
    // Some WebViews reject history updates; the result still renders
  }
}

function goIntro(): void {
  setResultParam(null);
  mount(renderIntro({ onStart: goPreference }));
}

function goPreference(): void {
  mount(renderPreference({ onBack: goIntro, onPick: startQuiz }));
}

function startQuiz(gender: GenderPref): void {
  mount(
    renderQuiz({
      questions: pickQuestions(QUESTIONS, QUIZ_LENGTH),
      onExit: goPreference,
      onComplete: (picks) => finish(gender, picks),
    }),
  );
}

function finish(gender: GenderPref, picks: Pick[]): void {
  const shared: SharedResult = { gender, scores: scoreAnswers(picks) };
  const code = encodeResult(shared);
  try {
    sessionStorage.setItem(OWN_KEY, code);
  } catch {
    // ignore storage failures
  }
  setResultParam(code);
  showResult(shared, true);
}

function showResult(shared: SharedResult, own: boolean): void {
  const ranked = rankFigures(shared.scores, filterByGender(FIGURES, shared.gender));
  const report = buildReport(shared.scores, ranked);
  let saving = false;

  mount(
    renderResult(report, {
      own,
      onSave: async () => {
        if (saving) return;
        saving = true;
        toast("正在生成结果图…");
        try {
          await savePoster(report);
        } catch (err) {
          console.error(err);
          toast("图片生成失败，请刷新后重试");
        } finally {
          saving = false;
        }
      },
      onCopyLink: IS_LOCAL_FILE ? null : async () => {
        toast((await copyText(window.location.href)) ? "链接已复制，发给朋友看看吧" : "复制失败，请手动复制地址栏链接");
      },
      onRestart: goIntro,
    }),
  );
}

function boot(): void {
  const code = new URLSearchParams(window.location.search).get("r");
  const shared = decodeResult(code);
  if (!shared) return goIntro();
  let own = false;
  try {
    own = sessionStorage.getItem(OWN_KEY) === code;
  } catch {
    own = false;
  }
  showResult(shared, own);
}

boot();
