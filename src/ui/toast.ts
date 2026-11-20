import { h } from "./dom";

let el: HTMLElement | null = null;
let timer = 0;

export function toast(message: string, ms = 2200): void {
  if (!el) {
    el = h("div", { class: "toast", role: "status", "aria-live": "polite" });
    document.body.appendChild(el);
  }
  const node = el;
  node.textContent = message;
  node.classList.add("show");
  window.clearTimeout(timer);
  timer = window.setTimeout(() => node.classList.remove("show"), ms);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  const area = h("textarea", { readonly: true, style: "position:fixed;top:-1000px;opacity:0" });
  area.value = text;
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}
