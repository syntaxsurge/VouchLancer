'use client'

import React from 'react'

import { toast as sonnerToast } from 'sonner'

type SonnerBaseOptions = NonNullable<Parameters<typeof sonnerToast>[1]>

export interface ToastOptions extends SonnerBaseOptions {
  title?: React.ReactNode
  description?: React.ReactNode
}

/**
 * Wrapper that supports the former object‑style call signature
 * `toast({ title, description, ... })` while delegating to Sonner.
 */
export const toast = (
  messageOrOpts?: string | React.ReactNode | ToastOptions,
  opts?: ToastOptions,
) => {
  /* Object‑only form */
  if (messageOrOpts && typeof messageOrOpts === 'object' && !React.isValidElement(messageOrOpts)) {
    const options = messageOrOpts as ToastOptions
    return sonnerToast(options.title ?? '', options)
  }

  /* Standard passthrough */
  return sonnerToast(messageOrOpts as any, opts)
}

export function useToast() {
  return {
    toast,
    dismiss(id?: string | number) {
      sonnerToast.dismiss?.(id)
    },
  }
}
