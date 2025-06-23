import { useState } from "react";
import Sidebar from "@/components/sidebar";
import OverviewDashboard from "@/components/overview-dashboard";
import TrafficLogs from "@/components/traffic-logs";
import AIAnalysis from "@/components/ai-analysis";
import { useRealTimeUpdates } from "@/hooks/use-real-time-updates";

type ActiveSection = 'overview' | 'traffic' | 'analysis' | 'threats' | 'settings';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  
  // Enable real-time updates
  useRealTimeUpdates();

  const renderContent = () => {
    switch (activeSection) {
      case 'traffic':
        return <TrafficLogs />;
      case 'analysis':
        return <AIAnalysis />;
      case 'threats':
        return <AIAnalysis />; // Threat Intelligence uses same component
      case 'settings':
        return (
          <div className="bg-surface rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">System Settings</h3>
            <p className="text-gray-400">Settings panel coming soon...</p>
          </div>
        );
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-dark text-white">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-surface border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Security Dashboard</h2>
              <p className="text-gray-400">Real-time honeypot monitoring and threat analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-card px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Live</span>
              </div>
              <button 
                onClick={() => window.open('/api/export-report', '_blank')}
                className="bg-primary hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
              >
                <i className="fas fa-download mr-2"></i>Export Report
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
