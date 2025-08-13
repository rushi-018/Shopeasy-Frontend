import api from './api';

class WebScraperService {
  // Search products across multiple platforms
  async searchProducts(query, limit = 10) {
    try {
      const response = await api.get('/scraper/search', {
        params: { query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Get trending products
  async getTrendingProducts(limit = 10) {
    try {
      const response = await api.get('/scraper/trending', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting trending products:', error);
      throw error;
    }
  }

  // Get product details from URL
  async getProductDetails(url) {
    try {
      const response = await api.get('/scraper/product-details', {
        params: { url }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting product details:', error);
      throw error;
    }
  }

  // Search Amazon products only
  async searchAmazonProducts(query, limit = 10) {
    try {
      const response = await api.get('/scraper/amazon', {
        params: { query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching Amazon products:', error);
      throw error;
    }
  }

  // Search Flipkart products only
  async searchFlipkartProducts(query, limit = 10) {
    try {
      const response = await api.get('/scraper/flipkart', {
        params: { query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching Flipkart products:', error);
      throw error;
    }
  }

  // Get scraper status
  async getScraperStatus() {
    try {
      const response = await api.get('/scraper/status');
      return response.data;
    } catch (error) {
      console.error('Error getting scraper status:', error);
      throw error;
    }
  }
}

// Create singleton instance
const webScraperService = new WebScraperService();

export default webScraperService; 