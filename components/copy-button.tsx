'use client'

import * as React from 'react'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CopyButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  /** Text to copy */
  value: string
  /** Toast title (defaults to "Copied") */
  toastTitle?: string
  /** Optional toast description */
  toastDescription?: string
  /** Short label appended to description (e.g. "Link") */
  suffix?: string
}

export default function CopyButton({
  value,
  toastTitle = 'Copied',
  toastDescription,
  suffix,
  className,
  children,
  ...props
}: CopyButtonProps) {
  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(value)
      toast(toastTitle, {
        description: toastDescription ?? `${suffix ? `${suffix} ` : ''}${value}`,
      })
    } catch {
      toast('Failed', { description: 'Unable to copy to clipboard' })
    }
  }

  return (
    <Button type='button' onClick={handleClick} className={cn(className)} {...props}>
      {children}
    </Button>
  )
}
