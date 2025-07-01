"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, RefreshCw } from 'lucide-react';
import { StockData } from '@/lib/stocks';

interface MarketHeatmapProps {
  stocks: StockData[];
  isLoading?: boolean;
}

const MarketHeatmap: React.FC<MarketHeatmapProps> = ({ stocks, isLoading }) => {
  const [viewMode, setViewMode] = useState<'change' | 'volume' | 'marketCap'>('change');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  const sectors = ['all', ...Array.from(new Set(stocks.map(stock => stock.sector).filter(Boolean)))];

  const filteredStocks = sectorFilter === 'all' 
    ? stocks 
    : stocks.filter(stock => stock.sector === sectorFilter);

  const getHeatmapColor = (stock: StockData) => {
    switch (viewMode) {
      case 'change':
        const changePercent = stock.changePercent;
        if (changePercent > 3) return 'bg-green-600';
        if (changePercent > 1) return 'bg-green-400';
        if (changePercent > 0) return 'bg-green-200';
        if (changePercent > -1) return 'bg-red-200';
        if (changePercent > -3) return 'bg-red-400';
        return 'bg-red-600';
      
      case 'volume':
        const volume = stock.volume;
        if (volume > 50000000) return 'bg-blue-600';
        if (volume > 20000000) return 'bg-blue-400';
        if (volume > 5000000) return 'bg-blue-200';
        return 'bg-gray-200';
      
      case 'marketCap':
        const marketCap = stock.marketCap || 0;
        if (marketCap > 500000000000) return 'bg-purple-600';
        if (marketCap > 100000000000) return 'bg-purple-400';
        if (marketCap > 50000000000) return 'bg-purple-200';
        return 'bg-gray-200';
      
      default:
        return 'bg-gray-200';
    }
  };

  const getTextColor = (stock: StockData) => {
    const bgColor = getHeatmapColor(stock);
    return bgColor.includes('600') || bgColor.includes('400') ? 'text-white' : 'text-gray-900';
  };

  const getDisplayValue = (stock: StockData) => {
    switch (viewMode) {
      case 'change':
        return `${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`;
      case 'volume':
        return `${(stock.volume / 1000000).toFixed(1)}M`;
      case 'marketCap':
        return `₹${((stock.marketCap || 0) / 10000000).toFixed(0)}Cr`;
      default:
        return '';
    }
  };

  const getSize = (stock: StockData) => {
    // Size based on market cap weightage
    const weightage = stock.weightage || 1;
    if (weightage > 8) return 'col-span-3 row-span-2';
    if (weightage > 4) return 'col-span-2 row-span-2';
    if (weightage > 2) return 'col-span-2';
    return 'col-span-1';
  };

  if (isLoading) {
    return (
      <Card className="minimal-card">
        <CardHeader>
          <CardTitle>Market Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-2 h-96">
            {[...Array(32)].map((_, i) => (
              <div key={i} className="bg-muted animate-pulse rounded aspect-square" />
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
              <BarChart3 className="h-5 w-5" />
              Market Heatmap
            </CardTitle>
            <CardDescription>
              Visual representation of stock performance
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>
                    {sector === 'all' ? 'All Sectors' : sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="change">Change %</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="marketCap">Market Cap</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            {viewMode === 'change' && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span>Strong Gain (+3%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 rounded"></div>
                  <span>Gain (0-1%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 rounded"></div>
                  <span>Loss (0-1%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>Strong Loss (-3%)</span>
                </div>
              </>
            )}
            {viewMode === 'volume' && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>High Volume (50M+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-200 rounded"></div>
                  <span>Low Volume (&lt;5M)</span>
                </div>
              </>
            )}
            {viewMode === 'marketCap' && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-600 rounded"></div>
                  <span>Large Cap (₹5L Cr+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-200 rounded"></div>
                  <span>Mid Cap (₹50K-1L Cr)</span>
                </div>
              </>
            )}
          </div>
          <Badge variant="outline">
            {filteredStocks.length} stocks
          </Badge>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-8 gap-2 min-h-96">
          {filteredStocks.map((stock) => (
            <div
              key={stock.symbol}
              className={`
                ${getHeatmapColor(stock)} 
                ${getTextColor(stock)} 
                ${getSize(stock)}
                rounded-lg p-2 flex flex-col justify-between
                hover:scale-105 transition-transform cursor-pointer
                min-h-16
              `}
              title={`${stock.name} - ${getDisplayValue(stock)}`}
            >
              <div className="font-bold text-xs">{stock.symbol}</div>
              <div className="text-xs opacity-90">{getDisplayValue(stock)}</div>
              <div className="text-xs opacity-75">₹{stock.price.toFixed(0)}</div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {filteredStocks.filter(s => s.change > 0).length}
            </div>
            <div className="text-sm text-muted-foreground">Gainers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {filteredStocks.filter(s => s.change < 0).length}
            </div>
            <div className="text-sm text-muted-foreground">Losers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredStocks.filter(s => s.change === 0).length}
            </div>
            <div className="text-sm text-muted-foreground">Unchanged</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketHeatmap;