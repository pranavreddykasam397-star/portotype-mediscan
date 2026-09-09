import React, { useState } from 'react';
import { MapPin, Navigation, X, Phone, Clock, ShieldAlert, CheckCircle2, Car, Compass } from 'lucide-react';

export default function DirectionsModal({ facility, onClose }) {
  const [isNavigating, setIsNavigating] = useState(false);

  if (!facility) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/40">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{facility.name}</h3>
              <p className="text-xs text-slate-400">{facility.type} • {facility.distanceMiles} miles away</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulated Interactive Map Display */}
        <div className="relative bg-slate-950 h-56 w-full flex items-center justify-center overflow-hidden border-b border-slate-200">
          {/* Simulated Vector Grid Map Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

          {/* Road Network Lines Simulation */}
          <svg className="absolute inset-0 w-full h-full stroke-slate-700/60 stroke-2" fill="none">
            <path d="M 20 180 Q 150 120 300 150 T 480 80" strokeWidth="4" stroke="#475569" />
            <path d="M 100 200 L 220 50 L 380 180" strokeWidth="3" stroke="#334155" />
            {/* Route Highlight Path */}
            <path 
              d="M 60 160 Q 160 110 280 135 T 410 75" 
              stroke="#0d9488" 
              strokeWidth="5" 
              strokeLinecap="round" 
              strokeDasharray="6 4"
              className="animate-pulse"
            />
          </svg>

          {/* User Location Marker */}
          <div className="absolute left-[60px] top-[145px] z-10 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-teal-500 border-2 border-white shadow-lg animate-ping" />
            <div className="w-3 h-3 rounded-full bg-teal-600 border-2 border-white shadow-md absolute" />
            <span className="bg-slate-900 text-teal-300 text-[9px] font-bold px-1.5 py-0.5 rounded shadow mt-1">You</span>
          </div>

          {/* Destination Pin Marker */}
          <div className="absolute right-[80px] top-[60px] z-10 flex flex-col items-center">
            <div className="p-2 rounded-full bg-red-600 text-white shadow-xl animate-bounce">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="bg-red-950 text-red-200 border border-red-800 text-[10px] font-bold px-2 py-0.5 rounded shadow mt-1">
              {facility.name.split(' ')[0]}
            </span>
          </div>

          {/* Navigation Overlay Status */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2">
            <Car className="w-4 h-4 text-teal-400" />
            <span>Est. Drive Time: <strong className="text-teal-300">4 mins (1.1 mi)</strong></span>
          </div>
        </div>

        {/* Turn by Turn Directions List */}
        <div className="p-6 space-y-4 max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Turn-by-Turn Route</span>
            <span className="text-xs text-slate-600 font-medium">Optimal via Cambridge St</span>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-semibold text-slate-900">Head North on Blossom St toward Cambridge St</p>
                <p className="text-[11px] text-slate-400">0.2 miles</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-semibold text-slate-900">Turn right onto Cambridge St</p>
                <p className="text-[11px] text-slate-400">0.8 miles • Destination on right</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-semibold text-slate-900">Arrive at {facility.name}</p>
                <p className="text-[11px] text-slate-400">{facility.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <a
            href={`tel:${facility.phone}`}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl text-xs border border-slate-200 transition flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 text-teal-600" />
            <span>Call Facility</span>
          </a>

          <button
            onClick={() => {
              setIsNavigating(true);
              setTimeout(() => {
                setIsNavigating(false);
                onClose();
              }, 1200);
            }}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            {isNavigating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Launching Navigation...</span>
              </>
            ) : (
              <>
                <Compass className="w-4 h-4" />
                <span>Start Live GPS Navigation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
