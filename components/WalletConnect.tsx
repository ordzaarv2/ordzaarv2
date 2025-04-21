"use client"

import { useState } from 'react'
import { UNISAT, XVERSE } from '@omnisat/lasereyes-core'
import { useWallet } from '@/lib/wallet/context'
import { truncateString } from '@/lib/utils'

export default function WalletConnect() {
  const { isConnected, currentAddress, balance, isLoading, error, connect, disconnect } = useWallet()
  const [isOpen, setIsOpen] = useState(false)

  const handleConnect = async (wallet: any) => {
    try {
      await connect(wallet)
      setIsOpen(false)
    } catch (err) {
      console.error('Failed to connect wallet:', err)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setIsOpen(false)
  }

  const formatBalance = (satoshis: number | null) => {
    if (satoshis === null || satoshis === undefined || isNaN(satoshis)) {
      return '0.00000000'
    }
    // Convert satoshis to BTC (1 BTC = 100,000,000 satoshis)
    return (satoshis / 100000000).toFixed(8)
  }

  if (isConnected && currentAddress) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
        >
          <span className="hidden md:inline">{truncateString(currentAddress, 6, 4)}</span>
          <span className="md:ml-2">{formatBalance(balance)} BTC</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-10">
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Connected Address</p>
              <p className="font-mono text-sm mb-4 truncate">{currentAddress}</p>
              
              <p className="text-sm text-muted-foreground mb-1">Balance</p>
              <p className="font-medium mb-4">{formatBalance(balance)} BTC</p>
              
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        disabled={isLoading}
      >
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-10">
          <div className="p-4">
            <h3 className="font-medium mb-3">Select a wallet</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => handleConnect(UNISAT)}
                className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-left flex items-center"
              >
                <span>UniSat</span>
              </button>
              
              <button
                onClick={() => handleConnect(XVERSE)}
                className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-left flex items-center"
              >
                <span>Xverse</span>
              </button>
            </div>
            
            {error && (
              <p className="text-red-500 text-sm mt-3">{error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 