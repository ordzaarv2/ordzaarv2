import '@/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/layout/Navbar'
import { WalletProvider } from '@/lib/wallet/context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ordzaar - Bitcoin Ordinals NFT Marketplace',
  description: 'A modern, user-friendly marketplace for Bitcoin Ordinals NFTs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        <WalletProvider>
          <Navbar />
          {children}
        </WalletProvider>
      </body>
    </html>
  )
} 