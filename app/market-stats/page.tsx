"use client"

import { useEffect, useState } from 'react'
import { getMarketStats, getTrendingOrdinals, getRecentSales } from '@/lib/api/marketplace'
import { MarketStats, Ordinal, Transaction } from '@/lib/types'
import MarketStatsComponent from '@/components/MarketStats'
import Link from 'next/link'
import { formatNumber } from '@/lib/utils'

export default function MarketStatsPage() {
  const [trendingOrdinals, setTrendingOrdinals] = useState<Ordinal[]>([])
  const [recentSales, setRecentSales] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [trendsData, salesData] = await Promise.all([
          getTrendingOrdinals(5),
          getRecentSales(5)
        ])
        
        setTrendingOrdinals(trendsData)
        setRecentSales(salesData)
        setError(null)
      } catch (err) {
        console.error('Error fetching market data:', err)
        setError('Failed to load market data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
      <div className="max-w-6xl w-full">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Market Statistics</h1>
          <p className="text-muted-foreground">
            Real-time insights into the Bitcoin Ordinals marketplace
          </p>
        </div>

        {/* Market Stats Component */}
        <div className="mb-16">
          <MarketStatsComponent />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Trending Ordinals */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Trending Ordinals</h2>
            {loading ? (
              <div className="animate-pulse">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 mb-3 flex items-center">
                    <div className="h-12 w-12 bg-muted rounded mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <p className="text-red-500">{error}</p>
              </div>
            ) : trendingOrdinals.length > 0 ? (
              <div>
                {trendingOrdinals.map((ordinal) => (
                  <Link href={`/ordinals/${ordinal.id}`} key={ordinal.id}>
                    <div className="border border-border rounded-lg p-4 mb-3 flex items-center hover:bg-accent/20 transition-colors">
                      <div className="h-12 w-12 bg-muted rounded mr-4 relative overflow-hidden">
                        {ordinal.blockchainData?.contentType?.startsWith('image/') && (
                          <img 
                            src={ordinal.image} 
                            alt={ordinal.name || 'Ordinal'} 
                            className="object-cover h-full w-full"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{ordinal.name || `Ordinal #${ordinal.ordinalNumber}`}</h3>
                        <p className="text-sm text-muted-foreground">
                          Collection • ₿{ordinal.price ? parseFloat(ordinal.price) : 'Unlisted'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-border rounded-lg">
                <p className="text-muted-foreground">No trending ordinals available</p>
              </div>
            )}
          </div>

          {/* Recent Sales */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
            {loading ? (
              <div className="animate-pulse">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 mb-3 flex items-center">
                    <div className="h-12 w-12 bg-muted rounded mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <p className="text-red-500">{error}</p>
              </div>
            ) : recentSales.length > 0 ? (
              <div>
                {recentSales.map((sale) => (
                  <Link href={`/ordinals/${sale.ordinalId}`} key={sale.id}>
                    <div className="border border-border rounded-lg p-4 mb-3 flex items-center hover:bg-accent/20 transition-colors">
                      <div className="h-12 w-12 bg-muted rounded mr-4 relative overflow-hidden">
                        {/* Placeholder for transaction item */}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Transaction {sale.id.substring(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {sale.amount ? `Sold for ₿${formatNumber(parseFloat(sale.amount))}` : 'Transfer'} • {new Date(sale.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-border rounded-lg">
                <p className="text-muted-foreground">No recent sales available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
} 