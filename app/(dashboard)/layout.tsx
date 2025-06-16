'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useUser as useCivicUser } from '@civic/auth-web3/react'
import {
  Loader2,
  LayoutDashboard,
  Users,
  FolderKanban,
  Mail,
  ShieldCheck,
  Award,
  BookOpen,
  Key,
  Settings,
  Activity,
  Shield,
  Menu,
  Tag,
  User,
  Star,
  Link as LinkIcon,
} from 'lucide-react'

import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { Button } from '@/components/ui/button'
import { useUser } from '@/lib/auth'
import { SidebarNavItem } from '@/lib/types/components'

type PendingCounts = {
  invitations: number
  issuerRequests: number
  adminPendingIssuers: number
}

function roleNav(role?: string, counts?: PendingCounts): SidebarNavItem[] {
  switch (role) {
    case 'candidate':
      return [
        { href: '/candidate/profile', icon: User, label: 'Profile' },
        { href: '/candidate/highlights', icon: Star, label: 'Profile Highlight' },
        { href: '/candidate/credentials', icon: BookOpen, label: 'Credentials' },
        { href: '/candidate/skill-check', icon: Award, label: 'Skill Quiz' },
        { href: '/candidate/payment-links', icon: LinkIcon, label: 'Payment Links' },
        { href: '/candidate/create-did', icon: Key, label: 'Create DID' },
      ]
    case 'recruiter':
      return [
        { href: '/recruiter/talent', icon: Users, label: 'Talent' },
        { href: '/recruiter/pipelines', icon: FolderKanban, label: 'Pipelines' },
        { href: '/recruiter/create-did', icon: Key, label: 'Create DID' },
      ]
    case 'issuer':
      return [
        {
          href: '/issuer/requests',
          icon: Mail,
          label: 'Requests',
          badgeCount: counts?.issuerRequests,
        },
        { href: '/issuer/onboard', icon: ShieldCheck, label: 'Organisation' },
        { href: '/issuer/create-did', icon: Key, label: 'Create DID' },
      ]
    case 'admin':
      return [
        { href: '/admin/users', icon: Users, label: 'Users' },
        { href: '/admin/credentials', icon: Award, label: 'Credentials' },
        {
          href: '/admin/issuers',
          icon: ShieldCheck,
          label: 'Issuers',
          badgeCount: counts?.adminPendingIssuers,
        },
        { href: '/admin/platform-did', icon: Key, label: 'Platform DID' },
        { href: '/admin/subscription-plans', icon: Tag, label: 'Subscription Plans' },
      ]
    default:
      return []
  }
}

function roleTitle(role?: string): string {
  switch (role) {
    case 'candidate':
      return 'Candidate / Freelancer Tools'
    case 'recruiter':
      return 'Recruiter Workspace'
    case 'issuer':
      return 'Issuer Console'
    case 'admin':
      return 'Admin'
    default:
      return ''
  }
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { userPromise } = useUser()
  const { isLoading: civicLoading } = useCivicUser()
  const pathname = usePathname()

  const [user, setUser] = useState<any | null | undefined>(undefined)
  const [counts, setCounts] = useState<PendingCounts>({
    invitations: 0,
    issuerRequests: 0,
    adminPendingIssuers: 0,
  })

  useEffect(() => {
    let mounted = true
    const maybe = userPromise as unknown
    if (maybe && typeof maybe === 'object' && typeof (maybe as any).then === 'function') {
      ;(maybe as Promise<any>).then((u) => mounted && setUser(u))
    } else {
      setUser(maybe as any)
    }
    return () => {
      mounted = false
    }
  }, [userPromise])

  useEffect(() => {
    fetch('/api/pending-counts', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) =>
        setCounts({
          invitations: d.invitations ?? 0,
          issuerRequests: d.issuerRequests ?? 0,
          adminPendingIssuers: d.adminPendingIssuers ?? 0,
        }),
      )
      .catch(() => {})
  }, [])

  const mainNav: SidebarNavItem[] = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/invitations', icon: Mail, label: 'Invitations', badgeCount: counts.invitations },
    { href: '/pricing', icon: Tag, label: 'Pricing' },
  ]

  const settingsNav: SidebarNavItem[] = [
    { href: '/settings/general', icon: Settings, label: 'General' },
    { href: '/settings/team', icon: Users, label: 'Team' },
    { href: '/settings/activity', icon: Activity, label: 'Activity' },
    { href: '/settings/security', icon: Shield, label: 'Security' },
  ]

  const intrinsicNav = roleNav(user?.role, counts)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function SidebarContent() {
    return (
      <>
        <SidebarNav title='Main' items={mainNav} />
        {intrinsicNav.length > 0 && (
          <SidebarNav title={roleTitle(user?.role)} items={intrinsicNav} />
        )}
        {user && <SidebarNav title='Settings' items={settingsNav} />}
      </>
    )
  }

  const showOverlay = civicLoading && pathname.startsWith('/dashboard')

  return (
    <>
      {showOverlay && (
        <div className='bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm'>
          <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
        </div>
      )}

      <div className='mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-7xl'>
        <aside className='bg-background ring-border/30 sticky top-16 hidden h-[calc(100dvh-64px)] w-64 overflow-y-auto border-r shadow-sm ring-1 lg:block'>
          <SidebarContent />
        </aside>
        <div className='flex min-w-0 flex-1 flex-col'>
          <div className='bg-background sticky top-16 z-20 flex items-center justify-between border-b p-4 lg:hidden'>
            <span className='font-medium capitalize'>{user?.role ?? 'Dashboard'}</span>
            <Button variant='ghost' size='icon' onClick={() => setSidebarOpen((p) => !p)}>
              <Menu className='h-6 w-6' />
              <span className='sr-only'>Toggle sidebar</span>
            </Button>
          </div>
          {sidebarOpen && (
            <aside className='bg-background ring-border/30 fixed top-16 z-40 h-[calc(100dvh-64px)] w-64 overflow-y-auto border-r shadow-md ring-1 lg:hidden'>
              <SidebarContent />
            </aside>
          )}
          <main className='flex-1 overflow-y-auto p-4'>{children}</main>
        </div>
      </div>
    </>
  )
}
