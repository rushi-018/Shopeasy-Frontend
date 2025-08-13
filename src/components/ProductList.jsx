import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import priceComparisonService from '../services/priceComparisonService';
import { generateProductPlaceholder, isValidImageUrl, normalizeProductImages } from '../utils/imageUtils';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const ProductList = ({ category, limit }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let fetchedProducts;
        if (category) {
          fetchedProducts = await priceComparisonService.getProductsByCategory(category, limit);
        } else {
          fetchedProducts = await priceComparisonService.getPopularProducts(limit);
        }

        // Normalize product images
        const normalizedProducts = fetchedProducts.map(product => normalizeProductImages(product));
        setProducts(normalizedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, limit]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!products.length) return <p className="text-center py-4">No products found.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <Link
          key={product.id}
          to={`/product/${product.id}`}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="aspect-w-1 aspect-h-1">
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full"
              onError={(e) => {
                e.target.src = generateProductPlaceholder(product.name);
              }}
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-1">
              {product.brand || 'Generic'}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-primary">
                ₹{(product.price || 0).toLocaleString()}
              </span>
              {product.discount > 0 && (
                <span className="text-sm text-green-600">
                  {product.discount}% off
                </span>
              )}
            </div>
            {product.rating && (
              <div className="flex items-center mt-2">
                <span className="text-yellow-400">★</span>
                <span className="ml-1 text-sm text-gray-600">
                  {typeof product.rating === 'number' 
                    ? product.rating.toFixed(1) 
                    : '4.0'} 
                  ({product.reviews || 0} reviews)
                </span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductList; 