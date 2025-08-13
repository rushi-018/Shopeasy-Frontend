import api from './api'

export const productService = {
  getProducts: async (params) => {
    const response = await api.get('/products', { params })
    return response.data
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  getProductPrices: async (id) => {
    const response = await api.get(`/products/${id}/prices`)
    return response.data
  },

  getLocalShops: async (id, location) => {
    const response = await api.get(`/products/${id}/local-shops`, {
      params: { location }
    })
    return response.data
  }
} 