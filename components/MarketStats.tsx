"use client"

import { useEffect, useState } from 'react'
import { getMarketStats } from '@/lib/api/marketplace'
import { MarketStats } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

const StatCard = ({ 
  title, 
  value, 
  change 
}: { 
  title: string
  value: string | number
  change?: number
}) => (
  <div className="p-4 border border-border rounded-lg bg-card">
    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
    <p className="text-2xl font-bold mt-1">{value}</p>
    {change !== undefined && (
      <p className={`text-xs mt-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
      </p>
    )}
  </div>
)

export default function MarketStatsComponent() {
  const [stats, setStats] = useState<MarketStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await getMarketStats()
        setStats(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching market stats:', err)
        setError('Failed to load market statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // Refresh stats every 5 minutes
    const intervalId = setInterval(fetchStats, 5 * 60 * 1000)
    
    return () => clearInterval(intervalId)
  }, [])

  if (loading) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="p-4 border border-border rounded-lg bg-card animate-pulse">
              <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Volume" 
          value={`₿${formatNumber(stats.totalVolume)}`} 
        />
        <StatCard 
          title="Daily Volume" 
          value={`₿${formatNumber(stats.dailyVolume)}`} 
        />
        <StatCard 
          title="Total Sales" 
          value={formatNumber(stats.totalSales)} 
        />
        <StatCard 
          title="Daily Sales" 
          value={formatNumber(stats.dailySales)} 
        />
        <StatCard 
          title="Floor Price" 
          value={`₿${formatNumber(stats.floorPrice)}`} 
        />
        <StatCard 
          title="Average Price" 
          value={`₿${formatNumber(stats.averagePrice)}`} 
        />
        <StatCard 
          title="Total Listings" 
          value={formatNumber(stats.totalListings)} 
        />
        <StatCard 
          title="Active Listings" 
          value={formatNumber(stats.activeListings)} 
        />
      </div>
    </div>
  )
} 