import api from './api';

// Simple in-memory cache for development
// In production, consider using localStorage, IndexedDB, or a proper backend cache
const cache = {
  data: {},
  timeouts: {},
  set: function(key, value, ttl = 60000) { // Reduced TTL to 1 minute for development
    this.data[key] = {
      value,
      timestamp: Date.now()
    };
    
    // Clear previous timeout if exists
    if (this.timeouts[key]) {
      clearTimeout(this.timeouts[key]);
    }
    
    // Set timeout to clear cache
    this.timeouts[key] = setTimeout(() => {
      delete this.data[key];
      delete this.timeouts[key];
    }, ttl);
  },
  get: function(key) {
    if (!this.data[key]) return null;
    return this.data[key].value;
  },
  isValid: function(key) {
    return this.data[key] !== undefined;
  },
  clear: function(key) {
    if (key && this.timeouts[key]) {
      clearTimeout(this.timeouts[key]);
      delete this.data[key];
      delete this.timeouts[key];
      return true;
    }
    return false;
  },
  clearAll: function() {
    // Clear all timeouts
    Object.values(this.timeouts).forEach(timeout => clearTimeout(timeout));
    this.data = {};
    this.timeouts = {};
  }
};

// Free public APIs for price data
// These are example endpoints - in a real implementation, you'd need to register for API keys
const DATA_SOURCES = {
  // Public API for product search - good for general product info
  OPEN_API: 'https://dummyjson.com/products/search',
  
  // Backup data source
  FALLBACK_API: 'https://fakestoreapi.com/products'
};

// Add these constants at the top of the file
const DUMMY_JSON_API = 'https://dummyjson.com/products';
const CATEGORY_MAPPING = {
  'Electronics': ['smartphones', 'laptops', 'fragrances', 'skincare', 'groceries'],
  'Clothing': ['tops', 'womens-dresses', 'womens-shoes', 'mens-shirts', 'mens-shoes'],
  'Home & Kitchen': ['furniture', 'home-decoration', 'lighting']
};

// Update the CATEGORY_MAPPING to include specific product IDs for each category
const CATEGORY_PRODUCTS = {
  'Electronics': {
    'smartphones': [1, 2, 3, 4],  // iPhone, Samsung, OnePlus, Google Pixel
    'laptops': [5, 6, 7, 8],      // MacBook, Dell, HP, Lenovo
    'fragrances': [9, 10, 11, 12] // Perfumes and colognes
  },
  'Clothing': {
    'tops': [13, 14, 15, 16],     // T-shirts, shirts
    'womens-dresses': [17, 18, 19, 20], // Women's dresses
    'mens-shirts': [21, 22, 23, 24] // Men's shirts
  },
  'Home & Kitchen': {
    'furniture': [25, 26, 27, 28], // Sofas, tables, chairs
    'home-decoration': [29, 30, 31, 32], // Decorative items
    'lighting': [33, 34, 35, 36]   // Lamps, lights
  }
};

