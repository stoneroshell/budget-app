/**
 * Rule-based categorizer: keyword → category name.
 * Returns category name (e.g. "Restaurants", "Misc"). No DB; caller resolves to id.
 * Keep interface minimal so it can be swapped (e.g. AI) later.
 */

const RULES: { keywords: string[]; categoryName: string }[] = [
  { keywords: ["rent", "landlord", "lease"], categoryName: "Rent" },
  { keywords: ["grocery", "groceries", "safeway", "kroger", "trader joe", "whole foods", "aldi", "costco", "walmart"], categoryName: "Groceries" },
  { keywords: ["electric", "water", "gas bill", "internet", "utility", "utilities", "pge", "comcast", "xfinity"], categoryName: "Utilities" },
  { keywords: ["insurance"], categoryName: "Insurance" },
  { keywords: ["uber", "lyft", "transit", "metro", "bus ", "train", "transportation"], categoryName: "Transportation" },
  { keywords: ["shell", "chevron", "exxon", "mobil", "gas station", " arco ", " 76 "], categoryName: "Gas" },
  { keywords: ["chipotle", "restaurant", "mcdonald", "starbucks", "dining", "doordash", "grubhub", "ubereats"], categoryName: "Restaurants" },
  { keywords: ["netflix", "spotify", "hulu", "disney+", "subscription", "subscriptions", "patreon", "onlyfans"], categoryName: "Subscriptions" },
  { keywords: ["movie", "cinema", "game", "steam", "playstation", "xbox", "hobby", "entertainment", "concert", "amusement"], categoryName: "Entertainment" },
];

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
