/**
 * OSMComponents.jsx
 * 100% Free Maps — Leaflet + OpenStreetMap + Nominatim
 * No API key. No credit card. No rate limit for normal use.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Fix Leaflet broken icons in Vite ────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom red Bartr marker
const bartrIcon = new L.DivIcon({
  className: '',
  html: `<div style="position:relative;width:32px;height:44px;filter:drop-shadow(0 4px 10px rgba(0,0,0,.4))">
    <svg viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 4.975 2.29 9.418 5.887 12.355L16 44l10.113-15.645C29.71 25.418 32 20.975 32 16 32 7.163 24.836 0 16 0z" fill="#ef4444"/>
      <circle cx="16" cy="16" r="7" fill="white" opacity="0.95"/>
    </svg>
  </div>`,
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -48],
});

// Current location (blue) marker
const myLocationIcon = new L.DivIcon({
  className: '',
  html: `<div style="position:relative;width:26px;height:26px">
    <div style="width:26px;height:26px;border-radius:50%;background:#3b82f6;border:4px solid white;box-shadow:0 0 0 3px rgba(59,130,246,.4),0 4px 12px rgba(0,0,0,.3)"></div>
  </div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const INDIA_CENTER = [20.5937, 78.9629];
const NOMINATIM = 'https://nominatim.openstreetmap.org';

// Reverse geocode a lat/lng
async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(`${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16`, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'Bartr.in App' }
    });
    const d = await r.json();
    return d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

// Search suggestions from Nominatim
async function nominatimSearch(q) {
  const r = await fetch(
    `${NOMINATIM}/search?q=${encodeURIComponent(q)}&countrycodes=in&format=json&limit=7&addressdetails=1`,
    { headers: { 'Accept-Language': 'en', 'User-Agent': 'Bartr.in App' } }
  );
  return r.json();
}

// ─── Internal: fly the map smoothly when coords change ───────────────────────
function FlyTo({ pos, zoom = 15 }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.flyTo(pos, zoom, { animate: true, duration: 0.8 });
  }, [pos]);
  return null;
}

// ─── Internal: map click → reverse geocode ───────────────────────────────────
function ClickHandler({ onPick }) {
  useMapEvents({
    async click({ latlng }) {
      const label = await reverseGeocode(latlng.lat, latlng.lng);
      onPick(label, [latlng.lat, latlng.lng]);
    }
  });
  return null;
}

// ─── LOCATION PICKER (used in Post a Gig form) ───────────────────────────────
export function LocationPickerMap({ onLocationSelect, initialLocation }) {
  const [markerPos, setMarkerPos] = useState(initialLocation || null);
  const [myPos, setMyPos] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const debounce = useRef(null);
  const inputRef = useRef(null);

  // Debounced search
  const handleQueryChange = (val) => {
    setQuery(val);
    setSuggestions([]);
    if (debounce.current) clearTimeout(debounce.current);
    if (val.trim().length < 2) return;
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await nominatimSearch(val);
        setSuggestions(data);
      } catch { /* ignore */ }
      finally { setSearching(false); }
    }, 400);
  };

  const pick = useCallback((label, pos) => {
    setMarkerPos(pos);
    setFlyTo(pos);
    setSuggestions([]);
    // Trim the label to a cleaner shorter form
    const short = label.split(',').slice(0, 4).join(',').trim();
    setQuery(short);
    onLocationSelect(short, pos);
  }, [onLocationSelect]);

  const selectSuggestion = (s) => {
    const pos = [parseFloat(s.lat), parseFloat(s.lon)];
    // Build a clean display label
    const a = s.address || {};
    const parts = [
      a.amenity, a.road, a.suburb, a.neighbourhood,
      a.city_district, a.city || a.town || a.village || a.county,
      a.state
    ].filter(Boolean);
    const label = parts.length >= 2 ? parts.join(', ') : s.display_name.split(',').slice(0, 4).join(',').trim();
    pick(label, pos);
  };

  // Use browser geolocation
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const pos = [coords.latitude, coords.longitude];
        setMyPos(pos);
        setFlyTo(pos);
        setLocating(false);
        const label = await reverseGeocode(coords.latitude, coords.longitude);
        pick(label, pos);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setLocError('Location permission denied. Please allow it in browser settings.');
        else if (err.code === 2) setLocError('Could not get your location. Please try again.');
        else setLocError('Location request timed out. Please try again.');
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>

      {/* Search bar + GPS button */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
        {/* Search input */}
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '16px', pointerEvents: 'none', zIndex: 1
          }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder="Search any location in India..."
            autoComplete="off"
            spellCheck={false}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '12px 36px 12px 38px',
              border: '3px solid #0f172a', borderRadius: '14px',
              fontWeight: '700', fontSize: '0.9rem', outline: 'none',
              background: '#f8fafc', transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onFocus={e => { e.target.style.borderColor = '#ef4444'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = '#0f172a'; e.target.style.background = '#f8fafc'; }}
          />
          {/* Spinner or clear */}
          {searching ? (
            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#ef4444' }}>
              <span style={{ display: 'inline-block', animation: 'bartr-spin 0.6s linear infinite' }}>⟳</span>
            </span>
          ) : query ? (
            <button type="button" onClick={() => { setQuery(''); setSuggestions([]); }}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: '#e2e8f0', border: 'none', borderRadius: '50%',
                width: '20px', height: '20px', cursor: 'pointer',
                fontSize: '11px', fontWeight: 900, color: '#64748b', lineHeight: '20px'
              }}
            >×</button>
          ) : null}

          {/* Dropdown suggestions */}
          {suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: 'white', border: '3px solid #0f172a', borderRadius: '14px',
              boxShadow: '5px 5px 0 #0f172a', zIndex: 9999,
              maxHeight: '240px', overflowY: 'auto'
            }}>
              {suggestions.map((s, i) => {
                const a = s.address || {};
                const primary = [a.amenity, a.road, a.suburb, a.neighbourhood, a.city_district]
                  .filter(Boolean).slice(0, 2).join(', ') || s.display_name.split(',')[0];
                const city = a.city || a.town || a.village || a.county || '';
                const state = a.state || '';
                return (
                  <button key={i} type="button" onMouseDown={() => selectSuggestion(s)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '10px 14px',
                      background: 'none', border: 'none',
                      borderBottom: i < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                      cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>📍</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: '800', fontSize: '0.86rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {primary}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600', marginTop: '2px' }}>
                        {[city, state].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Use My Location button */}
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          title="Use my current location"
          style={{
            flexShrink: 0,
            padding: '0 16px',
            border: '3px solid #0f172a',
            borderRadius: '14px',
            background: locating ? '#f1f5f9' : '#0f172a',
            color: locating ? '#94a3b8' : 'white',
            fontWeight: '800', fontSize: '0.8rem',
            cursor: locating ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { if (!locating) e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; }}
          onMouseLeave={e => { if (!locating) e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.borderColor = '#0f172a'; }}
        >
          {locating
            ? <><span style={{ display: 'inline-block', animation: 'bartr-spin 0.6s linear infinite' }}>⟳</span> Locating...</>
            : <>🎯 My Location</>
          }
        </button>
      </div>

      {/* Error message */}
      {locError && (
        <div style={{
          background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: '10px',
          padding: '8px 12px', fontSize: '0.78rem', fontWeight: '700', color: '#dc2626',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          ⚠️ {locError}
        </div>
      )}

      {/* Status chip */}
      {markerPos && !locError && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', background: '#f0fdf4', border: '2px solid #86efac',
          borderRadius: '10px', fontSize: '0.78rem', fontWeight: '800', color: '#15803d', width: 'fit-content'
        }}>
          ✓ Location pinned — you can also tap the map to adjust
        </div>
      )}

      {/* Map */}
      <div style={{
        flex: 1, minHeight: '260px',
        border: '3px solid #0f172a', borderRadius: '16px',
        overflow: 'hidden', boxShadow: '4px 4px 0 #0f172a'
      }}>
        <MapContainer
          center={markerPos || INDIA_CENTER}
          zoom={markerPos ? 14 : 5}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom
          zoomControl
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={19}
          />
          <ClickHandler onPick={(label, pos) => pick(label, pos)} />
          {flyTo && <FlyTo pos={flyTo} />}
          {markerPos && <Marker position={markerPos} icon={bartrIcon} />}
          {myPos && !markerPos && <Marker position={myPos} icon={myLocationIcon} />}
        </MapContainer>
      </div>

      <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textAlign: 'center' }}>
        🗺️ Search, tap the map, or use 🎯 My Location to pin your spot
      </p>

      <style>{`
        @keyframes bartr-spin { to { transform: rotate(360deg); } }
        .leaflet-container { font-family: inherit; }
      `}</style>
    </div>
  );
}

