/**
 * Build demo-seed.json from budgets.csv and expenses.csv.
 * Run from project root: node scripts/build-demo-seed.js
 * Output: public/demo-seed.json
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BUDGETS_CSV = path.join(ROOT, "scripts", "budgets.csv");
const EXPENSES_CSV = path.join(ROOT, "scripts", "expenses.csv");
const OUT_JSON = path.join(ROOT, "public", "demo-seed.json");

// Categories aligned with app: id, name, supercategory, user_id null.
// Needs / Wants / Misc for demo seed. Must include "Misc".
const CATEGORIES = [
  { name: "Rent", supercategory: "needs" },
  { name: "Groceries", supercategory: "needs" },
  { name: "Utilities", supercategory: "needs" },
  { name: "Insurance", supercategory: "needs" },
  { name: "Transportation", supercategory: "needs" },
  { name: "Gas", supercategory: "needs" },
  { name: "Home Maintenance", supercategory: "needs" },
  { name: "Debt Payments", supercategory: "needs" },
  { name: "Healthcare", supercategory: "needs" },
  { name: "Restaurants", supercategory: "wants" },
  { name: "Subscriptions", supercategory: "wants" },
  { name: "Entertainment", supercategory: "wants" },
  { name: "Gifts", supercategory: "wants" },
  { name: "Bars", supercategory: "wants" },
  { name: "Travel", supercategory: "wants" },
  { name: "Shopping", supercategory: "wants" },
  { name: "Misc", supercategory: "misc" },
].map((c, i) => ({
  id: `cat-demo-${i + 1}`,
  name: c.name,
  supercategory: c.supercategory,
  user_id: null,
}));

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function parseCSV(content) {
  const lines = content.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = [];
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
        values.push(current.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
        current = "";
      } else {
        current += c;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
    return values;
  });
  return { headers, rows };
}

function main() {
  const categoryByName = new Map(CATEGORIES.map((c) => [c.name.toLowerCase(), c]));
  const miscCategory = CATEGORIES.find((c) => c.name === "Misc");
  if (!miscCategory) throw new Error("Misc category required");

  const budgetsContent = fs.readFileSync(BUDGETS_CSV, "utf8");
  const expensesContent = fs.readFileSync(EXPENSES_CSV, "utf8");

  const { headers: bHeaders, rows: bRows } = parseCSV(budgetsContent);
  const monthIdx = bHeaders.findIndex((h) => h.toLowerCase() === "month");
  const yearIdx = bHeaders.findIndex((h) => h.toLowerCase() === "year");
  const incomeIdx = bHeaders.findIndex((h) => h.toLowerCase() === "income");
  if (monthIdx < 0 || yearIdx < 0 || incomeIdx < 0) {
    throw new Error("budgets.csv must have headers: month, year, income");
  }

  const budgetKey = (m, y) => `${m},${y}`;
  const budgets = [];
  const budgetIdByKey = {};
  const created_at = new Date().toISOString();

  for (const row of bRows) {
    const month = parseInt(row[monthIdx], 10);
    const year = parseInt(row[yearIdx], 10);
    const income = parseFloat(row[incomeIdx]);
    if (Number.isNaN(month) || Number.isNaN(year) || Number.isNaN(income) || income < 0) continue;
    if (month < 1 || month > 12 || year < 2000 || year > 2100) continue;
    const key = budgetKey(month, year);
    if (budgetIdByKey[key]) continue;
    const id = uuid();
    budgetIdByKey[key] = id;
    budgets.push({ id, user_id: "demo", month, year, income, created_at });
  }

  const { headers: eHeaders, rows: eRows } = parseCSV(expensesContent);
  const eMonthIdx = eHeaders.findIndex((h) => h.toLowerCase() === "month");
  const eYearIdx = eHeaders.findIndex((h) => h.toLowerCase() === "year");
  const descIdx = eHeaders.findIndex((h) => h.toLowerCase() === "description");
  const amountIdx = eHeaders.findIndex((h) => h.toLowerCase() === "amount");
  const catIdx = eHeaders.findIndex((h) => h.toLowerCase() === "category_name");
  if (eMonthIdx < 0 || eYearIdx < 0 || descIdx < 0 || amountIdx < 0 || catIdx < 0) {
    throw new Error("expenses.csv must have: month, year, description, amount, category_name");
  }

  const expenses = [];
  for (const row of eRows) {
    const month = parseInt(row[eMonthIdx], 10);
    const year = parseInt(row[eYearIdx], 10);
    const description = String(row[descIdx] ?? "").trim();
    const amount = parseFloat(String(row[amountIdx]).replace(/[$,]/g, ""));
    const categoryName = String(row[catIdx] ?? "").trim();
    if (Number.isNaN(month) || Number.isNaN(year) || !description || Number.isNaN(amount) || amount < 0) continue;
    const budgetId = budgetIdByKey[budgetKey(month, year)];
    if (!budgetId) continue;
    const cat = categoryByName.get(categoryName.toLowerCase()) || miscCategory;
    expenses.push({
      id: uuid(),
      budget_id: budgetId,
      description,
      amount,
      category_id: cat.id,
    });
  }

  const seed = { budgets, expenses, categories: CATEGORIES };
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(seed, null, 2), "utf8");
  console.log(`Wrote ${OUT_JSON} (${budgets.length} budgets, ${expenses.length} expenses, ${CATEGORIES.length} categories).`);
}

main();
