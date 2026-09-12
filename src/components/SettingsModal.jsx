import React, { useState } from 'react';
import { Key, X, ShieldCheck, Sparkles, Check, Trash2, Eye, EyeOff, AlertCircle, ExternalLink } from 'lucide-react';
import { getStoredApiKey, saveStoredApiKey, clearStoredApiKey } from '../services/gemini';

export default function SettingsModal({ isOpen, onClose, onKeyUpdated }) {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState(null);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const trimmed = apiKey.trim();
    saveStoredApiKey(trimmed);
    setSaveSuccess(true);
    setTestError(null);
    onKeyUpdated(trimmed);

    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const handleClear = () => {
    clearStoredApiKey();
    setApiKey('');
    onKeyUpdated('');
    setTestError(null);
  };

  const handleTestConnection = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setTestError('Please enter an API key to test.');
      return;
    }

    if (!trimmed.startsWith('AIzaSy')) {
      setTestError('Invalid Key Format: Google AI Studio API keys start with "AIzaSy...". Please get a free key from aistudio.google.com.');
      setIsTesting(false);
      return;
    }

    setIsTesting(true);
    setTestError(null);

    const modelsToTry = ['gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash'];
    let success = false;
    let lastErr = null;

    for (const m of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${trimmed}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with OK' }] }]
          })
        });

        if (res.ok) {
          success = true;
          break;
        }

        const errData = await res.json().catch(() => ({}));
        lastErr = errData?.error?.message || `API error code ${res.status}`;
      } catch (err) {
        lastErr = err.message;
      }
    }

    if (success) {
      saveStoredApiKey(trimmed);
      onKeyUpdated(trimmed);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } else {
      setTestError(lastErr || 'Connection test failed across available Gemini endpoints.');
    }

    setIsTesting(false);
  };

  const isConfigured = !!getStoredApiKey();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/40">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Google Gemini API Settings</h3>
              <p className="text-xs text-slate-400">Configure key for live AI multimodal inference</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Status Badge */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            isConfigured 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className={`w-4 h-4 ${isConfigured ? 'text-emerald-600' : 'text-amber-600'}`} />
              <span>{isConfigured ? 'Gemini 1.5 Flash Connected' : 'Using Cached Baseline Engine'}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-current">
              {isConfigured ? 'LIVE AI ACTIVE' : 'FALLBACK MODE'}
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Google Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Key is stored securely in your browser's <code className="text-slate-600 bg-slate-100 px-1 rounded">localStorage</code>.
              </p>
            </div>

            {testError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{testError}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>API Key saved successfully! Live model inference enabled.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Key</span>
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Test API</span>
                  </>
                )}
              </button>

              {isConfigured && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition cursor-pointer"
                  title="Clear saved API key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Helper Note */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Need a free Gemini API Key?</span>
            <p className="text-[11px] text-slate-500">
              Get an instant API key from Google AI Studio with generous free-tier quotas for Gemini 1.5 Flash.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-teal-700 hover:underline font-semibold text-[11px] pt-1"
            >
              <span>Get Key on Google AI Studio (aistudio.google.com)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
