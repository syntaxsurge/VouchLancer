'use client'

import '@/lib/polyfills/crypto'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useUser } from '@civic/auth-web3/react'
import { Loader2 } from 'lucide-react'

export default function AuthRequiredPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  /* ------------------------------------------------------------------ */
  /* When auth completes, continue to dashboard or ask for sign‑in       */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (isLoading) return

    if (user) {
      const params = new URLSearchParams(window.location.search)
      const next = params.get('next') || '/dashboard'
      router.replace(next)
    } else {
      router.replace('/?auth=1')
    }
  }, [isLoading, user, router])

  return (
    <div className='bg-background flex min-h-screen flex-col items-center justify-center gap-3'>
      <Loader2 className='text-muted-foreground h-6 w-6 animate-spin' />
      <p className='text-muted-foreground text-lg'>Loading…</p>
    </div>
  )
}
