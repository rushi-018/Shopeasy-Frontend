import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPinIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline'
import StoreMap from '../components/maps/StoreMap'

function StoreLocator() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'

  useEffect(() => {
    // TODO: Replace with actual API call
    // Mock data for now
    setStores([
      {
        _id: '1',
        name: 'Store 1',
        image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgMzAwIDMwMCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiM0RjQ2RTUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyNHB4IiBmaWxsPSJ3aGl0ZSI+U3RvcmUgMTwvdGV4dD48L3N2Zz4=',
        address: '123 Main St',
        rating: 4.5,
        location: {
          coordinates: [72.8777, 19.0760] // Mumbai
        }
      },
      {
        _id: '2',
        name: 'Store 2',
        address: '456 Market St, City 2',
        phone: '+91 9876543210',
        hours: '10:00 AM - 9:00 PM',
        rating: 4.2,
        image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgMzAwIDMwMCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxMEI5ODEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyNHB4IiBmaWxsPSJ3aGl0ZSI+U3RvcmUgMjwvdGV4dD48L3N2Zz4=',
        distance: '3.8 km',
        location: {
          coordinates: [77.2090, 28.6139] // Delhi
        }
      },
      {
        _id: '3',
        name: 'Store 3',
        address: '789 Shopping St, City 3',
        phone: '+91 5555555555',
        hours: '11:00 AM - 8:00 PM',
        rating: 4.7,
        image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgMzAwIDMwMCI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGNTlFMEIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyNHB4IiBmaWxsPSJ3aGl0ZSI+U3RvcmUgMzwvdGV4dD48L3N2Zz4=',
        distance: '5.2 km',
        location: {
          coordinates: [80.2707, 13.0827] // Chennai
        }
      }
    ])
    setLoading(false)
  }, [])

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Find a Store Near You
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Discover local stores and shop in person
        </p>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center max-w-xl mx-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by store name or location"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div className="ml-4 flex items-center">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-l-md ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-2 rounded-r-md ${
                viewMode === 'map'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Map
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="mt-8">
          <StoreMap stores={filteredStores} />
        </div>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={store.image}
                alt={store.name}
                className="object-cover object-center w-full h-full"
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">
                <Link to={`/stores/${store.id}`} className="hover:text-primary">
                  {store.name}
                </Link>
              </h3>
              <div className="mt-2 flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <svg
                      key={rating}
                      className={`h-5 w-5 ${
                        rating < store.rating
                          ? 'text-yellow-400'
                          : 'text-gray-200'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="ml-2 text-sm text-gray-500">{store.rating}</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  {store.address}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  {store.phone}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  {store.hours}
                </div>
                <div className="text-sm text-gray-500">
                  Distance: {store.distance}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredStores.length === 0 && (
          <div className="col-span-3 py-12 text-center">
            <p className="text-lg text-gray-500">No stores found matching your search.</p>
          </div>
        )}
      </div>
      )}
      {filteredStores.length === 0 && (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No stores found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search query to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  )
}

export default StoreLocator 