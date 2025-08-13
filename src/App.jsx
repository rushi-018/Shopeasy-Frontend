import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { getCurrentUser } from './store/slices/authSlice'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import StoreOwnerLayout from './components/layout/StoreOwnerLayout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
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

function App() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    // Check if user is logged in on app load
    dispatch(getCurrentUser())
  }, [dispatch])

  // Protected Route component
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!isAuthenticated) {
      return <Navigate to="/auth" />
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      return <Navigate to="/" />
    }

    return children
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
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
