/**
 * Rule-based categorizer: keyword → category name.
 * Returns category name (e.g. "Restaurants", "Misc"). No DB; caller resolves to id.
 * Keep interface minimal so it can be swapped (e.g. AI) later.
 * Rules live in categorization-rules.json; add keywords as comma-separated strings in each "keywords" array.
 */

import rulesData from "./categorization-rules.json";

type Rule = { categoryName: string; keywords: string[] };
const RULES: Rule[] = rulesData as Rule[];

/**
 * Returns category name for the given expense description, or "Misc" if no rule matches.
 * Matching is case-insensitive; description is trimmed.
 */
export function categorizeByDescription(description: string): string {
  const normalized = description.trim().toLowerCase();
  if (!normalized) return "Misc";

  for (const { keywords, categoryName } of RULES) {
    if (keywords.some((k) => normalized.includes(k))) return categoryName;
  }
  return "Misc";
}
