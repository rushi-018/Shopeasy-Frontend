import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const wishlistService = {
  async get(token) {
    const res = await axios.get(`${API_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  },
  async add(token, payload) {
    const res = await axios.post(`${API_URL}/wishlist`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  },
  async remove(token, productId) {
    const res = await axios.delete(`${API_URL}/wishlist/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  }
}
