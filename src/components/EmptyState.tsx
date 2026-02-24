import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  /** Use for chart empty states where we need a min height */
  className?: string;
};

const defaultIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8"
    aria-hidden
  >
    <rect width="14" height="18" x="5" y="2" rx="2" />
    <path d="M9 6h6" />
    <path d="M9 10h6" />
    <path d="M9 14h4" />
  </svg>
);

export function EmptyState({
  icon = defaultIcon,
  title,
  description,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`empty-state-wrapper ${className}`}
    >
      <div className="empty-state-icon-box">{icon}</div>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-description">{description}</p>
    </div>
  );
}

const chartIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8"
    aria-hidden
  >
    <path d="M3 3v18h18" />
    <path d="M7 16v-5" />
    <path d="M12 16v-9" />
    <path d="M17 16v-2" />
  </svg>
);

export function ChartEmptyState({
  title,
  description,
  className = "",
}: Omit<EmptyStateProps, "icon">) {
  return (
    <EmptyState
      icon={chartIcon}
      title={title}
      description={description}
      className={className}
    />
  );
}
