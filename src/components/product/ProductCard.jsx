import { Link } from 'react-router-dom'
import { HeartIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);
  
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
          
          <button className="p-2 text-gray-400 hover:text-red-500">
            <HeartIcon className="h-6 w-6" />
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