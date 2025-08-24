import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { getCurrentUser } from './store/slices/authSlice'
import { useClerkIntegration } from './hooks/useClerkIntegration'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import StoreOwnerLayout from './components/layout/StoreOwnerLayout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Orders from './pages/Orders'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import StoreLocator from './pages/StoreLocator'
import StoreDetails from './pages/StoreDetails'
import ScrapedProducts from './components/ScrapedProducts'
import Dashboard from './pages/store/Dashboard'
import ProductsManagement from './pages/store/ProductsManagement'
import OrdersManagement from './pages/store/OrdersManagement'
import CustomersManagement from './pages/store/CustomersManagement'
import DealsManagement from './pages/store/DealsManagement'
import Analytics from './pages/store/Analytics'
import Payments from './pages/store/Payments'
import Settings from './pages/store/Settings'
import ClerkTestPage from './pages/ClerkTestPage'
import { useCartSync } from './hooks/useCartSync'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'
import { loadWishlist } from './store/slices/wishlistSlice'



function App() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const { isSignedIn, getToken } = useClerkAuth()

  // Use our custom Clerk integration hook
  // This will handle the sync between Clerk and our backend
  const { isLoading: clerkLoading, error: clerkError } = useClerkIntegration();
  useCartSync();

  useEffect(() => {
    // This is kept for backward compatibility with the existing auth system
    // It will be removed once the Clerk integration is complete
    dispatch(getCurrentUser())
  }, [dispatch])

  // Preload wishlist once when signed in
  useEffect(() => {
    const load = async () => {
      try {
        if (isSignedIn) {
          const token = await getToken()
          if (token) dispatch(loadWishlist(token))
        }
      } catch {}
    }
    load()
  }, [isSignedIn, getToken, dispatch])

  // Protected Route component that works with both Clerk and legacy auth
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    return (
      <>
        <SignedIn>
          {/* If user has specific role requirements, check them */}
          {allowedRoles.length > 0 && user && !allowedRoles.includes(user?.role) ? (
            <Navigate to="/" />
          ) : (
            children
          )}
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    )
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
  <ToastContainer position="top-right" autoClose={2000} hideProgressBar newestOnTop closeOnClick pauseOnHover />
        {/* Render different layouts based on user role */}
        {isAuthenticated && user?.role === 'store_owner' ? (
          <StoreOwnerLayout>
            <Routes>
              <Route path="/store/dashboard" element={<Dashboard />} />
              <Route path="/store/products" element={<ProductsManagement />} />
              <Route path="/store/orders" element={<OrdersManagement />} />
              <Route path="/store/customers" element={<CustomersManagement />} />
              <Route path="/store/deals" element={<DealsManagement />} />
              <Route path="/store/analytics" element={<Analytics />} />
              <Route path="/store/payments" element={<Payments />} />
              <Route path="/store/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/store/dashboard" />} />
            </Routes>
          </StoreOwnerLayout>
        ) : (
          <>
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/stores" element={<StoreLocator />} />
                <Route path="/stores/:id" element={<StoreDetails />} />
                <Route path="/real-products" element={<ScrapedProducts />} />
                <Route path="/manage-products" element={<ProductsManagement />} />
                <Route path="/clerk-test" element={<ClerkTestPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
          </>
        )}
      </div>
    </Router>
  )
}

export default App
