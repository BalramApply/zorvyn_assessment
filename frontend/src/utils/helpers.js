import { format, parseISO } from 'date-fns'

export const fmt = {
  currency: (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0),

  date: (d) => {
    if (!d) return '—'
    try { return format(typeof d === 'string' ? parseISO(d) : d, 'dd MMM yyyy') }
    catch { return '—' }
  },

  dateShort: (d) => {
    if (!d) return '—'
    try { return format(typeof d === 'string' ? parseISO(d) : d, 'MMM dd') }
    catch { return '—' }
  },

  percent: (n) => `${Number(n ?? 0).toFixed(1)}%`,
}

export const clsx = (...args) =>
  args.filter(Boolean).join(' ')

export const errorMsg = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong'