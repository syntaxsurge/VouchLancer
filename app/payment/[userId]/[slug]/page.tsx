import { notFound } from 'next/navigation'

import { Copy, Lock, ArrowRight } from 'lucide-react'

import CopyButton from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getPaymentLink } from '@/lib/db/queries/payment-links'
import { ensureHttp } from '@/lib/utils'

interface PageProps {
  params: Promise<{ userId: string; slug: string }>
}

export default async function PaymentLinkPage({ params }: PageProps) {
  const { userId, slug } = await params
  const userIdNum = Number(userId)
  if (Number.isNaN(userIdNum)) notFound()

  const link = await getPaymentLink(userIdNum, slug)
  if (!link) notFound()

  const url = ensureHttp(link.url)
  const paused = link.status !== 'Active'

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6'>
      <Card className='w-full max-w-xl bg-white/80 shadow-2xl backdrop-blur-xl'>
        <CardHeader className='space-y-1 text-center'>
          <CardTitle className='bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-extrabold text-transparent'>
            {link.name}
          </CardTitle>
          {link.description && <p className='text-lg text-gray-700'>{link.description}</p>}
        </CardHeader>

        <CardContent className='space-y-8'>
          {paused ? (
            <div className='flex flex-col items-center space-y-4'>
              <Lock className='h-12 w-12 text-yellow-600' />
              <p className='text-xl font-semibold text-yellow-700'>This link is currently paused</p>
              <p className='max-w-sm text-center text-gray-600'>
                The creator has temporarily disabled payments for this page. Please check back
                later.
              </p>
            </div>
          ) : (
            <>
              {link.amount && (
                <div className='space-y-2 text-center'>
                  <p className='text-sm tracking-wide text-gray-600 uppercase'>Support Amount</p>
                  <p className='text-5xl font-extrabold text-gray-900'>
                    {link.amount} {link.currency}
                  </p>
                </div>
              )}

              <form action='/api/stripe/checkout' method='POST' className='flex justify-center'>
                <input type='hidden' name='linkSlug' value={link.slug} />
                <Button
                  type='submit'
                  size='lg'
                  className='bg-gradient-to-r from-purple-600 to-pink-600 text-lg transition-transform hover:scale-105 hover:from-purple-700 hover:to-pink-700'
                >
                  Pay with&nbsp;Stripe
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Button>
              </form>
            </>
          )}

          <div className='grid gap-4 sm:grid-cols-1'>
            <CopyButton value={url} className='w-full justify-center'>
              <Copy className='mr-2 h-5 w-5' />
              Copy Link
            </CopyButton>
          </div>

          <div className='space-y-1 text-center text-xs text-gray-500'>
            <p>
              Secure payments powered by <span className='font-semibold'>Vouchlancer</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
