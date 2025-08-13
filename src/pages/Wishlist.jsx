import { useState } from 'react'
import ProductCard from '../components/product/ProductCard'
import LoadingSpinner from '../components/common/LoadingSpinner'

// Temporary mock data
const MOCK_WISHLIST = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    image: "https://placehold.co/300x300",
    minPrice: 134900,
    stores: 5,
    variants: 3
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    image: "https://placehold.co/300x300",
    minPrice: 129999,
    stores: 4,
    variants: 2
  }
]

function Wishlist() {
  const [isLoading] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      {isLoading ? (
        <LoadingSpinner />
      ) : MOCK_WISHLIST.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_WISHLIST.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Your wishlist is empty</p>
        </div>
      )}
    </div>
  )
}

export default Wishlist 