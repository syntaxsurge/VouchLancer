'use client'

import Link from 'next/link'

import { motion } from 'framer-motion'
import { Rocket, Sparkles, ShieldCheck, Wallet, Globe, Layers3 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*                                    DATA                                    */
/* -------------------------------------------------------------------------- */

const FEATURES = [
  { icon: ShieldCheck, label: 'Passwordless Civic Auth' },
  { icon: Wallet, label: 'Embedded Wallets' },
  { icon: Sparkles, label: 'AI‑Validated Skills' },
  { icon: Layers3, label: 'Verifiable Proofs' },
  { icon: Globe, label: 'Borderless Trust' },
  { icon: Rocket, label: 'Zero Crypto Setup' },
] as const

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export default function HeroSection() {
  return (
    <section
      id='hero'
      className='relative isolate overflow-hidden bg-gradient-to-br from-[#0b0f19] via-[#141b2d] to-[#0b0f19] py-40'
    >
      {/* Subtle radial backdrop */}
      <div
        aria-hidden
        className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(0,255,190,0.12)_0%,transparent_70%)]'
      />

      <div className='mx-auto max-w-4xl px-4 text-center'>
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className='bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-5xl leading-tight font-extrabold text-transparent sm:text-6xl md:text-7xl'
        >
          Civic‑Powered Proofs&nbsp;for&nbsp;Hiring
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className='mx-auto mt-6 max-w-2xl text-lg/relaxed text-white/90'
        >
          With Civic Auth every candidate arrives ready—passwordless sign‑in, embedded wallet, and
          instantly verifiable credentials out‑of‑the‑box.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className='mt-10 flex flex-wrap justify-center gap-4'
        >
          <GradientButton href='/dashboard'>Explore Dashboard</GradientButton>
          <GradientButton href='/#demo' tone='outline'>
            Watch Demo
          </GradientButton>
        </motion.div>

        {/* Feature pills */}
        <motion.ul
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className='mt-16 grid gap-4 sm:grid-cols-2 md:grid-cols-3'
        >
          {FEATURES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className='flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white backdrop-blur'
            >
              <Icon className='h-4 w-4 shrink-0 text-amber-300' />
              {label}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                            GRADIENT BUTTON                                 */
/* -------------------------------------------------------------------------- */

type GradientButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  'variant' | 'asChild'
> & { href: string; tone?: 'solid' | 'outline' }

function GradientButton({
  href,
  children,
  tone = 'solid',
  className,
  ...props
}: GradientButtonProps) {
  const solid = tone === 'solid'
  return (
    <Button
      asChild
      size='lg'
      className={cn(
        'relative isolate overflow-hidden rounded-full px-8 py-3 font-semibold shadow-xl transition-transform duration-200 focus-visible:outline-none',
        solid
          ? 'bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-2xl'
          : 'ring-border bg-white/10 text-white/90 ring-1 backdrop-blur hover:bg-white/20 hover:text-white',
        className,
      )}
      {...props}
    >
      <Link href={href}>
        <span className='relative z-10 flex items-center gap-2'>{children}</span>
        {solid && (
          <span
            aria-hidden='true'
            className='absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'
          />
        )}
      </Link>
    </Button>
  )
}