export const priceComparisonService = {
  /**
   * Get product with price comparison data
   * @param {string|number} id - Product ID
   * @param {Object} options - Options
   * @param {boolean} options.forceRefresh - Force refresh cache
   * @param {Object} options.location - User location for local store prices
   * @returns {Promise<Object>} - Product data with price comparison
   */
  getProductWithPrices: async (id, options = {}) => {
    try {
      // Fetch specific product from DummyJSON API
      const response = await fetch(`${DUMMY_JSON_API}/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product from API');
      }

      const product = await response.json();

      // Transform the API data to match our schema
      return {
        id: product.id,
        name: product.title,
        description: product.description,
        images: product.images,
        image: product.thumbnail,
        category: mapCategory(product.category),
        price: product.price,
        rating: product.rating,
        specifications: {
          'Brand': product.brand,
          'Category': product.category,
          'Stock': product.stock,
          'Discount': `${product.discountPercentage}%`
        },
        ecommerceStores: generateEcommerceStores(mapCategory(product.category), product.price),
        localStores: generateLocalStores(mapCategory(product.category), product.price)
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      // Fallback to mock data if API fails
      return generateFakeData(id);
    }
  },
  
  /**
   * Get all available prices for a product
   * @param {string} id - Product ID
   */
  getAllPrices: async (id) => {
    const cacheKey = `all_prices_${id}`;
    
    if (cache.isValid(cacheKey)) {
      return cache.get(cacheKey);
    }
    
    try {
      // Try to get from our backend
      const response = await api.get(`/products/${id}/all-prices`);
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all prices:', error);
      // Return mock prices as fallback
      const mockPrices = generateMockPrices(id);
      cache.set(cacheKey, mockPrices);
      return mockPrices;
    }
  },
  
  /**
   * Get local store prices based on user location
   * @param {string|number} id - Product ID
   * @param {Object} location - User location (lat, lng)
   * @returns {Promise<Array>} Array of local store prices
   */
  getLocalStorePrices: async (id, location) => {
    // Validate parameters
    if (!id) {
      console.error('getLocalStorePrices called without ID');
      return [];
    }
    
    // Ensure id is a string for consistency
    const idStr = String(id);
    
    // Only use cache if we have a valid location
    if (!location || typeof location !== 'object' || !location.lat || !location.lng) {
      console.warn('getLocalStorePrices called with invalid location, returning empty array');
      return [];
    }
    
    const cacheKey = `local_prices_${idStr}_${location.lat}_${location.lng}`;
    
    if (cache.isValid(cacheKey)) {
      return cache.get(cacheKey);
    }
    
    try {
      // Try to get from our backend
      const response = await api.get(`/products/${idStr}/local-shops`, {
        params: { location }
      });
      const data = response.data || [];
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching local store prices:', error);
      // Generate location-based mock prices
      try {
        const mockLocalPrices = generateMockLocalPrices(idStr, location);
        cache.set(cacheKey, mockLocalPrices);
        return mockLocalPrices;
      } catch (fallbackError) {
        console.error('Failed to generate mock local prices:', fallbackError);
        return [];
      }
    }
  },
  
  /**
   * Clear cached data
   * @param {string|number} id - Product ID or cache key (optional, if not provided clears all cache)
   */
  clearCache: (id) => {
    if (id) {
      // Ensure id is a string before using string methods
      const idStr = String(id);
      
      // Check if id is a product ID or a complete cache key
      const cacheKey = idStr.startsWith('product_prices_') ? idStr : `product_prices_${idStr}`;
      
      console.log('Clearing cache for:', cacheKey);
      
      // Clear exact cache key
      if (cache.data[cacheKey]) {
        if (cache.timeouts[cacheKey]) {
          clearTimeout(cache.timeouts[cacheKey]);
          delete cache.timeouts[cacheKey];
        }
        delete cache.data[cacheKey];
        console.log('Cache cleared for:', cacheKey);
      }
      
      // Also search for any caches that might contain the wrong ID
      Object.keys(cache.data).forEach(key => {
        if (key.startsWith('product_prices_')) {
          const cachedData = cache.get(key);
          if (cachedData && cachedData.id !== undefined && 
              String(cachedData.id) === idStr.replace('product_prices_', '')) {
            // If we find a cached item with the requested ID but under wrong key, clear it
            if (cache.timeouts[key]) {
              clearTimeout(cache.timeouts[key]);
              delete cache.timeouts[key];
            }
            delete cache.data[key];
            console.log('Found and cleared mismatched cache:', key);
          }
        }
      });
    } else {
      // Clear all timeouts
      Object.values(cache.timeouts).forEach(timeout => clearTimeout(timeout));
      cache.data = {};
      cache.timeouts = {};
      console.log('All cache cleared');
    }
  }
};

/**
 * Fetch product data from our own API
 * @private
 */
async function fetchFromOwnApi(id, options) {
  try {
    const [productRes, pricesRes, localShopsRes] = await Promise.all([
      api.get(`/products/${id}`),
      api.get(`/products/${id}/prices`),
      options.location ? api.get(`/products/${id}/local-shops`, {
        params: { location: options.location }
      }) : Promise.resolve({ data: [] })
    ]);
    
    return {
      ...productRes.data,
      ecommerceStores: pricesRes.data,
      localStores: localShopsRes.data
    };
  } catch (error) {
    throw new Error('Failed to fetch from own API');
  }
}

/**
 * Fetch product data from public APIs
 * @private
 */
async function fetchFromPublicApis(id) {
  const numericId = parseInt(id, 10);
  console.log('Fetching public data for ID:', numericId);
  
  try {
    // Try to get products from API first
    const response = await fetch(`${DATA_SOURCES.FALLBACK_API}`);
    if (!response.ok) {
      throw new Error('API response not OK');
    }
    
    const apiProducts = await response.json();
    
    // Extract product category and name info based on our ID mapping
    let productName = getProductNameById(numericId);
    let productDescription = getProductDescriptionById(numericId);
    let category = 'Electronics';
    
    if (numericId >= 1 && numericId <= 5) {
      category = 'Electronics';
    } else if (numericId >= 6 && numericId <= 10) {
      category = 'Clothing';
    } else if (numericId >= 11 && numericId <= 15) {
      category = 'Home & Kitchen';
    }
    
    // Find a similar product from API to use as a base (for image, etc)
    const similarProducts = apiProducts.filter(p => {
      return p.category && p.category.toLowerCase().includes(category.toLowerCase());
    });
    
    let baseApiProduct = null;
    if (similarProducts.length > 0) {
      // If we found similar products, use one of them
      baseApiProduct = similarProducts[numericId % similarProducts.length];
    } else {
      // Otherwise use any product
      baseApiProduct = apiProducts[numericId % apiProducts.length];
    }
    
    // Create our own consistent data combining API product with our ID mapping
    const productData = {
      id: numericId,
      name: productName,
      description: productDescription,
      category: category,
      price: baseApiProduct?.price || (category === 'Electronics' ? 134900 : category === 'Clothing' ? 4999 : 7999),
      rating: baseApiProduct?.rating?.rate || 4.5,
    };
    
    // Get images from API or generate placeholders
    let images = [];
    if (baseApiProduct?.images && Array.isArray(baseApiProduct.images)) {
      images = baseApiProduct.images;
    } else if (baseApiProduct?.image) {
      images = [baseApiProduct.image];
    } else {
      // Generate placeholders
      images = [
        generateProductImageSVG(productName),
        generateProductImageSVG(`${productName} - View 2`),
        generateProductImageSVG(`${productName} - View 3`)
      ];
    }
    
    productData.images = images;
    productData.image = images[0];
    
    // Add specifications and store data
    productData.specifications = generateSpecifications(category, productName);
    productData.ecommerceStores = generateEcommerceStores(category, productData.price);
    productData.localStores = generateLocalStores(category, productData.price);
    
    return productData;
  } catch (error) {
    console.error('Error in fetchFromPublicApis:', error);
    throw error;
  }
}

/**
 * Transform public API data to match our schema
 * @private
 */
function transformPublicApiData(apiProduct, id) {
  // Base price from the API
  const basePrice = apiProduct.price || Math.floor(Math.random() * 100000) + 10000;
  
  // Handle images array
  let images = [];
  if (apiProduct.images && Array.isArray(apiProduct.images)) {
    images = apiProduct.images;
  } else if (apiProduct.image) {
    images = [apiProduct.image];
  } else if (apiProduct.thumbnail) {
    images = [apiProduct.thumbnail];
  } else {
    // Generate a placeholder image
    const placeholderImage = generateProductImageSVG(apiProduct.title || 'Product');
    images = [placeholderImage];
  }
  
  // Generate mock stores with slight price variations
  const ecommerceStores = [
    {
      id: 1,
      name: 'Amazon',
      price: Math.round(basePrice * 1.02), // 2% higher
      delivery: '2-3 days',
      rating: 4.5,
      inStock: true,
      link: 'https://amazon.com'
    },
    {
      id: 2,
      name: 'Flipkart',
      price: Math.round(basePrice * 1.04), // 4% higher
      delivery: '3-4 days',
      rating: 4.3,
      inStock: true,
      link: 'https://flipkart.com'
    },
    {
      id: 3,
      name: 'Croma',
      price: Math.round(basePrice * 0.98), // 2% lower
      delivery: '4-5 days',
      rating: 4.2,
      inStock: Math.random() > 0.2, // 80% chance of being in stock
      link: 'https://croma.com'
    }
  ];
  
  // Create local stores with different prices
  const localStores = [
    {
      id: 1,
      name: 'iStore Premium Reseller',
      price: Math.round(basePrice * 0.97), // 3% lower
      distance: '2.5 km',
      rating: 4.6,
      address: '123 Main Street, City Center',
      inStock: true,
      contact: '+1234567890'
    },
    {
      id: 2,
      name: 'Mobile World',
      price: Math.round(basePrice * 0.99), // 1% lower
      distance: '3.8 km',
      rating: 4.4,
      address: '456 Market Road, Downtown',
      inStock: true,
      contact: '+1234567891'
    },
    {
      id: 3,
      name: 'Gadget Hub',
      price: Math.round(basePrice * 1.01), // 1% higher
      distance: '5.2 km',
      rating: 4.3,
      address: '789 Tech Street, Uptown',
      inStock: true,
      contact: '+1234567892'
    }
  ];

  // Generate dynamic specifications based on the product
  const specs = generateDynamicSpecs(apiProduct);
  
  return {
    id: parseInt(id),
    name: apiProduct.title || 'iPhone 15 Pro Max',
    description: apiProduct.description || 'The most powerful iPhone ever with A17 Pro chip, titanium design, and advanced camera system.',
    images: images,
    image: images[0], // Set first image as main image
    category: apiProduct.category || 'Electronics',
    rating: apiProduct.rating?.rate || apiProduct.rating || 4.5,
    specifications: specs,
    ecommerceStores,
    localStores,
    reviews: generateDynamicReviews(apiProduct.title || 'Product', apiProduct.rating?.rate || apiProduct.rating || 4.5)
  };
}

/**
 * Generate dynamic specifications based on product data
 * @private
 */
function generateDynamicSpecs(product) {
  const category = product.category?.toLowerCase() || '';
  
  // Base specs that apply to most products
  const baseSpecs = [
    { name: 'Brand', value: extractBrand(product.title || '') },
    { name: 'Model', value: product.title?.split(' ').slice(1).join(' ') || 'Premium Model' },
    { name: 'Warranty', value: '1 Year' }
  ];
  
  // Category-specific specs
  if (category.includes('electronics') || category.includes('phone') || !category) {
    return [
      ...baseSpecs,
      { name: 'Storage', value: ['64GB', '128GB', '256GB', '512GB'][Math.floor(Math.random() * 4)] },
      { name: 'Processor', value: ['A17 Pro', 'Snapdragon 8 Gen 3', 'Exynos 2400', 'Dimensity 9300'][Math.floor(Math.random() * 4)] },
      { name: 'Display', value: ['6.1" OLED', '6.7" AMOLED', '6.9" Dynamic AMOLED'][Math.floor(Math.random() * 3)] },
      { name: 'Color', value: ['Black', 'Silver', 'Gold', 'Pacific Blue', 'Natural Titanium'][Math.floor(Math.random() * 5)] }
    ];
  } else if (category.includes('clothing') || category.includes('fashion')) {
    return [
      ...baseSpecs,
      { name: 'Material', value: ['Cotton', 'Polyester', 'Wool', 'Leather', 'Denim'][Math.floor(Math.random() * 5)] },
      { name: 'Size', value: ['S', 'M', 'L', 'XL', 'XXL'][Math.floor(Math.random() * 5)] },
      { name: 'Color', value: ['Black', 'Blue', 'Red', 'White', 'Green'][Math.floor(Math.random() * 5)] }
    ];
  } else if (category.includes('jewel')) {
    return [
      ...baseSpecs,
      { name: 'Material', value: ['Gold', 'Silver', 'Platinum', 'Rose Gold'][Math.floor(Math.random() * 4)] },
      { name: 'Weight', value: (Math.random() * 10 + 1).toFixed(2) + 'g' },
      { name: 'Gemstone', value: ['Diamond', 'Ruby', 'Emerald', 'Sapphire', 'None'][Math.floor(Math.random() * 5)] }
    ];
  } else {
    // Generic specs for other categories
    return [
      ...baseSpecs,
      { name: 'Material', value: ['Premium', 'Standard', 'Eco-friendly', 'Recycled'][Math.floor(Math.random() * 4)] },
      { name: 'Dimensions', value: `${Math.floor(Math.random() * 20 + 10)}cm x ${Math.floor(Math.random() * 20 + 10)}cm x ${Math.floor(Math.random() * 10 + 2)}cm` },
      { name: 'Weight', value: `${(Math.random() * 2 + 0.1).toFixed(2)}kg` },
      { name: 'Country of Origin', value: ['India', 'China', 'USA', 'Japan', 'Germany'][Math.floor(Math.random() * 5)] }
    ];
  }
}

/**
 * Extract brand name from product title
 * @private
 */
function extractBrand(title) {
  if (!title) return 'Generic';
  
  const commonBrands = [
    'Apple', 'Samsung', 'Sony', 'LG', 'Xiaomi', 'OnePlus', 'Nokia', 'Motorola',
    'Adidas', 'Nike', 'Puma', 'Reebok', 'H&M', 'Zara', 'Levi\'s',
    'IKEA', 'Philips', 'Bosch', 'Panasonic', 'Dell', 'HP', 'Lenovo', 'Asus'
  ];
  
  for (const brand of commonBrands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  // Extract first word as brand if no known brand is found
  return title.split(' ')[0] || 'Generic';
}

/**
 * Generate dynamic reviews based on product name and rating
 * @private
 */
function generateDynamicReviews(productName, rating) {
  const reviewCount = Math.floor(Math.random() * 3) + 2; // 2-4 reviews
  const reviews = [];
  
  const adjectives = [
    'great', 'excellent', 'amazing', 'good', 'decent', 'fantastic', 
    'outstanding', 'disappointing', 'mediocre', 'superb'
  ];
  
  const comments = [
    `This ${productName} is absolutely {adj}. I would recommend it to anyone.`,
    `The {adj} quality surprised me. Worth every penny.`,
    `For the price, this is a {adj} product.`,
    `I've been using this for a month now, and it's {adj}.`,
    `{Adj} performance, but could use some improvements in certain areas.`,
    `This exceeded my expectations. {Adj} value for money.`,
    `The {adj} design stands out from other similar products.`,
    `It works as expected, which is {adj}.`,
    `I bought this for my spouse and they find it {adj}.`,
    `The features are {adj}, but customer service could be better.`
  ];
  
  const names = [
    'John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis',
    'Michael Wilson', 'Sarah Brown', 'David Miller', 'Lisa Anderson',
    'James Taylor', 'Jennifer Thomas', 'Rahul Sharma', 'Priya Patel'
  ];
  
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - Math.floor(Math.random() * 60));
    dates.push(date.toISOString().split('T')[0]);
  }
  
  // Base review - always positive if rating is high
  reviews.push({
    id: 1,
    user: names[Math.floor(Math.random() * names.length)],
    rating: Math.min(5, Math.ceil(rating)),
    comment: formatReviewComment(comments[Math.floor(Math.random() * 5)], adjectives, true),
    date: dates[0]
  });
  
  // Add additional reviews
  for (let i = 2; i <= reviewCount; i++) {
    const reviewRating = Math.max(1, Math.min(5, Math.floor(rating + (Math.random() * 2 - 1))));
    const positive = reviewRating >= 4;
    
    reviews.push({
      id: i,
      user: names[Math.floor(Math.random() * names.length)],
      rating: reviewRating,
      comment: formatReviewComment(comments[Math.floor(Math.random() * comments.length)], adjectives, positive),
      date: dates[i-1]
    });
  }
  
  return reviews;
}

/**
 * Format review comment with appropriate adjectives
 * @private
 */
function formatReviewComment(template, adjectives, positive) {
  const positiveAdjectives = adjectives.filter(adj => 
    ['great', 'excellent', 'amazing', 'fantastic', 'outstanding', 'superb'].includes(adj));
  
  const negativeAdjectives = adjectives.filter(adj => 
    ['disappointing', 'mediocre'].includes(adj));
    
  const neutralAdjectives = adjectives.filter(adj => 
    ['good', 'decent'].includes(adj));
  
  let adj;
  if (positive) {
    adj = positiveAdjectives[Math.floor(Math.random() * positiveAdjectives.length)];
  } else if (Math.random() < 0.3) { // 30% chance of negative for lower ratings
    adj = negativeAdjectives[Math.floor(Math.random() * negativeAdjectives.length)];
  } else {
    adj = neutralAdjectives[Math.floor(Math.random() * neutralAdjectives.length)];
  }
  
  return template
    .replace('{adj}', adj)
    .replace('{Adj}', adj.charAt(0).toUpperCase() + adj.slice(1));
}

/**
 * Generate fallback fake data when all APIs fail
 * @private
 * @param {string|number} id - Product ID
 * @returns {Object} Generated product data
 */
function generateFakeData(id) {
  try {
    // Ensure we're working with a numeric ID
    const idNum = parseInt(id, 10);
    
    if (isNaN(idNum) || idNum < 1) {
      throw new Error(`Invalid product ID: ${id}`);
    }
    
    // Get product name and description
    const productName = getProductNameById(idNum);
    const productDescription = getProductDescriptionById(idNum);
    
    if (!productName) {
      throw new Error(`No product name found for ID: ${idNum}`);
    }
    
    // Determine category based on ID range
    // We now handle ANY ID range by using modulo operations
    let category;
    const normalizedId = ((idNum - 1) % 15) + 1; // Normalize to range 1-15
    
    if (normalizedId >= 1 && normalizedId <= 5) {
      category = 'Electronics';
    } else if (normalizedId >= 6 && normalizedId <= 10) {
      category = 'Clothing';
    } else if (normalizedId >= 11 && normalizedId <= 15) {
      category = 'Home & Kitchen';
    } else {
      category = 'Electronics'; // Fallback category
    }
    
    // Generate base price based on category
    let basePrice;
    switch (category) {
      case 'Electronics':
        basePrice = 134900;
        break;
      case 'Clothing':
        basePrice = 4999;
        break;
      case 'Home & Kitchen':
        basePrice = 7999;
        break;
      default:
        basePrice = 134900;
    }
    
    // Generate multiple images for the product
    const images = [];
    try {
      images.push(
        generateProductImageSVG(productName),
        generateProductImageSVG(`${productName} - View 2`),
        generateProductImageSVG(`${productName} - View 3`)
      );
    } catch (imageError) {
      console.error('Error generating product images:', imageError);
      // Add at least one default image
      images.push('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgNjAwIDYwMCI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiM0RjQ2RTUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzZweCIgZmlsbD0id2hpdGUiPlByb2R1Y3QgSW1hZ2U8L3RleHQ+PC9zdmc+');
    }
    
    // Generate specifications based on category
    const specifications = generateSpecifications(category, productName);
    
    // Generate store data based on category
    const ecommerceStores = generateEcommerceStores(category, basePrice);
    const localStores = generateLocalStores(category, basePrice);
    
    return {
      id: idNum, // Preserve the original ID passed in
      name: productName,
      description: productDescription,
      images: images,
      image: images[0], // Set first image as main image
      category: category,
      rating: 4.5,
      specifications: specifications,
      ecommerceStores: ecommerceStores,
      localStores: localStores
    };
  } catch (error) {
    console.error(`Error in generateFakeData for ID ${id}:`, error);
    throw error;
  }
}

/**
 * Generate specifications based on category
 * @private
 */
function generateSpecifications(category, productName) {
  switch (category) {
    case 'Electronics':
      return [
        { key: 'Brand', value: productName.split(' ')[0] },
        { key: 'Model', value: productName },
        { key: 'Warranty', value: '1 Year' },
        { key: 'Storage', value: ['64GB', '128GB', '256GB', '512GB'][Math.floor(Math.random() * 4)] },
        { key: 'Color', value: ['Black', 'Silver', 'Gold', 'Blue'][Math.floor(Math.random() * 4)] }
      ];
    case 'Clothing':
      return [
        { key: 'Brand', value: productName.split(' ')[0] },
        { key: 'Material', value: ['Cotton', 'Polyester', 'Wool', 'Denim'][Math.floor(Math.random() * 4)] },
        { key: 'Size', value: ['S', 'M', 'L', 'XL', 'XXL'][Math.floor(Math.random() * 5)] },
        { key: 'Color', value: ['Black', 'Blue', 'Red', 'White'][Math.floor(Math.random() * 4)] },
        { key: 'Care', value: 'Machine washable' }
      ];
    case 'Home & Kitchen':
      return [
        { key: 'Brand', value: productName.split(' ')[0] },
        { key: 'Material', value: ['Stainless Steel', 'Ceramic', 'Glass', 'Wood'][Math.floor(Math.random() * 4)] },
        { key: 'Color', value: ['Silver', 'Black', 'White', 'Natural'][Math.floor(Math.random() * 4)] },
        { key: 'Warranty', value: '2 Years' },
        { key: 'Dimensions', value: '10 x 10 x 10 cm' }
      ];
    default:
      return [
        { key: 'Brand', value: 'Generic' },
        { key: 'Model', value: productName },
        { key: 'Warranty', value: '1 Year' }
      ];
  }
}

/**
 * Generate ecommerce stores based on category
 * @private
 */
function generateEcommerceStores(category, basePrice) {
  let stores;
  switch (category) {
    case 'Electronics':
      stores = ['Amazon', 'Flipkart', 'Croma'];
      break;
    case 'Clothing':
      stores = ['Myntra', 'Ajio', 'Fashion Hub'];
      break;
    case 'Home & Kitchen':
      stores = ['Home Centre', 'IKEA', 'Home Decor'];
      break;
    default:
      stores = ['Amazon', 'Flipkart', 'Croma'];
  }
  
  return stores.map((store, index) => ({
    id: index + 1,
    name: store,
    price: Math.round(basePrice * (1 + (index * 0.05))), // 5% increase for each store
    delivery: `${2 + index} days`,
    rating: 4 + Math.random(),
    inStock: Math.random() > 0.2, // 80% chance of being in stock
    link: `https://${store.toLowerCase().replace(' ', '')}.com`
  }));
}

