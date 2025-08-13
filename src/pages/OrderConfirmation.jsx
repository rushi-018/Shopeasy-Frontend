import { Link } from 'react-router-dom'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

function OrderConfirmation() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
          Thank you for your order!
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Your order has been successfully placed. We'll send you an email with your order details and tracking information.
        </p>
        <div className="mt-8 space-y-4">
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Continue Shopping
          </Link>
          <div className="mt-4">
            <Link
              to="/profile/orders"
              className="text-primary hover:text-primary-dark font-medium"
            >
              View Order History
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation 