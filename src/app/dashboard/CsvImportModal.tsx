"use client";

import { useState, useCallback } from "react";
import {
  parseCSV,
  parseAmount,
  parseMonthCode,
  parseYear,
  type ParseResult,
} from "@/lib/csv-parse";
import { categorizeByDescription } from "@/lib/categorization";
import { formatCurrency } from "@/lib/helpers";
import { importExpensesFromCsv } from "@/app/actions/imports";
import type { Category } from "@/types/database";

const NOT_IN_FILE = "__not_in_file__";
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => currentYear - 5 + i);

const CSV_HELP = (
  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-left text-sm text-charcoal-200">
    <ul className="list-inside list-disc space-y-1.5">
      <li>
        <strong className="text-charcoal-100">Amount</strong> — dollar value. Must be 0 or more.</li>
      <li>
        <strong className="text-charcoal-100">Description</strong> — short text for the expense. Cannot be empty.</li>
      <li>
        <strong className="text-charcoal-100">Month</strong> — three-letter code: (case doesn&apos;t matter).</li>
      <li>
        <strong className="text-charcoal-100">Year</strong> (optional) — 4-digit year. If omitted, choose a default year in the app.</li>
    </ul>
    <ul className="list-inside list-disc space-y-1.5">
      <li>Column order doesn&apos;t matter — you map each column during import.</li>
      <li>One row = one expense. You can mix months in the same file.</li>
      <li>Rows with invalid data or no budget for that month are skipped.</li>
    </ul>
  </div>
);

type BudgetSummary = { id: string; month: number; year: number };

type PreviewRow = {
  month: number;
  year: number;
  description: string;
  amount: number;
  categoryName: string;
  categoryId: string | null;
  error?: string;
};

type Step = "file" | "mapping" | "preview" | "done";

type CsvImportModalProps = {
  categories: Category[];
  budgets: BudgetSummary[];
  onClose: () => void;
  onSuccess?: () => void;
};

function getCell(row: string[], colIndex: number): string {
  return row[colIndex]?.trim() ?? "";
}

