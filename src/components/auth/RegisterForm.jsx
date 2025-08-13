import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { register } from '../../store/slices/authSlice'

function RegisterForm() {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    businessDetails: {
      businessName: '',
      businessType: '',
      gstNumber: '',
      panNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      }
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      return
    }

    // Remove confirmPassword before sending to API
    const { confirmPassword, ...dataToSend } = formData
    
    // If not a store owner, remove business details
    if (dataToSend.role !== 'store_owner') {
      delete dataToSend.businessDetails
    }

    dispatch(register(dataToSend))
  }

  const handleBusinessDetailsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      businessDetails: {
        ...prev.businessDetails,
        [field]: value
      }
    }))
  }

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      businessDetails: {
        ...prev.businessDetails,
        address: {
          ...prev.businessDetails.address,
          [field]: value
        }
      }
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md">{error}</div>
      )}

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          required
          className="input-field w-full"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          required
          className="input-field w-full"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Register as
        </label>
        <select
          className="input-field w-full"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="customer">Customer</option>
          <option value="store_owner">Store Owner</option>
        </select>
      </div>

      {formData.role === 'store_owner' && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900">Business Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              required
              className="input-field w-full"
              value={formData.businessDetails.businessName}
              onChange={(e) => handleBusinessDetailsChange('businessName', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            <select
              required
              className="input-field w-full"
              value={formData.businessDetails.businessType}
              onChange={(e) => handleBusinessDetailsChange('businessType', e.target.value)}
            >
              <option value="">Select Business Type</option>
              <option value="retail">Retail</option>
              <option value="restaurant">Restaurant</option>
              <option value="service">Service</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST Number
            </label>
            <input
              type="text"
              required
              className="input-field w-full"
              value={formData.businessDetails.gstNumber}
              onChange={(e) => handleBusinessDetailsChange('gstNumber', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PAN Number
            </label>
            <input
              type="text"
              required
              className="input-field w-full"
              value={formData.businessDetails.panNumber}
              onChange={(e) => handleBusinessDetailsChange('panNumber', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Business Address</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                required
                className="input-field w-full"
                value={formData.businessDetails.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  className="input-field w-full"
                  value={formData.businessDetails.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  required
                  className="input-field w-full"
                  value={formData.businessDetails.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  required
                  className="input-field w-full"
                  value={formData.businessDetails.address.pincode}
                  onChange={(e) => handleAddressChange('pincode', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  )
}

export default RegisterForm 