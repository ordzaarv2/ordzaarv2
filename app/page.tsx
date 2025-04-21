"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Collection } from '@/lib/types'
import MarketStatsComponent from '@/components/MarketStats'

export default function Home() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedCollections = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/v1/collections');
        
        if (!res.ok) {
          console.error('Failed to fetch collections');
          return;
        }
        
        const data = await res.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Take up to 3 collections for the featured section
          setCollections(data.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCollections();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-6xl font-bold mb-8">Ordzaar</h1>
        <p className="text-xl mb-8">A modern, user-friendly marketplace for Bitcoin Ordinals NFTs</p>
        
        {/* Market Stats Component */}
        <div className="my-12">
          <MarketStatsComponent />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          <div className="p-6 border border-border rounded-lg bg-card">
            <h2 className="text-2xl font-semibold mb-4">For Creators</h2>
            <p className="mb-4 text-muted-foreground">Mint, list, and sell your Ordinals collections with ease.</p>
            <Link href="/create" className="px-4 py-2 bg-primary text-primary-foreground rounded inline-block">
              Submit Application
            </Link>
          </div>
          
          <div className="p-6 border border-border rounded-lg bg-card">
            <h2 className="text-2xl font-semibold mb-4">For Collectors</h2>
            <p className="mb-4 text-muted-foreground">Discover, purchase, and manage digital assets on the Bitcoin blockchain.</p>
            <Link href="/collections" className="px-4 py-2 bg-primary text-primary-foreground rounded inline-block">
              Browse Collections
            </Link>
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Featured Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              // Loading placeholders
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="border border-border rounded-lg overflow-hidden bg-card animate-pulse">
                  <div className="h-48 bg-muted"></div>
                  <div className="p-4">
                    <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                </div>
              ))
            ) : collections.length > 0 ? (
              // Real collections
              collections.map((collection) => (
                <Link href={`/collections/${collection.slug}`} key={collection._id}>
                  <div className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-muted relative">
                      <img 
                        src={collection.image} 
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">{collection.name}</h3>
                      <p className="text-muted-foreground truncate">{collection.description}</p>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span>{collection.minted} / {collection.totalSupply} minted</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // No collections found
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground">No collections available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
} 