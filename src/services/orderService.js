import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const orderService = {
  async createOrder(token, payload) {
    const res = await axios.post(`${API_URL}/orders`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  },
  async getMyOrders(token) {
    const res = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  }
}
