export const PAYMENT_SOURCE_COLORS = [
  "#8B5CF6",
  "#06B6D4",
  "#F59E0B",
  "#F43F5E",
  "#10B981",
  "#3B82F6",
] as const;

export type PaymentSourceColor = (typeof PAYMENT_SOURCE_COLORS)[number];
