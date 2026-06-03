import React from "react";

// Onyx answers carry inline [n] markers paired with citation_info packets.
// Render each [n] as a .cite chip; plain text otherwise.
export function renderWithCitations(
  text: string,
  onCite?: (n: number) => void
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = /\[(\d+)\]/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const n = parseInt(m[1], 10);
    nodes.push(
      <span
        key={`cite-${key++}`}
        className="cite"
        onClick={onCite ? () => onCite(n) : undefined}
      >
        {n}
      </span>
    );
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
