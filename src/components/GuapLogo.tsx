"use client";

const LOGO_ASPECT = 629 / 338;

export interface GuapLogoProps {
  /** Height in pixels (width scales to preserve aspect ratio). Default: 32 */
  height?: number;
  /** Optional className for the wrapper (e.g. for hover). */
  className?: string;
  /** Optional priority for above-the-fold logo (e.g. login). */
  priority?: boolean;
}

/**
 * Official Guap logo (SVG). Use in header, login, and any app branding.
 * Uses <img> so the SVG from public/guap.svg is loaded directly (avoids Next Image caching/optimization).
 * See styles.md § Logo for usage guidelines.
 */
export function GuapLogo({
  height = 32,
  className,
  priority = false,
}: GuapLogoProps) {
  const width = Math.round(height * LOGO_ASPECT);
  return (
    <img
      src="/guap.svg"
      alt="Guap"
      width={width}
      height={height}
      className={className}
      fetchPriority={priority ? "high" : undefined}
    />
  );
}
