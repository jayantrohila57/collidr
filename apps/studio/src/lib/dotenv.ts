/** Minimal dotenv parser/serializer for paste-to-import and "Copy as .env". */

export type DotenvEntry = { key: string; value: string };

const KEY_RE = /^[A-Za-z_][A-Za-z0-9_.-]*$/;

export function parseDotenv(text: string): {
  entries: DotenvEntry[];
  invalidLines: number[];
} {
  const out = new Map<string, string>();
  const invalidLines: number[] = [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]?.trim() ?? "";
    if (!line || line.startsWith("#")) continue;
    if (line.startsWith("export ")) line = line.slice(7).trim();
    const eq = line.indexOf("=");
    if (eq <= 0) {
      invalidLines.push(i + 1);
      continue;
    }
    const key = line.slice(0, eq).trim();
    if (!KEY_RE.test(key)) {
      invalidLines.push(i + 1);
      continue;
    }
    let value = line.slice(eq + 1).trim();
    const q = value[0];
    if ((q === '"' || q === "'") && value.length >= 1) {
      // Multi-line quoted value
      let body = value.slice(1);
      while (!body.endsWith(q) && i + 1 < lines.length) {
        i += 1;
        body += `\n${lines[i]}`;
      }
      value = body.endsWith(q) ? body.slice(0, -1) : body;
      if (q === '"') {
        value = value
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\");
      }
    } else {
      const hash = value.search(/\s#/);
      if (hash >= 0) value = value.slice(0, hash).trim();
    }
    out.set(key, value);
  }
  return {
    entries: [...out].map(([key, value]) => ({ key, value })),
    invalidLines,
  };
}

/** True when pasted text looks like a dotenv block (≥1 KEY=value line). */
export function looksLikeDotenv(text: string): boolean {
  return parseDotenv(text).entries.length > 0 && /^\s*(export\s+)?[A-Za-z_][A-Za-z0-9_.-]*\s*=/m.test(text);
}
