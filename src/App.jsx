import React, { useState } from 'react';
import { initialData } from './data/initialData';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DiagnosticScan from './components/DiagnosticScan';
import AICoach from './components/AICoach';
import CareNavigation from './components/CareNavigation';
import SettingsModal from './components/SettingsModal';
import { getStoredApiKey } from './services/gemini';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userProfile, setUserProfile] = useState(initialData.userProfile);
  const [dashboardMetrics, setDashboardMetrics] = useState(initialData.dashboardMetrics);
  const [medications, setMedications] = useState(initialData.activeMedications);
  const [scanHistory, setScanHistory] = useState(initialData.diagnosticScanHistory);
  const [chatHistory, setChatHistory] = useState(initialData.aiCoachChatHistory);
  const [nearbyFacilities, setNearbyFacilities] = useState(initialData.nearbyCareFacilities);

  // Simulation mode state for triage severity testing
  const [urgentMode, setUrgentMode] = useState(false);
  const [streakDays, setStreakDays] = useState(initialData.dashboardMetrics.checkInStreakDays);

  // Mobile drawer & Settings modal states
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(getStoredApiKey());

  // Toggle/Log medication adherence
  const handleLogMedication = (medId) => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === medId) {
          const newStatus = med.adherenceStatus === 'On Track' ? 'Missed Dose Yesterday' : 'On Track';
          return { ...med, adherenceStatus: newStatus };
        }
        return med;
      })
    );
  };

  // Add new scan to history
  const handleAddNewScan = (newScanObj) => {
    setScanHistory((prev) => [newScanObj, ...prev]);
  };

  // Append user or AI message to chat history
  const handleSendMessage = (msgObj) => {
    setChatHistory((prev) => ({
      ...prev,
      messages: [...prev.messages, msgObj]
    }));
  };

  // Daily check-in increment
  const handleCheckIn = () => {
    setStreakDays((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col lg:flex-row font-sans">
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileOpen(false);
          }}
          userProfile={userProfile}
          streakDays={streakDays}
          urgentMode={urgentMode}
          setUrgentMode={setUrgentMode}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* Main Content Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userProfile={userProfile}
          streakDays={streakDays}
          urgentMode={urgentMode}
          setUrgentMode={setUrgentMode}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              userProfile={userProfile}
              dashboardMetrics={dashboardMetrics}
              medications={medications}
              onLogMedication={handleLogMedication}
              setActiveTab={setActiveTab}
              urgentMode={urgentMode}
              streakDays={streakDays}
              onCheckIn={handleCheckIn}
            />
          )}

          {activeTab === 'scan' && (
            <DiagnosticScan
              scanHistory={scanHistory}
              onAddNewScan={handleAddNewScan}
              setActiveTab={setActiveTab}
              urgentMode={urgentMode}
              setUrgentMode={setUrgentMode}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {activeTab === 'coach' && (
            <AICoach
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              onLogMedication={handleLogMedication}
              activeMedications={medications}
              userProfile={userProfile}
              streakDays={streakDays}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {activeTab === 'care' && (
            <CareNavigation
              nearbyFacilities={nearbyFacilities}
              urgentMode={urgentMode}
            />
          )}
        </main>
      </div>

      {/* Gemini API Key Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeyUpdated={(newKey) => setApiKey(newKey)}
      />
    </div>
  );
}
