import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'
import { loadCartFromServer, saveCartToServer } from '../store/slices/cartSlice'

export function useCartSync() {
  const dispatch = useDispatch()
  const { isSignedIn, session } = useClerkAuth()
  const items = useSelector((s) => s.cart.items)
  const tokenRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      if (!isSignedIn || !session) return
      const token = await session.getToken()
      tokenRef.current = token
      dispatch(loadCartFromServer(token))
    }
    load()
  }, [isSignedIn, session, dispatch])

  // Debounced save on items change
  useEffect(() => {
    const save = async () => {
      if (!tokenRef.current) return
      dispatch(saveCartToServer({ token: tokenRef.current, items }))
    }
    const t = setTimeout(save, 400)
    return () => clearTimeout(t)
  }, [items, dispatch])
}
