import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const clerkService = {
  // Verify session with backend
  verifySession: async (token) => {
    try {
      const response = await axios.post(`${API_URL}/clerk/verify-session`, { token });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify session');
    }
  },

  // Link Clerk account with existing account
  linkAccount: async (email, clerkId) => {
    try {
      const response = await axios.post(`${API_URL}/clerk/update-user`, { 
        email,
        clerkId 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to link account');
    }
  },

  // Get user cart and preferences
  getUserData: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user data');
    }
  }
};
