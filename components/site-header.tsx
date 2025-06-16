'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useUser as useCivicUser } from '@civic/auth-web3/react'
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
  Loader2,
} from 'lucide-react'

import { signOut as serverSignOut } from '@/app/(auth)/actions'
import { ModeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import UserAvatar from '@/components/ui/user-avatar'
import { useUser as useServerUser } from '@/lib/auth'

/* -------------------------------------------------------------------------- */
/*                               NAVIGATION DATA                              */
/* -------------------------------------------------------------------------- */

const LEARN_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'demo', label: 'See Vouchlancer in Action' },
  { id: 'features', label: 'Features' },
  { id: 'deep-dive', label: 'What You Get' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'pricing', label: 'Pricing' },
] as const

const TOOLS_MENU = [
  { href: '/jobs', label: 'Job Openings' },
  { href: '/candidates', label: 'Candidates' },
  { href: '/issuers', label: 'Issuers' },
  { href: '/verify', label: 'Verify' },
] as const

/* -------------------------------------------------------------------------- */
/*                                  HEADER                                    */
/* -------------------------------------------------------------------------- */

export default function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  /* Civic auth user (client‑side, instant) */
  const {
    user: civicUser,
    isLoading: civicLoading,
    signIn: _civicSignIn,
    signOut: civicSignOut,
  } = useCivicUser()

  /* Server‑side user (role, etc) */
  const { userPromise } = useServerUser()
  const [serverUser, setServerUser] = useState<Awaited<typeof userPromise> | null>(null)

  /* Mobile state */
  const [mobileOpen, setMobileOpen] = useState(false)
  const [_learnMobileOpen, setLearnMobileOpen] = useState(false)
  const [_toolsMobileOpen, setToolsMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) {
      setLearnMobileOpen(false)
      setToolsMobileOpen(false)
    }
  }, [mobileOpen])

  /* Resolve server user promise */
  useEffect(() => {
    let mounted = true
    const maybe = userPromise as unknown
    if (maybe && typeof maybe === 'object' && typeof (maybe as any).then === 'function') {
      ;(maybe as Promise<any>).then(
        (u) => mounted && setServerUser(u),
        () => mounted && setServerUser(null),
      )
    } else {
      setServerUser(maybe as Awaited<typeof userPromise>)
    }
    return () => {
      mounted = false
    }
  }, [userPromise])

  /* ---------- Helpers ---------- */
  function closeMobile() {
    setMobileOpen(false)
  }

  async function handleSignOut() {
    router.push('/') // move away first
    await civicSignOut()
    await serverSignOut()
    router.refresh()

    /* Clear reload flag and hard reload to reset SDK state */
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('reloaded_after_login')
      window.location.reload()
    }
  }

  function openAuthModal() {
    const params = new URLSearchParams(searchParams.toString())
    params.set('auth', '1')
    router.push(`${pathname}?${params}`)
  }

  /* ---------- Rendering ---------- */

  const signedIn = !!civicUser
  const displayName = civicUser?.name || civicUser?.email || serverUser?.name || serverUser?.email

  return (
    <>
      <header className='border-border/60 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b shadow-sm backdrop-blur'>
        <div className='mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-6 px-4 md:px-6'>
          {/* Brand */}
          <Link
            href='/'
            className='text-foreground flex items-center gap-2 text-lg font-extrabold tracking-tight whitespace-nowrap'
            onClick={closeMobile}
          >
            <Image
              src='/images/vouchlancer-logo.png'
              alt='Vouchlancer logo'
              width={40}
              height={40}
              priority
              className='h-10 w-auto md:h-8'
            />
            <span className='hidden md:inline'>Vouchlancer</span>
          </Link>

          {/* Desktop nav */}
          <nav className='hidden justify-center gap-6 md:flex'>
            <Link
              href='/'
              className='text-foreground/80 hover:text-foreground text-sm font-medium transition-colors'
            >
              Home
            </Link>

            {/* Learn dropdown */}
            <HoverCard openDelay={100} closeDelay={100}>
              <HoverCardTrigger asChild>
                <span className='text-foreground/80 hover:text-foreground flex cursor-pointer items-center gap-1 text-sm font-medium transition-colors'>
                  Learn
                  <ChevronDown className='mt-0.5 h-3 w-3' />
                </span>
              </HoverCardTrigger>
              <HoverCardContent side='bottom' align='start' className='w-40 rounded-lg p-2'>
                <ul className='space-y-1'>
                  {LEARN_SECTIONS.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/#${s.id}`}
                        className='hover:bg-muted block rounded px-2 py-1 text-sm'
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </HoverCardContent>
            </HoverCard>

            {/* Tools dropdown */}
            <HoverCard openDelay={100} closeDelay={100}>
              <HoverCardTrigger asChild>
                <span className='text-foreground/80 hover:text-foreground flex cursor-pointer items-center gap-1 text-sm font-medium transition-colors'>
                  Tools
                  <ChevronDown className='mt-0.5 h-3 w-3' />
                </span>
              </HoverCardTrigger>
              <HoverCardContent side='bottom' align='start' className='w-40 rounded-lg p-2'>
                <ul className='space-y-1'>
                  {TOOLS_MENU.map((t) => (
                    <li key={t.href}>
                      <Link
                        href={t.href}
                        className='hover:bg-muted block rounded px-2 py-1 text-sm'
                      >
                        {t.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </HoverCardContent>
            </HoverCard>

            <Link
              href='/pricing'
              className='text-foreground/80 hover:text-foreground text-sm font-medium transition-colors'
            >
              Pricing
            </Link>

            <Link
              href='/dashboard'
              className='text-foreground/80 hover:text-foreground text-sm font-medium transition-colors'
            >
              Dashboard
            </Link>
          </nav>

          {/* Right‑aligned controls */}
          <div className='flex items-center justify-end gap-3'>
            <ModeToggle />

            {civicLoading ? (
              <Button disabled variant='ghost' className='shrink-0'>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Loading…
              </Button>
            ) : signedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <UserAvatar
                    src={undefined}
                    name={civicUser?.name || null}
                    email={civicUser?.email || null}
                    className='cursor-pointer'
                  />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align='end'
                  className='data-[state=open]:animate-in data-[state=closed]:animate-out w-56 max-w-[90vw] rounded-lg p-1 shadow-lg sm:w-64'
                >
                  <DropdownMenuItem
                    asChild
                    className='data-[highlighted]:bg-muted data-[highlighted]:text-foreground flex flex-col items-start gap-1 rounded-md px-3 py-2 text-left select-none'
                  >
                    <Link href='/settings/team' className='w-full'>
                      <p className='truncate text-sm font-medium'>{displayName || 'User'}</p>
                      {civicUser?.email && (
                        <p className='text-muted-foreground truncate text-xs break-all'>
                          {civicUser.email}
                        </p>
                      )}
                      {serverUser?.role && (
                        <span className='bg-muted text-muted-foreground inline-block rounded px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase'>
                          {serverUser.role}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    asChild
                    className='data-[highlighted]:bg-muted data-[highlighted]:text-foreground flex items-center gap-2 rounded-md px-3 py-2'
                  >
                    <Link href='/dashboard' className='flex items-center gap-2'>
                      <LayoutDashboard className='h-4 w-4' />
                      <span className='text-sm'>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    asChild
                    className='data-[highlighted]:bg-muted data-[highlighted]:text-foreground flex items-center gap-2 rounded-md px-3 py-2'
                  >
                    <Link href='/settings/general' className='flex items-center gap-2'>
                      <SettingsIcon className='h-4 w-4' />
                      <span className='text-sm'>Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <button type='button' className='w-full' onClick={handleSignOut}>
                    <DropdownMenuItem className='data-[highlighted]:bg-muted data-[highlighted]:text-foreground flex w-full items-center gap-2 rounded-md px-3 py-2'>
                      <LogOut className='h-4 w-4' />
                      <span className='text-sm'>Sign out</span>
                    </DropdownMenuItem>
                  </button>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant='ghost' className='shrink-0' onClick={openAuthModal}>
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
