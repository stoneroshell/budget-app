"use client";

type Props = {
  needsPercent: number;
  wantsPercent: number;
};

export function NeedsWantsBar({ needsPercent, wantsPercent }: Props) {
  const total = needsPercent + wantsPercent;
  const hasData = total > 0;
  const needsWidth = hasData ? (needsPercent / total) * 100 : 0;
  const wantsWidth = hasData ? (wantsPercent / total) * 100 : 0;

  return (
    <div className="w-full">
      <div
        className="flex h-8 w-full overflow-hidden rounded-lg"
        role="img"
        aria-label={
          hasData
            ? `Needs ${needsPercent.toFixed(0)}%, Wants ${wantsPercent.toFixed(0)}%`
            : "No needs or wants spending"
        }
      >
        {hasData ? (
          <>
            <div
              className="group relative h-full rounded-l-lg border-2 border-needs border-r transition-colors duration-200"
              style={{ width: `${needsWidth}%` }}
            >
              <div
                className="h-full min-w-0 rounded-l-md bg-transparent transition-colors duration-200 group-hover:bg-needs"
                title={`Needs ${needsPercent.toFixed(0)}%`}
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="rounded bg-charcoal-900/95 px-2 py-1 text-xs font-medium text-needs shadow ring-1 ring-charcoal-500">
                  Needs {needsPercent.toFixed(0)}%
                </span>
              </span>
            </div>
            <div
              className="group relative h-full rounded-r-lg border-2 border-l-0 border-wants transition-colors duration-200"
              style={{ width: `${wantsWidth}%` }}
            >
              <div
                className="h-full min-w-0 rounded-r-md bg-transparent transition-colors duration-200 group-hover:bg-wants"
                title={`Wants ${wantsPercent.toFixed(0)}%`}
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="rounded bg-charcoal-900/95 px-2 py-1 text-xs font-medium text-wants shadow ring-1 ring-charcoal-500">
                  Wants {wantsPercent.toFixed(0)}%
                </span>
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-charcoal-700/50">
            <span className="text-xs text-charcoal-400">No needs/wants spending</span>
          </div>
        )}
      </div>
    </div>
  );
}
