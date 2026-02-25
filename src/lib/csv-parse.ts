/**
 * CSV parsing for expense import. In-memory only; handles quoted fields and commas inside quotes.
 */

export type ParseResult = {
  headers: string[];
  rows: string[][];
};

/**
 * Parse a CSV string into headers (first row) and data rows.
 * Handles quoted fields; commas inside double quotes are not treated as delimiters.
 */
export function parseCSV(csvText: string): ParseResult {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      current += c;
    } else if (inQuotes) {
      current += c;
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && csvText[i + 1] === "\n") i++;
      lines.push(current);
      current = "";
    } else {
      current += c;
    }
  }
  if (current) lines.push(current);

  const rows = lines.map((line) => parseCSVLine(line));
  if (rows.length === 0) return { headers: [], rows: [] };
  const [first, ...rest] = rows;
  return { headers: first ?? [], rows: rest };
}

function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      current += c;
    } else if (inQuotes) {
      current += c;
    } else if (c === ",") {
      out.push(unquote(current));
      current = "";
    } else {
      current += c;
    }
  }
  out.push(unquote(current));
  return out;
}

function unquote(field: string): string {
  const trimmed = field.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/""/g, '"').trim();
  }
  return trimmed;
}

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

/**
 * Parse amount string: strip $ and commas, trim; return number or null if invalid.
 * Negative or non-numeric yields null (amount must be >= 0).
 */
export function parseAmount(raw: string): number | null {
  const s = String(raw).trim().replace(/\$/g, "").replace(/,/g, "");
  if (!s) return null;
  const n = parseFloat(s);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

/** Three-letter month codes (Jan, Feb, ... Dec) case-insensitive. Returns 1-12 or null. */
const MONTH_CODES = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

export function parseMonthCode(raw: string): number | null {
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  const idx = MONTH_CODES.indexOf(s);
  if (idx === -1) return null;
  return idx + 1;
}

/**
 * Parse year string: 4-digit integer in [MIN_YEAR, MAX_YEAR]. Returns null if invalid.
 */
export function parseYear(raw: string): number | null {
  const s = String(raw).trim();
  if (!/^\d{4}$/.test(s)) return null;
  const n = parseInt(s, 10);
  if (n < MIN_YEAR || n > MAX_YEAR) return null;
  return n;
}
