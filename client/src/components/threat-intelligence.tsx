import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Shield, 
  TrendingUp, 
  Globe, 
  AlertTriangle, 
  Target, 
  Zap,
  Clock,
  MapPin,
  Eye,
  BarChart3
} from "lucide-react";

interface ThreatIntelligence {
  id: number;
  threatName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  firstSeen: Date;
  lastSeen: Date;
  attackCount: number;
  sourceCountries: string[];
  targetPorts: string;
  description: string;
  mitigationStatus: 'active' | 'contained' | 'resolved';
  iocType: 'ip' | 'domain' | 'hash' | 'pattern';
  tags: string[];
}

interface ThreatTrend {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface GeographicThreat {
  country: string;
  code: string;
  threatCount: number;
  severity: string;
  riskScore: number;
}

const severityColors = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-blue-500 text-white'
};

const statusColors = {
  active: 'bg-red-100 text-red-800 border-red-200',
  contained: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  resolved: 'bg-green-100 text-green-800 border-green-200'
};

export default function ThreatIntelligence() {
  const { data: threats = [], isLoading: threatsLoading } = useQuery<ThreatIntelligence[]>({
    queryKey: ['/api/threat-intelligence'],
    refetchInterval: 30000
  });

  const { data: trends = [], isLoading: trendsLoading } = useQuery<ThreatTrend[]>({
    queryKey: ['/api/threat-trends'],
    refetchInterval: 60000
  });

  const { data: geoThreats = [], isLoading: geoLoading } = useQuery<GeographicThreat[]>({
    queryKey: ['/api/geographic-threats'],
    refetchInterval: 45000
  });

  const activeCriticalThreats = threats.filter((t: ThreatIntelligence) => 
    t.severity === 'critical' && t.mitigationStatus === 'active'
  ).length;

  const totalThreats = threats.length;
  const avgConfidence = threats.length > 0 
    ? Math.round(threats.reduce((sum: number, t: ThreatIntelligence) => sum + t.confidence, 0) / threats.length)
    : 0;

  if (threatsLoading || trendsLoading || geoLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {activeCriticalThreats > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Critical Threats Active</AlertTitle>
          <AlertDescription className="text-red-700">
            {activeCriticalThreats} critical threat{activeCriticalThreats !== 1 ? 's' : ''} require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalThreats}</div>
            <p className="text-xs text-muted-foreground">
              {activeCriticalThreats} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConfidence}%</div>
            <p className="text-xs text-muted-foreground">
              Detection accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Source Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{geoThreats.length}</div>
            <p className="text-xs text-muted-foreground">
              Geographic origins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalThreats > 0 
                ? Math.round((threats.filter((t: ThreatIntelligence) => t.mitigationStatus === 'resolved').length / totalThreats) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Threats resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="threats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="threats">Active Threats</TabsTrigger>
          <TabsTrigger value="geographic">Geographic Intel</TabsTrigger>
          <TabsTrigger value="trends">Threat Trends</TabsTrigger>
          <TabsTrigger value="iocs">IOCs</TabsTrigger>
        </TabsList>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Threat Intelligence
              </CardTitle>
              <CardDescription>
                Real-time threat detection and analysis results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threats.map((threat: ThreatIntelligence) => (
                  <div key={threat.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{threat.threatName}</h4>
                        <p className="text-sm text-muted-foreground">{threat.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={severityColors[threat.severity]}>
                          {threat.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={statusColors[threat.mitigationStatus]}>
                          {threat.mitigationStatus.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span>Confidence: {threat.confidence}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span>Attacks: {threat.attackCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Origins: {threat.sourceCountries.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Last: {new Date(threat.lastSeen).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {threat.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Threat Confidence</span>
                        <span>{threat.confidence}%</span>
                      </div>
                      <Progress value={threat.confidence} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Geographic Threat Intelligence
              </CardTitle>
              <CardDescription>
                Threat distribution by geographic origin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geoThreats.map((geo: GeographicThreat, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-6 rounded border flex items-center justify-center text-xs font-mono">
                        {geo.code}
                      </div>
                      <div>
                        <div className="font-medium">{geo.country}</div>
                        <div className="text-sm text-muted-foreground">
                          {geo.threatCount} threat{geo.threatCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={severityColors[geo.severity as keyof typeof severityColors]}>
                        {geo.severity}
                      </Badge>
                      <div className="text-right">
                        <div className="font-semibold">Risk: {geo.riskScore}/10</div>
                        <Progress value={geo.riskScore * 10} className="w-20 h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Threat Trends Analysis
              </CardTitle>
              <CardDescription>
                Historical threat patterns and predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">+15%</div>
                    <div className="text-sm text-muted-foreground">Critical threats</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">+8%</div>
                    <div className="text-sm text-muted-foreground">High severity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">-12%</div>
                    <div className="text-sm text-muted-foreground">Medium threats</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">-5%</div>
                    <div className="text-sm text-muted-foreground">Low priority</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Emerging Threat Patterns</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>Multi-vector coordinated attacks</span>
                      <Badge variant="destructive">Trending</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>Supply chain infiltration attempts</span>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>AI-powered social engineering</span>
                      <Badge className="bg-orange-500">Emerging</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="iocs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Indicators of Compromise (IOCs)
              </CardTitle>
              <CardDescription>
                Threat indicators and signatures for detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Malicious IPs</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 border rounded text-sm">
                        <code className="text-red-600">192.168.1.100</code>
                        <Badge variant="destructive">Blocked</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded text-sm">
                        <code className="text-red-600">10.0.0.45</code>
                        <Badge className="bg-orange-500">Monitoring</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded text-sm">
                        <code className="text-red-600">172.16.0.23</code>
                        <Badge variant="destructive">Blocked</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Attack Signatures</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 border rounded text-sm">
                        <code className="text-orange-600">SQL injection pattern</code>
                        <Badge className="bg-blue-500">Detected</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded text-sm">
                        <code className="text-orange-600">XSS payload variant</code>
                        <Badge className="bg-blue-500">Detected</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded text-sm">
                        <code className="text-orange-600">Brute force signature</code>
                        <Badge variant="destructive">Critical</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}