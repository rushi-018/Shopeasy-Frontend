import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useClerkIntegration } from '../hooks/useClerkIntegration';

const ClerkTestPage = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { isLoading, error } = useClerkIntegration();
  const [backendResponse, setBackendResponse] = useState(null);
  const [testError, setTestError] = useState(null);
  const [roleApplied, setRoleApplied] = useState(null);

  const testBackendConnection = async () => {
    try {
      setTestError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/clerk/verify-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: await user.getToken() }),
      });
      
      const data = await response.json();
      setBackendResponse(data);
    } catch (err) {
      setTestError(err.message);
      console.error('Error testing backend connection:', err);
    }
  };

  // If redirected here after signup with ?role=..., set publicMetadata.role
  useEffect(() => {
    const applyRole = async () => {
      try {
        if (!isSignedIn || !user) return;
        const params = new URLSearchParams(window.location.search);
        const role = params.get('role');
        if (!role) return;
        const currentRole = user.publicMetadata?.role;
        if (currentRole !== role) {
          await user.update({ publicMetadata: { ...user.publicMetadata, role } });
        }
        setRoleApplied(role);
        // kick off backend verification to create/update DB user with role
        await testBackendConnection();
      } catch (e) {
        // ignore for now
      }
    };
    applyRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Clerk Authentication Test Page</h1>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        <p><strong>Signed In:</strong> {isSignedIn ? 'Yes' : 'No'}</p>
        <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        {error && <p className="text-red-500"><strong>Error:</strong> {error}</p>}
      </div>

      {isSignedIn && (
        <>
          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
            
            {user.imageUrl && (
              <div className="mt-4">
                <p><strong>Profile Image:</strong></p>
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Backend Connection Test</h2>
            <button
              onClick={testBackendConnection}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Test Backend Connection
            </button>
            
            {testError && (
              <p className="text-red-500 mt-4">
                <strong>Error:</strong> {testError}
              </p>
            )}
            
            {backendResponse && (
              <div className="mt-4">
                <p><strong>Backend Response:</strong></p>
                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto mt-2">
                  {JSON.stringify(backendResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </>
      )}
      
      {!isSignedIn && (
        <div className="text-center p-8">
          <p className="mb-4">You need to sign in to test the Clerk integration.</p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded"
          >
            Go to Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default ClerkTestPage;
