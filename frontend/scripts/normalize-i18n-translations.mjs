/**
 * One-off / maintenance: parse translation TS files and rewrite with
 * identical formatting (no comments, stable key order from en-US).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRANSLATIONS_DIR = path.join(__dirname, "../src/i18n/translations");

/** @returns {[string, number]} [decoded, index after closing quote] */
function parseQuotedString(s, start) {
  if (s[start] !== '"') {
    throw new Error(`Expected opening quote at ${start}`);
  }
  let out = "";
  let i = start + 1;
  while (i < s.length) {
    const c = s[i];
    if (c === "\\") {
      i++;
      if (i >= s.length) throw new Error("Unterminated escape");
      const e = s[i];
      switch (e) {
        case "n":
          out += "\n";
          break;
        case "t":
          out += "\t";
          break;
        case "r":
          out += "\r";
          break;
        case '"':
          out += '"';
          break;
        case "\\":
          out += "\\";
          break;
        default:
          out += e;
      }
      i++;
      continue;
    }
    if (c === '"') {
      return [out, i + 1];
    }
    out += c;
    i++;
  }
  throw new Error("Unterminated string");
}

/** @returns {{ order: string[], map: Map<string, string> }} */
function parseTranslationFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split("\n");
  const order = [];
  const map = new Map();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "};") continue;
    if (trimmed.startsWith("//")) continue;
    if (trimmed.startsWith("export default")) continue;

    const lead = line.match(/^\s*/)[0];
    if (!trimmed.startsWith('"')) {
      throw new Error(`Unexpected line in ${filePath}: ${line}`);
    }

    let keyPos = lead.length;
    const [key, afterKey] = parseQuotedString(line, keyPos);
    let j = afterKey;
    while (j < line.length && /\s/.test(line[j])) j++;
    if (line[j] !== ":") {
      throw new Error(`Expected colon after key in ${filePath}: ${line}`);
    }
    j++;
    while (j < line.length && /\s/.test(line[j])) j++;
    let [value, vpos] = parseQuotedString(line, j);
    while (true) {
      while (vpos < line.length && /\s/.test(line[vpos])) vpos++;
      if (line[vpos] === "+") {
        vpos++;
        while (vpos < line.length && /\s/.test(line[vpos])) vpos++;
        const [part, nextPos] = parseQuotedString(line, vpos);
        value += part;
        vpos = nextPos;
        continue;
      }
      break;
    }
    const rest = line.slice(vpos).trim();
    if (rest !== "," && rest !== "") {
      throw new Error(`Trailing junk in ${filePath}: ${line} -> "${rest}"`);
    }
    order.push(key);
    map.set(key, value);
  }

  return { order, map };
}

function formatFile(order, map) {
  const lines = order.map(
    (k) => `  ${JSON.stringify(k)}: ${JSON.stringify(map.get(k))},`,
  );
  return `export default {\n${lines.join("\n")}\n};\n`;
}

const locales = ["en-US", "de-DE", "es-ES", "fr-FR", "it-IT"];
const base = parseTranslationFile(path.join(TRANSLATIONS_DIR, "en-US.ts"));
const baseOrder = base.order;

for (const loc of locales) {
  const p = path.join(TRANSLATIONS_DIR, `${loc}.ts`);
  const { order, map } = parseTranslationFile(p);
  const missing = baseOrder.filter((k) => !map.has(k));
  const extra = order.filter((k) => !base.map.has(k));
  if (missing.length) {
    console.error(`${loc}: missing keys vs en-US:`, missing);
    process.exit(1);
  }
  if (extra.length) {
    console.error(`${loc}: extra keys vs en-US:`, extra);
    process.exit(1);
  }
}

for (const loc of locales) {
  const p = path.join(TRANSLATIONS_DIR, `${loc}.ts`);
  const { map } = parseTranslationFile(p);
  const out = formatFile(baseOrder, map);
  fs.writeFileSync(p, out, "utf8");
  console.log("wrote", p, `(${baseOrder.length} keys)`);
}