// ─── GIG LOCATION DISPLAY MAP (read-only) ─────────────────────────────────────
export function GigLocationMap({ location, coordinates }) {
  const [markerPos, setMarkerPos] = useState(
    coordinates ? [coordinates[0], coordinates[1]] : null
  );
  const [loading, setLoading] = useState(!coordinates && !!location && !/remote/i.test(location));

  useEffect(() => {
    if (!coordinates && location && !/remote/i.test(location)) {
      setLoading(true);
      nominatimSearch(location)
        .then(data => {
          if (data.length > 0) setMarkerPos([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [location, coordinates]);

  if (/remote/i.test(location)) {
    return (
      <div style={{
        width: '100%', height: '220px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        borderRadius: '18px', border: '4px solid black',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '0.6rem', color: 'white'
      }}>
        <div style={{ fontSize: '2.5rem' }}>🌐</div>
        <div style={{ fontSize: '1.2rem', fontWeight: '900', textTransform: 'uppercase' }}>Remote Work</div>
        <div style={{ fontSize: '0.85rem', fontWeight: '700', opacity: 0.85 }}>Work from anywhere in India</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        width: '100%', height: '220px', background: '#f8fafc', borderRadius: '18px',
        border: '4px solid black', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontWeight: '700', color: '#94a3b8', gap: '8px'
      }}>
        <span style={{ fontSize: '18px', display: 'inline-block', animation: 'bartr-spin2 0.7s linear infinite' }}>⟳</span>
        Finding on map...
        <style>{`@keyframes bartr-spin2 { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!markerPos) return null;

  return (
    <div style={{ width: '100%', height: '220px', border: '3px solid black', borderRadius: '16px', overflow: 'hidden', boxShadow: '4px 4px 0 black' }}>
      <MapContainer center={markerPos} zoom={14} style={{ width: '100%', height: '100%' }} scrollWheelZoom>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={markerPos} icon={bartrIcon} />
      </MapContainer>
    </div>
  );
}
