"use client"

import { useState, useEffect } from 'react'
import { Application } from '@/lib/types'
import Link from 'next/link'

export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        
        // Make the API call to the direct backend URL
        const res = await fetch('http://localhost:5000/api/v1/applications');
        
        if (!res.ok) {
          const text = await res.text();
          console.error('Raw response:', text);
          try {
            const errorData = JSON.parse(text);
            throw new Error(errorData.error || 'Failed to load applications');
          } catch (parseError) {
            throw new Error(`Failed to load applications: ${text.substring(0, 100)}...`);
          }
        }
        
        const text = await res.text();
        console.log('Raw response:', text);
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
        }
        
        setApplications(data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err instanceof Error ? err.message : 'Failed to load applications');
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleStatusChange = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      console.log('Updating application status:', { id, status });
      
      // Make the API call to update the status
      const response = await fetch(`http://localhost:5000/api/v1/applications/${id}/status`, { 
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status }) 
      });
      
      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to update status');
        } catch (parseError) {
          throw new Error(`Failed to update status: ${text.substring(0, 100)}...`);
        }
      }
      
      // Update the state with the response data
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
      }
      
      setApplications(applications.map(app => 
        app._id === id ? result.data : app
      ));
      
    } catch (error) {
      console.error('Error updating application status:', error);
      alert(error instanceof Error ? error.message : 'Failed to update application status');
    }
  }

  const handleCreateCollection = async (applicationId: string) => {
    try {
      console.log('Creating collection for application:', applicationId);
      
      // Make the API call to create a collection
      const response = await fetch('http://localhost:5000/api/v1/collections', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ applicationId }) 
      });
      
      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to create collection');
        } catch (parseError) {
          throw new Error(`Failed to create collection: ${text.substring(0, 100)}...`);
        }
      }
      
      // Get updated application after collection creation
      const appResponse = await fetch(`http://localhost:5000/api/v1/applications/${applicationId}`);
      if (!appResponse.ok) {
        throw new Error('Failed to get updated application data');
      }
      
      const appText = await appResponse.text();
      let appData;
      try {
        appData = JSON.parse(appText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${appText.substring(0, 100)}...`);
      }
      
      setApplications(applications.map(app => 
        app._id === applicationId ? appData.data : app
      ));
      
      alert('Collection created successfully!');
      
    } catch (error) {
      console.error('Error creating collection:', error);
      alert(error instanceof Error ? error.message : 'Failed to create collection');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading applications...</div>
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
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Collection Applications</h2>
          <div className="text-sm text-muted-foreground">Total: {applications.length}</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Creator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Supply</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.map((application) => (
                <tr key={application._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{application.name}</div>
                    <div className="text-sm text-muted-foreground">{application.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {application.creator}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {application.stats.totalSupply}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {application.price} BTC
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      application.status === 'approved' ? 'bg-emerald-900 text-emerald-100' : 
                      application.status === 'pending' ? 'bg-amber-900 text-amber-100' : 
                      'bg-rose-900 text-rose-100'
                    }`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(application.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {application.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleStatusChange(application._id, 'approved')}
                            className="text-emerald-400 hover:text-emerald-300"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleStatusChange(application._id, 'rejected')}
                            className="text-rose-400 hover:text-rose-300"
                          >
                            Reject
                          </button>
                        </>
                      ) : application.status === 'approved' && application.isComplete ? (
                        <button 
                          onClick={() => handleCreateCollection(application._id)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Create Collection
                        </button>
                      ) : null}
                      
                      <Link href={`/admin/applications/${application._id}`} className="text-gray-400 hover:text-gray-300">
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {applications.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No applications found</p>
          </div>
        )}
      </div>
    </main>
  )
} 