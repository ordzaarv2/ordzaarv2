"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { LaserEyesClient, createStores, createConfig, ProviderType, UNISAT, XVERSE } from '@omnisat/lasereyes-core'

// Define the wallet context shape
interface WalletContextType {
  client: LaserEyesClient | null
  isConnected: boolean
  currentAddress: string | null
  balance: number | null
  isLoading: boolean
  error: string | null
  walletProvider: ProviderType | null
  connect: (provider: ProviderType) => Promise<void>
  disconnect: () => void
  handleMint: (ordinalId: string) => Promise<string | null>
  handlePurchase: (ordinalId: string, price: number) => Promise<string | null>
}

// Create the context
const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Provider component
export function WalletProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<LaserEyesClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentAddress, setCurrentAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletProvider, setWalletProvider] = useState<ProviderType | null>(null)

  // Initialize client
  useEffect(() => {
    const stores = createStores()
    const config = createConfig({ network: 'mainnet' })
    const newClient = new LaserEyesClient(stores, config)
    
    newClient.initialize()
    setClient(newClient)

    // Cleanup on unmount
    return () => {
      newClient.dispose()
    }
  }, [])

  // Update connection state when the client changes
  useEffect(() => {
    if (!client) return
    
    const checkConnection = async () => {
      try {
        const connectedState = client.$store.get()
        
        setIsConnected(!!connectedState.connected)
        setCurrentAddress(connectedState.address || null)
        
        if (connectedState.connected && connectedState.address) {
          const balanceResult = await client.getBalance()
          // Handle different possible return types from getBalance
          if (balanceResult) {
            if (typeof balanceResult.toNumber === 'function') {
              setBalance(balanceResult.toNumber())
            } else if (typeof balanceResult === 'number') {
              setBalance(balanceResult)
            } else if (typeof balanceResult === 'string') {
              setBalance(parseFloat(balanceResult))
            } else if (typeof balanceResult === 'object') {
              // Some wallets may return an object with a value property
              setBalance(Number(balanceResult.toString()))
            }
          } else {
            setBalance(0)
          }
        }
      } catch (err) {
        console.error('Error checking connection:', err)
      }
    }
    
    checkConnection()
  }, [client])

  // Connect to a wallet
  const connect = async (provider: ProviderType) => {
    if (!client) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      await client.connect(provider)
      const accounts = await client.requestAccounts()
      
      if (accounts && accounts.length > 0) {
        setIsConnected(true)
        setCurrentAddress(accounts[0])
        setWalletProvider(provider)
        
        const balanceResult = await client.getBalance()
        // Handle different possible return types from getBalance
        if (balanceResult) {
          if (typeof balanceResult.toNumber === 'function') {
            setBalance(balanceResult.toNumber())
          } else if (typeof balanceResult === 'number') {
            setBalance(balanceResult)
          } else if (typeof balanceResult === 'string') {
            setBalance(parseFloat(balanceResult))
          } else if (typeof balanceResult === 'object') {
            // Some wallets may return an object with a value property
            setBalance(Number(balanceResult.toString()))
          }
        } else {
          setBalance(0)
        }
      }
    } catch (err: any) {
      console.error('Error connecting wallet:', err)
      setError(err.message || 'Failed to connect wallet')
      setIsConnected(false)
      setCurrentAddress(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Disconnect wallet
  const disconnect = () => {
    if (!client) return
    
    try {
      client.disconnect()
      setIsConnected(false)
      setCurrentAddress(null)
      setBalance(null)
      setWalletProvider(null)
    } catch (err: any) {
      console.error('Error disconnecting wallet:', err)
    }
  }

  // Handle minting an ordinal (placeholder implementation)
  const handleMint = async (ordinalId: string): Promise<string | null> => {
    if (!client || !isConnected) {
      setError('Wallet not connected')
      return null
    }

    try {
      setIsLoading(true)
      // This is a placeholder - actual minting logic will depend on your backend API
      console.log(`Minting ordinal ${ordinalId}`)
      
      // In a real implementation, you would:
      // 1. Get a PSBT from your backend
      // 2. Sign it with the wallet
      // 3. Broadcast the transaction
      
      // For now, we'll just simulate a successful mint
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Return a mock transaction ID
      return `mock_txid_${Date.now()}`
    } catch (err: any) {
      console.error('Error minting ordinal:', err)
      setError(err.message || 'Failed to mint ordinal')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Handle purchasing an ordinal (placeholder implementation)
  const handlePurchase = async (ordinalId: string, price: number): Promise<string | null> => {
    if (!client || !isConnected) {
      setError('Wallet not connected')
      return null
    }

    if (!balance || balance < price) {
      setError('Insufficient balance')
      return null
    }

    try {
      setIsLoading(true)
      // This is a placeholder - actual purchase logic will depend on your backend API
      console.log(`Purchasing ordinal ${ordinalId} for ${price} sats`)
      
      // In a real implementation, you would:
      // 1. Get a PSBT from your backend
      // 2. Sign it with the wallet
      // 3. Broadcast the transaction
      
      // For now, we'll just simulate a successful purchase
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Return a mock transaction ID
      return `mock_txid_${Date.now()}`
    } catch (err: any) {
      console.error('Error purchasing ordinal:', err)
      setError(err.message || 'Failed to purchase ordinal')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Provide context value
  const value = {
    client,
    isConnected,
    currentAddress,
    balance,
    isLoading,
    error,
    walletProvider,
    connect,
    disconnect,
    handleMint,
    handlePurchase
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

// Custom hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
} 