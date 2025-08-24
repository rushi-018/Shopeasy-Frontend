import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { logout } from '../../store/slices/authSlice'
import { SignedIn, SignedOut, useAuth as useClerkAuth } from '@clerk/clerk-react'

function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { items } = useSelector((state) => state.cart)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { signOut } = useClerkAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (e) {
      // ignore
    }
    dispatch(logout())
    setIsMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary">
                ShopEasy
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-primary"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-primary"
              >
                Products
              </Link>
              <Link
                to="/stores"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-primary"
              >
                Stores
              </Link>
              <Link
                to="/real-products"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-primary"
              >
                Real Products
              </Link>
              <Link
                to="/deals"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-primary"
              >
                Deals
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 text-gray-900 hover:text-primary relative"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {/* Clerk-driven visibility */}
            <SignedIn>
              <div className="ml-3 relative z-50">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-900 hover:text-primary focus:outline-none"
                >
                  <UserIcon className="h-6 w-6" />
                  <span>{user?.name}</span>
                </button>

                {isMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50">
                    {user?.role === 'store_owner' ? (
                      <Link
                        to="/store/dashboard"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </SignedIn>
            <SignedOut>
              <div className="ml-3 flex items-center space-x-4">
                <Link
                  to="/auth"
                  className="text-gray-900 hover:text-primary"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                >
                  Sign up
                </Link>
              </div>
            </SignedOut>

            {/* Mobile menu button */}
            <div className="ml-3 sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 hover:text-primary focus:outline-none"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block px-3 py-2 text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/stores"
              className="block px-3 py-2 text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Stores
            </Link>
            <Link
              to="/real-products"
              className="block px-3 py-2 text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Real Products
            </Link>
            <Link
              to="/deals"
              className="block px-3 py-2 text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Deals
            </Link>
            {!isAuthenticated && (
              <>
                <Link
                  to="/auth"
                  className="block px-3 py-2 text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/auth"
                  className="block px-3 py-2 text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar 