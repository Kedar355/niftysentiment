"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Zap,
  RefreshCw,
  Download,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { StockData } from '@/lib/stocks';
import { AdvancedFilters, StockScreenerResult } from '@/lib/advanced-analytics';
import StockCard from './stock-card';
import { toast } from 'sonner';

interface AdvancedStockScreenerProps {
  onStockSelect?: (stock: StockData) => void;
  watchlist?: string[];
  onToggleWatch?: (symbol: string) => void;
}

const AdvancedStockScreener: React.FC<AdvancedStockScreenerProps> = ({
  onStockSelect,
  watchlist = [],
  onToggleWatch
}) => {
  const [filters, setFilters] = useState<AdvancedFilters>({});
  const [results, setResults] = useState<StockScreenerResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('changePercent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [savedScreens, setSavedScreens] = useState<Array<{name: string, filters: AdvancedFilters}>>([]);

  // Available sectors for filtering
  const sectors = [
    'Banking', 'IT', 'Oil & Gas', 'Automotive', 'FMCG', 'Metals', 
    'Telecom', 'Infrastructure', 'Consumer Goods', 'Pharma', 'Cement', 
    'Power', 'Financial Services', 'Insurance', 'Mining', 'Diversified'
  ];

  const sentimentOptions = ['positive', 'negative', 'neutral'];

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      performSearch();
    }
  }, [filters, sortBy, sortOrder, page]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stocks/screener', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters,
          sortBy,
          sortOrder,
          page,
          pageSize
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        toast.error('Failed to fetch screening results');
      }
    } catch (error) {
      console.error('Error performing stock screen:', error);
      toast.error('Error performing stock screen');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({});
    setResults(null);
    setPage(1);
  };

  const saveCurrentScreen = () => {
    const name = prompt('Enter a name for this screen:');
    if (name) {
      setSavedScreens(prev => [...prev, { name, filters }]);
      toast.success('Screen saved successfully');
    }
  };

  const loadSavedScreen = (savedFilters: AdvancedFilters) => {
    setFilters(savedFilters);
    setPage(1);
  };

  const exportResults = () => {
    if (!results) return;
    
    const csvContent = [
      ['Symbol', 'Name', 'Price', 'Change %', 'Volume', 'Market Cap', 'Sector'].join(','),
      ...results.stocks.map(stock => [
        stock.symbol,
        stock.name,
        stock.price,
        stock.changePercent,
        stock.volume,
        stock.marketCap || '',
        stock.sector || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_screen_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Advanced Stock Screener</h2>
          <p className="text-muted-foreground">Filter and analyze Nifty 50 stocks with advanced criteria</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveCurrentScreen} disabled={Object.keys(filters).length === 0}>
            <Settings className="h-4 w-4 mr-2" />
            Save Screen
          </Button>
          <Button variant="outline" onClick={exportResults} disabled={!results}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Saved Screens */}
      {savedScreens.length > 0 && (
        <Card className="minimal-card">
          <CardHeader>
            <CardTitle className="text-sm">Saved Screens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedScreens.map((screen, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => loadSavedScreen(screen.filters)}
                >
                  {screen.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="minimal-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                Advanced
                {showAdvancedFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </Button>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price Range */}
            <div className="space-y-2">
              <Label>Price Range (₹)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => updateFilter('priceRange', {
                    ...filters.priceRange,
                    min: parseFloat(e.target.value) || 0
                  })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange?.max || ''}
                  onChange={(e) => updateFilter('priceRange', {
                    ...filters.priceRange,
                    max: parseFloat(e.target.value) || Infinity
                  })}
                />
              </div>
            </div>

            {/* Change Range */}
            <div className="space-y-2">
              <Label>Change % Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min %"
                  value={filters.changeRange?.min || ''}
                  onChange={(e) => updateFilter('changeRange', {
                    ...filters.changeRange,
                    min: parseFloat(e.target.value) || -Infinity
                  })}
                />
                <Input
                  type="number"
                  placeholder="Max %"
                  value={filters.changeRange?.max || ''}
                  onChange={(e) => updateFilter('changeRange', {
                    ...filters.changeRange,
                    max: parseFloat(e.target.value) || Infinity
                  })}
                />
              </div>
            </div>

            {/* Sectors */}
            <div className="space-y-2">
              <Label>Sectors</Label>
              <Select
                value={filters.sectors?.join(',') || ''}
                onValueChange={(value) => updateFilter('sectors', value ? value.split(',') : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sectors" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sentiment */}
            <div className="space-y-2">
              <Label>Sentiment</Label>
              <Select
                value={filters.sentiment?.join(',') || ''}
                onValueChange={(value) => updateFilter('sentiment', value ? value.split(',') : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sentiment" />
                </SelectTrigger>
                <SelectContent>
                  {sentimentOptions.map(sentiment => (
                    <SelectItem key={sentiment} value={sentiment}>
                      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Market Cap Range */}
                <div className="space-y-2">
                  <Label>Market Cap Range (₹ Cr)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.marketCapRange?.min || ''}
                      onChange={(e) => updateFilter('marketCapRange', {
                        ...filters.marketCapRange,
                        min: parseFloat(e.target.value) || 0
                      })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.marketCapRange?.max || ''}
                      onChange={(e) => updateFilter('marketCapRange', {
                        ...filters.marketCapRange,
                        max: parseFloat(e.target.value) || Infinity
                      })}
                    />
                  </div>
                </div>

                {/* Volume Range */}
                <div className="space-y-2">
                  <Label>Volume Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.volumeRange?.min || ''}
                      onChange={(e) => updateFilter('volumeRange', {
                        ...filters.volumeRange,
                        min: parseFloat(e.target.value) || 0
                      })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.volumeRange?.max || ''}
                      onChange={(e) => updateFilter('volumeRange', {
                        ...filters.volumeRange,
                        max: parseFloat(e.target.value) || Infinity
                      })}
                    />
                  </div>
                </div>

                {/* P/E Range */}
                <div className="space-y-2">
                  <Label>P/E Ratio Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.peRange?.min || ''}
                      onChange={(e) => updateFilter('peRange', {
                        ...filters.peRange,
                        min: parseFloat(e.target.value) || 0
                      })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.peRange?.max || ''}
                      onChange={(e) => updateFilter('peRange', {
                        ...filters.peRange,
                        max: parseFloat(e.target.value) || Infinity
                      })}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Search Button */}
          <div className="flex justify-center">
            <Button onClick={performSearch} disabled={isLoading} className="min-w-32">
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Searching...' : 'Search Stocks'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card className="minimal-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  Found {results.totalCount} stocks matching your criteria
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>Sort by:</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="changePercent">Change %</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="marketCap">Market Cap</SelectItem>
                      <SelectItem value="sentiment">Sentiment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {results.stocks.map((stock) => (
                <StockCard
                  key={stock.symbol}
                  stock={stock}
                  isWatched={watchlist.includes(stock.symbol)}
                  onToggleWatch={onToggleWatch}
                  onClick={() => onStockSelect?.(stock)}
                />
              ))}
            </div>

            {/* Pagination */}
            {results.totalCount > pageSize && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, results.totalCount)} of {results.totalCount} results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page * pageSize >= results.totalCount}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedStockScreener;