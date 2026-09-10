import { useState } from 'react';
import { Search, MapPin, Sparkles, ArrowUpRight, Compass, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  currentCity: string;
  onCityChange: (city: string, lat: number, lng: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  onOpenAIMatcher: () => void;
  onOpenPostJob: () => void;
  jobsCount: number;
}

const CITIES = [
  { name: 'Chennai, TN', full: 'Anna Nagar, Chennai, Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { name: 'Bangalore, KA', full: 'Koramangala, Bangalore, Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Vellore, TN', full: 'Katpadi, Vellore, Tamil Nadu', lat: 12.9165, lng: 79.1325 },
  { name: 'Hyderabad, TS', full: 'Hitec City, Hyderabad, Telangana', lat: 17.3850, lng: 78.4867 },
  { name: 'Mumbai, MH', full: 'Andheri West, Mumbai, Maharashtra', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi NCR', full: 'Connaught Place, New Delhi', lat: 28.6139, lng: 77.2090 },
];

export default function HeroSection({
  currentCity,
  onCityChange,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onOpenAIMatcher,
  onOpenPostJob,
  jobsCount,
}: HeroSectionProps) {
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGPS(false);
        setShowCityPicker(false);
        onCityChange('My Live Location', pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setIsDetectingGPS(false);
        console.error(err);
        // Fallback to Chennai
        onCityChange('Chennai, TN', 13.0827, 80.2707);
      }
    );
  };

  return (
    <section id="home" className="relative pt-12 pb-10 px-4 md:px-8 bg-[#080808] border-b border-gray-800 overflow-hidden">
      {/* Background Dot Grid */}
      <div className="absolute inset-0 bg-[#080808] bg-dot-grid opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Live System Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-[#111] border border-gray-800 text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-Time Spatial Match Engine</span>
          <span className="text-gray-600">|</span>
          <span className="text-emerald-400">2,400+ Works Active</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-tight mb-4">
          Discover Hyperlocal Works.<br />
          <span className="text-emerald-500">Instant UPI Payouts.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed mb-6 font-normal">
          Part-time shifts, delivery routes, and weekend tasks within walking distance — matched to your skills, availability, and vehicle.
        </p>

        {/* High-Density Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-7">
          <a
            href="#jobs"
            className="bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md"
          >
            <span>Scan {jobsCount} Works Nearby</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onOpenAIMatcher}
            className="bg-[#141414] hover:bg-[#1f1f1f] text-emerald-400 border border-emerald-900 text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Radar Match</span>
          </button>

          <button
            onClick={onOpenPostJob}
            className="bg-[#141414] hover:bg-[#1e1e1e] text-gray-300 border border-gray-800 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded transition-colors cursor-pointer"
          >
            <span>Post a Work</span>
          </button>
        </div>

        {/* High-Density Search Bar with Location Selector */}
        <div className="relative max-w-xl mx-auto">
          <div className="flex items-center bg-[#0c0c0c] border border-gray-800 rounded-lg overflow-hidden focus-within:border-emerald-500 transition-all shadow-xl">
            {/* Location Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCityPicker(!showCityPicker)}
                className="flex items-center space-x-1.5 px-3 py-2.5 border-r border-gray-800 bg-[#141414] hover:bg-[#1b1b1b] text-xs font-bold text-emerald-400 whitespace-nowrap cursor-pointer transition-colors uppercase tracking-wider"
              >
                <MapPin className="w-3 h-3 text-emerald-500" />
                <span>{currentCity.split(',')[0]}</span>
                <span className="text-[10px] text-gray-500">▾</span>
              </button>

              {/* City Dropdown Menu */}
              {showCityPicker && (
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#0c0c0c] border border-gray-700 rounded shadow-2xl p-1.5 z-50 text-left">
                  <div className="text-[10px] font-bold text-gray-500 uppercase px-2 py-1 tracking-wider">
                    Select Target Node
                  </div>
                  {CITIES.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => {
                        onCityChange(city.name, city.lat, city.lng);
                        setShowCityPicker(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-gray-200 hover:bg-[#181818] rounded transition-colors flex items-center justify-between"
                    >
                      <span className="font-semibold">{city.name}</span>
                      <span className="text-[10px] text-gray-500 truncate max-w-[90px]">{city.full.split(',')[0]}</span>
                    </button>
                  ))}
                  <div className="border-t border-gray-800 my-1 pt-1">
                    <button
                      onClick={handleUseGPS}
                      disabled={isDetectingGPS}
                      className="w-full text-left px-2 py-1.5 text-xs text-emerald-400 font-bold hover:bg-emerald-950/40 rounded transition-colors flex items-center space-x-1.5"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>{isDetectingGPS ? 'Detecting GPS...' : 'Use Precise GPS Sensor'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
              placeholder="Search keyword (e.g. Delivery, Data Entry, Tutor)..."
              className="flex-1 px-3 py-2 bg-transparent border-none outline-none text-xs text-white placeholder-gray-600 font-medium"
            />

            {/* Search Button */}
            <button
              type="button"
              onClick={onSearchSubmit}
              className="m-1 px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-black uppercase tracking-wider flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Search className="w-3 h-3" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          {/* Quick Filter Tag Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 text-[10px] text-gray-500 uppercase font-bold tracking-wider">
            <span>Quick:</span>
            {['Delivery', 'Data Entry', 'Restaurant', 'Tutoring', 'Warehouse'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  onSearchChange(tag);
                  onSearchSubmit();
                }}
                className="px-2 py-0.5 rounded bg-[#111] hover:bg-[#1c1c1c] border border-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* High-Density Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 pt-6 border-t border-gray-800">
          <div className="bg-[#0c0c0c] border border-gray-800/80 rounded p-3 text-center">
            <div className="font-display text-xl sm:text-2xl font-black text-white">48,200+</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Verified Workers</div>
          </div>
          <div className="bg-[#0c0c0c] border border-gray-800/80 rounded p-3 text-center">
            <div className="font-display text-xl sm:text-2xl font-black text-white">12,400+</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Monthly Works</div>
          </div>
          <div className="bg-[#0c0c0c] border border-gray-800/80 rounded p-3 text-center">
            <div className="font-display text-xl sm:text-2xl font-black text-emerald-400">₹2.4 Cr</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Disbursed (30d)</div>
          </div>
          <div className="bg-[#0c0c0c] border border-gray-800/80 rounded p-3 text-center">
            <div className="font-display text-xl sm:text-2xl font-black text-white">4.88 ★</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Platform Trust</div>
          </div>
        </div>
      </div>
    </section>
  );
}
