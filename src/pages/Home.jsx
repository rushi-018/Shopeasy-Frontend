import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ShoppingBagIcon, DevicePhoneMobileIcon,  HomeIcon, SparklesIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import ProductCard from '../components/product/ProductCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getPopularProducts } from '../services/priceComparisonService'

// Categories with icons
const CATEGORIES = [
  {
    id: 1,
    name: 'Electronics',
    icon: DevicePhoneMobileIcon,
    color: 'bg-indigo-100 text-indigo-600'
  },
  
  {
    id: 2,
    name: 'Home & Living',
    icon: HomeIcon,
    color: 'bg-amber-100 text-amber-600'
  },
  {
    id: 3,
    name: 'Beauty',
    icon: SparklesIcon,
    color: 'bg-pink-100 text-pink-600'
  },
  {
    id: 4,
    name: 'Sports',
    icon: ShoppingBagIcon,
    color: 'bg-lime-100 text-lime-600'
  },
  {
    id: 5,
    name: 'Books',
    icon: BookOpenIcon,
    color: 'bg-purple-100 text-purple-600'
  }
]

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState(CATEGORIES)
  const [loading, setLoading] = useState(true)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    // Fetch popular products using our service
    const fetchProducts = async () => {
      try {
        const products = await getPopularProducts(6);
        setFeaturedProducts(products);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative bg-primary text-white">
        <div className="max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Welcome to ShopEasy
        </h1>
          <p className="mt-6 text-xl max-w-3xl">
            Discover amazing products from local stores. Compare prices and find the best deals.
          </p>
          <div className="mt-10">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Section - Compact Design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group flex flex-col items-center justify-center p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
            >
              <div className={`p-3 rounded-full ${category.color} mb-3`}>
                <category.icon className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 text-center">{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <Link to={`/products/${product.id}`}>
                <div className="aspect-w-1 aspect-h-1">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover object-center w-full h-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x300?text=Product+Image';
                    }}
                  />
                </div>
              </Link>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                  <Link to={`/products/${product.id}`}>
                    <span aria-hidden="true" className="absolute inset-0" />
                    {product.name}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-gray-500">{product.store || 'Multiple Stores'}</p>
                <p className="mt-1 text-base font-medium text-gray-900">
                  ₹{Math.round(product.price).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            to="/products" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
          >
            View All Products
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to start shopping?</span>
            <span className="block text-primary">Start your journey today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home 