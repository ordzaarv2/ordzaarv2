import { Application } from '../types'
import { apiRequest } from './client'

// Get all applications
export const getApplications = async (): Promise<Application[]> => {
  const response = await apiRequest<Application[]>('GET', '/applications')
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch applications')
  }
  return response.data || []
}

// Get application by ID
export const getApplication = async (id: string): Promise<Application> => {
  const response = await apiRequest<Application>('GET', `/applications/${id}`)
  if (!response.success) {
    throw new Error(response.error || 'Application not found')
  }
  return response.data as Application
}

// Create application
export const createApplication = async (applicationData: Partial<Application>): Promise<Application> => {
  const response = await apiRequest<Application>('POST', '/applications', applicationData)
  if (!response.success) {
    throw new Error(response.error || 'Failed to create application')
  }
  return response.data as Application
}

// Update application
export const updateApplication = async (
  id: string, 
  applicationData: Partial<Application>
): Promise<Application> => {
  const response = await apiRequest<Application>('PUT', `/applications/${id}`, applicationData)
  if (!response.success) {
    throw new Error(response.error || 'Failed to update application')
  }
  return response.data as Application
}

// Update application status (admin only)
export const updateApplicationStatus = async (
  id: string, 
  status: 'pending' | 'approved' | 'rejected'
): Promise<Application> => {
  const response = await apiRequest<Application>('PUT', `/applications/${id}/status`, { status })
  if (!response.success) {
    throw new Error(response.error || 'Failed to update application status')
  }
  return response.data as Application
}

// Add assets to application
export const addApplicationAssets = async (
  id: string,
  assets: { images: string[] }
): Promise<Application> => {
  const response = await apiRequest<Application>('PUT', `/applications/${id}/assets`, assets)
  if (!response.success) {
    throw new Error(response.error || 'Failed to add assets to application')
  }
  return response.data as Application
}

// Finalize application
export const finalizeApplication = async (id: string): Promise<Application> => {
  const response = await apiRequest<Application>('PUT', `/applications/${id}/finalize`)
  if (!response.success) {
    throw new Error(response.error || 'Failed to finalize application')
  }
  return response.data as Application
} 