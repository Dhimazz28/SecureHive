import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: 'overview' | 'traffic' | 'analysis' | 'threats' | 'settings') => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const navItems = [
    { id: 'overview', icon: 'fas fa-tachometer-alt', label: 'Overview' },
    { id: 'traffic', icon: 'fas fa-list-alt', label: 'Traffic Logs' },
    { id: 'analysis', icon: 'fas fa-brain', label: 'AI Analysis' },
    { id: 'threats', icon: 'fas fa-exclamation-triangle', label: 'Threat Intelligence' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-surface border-r border-gray-700 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-shield-alt text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">HoneyShield</h1>
            <p className="text-xs text-gray-400">Security Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSectionChange(item.id as any)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  activeSection === item.id
                    ? "bg-primary text-white"
                    : "text-gray-300 hover:bg-card hover:text-white"
                )}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* System Status */}
      <div className="p-4 border-t border-gray-700">
        <div className="bg-card rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Honeypot Status</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Active</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            <span>24h 15m uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
