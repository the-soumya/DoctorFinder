import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SlotBookingModal from '../components/SlotBookingModal';
import L from 'leaflet';
import { 
  MapPin, 
  Search, 
  Star, 
  Stethoscope, 
  Navigation, 
  Filter, 
  Calendar, 
  ArrowRight,
  Shield,
  Clock,
  Compass,
  X,
  ExternalLink,
  Home
} from 'lucide-react';
import { formatDoctorName, formatCurrency } from '../utils/formatters';

// Corridor City Coordinates (Howrah to Bandel mainline, West Bengal)
const CORRIDOR_CITIES = [
  { name: 'Howrah', district: 'Howrah', lat: 22.5890, lon: 88.3410 },
  { name: 'Bally', district: 'Howrah', lat: 22.6520, lon: 88.3440 },
  { name: 'Uttarpara', district: 'Hooghly', lat: 22.6730, lon: 88.3340 },
  { name: 'Konnagar', district: 'Hooghly', lat: 22.7003, lon: 88.3540 },
  { name: 'Rishra', district: 'Hooghly', lat: 22.7110, lon: 88.3480 },
  { name: 'Serampore', district: 'Hooghly', lat: 22.7520, lon: 88.3370 },
  { name: 'Chandannagar', district: 'Hooghly', lat: 22.8680, lon: 88.3710 },
  { name: 'Chinsurah', district: 'Hooghly', lat: 22.9020, lon: 88.3950 },
  { name: 'Bandel', district: 'Hooghly', lat: 22.9240, lon: 88.3760 },
];

// Haversine distance formula in KM
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 100) / 100;
}

