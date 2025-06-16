'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Wallet,
  ShieldCheck,
  Key,
  Lock,
  UserCheck,
  EyeOff,
  RotateCcw,
} from 'lucide-react'

const features = [
  {
    icon: ShieldCheck,
    title: 'Passwordless Civic Auth',
    description: 'Authenticate in seconds—no emails, no passwords, just Civic.',
  },
  {
    icon: Wallet,
    title: 'Embedded Wallets',
    description: 'Every user receives a non‑custodial Web3 wallet automatically on sign‑in.',
  },
  {
    icon: CheckCircle2,
    title: 'AI Skill Validation',
    description: 'GPT‑powered graders convert raw answers into objective scores.',
  },
  {
    icon: Lock,
    title: 'Private Data Agent',
    description: 'Consent‑driven vault powers secure AI insights from user data.',
  },
  {
    icon: UserCheck,
    title: 'Consent‑Driven Access',
    description: 'Users approve every data connector, meeting global privacy standards.',
  },
  {
    icon: EyeOff,
    title: 'Zero‑Knowledge Ready',
    description: 'Architecture primed for future ZK selective‑disclosure protocols.',
  },
  {
    icon: RotateCcw,
    title: 'Instant Revocation',
    description: 'Revocation lists propagate in real time across the platform.',
  },
  {
    icon: Key,
    title: 'One‑Click Team Workspaces',
    description: 'Spin up a shared space with billing and role management baked in.',
  },
]

export default function FeaturesSection() {
  return (
    <section id='features' className='bg-background py-24'>
      <div className='mx-auto max-w-6xl px-4 text-center'>
        <h2 className='text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl'>
          Built on Civic‑Grade Trust
        </h2>

        <div className='mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {features.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className='group border-border/60 bg-background/70 relative overflow-hidden rounded-2xl border p-8 backdrop-blur'
            >
              <div className='absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-15' />
              <div className='relative z-10 flex flex-col items-center'>
                <div className='mb-4 inline-flex size-12 items-center justify-center rounded-full text-white shadow-lg'>
                  <Icon className='h-6 w-6' />
                </div>
                <h3 className='text-foreground text-lg font-semibold'>{title}</h3>
                <p className='text-muted-foreground mt-2 text-sm leading-relaxed'>{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
