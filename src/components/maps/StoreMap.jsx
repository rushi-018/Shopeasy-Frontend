import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

const containerStyle = {
  width: '100%',
  height: '500px'
};

// Default center (can be changed to user's location with geolocation)
const center = {
  lat: 20.5937,
  lng: 78.9629 // Center of India
};

const StoreMap = ({ stores = [] }) => {
  const [selectedStore, setSelectedStore] = React.useState(null);
  
  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });
  
  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Handle marker click
  const handleMarkerClick = (store) => {
    setSelectedStore(store);
  };
  
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <LoadingSpinner />;

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={5}
        onLoad={onMapLoad}
      >
        {stores.map((store) => (
          <Marker
            key={store._id}
            position={{
              lat: store.location.coordinates[1],
              lng: store.location.coordinates[0]
            }}
            onClick={() => handleMarkerClick(store)}
          />
        ))}
        
        {selectedStore && (
          <InfoWindow
            position={{
              lat: selectedStore.location.coordinates[1],
              lng: selectedStore.location.coordinates[0]
            }}
            onCloseClick={() => setSelectedStore(null)}
          >
            <div className="p-2">
              <h3 className="font-bold">{selectedStore.name}</h3>
              <p>{selectedStore.address}</p>
              <Link 
                to={`/stores/${selectedStore._id}`} 
                className="text-blue-600 hover:underline mt-2 block"
              >
                View Store Details
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default StoreMap;
