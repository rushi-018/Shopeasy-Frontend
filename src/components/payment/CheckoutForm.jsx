import { useState } from 'react'
import { useSelector } from 'react-redux'
import { paymentService } from '../../services/paymentService'

function CheckoutForm({ onSuccess, onError }) {
  const { items } = useSelector((state) => state.cart)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Calculate total amount
  const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0)

  const handlePayment = async () => {
    setLoading(true)
    setError(null)
    try {
      await paymentService.initializePayment(
        totalAmount,
        (response) => {
          setLoading(false)
          onSuccess(response)
        },
        (error) => {
          setLoading(false)
          setError(error.message)
          onError(error)
        }
      )
    } catch (error) {
      setLoading(false)
      setError(error.message)
      onError(error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                ₹{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-medium text-gray-900">Total</h3>
              <p className="text-base font-medium text-gray-900">
                ₹{totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You will be redirected to Razorpay's secure payment page to complete your purchase.
          </p>
          {error && (
            <div className="text-red-600 text-sm mb-4">
              {error}
            </div>
          )}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckoutForm 