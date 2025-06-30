import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Settings, 
  AlertTriangle, 
  Download, 
  Database,
  Zap,
  Clock,
  Eye,
  Bell,
  Lock,
  Wifi,
  Server,
  Activity
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SecurityConfig {
  autoBlock: boolean;
  alertThreshold: number;
  realTimeMonitoring: boolean;
  logRetention: number;
  aiAnalysis: boolean;
  geoBlocking: boolean;
  rateLimitEnabled: boolean;
  maxRequestsPerMinute: number;
}

interface SystemStatus {
  uptime: string;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkConnections: number;
  activeThreats: number;
  blockedIPs: number;
}

export default function SecuritySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [config, setConfig] = useState<SecurityConfig>({
    autoBlock: true,
    alertThreshold: 5,
    realTimeMonitoring: true,
    logRetention: 30,
    aiAnalysis: true,
    geoBlocking: false,
    rateLimitEnabled: true,
    maxRequestsPerMinute: 100
  });

  const { data: systemStatus } = useQuery<SystemStatus>({
    queryKey: ['/api/system-status'],
    refetchInterval: 10000
  });

  const updateConfigMutation = useMutation({
    mutationFn: (newConfig: SecurityConfig) => 
      fetch('/api/security-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Configuration Updated",
        description: "Security settings have been saved successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/security-config'] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update security configuration.",
        variant: "destructive"
      });
    }
  });

  const exportReportMutation = useMutation({
    mutationFn: () => fetch('/api/export-report').then(res => res.json()),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `honeypot-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Report Exported",
        description: "Security report has been downloaded successfully."
      });
    }
  });

  const handleConfigChange = (key: keyof SecurityConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const saveConfiguration = () => {
    updateConfigMutation.mutate(config);
  };

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>Real-time system performance and security metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>System Uptime</Label>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {systemStatus?.uptime || "24h 15m"}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span>{systemStatus?.memoryUsage || 65}%</span>
                </div>
                <Progress value={systemStatus?.memoryUsage || 65} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span>{systemStatus?.cpuUsage || 23}%</span>
                </div>
                <Progress value={systemStatus?.cpuUsage || 23} className="h-2" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Active Threats</Label>
                <Badge variant="destructive">
                  {systemStatus?.activeThreats || 12}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Blocked IPs</Label>
                <Badge variant="secondary">
                  {systemStatus?.blockedIPs || 847}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Network Connections</Label>
                <Badge variant="outline">
                  {systemStatus?.networkConnections || 156}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Disk Usage</span>
                  <span>{systemStatus?.diskUsage || 42}%</span>
                </div>
                <Progress value={systemStatus?.diskUsage || 42} className="h-2" />
              </div>
              
              <Button 
                onClick={() => exportReportMutation.mutate()}
                disabled={exportReportMutation.isPending}
                className="w-full"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Security Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs defaultValue="security" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>Configure security policies and threat response</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Block Threats</Label>
                      <div className="text-sm text-muted-foreground">
                        Automatically block detected malicious IPs
                      </div>
                    </div>
                    <Switch
                      checked={config.autoBlock}
                      onCheckedChange={(checked) => handleConfigChange('autoBlock', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alertThreshold">Alert Threshold</Label>
                    <Input
                      id="alertThreshold"
                      type="number"
                      value={config.alertThreshold}
                      onChange={(e) => handleConfigChange('alertThreshold', parseInt(e.target.value))}
                      min="1"
                      max="100"
                    />
                    <div className="text-sm text-muted-foreground">
                      Number of failed attempts before triggering alerts
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Geographic Blocking</Label>
                      <div className="text-sm text-muted-foreground">
                        Block traffic from high-risk countries
                      </div>
                    </div>
                    <Switch
                      checked={config.geoBlocking}
                      onCheckedChange={(checked) => handleConfigChange('geoBlocking', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Rate Limiting</Label>
                      <div className="text-sm text-muted-foreground">
                        Limit requests per IP address
                      </div>
                    </div>
                    <Switch
                      checked={config.rateLimitEnabled}
                      onCheckedChange={(checked) => handleConfigChange('rateLimitEnabled', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxRequests">Max Requests per Minute</Label>
                    <Input
                      id="maxRequests"
                      type="number"
                      value={config.maxRequestsPerMinute}
                      onChange={(e) => handleConfigChange('maxRequestsPerMinute', parseInt(e.target.value))}
                      min="10"
                      max="1000"
                      disabled={!config.rateLimitEnabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logRetention">Log Retention (days)</Label>
                    <Input
                      id="logRetention"
                      type="number"
                      value={config.logRetention}
                      onChange={(e) => handleConfigChange('logRetention', parseInt(e.target.value))}
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Monitoring Settings
              </CardTitle>
              <CardDescription>Configure monitoring and analysis features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Real-time Monitoring</Label>
                    <div className="text-sm text-muted-foreground">
                      Enable continuous traffic monitoring
                    </div>
                  </div>
                  <Switch
                    checked={config.realTimeMonitoring}
                    onCheckedChange={(checked) => handleConfigChange('realTimeMonitoring', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>AI Analysis</Label>
                    <div className="text-sm text-muted-foreground">
                      Use AI for advanced threat detection
                    </div>
                  </div>
                  <Switch
                    checked={config.aiAnalysis}
                    onCheckedChange={(checked) => handleConfigChange('aiAnalysis', checked)}
                  />
                </div>

                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertTitle>Performance Impact</AlertTitle>
                  <AlertDescription>
                    Real-time monitoring and AI analysis may increase system resource usage.
                    Monitor system performance regularly.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alert Configuration
              </CardTitle>
              <CardDescription>Configure notification and alerting preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Critical Threat Alerts</h4>
                  <div className="text-sm text-muted-foreground mb-3">
                    Immediate notifications for high-severity threats
                  </div>
                  <Badge className="bg-red-500">Enabled</Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Anomaly Detection</h4>
                  <div className="text-sm text-muted-foreground mb-3">
                    Alerts for unusual traffic patterns
                  </div>
                  <Badge variant="secondary">Enabled</Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">System Health</h4>
                  <div className="text-sm text-muted-foreground mb-3">
                    Notifications for system performance issues
                  </div>
                  <Badge variant="outline">Monitoring</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Management
              </CardTitle>
              <CardDescription>Database configuration and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Connection Status</span>
                    <Badge className="bg-green-500">Connected</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Database Type</span>
                    <span className="text-sm text-muted-foreground">PostgreSQL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Records</span>
                    <span className="text-sm text-muted-foreground">15,847</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Optimize Tables
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Activity className="h-4 w-4 mr-2" />
                    View Statistics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Configuration */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold">Configuration Changes</h4>
              <p className="text-sm text-muted-foreground">
                Save your security configuration changes
              </p>
            </div>
            <Button 
              onClick={saveConfiguration}
              disabled={updateConfigMutation.isPending}
            >
              {updateConfigMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}