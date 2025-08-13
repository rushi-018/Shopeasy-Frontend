import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { clearCart } from '../store/slices/cartSlice'

function OrderSuccess() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    // Clear the cart
    dispatch(clearCart())

    // Redirect to home after 5 seconds
    const timer = setTimeout(() => {
      navigate('/')
    }, 5000)

    return () => clearTimeout(timer)
  }, [dispatch, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Order Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-500">
            You will be redirected to the home page in a few seconds...
          </p>
        </div>

        <div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess 