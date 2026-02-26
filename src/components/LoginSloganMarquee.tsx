"use client";

import { useMemo } from "react";

const ROW_COUNT = 8;
const EXTRA_SLOGANS_PER_ROW = 20;
const DURATION_MIN = 500;  /* 40 * 1.6 — 60% slower */
const DURATION_MAX = 550; /* 70 * 1.6 */

function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildStripForRow(slogans: string[], rowIndex: number): string[] {
  const base = [...slogans];
  const shuffled = shuffleWithSeed([...slogans], rowIndex * 7919 + 1);
  const extra: string[] = [];
  for (let i = 0; i < EXTRA_SLOGANS_PER_ROW; i++) {
    extra.push(shuffled[i % shuffled.length]);
  }
  return [...base, ...extra];
}

interface LoginSloganMarqueeProps {
  slogans: readonly string[] | string[];
}

export function LoginSloganMarquee({ slogans }: LoginSloganMarqueeProps) {
  const rows = useMemo(() => {
    const list = Array.isArray(slogans) ? [...slogans] : [...slogans];
    return Array.from({ length: ROW_COUNT }, (_, i) => ({
      strip: buildStripForRow(list, i),
      scrollLeft: i % 2 === 0,
      duration: DURATION_MIN + (i * 13) % (DURATION_MAX - DURATION_MIN + 1),
      delay: (i * 2.7) % 5,
      size: i % 3 === 0 ? "text-xl" : i % 3 === 1 ? "text-2xl" : "text-3xl",
    }));
  }, [slogans]);

  return (
    <div aria-hidden className="absolute inset-0 flex flex-col justify-between py-4" style={{ zIndex: 0 }}>
      {rows.map((row, i) => (
        <div key={i} className="overflow-hidden py-1">
          <div
            className={`inline-flex font-display font-light text-charcoal-500 opacity-60 ${row.size} whitespace-nowrap`}
            style={{
              animation: row.scrollLeft
                ? `scroll-left ${row.duration}s linear infinite`
                : `scroll-right ${row.duration}s linear infinite`,
              animationDelay: `${row.delay}s`,
            }}
          >
            <span className="flex shrink-0 items-center gap-12 px-4">
              {row.strip.map((s, j) => (
                <span key={`${i}-${j}`}>{s}</span>
              ))}
            </span>
            <span className="flex shrink-0 items-center gap-12 px-4">
              {row.strip.map((s, j) => (
                <span key={`${i}-dup-${j}`}>{s}</span>
              ))}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