/**
 * Generate local stores based on category
 * @private
 */
function generateLocalStores(category, basePrice) {
  let stores;
  switch (category) {
    case 'Electronics':
      stores = ['iStore Premium Reseller', 'Mobile World', 'Gadget Hub'];
      break;
    case 'Clothing':
      stores = ['Fashion Hub', 'Style Studio', 'Trendy Fashion'];
      break;
    case 'Home & Kitchen':
      stores = ['Home Decor', 'Living Spaces', 'Home Essentials'];
      break;
    default:
      stores = ['Local Store 1', 'Local Store 2', 'Local Store 3'];
  }
  
  return stores.map((store, index) => ({
    id: index + 1,
    name: store,
    price: Math.round(basePrice * (1 - (index * 0.03))), // 3% decrease for each store
    distance: `${(index + 1) * 2.5} km`,
    rating: 4 + Math.random(),
    address: `${100 + index} Main Street, City Center`,
    inStock: Math.random() > 0.1, // 90% chance of being in stock
    contact: `+123456789${index}`
  }));
}

/**
 * Get product name based on ID for consistent data
 * @private
 * @param {string|number} id - Product ID
 * @returns {string} Product name
 */
function getProductNameById(id) {
  // Ensure we have a numeric ID
  const idNum = parseInt(id, 10);
  
  if (isNaN(idNum) || idNum < 1) {
    console.warn(`Invalid product ID: ${id}, using default product`);
    return 'Default Product';
  }
  
  // Use modulo to support any numeric ID range
  // This gives us a normalized ID between 1-15
  const normalizedId = ((idNum - 1) % 15) + 1;
  
  // Map normalized ID ranges to categories
  if (normalizedId >= 1 && normalizedId <= 5) {
    // Electronics (IDs 1-5)
    const electronics = [
      'iPhone 15 Pro Max',
      'Samsung Galaxy S24 Ultra',
      'OnePlus 12',
      'Google Pixel 8 Pro',
      'MacBook Pro 16"'
    ];
    return electronics[normalizedId - 1];
  } else if (normalizedId >= 6 && normalizedId <= 10) {
    // Clothing (IDs 6-10)
    const clothing = [
      'Men\'s Casual Premium Shirt',
      'Women\'s Summer Dress',
      'Men\'s Denim Jeans',
      'Women\'s Blazer',
      'Unisex Hoodie'
    ];
    return clothing[normalizedId - 6];
  } else if (normalizedId >= 11 && normalizedId <= 15) {
    // Home & Kitchen (IDs 11-15)
    const home = [
      'Coffee Maker',
      'Bedding Set',
      'Blender',
      'Wall Clock',
      'Throw Pillows'
    ];
    return home[normalizedId - 11];
  }
  
  // This should never happen with our normalization, but just in case
  return 'Default Product';
}

