import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom red marker icon
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks for location selection
function LocationMarker({ position, setPosition, onLocationSelect }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      
      // Reverse geocode to get address
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(res => res.json())
        .then(data => {
          const address = data.display_name || `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
          onLocationSelect(address, newPos);
        })
        .catch(() => {
          onLocationSelect(`${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`, newPos);
        });
    },
  });

  return position ? (
    <Marker position={position} icon={redIcon}>
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
}

// Map for selecting location when posting a gig
export function LocationPickerMap({ onLocationSelect, initialLocation }) {
  const nagpurCenter = [21.1458, 79.0882]; // Nagpur coordinates
  const [position, setPosition] = useState(initialLocation || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Nagpur')}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    }
    setSearching(false);
  };

  const selectSearchResult = (result) => {
    const newPos = [parseFloat(result.lat), parseFloat(result.lon)];
    setPosition(newPos);
    onLocationSelect(result.display_name, newPos);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search location in Nagpur..."
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            border: '3px solid black',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={searching}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'black',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '900',
            cursor: searching ? 'not-allowed' : 'pointer',
            opacity: searching ? 0.6 : 1
          }}
        >
          {searching ? '...' : 'Search'}
        </button>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div style={{
          background: 'white',
          border: '3px solid black',
          borderRadius: '12px',
          maxHeight: '150px',
          overflowY: 'auto'
        }}>
          {searchResults.map((result, idx) => (
            <div
              key={idx}
              onClick={() => selectSearchResult(result)}
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                borderBottom: idx < searchResults.length - 1 ? '1px solid #eee' : 'none',
                fontWeight: '600',
                fontSize: '0.85rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              {result.display_name}
            </div>
          ))}
        </div>
      )}

      {/* Map */}
      <div style={{ flex: 1, minHeight: '300px', border: '4px solid black', borderRadius: '16px', overflow: 'hidden' }}>
        <MapContainer
          center={position || nagpurCenter}
          zoom={position ? 15 : 12}
          style={{ width: '100%', height: '100%' }}
          key={position ? position.join(',') : 'default'}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
        </MapContainer>
      </div>

      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textAlign: 'center' }}>
        💡 Click on the map to select a location or search above
      </div>
    </div>
  );
}

// Map for displaying a gig's location (read-only)
export function GigLocationMap({ location, coordinates }) {
  const nagpurCenter = [21.1458, 79.0882];
  const [position, setPosition] = useState(coordinates || null);
  const [loading, setLoading] = useState(!coordinates);

  useEffect(() => {
    if (!coordinates && location && location !== 'Remote') {
      // Geocode the location string
      setLoading(true);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location + ', Nagpur')}&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [location, coordinates]);

  if (location === 'Remote' || (!position && !loading)) {
    return (
      <div style={{
        width: '100%',
        height: '250px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        border: '4px solid black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        color: 'white'
      }}>
        <div style={{ fontSize: '3rem' }}>🌐</div>
        <div style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase' }}>Remote Work</div>
        <div style={{ fontSize: '0.9rem', fontWeight: '700', opacity: 0.9 }}>Location flexible</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        width: '100%',
        height: '250px',
        background: '#f8fafc',
        borderRadius: '16px',
        border: '4px solid black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        color: '#64748b'
      }}>
        Loading map...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '250px', border: '4px solid black', borderRadius: '16px', overflow: 'hidden' }}>
      <MapContainer
        center={position || nagpurCenter}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position && (
          <Marker position={position} icon={redIcon}>
            <Popup>{location}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
