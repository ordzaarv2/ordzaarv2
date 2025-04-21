import { Ordinal } from '../types'
import { apiRequest } from './client'

// Get all ordinals with optional pagination
export const getOrdinals = async (
  page: number = 1,
  limit: number = 20
): Promise<Ordinal[]> => {
  const response = await apiRequest<Ordinal[]>('GET', `/ordinals?page=${page}&limit=${limit}`)
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch ordinals')
  }
  return response.data || []
}

// Get a single ordinal by ID
export const getOrdinal = async (id: string): Promise<Ordinal> => {
  const response = await apiRequest<Ordinal>('GET', `/ordinals/${id}`)
  if (!response.success) {
    throw new Error(response.error || 'Ordinal not found')
  }
  return response.data as Ordinal
}

// List an ordinal for sale
export const listOrdinalForSale = async (
  id: string, 
  price: number
): Promise<Ordinal> => {
  const response = await apiRequest<Ordinal>('PUT', `/ordinals/${id}/list`, { price })
  if (!response.success) {
    throw new Error(response.error || 'Failed to list ordinal for sale')
  }
  return response.data as Ordinal
}

// Buy an ordinal
export const buyOrdinal = async (id: string): Promise<Ordinal> => {
  const response = await apiRequest<Ordinal>('POST', `/ordinals/${id}/buy`)
  if (!response.success) {
    throw new Error(response.error || 'Failed to buy ordinal')
  }
  return response.data as Ordinal
}

// Search ordinals
export const searchOrdinals = async (
  query: string, 
  filters: Record<string, any> = {}
): Promise<Ordinal[]> => {
  const queryParams = new URLSearchParams({ q: query, ...filters }).toString()
  const response = await apiRequest<Ordinal[]>('GET', `/ordinals/search?${queryParams}`)
  if (!response.success) {
    throw new Error(response.error || 'Failed to search ordinals')
  }
  return response.data || []
} 