import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}