export function CsvImportModal({
  categories,
  budgets,
  onClose,
  onSuccess,
}: CsvImportModalProps) {
  const [step, setStep] = useState<Step>("file");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [filename, setFilename] = useState<string>("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [amountColIndex, setAmountColIndex] = useState<number>(0);
  const [descriptionColIndex, setDescriptionColIndex] = useState<number>(1);
  const [monthColIndex, setMonthColIndex] = useState<number>(2);
  const [yearColIndex, setYearColIndex] = useState<number | null>(null);
  const [defaultYear, setDefaultYear] = useState<number>(currentYear);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const budgetSet = new Set(
    budgets.map((b) => `${b.month},${b.year}`)
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;
      setFilename(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? "");
        const result = parseCSV(text);
        if (result.rows.length === 0 && result.headers.length === 0) {
          setError("File is empty or could not be parsed.");
          setParseResult(null);
          return;
        }
        setParseResult(result);
        setStep("mapping");
      };
      reader.readAsText(file, "UTF-8");
    },
    []
  );

  const columnOptions = parseResult
    ? parseResult.headers.length > 0
      ? parseResult.headers.map((h, i) => ({ value: i, label: h || `Column ${i}` }))
      : parseResult.rows[0]
        ? parseResult.rows[0].map((_, i) => ({ value: i, label: `Column ${i}` }))
        : []
    : [];

  const buildPreviewRows = useCallback((): PreviewRow[] => {
    if (!parseResult || parseResult.rows.length === 0) return [];
    const rows: PreviewRow[] = [];
    for (const row of parseResult.rows) {
      const amountRaw = getCell(row, amountColIndex);
      const descriptionRaw = getCell(row, descriptionColIndex);
      const monthRaw = getCell(row, monthColIndex);
      const yearRaw =
        yearColIndex !== null ? getCell(row, yearColIndex) : String(defaultYear);

      const amount = parseAmount(amountRaw);
      const month = parseMonthCode(monthRaw);
      const year = parseYear(yearRaw) ?? (yearColIndex === null ? defaultYear : null);

      let error: string | undefined;
      if (!descriptionRaw) error = "Missing description";
      else if (amount === null) error = "Invalid amount";
      else if (month === null) error = "Invalid month";
      else if (year === null) error = "Invalid year";
      else if (!budgetSet.has(`${month},${year}`))
        error = "No budget for this month";

      const categoryName =
        descriptionRaw && !error
          ? categorizeByDescription(descriptionRaw)
          : "Misc";
      const category = categories.find(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase()
      );
      const categoryId = category?.id ?? categories.find((c) => c.name === "Misc")?.id ?? null;

      rows.push({
        month: month ?? 0,
        year: year ?? 0,
        description: descriptionRaw,
        amount: amount ?? 0,
        categoryName,
        categoryId,
        error,
      });
    }
    return rows;
  }, [
    parseResult,
    amountColIndex,
    descriptionColIndex,
    monthColIndex,
    yearColIndex,
    defaultYear,
    budgetSet,
    categories,
  ]);

  const previewRows = step === "preview" || step === "done" ? buildPreviewRows() : [];
  const validRows = previewRows.filter((r) => !r.error && r.categoryId);
  const skippedErrors = previewRows.filter((r) => r.error).length;
  const skippedNoBudget = previewRows.filter(
    (r) => r.error === "No budget for this month"
  ).length;

  const handleGoToPreview = () => {
    setError(null);
    setStep("preview");
  };

  const handleImport = async () => {
    if (validRows.length === 0) {
      setError("No valid rows to import.");
      return;
    }
    setError(null);
    setPending(true);
    const payload = validRows.map((r) => ({
      month: r.month,
      year: r.year,
      description: r.description,
      amount: r.amount,
      category_id: r.categoryId,
    }));
    const result = await importExpensesFromCsv(payload, filename || undefined);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    const msg = [
      `Imported ${result.imported ?? 0} expense(s).`,
      result.skippedNoBudget
        ? ` ${result.skippedNoBudget} row(s) skipped (no budget for that month).`
        : "",
    ].join("");
    setResultMessage(msg);
    setStep("done");
    onSuccess?.();
  };

  const modalContent = (
    <div className="rounded-2xl border border-charcoal-500 bg-charcoal-900 p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 id="import-csv-title" className="font-display text-xl font-light text-white tracking-tight">
            Import CSV
          </h2>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-accent-violet-500 bg-transparent text-accent-violet-500 transition-colors hover:bg-accent-violet-500 hover:text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-accent-violet-500"
              aria-label="CSV format help"
              aria-expanded={showHelp}
            >
              ?
            </button>
            {showHelp && (
              <div
                className="absolute left-0 top-full z-10 mt-2 min-w-[420px] max-w-lg rounded-xl border border-charcoal-500 bg-charcoal-900 p-4 shadow-xl"
                role="region"
                aria-label="CSV format instructions"
              >
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-charcoal-400">
                  CSV format
                </p>
                {CSV_HELP}
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-lg border border-charcoal-500 bg-charcoal-800 text-charcoal-300 transition-colors hover:border-charcoal-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-violet-500"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-accent-rose-400" role="alert">
          {error}
        </p>
      )}

      {step === "file" && (
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-charcoal-400">
            Choose file
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-charcoal-300 file:mr-4 file:rounded-lg file:border file:border-accent-violet-500 file:bg-accent-violet-500 file:px-4 file:py-2 file:text-white file:transition-colors file:hover:border-accent-violet-400 file:hover:bg-accent-violet-400"
          />
        </div>
      )}

      {step === "mapping" && parseResult && (
        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-widest text-charcoal-400">
            Map columns
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-charcoal-300">
                Amount
              </label>
              <select
                value={amountColIndex}
                onChange={(e) => setAmountColIndex(Number(e.target.value))}
                className="w-full rounded-lg border border-charcoal-500 bg-charcoal-800 px-3 py-2 text-white focus:border-charcoal-400 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
              >
                {columnOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-charcoal-300">
                Description
              </label>
              <select
                value={descriptionColIndex}
                onChange={(e) => setDescriptionColIndex(Number(e.target.value))}
                className="w-full rounded-lg border border-charcoal-500 bg-charcoal-800 px-3 py-2 text-white focus:border-charcoal-400 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
              >
                {columnOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-charcoal-300">
                Month (3-letter)
              </label>
              <select
                value={monthColIndex}
                onChange={(e) => setMonthColIndex(Number(e.target.value))}
                className="w-full rounded-lg border border-charcoal-500 bg-charcoal-800 px-3 py-2 text-white focus:border-charcoal-400 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
              >
                {columnOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-charcoal-300">
                Year
              </label>
              <select
                value={yearColIndex === null ? NOT_IN_FILE : yearColIndex}
                onChange={(e) => {
                  const v = e.target.value;
                  setYearColIndex(v === NOT_IN_FILE ? null : Number(v));
                }}
                className="w-full rounded-lg border border-charcoal-500 bg-charcoal-800 px-3 py-2 text-white focus:border-charcoal-400 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
              >
                <option value={NOT_IN_FILE}>Not in file</option>
                {columnOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {yearColIndex === null && (
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-charcoal-300">
                  Default year
                </label>
                <select
                  value={defaultYear}
                  onChange={(e) => setDefaultYear(Number(e.target.value))}
                  className="w-full rounded-lg border border-charcoal-500 bg-charcoal-800 px-3 py-2 text-white focus:border-charcoal-400 focus:outline-none focus:ring-1 focus:ring-accent-violet-500"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setStep("file")}
              className="btn-secondary"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleGoToPreview}
              className="rounded-lg bg-accent-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-violet-400 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
            >
              Preview
            </button>
          </div>
        </div>
      )}

      {(step === "preview" || step === "done") && (
        <div className="space-y-4">
          {step === "done" && resultMessage && (
            <p className="text-sm text-accent-emerald-400">{resultMessage}</p>
          )}
          <p className="text-xs font-medium uppercase tracking-widest text-charcoal-400">
            Preview ({validRows.length} to import
            {skippedErrors > 0 ? `, ${skippedErrors} skipped` : ""})
          </p>
          <div className="max-h-64 overflow-auto rounded-lg border border-charcoal-500 bg-charcoal-800">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-charcoal-900 text-charcoal-400">
                <tr>
                  <th className="px-3 py-2">Month</th>
                  <th className="px-3 py-2">Year</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2">Category</th>
                  {skippedErrors > 0 && (
                    <th className="px-3 py-2">Issue</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((r, i) => (
                  <tr
                    key={i}
                    className={
                      r.error
                        ? "border-t border-charcoal-600 bg-charcoal-800/50 text-charcoal-500"
                        : "border-t border-charcoal-600"
                    }
                  >
                    <td className="px-3 py-1.5">
                      {r.month
                        ? ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][r.month]
                        : "—"}
                    </td>
                    <td className="px-3 py-1.5">{r.year || "—"}</td>
                    <td className="max-w-[180px] truncate px-3 py-1.5 text-charcoal-200">
                      {r.description || "—"}
                    </td>
                    <td className="px-3 py-1.5 text-right text-white">
                      {r.amount > 0 ? formatCurrency(r.amount) : "—"}
                    </td>
                    <td className="px-3 py-1.5 text-charcoal-300">
                      {r.categoryName}
                    </td>
                    {skippedErrors > 0 && (
                      <td className="px-3 py-1.5 text-accent-rose-400/90 text-xs">
                        {r.error ?? ""}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-3">
            {step === "preview" && (
              <>
                <button
                  type="button"
                  onClick={() => setStep("mapping")}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={validRows.length === 0 || pending}
                  className="rounded-lg bg-accent-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-violet-400 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900 disabled:opacity-50"
                >
                  {pending ? "Importing…" : `Import ${validRows.length} row(s)`}
                </button>
              </>
            )}
            {step === "done" && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-accent-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-violet-400 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-csv-title"
    >
      <div className="w-full max-w-2xl">{modalContent}</div>
    </div>
  );
}
