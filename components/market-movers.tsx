"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Volume2,
  Zap,
  Target,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { StockData } from '@/lib/stocks';

interface MarketMoversProps {
  stocks: StockData[];
  isLoading?: boolean;
}

interface MoverData extends StockData {
  rank: number;
  momentum: 'strong' | 'moderate' | 'weak';
  volumeRatio: number;
}

const MarketMovers: React.FC<MarketMoversProps> = ({ stocks, isLoading }) => {
  const [timeframe, setTimeframe] = useState<'1d' | '1w' | '1m'>('1d');
  const [category, setCategory] = useState<'all' | 'largecap' | 'midcap'>('all');

  const getVolumeRatio = (stock: StockData): number => {
    // Simulate average volume calculation
    const avgVolume = stock.volume * (0.7 + Math.random() * 0.6);
    return stock.volume / avgVolume;
  };

  const getMomentum = (changePercent: number, volumeRatio: number): 'strong' | 'moderate' | 'weak' => {
    if (Math.abs(changePercent) > 5 && volumeRatio > 2) return 'strong';
    if (Math.abs(changePercent) > 2 && volumeRatio > 1.5) return 'moderate';
    return 'weak';
  };

  const getFilteredStocks = (): StockData[] => {
    let filtered = stocks;
    
    if (category === 'largecap') {
      filtered = stocks.filter(s => (s.marketCap || 0) > 100000000000); // > 1L Cr
    } else if (category === 'midcap') {
      filtered = stocks.filter(s => (s.marketCap || 0) <= 100000000000 && (s.marketCap || 0) > 10000000000); // 10K-1L Cr
    }
    
    return filtered;
  };

  const getTopGainers = (): MoverData[] => {
    return getFilteredStocks()
      .filter(stock => stock.changePercent > 0)
      .map((stock, index) => ({
        ...stock,
        rank: index + 1,
        momentum: getMomentum(stock.changePercent, getVolumeRatio(stock)),
        volumeRatio: getVolumeRatio(stock)
      }))
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 10);
  };

  const getTopLosers = (): MoverData[] => {
    return getFilteredStocks()
      .filter(stock => stock.changePercent < 0)
      .map((stock, index) => ({
        ...stock,
        rank: index + 1,
        momentum: getMomentum(stock.changePercent, getVolumeRatio(stock)),
        volumeRatio: getVolumeRatio(stock)
      }))
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 10);
  };

  const getMostActive = (): MoverData[] => {
    return getFilteredStocks()
      .map((stock, index) => ({
        ...stock,
        rank: index + 1,
        momentum: getMomentum(stock.changePercent, getVolumeRatio(stock)),
        volumeRatio: getVolumeRatio(stock)
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);
  };

  const getUnusualActivity = (): MoverData[] => {
    return getFilteredStocks()
      .map((stock, index) => ({
        ...stock,
        rank: index + 1,
        momentum: getMomentum(stock.changePercent, getVolumeRatio(stock)),
        volumeRatio: getVolumeRatio(stock)
      }))
      .filter(stock => stock.volumeRatio > 2) // Unusual volume
      .sort((a, b) => b.volumeRatio - a.volumeRatio)
      .slice(0, 10);
  };

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case 'strong': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const MoverCard: React.FC<{ mover: MoverData; showVolume?: boolean }> = ({ mover, showVolume = false }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
          {mover.rank}
        </div>
        <div>
          <h3 className="font-semibold">{mover.symbol}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{mover.name}</p>
          {mover.sector && (
            <Badge variant="outline" className="text-xs mt-1">{mover.sector}</Badge>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-lg font-bold">₹{mover.price.toFixed(2)}</p>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${mover.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {mover.changePercent >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span className="text-sm font-medium">
              {mover.changePercent > 0 ? '+' : ''}{mover.changePercent.toFixed(2)}%
            </span>
          </div>
          <Badge className={getMomentumColor(mover.momentum)}>
            {mover.momentum}
          </Badge>
        </div>
        {showVolume && (
          <p className="text-xs text-muted-foreground mt-1">
            Vol: {(mover.volume / 1000000).toFixed(1)}M ({mover.volumeRatio.toFixed(1)}x)
          </p>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="minimal-card">
        <CardHeader>
          <CardTitle>Market Movers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="minimal-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Market Movers
            </CardTitle>
            <CardDescription>
              Top performing and most active stocks
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={category} onValueChange={(value: any) => setCategory(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stocks</SelectItem>
                <SelectItem value="largecap">Large Cap</SelectItem>
                <SelectItem value="midcap">Mid Cap</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1D</SelectItem>
                <SelectItem value="1w">1W</SelectItem>
                <SelectItem value="1m">1M</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gainers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gainers" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Gainers
            </TabsTrigger>
            <TabsTrigger value="losers" className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Losers
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-1">
              <Volume2 className="h-3 w-3" />
              Most Active
            </TabsTrigger>
            <TabsTrigger value="unusual" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Unusual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gainers">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-green-600">Top Gainers</h3>
                <Badge variant="outline" className="text-green-600">
                  {getTopGainers().length} stocks
                </Badge>
              </div>
              {getTopGainers().map((mover) => (
                <MoverCard key={mover.symbol} mover={mover} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="losers">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-red-600">Top Losers</h3>
                <Badge variant="outline" className="text-red-600">
                  {getTopLosers().length} stocks
                </Badge>
              </div>
              {getTopLosers().map((mover) => (
                <MoverCard key={mover.symbol} mover={mover} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-blue-600">Most Active</h3>
                <Badge variant="outline" className="text-blue-600">
                  {getMostActive().length} stocks
                </Badge>
              </div>
              {getMostActive().map((mover) => (
                <MoverCard key={mover.symbol} mover={mover} showVolume />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="unusual">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-purple-600">Unusual Activity</h3>
                <Badge variant="outline" className="text-purple-600">
                  {getUnusualActivity().length} stocks
                </Badge>
              </div>
              {getUnusualActivity().length > 0 ? (
                getUnusualActivity().map((mover) => (
                  <MoverCard key={mover.symbol} mover={mover} showVolume />
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No unusual activity detected</p>
                  <p className="text-sm text-muted-foreground">Stocks with 2x+ normal volume will appear here</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MarketMovers;