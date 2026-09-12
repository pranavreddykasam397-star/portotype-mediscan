import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Navigation, 
  Search, 
  Filter, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Building2, 
  AlertTriangle, 
  PhoneCall,
  ExternalLink,
  LocateFixed,
  Compass,
  Map
} from 'lucide-react';
import DirectionsModal from './DirectionsModal';

export default function CareNavigation({ 
  nearbyFacilities, 
  urgentMode, 
  coords, 
  locationStatus, 
  isLocating, 
  onAcquireLocation 
}) {
  const [radiusFilter, setRadiusFilter] = useState(5); // max miles
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalFacility, setActiveModalFacility] = useState(null);
  const [callingFacility, setCallingFacility] = useState(null);

  // Filter facilities
  const filteredFacilities = nearbyFacilities.filter((fac) => {
    const matchesRadius = fac.distanceMiles <= radiusFilter;
    const matchesType = typeFilter === 'All' || fac.type === typeFilter;
    const matchesSearch = fac.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          fac.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRadius && matchesType && matchesSearch;
  });

  const googleMapsSearchUrl = `https://www.google.com/maps/search/emergency+room+or+hospital+near+me/@${coords.lat},${coords.lng},14z`;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Live Geolocation Control Bar */}
      <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              Care Navigation & Emergency Locator
            </h2>
            <p className="text-xs text-slate-500">Verified nearby urgent care centers, clinics, and emergency departments</p>
          </div>

          {/* Primary Action Button: Real Google Maps Search */}
          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 shrink-0"
          >
            <Compass className="w-4 h-4" />
            <span>Find Real Hospitals Near Me on Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Live GPS Tracker Bar */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <LocateFixed className={`w-4 h-4 ${isLocating ? 'text-teal-600 animate-spin' : 'text-teal-600'}`} />
            <div>
              <span className="font-bold text-slate-800">Live Location Telemetry: </span>
              <span className="text-slate-600 font-mono text-[11px]">{locationStatus}</span>
            </div>
          </div>

          <button
            onClick={onAcquireLocation}
            disabled={isLocating}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-teal-800 border border-teal-200 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
          >
            <LocateFixed className="w-3.5 h-3.5 text-teal-600" />
            <span>{isLocating ? 'Acquiring...' : 'Use Current Location'}</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by facility name or address..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Type Filter & Radius */}
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="All">All Facility Types</option>
              <option value="Urgent Care">Urgent Care Only</option>
              <option value="Dermatology Clinic">Dermatology Clinic</option>
              <option value="General Hospital">General Hospital / ER</option>
            </select>

            <select
              value={radiusFilter}
              onChange={(e) => setRadiusFilter(Number(e.target.value))}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value={2}>2 mi</option>
              <option value={5}>5 mi</option>
              <option value={10}>10 mi</option>
              <option value={25}>25 mi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Urgent Alert Banner if active */}
      {urgentMode && (
        <div className="bg-red-900 text-white p-5 rounded-2xl shadow-md border border-red-700 space-y-3 animate-pulse-subtle">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-300 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-base text-white">Recommended Destination for Urgent Infection</h3>
              <p className="text-xs text-red-200 mt-0.5">
                Simulated AI diagnostic scan indicates acute cellulitis. Proceed directly to <span className="font-bold text-white underline">Beacon Hill Urgent Care</span> (Est Wait 18 min) or <span className="font-bold text-white underline">Mass General Emergency Dept</span> (24/7 ER).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Real Embedded Google Map View */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-xs">Live Embedded Facilities Map (Centered at {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Google Maps Satellite Overlay</span>
        </div>
        <div className="h-64 w-full bg-slate-950 relative">
          <iframe
            title="Nearby Healthcare Facilities Google Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=14&output=embed`}
          />
        </div>
      </div>

      {/* Facility Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredFacilities.map((fac) => {
          const isUrgentTarget = urgentMode && (fac.type === 'Urgent Care' || fac.is24x7);
          const directDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fac.address)}`;

          return (
            <div
              key={fac.id}
              className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition-all duration-200 ${
                isUrgentTarget 
                  ? 'border-red-300 ring-2 ring-red-500/30 bg-red-50/20' 
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="space-y-4">
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {fac.type}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    {fac.is24x7 && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                        24/7 ER
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                      {fac.distanceMiles} mi
                    </span>
                  </div>
                </div>

                {/* Facility Name & Info */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {fac.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{fac.address}</span>
                  </p>
                </div>

                {/* Telemetry & Wait Time Pill */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      Est. Wait Time:
                    </span>
                    <span className={`font-extrabold ${
                      fac.estimatedWaitTimeMin === 0 
                        ? 'text-emerald-600' 
                        : fac.estimatedWaitTimeMin > 40 
                          ? 'text-amber-600' 
                          : 'text-teal-700'
                    }`}>
                      {fac.estimatedWaitTimeMin === 0 ? 'No Wait (By Appt)' : `${fac.estimatedWaitTimeMin} mins`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-400">Phone:</span>
                    <span className="text-slate-700 font-mono font-medium">{fac.phone}</span>
                  </div>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${fac.phone}`}
                    onClick={() => setCallingFacility(fac)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-700" />
                    <span>Call Facility</span>
                  </a>

                  <button
                    onClick={() => setActiveModalFacility(fac)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-teal-400" />
                    <span>Route Steps</span>
                  </button>
                </div>

                {/* Direct Google Maps Directions Button */}
                <a
                  href={directDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Google Maps Live Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulated Call Modal Dialog */}
      {callingFacility && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 mx-auto flex items-center justify-center">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">{callingFacility.name}</h4>
              <p className="text-xs text-slate-500 font-mono mt-1">{callingFacility.phone}</p>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Initiating phone call to reception desk. Ensure device supports voice calls.
            </p>
            <button
              onClick={() => setCallingFacility(null)}
              className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
            >
              Close Dialog
            </button>
          </div>
        </div>
      )}

      {/* Turn-by-Turn Directions Modal */}
      {activeModalFacility && (
        <DirectionsModal
          facility={activeModalFacility}
          onClose={() => setActiveModalFacility(null)}
        />
      )}
    </div>
  );
}
