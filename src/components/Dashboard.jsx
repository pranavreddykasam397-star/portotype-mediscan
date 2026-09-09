import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Flame, 
  CheckCircle2, 
  Clock, 
  Scan, 
  ArrowRight, 
  Pill, 
  AlertTriangle, 
  Activity, 
  TrendingDown, 
  Heart,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function Dashboard({ 
  userProfile, 
  dashboardMetrics, 
  medications, 
  onLogMedication, 
  setActiveTab, 
  urgentMode,
  streakDays,
  onCheckIn
}) {
  const [checkedInToday, setCheckedInToday] = useState(false);

  // Compute live adherence based on active medications
  const totalMeds = medications.length;
  const onTrackMeds = medications.filter(m => m.adherenceStatus === 'On Track').length;
  const computedAdherence = Math.round((onTrackMeds / totalMeds) * 100);

  // Format dates for line chart x-axis
  const formattedTrends = dashboardMetrics.sevenDayTrends.map(item => {
    const d = new Date(item.date);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    return {
      ...item,
      displayDate: dayName
    };
  });

  const handleCheckInToggle = () => {
    if (!checkedInToday) {
      setCheckedInToday(true);
      onCheckIn();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Dynamic Welcome Greeting Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 rounded-2xl p-6 lg:p-8 text-white border border-teal-800/40 shadow-md relative overflow-hidden">
        {/* Subtle background graphics */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Status: Stable • Day {streakDays} Logged</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {userProfile.name}! 👋
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your reported symptom severity has decreased by <span className="text-teal-300 font-semibold">50% over the last 3 days</span>. Your hydrocortisone course has 3 days remaining before planned step-down.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('scan')}
              className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-teal-900/40 flex items-center gap-2 group cursor-pointer"
            >
              <Scan className="w-4 h-4 stroke-[2.5]" />
              <span>Start New Scan</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={handleCheckInToggle}
              disabled={checkedInToday}
              className={`px-4 py-3 rounded-xl text-sm font-semibold border transition flex items-center gap-2 ${
                checkedInToday
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 cursor-default'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-white border-slate-700 cursor-pointer'
              }`}
            >
              <Flame className={`w-4 h-4 ${checkedInToday ? 'text-emerald-400 fill-emerald-400' : 'text-amber-400'}`} />
              <span>{checkedInToday ? 'Checked-In Today' : 'Log Daily Check-In'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Warning Banner if Urgent Mode is Active */}
      {urgentMode && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 text-red-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse-subtle">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-red-600 text-white rounded-xl shrink-0 shadow-sm">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-red-950 text-base">Urgent Care Navigation Required</h3>
              <p className="text-sm text-red-800 mt-0.5">
                Simulated AI diagnostic scan indicates <span className="font-semibold underline">Acute Secondary Bacterial Cellulitis</span>. Immediate clinical evaluation at Beacon Hill Urgent Care or Mass General ER is recommended.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('care')}
            className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 shrink-0"
          >
            <span>Navigate to Facilities</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3 Primary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Recent Scan Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Scan Status</span>
            <div className={`p-2 rounded-xl ${urgentMode ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {urgentMode ? 'High / Urgent' : 'Mild / Low Risk'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Primary: <span className="font-semibold text-slate-700">{urgentMode ? 'Bacterial Cellulitis' : 'Resolving Eczematous Dermatitis'}</span>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className={`px-2.5 py-1 rounded-full font-bold border ${
              urgentMode 
                ? 'bg-red-100 text-red-800 border-red-200' 
                : 'bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}>
              {urgentMode ? 'Triage Level: Urgent Care' : 'Triage Level: Home Care'}
            </span>
            <button 
              onClick={() => setActiveTab('scan')} 
              className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
            >
              View Scans <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Medication Adherence */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medication Adherence</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Pill className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4">
            {/* Radial SVG Gauge */}
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#0d9488"
                  strokeWidth="6"
                  strokeDasharray={163}
                  strokeDashoffset={163 - (163 * computedAdherence) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute font-extrabold text-sm text-slate-800">{computedAdherence}%</span>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-medium">3 Active Prescriptions</div>
              <div className="text-xs font-semibold text-slate-700 mt-1">
                {onTrackMeds} of {totalMeds} logged as expected
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Updated live from daily log</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Target: 100% adherence</span>
            <span className="font-semibold text-teal-700">Good standing</span>
          </div>
        </div>

        {/* Card 3: Check-In Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Check-In Streak</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{streakDays}</span>
              <span className="text-sm font-semibold text-slate-500">Consecutive Days</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Top 5% patient consistency badge unlocked 🏆
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-amber-700 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Next milestone: 14 Days
            </span>
            <span className="text-slate-400">Keep it up!</span>
          </div>
        </div>
      </div>

      {/* 7-Day Trend Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-teal-600" />
              7-Day Symptom & Mood Telemetry
            </h3>
            <p className="text-xs text-slate-500">
              Comparative tracking of daily symptom severity (1-10) vs wellness mood score (1-10)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-teal-600 inline-block" />
              <span>Symptom Severity (Lower is better)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
              <span>Mood Score (Higher is better)</span>
            </div>
          </div>
        </div>

        {/* Recharts Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedTrends} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 10]} 
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fontSize: 12, fill: '#64748b' }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[170px]">
                        <p className="font-bold text-slate-300 border-b border-slate-800 pb-1">{label}</p>
                        <div className="flex justify-between items-center text-teal-300">
                          <span>Symptom Severity:</span>
                          <span className="font-bold">{data.symptomSeverity}/10</span>
                        </div>
                        <div className="flex justify-between items-center text-indigo-300">
                          <span>Mood Score:</span>
                          <span className="font-bold">{data.moodScore}/10</span>
                        </div>
                        <div className="flex justify-between items-center text-amber-300">
                          <span>Stress Level:</span>
                          <span className="font-medium bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{data.stressLevel}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="symptomSeverity" 
                name="Symptom Severity"
                stroke="#0d9488" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#0f766e' }} 
              />
              <Line 
                type="monotone" 
                dataKey="moodScore" 
                name="Mood Score"
                stroke="#6366f1" 
                strokeWidth={3} 
                strokeDasharray="4 4"
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#4f46e5' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Medications & Clinical Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Medications Summary (2 columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" />
                Active Medication Plan
              </h3>
              <p className="text-xs text-slate-500">
                Log today's applications to update telemetry and adherence score
              </p>
            </div>

            <button 
              onClick={() => setActiveTab('coach')}
              className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1"
            >
              Consult AI Coach <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {medications.map((med) => {
              const isOnTrack = med.adherenceStatus === 'On Track';
              return (
                <div 
                  key={med.id} 
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm">{med.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isOnTrack 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {med.adherenceStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {med.dosage} • <span className="text-slate-500">{med.frequency} ({med.timing})</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {med.remainingDays} days remaining in current regimen
                    </p>
                  </div>

                  <button
                    onClick={() => onLogMedication(med.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 flex items-center justify-center gap-1.5 ${
                      isOnTrack
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isOnTrack ? 'Log Dose Again' : 'Log Dose'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Clinical Profile Summary (1 column) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Patient Clinical Baseline
          </h3>

          <div className="space-y-4 text-xs">
            {/* Allergies Card */}
            <div className="p-3.5 bg-red-50/60 border border-red-100 rounded-xl space-y-2">
              <span className="font-semibold text-red-900 block">Known Medical Allergies</span>
              <div className="flex flex-wrap gap-1.5">
                {userProfile.knownAllergies.map((allergy, i) => (
                  <span key={i} className="px-2 py-1 bg-white text-red-700 border border-red-200 rounded-md font-medium text-[11px] shadow-2xs">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className="p-3.5 bg-teal-50/60 border border-teal-100 rounded-xl space-y-2">
              <span className="font-semibold text-teal-900 block">Chronic Conditions</span>
              <div className="space-y-1">
                {userProfile.chronicConditions.map((cond, i) => (
                  <div key={i} className="flex items-center gap-2 text-teal-900 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                    <span>{cond}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vitals Summary */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-semibold text-slate-800 block">Baseline Vitals</span>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block">Blood Group</span>
                  <span className="font-semibold text-slate-900 text-xs">{userProfile.bloodGroup}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Age / Sex</span>
                  <span className="font-semibold text-slate-900 text-xs">{userProfile.age} yrs • {userProfile.biologicalSex}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
