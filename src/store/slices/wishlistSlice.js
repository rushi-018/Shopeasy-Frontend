import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { wishlistService } from '../../services/wishlistService'

export const loadWishlist = createAsyncThunk('wishlist/load', async (token) => {
  const items = await wishlistService.get(token)
  return items
})

export const addToWishlist = createAsyncThunk('wishlist/add', async ({ token, productId, name, price, image }) => {
  await wishlistService.add(token, { productId, name, price, image })
  return { productId, name, price, image }
})

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async ({ token, productId }) => {
  await wishlistService.remove(token, productId)
  return productId
})

const slice = createSlice({
  name: 'wishlist',
  initialState: { items: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadWishlist.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        const pid = action.payload.productId
        const exists = state.items.find(p => (p._id || p.id || p.productId)?.toString() === pid.toString())
        if (!exists) state.items.push({ productId: pid, name: action.payload.name, price: action.payload.price, image: action.payload.image })
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(p => (p._id || p.id)?.toString() !== action.payload.toString())
      })
  }
})

export default slice.reducer