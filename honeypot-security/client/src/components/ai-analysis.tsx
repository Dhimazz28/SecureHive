import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AttackPattern, AIAnalysisResult, DatasetStats } from "@shared/schema";

export default function AIAnalysis() {
  const { toast } = useToast();

  const { data: attackPatterns, isLoading: patternsLoading } = useQuery<AttackPattern[]>({
    queryKey: ['/api/attack-patterns'],
    refetchInterval: 60000,
  });

  const { data: analysisResults, isLoading: resultsLoading } = useQuery<AIAnalysisResult[]>({
    queryKey: ['/api/ai-analysis'],
    refetchInterval: 30000,
  });

  const { data: datasetStats, isLoading: statsLoading } = useQuery<DatasetStats>({
    queryKey: ['/api/dataset-stats'],
    refetchInterval: 60000,
  });

  const retrainMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/retrain-model'),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "AI model retraining initiated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dataset-stats'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initiate model retraining",
        variant: "destructive",
      });
    },
  });

  const updatePatternMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest('PATCH', `/api/attack-patterns/${id}`, { status }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attack pattern status updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/attack-patterns'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update attack pattern",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-500/20 text-red-400';
      case 'under_review': return 'bg-yellow-500/20 text-yellow-400';
      case 'confirmed': return 'bg-green-500/20 text-green-400';
      case 'added_to_dataset': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return 'text-red-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-8">
      {/* AI Analysis Header */}
      <Card className="bg-surface border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-brain text-primary text-xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">AI Security Analysis</h3>
                <p className="text-gray-400">Intelligent threat detection and pattern analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-card px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">AI Active</span>
              </div>
              <Button
                onClick={() => retrainMutation.mutate()}
                disabled={retrainMutation.isPending}
                className="bg-primary hover:bg-blue-700"
              >
                <i className="fas fa-cog mr-2"></i>
                {retrainMutation.isPending ? 'Retraining...' : 'Retrain Model'}
              </Button>
            </div>
          </div>

          {/* AI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Model Accuracy</span>
                <i className="fas fa-check-circle text-green-400"></i>
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {statsLoading ? <Skeleton className="h-8 w-16 bg-gray-600" /> : `${datasetStats?.modelAccuracy ?? 94}%`}
              </p>
            </div>
            <div className="bg-card rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">New Patterns</span>
                <i className="fas fa-search text-primary"></i>
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {patternsLoading ? <Skeleton className="h-8 w-8 bg-gray-600" /> : attackPatterns?.length ?? 0}
              </p>
            </div>
            <div className="bg-card rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Dataset Size</span>
                <i className="fas fa-database text-yellow-400"></i>
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {statsLoading ? (
                  <Skeleton className="h-8 w-12 bg-gray-600" />
                ) : (
                  `${Math.floor(((datasetStats?.sqlSamples ?? 0) + (datasetStats?.bruteForceSamples ?? 0) + (datasetStats?.xssSamples ?? 0) + (datasetStats?.ddosPatterns ?? 0)) / 1000)}K`
                )}
              </p>
            </div>
            <div className="bg-card rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Last Update</span>
                <i className="fas fa-clock text-gray-400"></i>
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 bg-gray-600" />
                ) : (
                  datasetStats?.lastRetraining 
                    ? new Date(datasetStats.lastRetraining).toLocaleDateString()
                    : 'N/A'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Detected Threats */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* New Attack Patterns */}
        <Card className="bg-surface border-gray-700">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">New Attack Patterns Detected</h4>
            <div className="space-y-4">
              {patternsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg p-4">
                    <Skeleton className="h-20 w-full bg-gray-600" />
                  </div>
                ))
              ) : attackPatterns?.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-shield-check text-4xl text-green-400 mb-2"></i>
                  <p className="text-gray-400">No new attack patterns detected</p>
                </div>
              ) : (
                attackPatterns?.map((pattern) => (
                  <div key={pattern.id} className="bg-card rounded-lg p-4 border-l-4 border-red-400">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-white font-medium">{pattern.name}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(pattern.status)}`}>
                            {pattern.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{pattern.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Confidence: <span className="text-white font-medium">{pattern.confidence}%</span></span>
                          <span>Occurrences: <span className="text-white font-medium">{pattern.occurrences}</span></span>
                          <span>Risk: <span className={`font-medium ${getRiskScoreColor(pattern.riskScore)}`}>{pattern.riskScore}/10</span></span>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col space-y-2">
                        {pattern.status === 'new' && (
                          <Button
                            size="sm"
                            onClick={() => updatePatternMutation.mutate({ id: pattern.id, status: 'added_to_dataset' })}
                            disabled={updatePatternMutation.isPending}
                            className="bg-primary hover:bg-blue-700 text-xs"
                          >
                            Add to Dataset
                          </Button>
                        )}
                        {pattern.status === 'under_review' && (
                          <Button
                            size="sm"
                            onClick={() => updatePatternMutation.mutate({ id: pattern.id, status: 'confirmed' })}
                            disabled={updatePatternMutation.isPending}
                            className="bg-yellow-600 hover:bg-yellow-700 text-xs"
                          >
                            Confirm
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card className="bg-surface border-gray-700">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Recent Analysis Results</h4>
            <div className="space-y-4">
              {resultsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg p-4">
                    <Skeleton className="h-24 w-full bg-gray-600" />
                  </div>
                ))
              ) : analysisResults?.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-chart-line text-4xl text-blue-400 mb-2"></i>
                  <p className="text-gray-400">No analysis results available</p>
                </div>
              ) : (
                analysisResults?.map((result) => (
                  <div key={result.id} className="bg-card rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                          <i className="fas fa-shield-alt text-red-400 text-sm"></i>
                        </div>
                        <div>
                          <h5 className="text-white font-medium">{result.attackType}</h5>
                          <p className="text-gray-400 text-xs">ID: {result.trafficLogId}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Technique:</span>
                        <span className="text-white">{result.technique}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk Score:</span>
                        <span className={`font-medium ${getRiskScoreColor(result.riskScore)}`}>
                          {result.riskScore}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-white">{result.confidence}%</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-dark rounded-lg">
                      <h6 className="text-white text-sm font-medium mb-2">Recommended Actions:</h6>
                      <div className="text-gray-400 text-xs">
                        {(() => {
                          try {
                            const recommendations = JSON.parse(result.recommendations);
                            return (
                              <ul className="space-y-1">
                                {recommendations.map((rec: string, i: number) => (
                                  <li key={i}>• {rec}</li>
                                ))}
                              </ul>
                            );
                          } catch {
                            return <p>{result.recommendations}</p>;
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dataset Management */}
      <Card className="bg-surface border-gray-700">
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-white mb-4">AI Dataset Management</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dataset Statistics */}
            <div className="space-y-4">
              <h5 className="text-white font-medium">Dataset Statistics</h5>
              <div className="space-y-3">
                {statsLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="p-3 bg-card rounded-lg">
                      <Skeleton className="h-6 w-full bg-gray-600" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-bug text-red-400"></i>
                        <span className="text-gray-300">SQL Injection Samples</span>
                      </div>
                      <span className="text-white font-medium">{datasetStats?.sqlSamples?.toLocaleString() ?? '0'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-user-secret text-yellow-400"></i>
                        <span className="text-gray-300">Brute Force Samples</span>
                      </div>
                      <span className="text-white font-medium">{datasetStats?.bruteForceSamples?.toLocaleString() ?? '0'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-code text-purple-400"></i>
                        <span className="text-gray-300">XSS Samples</span>
                      </div>
                      <span className="text-white font-medium">{datasetStats?.xssSamples?.toLocaleString() ?? '0'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-bolt text-green-400"></i>
                        <span className="text-gray-300">DDoS Patterns</span>
                      </div>
                      <span className="text-white font-medium">{datasetStats?.ddosPatterns?.toLocaleString() ?? '0'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recent Updates */}
            <div className="space-y-4">
              <h5 className="text-white font-medium">Recent Dataset Updates</h5>
              <div className="space-y-3">
                <div className="p-3 bg-card rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">Model Retrained</span>
                    <span className="text-gray-400 text-xs">
                      {datasetStats?.lastRetraining 
                        ? new Date(datasetStats.lastRetraining).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    Model accuracy improved to {datasetStats?.modelAccuracy ?? 94}%
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary">
                      System
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-card rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">New Patterns Added</span>
                    <span className="text-gray-400 text-xs">Auto-update</span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    AI continuously learns from new attack patterns
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
