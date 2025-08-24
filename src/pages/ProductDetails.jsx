import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCartIcon, StarIcon, MapPinIcon, TruckIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { addToCart } from '../store/slices/cartSlice'
import priceComparisonService from '../services/priceComparisonService'
import { generateProductPlaceholder, normalizeProductImages } from '../utils/imageUtils'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify'

function ProductDetails() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedStore, setSelectedStore] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const { isSignedIn, getToken } = useClerkAuth()
  const wishlistItems = useSelector((state) => state.wishlist?.items || [])

  // Function to get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Load product data
  const loadProductData = async (forceRefresh = false) => {
    try {
      // Start loading
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Convert ID to numeric and validate
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error(`Invalid product ID: ${id}`);
      }
      
      // Only clear cache for this specific product, not all products
      try {
        priceComparisonService.clearCache(numericId);
      } catch (cacheError) {
        console.error('Error clearing cache:', cacheError);
        // Continue even if cache clearing fails
      }
      
      console.log(`=== LOADING PRODUCT ID: ${numericId} ===`);
      
      // Get product data with a forced refresh
      const productData = await priceComparisonService.getProductWithPrices(numericId, {
        forceRefresh: true, // Always force refresh
        location: userLocation
      });
      
      if (!productData) {
        throw new Error(`Failed to get product data for ID: ${numericId}`);
      }
      
      console.log(`=== LOADED PRODUCT DATA, ID = ${productData.id}, NAME = ${productData.name} ===`);
      
       // First normalize all image data
       const productWithImages = normalizeProductImages(productData);
       
      // Transform specifications if it's an object
       if (productWithImages.specifications && typeof productWithImages.specifications === 'object' && !Array.isArray(productWithImages.specifications)) {
         productWithImages.specifications = Object.entries(productWithImages.specifications).map(([key, value]) => ({
          key,
          value
        }));
      }
      
      // Ensure ecommerceStores and localStores are arrays
       if (!productWithImages.ecommerceStores) {
         productWithImages.ecommerceStores = [];
      }
      
       if (!productWithImages.localStores) {
         productWithImages.localStores = [];
      }
      
      // Double-check product ID matches
       if (productWithImages.id !== numericId) {
         console.error(`ID mismatch: Expected ${numericId}, got ${productWithImages.id}`);
         productWithImages.id = numericId;
      }
      
      // Set the product data
       setProduct(productWithImages);
    } catch (error) {
      console.error('Error loading product data:', error);
      setError(`Failed to load product data: ${error.message || 'Unknown error'}`);
      setProduct(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial setup - clear cache on component mount
  useEffect(() => {
    console.log('ProductDetails mounted - clearing cache for specific product');
    // Only clear cache for this specific product, not all cache
    if (id) {
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId)) {
        priceComparisonService.clearCache(numericId);
      }
    }
    getUserLocation();
    
    // Cleanup on unmount
    return () => {
      console.log('ProductDetails unmounting - clearing cache for specific product');
      if (id) {
        const numericId = parseInt(id, 10);
        if (!isNaN(numericId)) {
          priceComparisonService.clearCache(numericId);
        }
      }
    };
  }, [id]); // Add id dependency so it runs when id changes

  // Load data when id changes (primary trigger)
  useEffect(() => {
    if (id) {
      console.log(`ID changed to ${id} - loading product data`);
      loadProductData(true); // Always force refresh when ID changes
    }
  }, [id]);

  // Separate effect for user location changes
  useEffect(() => {
    if (id && userLocation && product) {
      console.log('User location changed - refreshing local stores only');
      // Instead of calling loadProductData() which triggers another render,
      // just fetch the local stores directly and update that part of the product
      try {
        const numericId = parseInt(id, 10);
        if (!isNaN(numericId)) {
          priceComparisonService.getLocalStorePrices(numericId, userLocation)
            .then(localStores => {
              setProduct(currentProduct => ({
                ...currentProduct,
                localStores
              }));
            });
        }
      } catch (error) {
        console.error('Error updating local stores:', error);
      }
    }
  }, [userLocation, id]); // Remove product dependency to prevent infinite loop

  const handleAddToCart = () => {
    if (!selectedStore) {
      alert('Please select a store first')
      return
    }
    dispatch(addToCart({
      ...product,
      price: selectedStore.price,
      store: selectedStore.name,
      quantity
    }))
  }

  const productKey = (product?._id || product?.id)?.toString()
  const isWishlisted = useMemo(() => {
    if (!productKey) return false
    return wishlistItems.some(p => (p._id || p.id)?.toString() === productKey)
  }, [wishlistItems, productKey])

  const onToggleWishlist = async () => {
    if (!product) return
    if (!isSignedIn) { toast.info('Sign in to use wishlist'); return }
    const token = await getToken()
    const id = product._id || product.id
    if (!isWishlisted) {
      dispatch(addToWishlist({ token, productId: id }))
      toast.success('Added to wishlist')
    } else {
      dispatch(removeFromWishlist({ token, productId: id }))
      toast.info('Removed from wishlist')
    }
  }

  const getBestPrice = () => {
    if (!product) return 0;
    
    const allPrices = [
      ...(product.ecommerceStores || []).filter(store => store.inStock).map(store => store.price),
      ...(product.localStores || []).filter(store => store.inStock).map(store => store.price)
    ]
    
    if (allPrices.length === 0) {
      return product.price || 0;
    }
    
    return Math.min(...allPrices)
  }

  const handleRefresh = () => {
    loadProductData(true);
  };

  // Generate a simple SVG placeholder with the product name
  const generatePlaceholderImage = (productName) => {
    return generateProductPlaceholder(productName);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Error</h2>
        <p className="mt-2 text-gray-600">{error}</p>
          <button 
          onClick={() => loadProductData(true)}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Try Again
          </button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 mb-8">
        {/* Product Image */}
        <div className="lg:max-w-lg lg:self-center">
          <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name} 
              className="w-full h-full object-center object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = generatePlaceholderImage(product.name);
              }}
            />
          </div>
          
          {/* Image Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {product.images.map((img, index) => (
                <div 
                  key={index}
                  className={`aspect-w-1 aspect-h-1 rounded-md overflow-hidden cursor-pointer ${
                    product.image === img ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    // Update just the image property, not the entire product
                    // This prevents triggering another product reload
                    const updatedProduct = {...product};
                    updatedProduct.image = img;
                    setProduct(updatedProduct);
                  }}
                >
                  <img 
                    src={img}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-full object-center object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = generatePlaceholderImage(`${product.name} ${index + 1}`);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 lg:self-center">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {product.name}
            </h1>
            <button
              onClick={onToggleWishlist}
              className={`ml-4 p-2 rounded ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isWishlisted ? <HeartSolid className="h-7 w-7" /> : <HeartOutline className="h-7 w-7" />}
            </button>
          </div>

          <div className="mt-3">
            <h2 className="sr-only">Product information</h2>
            <div className="flex items-center">
              <p className="text-3xl text-gray-900">From ₹{getBestPrice().toLocaleString()}</p>
              <div className="ml-4 pl-4 border-l border-gray-300">
                <div className="flex items-center">
              <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                  <StarIcon 
                        key={rating}
                        className={`h-5 w-5 ${
                          rating < (product.rating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-200'
                        }`}
                  />
                ))}
                  </div>
                  <p className="ml-2 text-sm text-gray-500">
                    {product.rating || 0} out of 5 stars
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="sr-only">Description</h3>
            <div className="text-base text-gray-700 space-y-6">
              <p>{product.description}</p>
            </div>
            </div>
            
          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Specifications</h3>
              <div className="mt-4 space-y-4">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-200">
                    <dt className="text-sm font-medium text-gray-500">{spec.key}</dt>
                    <dd className="text-sm text-gray-900">{spec.value}</dd>
                  </div>
                ))}
                </div>
                    </div>
                  )}
                </div>
              </div>

      {/* Price Comparison Sections */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Price Comparison</h2>
        <button
          onClick={handleRefresh} 
          className="flex items-center text-primary hover:text-primary-dark"
          disabled={refreshing}
        >
          <ArrowPathIcon className={`h-5 w-5 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Prices'}</span>
        </button>
            </div>
            
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* E-commerce Stores */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <TruckIcon className="h-6 w-6 mr-2" />
              E-commerce Stores
            </h3>
            </div>
          <div className="px-4 py-5 sm:p-6">
            {product.ecommerceStores && product.ecommerceStores.length > 0 ? (
            <div className="space-y-4">
                {product.ecommerceStores.map((store) => (
                  <div
                    key={store.id || store.store}
                    className={`p-4 rounded-lg border ${
                      selectedStore?.id === store.id && selectedStore?.type === 'ecommerce'
                        ? 'border-primary'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{store.name || store.store}</h4>
                        <div className="mt-1 flex items-center">
                      <div className="flex items-center">
                            {[0, 1, 2, 3, 4].map((rating) => (
                              <StarIcon
                                key={rating}
                                className={`h-4 w-4 ${
                                  rating < (store.rating || 0)
                                    ? 'text-yellow-400'
                                    : 'text-gray-200'
                          }`}
                        />
                            ))}
                          </div>
                          <p className="ml-2 text-sm text-gray-500">{store.rating || 0}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Delivery: {store.delivery || 'Standard delivery'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">
                          ₹{store.price.toLocaleString()}
                        </p>
                        {store.inStock !== false ? (
                          <button
                            onClick={() => setSelectedStore({ ...store, type: 'ecommerce' })}
                            className="mt-2 text-sm text-primary hover:text-primary-dark"
                          >
                            Select Store
                          </button>
                        ) : (
                          <p className="mt-2 text-sm text-red-600">Out of Stock</p>
                        )}
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No e-commerce stores available</p>
            )}
          </div>
        </div>

        {/* Local Stores */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <MapPinIcon className="h-6 w-6 mr-2" />
              Local Stores
              {!userLocation && (
                <button
                  onClick={getUserLocation}
                  className="ml-2 text-sm text-primary hover:text-primary-dark"
                >
                  Enable Location
                    </button>
              )}
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {product.localStores && product.localStores.length > 0 ? (
              <div className="space-y-4">
                {product.localStores.map((store) => (
                  <div
                    key={store.id || store.name}
                    className={`p-4 rounded-lg border ${
                      selectedStore?.id === store.id && selectedStore?.type === 'local'
                        ? 'border-primary'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{store.name}</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Distance: {store.distance || 'N/A'}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Address: {store.address || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">
                          ₹{store.price.toLocaleString()}
                        </p>
                        {store.inStock !== false ? (
                          <button
                            onClick={() => setSelectedStore({ ...store, type: 'local' })}
                            className="mt-2 text-sm text-primary hover:text-primary-dark"
                          >
                            Select Store
                    </button>
                        ) : (
                          <p className="mt-2 text-sm text-red-600">Out of Stock</p>
                        )}
                      </div>
                    </div>
                </div>
              ))}
            </div>
          ) : (
              <p className="text-center text-gray-500 py-4">
                {userLocation 
                  ? "No local stores available" 
                  : "Enable location to see local stores"}
              </p>
            )}
          </div>
              </div>
            </div>
            
      {/* Add to Cart Section */}
      {selectedStore && (
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Selected Store: {selectedStore.name || selectedStore.store}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Price: ₹{selectedStore.price.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-gray-600 hover:text-gray-900"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-gray-600 hover:text-gray-900"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
            </div>
          )}
    </div>
  )
}

export default ProductDetails 