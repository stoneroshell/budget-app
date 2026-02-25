"use client";

import { formatCurrency } from "@/lib/helpers";

type Props = {
  needsAmount: number;
  wantsAmount: number;
  needsPercent: number;
  wantsPercent: number;
};

export function NeedsWantsBar({
  needsAmount,
  wantsAmount,
  needsPercent,
  wantsPercent,
}: Props) {
  const hasData = needsAmount > 0 || wantsAmount > 0;

  return (
    <div
      className="flex min-h-0 w-full flex-1 flex-row items-center justify-center"
      role="group"
      aria-label={
        hasData
          ? `Needs ${formatCurrency(needsAmount)} (${needsPercent.toFixed(0)}%), Wants ${formatCurrency(wantsAmount)} (${wantsPercent.toFixed(0)}%)`
          : "No needs or wants spending"
      }
    >
      {hasData ? (
        <>
          {/* Needs */}
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center border-r border-charcoal-500 pr-3">
            <span className="text-[10px] font-medium uppercase tracking-widest text-charcoal-300">
              Needs
            </span>
            <span className="text-lg font-light text-needs tabular-nums">
              {formatCurrency(needsAmount)}
            </span>
            <span className="text-[10px] text-charcoal-300 tabular-nums">
              {needsPercent.toFixed(0)}%
            </span>
          </div>

          {/* Wants */}
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center pl-3">
            <span className="text-[10px] font-medium uppercase tracking-widest text-charcoal-300">
              Wants
            </span>
            <span className="text-lg font-light text-wants tabular-nums">
              {formatCurrency(wantsAmount)}
            </span>
            <span className="text-[10px] text-charcoal-300 tabular-nums">
              {wantsPercent.toFixed(0)}%
            </span>
          </div>
        </>
      ) : (
        <div className="flex h-full min-h-[3rem] w-full items-center justify-center">
          <span className="text-xs text-charcoal-300">No needs/wants spending</span>
        </div>
      )}
    </div>
  );
}
