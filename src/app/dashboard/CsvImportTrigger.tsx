"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CsvImportModal } from "./CsvImportModal";
import type { Category } from "@/types/database";

type BudgetSummary = { id: string; month: number; year: number };

type CsvImportTriggerProps = {
  categories: Category[];
  budgets: BudgetSummary[];
};

export function CsvImportTrigger({ categories, budgets }: CsvImportTriggerProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Import CSV"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-accent-violet-500 bg-transparent text-accent-violet-500 transition-colors hover:bg-accent-violet-500 hover:text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
      </button>
      {open && (
        <CsvImportModal
          categories={categories}
          budgets={budgets}
          onClose={() => setOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
