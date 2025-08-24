import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const paymentService = {
  async createOrder(amount, currency = 'INR') {
    try {
      console.log('Creating order with amount:', amount)
      const response = await axios.post(`${API_URL}/create-order`, {
        amount: Math.round(amount * 100), // Convert to paise and ensure it's an integer
        currency,
      })
      console.log('Order created successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('Error creating order:', error.response?.data || error.message)
      throw new Error(error.response?.data?.error || 'Failed to create order')
    }
  },

  async verifyPayment(razorpay_payment_id, razorpay_order_id, razorpay_signature) {
    try {
      console.log('Verifying payment:', { razorpay_payment_id, razorpay_order_id })
      const response = await axios.post(`${API_URL}/verify-payment`, {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      })
      console.log('Payment verification result:', response.data)
      return response.data
    } catch (error) {
      console.error('Error verifying payment:', error.response?.data || error.message)
      throw new Error(error.response?.data?.error || 'Failed to verify payment')
    }
  },

  async getPaymentHistory() {
    try {
      const response = await axios.get(`${API_URL}/payment-history`)
      return response.data
    } catch (error) {
      console.error('Error fetching payment history:', error.response?.data || error.message)
      throw new Error(error.response?.data?.error || 'Failed to fetch payment history')
    }
  },

  loadRazorpayScript() {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => {
        console.log('Razorpay script loaded successfully')
        resolve(true)
      }
      script.onerror = (error) => {
        console.error('Failed to load Razorpay script:', error)
        resolve(false)
      }
      document.body.appendChild(script)
    })
  },

  async initializePayment(amount, onSuccess, onError) {
    try {
      console.log('Initializing payment for amount:', amount)
      const isLoaded = await this.loadRazorpayScript()
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load')
      }

      const order = await this.createOrder(amount)
      console.log('Order created, initializing Razorpay checkout')
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'ShopEasy',
        description: 'Purchase from ShopEasy',
        order_id: order.id,
        handler: async (response) => {
          try {
            console.log('Payment completed, verifying...', response)
            const verification = await this.verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            )
            if (verification.success && verification.verified) {
              console.log('Payment verified successfully')
              onSuccess(response)
            } else {
              console.error('Payment verification failed')
              onError(new Error('Payment verification failed'))
            }
          } catch (error) {
            console.error('Error in payment handler:', error)
            onError(error)
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#4F46E5',
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Error initializing payment:', error)
      onError(error)
    }
  }
} 