export default function DoctorsNearMe() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Home location - defaults to patient's home in Makhla, Uttarpara
  const [homeLocation, setHomeLocation] = useState({
    name: user?.address || 'Makhla, Uttarpara, Hooghly',
    lat: 22.6740,
    lon: 88.3360
  });

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locating, setLocating] = useState(false);

  // Filters
  const [specialty, setSpecialty] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [minRating, setMinRating] = useState('');
  const [selectedState, setSelectedState] = useState('West Bengal');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('');
  const [locationsData, setLocationsData] = useState({ states: [], districts: [], cities: [], cityToLocalities: {}, hierarchy: {} });

  // Navigation & Direction State
  const [activeRouteDoctor, setActiveRouteDoctor] = useState(null);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef([]);
  const routePolylineRef = useRef(null);
  const [roadRouteInfo, setRoadRouteInfo] = useState(null); // { distance, duration, geometry }

  // Read pre-selected specialty from AI Screener navigation state if present
  useEffect(() => {
    if (location.state?.recommendedSpecialist) {
      setSpecialty(location.state.recommendedSpecialist);
    }
  }, [location.state]);

  // Fetch departments & locations metadata
  useEffect(() => {
    api.get('/departments')
      .then(res => setDepartments(res.data))
      .catch(err => console.error('Failed to load departments', err));

    api.get('/doctors/locations')
      .then(res => setLocationsData(res.data))
      .catch(err => console.error('Failed to load locations', err));
  }, []);

  // Update home address if user logs in
  useEffect(() => {
    if (user?.address) {
      setHomeLocation(prev => ({
        ...prev,
        name: user.address
      }));
    }
  }, [user]);

  // Fetch doctors whenever filters change
  useEffect(() => {
    fetchDoctors();
  }, [homeLocation, specialty, departmentId, minRating, selectedState, selectedDistrict, selectedCity, selectedLocality]);

  const fetchBrowserLocation = () => {
    if ('geolocation' in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newHome = {
            name: 'Current GPS Location',
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          };
          setHomeLocation(newHome);
          setLocating(false);
          if (leafletMap.current) {
            leafletMap.current.setView([pos.coords.latitude, pos.coords.longitude], 14);
          }
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, maintaining home coordinates', err.message);
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const setHomePreset = (name, lat, lon) => {
    setHomeLocation({ name, lat, lon });
    if (leafletMap.current) {
      leafletMap.current.setView([lat, lon], 14);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (homeLocation.lat) params.append('latitude', homeLocation.lat);
      if (homeLocation.lon) params.append('longitude', homeLocation.lon);
      if (specialty) params.append('specialization', specialty);
      if (departmentId) params.append('departmentId', departmentId);
      if (minRating) params.append('minRating', minRating);
      if (selectedState) params.append('state', selectedState);
      if (selectedDistrict) params.append('district', selectedDistrict);
      if (selectedCity) params.append('city', selectedCity);
      if (selectedLocality) params.append('locality', selectedLocality);

      const res = await api.get(`/doctors/near-me?${params.toString()}`);
      
      // Calculate accurate distance from user's current home location
      const enriched = res.data.map(doc => {
        const dist = calculateHaversineDistance(homeLocation.lat, homeLocation.lon, doc.latitude, doc.longitude);
        return {
          ...doc,
          calculatedDistance: dist != null ? dist : doc.distanceKm
        };
      });

      // Sort by distance
      enriched.sort((a, b) => {
        if (a.calculatedDistance != null && b.calculatedDistance != null) {
          return a.calculatedDistance - b.calculatedDistance;
        }
        return (b.rating || 0) - (a.rating || 0);
      });

      setDoctors(enriched);
    } catch (err) {
      console.error('Failed to load nearby doctors', err);
    } finally {
      setLoading(false);
    }
  };

  // Location filter handlers
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedCity('');
    setSelectedLocality('');
    if (district === 'Hooghly') {
      if (leafletMap.current) leafletMap.current.setView([22.7500, 88.3500], 12);
    } else if (district === 'Howrah') {
      if (leafletMap.current) leafletMap.current.setView([22.6000, 88.3300], 12);
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setSelectedLocality('');

    const matchedCity = CORRIDOR_CITIES.find(c => c.name.toLowerCase() === city.toLowerCase());
    if (matchedCity) {
      setSelectedDistrict(matchedCity.district);
      if (leafletMap.current) {
        leafletMap.current.setView([matchedCity.lat, matchedCity.lon], 14);
      }
    }
  };

  const handleLocalityChange = (locality) => {
    setSelectedLocality(locality);
    if (!locality) return;

    // Center map on doctor matching locality if available
    const docInLocality = doctors.find(d => d.locality === locality);
    if (docInLocality && leafletMap.current) {
      leafletMap.current.setView([docInLocality.latitude, docInLocality.longitude], 15);
    }
  };

  const handleClearFilters = () => {
    setSpecialty('');
    setDepartmentId('');
    setMinRating('');
    setSelectedDistrict('');
    setSelectedCity('');
    setSelectedLocality('');
    setActiveRouteDoctor(null);
  };

  const handleFindDirection = async (doc = null) => {
    const targetDoc = doc || doctors[0];
    if (!targetDoc) return;

    setActiveRouteDoctor(targetDoc);
    setRoadRouteInfo(null);

    // Scroll map into view
    if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Fetch road-based route from OSRM (free, no API key)
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/` +
        `${homeLocation.lon},${homeLocation.lat};${targetDoc.longitude},${targetDoc.latitude}` +
        `?overview=full&geometries=geojson&steps=false`;
      const res = await fetch(osrmUrl);
      const data = await res.json();
      if (data.code === 'Ok' && data.routes?.[0]) {
        const route = data.routes[0];
        setRoadRouteInfo({
          distance: (route.distance / 1000).toFixed(1), // km
          duration: Math.ceil(route.duration / 60),     // minutes
          geometry: route.geometry
        });
      }
    } catch (err) {
      console.warn('OSRM road routing failed, using straight-line fallback', err);
    }
  };

  const handleClearRoute = () => {
    setActiveRouteDoctor(null);
    setRoadRouteInfo(null);
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current).setView([homeLocation.lat, homeLocation.lon], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(leafletMap.current);
    }

    // Clear existing markers & route polyline
    markersRef.current.forEach(m => leafletMap.current.removeLayer(m));
    markersRef.current = [];

    if (routePolylineRef.current) {
      leafletMap.current.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    // Patient User's Home Marker
    const homeIcon = L.divIcon({
      className: 'patient-home-marker',
      html: `<div style="
        background: #0284C7;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 3px solid #FFFFFF;
        box-shadow: 0 4px 12px rgba(2, 132, 199, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: white;
      ">🏠</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const userMarker = L.marker([homeLocation.lat, homeLocation.lon], { icon: homeIcon })
      .addTo(leafletMap.current)
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
          <strong style="color: #0284C7; font-size: 14px;">📍 Your Home Location</strong><br/>
          <span>${homeLocation.name}</span><br/>
          <small style="color: #64748B;">Starting point for clinic navigation</small>
        </div>
      `);
    markersRef.current.push(userMarker);

    // Doctor clinic markers
    doctors.forEach(doc => {
      const isRouteDestination = activeRouteDoctor && activeRouteDoctor.id === doc.id;

      const doctorIcon = L.divIcon({
        className: 'doctor-marker',
        html: `<div style="
          background: ${isRouteDestination ? '#DC2626' : '#16A34A'};
          width: ${isRouteDestination ? '36px' : '30px'};
          height: ${isRouteDestination ? '36px' : '30px'};
          border-radius: 50%;
          border: ${isRouteDestination ? '3px solid #FEE2E2' : '2px solid #FFFFFF'};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFF;
          font-weight: bold;
          font-size: ${isRouteDestination ? '16px' : '13px'};
          box-shadow: ${isRouteDestination ? '0 0 14px rgba(220, 38, 38, 0.8)' : '0 2px 6px rgba(0,0,0,0.3)'};
          transition: transform 0.2s ease;
        ">${isRouteDestination ? '🎯' : '⚕'}</div>`,
        iconSize: isRouteDestination ? [36, 36] : [30, 30],
        iconAnchor: isRouteDestination ? [18, 18] : [15, 15]
      });

      const docName = formatDoctorName(doc.name);
      const distText = doc.calculatedDistance != null ? `${doc.calculatedDistance} km from home` : '';

      const marker = L.marker([doc.latitude, doc.longitude], { icon: doctorIcon })
        .addTo(leafletMap.current)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 13px; min-width: 220px; line-height: 1.4;">
            <strong style="color: #0F172A; font-size: 14px;">${docName}</strong><br/>
            <span style="color: #0D9488; font-weight: 600;">${doc.degree || 'MBBS, MD'}</span><br/>
            <span style="color: #64748B;">${doc.specialization}</span><br/>
            <div style="margin: 4px 0; padding: 4px 8px; background: #F1F5F9; border-radius: 6px;">
              <strong style="color: #0284C7; font-size: 12px;">📍 ${doc.locality || 'Main Road'}, ${doc.city}</strong><br/>
              <span style="color: #475569; font-size: 11px;">${doc.clinicAddress || ''}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
              <span style="font-weight: bold; color: #0284C7; font-size: 14px;">Fee: ₹${doc.consultationFee}</span>
              <span style="color: #16A34A; font-weight: 600; font-size: 12px;">${distText}</span>
            </div>
            <div style="margin-top: 8px; display: flex; gap: 6px;">
              <button 
                onclick="window.__getDirectionsFromHome(${doc.id})" 
                style="background: #0284C7; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer; font-weight: 600; flex: 1;"
              >
                Find Direction
              </button>
              <button 
                onclick="window.__bookDoctorFromMap(${doc.id})" 
                style="background: #16A34A; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer; font-weight: 600; flex: 1;"
              >
                Book
              </button>
            </div>
          </div>
        `);
      markersRef.current.push(marker);
    });

    // Expose click triggers from Leaflet popup HTML safely
    window.__getDirectionsFromHome = (doctorId) => {
      const doc = doctors.find(d => d.id === doctorId);
      if (doc) handleFindDirection(doc);
    };

    window.__bookDoctorFromMap = (doctorId) => {
      const doc = doctors.find(d => d.id === doctorId);
      if (doc) handleBookDoctor(doc);
    };

    // If an active route is set, draw road-based route from Home to Doctor Clinic
    if (activeRouteDoctor) {
      const homeCoords = [homeLocation.lat, homeLocation.lon];
      const docCoords = [activeRouteDoctor.latitude, activeRouteDoctor.longitude];

      if (roadRouteInfo?.geometry) {
        // Draw OSRM road geometry (accurate road path)
        const coords = roadRouteInfo.geometry.coordinates.map(c => [c[1], c[0]]);
        const polyline = L.polyline(coords, {
          color: '#0284C7',
          weight: 5,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(leafletMap.current);
        routePolylineRef.current = polyline;
        leafletMap.current.fitBounds(polyline.getBounds(), { padding: [60, 60] });
      } else {
        // Fallback: straight dashed line while OSRM loads
        const polyline = L.polyline([homeCoords, docCoords], {
          color: '#0284C7',
          weight: 4,
          opacity: 0.7,
          dashArray: '8, 8',
          lineCap: 'round'
        }).addTo(leafletMap.current);
        routePolylineRef.current = polyline;
        const bounds = L.latLngBounds([homeCoords, docCoords]);
        leafletMap.current.fitBounds(bounds, { padding: [60, 60] });
      }
    }

  }, [homeLocation, doctors, activeRouteDoctor, roadRouteInfo]);

  const handleBookDoctor = (doc) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedDoctorForBooking(doc);
  };

  // Available districts (Hooghly, Howrah)
  const availableDistricts = locationsData.districts?.length > 0 
    ? locationsData.districts 
    : ['Hooghly', 'Howrah'];

  // Available cities (mainline corridor)
  const availableCities = selectedDistrict && locationsData.hierarchy?.['West Bengal']?.[selectedDistrict]
    ? Array.from(locationsData.hierarchy['West Bengal'][selectedDistrict])
    : (locationsData.cities?.length > 0 ? locationsData.cities : CORRIDOR_CITIES.map(c => c.name));

  // Available localities for selected city
  const availableLocalities = selectedCity && locationsData.cityToLocalities?.[selectedCity]
    ? locationsData.cityToLocalities[selectedCity]
    : [];

  // Active route metrics calculation
  const routeDistance = roadRouteInfo?.distance
    ? parseFloat(roadRouteInfo.distance)
    : activeRouteDoctor
      ? calculateHaversineDistance(homeLocation.lat, homeLocation.lon, activeRouteDoctor.latitude, activeRouteDoctor.longitude)
      : null;

  const estimatedDriveMins = roadRouteInfo?.duration
    ? roadRouteInfo.duration
    : (routeDistance ? Math.max(2, Math.round(routeDistance * 2.8)) : null);
  const estimatedWalkMins = routeDistance ? Math.round(routeDistance * 13) : null;
  const isRoadRoute = !!roadRouteInfo?.geometry;
  const googleMapsUrl = activeRouteDoctor
    ? `https://www.google.com/maps/dir/?api=1&origin=${homeLocation.lat},${homeLocation.lon}&destination=${activeRouteDoctor.latitude},${activeRouteDoctor.longitude}&travelmode=driving`
    : null;

  return (
    <div className="container" style={{ padding: '2rem 1.25rem' }}>
      {/* Title & Patient Home Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            Find Doctors Near You
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Verified medical specialists across West Bengal along the Howrah to Bandel mainline corridor.
          </p>
        </div>

        {/* Home Location Indicator & GPS Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--primary-subtle)',
            border: '1px solid var(--primary-border, #BAE6FD)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            fontSize: '0.85rem'
          }}>
            <Home size={16} color="var(--primary)" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Home: <strong style={{ color: 'var(--primary)' }}>{homeLocation.name}</strong>
            </span>
          </div>

          <button
            onClick={fetchBrowserLocation}
            disabled={locating}
            className="btn btn-secondary btn-sm"
            id="btn-detect-location"
            title="Use your real device GPS coordinates"
          >
            <Navigation size={15} color="var(--primary)" />
            <span>{locating ? 'Locating...' : 'Use My GPS'}</span>
          </button>
        </div>
      </div>

      {/* Mainline Corridor Quick Filter Rail */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
            <Compass size={16} />
            <span>Mainline Railway Stations & Cities (Howrah to Bandel):</span>
          </div>

          {/* Quick Find Nearest Button */}
          <button
            onClick={() => handleFindDirection(null)}
            disabled={doctors.length === 0}
            className="btn btn-primary btn-xs"
            style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
            id="btn-find-nearest-top"
          >
            <MapPin size={14} />
            <span>📍 Find Direction to Nearest Doctor</span>
          </button>
        </div>

        {/* City Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => { setSelectedCity(''); setSelectedLocality(''); }}
            className={`btn btn-xs ${!selectedCity ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: '16px' }}
            id="pill-all-corridor"
          >
            All Cities ({CORRIDOR_CITIES.length})
          </button>

          {CORRIDOR_CITIES.map(city => (
            <button
              key={city.name}
              type="button"
              onClick={() => handleCityChange(city.name)}
              className={`btn btn-xs ${selectedCity.toLowerCase() === city.name.toLowerCase() ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: '16px' }}
              id={`pill-city-${city.name.toLowerCase()}`}
            >
              📍 {city.name}
            </button>
          ))}
        </div>

        {/* Locality Sub-Pills (Visible when a city is chosen) */}
        {selectedCity && availableLocalities.length > 0 && (
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)' }}>
              Parts of {selectedCity}:
            </span>
            <button
              type="button"
              onClick={() => handleLocalityChange('')}
              className={`btn btn-xs ${!selectedLocality ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', border: !selectedLocality ? '1px solid var(--primary)' : '1px solid var(--border-medium)' }}
            >
              All {selectedCity}
            </button>
            {availableLocalities.map(loc => (
              <button
                key={loc}
                type="button"
                onClick={() => handleLocalityChange(loc)}
                className={`btn btn-xs ${selectedLocality === loc ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.72rem', padding: '2px 10px', borderRadius: '12px' }}
                id={`pill-loc-${loc.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                {loc}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Dropdowns Card */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
          
          {/* District Dropdown */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              District
            </label>
            <select
              className="form-select"
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              id="filter-district-select"
            >
              <option value="">All Districts (Hooghly & Howrah)</option>
              {availableDistricts.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              City / Mainline Town
            </label>
            <select
              className="form-select"
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              id="filter-city-select"
            >
              <option value="">All Towns (Howrah to Bandel)</option>
              {availableCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Locality Dropdown */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Part of City / Locality
            </label>
            <select
              className="form-select"
              value={selectedLocality}
              onChange={(e) => handleLocalityChange(e.target.value)}
              id="filter-locality-select"
              disabled={!selectedCity && availableLocalities.length === 0}
            >
              <option value="">All Localities in {selectedCity || 'City'}</option>
              {availableLocalities.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Specialty Search */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Specialty or Name
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Cardiologist, Physician..."
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              id="filter-specialty-input"
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Department
            </label>
            <select
              className="form-select"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              id="filter-department-select"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              id="btn-clear-filters"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map with Direction Banner (Left) + Doctor Cards List (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(370px, 1fr))', gap: '1.75rem', alignItems: 'start' }}>
        
        {/* Map Column */}
        <div>
          {/* Active Direction Banner */}
          {activeRouteDoctor ? (
            <div 
              style={{
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem',
                marginBottom: '1rem',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
              id="direction-route-banner"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
                    Active Direction from Your Home
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0 0', color: '#FFFFFF' }}>
                    {formatDoctorName(activeRouteDoctor.name)}
                  </h3>
                  <div style={{ fontSize: '0.85rem', opacity: 0.95 }}>
                    📍 {activeRouteDoctor.locality}, {activeRouteDoctor.city} &bull; {activeRouteDoctor.clinicAddress}
                  </div>
                </div>

                <button
                  onClick={handleClearRoute}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  title="Clear Direction"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Distance & Estimated Travel Time Badges */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {!roadRouteInfo && activeRouteDoctor && (
                  <div style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, opacity: 0.85 }}>
                    ⏳ Calculating road route...
                  </div>
                )}
                {routeDistance && (
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700 }}>
                    📏 {routeDistance} km {isRoadRoute ? 'via road' : '(straight-line)'}
                  </div>
                )}
                {estimatedDriveMins && (
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                    🚗 ~{estimatedDriveMins} mins {isRoadRoute ? 'by road' : 'drive est.'}
                  </div>
                )}
                {estimatedWalkMins && (
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                    🚶 ~{estimatedWalkMins} mins walk
                  </div>
                )}
                {isRoadRoute && (
                  <div style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.3)' }}>
                    ✅ Real Road Route (OSRM)
                  </div>
                )}
              </div>

              {/* Action Buttons: Google Maps & Book Appointment */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ background: '#FFFFFF', color: '#0369A1', fontWeight: 700, textDecoration: 'none' }}
                  id="btn-open-google-maps"
                >
                  <ExternalLink size={14} />
                  <span>Open in Google Maps Navigation</span>
                </a>

                <button
                  onClick={() => handleBookDoctor(activeRouteDoctor)}
                  className="btn btn-sm"
                  style={{ background: '#16A34A', color: 'white', fontWeight: 700, border: 'none' }}
                  id="btn-book-from-direction"
                >
                  <Calendar size={14} />
                  <span>Book Appointment</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  Interactive Clinic Map
                </h2>
                <span style={{ fontSize: '0.75rem', background: 'var(--primary-subtle)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                  Howrah &bull; Hooghly
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '12px', height: '12px', background: '#0284C7', borderRadius: '50%' }}></span> Home
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '12px', height: '12px', background: '#16A34A', borderRadius: '50%' }}></span> Clinic
                </span>
              </div>
            </div>
          )}

          {/* Leaflet Map Canvas */}
          <div
            ref={mapRef}
            id="doctors-map-container"
            style={{
              width: '100%',
              height: '560px',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-sm)',
              zIndex: 1
            }}
          />

          {/* Map Footer Tip */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>💡 Click any doctor's marker or "Find Direction" for real road-based route from your home (powered by OSRM).</span>
            <button
              onClick={() => handleFindDirection(null)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              Route to Nearest
            </button>
          </div>
        </div>

        {/* Doctor List Cards Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              Doctors in West Bengal ({doctors.length})
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Sorted by Proximity to Home
            </span>
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '4px' }}>
            {doctors.map(doc => {
              const name = formatDoctorName(doc.name);
              const photo = doc.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
              const fee = formatCurrency(doc.consultationFee);
              const degree = doc.degree || 'MBBS, MD';
              const isSelectedRoute = activeRouteDoctor && activeRouteDoctor.id === doc.id;
              const dist = doc.calculatedDistance != null ? `${doc.calculatedDistance} km from home` : 'In West Bengal';

              return (
                <div
                  key={doc.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    border: isSelectedRoute ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    background: isSelectedRoute ? 'var(--primary-subtle)' : 'var(--surface)'
                  }}
                  id={`doctor-card-${doc.id}`}
                >
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    {/* Doctor Portrait Photo */}
                    <img
                      src={photo}
                      alt={name}
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--primary-subtle)',
                        flexShrink: 0
                      }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
                      }}
                    />

                    {/* Doctor Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                            {name}
                          </h3>
                          <div style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 700, marginTop: '2px' }}>
                            {degree}
                          </div>
                          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {doc.specialization} &bull; {doc.departmentName}
                          </div>
                          {/* Location & Locality Pill */}
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.775rem', color: 'var(--primary)', fontWeight: 600, background: 'var(--primary-subtle)', padding: '2px 8px', borderRadius: '12px', marginTop: '4px' }}>
                            <MapPin size={11} />
                            <span>{doc.locality ? `${doc.locality}, ${doc.city}` : `${doc.city || 'Uttarpara'}, Hooghly`}</span>
                          </div>
                        </div>

                        {/* Consultation Price Badge */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                            {fee}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Fee
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#D97706',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}>
                          <Star size={13} fill="#D97706" />
                          <span>{doc.rating || 4.8}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>&bull;</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {doc.experienceYears || 10} Years Exp
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clinic Address & Bio */}
                  {doc.clinicAddress && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-subtle, #F8FAFC)', padding: '6px 10px', borderRadius: '6px' }}>
                      📍 <strong>Clinic:</strong> {doc.clinicAddress}
                    </div>
                  )}

                  {doc.bio && (
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                      {doc.bio}
                    </p>
                  )}

                  {/* Distance & Action Buttons */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    marginTop: '2px',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 700 }}>
                      <MapPin size={15} />
                      <span>{dist}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {/* Direction from My Home Button */}
                      <button
                        type="button"
                        onClick={() => handleFindDirection(doc)}
                        className={`btn btn-sm ${isSelectedRoute ? 'btn-primary' : 'btn-secondary'}`}
                        id={`btn-direction-doctor-${doc.id}`}
                        title="Show directions on map from your home"
                      >
                        <Compass size={14} />
                        <span>{isSelectedRoute ? 'Route Active' : 'Get Direction'}</span>
                      </button>

                      {/* Book Appointment Button */}
                      <button
                        type="button"
                        onClick={() => handleBookDoctor(doc)}
                        className="btn btn-primary btn-sm"
                        id={`btn-book-doctor-${doc.id}`}
                      >
                        <Calendar size={14} />
                        <span>Book Slot</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {doctors.length === 0 && !loading && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                No doctors found matching the selected area or specialty. Try choosing "All Cities" or "All Localities".
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slot Booking & Razorpay Modal */}
      {selectedDoctorForBooking && (
        <SlotBookingModal
          doctor={selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          onBookingSuccess={() => {
            fetchDoctors();
          }}
        />
      )}
    </div>
  );
}
