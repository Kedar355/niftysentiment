"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Zap,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { TechnicalPattern, FundamentalAnalysis, TechnicalIndicators } from '@/lib/external-apis';
import { toast } from 'sonner';

interface StockAnalysisPanelProps {
  symbol: string;
  onClose?: () => void;
}

interface AnalysisData {
  technicalPatterns: TechnicalPattern[];
  fundamentalAnalysis: FundamentalAnalysis;
  technicalIndicators: TechnicalIndicators | null;
  companyProfile: any;
  earnings: any;
  advancedData: any;
}

const StockAnalysisPanel: React.FC<StockAnalysisPanelProps> = ({ symbol, onClose }) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalysisData();
  }, [symbol]);

  const fetchAnalysisData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stocks/${symbol}/analysis`);
      if (response.ok) {
        const data = await response.json();
        setAnalysisData(data);
      } else {
        toast.error('Failed to fetch analysis data');
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
      toast.error('Error fetching analysis data');
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_buy':
        return 'bg-green-600 text-white';
      case 'buy':
        return 'bg-green-500 text-white';
      case 'hold':
        return 'bg-yellow-500 text-white';
      case 'sell':
        return 'bg-red-500 text-white';
      case 'strong_sell':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card className="minimal-card">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysisData) {
    return (
      <Card className="minimal-card">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-yellow-500" />
            <p className="text-muted-foreground">Failed to load analysis data</p>
            <Button onClick={fetchAnalysisData} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{symbol} Analysis</h2>
          <p className="text-muted-foreground">Comprehensive stock analysis and insights</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="minimal-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fundamental Score</p>
                <p className="text-2xl font-bold">{analysisData.fundamentalAnalysis.score.toFixed(0)}/100</p>
              </div>
              <div className="text-right">
                <Badge className={getRecommendationColor(analysisData.fundamentalAnalysis.recommendation)}>
                  {analysisData.fundamentalAnalysis.recommendation.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
            <Progress value={analysisData.fundamentalAnalysis.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <p className={`text-2xl font-bold ${getRiskColor(analysisData.fundamentalAnalysis.riskLevel)}`}>
                  {analysisData.fundamentalAnalysis.riskLevel.toUpperCase()}
                </p>
              </div>
              <Shield className={`h-8 w-8 ${getRiskColor(analysisData.fundamentalAnalysis.riskLevel)}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Technical Patterns</p>
                <p className="text-2xl font-bold">{analysisData.technicalPatterns.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analysisData.technicalPatterns.filter(p => p.bullish).length} bullish patterns detected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="fundamental" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fundamental">Fundamental</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
        </TabsList>

        <TabsContent value="fundamental" className="space-y-4">
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Fundamental Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price Targets */}
              {analysisData.fundamentalAnalysis.targetPrice && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Target Price</Label>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{analysisData.fundamentalAnalysis.targetPrice.toFixed(2)}
                    </div>
                  </div>
                  {analysisData.fundamentalAnalysis.stopLoss && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Stop Loss</Label>
                      <div className="text-2xl font-bold text-red-600">
                        ₹{analysisData.fundamentalAnalysis.stopLoss.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Strengths */}
              <div>
                <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Strengths
                </h4>
                <div className="space-y-2">
                  {analysisData.fundamentalAnalysis.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div>
                <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Weaknesses
                </h4>
                <div className="space-y-2">
                  {analysisData.fundamentalAnalysis.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-sm">{weakness}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Technical Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisData.technicalIndicators ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">RSI (14)</Label>
                    <div className="text-xl font-bold">
                      {analysisData.technicalIndicators.rsi.toFixed(2)}
                    </div>
                    <Progress value={analysisData.technicalIndicators.rsi} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {analysisData.technicalIndicators.rsi > 70 ? 'Overbought' : 
                       analysisData.technicalIndicators.rsi < 30 ? 'Oversold' : 'Neutral'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">MACD</Label>
                    <div className="text-xl font-bold">
                      {analysisData.technicalIndicators.macd.macd.toFixed(4)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Signal: {analysisData.technicalIndicators.macd.signal.toFixed(4)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">SMA (20)</Label>
                    <div className="text-xl font-bold">
                      ₹{analysisData.technicalIndicators.sma20.toFixed(2)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Technical indicators not available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Technical Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisData.technicalPatterns.length > 0 ? (
                <div className="space-y-4">
                  {analysisData.technicalPatterns.map((pattern, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{pattern.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={pattern.bullish ? "default" : "destructive"}>
                            {pattern.bullish ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {pattern.bullish ? 'Bullish' : 'Bearish'}
                          </Badge>
                          <Badge variant="outline">
                            {(pattern.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                      <div className="mt-2">
                        <Progress value={pattern.confidence * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No technical patterns detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              {analysisData.advancedData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Market Cap</Label>
                      <p className="text-lg font-semibold">
                        ₹{(analysisData.advancedData.marketCap / 10000000).toFixed(0)} Cr
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">P/E Ratio</Label>
                      <p className="text-lg font-semibold">
                        {analysisData.advancedData.pe?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">EPS</Label>
                      <p className="text-lg font-semibold">
                        ₹{analysisData.advancedData.eps?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Dividend Yield</Label>
                      <p className="text-lg font-semibold">
                        {analysisData.advancedData.dividend?.toFixed(2) || 'N/A'}%
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Beta</Label>
                      <p className="text-lg font-semibold">
                        {analysisData.advancedData.beta?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">52W Range</Label>
                      <p className="text-lg font-semibold">
                        ₹{analysisData.advancedData.week52Low?.toFixed(2)} - ₹{analysisData.advancedData.week52High?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Company data not available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockAnalysisPanel;