export type Child = Node | string | number | null | undefined | false | Child[];
type Props = Record<string, unknown>;

const SVG_NS = "http://www.w3.org/2000/svg";

function applyProps(el: Element, props?: Props | null): void {
  if (!props) return;
  Object.keys(props).forEach((key) => {
    const value = props[key];
    if (value === null || value === undefined || value === false) return;
    if (key.slice(0, 2) === "on" && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    } else {
      el.setAttribute(key, value === true ? "" : String(value));
    }
  });
}

export function appendChildren(el: Node, children: Child[]): void {
  children.forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) appendChildren(el, child);
    else if (typeof child === "string" || typeof child === "number") el.appendChild(document.createTextNode(String(child)));
    else el.appendChild(child);
  });
}

/** Tiny hyperscript helper: h("div", { class: "x", onClick: fn }, "text", child) */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Props | null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  applyProps(el, props);
  appendChildren(el, children);
  return el;
}

export function svg(tag: string, props?: Props | null, ...children: Child[]): SVGElement {
  const el = document.createElementNS(SVG_NS, tag) as SVGElement;
  applyProps(el, props);
  appendChildren(el, children);
  return el;
}

export function clear(el: Node): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}