/**
 * Get product description based on ID for consistent data
 * @private
 * @param {string|number} id - Product ID
 * @returns {string} Product description
 */
function getProductDescriptionById(id) {
  // Ensure we have a numeric ID
  const idNum = parseInt(id, 10);
  
  if (isNaN(idNum) || idNum < 1) {
    console.warn(`Invalid product ID: ${id}, using default description`);
    return 'A quality product with great features.';
  }
  
  // Use modulo to support any numeric ID range
  // This gives us a normalized ID between 1-15
  const normalizedId = ((idNum - 1) % 15) + 1;
  
  // Map normalized ID ranges to categories
  if (normalizedId >= 1 && normalizedId <= 5) {
    // Electronics (IDs 1-5)
    const electronics = [
      'The most powerful iPhone ever with A17 Pro chip, titanium design, and advanced camera system.',
      'Experience next-level performance with the latest Snapdragon processor, 200MP camera and S Pen.',
      'Flagship killer with Snapdragon 8 Gen 3, 50MP Hasselblad camera and 5000mAh battery with 100W charging.',
      'Google\'s premium phone with Tensor G3 chip, advanced AI features and exceptional camera capabilities.',
      'Apple\'s professional laptop with M3 Max chip, stunning Liquid Retina XDR display and all-day battery life.'
    ];
    return electronics[normalizedId - 1];
  } else if (normalizedId >= 6 && normalizedId <= 10) {
    // Clothing (IDs 6-10)
    const clothing = [
      'Comfortable and stylish casual shirt made from premium cotton, perfect for any occasion.',
      'Light and breezy summer dress with floral print, ideal for warm days and special occasions.',
      'Classic blue denim jeans with a comfortable slim fit, made from high-quality cotton with stretch.',
      'Professional blazer perfect for office wear, featuring a modern cut and premium fabric.',
      'Warm and comfortable hoodie for casual wear, made from soft cotton blend with a cozy feel.'
    ];
    return clothing[normalizedId - 6];
  } else if (normalizedId >= 11 && normalizedId <= 15) {
    // Home & Kitchen (IDs 11-15)
    const home = [
      'Programmable coffee maker with 12-cup capacity, perfect for your morning routine.',
      'Comfortable bedding set with 2 pillowcases and a duvet cover, made from 100% cotton.',
      'High-speed blender for smoothies and food processing, featuring 6 speed settings.',
      'Modern wall clock with silent movement, adding elegance to your living space.',
      'Decorative throw pillows for your sofa or bed, adding color and comfort to your home.'
    ];
    return home[normalizedId - 11];
  }
  
  // This should never happen with our normalization, but just in case
  return 'A quality product with great features.';
}

