import { useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useSession } from '@clerk/clerk-react';
import { useDispatch } from 'react-redux';
import { setUser, logout } from '../store/slices/authSlice';
import { clerkService } from '../services/clerkService';

export function useClerkIntegration() {
  const { isLoaded, isSignedIn, user } = useClerkAuth();
  const { session } = useSession();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const syncClerkUser = async () => {
      if (!isLoaded) return;

      try {
        setIsLoading(true);
        setError(null);

        if (isSignedIn && session) {
          // User is signed in with Clerk, verify with our backend
          const token = await session.getToken();
          const { user: backendUser } = await clerkService.verifySession(token);

          // Update Redux store with user data
          dispatch(
            setUser({
              user: backendUser,
              token: token
            })
          );
        } else {
          // User is not signed in, clear user data
          dispatch(logout());
        }
      } catch (err) {
        console.error('Error syncing Clerk user:', err);
        setError(err.message || 'Failed to authenticate with backend');
      } finally {
        setIsLoading(false);
      }
    };

    syncClerkUser();
  }, [isLoaded, isSignedIn, session, dispatch]);

  return {
    isLoading,
    error,
    isAuthenticated: isSignedIn,
    user
  };
}
