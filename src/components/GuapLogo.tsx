"use client";

import Image from "next/image";

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
 * See styles.md § Logo for usage guidelines.
 */
export function GuapLogo({
  height = 32,
  className,
  priority = false,
}: GuapLogoProps) {
  const width = Math.round(height * LOGO_ASPECT);
  return (
    <Image
      src="/guap.svg"
      alt="Guap"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