/**
 * Get popular products
 * @public
 */
export async function getPopularProducts(count = 6) {
  try {
    // Fetch random products from DummyJSON API
    const response = await fetch(`${DUMMY_JSON_API}?limit=100`);
    if (!response.ok) {
      throw new Error('Failed to fetch products from API');
    }

    const data = await response.json();
    const allProducts = data.products;
    
    // Shuffle the products array
    const shuffledProducts = allProducts.sort(() => Math.random() - 0.5);
    
    // Take the first 'count' products
    const selectedProducts = shuffledProducts.slice(0, count);

    // Transform the API data to match our schema
    return selectedProducts.map(product => ({
      id: product.id,
      name: product.title,
      description: product.description,
      images: product.images,
      image: product.thumbnail,
      category: mapCategory(product.category),
      price: product.price,
      rating: product.rating,
      specifications: {
        'Brand': product.brand,
        'Category': product.category,
        'Stock': product.stock,
        'Discount': `${product.discountPercentage}%`
      },
      ecommerceStores: generateEcommerceStores(mapCategory(product.category), product.price),
      localStores: generateLocalStores(mapCategory(product.category), product.price)
    }));
  } catch (error) {
    console.error('Error fetching popular products:', error);
    // Fallback to mock data if API fails
    return Array.from({ length: count }, (_, i) => generateFakeData(i + 1));
  }
}

// Helper function to map DummyJSON categories to our categories
function mapCategory(dummyCategory) {
  for (const [ourCategory, dummyCategories] of Object.entries(CATEGORY_MAPPING)) {
    if (dummyCategories.includes(dummyCategory)) {
      return ourCategory;
    }
  }
  return 'Electronics'; // Default category
}

/**
 * Generate a base64 SVG for product image
 * @private
 */
function generateProductImageSVG(productName) {
  // Create a colored rectangle with the product name
  const colors = [
    '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316'
  ];
  
  if (!productName) productName = 'Product';
  
  // Use product name to deterministically select color
  const colorIndex = productName
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  
  const color = colors[colorIndex];
  
  // Sanitize product name for SVG
  const sanitizedName = productName
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="${color}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="36px" fill="white">${sanitizedName}</text></svg>`;
  
  try {
    // Convert SVG to base64
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  } catch (error) {
    console.error('Error creating SVG image:', error);
    // Fallback to a simple colored rectangle
    return `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgNjAwIDYwMCI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiM0RjQ2RTUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzZweCIgZmlsbD0id2hpdGUiPlByb2R1Y3Q8L3RleHQ+PC9zdmc+`;
  }
}

// Add search functionality
export async function searchProducts(query, category = null) {
  try {
    // Build the search URL
    let searchUrl = `${DUMMY_JSON_API}/search?q=${encodeURIComponent(query)}`;
    if (category) {
      searchUrl += `&category=${encodeURIComponent(category)}`;
    }

    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }

    const data = await response.json();
    return data.products.map(product => ({
      id: product.id,
      name: product.title,
      description: product.description,
      images: product.images,
      image: product.thumbnail,
      category: mapCategory(product.category),
      price: product.price,
      rating: product.rating,
      specifications: {
        'Brand': product.brand,
        'Category': product.category,
        'Stock': product.stock,
        'Discount': `${product.discountPercentage}%`
      },
      ecommerceStores: generateEcommerceStores(mapCategory(product.category), product.price),
      localStores: generateLocalStores(mapCategory(product.category), product.price)
    }));
    } catch (error) {
    console.error('Error searching products:', error);
    // Fallback to mock data if API fails
    return Array.from({ length: 10 }, (_, i) => generateFakeData(i + 1));
  }
}

export default priceComparisonService; 