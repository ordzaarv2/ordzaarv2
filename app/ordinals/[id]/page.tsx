"use client"

import { useState, useEffect } from 'react'
import { Ordinal } from '@/lib/types'
import Link from 'next/link'
import { getOrdinalById } from '@/lib/api/marketplace'
import { getImageUrl } from '@/lib/utils'
import { useWallet } from '@/lib/wallet/context'

export default function OrdinalDetailPage({ params }: { params: { id: string } }) {
  const [ordinal, setOrdinal] = useState<Ordinal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  
  const { 
    isConnected, 
    isLoading: walletLoading, 
    error: walletError, 
    handleMint,
    handlePurchase
  } = useWallet()

  useEffect(() => {
    const fetchOrdinalData = async () => {
      try {
        setLoading(true);
        
        const ordinalData = await getOrdinalById(params.id);
        
        if (!ordinalData) {
          throw new Error('Ordinal not found');
        }
        
        setOrdinal(ordinalData);
        setError(null);
      } catch (err) {
        console.error('Error fetching ordinal data:', err);
        setError('Failed to load ordinal');
      } finally {
        setLoading(false);
      }
    };

    fetchOrdinalData();
  }, [params.id]);

  const handleAction = async () => {
    if (!ordinal) return;
    
    try {
      let txId = null;
      
      if (ordinal.status === 'pending') {
        // Handle minting
        txId = await handleMint(ordinal.id);
      } else {
        // Handle purchase
        const price = parseFloat(ordinal.price);
        txId = await handlePurchase(ordinal.id, price);
      }
      
      if (txId) {
        setActionSuccess(`Transaction successful! TX ID: ${txId}`);
        
        // Refresh data after a delay
        setTimeout(() => {
          setLoading(true);
          getOrdinalById(params.id)
            .then(data => {
              setOrdinal(data);
              setActionSuccess(null);
            })
            .catch(err => {
              console.error('Error refreshing data:', err);
            })
            .finally(() => {
              setLoading(false);
            });
        }, 3000);
      }
    } catch (err) {
      console.error('Action error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading ordinal...</div>
      </div>
    )
  }

  if (error || !ordinal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-red-500">{error || 'Ordinal not found'}</div>
      </div>
    )
  }
  
  // Get collection slug from ordinal's collection property
  const collectionId = ordinal.collection;

  return (
    <main className="container mx-auto py-8 px-4">
      {collectionId && (
        <Link href={`/collections/${collectionId}`} className="text-blue-500 mb-4 inline-block">
          ← Back to Collection
        </Link>
      )}
      
      {actionSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
          {actionSuccess}
        </div>
      )}
      
      {walletError && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
          {walletError}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <div className="border rounded-lg overflow-hidden">
            <img 
              src={getImageUrl(ordinal.image)} 
              alt={ordinal.name}
              className="w-full h-auto"
            />
          </div>
        </div>
        
        <div>
          <h1 className="text-4xl font-bold mb-4">{ordinal.name}</h1>
          <p className="text-gray-600 mb-6">{ordinal.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500">Ordinal Number</div>
              <div className="text-2xl font-medium">#{ordinal.ordinalNumber}</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500">Price</div>
              <div className="text-2xl font-medium">{ordinal.price} BTC</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500">Status</div>
              <div className="text-2xl font-medium capitalize">{ordinal.status}</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500">Owner</div>
              <div className="text-2xl font-medium">{ordinal.owner}</div>
            </div>
          </div>
          
          {ordinal.blockchainData && (
            <div className="border rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-2">Blockchain Data</h3>
              {ordinal.blockchainData.inscriptionId && (
                <div className="mb-2">
                  <div className="text-sm text-gray-500">Inscription ID</div>
                  <div className="font-mono text-sm truncate">{ordinal.blockchainData.inscriptionId}</div>
                </div>
              )}
              {ordinal.blockchainData.txid && (
                <div className="mb-2">
                  <div className="text-sm text-gray-500">Transaction ID</div>
                  <div className="font-mono text-sm truncate">{ordinal.blockchainData.txid}</div>
                </div>
              )}
              {ordinal.blockchainData.contentType && (
                <div className="mb-2">
                  <div className="text-sm text-gray-500">Content Type</div>
                  <div>{ordinal.blockchainData.contentType}</div>
                </div>
              )}
            </div>
          )}
          
          <button 
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium w-full mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isConnected || walletLoading}
            onClick={handleAction}
          >
            {walletLoading ? 'Processing...' : (
              isConnected ? (
                ordinal.status === 'pending' ? 'Mint this Ordinal' : 'Buy this Ordinal'
              ) : 'Connect Wallet to Continue'
            )}
          </button>
          
          {ordinal.status === 'minted' && isConnected && (
            <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium w-full">
              Make Offer
            </button>
          )}
        </div>
      </div>
    </main>
  )
} 