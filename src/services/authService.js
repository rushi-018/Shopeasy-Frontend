import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

// Mock user database (replace with actual API calls)
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer'
  },
  {
    id: 2,
    name: 'Store Owner',
    email: 'store@example.com',
    password: 'password123',
    role: 'store_owner'
  },
  {
    id: 3,
    name: 'New Store Owner',
    email: 'freshman@example.com',
    password: 'password123',
    role: 'store_owner',
    businessDetails: {
      storeName: '',
      address: '',
      phone: '',
      description: '',
      logo: '',
      categories: [],
      products: [],
      orders: [],
      reviews: []
    }
  }
]

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const validatePassword = (password) => {
  return password.length >= 6
}

const findUserByEmail = (email) => {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase())
}

export const authService = {
  async login(email, password) {
    try {
      // TODO: Replace with actual API call
      const user = mockUsers.find(u => u.email === email && u.password === password)
      if (!user) {
        throw new Error('Invalid credentials')
      }

      const { password: _, ...userWithoutPassword } = user
      return {
        user: userWithoutPassword,
        token: 'mock_token'
      }
    } catch (error) {
      throw error
    }
  },

  async register(userData) {
    try {
      // TODO: Replace with actual API call
      const existingUser = mockUsers.find(u => u.email === userData.email)
      if (existingUser) {
        throw new Error('Email already registered')
      }

      const newUser = {
        id: mockUsers.length + 1,
        ...userData
      }
      mockUsers.push(newUser)

      const { password: _, ...userWithoutPassword } = newUser
      return {
        user: userWithoutPassword,
        token: 'mock_token'
      }
    } catch (error) {
      throw error
    }
  },

  async loginWithGoogle(googleToken) {
    try {
      // TODO: Replace with actual API call
      const response = await axios.post(`${API_URL}/auth/google`, { token: googleToken })
      return response.data
    } catch (error) {
      throw error
    }
  },

  async loginWithFacebook(facebookToken) {
    try {
      // TODO: Replace with actual API call
      const response = await axios.post(`${API_URL}/auth/facebook`, { token: facebookToken })
      return response.data
    } catch (error) {
      throw error
    }
  },

  async loginWithGithub(githubToken) {
    try {
      // TODO: Replace with actual API call
      const response = await axios.post(`${API_URL}/auth/github`, { token: githubToken })
      return response.data
    } catch (error) {
      throw error
    }
  },

  async logout() {
    try {
      // TODO: Replace with actual API call
      localStorage.removeItem('token')
      return true
    } catch (error) {
      throw error
    }
  },

  async getCurrentUser() {
    try {
      // TODO: Replace with actual API call
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No token found')
      }

      // In a real app, you would verify the token and get the user from the backend
      return mockUsers[0]
    } catch (error) {
      throw error
    }
  },

  async updateProfile(userData) {
    try {
      // TODO: Replace with actual API call
      const user = mockUsers.find(u => u.id === userData.id)
      if (!user) {
        throw new Error('User not found')
      }

      Object.assign(user, userData)
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch (error) {
      throw error
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      // TODO: Replace with actual API call
      const user = mockUsers.find(u => u.password === currentPassword)
      if (!user) {
        throw new Error('Current password is incorrect')
      }

      user.password = newPassword
      return true
    } catch (error) {
      throw error
    }
  }
} 