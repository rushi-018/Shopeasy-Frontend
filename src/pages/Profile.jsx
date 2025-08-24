import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { UserIcon, ShoppingBagIcon, HeartIcon, CogIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/clerk-react'
import { setUser } from '../store/slices/authSlice'
import { orderService } from '../services/orderService'
import { wishlistService } from '../services/wishlistService'

function Profile() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { isSignedIn, getToken } = useClerkAuth()
  const { user: clerkUser } = useClerkUser()
  const [activeTab, setActiveTab] = useState('profile')
  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState([])

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  useEffect(() => {
    const load = async () => {
      try {
        if (!isSignedIn) return
        const token = await getToken()
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        const res = await axios.get(`${API_URL}/profile`, { headers: { Authorization: `Bearer ${token}` } })
        const data = res.data
        setProfileData(prev => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
        }))
      } catch (e) {
        // no-op
      }
    }
    load()
  }, [isSignedIn, getToken])

  useEffect(() => {
    // Set Clerk defaults if missing
    if (clerkUser) {
      setProfileData(prev => ({
        ...prev,
        name: prev.name || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        email: prev.email || clerkUser.primaryEmailAddress?.emailAddress || ''
      }))
    }
  }, [clerkUser])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = await getToken()
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const res = await axios.put(`${API_URL}/profile`, profileData, { headers: { Authorization: `Bearer ${token}` } })
      // sync redux auth user minimal fields
      dispatch(setUser({ user: res.data }))
    } catch (e) {
      // surface later via toast
    }
  }

  useEffect(() => {
    const loadAux = async () => {
      try {
        if (!isSignedIn) return
        const token = await getToken()
        const [ordersData, wishlistData] = await Promise.all([
          orderService.getMyOrders(token).catch(() => []),
          wishlistService.get(token).catch(() => [])
        ])
        setOrders(ordersData)
        setWishlist(wishlistData)
      } catch {
        // ignore
      }
    }
    loadAux()
  }, [isSignedIn, getToken])

  const defaultProfileImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0RjQ2RTUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyMHB4IiBmaWxsPSJ3aGl0ZSI+UHJvZmlsZTwvdGV4dD48L3N2Zz4='

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              My Account
            </h2>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <UserIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                {user?.email}
              </div>
              {user?.role && (
                <span className="mt-2 inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                  {user.role === 'store_owner' ? 'Store Owner' : 'Customer'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
            >
              <option value="profile">Profile</option>
              <option value="orders">Orders</option>
              <option value="wishlist">Wishlist</option>
              <option value="settings">Settings</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-4" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-gray-700'
                } px-3 py-2 font-medium text-sm rounded-md`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`${
                  activeTab === 'orders'
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-gray-700'
                } px-3 py-2 font-medium text-sm rounded-md`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`${
                  activeTab === 'wishlist'
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-gray-700'
                } px-3 py-2 font-medium text-sm rounded-md`}
              >
                Wishlist
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`${
                  activeTab === 'settings'
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-gray-700'
                } px-3 py-2 font-medium text-sm rounded-md`}
              >
                Settings
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    name="address"
                    id="address"
                    rows={3}
                    value={profileData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={profileData.city}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      id="state"
                      value={profileData.state}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      id="pincode"
                      value={profileData.pincode}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                  </div>
                ) : (
                  orders.map(o => (
                    <div key={o._id} className="border rounded-md p-4 bg-white">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Order ID: {o._id}</span>
                        <span>{new Date(o.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="mt-2 text-sm">
                        <div className="font-medium">Status: {o.payment?.status || 'paid'}</div>
                        <div>Amount: ₹{(o.amount/1).toLocaleString()}</div>
                      </div>
                      <ul className="mt-2 list-disc ml-5 text-sm text-gray-800">
                        {(o.items||[]).map((it, idx) => (
                          <li key={idx}>{it.name} x{it.quantity} - ₹{(it.price*it.quantity).toLocaleString()}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="space-y-4">
                {(!wishlist || wishlist.length === 0) ? (
                  <div className="text-center py-12">
                    <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No wishlist items</h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.map((p) => (
                      <div key={p._id || p.id || p.productId} className="border rounded-md p-4 bg-white flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{p.name || 'Saved product'}</div>
                          {p.price && <div className="text-sm text-gray-600">₹{p.price}</div>}
                        </div>
                        <button
                          onClick={async () => {
                            try { const token = await getToken(); const pid = (p._id || p.id || p.productId); await wishlistService.remove(token, pid); setWishlist(wishlist.filter(x => (x._id||x.id||x.productId) !== pid)) } catch {}
                          }}
                          className="text-sm text-red-600 hover:underline"
                        >Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="text-center py-12">
                <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No settings</h3>
                <p className="mt-1 text-sm text-gray-500">Account settings will be available soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile 