/**
 * Generates a placeholder image SVG for products when images fail to load
 * @param {string} productName - Name of the product for display
 * @returns {string} - Base64 encoded SVG data URL
 */
export function generateProductPlaceholder(productName = 'Product') {
  // Create a colored rectangle with the product name
  const colors = [
    '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316'
  ];
  
  // Use product name to deterministically select color
  const colorIndex = productName
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  
  const color = colors[colorIndex];
  
  // Create SVG with product name
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <rect width="300" height="300" fill="${color}"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24px" fill="white">${productName}</text>
  </svg>
  `;
  
  // Convert to base64 data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Generates a fallback store image with the store name
 * @param {string} storeName - Name of the store/ecommerce platform
 * @param {string} productName - Name of the product (optional)
 * @returns {string} - Base64 encoded SVG data URL
 */
export function generateStorePlaceholder(storeName, productName = '') {
  // Store-specific colors
  const storeColors = {
    'Amazon': '#FF9900',
    'Flipkart': '#2874F0',
    'Myntra': '#E41B17',
    'Ajio': '#2E3192',
    'Croma': '#0084FE',
    'Reliance Digital': '#E42529',
    'Tata Cliq': '#8D0C3F'
  };
  
  const color = storeColors[storeName] || '#4F46E5';
  
  // Generate initials from store name
  const words = storeName.split(' ');
  let initials = words[0][0].toUpperCase();
  if (words.length > 1 && words[1][0]) {
    initials += words[1][0].toUpperCase();
  }
  
  // Create SVG with store name and logo
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <rect width="300" height="300" fill="${color}"/>
    <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="80px" font-weight="bold" fill="white">${initials}</text>
    <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24px" fill="white">${storeName}</text>
    ${productName ? `<text x="50%" y="80%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="16px" fill="white">${productName}</text>` : ''}
  </svg>
  `;
  
  // Convert to base64 data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Validates if a URL is likely to be a valid image URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if URL seems valid
 */
export function isValidImageUrl(url) {
  if (!url) return false;
  
  // Check if it's a data URL (SVG or base64)
  if (url.startsWith('data:image/')) return true;
  
  // Check if it's a URL with an image extension
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const hasImageExtension = imageExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  );
  
  // Check if it's from a common image hosting domain
  const imageHosts = [
    'images.amazon.com', 
    'lh3.googleusercontent.com', 
    'cdn-images', 
    'img.', 
    'image.',
    'media-amazon.com',
    'static-assets',
    'store.storeimages'
  ];
  const isFromImageHost = imageHosts.some(host => 
    url.toLowerCase().includes(host)
  );
  
  return hasImageExtension || isFromImageHost;
}

/**
 * Normalizes product data to ensure all images are valid
 * @param {Object} product - Product data to normalize
 * @returns {Object} - Product with normalized image data
 */
export function normalizeProductImages(product) {
  if (!product) return null;
  
  // Create a copy to avoid mutation
  const normalizedProduct = { ...product };
  
  // Generate a fallback image if needed
  const fallbackImage = generateProductPlaceholder(normalizedProduct.name || 'Product');
  
  // Validate main image
  if (!normalizedProduct.image || !isValidImageUrl(normalizedProduct.image)) {
    normalizedProduct.image = fallbackImage;
  }
  
  // Validate image array
  if (!normalizedProduct.images || !Array.isArray(normalizedProduct.images) || normalizedProduct.images.length === 0) {
    normalizedProduct.images = [normalizedProduct.image || fallbackImage];
  } else {
    // Filter out invalid images and replace with fallbacks
    normalizedProduct.images = normalizedProduct.images.map((img, index) => {
      if (!img || !isValidImageUrl(img)) {
        return generateProductPlaceholder(`${normalizedProduct.name || 'Product'} ${index + 1}`);
      }
      return img;
    });
  }
  
  return normalizedProduct;
} 