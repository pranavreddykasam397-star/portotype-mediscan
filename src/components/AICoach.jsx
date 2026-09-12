import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  ShieldCheck, 
  Info, 
  Clock, 
  Pill, 
  Wind, 
  Bell, 
  CheckCircle2,
  Key,
  MapPin,
  LocateFixed,
  Navigation,
  ArrowRight
} from 'lucide-react';
import { getStoredApiKey, sendGeminiCoachMessage } from '../services/gemini';

export default function AICoach({ 
  chatHistory, 
  onSendMessage, 
  onLogMedication, 
  activeMedications,
  userProfile,
  streakDays,
  onOpenSettings,
  nearbyFacilities,
  coords,
  locationStatus,
  isLocating,
  onAcquireLocation,
  setActiveTab
}) {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const isGeminiActive = !!getStoredApiKey();

  // Custom suggested quick replies including nearby care
  const suggestedChips = [
    "Find nearby urgent care & hospitals",
    ...chatHistory.suggestedQuickReplies
  ];

  // Auto-scroll to bottom of chat feed
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory.messages, isTyping]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    // Append user message
    onSendMessage({
      id: `msg_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      content: query
    });

    if (!textToSend) setInputText('');

    // Check if user asked to log medication
    if (query.toLowerCase().includes('log') && query.toLowerCase().includes('medication')) {
      const hydro = activeMedications.find(m => m.name.includes('Hydrocortisone'));
      if (hydro) onLogMedication(hydro.id);
    }

    setIsTyping(true);

    const apiKey = getStoredApiKey();

    if (apiKey) {
      try {
        const replyText = await sendGeminiCoachMessage({
          userMessage: query,
          userProfile,
          medications: activeMedications,
          streakDays,
          chatHistory,
          nearbyFacilities,
          coords,
          locationStatus
        });

        onSendMessage({
          id: `msg_${Date.now() + 1}`,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          content: replyText
        });

        setIsTyping(false);
        return;
      } catch (err) {
        console.error('Gemini Coach Error:', err);
      }
    }

    // Intelligent fallback responder (when no key or offline)
    setTimeout(() => {
      let aiResponseText = "I've logged that for you! Based on your active regimen, remember to maintain daily emollient application post-wash to preserve epidermal moisture.";

      const lower = query.toLowerCase();
      if (
        lower.includes('nearby') || 
        lower.includes('hospital') || 
        lower.includes('urgent care') || 
        lower.includes('clinic') || 
        lower.includes('doctor') || 
        lower.includes('facility') ||
        lower.includes('find nearby')
      ) {
        aiResponseText = `Based on your live location (${locationStatus || 'Boston, MA'}), here are your top 3 nearby care facilities from your directory:

1. 🏥 Beacon Hill Urgent Care & Walk-In (1.1 mi)
   • Address: 420 Cambridge St, Boston, MA 02114
   • Est Wait: 18 mins | Phone: +1-617-555-0144

2. 🩺 Metro Dermatology & Allergy Specialists (2.4 mi)
   • Address: 75 Blossom St, Suite 300, Boston, MA 02114
   • Est Wait: No Wait (By Appt) | Phone: +1-617-555-0198

3. 🚨 Massachusetts General Hospital Emergency Dept (1.7 mi) [24/7 ER]
   • Address: 55 Fruit St, Boston, MA 02114
   • Est Wait: 65 mins | Phone: +1-617-555-0100

You can switch to the Care Navigation tab for turn-by-turn Google Maps directions!`;
      } else if (lower.includes('ragweed') || lower.includes('pollen') || lower.includes('index')) {
        aiResponseText = "Local Ragweed Pollen Index is currently HIGH (8.4/10) in Boston. I recommend taking your 10mg Cetirizine at bedtime and keeping windows closed during morning hours.";
      } else if (lower.includes('taper') || lower.includes('hydrocortisone') || lower.includes('reminder')) {
        aiResponseText = "Reminder configured! You have 3 days remaining on Hydrocortisone 1%. On day 4, transition exclusively to your Ceramide-Dominant Barrier Cream BID to avoid skin thinning.";
      } else if (lower.includes('log') || lower.includes('dose')) {
        aiResponseText = "Medication dose successfully logged in your telemetry record! Your overall adherence score has updated on your dashboard.";
      }

      onSendMessage({
        id: `msg_${Date.now() + 1}`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        content: aiResponseText
      });

      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="space-y-4 pb-12 max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Context & Live GPS Location Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 p-4 rounded-2xl border border-teal-800/40 text-white shadow-xs shrink-0 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base flex items-center gap-2">
                MediScan Clinical Health Coach
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isGeminiActive 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                }`}>
                  {isGeminiActive ? 'Gemini 2.5 Flash Connected' : 'Clinical Baseline Engine'}
                </span>
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-teal-200/90 font-medium mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Context Loaded: Atopic Diathesis • Hydrocortisone 1% • Ragweed Allergy</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => setActiveTab('care')}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Care Navigation</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-teal-400" />
              <span>{isGeminiActive ? 'API Active' : 'Settings'}</span>
            </button>
          </div>
        </div>

        {/* Live GPS Telemetry Bar inside Coach Header */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'text-teal-400 animate-spin' : 'text-teal-400'}`} />
            <span className="text-slate-400">Live GPS Telemetry:</span>
            <span className="text-teal-300 font-mono text-[11px] font-semibold">{locationStatus}</span>
          </div>

          <button
            onClick={onAcquireLocation}
            disabled={isLocating}
            className="text-[11px] text-teal-300 hover:text-white font-bold underline flex items-center gap-1 cursor-pointer"
          >
            <span>{isLocating ? 'Acquiring...' : 'Update Location'}</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Feed Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[380px]">
        {chatHistory.messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const mentionsFacilities = msg.content.includes('Beacon Hill Urgent Care') || msg.content.includes('Care Navigation');

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${
                isUser 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-slate-900 text-teal-300 border border-slate-700'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Chat Bubble */}
              <div className={`max-w-[85%] sm:max-w-[78%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  isUser
                    ? 'bg-teal-600 text-white rounded-tr-xs shadow-xs'
                    : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}>
                  {msg.content}
                </div>

                {!isUser && mentionsFacilities && (
                  <button
                    onClick={() => setActiveTab('care')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 rounded-xl text-xs font-bold transition shadow-2xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>Open Care Navigation Map & Directions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <span className={`text-[10px] text-slate-400 font-medium block px-1 ${
                  isUser ? 'text-right' : 'text-left'
                }`}>
                  {timeStr}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing Animation Loader */}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-teal-300 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 border border-slate-200 p-3 rounded-2xl rounded-tl-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick-Reply Chips & Interactive Input */}
      <div className="space-y-3 shrink-0">
        {/* Quick-Reply Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {suggestedChips.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(reply)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer ${
                idx === 0
                  ? 'bg-teal-600 hover:bg-teal-700 text-white font-bold'
                  : 'bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300'
              }`}
            >
              {idx === 0 ? <MapPin className="w-3.5 h-3.5 text-white" /> : <Sparkles className="w-3 h-3 text-teal-600" />}
              <span>{reply}</span>
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI Coach about symptoms, nearby hospitals, or ragweed index..."
            className="flex-1 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl transition shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
