import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import CheckoutForm from '../components/payment/CheckoutForm'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'
import { orderService } from '../services/orderService'
import { clearCart } from '../store/slices/cartSlice'

function Checkout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items } = useSelector((state) => state.cart)
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { isSignedIn, getToken } = useClerkAuth()

  useEffect(() => {
    // Redirect to login if not authenticated
  if (!isAuthenticated && !isSignedIn) {
      navigate('/auth')
    }
    // Redirect to cart if no items
    if (items.length === 0) {
      navigate('/cart')
    }
  }, [isAuthenticated, isSignedIn, items.length, navigate])

  const handlePaymentSuccess = async (paymentResponse) => {
    // Persist order then clear cart
    try {
      const token = await getToken()
      const amount = items.reduce((sum, it) => sum + it.price * it.quantity, 0)
      const orderPayload = {
        items: items.map(it => ({
          product: it._id || it.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          image: it.image || it.thumbnail || ''
        })),
        amount: Math.round(amount * 100) / 100,
        currency: 'INR',
        payment: {
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature
        }
      }
      await orderService.createOrder(token, orderPayload)
      dispatch(clearCart())
      navigate('/order-success')
    } catch (e) {
      console.error('Failed to save order:', e)
      // still navigate to success but ideally show toast
      navigate('/order-success')
    }
  }

  const handlePaymentError = (error) => {
    console.error('Payment error:', error)
    // TODO: Show error message to user
  }

  if ((!isAuthenticated && !isSignedIn) || items.length === 0) {
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