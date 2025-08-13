import { MapPinIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

function StoreCard({ store }) {
  // Format location
  const location = store.location?.address || 'Location not available'
  
  // Format hours
  const formatHours = (hours) => {
    if (!hours) return 'Hours not available'
    const today = new Date().getDay()
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const todayHours = hours[days[today]]
    return todayHours ? `${todayHours.open} - ${todayHours.close}` : 'Closed'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <img
          src={store.logo || "https://placehold.co/100x100"}
          alt={store.name}
          className="w-16 h-16 object-contain rounded"
        />
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{store.name}</h3>
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <PhoneIcon className="h-4 w-4 mr-2" />
          <span>{store.contact?.phone || 'Phone not available'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <ClockIcon className="h-4 w-4 mr-2" />
          <span>{formatHours(store.hours)}</span>
        </div>
      </div>

      <div className="mt-4">
        <Link 
          to={`/store/${store._id}`}
          className="btn-primary w-full block text-center hover:bg-primary-dark transition-colors"
        >
          View Store Details
        </Link>
      </div>
    </div>
  )
}

export default StoreCard 