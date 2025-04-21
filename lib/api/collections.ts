import { Collection, Ordinal } from '../types'
import { apiRequest } from './client'

// Get all collections
export const getCollections = async (): Promise<Collection[]> => {
  const response = await apiRequest<Collection[]>('GET', '/collections')
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch collections')
  }
  return response.data || []
}

// Get a single collection by slug
export const getCollection = async (slug: string): Promise<Collection> => {
  const response = await apiRequest<Collection>('GET', `/collections/${slug}`)
  if (!response.success) {
    throw new Error(response.error || 'Collection not found')
  }
  return response.data as Collection
}

// Get collection ordinals
export const getCollectionOrdinals = async (slug: string): Promise<Ordinal[]> => {
  const response = await apiRequest<Ordinal[]>('GET', `/collections/${slug}/ordinals`)
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch collection ordinals')
  }
  return response.data || []
}

// For admin: Create a collection from an application
export const createCollection = async (applicationId: string): Promise<Collection> => {
  const response = await apiRequest<Collection>('POST', '/collections', { applicationId })
  if (!response.success) {
    throw new Error(response.error || 'Failed to create collection')
  }
  return response.data as Collection
}

// For admin: Update collection visibility
export const updateCollectionVisibility = async (
  id: string, 
  isVisible: boolean
): Promise<Collection> => {
  const response = await apiRequest<Collection>('PUT', `/collections/${id}`, { 
    settings: { isVisible } 
  })
  if (!response.success) {
    throw new Error(response.error || 'Failed to update collection visibility')
  }
  return response.data as Collection
} 