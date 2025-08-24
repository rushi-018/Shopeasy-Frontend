import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const cartService = {
  async getCart(token) {
    const res = await axios.get(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  },
  async setCart(token, items) {
    const res = await axios.put(
      `${API_URL}/cart`,
      { items },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return res.data
  },
  async addItem(token, item) {
    const res = await axios.post(
      `${API_URL}/cart/items`,
      item,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return res.data
  },
  async removeItem(token, itemId) {
    const res = await axios.delete(`${API_URL}/cart/items/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  },
  async clear(token) {
    const res = await axios.delete(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  },
}
