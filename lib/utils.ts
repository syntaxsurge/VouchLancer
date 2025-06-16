import { clsx, type ClassValue } from 'clsx'
import { toast as sonnerToast } from 'sonner'
import { twMerge } from 'tailwind-merge'

/* -------------------------------------------------------------------------- */
/*                            T A I L W I N D                                 */
/* -------------------------------------------------------------------------- */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* -------------------------------------------------------------------------- */
/*                               C L I P B O A R D                            */
/* -------------------------------------------------------------------------- */

export function copyToClipboard(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => sonnerToast.success('Copied to clipboard'))
    .catch(() => sonnerToast.error('Failed to copy text'))
}

/* -------------------------------------------------------------------------- */
/*                               Q S  H E L P E R                             */
/* -------------------------------------------------------------------------- */

export function buildLink(
  basePath: string,
  init: Record<string, string>,
  overrides: Record<string, any>,
) {
  const sp = new URLSearchParams(init)
  Object.entries(overrides).forEach(([k, v]) => sp.set(k, String(v)))
  Array.from(sp.entries()).forEach(([k, v]) => {
    if (v === '') sp.delete(k)
  })
  const qs = sp.toString()
  return `${basePath}${qs ? `?${qs}` : ''}`
}

/* -------------------------------------------------------------------------- */
/*                       H U M A N‑ R E A D A B L E                            */
/* -------------------------------------------------------------------------- */

export function prettify(text?: string | null): string {
  return text ? text.replaceAll('_', ' ').toLowerCase() : '—'
}

/* -------------------------------------------------------------------------- */
/*                         B A S E 6 4  H E L P E R                            */
/* -------------------------------------------------------------------------- */

export function base64(str: string): string {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window.btoa(str)
  }
  return Buffer.from(str).toString('base64')
}

/* -------------------------------------------------------------------------- */
/*                         U R L  N O R M A L I S E R                         */
/* -------------------------------------------------------------------------- */

/**
 * Ensure a string is a fully‑qualified HTTP(S) URL; if the scheme is missing,
 * we prepend https:// to guarantee valid anchor/ fetch behaviour.
 */
export function ensureHttp(url: string): string {
  if (!url) return url
  return /^https?:\/\//i.test(url) ? url : `https://${url.replace(/^\/+/, '')}`
}
