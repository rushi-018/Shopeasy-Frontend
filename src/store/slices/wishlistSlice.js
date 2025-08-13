import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async () => {
    // TODO: Replace with actual API call
    return []
  }
)

export const toggleWishlistItem = createAsyncThunk(
  'wishlist/toggleItem',
  async (productId) => {
    // TODO: Replace with actual API call
    return productId
  }
)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload)
        if (index !== -1) {
          state.items.splice(index, 1)
        } else {
          state.items.push({ id: action.payload })
        }
      })
  },
})

export default wishlistSlice.reducer 