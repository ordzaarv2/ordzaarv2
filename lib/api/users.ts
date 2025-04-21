import { User, Ordinal } from '../types'
import { apiRequest } from './client'

// Get user profile
export const getUserProfile = async (username: string): Promise<User> => {
  const response = await apiRequest<User>('GET', `/users/${username}`)
  if (!response.success) {
    throw new Error(response.error || 'User not found')
  }
  return response.data as User
}

// Get user's ordinals
export const getUserOrdinals = async (username: string): Promise<Ordinal[]> => {
  const response = await apiRequest<Ordinal[]>('GET', `/users/${username}/ordinals`)
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch user ordinals')
  }
  return response.data || []
}

// Update user profile
export const updateUserProfile = async (
  username: string,
  profileData: Partial<User>
): Promise<User> => {
  const response = await apiRequest<User>('PUT', `/users/${username}`, profileData)
  if (!response.success) {
    throw new Error(response.error || 'Failed to update user profile')
  }
  return response.data as User
} 