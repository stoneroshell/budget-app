import Link from "next/link";
import { getBudgetsWithNetIncome } from "@/app/actions/budgets";
import { formatCurrency, getMonthAbbrevUpper } from "@/lib/helpers";
import { CreateBudgetForm } from "./CreateBudgetForm";

function getNetColorClass(
  netIncome: number,
  minNet: number,
  maxNet: number,
  isSingleOrTied: boolean
): { border: string; text: string } {
  if (isSingleOrTied) {
    return netIncome >= 0
      ? { border: "border-accent-emerald-500", text: "text-accent-emerald-400" }
      : { border: "border-accent-rose-500", text: "text-accent-rose-400" };
  }
  if (netIncome === minNet)
    return { border: "border-accent-rose-500", text: "text-accent-rose-400" };
  if (netIncome === maxNet)
    return { border: "border-accent-emerald-500", text: "text-accent-emerald-400" };
  return { border: "border-charcoal-500", text: "text-charcoal-300" };
}

export default async function DashboardPage() {
  const budgets = await getBudgetsWithNetIncome();
  const minNet = budgets.length ? Math.min(...budgets.map((b) => b.netIncome)) : 0;
  const maxNet = budgets.length ? Math.max(...budgets.map((b) => b.netIncome)) : 0;
  const isSingleOrTied = budgets.length <= 1 || minNet === maxNet;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 text-center sm:flex-row sm:justify-center sm:items-center sm:gap-6">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Your budgets</h1>
        <CreateBudgetForm />
      </div>

      {budgets.length === 0 ? (
        <div className="rounded-lg border border-charcoal-500 bg-charcoal-900/80 p-8 text-center text-charcoal-300">
          <p className="mb-2">No budgets yet.</p>
          <p className="text-sm">Create a monthly budget above to get started.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {budgets.map((b) => {
            const { border, text } = getNetColorClass(b.netIncome, minNet, maxNet, isSingleOrTied);
            return (
              <li key={b.id} className="size-full min-w-0">
                <Link
                  href={`/dashboard/${b.id}`}
                  className={`@container flex aspect-square size-full min-w-0 flex-col rounded-xl border bg-charcoal-900/80 text-center hover:bg-charcoal-800/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900 [container-type:inline-size] ${border}`}
                  style={{ padding: "2.5cqi" }}
                >
                  <div className="flex min-h-0 flex-1 flex-col gap-0">
                    <div className="flex min-h-0 flex-[0.9] flex-col items-center justify-center gap-0 overflow-hidden py-0">
                      <span
                        className="inline-block max-w-full overflow-hidden text-ellipsis font-semibold text-white font-inter-tight leading-[0.82] select-none"
                        style={{
                          fontSize: "45cqi",
                          letterSpacing: "0.02em",
                          transform: "scaleY(1.18)",
                          transformOrigin: "center",
                        }}
                      >
                        {getMonthAbbrevUpper(b.month)}
                      </span>
                      <span
                        className="max-w-full overflow-hidden text-ellipsis font-medium text-white leading-none"
                        style={{ fontSize: "15cqi", marginTop: "6cqi" }}
                      >
                        {b.year}
                      </span>
                    </div>
                    <div
                      className="flex flex-[0.1] min-h-0 shrink-0 items-center justify-center overflow-hidden"
                      style={{ paddingLeft: "2cqi", paddingRight: "2cqi" }}
                    >
                      <span
                        className={`max-w-full overflow-hidden font-semibold ${text}`}
                        style={{ fontSize: "9cqi" }}
                      >
                        Net {formatCurrency(b.netIncome)}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
