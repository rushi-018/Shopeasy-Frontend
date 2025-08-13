import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, StarIcon, ShoppingCartIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import webScraperService from '../services/webScraperService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const ScrapedProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [showTrending, setShowTrending] = useState(true);
  const [scraperStatus, setScraperStatus] = useState(null);
  const [dataMode, setDataMode] = useState('live'); // 'live' or 'fallback'

  // Load trending products and status on component mount
  useEffect(() => {
    loadTrendingProducts();
    loadScraperStatus();
  }, []);

  const loadScraperStatus = async () => {
    try {
      const response = await webScraperService.getScraperStatus();
      setScraperStatus(response.data);
    } catch (error) {
      console.error('Error loading scraper status:', error);
    }
  };

  const loadTrendingProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await webScraperService.getTrendingProducts(8);
      setTrendingProducts(response.data || []);
      setDataMode(response.mode || 'live');
    } catch (error) {
      console.error('Error loading trending products:', error);
      setError('Failed to load trending products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setShowTrending(false);

      let response;
      if (selectedPlatform === 'amazon') {
        response = await webScraperService.searchAmazonProducts(searchQuery, 10);
      } else if (selectedPlatform === 'flipkart') {
        response = await webScraperService.searchFlipkartProducts(searchQuery, 10);
      } else {
        response = await webScraperService.searchProducts(searchQuery, 10);
      }

      setProducts(response.data || []);
      setDataMode(response.mode || 'live');
    } catch (error) {
      console.error('Error searching products:', error);
      setError('Failed to search products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrendingClick = () => {
    setShowTrending(true);
    setProducts([]);
    setSearchQuery('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'Amazon':
        return 'bg-orange-100 text-orange-800';
      case 'Flipkart':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const displayProducts = showTrending ? trendingProducts : products;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Real Product Search
        </h1>
        <p className="text-gray-600">
          Search for real products from Amazon and Flipkart with live pricing and availability.
        </p>
      </div>

      {/* Status Banner */}
      {scraperStatus && (
        <div className="mb-6">
          <div className={`rounded-lg p-4 ${
            dataMode === 'live' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center">
              {dataMode === 'live' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  dataMode === 'live' ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {dataMode === 'live' ? 'Live Data Mode' : 'Fallback Mode'}
                </p>
                <p className={`text-sm ${
                  dataMode === 'live' ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {dataMode === 'live' 
                    ? 'Fetching real-time data from e-commerce platforms' 
                    : 'Using sample data due to scraping limitations'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products (e.g., smartphone, laptop, headphones)..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Platforms</option>
                <option value="amazon">Amazon Only</option>
                <option value="flipkart">Flipkart Only</option>
              </select>
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={handleTrendingClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              showTrending
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Trending Products
          </button>
          <button
            onClick={() => {
              setSearchQuery('smartphone');
              setSelectedPlatform('all');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            Smartphones
          </button>
          <button
            onClick={() => {
              setSearchQuery('laptop');
              setSelectedPlatform('all');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            Laptops
          </button>
          <button
            onClick={() => {
              setSearchQuery('headphones');
              setSelectedPlatform('all');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            Headphones
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && <ErrorMessage message={error} />}

      {/* Products Grid */}
      {displayProducts.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {showTrending ? 'Trending Products' : `Search Results for "${searchQuery}"`}
            </h2>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                dataMode === 'live' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {dataMode === 'live' ? 'Live Data' : 'Sample Data'}
              </span>
              <span className="text-sm text-gray-500">
                {displayProducts.length} products
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Source Badge */}
                  <div className="mb-2 flex justify-between items-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(product.source)}`}>
                      {product.source}
                    </span>
                    {product.isMock && (
                      <span className="text-xs text-gray-500">Sample</span>
                    )}
                  </div>

                  {/* Product Name */}
                  <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {product.rating} ({product.reviews || 0} reviews)
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-primary text-white text-center py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      {product.isMock ? 'View Sample' : 'View Deal'}
                    </a>
                    <button className="p-2 text-gray-600 hover:text-primary border border-gray-300 rounded-lg hover:border-primary">
                      <ShoppingCartIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && displayProducts.length === 0 && !showTrending && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try searching with different keywords or check trending products.</p>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">About This Feature</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Live Data Mode</h4>
            <p>When available, we fetch real-time product information directly from Amazon and Flipkart, including current prices, ratings, and availability.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Fallback Mode</h4>
            <p>When live scraping is not available, we provide realistic sample data to demonstrate the feature's capabilities and user interface.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrapedProducts; 