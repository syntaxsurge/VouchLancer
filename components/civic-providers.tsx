'use client'

import { useRouter } from 'next/navigation'
import React, { ReactNode, useEffect, useState, useRef } from 'react'

import { userHasWallet } from '@civic/auth-web3'
import { CivicAuthProvider, useUser } from '@civic/auth-web3/react'
import { embeddedWallet } from '@civic/auth-web3/wagmi'
import {
  ConnectionProvider as RawConnectionProvider,
  WalletProvider as RawWalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider as RawWalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { http } from 'viem'
import { mainnet } from 'viem/chains'
import {
  WagmiProvider,
  createConfig,
  useConnect,
  useAccount,
  useDisconnect,
  type Connector,
} from 'wagmi'

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const queryClient = new QueryClient()

const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: { [mainnet.id]: http() },
  connectors: [embeddedWallet()],
})

const SOLANA_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com'
const CIVIC_CLIENT_ID = process.env.NEXT_PUBLIC_CIVIC_AUTH_CLIENT_ID || ''

/* Re‑cast wallet‑adapter types to keep TS happy in a Next.js environment */
const ConnectionProvider = RawConnectionProvider as unknown as React.ComponentType<{
  endpoint: string
  children: React.ReactNode
}>

const WalletProvider = RawWalletProvider as unknown as React.ComponentType<{
  wallets: any[]
  autoConnect?: boolean
  children: React.ReactNode
}>

const WalletModalProvider = RawWalletModalProvider as unknown as React.ComponentType<{
  children: React.ReactNode
}>

/* -------------------------------------------------------------------------- */
/*                             A U T O   C O N N E C T                        */
/* -------------------------------------------------------------------------- */

function AutoConnect() {
  const ctx = useUser()
  const { connectors, connect } = useConnect()
  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const router = useRouter()

  /* Attach embedded Civic connector silently if the user already has a wallet */
  useEffect(() => {
    if (!ctx.user || !userHasWallet(ctx) || isConnected) return
    const civicConnector = connectors.find((c: Connector) => c.id === 'civic')
    if (civicConnector) {
      connect({ connector: civicConnector })
    }
  }, [ctx.user, isConnected, connectors, connect])

  /* Persist (or upsert) the user on the server and create the session cookie */
  const [synced, setSynced] = useState(false)
  useEffect(() => {
    if (synced || !ctx.user) return

    const role =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('signup_role') || undefined
        : undefined

    fetch('/api/civic/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ctx.user.email || '',
        name: ctx.user.name || '',
        role,
      }),
      credentials: 'include',
    })
      .catch(() => {}) // fire‑and‑forget
      .finally(() => {
        setSynced(true)
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('signup_role')
        }
      })
  }, [ctx.user, synced])

  /* ---------------------------------------------------------------------- */
  /* Redirect user only ONCE after first successful login                   */
  /* ---------------------------------------------------------------------- */
  const postLoginHandled = useRef(false)

  useEffect(() => {
    if (!(ctx.user && synced) || postLoginHandled.current) return

    /* If the user just logged in from the landing page or auth‑gate, move them
       to dashboard; otherwise stay on the current route and simply refresh */
    const path = typeof window !== 'undefined' ? window.location.pathname : '/'

    const shouldJumpToDashboard = path === '/' || path === '/auth-required'

    if (shouldJumpToDashboard) {
      router.replace('/dashboard')
    } else {
      router.refresh()
    }

    postLoginHandled.current = true
  }, [ctx.user, synced, router])

  /* Disconnect embedded wallet when the user signs out */
  useEffect(() => {
    if (!ctx.user && isConnected) {
      disconnect()
    }
  }, [ctx.user, isConnected, disconnect])

  return null
}

/* -------------------------------------------------------------------------- */
/*                               P R O V I D E R S                            */
/* -------------------------------------------------------------------------- */

export default function CivicProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <ConnectionProvider endpoint={SOLANA_RPC}>
          <WalletProvider wallets={[]} autoConnect>
            <WalletModalProvider>
              <CivicAuthProvider clientId={CIVIC_CLIENT_ID} initialChain={mainnet}>
                <AutoConnect />
                {children}
                <Toaster richColors position='top-right' />
              </CivicAuthProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}
