import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { TrafficLog } from "@shared/schema";

interface TrafficLogsResponse {
  data: TrafficLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function TrafficLogs() {
  const [filters, setFilters] = useState({
    severity: 'all',
    attackType: 'all',
    ipAddress: '',
  });
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, refetch } = useQuery<TrafficLogsResponse>({
    queryKey: ['/api/traffic-logs', { ...filters, page, limit }],
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'blocked': return 'bg-green-500/20 text-green-400';
      case 'monitored': return 'bg-blue-500/20 text-blue-400';
      case 'analyzed': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getAttackTypeIcon = (attackType: string) => {
    if (attackType.includes('SQL')) return 'fas fa-bug text-red-400';
    if (attackType.includes('XSS')) return 'fas fa-code text-purple-400';
    if (attackType.includes('Brute')) return 'fas fa-user-secret text-yellow-400';
    if (attackType.includes('DDoS')) return 'fas fa-bolt text-green-400';
    return 'fas fa-shield-alt text-gray-400';
  };

  return (
    <Card className="bg-surface border-gray-700">
      {/* Header with Controls */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Traffic Logs</h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-card px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Real-time updates</span>
            </div>
            <Button onClick={() => refetch()} className="bg-primary hover:bg-blue-700">
              <i className="fas fa-sync-alt mr-2"></i>Refresh
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-gray-400 text-sm">Filter:</label>
            <Select value={filters.severity} onValueChange={(value) => handleFilterChange('severity', value)}>
              <SelectTrigger className="bg-card border-gray-600 text-white w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-gray-600">
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-gray-400 text-sm">Attack Type:</label>
            <Select value={filters.attackType} onValueChange={(value) => handleFilterChange('attackType', value)}>
              <SelectTrigger className="bg-card border-gray-600 text-white w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-gray-600">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sql">SQL Injection</SelectItem>
                <SelectItem value="xss">XSS</SelectItem>
                <SelectItem value="brute">Brute Force</SelectItem>
                <SelectItem value="ddos">DDoS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Search IP..."
              value={filters.ipAddress}
              onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
              className="bg-card border-gray-600 text-white w-40"
            />
          </div>
        </div>
      </div>

      {/* Traffic Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-card">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Source IP
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Attack Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Target
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {isLoading ? (
              [...Array(10)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24 bg-card" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20 bg-card" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-28 bg-card" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32 bg-card" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-16 bg-card" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-16 bg-card" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20 bg-card" /></td>
                </tr>
              ))
            ) : (
              data?.data?.map((log) => (
                <tr key={log.id} className="hover:bg-card/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white font-medium">{log.sourceIP}</span>
                      <span className="inline-block w-4 h-3 bg-gray-600 rounded text-xs text-center leading-3 font-bold">
                        {log.country}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <i className={getAttackTypeIcon(log.attackType)}></i>
                      <span className="text-sm text-white">{log.attackType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {log.target}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadge(log.severity)}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-primary hover:text-blue-400 mr-3">View</button>
                    <button className="text-red-400 hover:text-red-300">Block IP</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && (
        <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing <span className="font-medium text-white">{((page - 1) * limit) + 1}-{Math.min(page * limit, data.total)}</span> of{" "}
            <span className="font-medium text-white">{data.total}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              Previous
            </Button>
            {[...Array(Math.min(5, data.totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className={page === pageNum ? "bg-primary text-white" : "border-gray-600 text-gray-400 hover:text-white"}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.min(data.totalPages, prev + 1))}
              disabled={page === data.totalPages}
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
