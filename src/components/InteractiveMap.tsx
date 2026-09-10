import { useEffect, useRef, useState, FormEvent } from 'react';
import L from 'leaflet';
import { Job } from '../types';
import {
  MapPin,
  Locate,
  Filter,
  Radio,
  Layers,
  Search,
  Compass,
  ExternalLink,
  Zap,
  Maximize2,
  Minimize2,
  Navigation2,
} from 'lucide-react';

interface InteractiveMapProps {
  jobs: Job[];
  userLat: number;
  userLng: number;
  currentCity: string;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  onQuickApply: (job: Job) => void;
  onCityChange?: (cityName: string, lat: number, lng: number) => void;
}

// 100% Free Open-Source OpenStreetMap & Leaflet Tile Providers (No API keys, zero watermarks)
const TILE_PROVIDERS = {
  dark: {
    name: 'OSM Night Radar',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19,
    className: 'leaflet-dark-tiles',
  },
  esri_dark: {
    name: 'Esri Dark Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    subdomains: '',
    maxZoom: 16,
    className: '',
  },
  osm_standard: {
    name: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19,
    className: '',
  },
  esri_streets: {
    name: 'Esri World Streets',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    subdomains: '',
    maxZoom: 18,
    className: '',
  },
  topo: {
    name: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, SRTM | Map style: &copy; OpenTopoMap',
    subdomains: 'abc',
    maxZoom: 17,
    className: '',
  },
};

type TileKey = keyof typeof TILE_PROVIDERS;

