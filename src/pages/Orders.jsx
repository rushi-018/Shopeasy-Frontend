import { useEffect, useState } from 'react'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'
import { orderService } from '../services/orderService'

function Orders() {
  const { isSignedIn, getToken } = useClerkAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        if (!isSignedIn) return
        const token = await getToken()
        const data = await orderService.getMyOrders(token)
        if (mounted) setOrders(data)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [isSignedIn, getToken])

  if (!isSignedIn) return null

  if (loading) {
    return <div className="p-8 text-center">Loading orders...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-gray-600">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o._id} className="border rounded-md p-4 bg-white">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Order ID: {o._id}</span>
                <span>{new Date(o.createdAt).toLocaleString()}</span>
              </div>
              <div className="mt-2 text-sm">
                <div className="font-medium">Status: {o.payment?.status || 'paid'}</div>
                <div>Amount: ₹{(o.amount/1).toLocaleString()}</div>
              </div>
              <div className="mt-3">
                <ul className="list-disc ml-5 text-sm text-gray-800">
                  {(o.items || []).map((it, idx) => (
                    <li key={idx}>{it.name} x{it.quantity} - ₹{(it.price*it.quantity).toLocaleString()}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
