import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile } from '../../store/slices/authSlice'
import { uploadImage } from '../../utils/imageUpload'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'

function UserProfile() {
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector((state) => state.auth)
  const { user: clerkUser } = useClerkAuth()
  
  // Try to use Clerk user info if available, fallback to Redux state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    address: user?.address || '',
    preferences: user?.preferences || {
      notificationsEnabled: true,
      newsletterSubscribed: false,
      darkModeEnabled: false
    }
  })
  const [imageFile, setImageFile] = useState(null)
  
  // Use Clerk user data if available
  useEffect(() => {
    if (clerkUser) {
      setFormData(prev => ({
        ...prev,
        name: clerkUser.firstName + ' ' + (clerkUser.lastName || ''),
        email: clerkUser.primaryEmailAddress?.emailAddress || prev.email,
        avatar: clerkUser.imageUrl || prev.avatar
      }))
    }
  }, [clerkUser])

  const [successMessage, setSuccessMessage] = useState('')
  const [activeTab, setActiveTab] = useState('general')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      let imageUrl = formData.avatar
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile)
        imageUrl = uploadResult.url
      }
      
      await dispatch(updateProfile({ ...formData, avatar: imageUrl })).unwrap()
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0])
      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({...formData, avatar: reader.result})
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('preferences.')) {
      const preferenceKey = name.split('.')[1]
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          [preferenceKey]: type === 'checkbox' ? checked : value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 text-green-500 p-3 rounded-md mb-4">
          {successMessage}
        </div>
      )}
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            General Information
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'preferences'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Orders
          </button>
        </nav>
      </div>

      {activeTab === 'general' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {/* Avatar Upload */}
        <div>
          <div className="flex items-center space-x-6">
            <div className="shrink-0">
              <img
                className="h-16 w-16 object-cover rounded-full"
                src={imageFile ? URL.createObjectURL(imageFile) : formData.avatar || 'https://via.placeholder.com/150'}
                alt="Profile"
              />
            </div>
            <label className="block">
              <span className="sr-only">Choose profile photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary/90"
              />
            </label>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            className="input-field w-full"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            className="input-field w-full"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                className="input-field w-full"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                className="input-field w-full"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
      
      {activeTab === 'preferences' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Notification Preferences</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notificationsEnabled"
                name="preferences.notificationsEnabled"
                checked={formData.preferences?.notificationsEnabled || false}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="notificationsEnabled" className="ml-2 block text-sm text-gray-700">
                Enable notifications
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="newsletterSubscribed"
                name="preferences.newsletterSubscribed"
                checked={formData.preferences?.newsletterSubscribed || false}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="newsletterSubscribed" className="ml-2 block text-sm text-gray-700">
                Subscribe to newsletter
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="darkModeEnabled"
                name="preferences.darkModeEnabled"
                checked={formData.preferences?.darkModeEnabled || false}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="darkModeEnabled" className="ml-2 block text-sm text-gray-700">
                Enable dark mode
              </label>
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      )}
      
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Your Orders</h3>
          
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <p className="text-gray-500">No orders found.</p>
            <a href="/products" className="text-primary hover:underline mt-2 inline-block">
              Start shopping
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile 