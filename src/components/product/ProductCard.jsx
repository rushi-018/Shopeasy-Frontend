import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify'

function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);
  const dispatch = useDispatch()
  const { isSignedIn, getToken } = useClerkAuth()
  const wishlistItems = useSelector((state) => state.wishlist?.items || [])
  
  // Generate a placeholder image if needed
  const generatePlaceholder = (name) => {
    // Create a colored rectangle with the product name
    const colors = [
      '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316'
    ];
    
    // Use product name to deterministically select color
    const colorIndex = name
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    const color = colors[colorIndex];
    
    return `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgMzAwIDMwMCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiR7Y29sb3J9Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0cHgiIGZpbGw9IndoaXRlIj4ke25hbWV9PC90ZXh0Pjwvc3ZnPg==`;
  };

  // Make sure we have a valid product object with an ID
  if (!product || !product.id) {
    console.error("Invalid product data:", product);
    return null;
  }

  // Ensure numeric product ID
  const numericId = parseInt(product.id, 10);
  const productLink = `/products/${numericId}`;
  const productKey = (product._id || product.id)?.toString()
  const isWishlisted = useMemo(() => {
    return wishlistItems.some(p => (p._id || p.id || p.productId)?.toString() === productKey)
  }, [wishlistItems, productKey])
  const onToggleWishlist = async () => {
    if (!isSignedIn) { toast.info('Sign in to use wishlist'); return }
    const token = await getToken()
    const id = (product._id || product.id)?.toString()
    if (!isWishlisted) {
      dispatch(addToWishlist({ token, productId: id, name: product.name, price: product.price || product.minPrice, image: product.image }))
      toast.success('Added to wishlist')
    } else {
      dispatch(removeFromWishlist({ token, productId: id }))
      toast.info('Removed from wishlist')
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Link to={productLink}>
        <div className="relative pb-[100%]">
          <img
            src={!imageError ? (product.image || "") : generatePlaceholder(product.name)}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={productLink}>
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">From</p>
            <p className="text-lg font-bold text-primary">
              ₹{(product.minPrice || product.price || 0).toLocaleString()}
            </p>
          </div>
          
          <button onClick={onToggleWishlist} className={`p-2 ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
            {isWishlisted ? <HeartSolid className="h-6 w-6" /> : <HeartOutline className="h-6 w-6" />}
          </button>
        </div>

        <div className="mt-2">
          <div className="flex items-center text-sm text-gray-500">
            <span>{product.stores || 3} stores</span>
            <span className="mx-2">•</span>
            <span>{product.variants || 2} variants</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard 