"use client"

import { useState, useEffect } from 'react'
import { Collection, Ordinal } from '@/lib/types'
import Link from 'next/link'
import { getCollectionBySlug, getCollectionOrdinals } from '@/lib/api/marketplace'
import { getImageUrl } from '@/lib/utils'
import { useWallet } from '@/lib/wallet/context'

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [ordinals, setOrdinals] = useState<Ordinal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mintSuccess, setMintSuccess] = useState<string | null>(null)
  
  const { isConnected, isLoading: walletLoading, error: walletError, handleMint } = useWallet()

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        setLoading(true);
        
        // Fetch real collection data from the API
        const [collectionData, ordinalsData] = await Promise.all([
          getCollectionBySlug(params.slug),
          getCollectionOrdinals(params.slug)
        ]);
        
        if (!collectionData) {
          throw new Error('Collection not found');
        }
        
        setCollection(collectionData);
        setOrdinals(ordinalsData || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching collection data:', err);
        setError('Failed to load collection');
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionData();
  }, [params.slug]);

  const handleMintClick = async () => {
    if (!collection) return
    
    try {
      // Choose the first unminted ordinal
      const unmintedOrdinal = ordinals.find(o => o.status === 'pending')
      
      if (unmintedOrdinal) {
        const txId = await handleMint(unmintedOrdinal.id)
        if (txId) {
          setMintSuccess(`Successfully initiated mint! Transaction ID: ${txId}`)
          
          // Refresh ordinals after a short delay
          setTimeout(() => {
            // Call the fetch data function to refresh
            setLoading(true);
            Promise.all([
              getCollectionBySlug(params.slug),
              getCollectionOrdinals(params.slug)
            ]).then(([collectionData, ordinalsData]) => {
              setCollection(collectionData);
              setOrdinals(ordinalsData || []);
              setMintSuccess(null);
            }).catch(err => {
              console.error('Error refreshing data:', err);
            }).finally(() => {
              setLoading(false);
            });
          }, 3000)
        }
      }
    } catch (err) {
      console.error('Error minting:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading collection...</div>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-red-500">{error || 'Collection not found'}</div>
      </div>
    )
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <Link href="/collections" className="text-blue-500 mb-4 inline-block">
        ← Back to Collections
      </Link>
      
      {mintSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
          {mintSuccess}
        </div>
      )}
      
      {walletError && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
          {walletError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <img 
            src={getImageUrl(collection.image)} 
            alt={collection.name}
            className="w-full h-auto rounded-lg"
          />
        </div>
        
        <div>
          <h1 className="text-4xl font-bold mb-4">{collection.name}</h1>
          <p className="text-gray-600 mb-6">{collection.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500">Price</div>
              <div className="text-2xl font-medium">{collection.price} BTC</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500">Minted</div>
              <div className="text-2xl font-medium">{collection.minted} / {collection.totalSupply}</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500">Floor Price</div>
              <div className="text-2xl font-medium">{collection.stats.floorPrice} BTC</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500">Volume</div>
              <div className="text-2xl font-medium">{collection.stats.volume} BTC</div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">Creator</div>
            <div className="font-medium">{collection.creator}</div>
          </div>
          
          <button 
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isConnected || walletLoading}
            onClick={handleMintClick}
          >
            {walletLoading 
              ? 'Processing...' 
              : isConnected 
                ? 'Mint Now' 
                : 'Connect Wallet to Mint'
            }
          </button>
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Collection Items</h2>
        
        {ordinals.length === 0 ? (
          <div className="text-center py-12 border border-border rounded-lg">
            <p className="text-muted-foreground">No items available in this collection yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ordinals.map((ordinal) => (
              <Link href={`/ordinals/${ordinal.id}`} key={ordinal.id}>
                <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gray-200 relative">
                    <img 
                      src={getImageUrl(ordinal.image)} 
                      alt={ordinal.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Error loading image for ${ordinal.name}:`, ordinal.image);
                        // @ts-ignore
                        e.target.src = 'http://localhost:5000/uploads/placeholder.jpg';
                      }}
                    />
                    <div className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${
                      ordinal.status === 'minted' ? 'bg-green-100 text-green-800' : 
                      ordinal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {ordinal.status.charAt(0).toUpperCase() + ordinal.status.slice(1)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{ordinal.name}</h3>
                    <div className="text-sm text-gray-500 mt-2">#{ordinal.ordinalNumber}</div>
                    <div className="mt-3">
                      <span className="font-medium">{ordinal.price} BTC</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
} 