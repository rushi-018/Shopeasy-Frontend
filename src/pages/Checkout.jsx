import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import CheckoutForm from '../components/payment/CheckoutForm'

function Checkout() {
  const navigate = useNavigate()
  const { items } = useSelector((state) => state.cart)
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/auth')
    }
    // Redirect to cart if no items
    if (items.length === 0) {
      navigate('/cart')
    }
  }, [isAuthenticated, items.length, navigate])

  const handlePaymentSuccess = () => {
    // TODO: Clear cart and redirect to success page
    navigate('/order-success')
  }

  const handlePaymentError = (error) => {
    console.error('Payment error:', error)
    // TODO: Show error message to user
  }

  if (!isAuthenticated || items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete your purchase by providing your payment details
          </p>
        </div>

        <CheckoutForm
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    </div>
  )
}

export default Checkout 