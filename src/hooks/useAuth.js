import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from '../store/slices/authSlice'

export function useAuth() {
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!user && localStorage.getItem('token')) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, user])

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
  }
} 