"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Collection } from '@/lib/types'
import { getImageUrl } from '@/lib/utils'

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        
        // Fetch collections from the API
        const res = await fetch('http://localhost:5000/api/v1/collections');
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Error fetching collections:', errorText);
          throw new Error('Failed to fetch collections');
        }
        
        const data = await res.json();
        console.log('Fetched collections:', data);
        
        // Make sure we have the expected data structure
        if (data.success && Array.isArray(data.data)) {
          // Log each collection's image property
          data.data.forEach((collection: Collection, index: number) => {
            console.log(`Collection ${index} (${collection.name}) image:`, collection.image);
            
            // Check if image value starts with http or /uploads
            const isValidImage = collection.image && (
              collection.image.startsWith('http') || 
              collection.image.startsWith('/uploads')
            );
            
            console.log(`Collection ${index} has valid image path:`, isValidImage);
          });
          
          setCollections(data.data);
        } else {
          setCollections([]);
          console.warn('API returned unexpected data format:', data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchCollections:', err);
        setError('Failed to load collections');
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading collections...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-destructive">{error}</div>
      </div>
    )
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Collections</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map((collection) => {
          // Log each image URL for debugging
          console.log(`Rendering collection ${collection.name} with image:`, collection.image);
          
          return (
            <Link href={`/collections/${collection.slug}`} key={collection.id || collection._id}>
              <div className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-card">
                <div className="h-48 bg-muted relative">
                  <img 
                    src={getImageUrl(collection.image)} 
                    alt={collection.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(`Error loading image for ${collection.name}:`, collection.image);
                      // @ts-ignore
                      e.target.src = 'http://localhost:5000/uploads/placeholder.jpg';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold">{collection.name}</h2>
                  <p className="text-muted-foreground truncate">{collection.description}</p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Price</div>
                      <div className="font-medium">{collection.price} BTC</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Minted</div>
                      <div className="font-medium">{collection.minted} / {collection.totalSupply}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {collections.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No collections available yet</p>
        </div>
      )}
    </main>
  )
} 