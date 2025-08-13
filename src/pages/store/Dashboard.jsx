import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

function Dashboard() {
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    salesGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    aovGrowth: 0
  })

  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // Check if user is the new store owner
        if (user?.email === 'freshman@example.com') {
          // Empty data for new store owner
          setStats({
            totalSales: 0,
            totalOrders: 0,
            totalCustomers: 0,
            averageOrderValue: 0,
            salesGrowth: 0,
            ordersGrowth: 0,
            customersGrowth: 0,
            aovGrowth: 0
          })
          setRecentOrders([])
        } else {
          // Mock data for existing store owner
          const mockStats = {
            totalSales: 12500,
            totalOrders: 150,
            totalCustomers: 120,
            averageOrderValue: 83.33,
            salesGrowth: 12.5,
            ordersGrowth: 8.3,
            customersGrowth: 15.2,
            aovGrowth: 5.7
          }

          const mockOrders = [
            {
              id: '1',
              customer: 'John Doe',
              amount: 150.00,
              status: 'Delivered',
              date: '2024-03-15'
            },
            {
              id: '2',
              customer: 'Jane Smith',
              amount: 75.50,
              status: 'Processing',
              date: '2024-03-14'
            },
            {
              id: '3',
              customer: 'Mike Johnson',
              amount: 200.00,
              status: 'Shipped',
              date: '2024-03-14'
            }
          ]

          setStats(mockStats)
          setRecentOrders(mockOrders)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const StatCard = ({ title, value, icon: Icon, growth, isPositive }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {isPositive ? (
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        )}
        <span className={`ml-1 text-sm font-medium ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {Math.abs(growth)}% from last month
        </span>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={`$${stats.totalSales.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          growth={stats.salesGrowth}
          isPositive={stats.salesGrowth >= 0}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={ShoppingBagIcon}
          growth={stats.ordersGrowth}
          isPositive={stats.ordersGrowth >= 0}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={UserGroupIcon}
          growth={stats.customersGrowth}
          isPositive={stats.customersGrowth >= 0}
        />
        <StatCard
          title="Average Order Value"
          value={`$${stats.averageOrderValue.toFixed(2)}`}
          icon={ChartBarIcon}
          growth={stats.aovGrowth}
          isPositive={stats.aovGrowth >= 0}
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'Delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'Processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 