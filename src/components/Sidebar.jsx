import React from 'react';
import { 
  Activity, 
  Scan, 
  MessageSquare, 
  MapPin, 
  Flame, 
  ShieldAlert, 
  User, 
  Droplet, 
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import logoImg from '../assets/mediscan-logo.jpg';

export default function Sidebar({ activeTab, setActiveTab, userProfile, streakDays, urgentMode, setUrgentMode }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, badge: null },
    { id: 'scan', label: 'AI Diagnostic Scan', icon: Scan, badge: urgentMode ? 'URGENT' : 'AI Active' },
    { id: 'coach', label: 'AI Health Coach', icon: MessageSquare, badge: 'Context On' },
    { id: 'care', label: 'Care Navigation', icon: MapPin, badge: urgentMode ? '1 Near' : null },
  ];

  return (
    <aside className="w-full lg:w-72 bg-slate-900 text-slate-100 flex flex-col justify-between shrink-0 border-r border-slate-800 lg:min-h-screen">
      {/* Brand Header with Official Logo */}
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Badge */}
            <div className="w-11 h-11 rounded-xl bg-white p-1 border border-slate-700 shadow-md flex items-center justify-center shrink-0 overflow-hidden">
              <img 
                src={logoImg} 
                alt="MediScan Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                Medi<span className="text-teal-400">Scan</span>
              </h1>
              <span className="text-[11px] text-slate-400 font-medium block">
                AI Powered Health Companion
              </span>
            </div>
          </div>
        </div>

        {/* Urgent Infection Alert Pill in Sidebar if active */}
        {urgentMode && (
          <div className="mx-4 mt-4 p-3 bg-red-950/70 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
              <div>
                <p className="font-semibold text-red-300">Urgent Alert Active</p>
                <p className="text-[11px] text-red-400/90">Care Navigation Advised</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('care')}
              className="px-2 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-[10px] font-bold tracking-wide transition"
            >
              VIEW
            </button>
          </div>
        )}

        {/* Primary Navigation */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.badge === 'URGENT' 
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-slate-800 text-teal-400 border border-teal-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer Card */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-900/60 border border-teal-500/40 flex items-center justify-center text-teal-300 font-semibold text-sm">
                ML
              </div>
              <div>
                <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                  {userProfile.name}
                  <span className="text-xs text-slate-400 font-normal">({userProfile.age}{userProfile.biologicalSex[0]})</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1 bg-red-950/80 text-red-300 border border-red-900/60 px-1.5 py-0.2 rounded font-medium text-[11px]">
                    <Droplet className="w-3 h-3 text-red-400" />
                    {userProfile.bloodGroup === 'A-Positive' ? 'A+' : userProfile.bloodGroup}
                  </span>
                  <span className="flex items-center gap-1 bg-amber-950/80 text-amber-300 border border-amber-900/60 px-1.5 py-0.2 rounded font-medium text-[11px]">
                    <Flame className="w-3 h-3 text-amber-400" />
                    {streakDays} Days
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/40 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Allergies:</span>
              <span className="text-slate-200 font-medium truncate max-w-[140px]" title={userProfile.knownAllergies.join(', ')}>
                Nickel, Ragweed
              </span>
            </div>
            <div className="flex justify-between">
              <span>Primary Condition:</span>
              <span className="text-slate-200 font-medium truncate max-w-[130px]" title={userProfile.chronicConditions.join(', ')}>
                Atopic diathesis
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
