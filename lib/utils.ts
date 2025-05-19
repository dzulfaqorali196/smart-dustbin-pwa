import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Menggabungkan class names dengan clsx dan tailwind-merge
 * untuk menghindari konflik dalam utility classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
