'use client'

import Image from 'next/image'
import { useState } from 'react'

import { AuthButton } from '@/components/auth-button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export function Login({ mode }: { mode?: 'signin' | 'signup' }) {
  const heading = mode === 'signup' ? 'Create your Vouchlancer account' : 'Sign in to Vouchlancer'

  const [role, setRole] = useState<'candidate' | 'recruiter' | 'issuer'>('candidate')

  const onBeforeSignIn =
    mode === 'signup'
      ? () => {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('signup_role', role)
          }
        }
      : undefined

  const roleLabel = (r: string) => (r === 'candidate' ? 'candidate / freelancer' : r)

  return (
    <div className='from-background via-muted to-background relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-br px-4 py-12 sm:px-6 lg:px-8'>
      <div className='from-primary/10 pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] via-transparent to-transparent' />
      <div className='ring-border/40 bg-background/80 w-full max-w-sm rounded-lg border p-8 shadow-xl ring-1 backdrop-blur-sm'>
        <div className='flex flex-col items-center space-y-6'>
          <Image
            src='/images/vouchlancer-logo.png'
            alt='Vouchlancer logo'
            width={64}
            height={64}
            priority
          />
          <h1 className='text-foreground text-center text-2xl font-extrabold'>{heading}</h1>

          {mode === 'signup' && (
            <div className='w-full space-y-2'>
              <p className='text-muted-foreground text-center text-sm font-medium'>
                Select your role
              </p>
              <RadioGroup
                value={role}
                onValueChange={(val) => setRole(val as 'candidate' | 'recruiter' | 'issuer')}
                className='grid grid-cols-3 gap-2'
              >
                {(['candidate', 'recruiter', 'issuer'] as const).map((r) => (
                  <div key={r} className='relative'>
                    <RadioGroupItem id={`signup-${r}`} value={r} className='peer sr-only' />
                    <Label
                      htmlFor={`signup-${r}`}
                      className='bg-background/70 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 flex cursor-pointer flex-col items-center space-y-1 rounded-md border px-3 py-2 text-sm capitalize shadow-sm'
                    >
                      {roleLabel(r)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <AuthButton className='w-full' onBeforeSignIn={onBeforeSignIn} />
        </div>
      </div>
    </div>
  )
}
