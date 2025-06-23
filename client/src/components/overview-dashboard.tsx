import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SystemMetrics, TrafficLog, AttackPattern } from "@shared/schema";

export default function OverviewDashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<SystemMetrics>({
    queryKey: ['/api/metrics'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: recentLogs, isLoading: logsLoading } = useQuery<{ data: TrafficLog[] }>({
    queryKey: ['/api/traffic-logs', { limit: 5 }],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const { data: attackPatterns, isLoading: patternsLoading } = useQuery<AttackPattern[]>({
    queryKey: ['/api/attack-patterns'],
    refetchInterval: 60000, // Refetch every minute
  });

  if (metricsLoading) {
    return <OverviewSkeleton />;
  }

  const attackTypeDistribution = [
    { name: 'SQL Injection', count: 42, color: 'bg-red-400' },
    { name: 'Brute Force', count: 28, color: 'bg-yellow-400' },
    { name: 'XSS', count: 18, color: 'bg-purple-400' },
    { name: 'DDoS', count: 12, color: 'bg-green-400' },
  ];

  const topCountries = [
    { code: 'CN', name: 'China', attacks: 67 },
    { code: 'RU', name: 'Russia', attacks: 43 },
    { code: 'US', name: 'United States', attacks: 29 },
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return 'fas fa-bug text-red-400';
      case 'medium': return 'fas fa-user-secret text-yellow-400';
      case 'low': return 'fas fa-code text-purple-400';
      default: return 'fas fa-shield-alt text-gray-400';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-surface border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Attacks Today</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {metrics?.attacksToday?.toLocaleString() ?? '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-400 text-xl"></i>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-red-400 text-sm font-medium">+12%</span>
              <span className="text-gray-400 text-sm ml-2">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Unique IPs</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {metrics?.uniqueIPs ?? '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-globe text-yellow-400 text-xl"></i>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-yellow-400 text-sm font-medium">+7%</span>
              <span className="text-gray-400 text-sm ml-2">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">AI Detections</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {metrics?.aiDetections ?? '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-brain text-primary text-xl"></i>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-400 text-sm font-medium">+23%</span>
              <span className="text-gray-400 text-sm ml-2">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Blocked Attempts</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {metrics?.blockedAttempts?.toLocaleString() ?? '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-shield-alt text-green-400 text-xl"></i>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-400 text-sm font-medium">+18%</span>
              <span className="text-gray-400 text-sm ml-2">vs yesterday</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Attack Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="bg-surface border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Attack Activity</h3>
            <div className="space-y-4">
              {logsLoading ? (
                <>
                  <Skeleton className="h-16 w-full bg-card" />
                  <Skeleton className="h-16 w-full bg-card" />
                  <Skeleton className="h-16 w-full bg-card" />
                </>
              ) : (
                recentLogs?.data?.slice(0, 3).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                        <i className={getSeverityIcon(log.severity) + " text-xs"}></i>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{log.attackType}</p>
                        <p className="text-gray-400 text-xs">{log.sourceIP}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getSeverityBadge(log.severity)}`}>
                        {log.severity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attack Types Distribution */}
        <Card className="bg-surface border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Attack Types Distribution</h3>
            <div className="space-y-4">
              {attackTypeDistribution.map((type) => (
                <div key={type.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 ${type.color} rounded-full`}></div>
                    <span className="text-gray-300">{type.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div className={`${type.color} h-2 rounded-full`} style={{ width: `${type.count}%` }}></div>
                    </div>
                    <span className="text-white text-sm font-medium">{type.count}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Attacking Countries */}
      <Card className="bg-surface border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Attacking Countries</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topCountries.map((country) => (
              <div key={country.code} className="flex items-center space-x-4">
                <div className="w-12 h-8 bg-gray-600 rounded flex items-center justify-center">
                  <span className="text-xs font-bold">{country.code}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm">{country.name}</span>
                    <span className="text-gray-400 text-sm">{country.attacks} attacks</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-red-400 h-2 rounded-full" style={{ width: `${country.attacks}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-surface border-gray-700">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full bg-card" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-surface border-gray-700">
          <CardContent className="p-6">
            <Skeleton className="h-40 w-full bg-card" />
          </CardContent>
        </Card>
        <Card className="bg-surface border-gray-700">
          <CardContent className="p-6">
            <Skeleton className="h-40 w-full bg-card" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
