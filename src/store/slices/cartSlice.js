import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cartService } from '../../services/cartService'

export const loadCartFromServer = createAsyncThunk(
  'cart/loadFromServer',
  async (token) => {
    const data = await cartService.getCart(token)
    return data.items || []
  }
)

export const saveCartToServer = createAsyncThunk(
  'cart/saveToServer',
  async ({ token, items }) => {
    const data = await cartService.setCart(token, items)
    return data.items || []
  }
)

const initialState = {
  items: []
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      if (existingItem) {
        existingItem.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
    updateQuantity: (state, action) => {
      const item = state.items.find(item => item.id === action.payload.id)
      if (item) {
        item.quantity = action.payload.quantity
      }
    },
    clearCart: (state) => {
      state.items = []
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCartFromServer.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(saveCartToServer.fulfilled, (state, action) => {
        state.items = action.payload
      })
  }
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer 