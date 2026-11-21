import type { Report } from "../engine/profile";
import { h } from "../ui/dom";
import { toast } from "../ui/toast";
import { drawPoster } from "./poster";

const isPhone = () =>
  window.matchMedia("(max-width: 900px)").matches || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (canvas.toBlob) {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("empty image"))), "image/png");
    } else {
      fetch(canvas.toDataURL("image/png")).then((r) => r.blob()).then(resolve, reject);
    }
  });
}

function canShare(file: File): boolean {
  try {
    return typeof navigator.share === "function" && !!navigator.canShare && navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = h("a", { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const isWeChat = () => /MicroMessenger/i.test(navigator.userAgent);

/**
 * Fallback for in-app browsers (e.g. WeChat): show the image for long-press saving.
 * Uses a data: URL, not a blob: URL — WeChat's native "save image" fetches the src
 * outside the page, where blob: URLs don't exist, so saving a blob: image fails.
 * JPEG keeps the data URL small.
 */
function showLongPressModal(canvas: HTMLCanvasElement): void {
  const url = canvas.toDataURL("image/jpeg", 0.92);
  const close = () => {
    modal.remove();
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
  const modal = h(
    "div",
    {
      class: "modal",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "长按保存结果图",
      onClick: (e: Event) => e.target === modal && close(),
    },
    h(
      "div",
      { class: "modal-panel" },
      h(
        "div",
        { class: "modal-head" },
        h("strong", null, "长按图片保存到相册"),
        h("button", { class: "modal-close", type: "button", "aria-label": "关闭", onClick: close }, "×"),
      ),
      isWeChat()
        ? h("p", { class: "modal-tip" }, "保存不了？点右上角「…」，选「在默认浏览器中打开」再保存。")
        : null,
      h("img", { class: "modal-img", src: url, alt: "测试结果图" }),
    ),
  );
  document.addEventListener("keydown", onKey);
  document.body.appendChild(modal);
}

export async function savePoster(report: Report): Promise<void> {
  const canvas = drawPoster(report);
  const blob = await toBlob(canvas);
  const name = `史鉴-${report.figure.name}.png`;

  if (!isPhone()) {
    download(blob, name);
    toast("结果图已下载");
    return;
  }

  const file = new File([blob], name, { type: "image/png" });
  if (canShare(file)) {
    try {
      await navigator.share({ files: [file], title: "我的历史人物测试结果" });
      return;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Share failed for another reason: fall back to long-press
    }
  }
  showLongPressModal(canvas);
}
