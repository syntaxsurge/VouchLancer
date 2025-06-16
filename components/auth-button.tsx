'use client'

import '@/lib/polyfills/crypto'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

import { useUser } from '@civic/auth-web3/react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

type Props = {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  onBeforeSignIn?: () => void
}

export function AuthButton({ className, variant = 'default', onBeforeSignIn }: Props) {
  const { user, isLoading, signIn, signOut } = useUser()
  const router = useRouter()

  /* ---------- Post‑login redirect ---------- */
  useEffect(() => {
    if (user) {
      router.refresh()
      const path = typeof window !== 'undefined' ? window.location.pathname : '/'
      if (path === '/' || path === '/auth-required') {
        router.push('/dashboard')
      }
    }
  }, [user, router])

  const handleSignIn = () => {
    onBeforeSignIn?.()
    signIn()
  }

  if (isLoading) {
    return (
      <Button disabled className={className}>
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        Loading…
      </Button>
    )
  }

  if (!user) {
    return (
      <Button variant={variant} className={className} onClick={handleSignIn}>
        Sign in with Civic
      </Button>
    )
  }

  return (
    <Button variant='outline' className={className} onClick={() => signOut()}>
      Sign out {user.email || user.id}
    </Button>
  )
}
