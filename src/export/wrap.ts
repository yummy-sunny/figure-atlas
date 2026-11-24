// Characters that must not start a line (closing punctuation) or end one (opening punctuation).
const NO_LINE_START = new Set(Array.from("，。、；：！？）」』”’》〉】…—,.;:!?)"));
const NO_LINE_END = new Set(Array.from("（「『“‘《〈【("));

/**
 * Break text into lines no wider than maxW, character by character (Chinese has no spaces),
 * following basic kinsoku rules: a closing mark never starts a line and an opening mark never
 * ends one. When a break would violate that, the previous character moves down with it.
 */
export function wrapText(text: string, maxW: number, measure: (s: string) => number): string[] {
  const rows: string[] = [];
  let line: string[] = [];
  for (const ch of Array.from(text)) {
    if (line.length && measure(line.join("") + ch) > maxW) {
      const carry: string[] = [];
      if (NO_LINE_START.has(ch) && line.length > 1) carry.unshift(line.pop() as string);
      while (line.length > 1 && NO_LINE_END.has(line[line.length - 1])) carry.unshift(line.pop() as string);
      rows.push(line.join(""));
      line = [...carry, ch];
    } else {
      line.push(ch);
    }
  }
  if (line.length) rows.push(line.join(""));
  return rows;
}
