import { twMerge } from "tailwind-merge"
import { clsx, type ClassValue } from "clsx"

export function formatNumber(value: number, digits = 2) {
  if (!Number.isFinite(value))
    return '—';

  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: value % 1 === 0 ? 0 : Math.min(2, digits),
    maximumFractionDigits: digits
  }).format(value);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
