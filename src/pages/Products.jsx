import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FunnelIcon, AdjustmentsHorizontalIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import ProductCard from '../components/product/ProductCard'
import { getPopularProducts, searchProducts } from '../services/priceComparisonService'

// Category definitions
const CATEGORIES = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Home & Living' },
  { id: 3, name: 'Beauty' },
  { id: 4, name: 'Sports' },
  { id: 5, name: 'Books' }
]

function Products() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Get category and search query from URL parameters
  const queryParams = new URLSearchParams(location.search)
  const categoryParam = queryParams.get('category')
  const searchParam = queryParams.get('search')
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(categoryParam ? parseInt(categoryParam) : null)
  const [searchQuery, setSearchQuery] = useState(searchParam || '')
  const [filters, setFilters] = useState({ priceRange: [0, 200000], rating: 0 })
  const [showFilters, setShowFilters] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState(searchParam || '')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch products based on category and search query
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        let fetchedProducts = []
        
        if (debouncedSearch) {
          // Use search functionality if there's a search query
          fetchedProducts = await searchProducts(debouncedSearch, selectedCategory ? CATEGORIES.find(c => c.id === selectedCategory)?.name : null)
        } else {
          // Otherwise get popular products
          fetchedProducts = await getPopularProducts(12)
          
          // If a category is selected, filter products
          if (selectedCategory) {
            const category = CATEGORIES.find(c => c.id === selectedCategory)
            if (category) {
              // Filter products by category name (case insensitive)
              const filteredProducts = fetchedProducts.filter(product => 
                product.category && 
                product.category.toLowerCase().includes(category.name.toLowerCase())
              )
              
              // If we have enough products, use filtered ones
              if (filteredProducts.length >= 3) {
                fetchedProducts = filteredProducts
              } else {
                // Otherwise add category name to products
                fetchedProducts = fetchedProducts.map(product => ({
                  ...product,
                  category: category.name
                }))
              }
            }
          }
        }
        
        setProducts(fetchedProducts)
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [selectedCategory, debouncedSearch])

  // Update URL when category or search changes
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (selectedCategory) {
      params.set('category', selectedCategory)
    } else {
      params.delete('category')
    }
    if (debouncedSearch) {
      params.set('search', debouncedSearch)
    } else {
      params.delete('search')
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: true })
  }, [selectedCategory, debouncedSearch, navigate, location.pathname])

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  // Apply filters
  const filteredProducts = products.filter(product => {
    const price = Math.round(product.price)
    const productRating = product.rating || 0
    
    return price >= filters.priceRange[0] && 
           price <= filters.priceRange[1] && 
           productRating >= filters.rating
  })
  
  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId)
  }

  // Handle price range change
  const handlePriceChange = (e, index) => {
    const newRange = [...filters.priceRange]
    newRange[index] = parseInt(e.target.value)
    setFilters({ ...filters, priceRange: newRange })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedCategory 
              ? `${CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Products'}`
              : searchQuery
                ? `Search Results for "${searchQuery}"`
                : 'All Products'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {filteredProducts.length} products found
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Search products..."
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>
      </div>
      
      {/* Categories and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="font-medium text-gray-900 mb-4">Categories</h2>
            <div className="space-y-2">
              {CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center">
                  <button
                    onClick={() => handleCategoryChange(category.id)}
                    className={`flex-1 text-left px-2 py-1 rounded ${
                      selectedCategory === category.id
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
              <h2 className="font-medium text-gray-900 mb-4">Filters</h2>
              
              {/* Price Range */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="200000"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceChange(e, 0)}
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min="0"
                    max="200000"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceChange(e, 1)}
                    className="w-24 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
              
              {/* Rating Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Minimum Rating</h3>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters({ ...filters, rating: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value={0}>Any Rating</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Products Grid */}
        <div className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-medium text-gray-900">No products found</h2>
              <p className="mt-2 text-gray-500">Try adjusting your filters or selecting a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <Link to={`/products/${product.id}`} className="block">
                    <div className="aspect-w-1 aspect-h-1">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover object-center w-full h-full"
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        <Link to={`/products/${product.id}`}>
                          {product.name}
                        </Link>
                      </h3>
                      <p className="text-sm font-medium text-primary">
                        ₹{Math.round(product.price).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{product.category || 'General'}</p>
                    <div className="mt-2 flex items-center">
                      <div className="flex items-center">
                        {[0, 1, 2, 3, 4].map((star) => (
                          <svg
                            key={star}
                            className={`h-4 w-4 ${
                              product.rating > star ? 'text-yellow-400' : 'text-gray-200'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="ml-1 text-sm text-gray-500">{product.rating?.toFixed(1) || '4.0'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products 