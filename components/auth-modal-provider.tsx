'use client'

import '@/lib/polyfills/crypto'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'

import { useUser } from '@civic/auth-web3/react'
import { Loader2 } from 'lucide-react'

import { AuthButton } from '@/components/auth-button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

type Role = 'candidate' | 'recruiter' | 'issuer'

export default function AuthModalProvider() {
  const { user, isLoading } = useUser()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  /* ---------------------- Role captured during signup ---------------------- */
  const [role, setRole] = useState<Role>('candidate')

  /* --------------------------- Route flags --------------------------- */
  const hasAuthParam = searchParams.get('auth') === '1'
  const onProtectedRoute = pathname?.startsWith('/dashboard')
  const shouldPrompt = !isLoading && (hasAuthParam || onProtectedRoute) && !user

  /* --------------------------- Modal state --------------------------- */
  const [open, setOpen] = useState<boolean>(shouldPrompt)

  useEffect(() => {
    setOpen(shouldPrompt)
  }, [shouldPrompt])

  /* --------------------------- Helpers ------------------------------- */
  const stripAuthParam = useCallback(() => {
    if (!hasAuthParam) return
    const params = new URLSearchParams(searchParams.toString())
    params.delete('auth')
    router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`)
  }, [hasAuthParam, pathname, router, searchParams])

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setOpen(true)
    } else {
      setOpen(false)
      stripAuthParam()
    }
  }

  const handleBeforeSignIn = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('signup_role', role)
    }
    setOpen(false)
    stripAuthParam()
  }

  const roleLabel = (r: string) => (r === 'candidate' ? 'candidate / freelancer' : r)

  /* --------------------------- Render ------------------------------- */
  return (
    <>
      {isLoading && onProtectedRoute && (
        <div className='bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm'>
          <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
        </div>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className='max-w-sm space-y-6'>
          <DialogHeader>
            <DialogTitle className='text-center text-2xl font-extrabold'>
              Sign in&nbsp;/&nbsp;Sign up
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-2'>
            <p className='text-muted-foreground text-center text-sm font-medium'>
              Select your role
            </p>
            <RadioGroup
              value={role}
              onValueChange={(v) => setRole(v as Role)}
              className='grid grid-cols-3 gap-2'
            >
              {(['candidate', 'recruiter', 'issuer'] as const).map((r) => (
                <div key={r} className='relative'>
                  <RadioGroupItem id={`modal-${r}`} value={r} className='peer sr-only' />
                  <Label
                    htmlFor={`modal-${r}`}
                    className='bg-background/70 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 flex cursor-pointer flex-col items-center space-y-1 rounded-md border px-3 py-2 text-sm capitalize shadow-sm'
                  >
                    {roleLabel(r)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <AuthButton className='w-full' onBeforeSignIn={handleBeforeSignIn} />
        </DialogContent>
      </Dialog>
    </>
  )
}
