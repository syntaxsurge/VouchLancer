'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { useUser } from '@civic/auth-web3/react'
import { Copy, Plus, Link as LinkIcon, TrendingUp, Users, Eye, Edit } from 'lucide-react'

import CopyButton from '@/components/copy-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PageCard from '@/components/ui/page-card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/lib/hooks/use-toast'
import { ensureHttp } from '@/lib/utils'

type LinkType = {
  slug: string
  name: string
  description?: string
  amount?: number
  url: string
  earnings: number
  transactions: number
  status: string
  createdAt?: string
}

export default function PaymentLinksPage() {
  const { user } = useUser()
  const router = useRouter()
  const [links, setLinks] = useState<LinkType[]>([])
  const [loading, setLoading] = useState(true)

  /* form state */
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')

  /* ----------------------------- Data helpers ----------------------------- */
  const refresh = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payment-links')
      const json = await res.json()

      /* Parse numeric fields that come back from the DB as strings */
      const parsed: LinkType[] = (json.links ?? []).map((l: any) => ({
        ...l,
        earnings: Number(l.earnings ?? 0),
        transactions: Number(l.transactions ?? 0),
        amount: l.amount !== undefined ? Number(l.amount) : undefined,
      }))

      setLinks(parsed)
    } catch {
      toast({ title: 'Failed to load links' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const totalEarnings = useMemo(() => links.reduce((s, l) => s + (l.earnings || 0), 0), [links])
  const totalTx = useMemo(() => links.reduce((s, l) => s + (l.transactions || 0), 0), [links])

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({ title: 'Name required' })
      return
    }
    const res = await fetch('/api/payment-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        amount: amount ? Number(amount) : undefined,
      }),
    })
    if (res.ok) {
      toast({ title: 'Link created' })
      setName('')
      setDescription('')
      setAmount('')
      refresh()
    } else {
      const err = await res.json()
      toast({ title: 'Error', description: err.error })
    }
  }

  if (!user) {
    return (
      <div className='flex min-h-screen items-center justify-center pt-20 pb-8'>
        <p className='text-xl text-gray-600'>Please sign in to manage links.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center pt-20 pb-8'>
        <p className='text-xl text-gray-600'>Loading…</p>
      </div>
    )
  }

  /* ------------------------------------------------------------------ */
  /* R E N D E R                                                        */
  /* ------------------------------------------------------------------ */
  return (
    <div>
      <PageCard
        icon={LinkIcon}
        title='Payment Links'
        description='Create and manage your Stripe payment links'
        actions={
          <Button
            onClick={() =>
              document.getElementById('new-link-form')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <Plus className='mr-2 h-4 w-4' /> Create New Link
          </Button>
        }
      >
        {/* Stats inside header card */}
        <div className='grid gap-6 md:grid-cols-3'>
          <StatCard icon={LinkIcon} title='Total Links' value={links.length.toString()} />
          <StatCard
            icon={TrendingUp}
            title='Total Earnings'
            value={`$${totalEarnings.toFixed(2)}`}
          />
          <StatCard icon={Users} title='Total Transactions' value={totalTx.toString()} />
        </div>
      </PageCard>

      <div className='grid gap-8 lg:grid-cols-3'>
        {/* Links list */}
        <div className='space-y-6 lg:col-span-2'>
          <Card className='shadow-md'>
            <CardHeader>
              <CardTitle>Your Payment Links</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {links.length === 0 && (
                <p className='py-8 text-center text-gray-600'>No links yet – create one!</p>
              )}
              {links.map((link) => {
                const url = ensureHttp(link.url)
                return (
                  <Card key={link.slug} className='bg-muted/20 hover:bg-muted/30 transition-colors'>
                    <CardHeader>
                      <div className='flex items-center justify-between'>
                        <div>
                          <CardTitle className='text-lg'>{link.name}</CardTitle>
                          <p className='text-primary font-mono text-sm'>{url}</p>
                          {link.description && (
                            <p className='text-muted-foreground mt-1 text-sm'>{link.description}</p>
                          )}
                        </div>
                        <Badge
                          className={
                            link.status === 'Active'
                              ? 'border-green-200 bg-green-100 text-green-700'
                              : 'border-yellow-200 bg-yellow-100 text-yellow-700'
                          }
                        >
                          {link.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <p className='text-muted-foreground text-sm'>Total Earnings</p>
                          <p className='text-lg font-bold'>${link.earnings.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className='text-muted-foreground text-sm'>Transactions</p>
                          <p className='text-lg font-bold'>{link.transactions}</p>
                        </div>
                      </div>
                      <div className='flex space-x-2'>
                        <CopyButton value={url} size='sm' variant='outline' className='flex-1'>
                          <Copy className='mr-2 h-4 w-4' /> Copy
                        </CopyButton>
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex-1'
                          onClick={() => window.open(url, '_blank')}
                        >
                          <Eye className='mr-2 h-4 w-4' /> View
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => router.push(`/candidate/payment-links/${link.slug}`)}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Create form */}
        <div className='space-y-6' id='new-link-form'>
          <Card className='shadow-md'>
            <CardHeader>
              <CardTitle>Create New Link</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='name'>Name</Label>
                <Input
                  id='name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='e.g. Design Services'
                />
              </div>
              <div>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Describe your offering…'
                />
              </div>
              <div>
                <Label htmlFor='amount'>Amount (optional, USD)</Label>
                <Input
                  id='amount'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder='100'
                />
              </div>
              <Button className='w-full' onClick={handleCreate}>
                <Plus className='mr-2 h-4 w-4' /> Create Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, title, value }: { icon: any; title: string; value: string }) {
  return (
    <Card className='bg-muted/20'>
      <CardContent className='p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='bg-primary flex h-12 w-12 items-center justify-center rounded-xl shadow-lg'>
            <Icon className='text-primary-foreground h-6 w-6' />
          </div>
        </div>
        <h3 className='mb-1 text-2xl font-bold'>{value}</h3>
        <p className='text-muted-foreground text-sm'>{title}</p>
      </CardContent>
    </Card>
  )
}
