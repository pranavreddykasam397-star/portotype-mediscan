import React, { useState } from 'react';
import { 
  Scan, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Info, 
  ShieldAlert, 
  ArrowRight, 
  RotateCcw, 
  FileText, 
  Activity, 
  Sliders,
  ChevronRight,
  Eye,
  Check,
  Key,
  ShieldCheck
} from 'lucide-react';
import { getStoredApiKey, runGeminiDiagnosticAnalysis } from '../services/gemini';

export default function DiagnosticScan({ 
  scanHistory, 
  onAddNewScan, 
  setActiveTab, 
  urgentMode, 
  setUrgentMode,
  onOpenSettings
}) {
  const [viewTab, setViewTab] = useState('results'); // 'results' or 'new'
  const [selectedScanId, setSelectedScanId] = useState(scanHistory[2]?.id || scanHistory[0]?.id || 'scn_20260909_03');
  
  // Intake Form State
  const [textDescription, setTextDescription] = useState('Erythematous scaly plaque with localized pruritus on forearm.');
  const [duration, setDuration] = useState('48 hours');
  const [severitySlider, setSeveritySlider] = useState(3);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [uploadedImageBase64, setUploadedImageBase64] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Checkable checklist state
  const [completedSteps, setCompletedSteps] = useState({});

  // Find currently selected scan
  const currentScan = scanHistory.find(s => s.id === selectedScanId) || scanHistory[0];

  // Handle Image Upload Simulation & Base64 conversion
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImagePreview(url);

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI Analysis (Calls Gemini API if key exists, else clinical baseline engine)
  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setApiError(null);

    const apiKey = getStoredApiKey();

    if (apiKey) {
      try {
        const geminiResult = await runGeminiDiagnosticAnalysis({
          textDescription,
          duration,
          severityScore: Number(severitySlider),
          imageBase64: uploadedImageBase64
        });

        const newScanObj = {
          id: `scn_gemini_${Date.now()}`,
          timestamp: new Date().toISOString(),
          isLiveGemini: true,
          inputSymptoms: {
            textDescription: textDescription,
            duration: duration,
            visualSymptomType: 'User Visual Scan (Gemini 1.5 Flash)'
          },
          aiAssessment: {
            primaryCondition: geminiResult.primaryCondition || 'Primary Inflammatory Dermatosis',
            confidenceScore: geminiResult.confidenceScore || 0.92,
            differentialDiagnosis: geminiResult.differentialDiagnosis || [
              { condition: geminiResult.primaryCondition || 'Dermatitis', probability: 0.92 }
            ],
            severityScore: geminiResult.severityScore || Number(severitySlider),
            triageLevel: geminiResult.triageLevel || (severitySlider > 6 ? 'Urgent Care' : 'Home Care'),
            recommendedNextSteps: geminiResult.recommendedNextSteps || ['Consult a board-certified dermatologist'],
            otcRemedies: geminiResult.otcRemedies || ['Barrier cream emollient application']
          }
        };

        onAddNewScan(newScanObj);
        setSelectedScanId(newScanObj.id);
        setIsAnalyzing(false);
        setViewTab('results');
        return;
      } catch (err) {
        console.error('Gemini API Error:', err);
        setApiError(`Gemini model call failed: ${err.message}. Falling back to baseline engine.`);
      }
    }

    // Fallback baseline simulation if no key or error
    setTimeout(() => {
      const newScanObj = {
        id: `scn_${Date.now()}`,
        timestamp: new Date().toISOString(),
        isLiveGemini: false,
        inputSymptoms: {
          textDescription: textDescription || 'User submitted visual skin symptom assessment.',
          duration: duration || '24 hours',
          visualSymptomType: 'Localised dermal lesion'
        },
        aiAssessment: {
          primaryCondition: severitySlider > 6 ? 'Acute Inflammatory Dermatitis' : 'Mild Eczematous Flare',
          confidenceScore: 0.92,
          differentialDiagnosis: [
            { condition: severitySlider > 6 ? 'Acute Inflammatory Dermatitis' : 'Mild Eczematous Flare', probability: 0.92 },
            { condition: 'Contact Dermatitis', probability: 0.05 },
            { condition: 'Xerotic Eczema', probability: 0.03 }
          ],
          severityScore: Number(severitySlider),
          triageLevel: severitySlider > 6 ? 'Urgent Care' : 'Home Care',
          recommendedNextSteps: [
            'Apply cool soothing compresses for 10 minutes',
            'Maintain twice-daily ceramide emollient barrier application',
            'Avoid scratching to prevent secondary skin breaks'
          ],
          otcRemedies: [
            'Hydrocortisone 1% cream BID as directed',
            'Over-the-counter antihistamine if pruritus persists'
          ]
        }
      };

      onAddNewScan(newScanObj);
      setSelectedScanId(newScanObj.id);
      setIsAnalyzing(false);
      setViewTab('results');
    }, 1200);
  };

  const toggleChecklistStep = (key) => {
    setCompletedSteps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Display attributes override if Urgent Infection Mode is simulated
  const displayAssessment = urgentMode ? {
    primaryCondition: 'Acute Secondary Bacterial Cellulitis',
    confidenceScore: 0.96,
    differentialDiagnosis: [
      { condition: 'Acute Secondary Bacterial Cellulitis', probability: 0.96 },
      { condition: 'Severe Bullous Contact Dermatitis', probability: 0.03 },
      { condition: 'Erysipelas', probability: 0.01 }
    ],
    severityScore: 8,
    triageLevel: 'Urgent Care',
    recommendedNextSteps: [
      'Seek immediate in-person evaluation at Urgent Care or Emergency Dept',
      'Do not squeeze, puncture, or scrub the erythematous lesion',
      'Mark the border of erythema with a sterile marker to track spreading'
    ],
    otcRemedies: [
      'Discontinue topical corticosteroids immediately pending physician evaluation',
      'Keep lesion dry and elevated'
    ]
  } : currentScan.aiAssessment;

  const isGeminiKeyActive = !!getStoredApiKey();

  return (
    <div className="space-y-6 pb-12">
      {/* Header Controls & Tab Switcher */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-lg">Multi-Modal AI Vision Triage</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isGeminiKeyActive 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {isGeminiKeyActive ? 'Gemini 1.5 Flash Connected' : 'Clinical Baseline Engine'}
              </span>
            </div>
            <p className="text-xs text-slate-500">Analyze high-resolution derm images combined with clinical text inputs</p>
          </div>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-center">
          <button
            onClick={() => setViewTab('results')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewTab === 'results'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Inspect Scan Results</span>
          </button>
          <button
            onClick={() => setViewTab('new')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewTab === 'new'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run New AI Scan</span>
          </button>
        </div>
      </div>

      {/* NEW SCAN INTAKE FORM */}
      {viewTab === 'new' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-600" />
                Diagnostic Scan Intake Form
              </h3>
              <p className="text-xs text-slate-500">
                Provide visual lesion photo and describe symptom onset for real-time triage scoring
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenSettings}
              className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isGeminiKeyActive ? 'Gemini Key Configured' : 'Add Gemini Key'}</span>
            </button>
          </div>

          {!isGeminiKeyActive && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Using cached clinical baseline. Add your Gemini API Key in Settings to run live model inference.</span>
              </div>
              <button 
                onClick={onOpenSettings}
                className="px-2.5 py-1 bg-amber-800 text-white font-bold rounded-lg text-[10px] shrink-0"
              >
                Configure Key
              </button>
            </div>
          )}

          {apiError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs">
              {apiError}
            </div>
          )}

          <form onSubmit={handleRunAnalysis} className="space-y-6">
            {/* Image Dropzone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Visual Symptom Upload (Image Dropzone)
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 bg-slate-50/70 text-center transition flex flex-col items-center justify-center relative">
                {uploadedImagePreview ? (
                  <div className="relative group max-w-xs">
                    <img 
                      src={uploadedImagePreview} 
                      alt="Uploaded skin erythema" 
                      className="w-full h-40 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImagePreview(null);
                        setUploadedImageBase64(null);
                      }}
                      className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-full text-xs hover:bg-slate-900 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Preloaded Sample Thumbnail Preview */}
                    <div className="w-24 h-24 mx-auto rounded-xl bg-red-100 border border-red-200 flex flex-col items-center justify-center p-2 relative overflow-hidden shadow-inner">
                      <div className="w-16 h-16 rounded-full bg-red-300/80 blur-xs absolute top-2 left-2" />
                      <div className="w-8 h-8 rounded-full bg-red-500/60 blur-[2px] absolute top-4 left-4" />
                      <span className="relative z-10 text-[10px] font-bold text-red-900 bg-white/90 px-1.5 py-0.5 rounded shadow-2xs">
                        Sample Rash
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-teal-700">Click to upload image</span> or drag and drop photo
                      <p className="text-[11px] text-slate-400 mt-1">Supports JPG, PNG, HEIC (Max 15MB)</p>
                    </div>
                    
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Text Inputs */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Symptom Description
                  </label>
                  <button
                    type="button"
                    onClick={() => setTextDescription("Pruritic, well-demarcated erythema with fine scaling along the wrist area.")}
                    className="text-[11px] text-teal-700 hover:underline font-semibold cursor-pointer"
                  >
                    Auto-fill Sample Prompt
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={textDescription}
                  onChange={(e) => setTextDescription(e.target.value)}
                  placeholder="Describe location, itching level, scaling, or recent contact triggers..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Symptom Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 48 hours, 3 days"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Severity Score
                    </label>
                    <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      {severitySlider}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={severitySlider}
                    onChange={(e) => setSeveritySlider(e.target.value)}
                    className="w-full accent-teal-600 cursor-pointer mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-md shadow-teal-900/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isGeminiKeyActive ? 'Running Gemini 1.5 Flash Vision Analysis...' : 'Running Clinical Analysis...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isGeminiKeyActive ? 'Run Live Gemini AI Analysis' : 'Run Clinical AI Analysis'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* SCAN RESULTS INSPECTOR */}
      {viewTab === 'results' && (
        <div className="space-y-6">
          {/* Scan Switcher Bar & Severity Simulation Control */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scan Record:</span>
              <div className="flex flex-wrap gap-2">
                {scanHistory.map((scan) => {
                  const isSelected = scan.id === selectedScanId && !urgentMode;
                  const dateStr = new Date(scan.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <button
                      key={scan.id}
                      onClick={() => {
                        setSelectedScanId(scan.id);
                        if (urgentMode) setUrgentMode(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>{scan.id}</span>
                      {scan.isLiveGemini && (
                        <span className="bg-emerald-300 text-slate-950 font-extrabold text-[9px] px-1 rounded">GEMINI</span>
                      )}
                      <span className="text-[10px] opacity-80">({dateStr})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Production Simulation Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 hidden sm:inline">
                Simulate Triage Severity:
              </span>
              <button
                onClick={() => setUrgentMode(!urgentMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-2xs cursor-pointer ${
                  urgentMode
                    ? 'bg-red-600 text-white border-red-700 animate-pulse'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{urgentMode ? 'Urgent Infection Alert Active' : 'Routine Home Care'}</span>
              </button>
            </div>
          </div>

          {/* Urgent Notification Card if enabled */}
          {urgentMode && (
            <div className="bg-red-900 text-white p-5 rounded-2xl shadow-md border border-red-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-red-300 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h4 className="font-extrabold text-base text-white">RED ALERT: Urgent Clinical Triage Triggered</h4>
                  <p className="text-xs text-red-200 mt-0.5">
                    High probability of rapidly spreading acute bacterial skin infection. Immediate clinical evaluation is strongly recommended.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('care')}
                className="px-4 py-2.5 bg-white text-red-950 font-bold rounded-xl text-xs hover:bg-red-50 transition shadow-sm shrink-0 flex items-center gap-2 cursor-pointer"
              >
                <span>Care Navigation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Main Results Display Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Visual Image & Input Symptoms */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scanned Visual Target</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ID: {urgentMode ? 'scn_URGENT_ALERT' : currentScan.id}
                </span>
              </div>

              {/* Rendered Medical Visual Target Frame */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-950 h-56 flex items-center justify-center group shadow-inner">
                <div className={`w-full h-full relative flex items-center justify-center ${
                  urgentMode ? 'bg-gradient-to-tr from-red-950 via-red-900 to-slate-900' : 'bg-gradient-to-tr from-amber-950 via-slate-900 to-teal-950'
                }`}>
                  <div className={`w-32 h-24 rounded-full blur-sm transition-all ${
                    urgentMode ? 'bg-red-600/80 animate-pulse' : 'bg-rose-500/50'
                  }`} />
                  <div className={`w-16 h-12 rounded-full blur-xs ${
                    urgentMode ? 'bg-amber-500/70' : 'bg-rose-700/60'
                  }`} />

                  {/* AI Computer Vision Overlay Box */}
                  <div className={`absolute w-36 h-28 border-2 ${
                    urgentMode ? 'border-red-500' : 'border-teal-400'
                  } rounded-lg flex flex-col justify-between p-1.5 shadow-lg`}>
                    <div className="flex justify-between items-start text-[9px] font-mono text-white">
                      <span className={`${urgentMode ? 'bg-red-600' : 'bg-teal-600'} px-1 py-0.5 rounded font-bold`}>
                        {Math.round(displayAssessment.confidenceScore * 100)}% MATCH
                      </span>
                      <span className="text-slate-300">FOV: Wrist/Flexor</span>
                    </div>
                    <div className="text-[9px] text-teal-300 font-mono bg-slate-950/80 p-1 rounded truncate">
                      ZONE: {currentScan.inputSymptoms.visualSymptomType}
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Symptoms Info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">Logged Symptom Narrative</span>
                <p className="text-slate-600 italic leading-relaxed">
                  "{currentScan.inputSymptoms.textDescription}"
                </p>
                <div className="pt-2 border-t border-slate-200/60 flex justify-between text-slate-500 text-[11px]">
                  <span>Duration: <strong className="text-slate-700">{currentScan.inputSymptoms.duration}</strong></span>
                  <span>Timestamp: <strong className="text-slate-700">{new Date(currentScan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                </div>
              </div>
            </div>

            {/* Right Col: AI Assessment Breakdown */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                      urgentMode || displayAssessment.triageLevel === 'Urgent Care'
                        ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      Triage Level: {displayAssessment.triageLevel}
                    </span>
                    <span className="bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full text-xs font-bold">
                      {Math.round(displayAssessment.confidenceScore * 100)}% Match Confidence
                    </span>
                    {currentScan.isLiveGemini && (
                      <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                        Live Gemini 1.5 Flash Output
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
                    {displayAssessment.primaryCondition}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium block">Severity Index</span>
                  <span className={`text-2xl font-black ${
                    displayAssessment.severityScore > 5 ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {displayAssessment.severityScore} / 10
                  </span>
                </div>
              </div>

              {/* Differential Diagnosis Probability Bars */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Differential Diagnosis Probabilities
                </h4>
                <div className="space-y-2.5">
                  {displayAssessment.differentialDiagnosis.map((item, idx) => {
                    const pct = Math.round(item.probability * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{item.condition}</span>
                          <span className="text-slate-900">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              idx === 0 
                                ? (urgentMode ? 'bg-red-600' : 'bg-teal-600') 
                                : 'bg-slate-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Checklists: Next Steps & OTC Remedies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* Recommended Next Steps */}
                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-3">
                  <h4 className="font-bold text-teal-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    Recommended Next Steps
                  </h4>
                  <ul className="space-y-2">
                    {displayAssessment.recommendedNextSteps.map((step, idx) => {
                      const key = `step_${idx}`;
                      const isDone = !!completedSteps[key];
                      return (
                        <li 
                          key={idx}
                          onClick={() => toggleChecklistStep(key)}
                          className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer group"
                        >
                          <div className={`w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center transition ${
                            isDone ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 bg-white group-hover:border-teal-500'
                          }`}>
                            {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={isDone ? 'line-through text-slate-400' : ''}>
                            {step}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* OTC Remedies */}
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
                  <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    OTC Remedies & Regimen
                  </h4>
                  <ul className="space-y-2">
                    {displayAssessment.otcRemedies.map((remedy, idx) => {
                      const key = `remedy_${idx}`;
                      const isDone = !!completedSteps[key];
                      return (
                        <li 
                          key={idx}
                          onClick={() => toggleChecklistStep(key)}
                          className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer group"
                        >
                          <div className={`w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center transition ${
                            isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white group-hover:border-emerald-500'
                          }`}>
                            {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={isDone ? 'line-through text-slate-400' : ''}>
                            {remedy}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
