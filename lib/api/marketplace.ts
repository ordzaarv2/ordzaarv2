import { Ordinal, MarketStats, Transaction } from '../types'
import { apiRequest } from './client'

// Get marketplace stats
export const getMarketStats = async (): Promise<MarketStats> => {
  const response = await apiRequest<MarketStats>('GET', '/marketplace/stats')
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch marketplace stats')
  }
  return response.data as MarketStats
}

// Get trending ordinals
export const getTrendingOrdinals = async (limit: number = 10): Promise<Ordinal[]> => {
  const response = await apiRequest<Ordinal[]>('GET', `/marketplace/trending?limit=${limit}`)
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch trending ordinals')
  }
  return response.data || []
}

// Get recent sales
export const getRecentSales = async (limit: number = 10): Promise<Transaction[]> => {
  const response = await apiRequest<Transaction[]>('GET', `/marketplace/recent-sales?limit=${limit}`)
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch recent sales')
  }
  return response.data || []
}

// Get featured collections
export const getFeaturedCollections = async (): Promise<any[]> => {
  const response = await apiRequest<any[]>('GET', '/marketplace/featured-collections')
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch featured collections')
  }
  return response.data || []
}

// Get price history for an ordinal
export const getOrdinalPriceHistory = async (id: string): Promise<any[]> => {
  const response = await apiRequest<any[]>('GET', `/marketplace/price-history/${id}`)
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch price history')
  }
  return response.data || []
}

// Fetch a specific collection by slug
export const getCollectionBySlug = async (slug: string) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const response = await fetch(`${apiUrl}/collections/${slug}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch collection');
    }
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching collection:', error);
    throw error;
  }
};

// Fetch ordinals for a specific collection
export const getCollectionOrdinals = async (slug: string) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const response = await fetch(`${apiUrl}/collections/${slug}/ordinals`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch collection ordinals');
    }
    
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching collection ordinals:', error);
    throw error;
  }
};

// Fetch a specific ordinal by ID
export const getOrdinalById = async (id: string) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const response = await fetch(`${apiUrl}/ordinals/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch ordinal');
    }
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching ordinal:', error);
    throw error;
  }
}; 