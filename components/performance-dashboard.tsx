"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  Activity,
  Clock,
  Zap,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { usePerformanceMonitor } from '@/lib/performance-monitor';
import { stockCache, newsCache, marketDataCache, userDataCache } from '@/lib/cache';

const PerformanceDashboard: React.FC = () => {
  const { getMetrics } = usePerformanceMonitor();
  const [metrics, setMetrics] = useState<any>({});
  const [cacheStats, setCacheStats] = useState<any>({});

  useEffect(() => {
    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const updateMetrics = () => {
    setMetrics(getMetrics());
    setCacheStats({
      stock: stockCache.getStats(),
      news: newsCache.getStats(),
      marketData: marketDataCache.getStats(),
      userData: userDataCache.getStats()
    });
  };

  const getPerformanceStatus = (avgTime: number) => {
    if (avgTime < 100) return { status: 'excellent', color: 'text-green-600', icon: CheckCircle };
    if (avgTime < 500) return { status: 'good', color: 'text-blue-600', icon: CheckCircle };
    if (avgTime < 1000) return { status: 'fair', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'poor', color: 'text-red-600', icon: AlertTriangle };
  };

  const apiMetrics = Object.entries(metrics)
    .filter(([key]) => key.startsWith('api_'))
    .map(([key, data]: [string, any]) => ({
      endpoint: key.replace('api_', ''),
      ...data,
      ...getPerformanceStatus(data.avg)
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Performance Dashboard</h2>
          <p className="text-muted-foreground">Monitor application performance and cache efficiency</p>
        </div>
        <Button onClick={updateMetrics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="minimal-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg API Response</p>
                <p className="text-2xl font-bold">
                  {apiMetrics.length > 0 
                    ? (apiMetrics.reduce((sum, m) => sum + m.avg, 0) / apiMetrics.length).toFixed(0)
                    : '0'}ms
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
                <p className="text-2xl font-bold">
                  {Object.values(cacheStats).length > 0
                    ? (Object.values(cacheStats).reduce((sum: number, stats: any) => sum + (stats.hitRate || 0), 0) / Object.values(cacheStats).length * 100).toFixed(1)
                    : '0'}%
                </p>
              </div>
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Endpoints</p>
                <p className="text-2xl font-bold">{apiMetrics.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cache Size</p>
                <p className="text-2xl font-bold">
                  {Object.values(cacheStats).reduce((sum: number, stats: any) => sum + (stats.size || 0), 0)}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Performance */}
      <Card className="minimal-card">
        <CardHeader>
          <CardTitle>API Performance</CardTitle>
          <CardDescription>Response times for different API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          {apiMetrics.length > 0 ? (
            <div className="space-y-4">
              {apiMetrics.map((metric) => {
                const StatusIcon = metric.icon;
                return (
                  <div key={metric.endpoint} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-5 w-5 ${metric.color}`} />
                      <div>
                        <p className="font-medium">/api/{metric.endpoint.replace(/_/g, '/')}</p>
                        <p className="text-sm text-muted-foreground">
                          {metric.count} requests
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{metric.avg.toFixed(0)}ms</p>
                      <p className="text-xs text-muted-foreground">
                        {metric.min.toFixed(0)}ms - {metric.max.toFixed(0)}ms
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No API metrics available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cache Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="minimal-card">
          <CardHeader>
            <CardTitle>Cache Performance</CardTitle>
            <CardDescription>Cache hit rates and efficiency metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(cacheStats).map(([cacheName, stats]: [string, any]) => (
                <div key={cacheName} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">{cacheName} Cache</span>
                    <Badge variant="outline">
                      {stats.size}/{stats.maxSize} items
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Hit Rate</span>
                      <span>{(stats.hitRate * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.hitRate * 100} className="h-2" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg Age: {(stats.avgAge / 1000).toFixed(1)}s</span>
                    <span>Expired: {stats.expired}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Response time trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={apiMetrics.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="endpoint" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avg" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="min" stroke="#82ca9d" strokeWidth={1} />
                  <Line type="monotone" dataKey="max" stroke="#ffc658" strokeWidth={1} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Recommendations */}
      <Card className="minimal-card">
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apiMetrics.filter(m => m.avg > 500).length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Slow API Endpoints Detected</p>
                  <p className="text-sm text-yellow-700">
                    Consider optimizing endpoints with response times over 500ms
                  </p>
                </div>
              </div>
            )}
            
            {Object.values(cacheStats).some((stats: any) => stats.hitRate < 0.7) && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Database className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Low Cache Hit Rate</p>
                  <p className="text-sm text-blue-700">
                    Consider increasing cache TTL or optimizing cache keys
                  </p>
                </div>
              </div>
            )}
            
            {Object.values(cacheStats).every((stats: any) => stats.hitRate > 0.8) && 
             apiMetrics.every(m => m.avg < 300) && (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Excellent Performance</p>
                  <p className="text-sm text-green-700">
                    Your application is performing optimally
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;