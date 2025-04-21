"use client"

import { useState } from 'react'
import Link from 'next/link'

export default function CreateApplicationPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    totalSupply: '',
  })
  
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setImages(filesArray)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    
    try {
      // Form an application object for the API payload
      const applicationData = {
        name: formData.name,
        description: formData.description,
        creator: 'current-user', // In real app, this would be the authenticated user
        price: formData.price,
        stats: {
          totalSupply: parseInt(formData.totalSupply),
          minted: 0
        }
      }
      
      console.log('Submitting application data:', applicationData);
      
      // Make the API call to the direct backend URL
      const response = await fetch('http://localhost:5000/api/v1/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      })
      
      console.log('Response status:', response.status);
      
      // Get the raw text response for debugging
      const rawResponse = await response.text();
      console.log('Raw response:', rawResponse);
      
      // Check if JSON parsing will work
      let jsonData;
      try {
        jsonData = JSON.parse(rawResponse);
      } catch (error) {
        throw new Error(`Invalid JSON response: ${rawResponse.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        throw new Error(jsonData.error || `Server error: ${response.status}`);
      }
      
      console.log('Application submitted successfully:', jsonData);
      
      // Handle file uploads if the application was created successfully
      if (jsonData.data && (jsonData.data._id || jsonData.data.id)) {
        const applicationId = jsonData.data._id || jsonData.data.id;
        console.log('Uploading images for application:', applicationId);
        
        // Upload images
        const formDataWithImages = new FormData();
        images.forEach((image, index) => {
          console.log(`Adding image ${index} to form data:`, image.name);
          formDataWithImages.append('images', image);
        });
        
        try {
          const assetResponse = await fetch(`http://localhost:5000/api/v1/applications/${applicationId}/assets`, {
            method: 'PUT',
            body: formDataWithImages
          });
          
          console.log('Asset upload response status:', assetResponse.status);
          const assetResponseText = await assetResponse.text();
          console.log('Asset upload response:', assetResponseText);
          
          if (!assetResponse.ok) {
            console.warn('Assets upload failed, but application was created:', assetResponseText);
          } else {
            console.log('Assets uploaded successfully');
          }
        } catch (uploadError) {
          console.error('Error uploading assets:', uploadError);
        }
      } else {
        console.error('No application ID found in response:', jsonData);
      }
      
      // Show success message
      setSubmissionSuccess(true);
      
    } catch (error) {
      console.error('Error submitting application:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (submissionSuccess) {
    return (
      <main className="container mx-auto py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-card p-8 rounded-lg shadow-md border border-border">
          <h1 className="text-3xl font-bold text-emerald-400 mb-4">Application Submitted!</h1>
          <p className="mb-6">
            Your collection application has been submitted for review. Our team will review your application soon.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/"
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Return Home
            </Link>
            <Link 
              href="/create"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              onClick={() => {
                setSubmissionSuccess(false)
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  totalSupply: '',
                })
                setImages([])
              }}
            >
              Create Another
            </Link>
          </div>
        </div>
      </main>
    )
  }
  
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Submit Collection Application</h1>
        
        <div className="bg-card rounded-lg shadow-md p-6 mb-8 border border-border">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                  Collection Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1">
                  Price (BTC) *
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  required
                  placeholder="0.001"
                  pattern="^0\.\d+$"
                  title="Please enter a valid BTC amount (e.g., 0.001)"
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="totalSupply" className="block text-sm font-medium text-foreground mb-1">
                Total Supply *
              </label>
              <input
                type="number"
                id="totalSupply"
                name="totalSupply"
                required
                min="1"
                max="10000"
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.totalSupply}
                onChange={handleInputChange}
              />
              <p className="mt-1 text-sm text-muted-foreground">Maximum supply: 10,000 items</p>
            </div>
            
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-1">
                Collection Images *
              </label>
              <input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                required
                className="w-full p-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={handleFileChange}
              />
              <p className="mt-1 text-sm text-muted-foreground">Upload images for your collection (PNG, JPG, GIF)</p>
              
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center"
                        onClick={() => setImages(images.filter((_, i) => i !== index))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
} 