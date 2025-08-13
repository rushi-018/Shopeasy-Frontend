import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { storeService } from '../../services/storeService'

// Async thunks for store operations
export const fetchStores = createAsyncThunk(
  'stores/fetchStores',
  async ({ location, filters } = {}) => {
    const response = await storeService.getStores({ location, ...filters })
    return response
  }
)

export const fetchStoreDetails = createAsyncThunk(
  'stores/fetchStoreDetails',
  async (storeId) => {
    const response = await storeService.getStoreById(storeId)
    return response
  }
)

export const addStoreReview = createAsyncThunk(
  'stores/addStoreReview',
  async ({ storeId, review }) => {
    const response = await storeService.addStoreReview(storeId, review)
    return { storeId, review: response }
  }
)

export const addStoreDeal = createAsyncThunk(
  'stores/addStoreDeal',
  async ({ storeId, deal }) => {
    const response = await storeService.addStoreDeal(storeId, deal)
    return { storeId, deal: response }
  }
)

export const updateStoreInventory = createAsyncThunk(
  'stores/updateStoreInventory',
  async ({ storeId, productId, quantity }) => {
    const response = await storeService.updateStoreInventory(storeId, productId, quantity)
    return { storeId, productId, quantity: response.quantity }
  }
)

const storesSlice = createSlice({
  name: 'stores',
  initialState: {
    items: [],
    selectedStore: null,
    loading: false,
    error: null,
    filters: {
      distance: 5,
      type: [],
      location: null,
    },
    inventory: {},
    deals: {},
    reviews: {},
  },
  reducers: {
    setStoreFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearStoreError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stores
      .addCase(fetchStores.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Fetch Store Details
      .addCase(fetchStoreDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStoreDetails.fulfilled, (state, action) => {
        state.loading = false
        state.selectedStore = action.payload
      })
      .addCase(fetchStoreDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Add Store Review
      .addCase(addStoreReview.fulfilled, (state, action) => {
        const { storeId, review } = action.payload
        if (!state.reviews[storeId]) {
          state.reviews[storeId] = []
        }
        state.reviews[storeId].push(review)
        // Update store rating
        if (state.selectedStore && state.selectedStore.id === storeId) {
          const reviews = state.reviews[storeId]
          const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
          state.selectedStore.rating = totalRating / reviews.length
          state.selectedStore.totalReviews = reviews.length
        }
      })
      // Add Store Deal
      .addCase(addStoreDeal.fulfilled, (state, action) => {
        const { storeId, deal } = action.payload
        if (!state.deals[storeId]) {
          state.deals[storeId] = []
        }
        state.deals[storeId].push(deal)
        // Update store deals
        if (state.selectedStore && state.selectedStore.id === storeId) {
          state.selectedStore.deals = state.deals[storeId]
        }
      })
      // Update Store Inventory
      .addCase(updateStoreInventory.fulfilled, (state, action) => {
        const { storeId, productId, quantity } = action.payload
        if (!state.inventory[storeId]) {
          state.inventory[storeId] = {}
        }
        state.inventory[storeId][productId] = quantity
      })
  },
})

export const { setStoreFilters, clearStoreError } = storesSlice.actions
export default storesSlice.reducer 