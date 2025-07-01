"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Activity,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { StockData } from '@/lib/stocks';

interface TechnicalSignal {
  name: string;
  signal: 'buy' | 'sell' | 'neutral';
  strength: number; // 0-100
  description: string;
}

interface TechnicalScanResult {
  symbol: string;
  name: string;
  price: number;
  signals: TechnicalSignal[];
  overallSignal: 'buy' | 'sell' | 'neutral';
  score: number;
  rsi: number;
  macd: number;
  sma20: number;
  sma50: number;
  volume: number;
  avgVolume: number;
}

interface TechnicalScannerProps {
  stocks: StockData[];
}

const TechnicalScanner: React.FC<TechnicalScannerProps> = ({ stocks }) => {
  const [scanResults, setScanResults] = useState<TechnicalScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [filterSignal, setFilterSignal] = useState<'all' | 'buy' | 'sell' | 'neutral'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'rsi' | 'volume'>('score');

  useEffect(() => {
    performTechnicalScan();
  }, [stocks]);

  const generateTechnicalSignals = (stock: StockData): TechnicalSignal[] => {
    const signals: TechnicalSignal[] = [];
    
    // RSI Signal
    const rsi = 30 + Math.random() * 40; // Simulate RSI between 30-70
    if (rsi > 70) {
      signals.push({
        name: 'RSI',
        signal: 'sell',
        strength: Math.min(100, (rsi - 70) * 3.33),
        description: 'Overbought condition'
      });
    } else if (rsi < 30) {
      signals.push({
        name: 'RSI',
        signal: 'buy',
        strength: Math.min(100, (30 - rsi) * 3.33),
        description: 'Oversold condition'
      });
    } else {
      signals.push({
        name: 'RSI',
        signal: 'neutral',
        strength: 50,
        description: 'Neutral momentum'
      });
    }

    // Moving Average Signal
    const price = stock.price;
    const sma20 = price * (0.98 + Math.random() * 0.04); // Simulate SMA20
    const sma50 = price * (0.95 + Math.random() * 0.1); // Simulate SMA50
    
    if (price > sma20 && sma20 > sma50) {
      signals.push({
        name: 'Moving Average',
        signal: 'buy',
        strength: 75,
        description: 'Price above moving averages'
      });
    } else if (price < sma20 && sma20 < sma50) {
      signals.push({
        name: 'Moving Average',
        signal: 'sell',
        strength: 75,
        description: 'Price below moving averages'
      });
    } else {
      signals.push({
        name: 'Moving Average',
        signal: 'neutral',
        strength: 50,
        description: 'Mixed signals'
      });
    }

    // Volume Signal
    const avgVolume = stock.volume * (0.8 + Math.random() * 0.4);
    const volumeRatio = stock.volume / avgVolume;
    
    if (volumeRatio > 1.5 && stock.changePercent > 0) {
      signals.push({
        name: 'Volume',
        signal: 'buy',
        strength: Math.min(100, volumeRatio * 40),
        description: 'High volume with price increase'
      });
    } else if (volumeRatio > 1.5 && stock.changePercent < 0) {
      signals.push({
        name: 'Volume',
        signal: 'sell',
        strength: Math.min(100, volumeRatio * 40),
        description: 'High volume with price decrease'
      });
    } else {
      signals.push({
        name: 'Volume',
        signal: 'neutral',
        strength: 30,
        description: 'Normal volume activity'
      });
    }

    // MACD Signal
    const macd = (Math.random() - 0.5) * 10; // Simulate MACD
    if (macd > 2) {
      signals.push({
        name: 'MACD',
        signal: 'buy',
        strength: Math.min(100, macd * 10),
        description: 'Bullish momentum'
      });
    } else if (macd < -2) {
      signals.push({
        name: 'MACD',
        signal: 'sell',
        strength: Math.min(100, Math.abs(macd) * 10),
        description: 'Bearish momentum'
      });
    } else {
      signals.push({
        name: 'MACD',
        signal: 'neutral',
        strength: 40,
        description: 'Sideways momentum'
      });
    }

    return signals;
  };

  const performTechnicalScan = async () => {
    setIsScanning(true);
    
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const results: TechnicalScanResult[] = stocks.map(stock => {
      const signals = generateTechnicalSignals(stock);
      
      // Calculate overall signal
      const buySignals = signals.filter(s => s.signal === 'buy').length;
      const sellSignals = signals.filter(s => s.signal === 'sell').length;
      
      let overallSignal: 'buy' | 'sell' | 'neutral';
      if (buySignals > sellSignals) {
        overallSignal = 'buy';
      } else if (sellSignals > buySignals) {
        overallSignal = 'sell';
      } else {
        overallSignal = 'neutral';
      }
      
      // Calculate score
      const score = signals.reduce((sum, signal) => {
        if (signal.signal === 'buy') return sum + signal.strength;
        if (signal.signal === 'sell') return sum - signal.strength;
        return sum;
      }, 0) / signals.length + 50; // Normalize to 0-100
      
      return {
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        signals,
        overallSignal,
        score: Math.max(0, Math.min(100, score)),
        rsi: 30 + Math.random() * 40,
        macd: (Math.random() - 0.5) * 10,
        sma20: stock.price * (0.98 + Math.random() * 0.04),
        sma50: stock.price * (0.95 + Math.random() * 0.1),
        volume: stock.volume,
        avgVolume: stock.volume * (0.8 + Math.random() * 0.4)
      };
    });
    
    setScanResults(results);
    setIsScanning(false);
  };

  const filteredResults = scanResults.filter(result => {
    if (filterSignal === 'all') return true;
    return result.overallSignal === filterSignal;
  });

  const sortedResults = filteredResults.sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.score - a.score;
      case 'rsi':
        return b.rsi - a.rsi;
      case 'volume':
        return b.volume - a.volume;
      default:
        return 0;
    }
  });

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'text-green-600 bg-green-50 border-green-200';
      case 'sell': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy': return <TrendingUp className="h-4 w-4" />;
      case 'sell': return <TrendingDown className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="minimal-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Technical Scanner
              </CardTitle>
              <CardDescription>
                Real-time technical analysis of all Nifty 50 stocks
              </CardDescription>
            </div>
            <Button onClick={performTechnicalScan} disabled={isScanning}>
              {isScanning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Activity className="h-4 w-4 mr-2" />
              )}
              {isScanning ? 'Scanning...' : 'Scan Now'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={filterSignal} onValueChange={(value: any) => setFilterSignal(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Signals</SelectItem>
                <SelectItem value="buy">Buy Signals</SelectItem>
                <SelectItem value="sell">Sell Signals</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">By Score</SelectItem>
                <SelectItem value="rsi">By RSI</SelectItem>
                <SelectItem value="volume">By Volume</SelectItem>
              </SelectContent>
            </Select>
            
            <Badge variant="outline">
              {filteredResults.length} stocks found
            </Badge>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="signals">Signal Breakdown</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedResults.slice(0, 12).map((result) => (
                  <Card key={result.symbol} className="minimal-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{result.symbol}</h3>
                          <p className="text-sm text-muted-foreground">₹{result.price.toFixed(2)}</p>
                        </div>
                        <Badge className={getSignalColor(result.overallSignal)}>
                          {getSignalIcon(result.overallSignal)}
                          {result.overallSignal.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Technical Score</span>
                          <span className="font-medium">{result.score.toFixed(0)}/100</span>
                        </div>
                        <Progress value={result.score} className="h-2" />
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">RSI: </span>
                            <span className={result.rsi > 70 ? 'text-red-600' : result.rsi < 30 ? 'text-green-600' : 'text-yellow-600'}>
                              {result.rsi.toFixed(1)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Vol: </span>
                            <span>{(result.volume / 1000000).toFixed(1)}M</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="detailed">
              <div className="space-y-4">
                {sortedResults.slice(0, 10).map((result) => (
                  <Card key={result.symbol} className="minimal-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{result.symbol}</h3>
                          <p className="text-muted-foreground">{result.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">₹{result.price.toFixed(2)}</p>
                          <Badge className={getSignalColor(result.overallSignal)}>
                            {getSignalIcon(result.overallSignal)}
                            {result.overallSignal.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">RSI (14)</p>
                          <p className="text-lg font-semibold">{result.rsi.toFixed(1)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">MACD</p>
                          <p className="text-lg font-semibold">{result.macd.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">SMA 20</p>
                          <p className="text-lg font-semibold">₹{result.sma20.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Volume Ratio</p>
                          <p className="text-lg font-semibold">{(result.volume / result.avgVolume).toFixed(2)}x</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="signals">
              <div className="space-y-4">
                {sortedResults.slice(0, 8).map((result) => (
                  <Card key={result.symbol} className="minimal-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{result.symbol}</h3>
                        <Badge className={getSignalColor(result.overallSignal)}>
                          Overall: {result.overallSignal.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.signals.map((signal, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{signal.name}</p>
                              <p className="text-sm text-muted-foreground">{signal.description}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={getSignalColor(signal.signal)} size="sm">
                                {signal.signal.toUpperCase()}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                {signal.strength.toFixed(0)}% strength
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalScanner;