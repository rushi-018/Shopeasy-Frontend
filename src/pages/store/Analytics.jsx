import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  ChartBarIcon,
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

function Analytics() {
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    salesStats: {},
    trafficStats: {},
    productStats: {}
  })

  useEffect(() => {
    // Simulate API call to fetch analytics data
    const fetchAnalyticsData = async () => {
      try {
        // Check if user is the new store owner
        if (user?.email === 'freshman@example.com') {
          // Empty data for new store owner
          setData({
            salesStats: {
              totalSales: 0,
              previousPeriodSales: 0,
              dailySales: [0, 0, 0, 0, 0, 0, 0],
              topSellingProducts: []
            },
            trafficStats: {
              totalVisitors: 0,
              previousPeriodVisitors: 0,
              conversionRate: 0,
              previousConversionRate: 0,
              trafficSources: []
            },
            productStats: {
              totalProducts: 0,
              outOfStockProducts: 0,
              lowStockProducts: 0,
              productCategories: []
            }
          })
        } else {
          // Mock data for existing store owner
          const mockData = {
            salesStats: {
              totalSales: 28750,
              previousPeriodSales: 25000,
              dailySales: [1200, 1350, 1500, 1450, 1200, 980, 1150],
              topSellingProducts: [
                { name: 'Wireless Headphones', sales: 152, revenue: 15195.48 },
                { name: 'Smart Watch', sales: 89, revenue: 17799.11 },
                { name: 'Bluetooth Speaker', sales: 112, revenue: 8958.88 },
              ]
            },
            trafficStats: {
              totalVisitors: 12500,
              previousPeriodVisitors: 10800,
              conversionRate: 4.8,
              previousConversionRate: 4.2,
              trafficSources: [
                { source: 'Direct', value: 35 },
                { source: 'Search', value: 25 },
                { source: 'Social', value: 20 },
                { source: 'Referral', value: 15 },
                { source: 'Email', value: 5 }
              ]
            },
            productStats: {
              totalProducts: 87,
              outOfStockProducts: 12,
              lowStockProducts: 8,
              productCategories: [
                { category: 'Electronics', count: 32 },
                { category: 'Clothing', count: 24 },
                { category: 'Home & Kitchen', count: 18 },
                { category: 'Beauty', count: 13 }
              ]
            }
          }

          setData(mockData)
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [user])

  const calculateGrowth = (current, previous) => {
    if (!previous) return 0
    return ((current - previous) / previous) * 100
  }

  const renderStatsCard = (title, value, icon, growth) => {
    const Icon = icon
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          </div>
          <div className="bg-primary-50 p-3 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        {growth !== undefined && (
          <div className="mt-4">
            <div className={`flex items-center text-sm ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="font-medium">{growth >= 0 ? '+' : ''}{growth.toFixed(1)}%</span>
              <span className="ml-1.5">vs previous period</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const { salesStats, trafficStats, productStats } = data

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your store's performance and sales data
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {renderStatsCard(
          'Total Sales',
          `$${salesStats.totalSales.toLocaleString()}`,
          CurrencyDollarIcon,
          calculateGrowth(salesStats.totalSales, salesStats.previousPeriodSales)
        )}
        {renderStatsCard(
          'Conversion Rate',
          `${trafficStats.conversionRate}%`,
          UsersIcon,
          calculateGrowth(trafficStats.conversionRate, trafficStats.previousConversionRate)
        )}
        {renderStatsCard('Total Products', productStats.totalProducts, ShoppingBagIcon)}
        {renderStatsCard('Out of Stock', productStats.outOfStockProducts, ChartBarIcon)}
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Sales Overview</h2>
        </div>
        <div className="p-6">
          <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              [Chart Placeholder] - In a real application, this would show a sales chart.
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Selling Products */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Top Selling Products</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesStats.topSellingProducts.map((product, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.sales}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${product.revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Traffic Sources</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {trafficStats.trafficSources.map((source, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{source.source}</span>
                    <span className="text-sm font-medium text-gray-700">{source.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${source.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Categories */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Product Categories</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {productStats.productCategories.map((category, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                <h3 className="font-medium text-gray-900">{category.category}</h3>
                <p className="text-2xl font-bold text-primary mt-2">{category.count}</p>
                <p className="text-sm text-gray-500 mt-1">products</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics 