import './globals.css'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'

import type { Metadata, Viewport } from 'next'

import AuthModalProvider from '@/components/auth-modal-provider'
import CivicProviders from '@/components/civic-providers'
import PublicEnvScript from '@/components/public-env-script'
import SiteHeader from '@/components/site-header'
import { ThemeProvider } from '@/components/theme-provider'
import { UserProvider } from '@/lib/auth'
import { isDatabaseHealthy } from '@/lib/db/health'
import { getUser } from '@/lib/db/queries/queries'

/* -------------------------------------------------------------------------- */
/*                               M E T A D A T A                              */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Vouchlancer',
  description: 'AI-Assisted, Credential-Backed Hiring powered by cheqd.',
  icons: { icon: '/images/favicon.ico' },
}

export const viewport: Viewport = {
  maximumScale: 1,
}

const inter = Inter({ subsets: ['latin'] })

/**
 * Root layout — if the database is unreachable we short-circuit and render
 * a friendly downtime screen; otherwise the normal application shell loads.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const dbOk = await isDatabaseHealthy()

  /* ---------------------------------------------------------------------- */
  /*                              D O W N T I M E                           */
  /* ---------------------------------------------------------------------- */
  if (!dbOk) {
    return (
      <html lang='en' className={`bg-background text-foreground ${inter.className}`}>
        <body className='flex min-h-screen flex-col items-center justify-center px-4 text-center'>
          <h1 className='text-4xl font-extrabold tracking-tight'>
            Our database is having a nap 😴
          </h1>
          <p className='text-muted-foreground mt-4 max-w-md'>
            We’re unable to reach the Vouchlancer database right now. Please try again in a few
            minutes while we reconnect everything behind the scenes.
          </p>
        </body>
      </html>
    )
  }

  /* ---------------------------------------------------------------------- */
  /*                              N O R M A L                               */
  /* ---------------------------------------------------------------------- */
  const userPromise = getUser()

  return (
    <html
      lang='en'
      className={`bg-background text-foreground ${inter.className}`}
      suppressHydrationWarning
    >
      <body className='min-h-[100dvh]'>
        <PublicEnvScript />

        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <CivicProviders>
            <UserProvider userPromise={userPromise}>
              <Suspense fallback={null}>
                <SiteHeader />
              </Suspense>
              <Suspense fallback={null}>
                <AuthModalProvider />
              </Suspense>
              <main>{children}</main>
            </UserProvider>
          </CivicProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}
