import React from 'react';
import { Activity, Bell, Menu, X, ShieldAlert, Sparkles, PhoneCall, Flame, Key, Settings } from 'lucide-react';
import { getStoredApiKey } from '../services/gemini';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  userProfile, 
  streakDays, 
  urgentMode, 
  setUrgentMode,
  isMobileOpen,
  setIsMobileOpen,
  onOpenSettings
}) {
  const titles = {
    dashboard: { title: 'Health Overview', subtitle: 'Real-time patient telemetry & daily log' },
    scan: { title: 'AI Diagnostic Scan', subtitle: 'Multi-modal vision analysis & triage engine' },
    coach: { title: 'AI Health Coach', subtitle: 'Context-aware clinical AI assistant' },
    care: { title: 'Care Navigation', subtitle: 'Verified nearby urgent care & specialist centers' }
  };

  const current = titles[activeTab] || titles.dashboard;
  const isGeminiActive = !!getStoredApiKey();

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 lg:px-8 py-4 shadow-xs">
      <div className="flex items-center justify-between">
        {/* Title & Navigation Info */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {current.title}
              {urgentMode && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold border border-red-200 animate-pulse">
                  Urgent Infection Alert Active
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">{current.subtitle}</p>
          </div>
        </div>

        {/* Quick Actions & Header Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Gemini API Key Settings Button */}
          <button
            onClick={onOpenSettings}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
              isGeminiActive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            title="Configure Google Gemini API Key"
          >
            <Key className={`w-3.5 h-3.5 ${isGeminiActive ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{isGeminiActive ? 'Gemini 1.5 Active' : 'Gemini Settings'}</span>
          </button>

          {/* Simulation Toggle */}
          <button
            onClick={() => setUrgentMode(!urgentMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
              urgentMode 
                ? 'bg-red-600 text-white border-red-700 hover:bg-red-700' 
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            title="Toggle urgent triage severity state"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulate:</span> {urgentMode ? 'Reset Alert' : 'Infection Alert'}
          </button>

          {/* Streak Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-lg text-xs font-semibold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>{streakDays} Day Streak</span>
          </div>

          {/* Urgent Care Shortcut */}
          <button 
            onClick={() => setActiveTab('care')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Care Directory</span>
          </button>
        </div>
      </div>
    </header>
  );
}