export default function InteractiveMap({
  jobs,
  userLat,
  userLng,
  currentCity,
  selectedCategory,
  onSelectCategory,
  radiusKm,
  onRadiusChange,
  onQuickApply,
  onCityChange,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeTile, setActiveTile] = useState<TileKey>('dark');
  const [showTileDrawer, setShowTileDrawer] = useState(false);
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Initialize Leaflet + OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLat, userLng],
        zoom: 13,
        zoomControl: false,
        attributionControl: true,
      });

      // Add default tile layer
      const provider = TILE_PROVIDERS[activeTile];
      const tileLayer = L.tileLayer(provider.url, {
        maxZoom: provider.maxZoom,
        subdomains: provider.subdomains,
        attribution: provider.attribution,
        className: provider.className,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Custom zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    } else {
      mapInstanceRef.current.setView([userLat, userLng], 13);
    }
  }, [userLat, userLng]);

  // Handle Tile Provider Switching
  const handleTileChange = (key: TileKey) => {
    setActiveTile(key);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const provider = TILE_PROVIDERS[key];
    const newLayer = L.tileLayer(provider.url, {
      maxZoom: provider.maxZoom,
      subdomains: provider.subdomains,
      attribution: provider.attribution,
      className: provider.className,
    }).addTo(map);

    tileLayerRef.current = newLayer;
    setShowTileDrawer(false);
  };

  // Update Markers whenever jobs, radius, or coordinates change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // 1. Add User Location Marker with pulse ring
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position:relative; width:38px; height:38px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:36px; height:36px; border-radius:50%; background:rgba(16,185,129,0.3); animation:pulse 2s infinite ease-in-out;"></div>
          <div style="position:absolute; width:20px; height:20px; border-radius:50%; background:#10b981; border:2px solid #ffffff; box-shadow:0 0 14px rgba(16,185,129,0.9); display:flex; align-items:center; justify-content:center;">
            <span style="font-size:7px; font-weight:900; color:#000000; font-family:sans-serif;">YOU</span>
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    L.marker([userLat, userLng], { icon: userIcon })
      .addTo(markersLayer)
      .bindPopup(`
        <div style="font-family:'Inter', sans-serif; padding:4px; min-width:160px;">
          <div style="font-size:10px; color:#10b981; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:2px;">📍 RADAR POSITION</div>
          <div style="font-size:12px; font-weight:700; color:#111827;">${currentCity}</div>
          <div style="font-size:10px; color:#6b7280; margin-top:2px;">Radius: ${radiusKm}km (${jobs.length} open works)</div>
          <div style="font-size:9px; color:#9ca3af; margin-top:4px; border-top:1px solid #e5e7eb; padding-top:2px;">Powered by OpenStreetMap & Leaflet</div>
        </div>
      `);

    // Radius Circle visualization
    const radiusCircle = L.circle([userLat, userLng], {
      radius: radiusKm * 1000,
      color: '#10b981',
      weight: 1.5,
      opacity: 0.6,
      fillColor: '#10b981',
      fillOpacity: 0.05,
      dashArray: '4, 6',
    });
    radiusCircle.addTo(markersLayer);

    // 2. Add Job Pins
    jobs.forEach((job) => {
      const isUrgent = job.is_urgent;
      const markerHtml = `
        <div style="cursor:pointer; display:flex; flex-direction:column; align-items:center;">
          <div style="
            width: 32px; height: 32px; border-radius: 6px;
            background: ${isUrgent ? 'linear-gradient(135deg, #064e3b, #0c0c0c)' : '#141414'};
            border: 1.5px solid ${isUrgent ? '#10b981' : '#374151'};
            box-shadow: ${isUrgent ? '0 0 12px rgba(16,185,129,0.6)' : '0 2px 6px rgba(0,0,0,0.8)'};
            display: flex; align-items: center; justify-content: center;
            font-size: 15px; position: relative;
          ">
            ${job.emoji || '💼'}
            ${isUrgent ? '<div style="position:absolute; top:-3px; right:-3px; width:8px; height:8px; border-radius:50%; background:#ef4444; border:1.5px solid #080808; animation:pulse 1.5s infinite;"></div>' : ''}
          </div>
          <div style="
            background: #0c0c0c; border: 1px solid #374151; border-radius: 4px;
            padding: 1px 4px; font-size: 9px; font-weight: 800; color: #10b981;
            margin-top: -3px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.9);
          ">
            ${job.pay_display.split(' ')[0]}
          </div>
        </div>
      `;

      const jobIcon = L.divIcon({
        className: `job-marker-${job.id}`,
        html: markerHtml,
        iconSize: [38, 46],
        iconAnchor: [19, 40],
        popupAnchor: [0, -40],
      });

      const marker = L.marker([job.location_lat, job.location_lng], { icon: jobIcon }).addTo(markersLayer);

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div style="font-family:'Inter', sans-serif; width: 220px; color:#111827;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
            <span style="font-size:9px; text-transform:uppercase; color:#065f46; font-weight:900; letter-spacing:0.5px; background:#d1fae5; padding:1px 4px; border-radius:3px;">${job.category}</span>
            <span style="font-size:10px; color:#6b7280; font-weight:700;">${job.distance_km ?? 1.2} km away</span>
          </div>
          <div style="font-size:13px; font-weight:800; color:#111827; margin-bottom:1px; font-family:'Space Grotesk', sans-serif;">${job.title}</div>
          <div style="font-size:11px; color:#4b5563; margin-bottom:6px;">${job.employer_name} &bull; ${job.location_address || 'Nearby'}</div>
          
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; background:#f3f4f6; padding:5px 8px; border-radius:6px; border:1px solid #e5e7eb;">
            <div style="font-size:13px; font-weight:900; color:#059669;">${job.pay_display}</div>
            <div style="font-size:10px; color:#4b5563; font-weight:600;">${job.hours_per_day || 'Flexible'}</div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 6px;">
            <a href="https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLat}%2C${userLng}%3B${job.location_lat}%2C${job.location_lng}" target="_blank" rel="noopener noreferrer" style="
              text-align:center; padding:5px; border-radius:4px; background:#e5e7eb; color:#1f2937;
              font-size:10px; font-weight:700; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:2px;
            ">
              🗺️ OSM Route
            </a>
            <button id="quick-apply-btn-${job.id}" style="
              padding:5px; border-radius:4px; background:#059669; color:#ffffff;
              border:none; font-size:10px; font-weight:800; cursor:pointer; text-transform:uppercase; letter-spacing:0.5px;
            ">
              ⚡ Apply Now
            </button>
          </div>
          <div style="font-size:8px; color:#9ca3af; text-align:center;">OpenStreetMap Verified Node</div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`quick-apply-btn-${job.id}`);
        if (btn) {
          btn.onclick = () => {
            onQuickApply(job);
            marker.closePopup();
          };
        }
      });

      marker.on('click', () => {
        setSelectedJob(job);
      });
    });
  }, [jobs, userLat, userLng, currentCity, radiusKm]);

  // Recenter to current user coordinates
  const recenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLat, userLng], 13);
    }
  };

  // Free OpenStreetMap Nominatim Geocoding Search
  const handleAddressSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchAddress.trim()) return;

    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchAddress + ', India'
        )}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const displayName = data[0].display_name.split(',')[0];

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lon], 14);
        }
        if (onCityChange) {
          onCityChange(displayName, lat, lon);
        }
      }
    } catch (err) {
      console.error('Nominatim OSM search failed:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Accurate GPS location
  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 14);
          }
          if (onCityChange) {
            onCityChange('My Exact GPS', lat, lng);
          }
        },
        (err) => {
          console.error(err);
          recenterMap();
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const categories = [
    'All',
    'Delivery',
    'Data Entry',
    'Retail Assistant',
    'Restaurant Helper',
    'Tutoring',
    'Event Staff',
  ];
  const radii = [1, 3, 5, 10, 20];

  return (
    <section
      id="map"
      className={`py-8 px-4 md:px-8 bg-[#080808] border-b border-gray-800 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 py-2 px-2' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>OpenStreetMap & Leaflet.js</span>
              </span>
              <span className="text-[10px] text-gray-500 font-semibold">100% Free & Open-Source</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Spatial Work Radar: {currentCity}
            </h2>
          </div>

          {/* Search, Radius, & Layer Switcher Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* OpenStreetMap Nominatim Search Input */}
            <form onSubmit={handleAddressSearch} className="flex items-center bg-[#111] border border-gray-700 rounded overflow-hidden">
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Search area (e.g. Bandra, Koramangala)..."
                className="px-2.5 py-1 text-xs bg-transparent text-white placeholder-gray-500 outline-none w-44 md:w-56"
              />
              <button
                type="submit"
                disabled={isGeocoding}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase cursor-pointer transition-colors"
                title="Search via OpenStreetMap Nominatim"
              >
                {isGeocoding ? '...' : <Search className="w-3 h-3" />}
              </button>
            </form>

            {/* Radius Selector */}
            <div className="flex items-center bg-[#141414] border border-gray-800 p-0.5 rounded text-xs">
              <span className="text-[9px] text-gray-500 px-1.5 font-bold uppercase tracking-wider">Radius:</span>
              {radii.map((r) => (
                <button
                  key={r}
                  onClick={() => onRadiusChange(r)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    radiusKm === r
                      ? 'bg-emerald-600 text-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>

            {/* Free Layer Provider Selector */}
            <button
              onClick={() => setShowTileDrawer(!showTileDrawer)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#141414] hover:bg-[#1f1f1f] border border-gray-700 text-xs font-bold text-gray-300 uppercase transition-colors cursor-pointer"
              title="Switch Open Source Map Tiles"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] hidden sm:inline">{TILE_PROVIDERS[activeTile].name.split(' ')[0]}</span>
            </button>

            {/* GPS Recenter */}
            <button
              onClick={handleLocateMe}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#141414] hover:bg-[#1f1f1f] border border-gray-700 text-xs font-bold text-emerald-400 uppercase transition-colors cursor-pointer"
              title="Acquire exact browser GPS"
            >
              <Locate className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">GPS</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => {
                setIsFullscreen(!isFullscreen);
                setTimeout(() => {
                  mapInstanceRef.current?.invalidateSize();
                }, 200);
              }}
              className="p-1.5 rounded bg-[#141414] hover:bg-[#1f1f1f] border border-gray-700 text-gray-400 hover:text-white cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Map'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Map Stage Shell */}
        <div
          className={`relative w-full bg-[#0c0c0c] border border-gray-800 rounded-lg overflow-hidden shadow-2xl transition-all ${
            isFullscreen ? 'h-[85vh]' : 'h-[460px] md:h-[500px]'
          }`}
        >
          {/* Tile Layer Drawer Popup */}
          {showTileDrawer && (
            <div className="absolute top-12 right-3 z-30 bg-[#0c0c0c]/95 border border-gray-700 p-2 rounded shadow-2xl backdrop-blur-md w-56 text-left">
              <div className="text-[10px] font-bold text-gray-400 uppercase px-2 py-1 mb-1 border-b border-gray-800 flex items-center justify-between">
                <span>Free OSM Tile Layers</span>
                <span className="text-emerald-400">Leaflet</span>
              </div>
              {(Object.keys(TILE_PROVIDERS) as TileKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handleTileChange(key)}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors flex items-center justify-between cursor-pointer ${
                    activeTile === key
                      ? 'bg-emerald-950/80 text-emerald-400 font-bold border border-emerald-800'
                      : 'text-gray-300 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <span>{TILE_PROVIDERS[key].name}</span>
                  {activeTile === key && <span className="text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}

          {/* Leaflet Anchor */}
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Top Left Live Node Status */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <div className="pointer-events-auto flex items-center bg-[#0c0c0c]/90 px-3 py-1.5 rounded border border-gray-700 text-xs backdrop-blur-md shadow-lg space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-white font-bold text-xs">{currentCity}</span>
              <span className="text-gray-600">|</span>
              <span className="text-emerald-400 font-bold text-xs">{jobs.length} Active Works</span>
            </div>
          </div>

          {/* Bottom Center Floating Control Pill */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex space-x-2 bg-[#111]/90 backdrop-blur-md px-3 py-1.5 rounded border border-gray-800 shadow-2xl">
            <button
              onClick={recenterMap}
              className="bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-black px-3.5 py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer"
            >
              Scan Area
            </button>
            <button
              onClick={() => setShowCategoryDrawer(!showCategoryDrawer)}
              className="bg-[#222] hover:bg-[#2a2a2a] text-gray-300 text-xs font-bold px-3 py-1.5 rounded border border-gray-700 uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Filter className="w-3 h-3 text-emerald-400" />
              <span>{selectedCategory === 'All' ? 'Categories' : selectedCategory}</span>
            </button>
          </div>

          {/* Category Selector Drawer Overlay */}
          {showCategoryDrawer && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 bg-[#0c0c0c]/95 border border-gray-700 p-2 rounded backdrop-blur-md shadow-2xl flex flex-wrap gap-1.5 max-w-md justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    setShowCategoryDrawer(false);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-black'
                      : 'bg-[#181818] text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Map Legend (Top Right) */}
          <div className="absolute top-3 right-3 z-20 bg-[#0c0c0c]/90 border border-gray-800 rounded p-2 backdrop-blur-md text-[9px] font-bold text-gray-400 space-y-1 shadow-xl hidden sm:block uppercase tracking-wider">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 border border-white" />
              <span>Your Radar</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded bg-[#141414] border border-gray-700" />
              <span>Standard Work</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded bg-emerald-700 border border-emerald-500" />
              <span className="text-emerald-400">Hot / Urgent</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
