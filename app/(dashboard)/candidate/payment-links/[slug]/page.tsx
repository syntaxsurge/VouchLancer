'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { ArrowLeft, Copy, Eye, Settings, Trash2 } from 'lucide-react'

import CopyButton from '@/components/copy-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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

export default function CandidatePaymentLinkEdit() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [link, setLink] = useState<LinkType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  /* form state */
  const [active, setActive] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState<string>('')

  /* ----------------------------- Load link ----------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await fetch(`/api/payment-links/${slug}`)
      if (!res.ok) {
        toast({ title: 'Link not found' })
        router.replace('/candidate/payment-links')
        return
      }
      const { link } = await res.json()
      /* Parse numeric fields */
      const parsed: LinkType = {
        ...link,
        earnings: Number(link.earnings ?? 0),
        transactions: Number(link.transactions ?? 0),
        amount: link.amount !== undefined ? Number(link.amount) : undefined,
      }
      setLink(parsed)
      setName(parsed.name)
      setDescription(parsed.description ?? '')
      setAmount(parsed.amount !== undefined ? parsed.amount.toString() : '')
      setActive(parsed.status === 'Active')
      setLoading(false)
    }
    if (slug) {
      load()
    }
  }, [slug, router])

  const linkUrl = useMemo(() => (link ? ensureHttp(link.url) : ''), [link])

  /* ----------------------------- Actions ----------------------------- */
  const handleSave = async () => {
    if (!link) return
    setSaving(true)
    const res = await fetch(`/api/payment-links/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim(),
        amount: amount ? Number(amount) : undefined,
        status: active ? 'Active' : 'Paused',
      }),
    })
    setSaving(false)
    if (res.ok) {
      const { link: updated } = await res.json()
      setLink({
        ...updated,
        earnings: Number(updated.earnings ?? 0),
        transactions: Number(updated.transactions ?? 0),
        amount: updated.amount !== undefined ? Number(updated.amount) : undefined,
      })
      toast({ title: 'Changes saved' })
    } else {
      toast({ title: 'Error saving changes' })
    }
  }

  const handleDelete = async () => {
    if (!link) return
    if (!confirm('Delete this payment link? This cannot be undone.')) return
    setDeleting(true)
    const res = await fetch(`/api/payment-links/${slug}`, { method: 'DELETE' })
    setDeleting(false)
    if (res.ok) {
      toast({ title: 'Link deleted' })
      router.replace('/candidate/payment-links')
    } else {
      toast({ title: 'Error deleting link' })
    }
  }

  /* ----------------------------- Render ----------------------------- */
  if (loading || !link) {
    return (
      <div className='flex min-h-screen items-center justify-center pt-20 pb-8'>
        <p className='text-xl text-gray-600'>Loading…</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='sm' onClick={() => router.push('/candidate/payment-links')}>
          <ArrowLeft className='mr-2 h-4 w-4' /> Back
        </Button>
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

      <Card className='shadow-lg'>
        <CardHeader>
          <CardTitle>Edit Payment Link</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* URL */}
          <div className='space-y-2'>
            <Label>Payment URL</Label>
            <div className='flex gap-2'>
              <Input value={linkUrl} readOnly className='flex-1' />
              <CopyButton value={linkUrl} variant='outline' size='sm'>
                <Copy className='mr-1 h-4 w-4' /> Copy
              </CopyButton>
              <Button variant='outline' size='sm' onClick={() => window.open(linkUrl, '_blank')}>
                <Eye className='mr-1 h-4 w-4' /> View
              </Button>
            </div>
          </div>

          {/* Status */}
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>Link Status</Label>
              <p className='text-muted-foreground text-sm'>Enable or pause this link</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>

          {/* Name */}
          <div className='space-y-2'>
            <Label>Link Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className='space-y-2'>
            <Label>Amount (optional, USD)</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder='0.00' />
          </div>

          {/* Actions */}
          <div className='flex gap-4 pt-4'>
            <Button disabled={saving} onClick={handleSave}>
              {saving ? (
                'Saving…'
              ) : (
                <>
                  <Settings className='mr-2 h-4 w-4' /> Save Changes
                </>
              )}
            </Button>
            <Button
              variant='outline'
              className='border-red-200 text-red-600 hover:bg-red-50'
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? (
                'Deleting…'
              ) : (
                <>
                  <Trash2 className='mr-2 h-4 w-4' /> Delete
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <Card className='shadow-md'>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-2 gap-4 text-center'>
          <div>
            <p className='text-muted-foreground text-sm'>Total Earnings</p>
            <p className='text-2xl font-bold'>${link.earnings.toFixed(2)}</p>
          </div>
          <div>
            <p className='text-muted-foreground text-sm'>Transactions</p>
            <p className='text-2xl font-bold'>{link.transactions}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
