"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import StockCard from '@/components/stock-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowUpDown,
  Building2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StockData } from '@/lib/stocks';
import { toast } from 'sonner';

export default function StocksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'gainers' | 'losers'>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change' | 'sentiment'>('name');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchStocksData();
    }
  }, [user]);

  const fetchStocksData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stocks/all');
      const data = await response.json();
      setStocks(data.stocks || data || []);

      if (user) {
        setWatchlist(user.watchlist || []);
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast.error('Failed to fetch stocks data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleWatch = async (symbol: string) => {
    try {
      const method = watchlist.includes(symbol) ? 'DELETE' : 'POST';
      const response = await fetch('/api/watchlist', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ symbol })
      });

      if (response.ok) {
        if (watchlist.includes(symbol)) {
          setWatchlist(watchlist.filter(s => s !== symbol));
          toast.success(`Removed ${symbol} from watchlist`);
        } else {
          setWatchlist([...watchlist, symbol]);
          toast.success(`Added ${symbol} to watchlist`);
        }
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast.error('Failed to update watchlist');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen main-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Updated sector classification for Nifty 50 stocks
  const getSector = (symbol: string): string => {
    const sectorMap: { [key: string]: string } = {
      // Banking & Financial Services
      'HDFCBANK': 'Banking', 'ICICIBANK': 'Banking', 'SBIN': 'Banking', 'KOTAKBANK': 'Banking',
      'AXISBANK': 'Banking', 'INDUSINDBK': 'Banking', 'BAJFINANCE': 'Financial Services',
      'BAJAJFINSV': 'Financial Services', 'SBILIFE': 'Insurance', 'HDFCLIFE': 'Insurance',
      'ICICIPRULI': 'Insurance', 'POWERGRID': 'Power',

      // IT Sector
      'TCS': 'IT', 'INFY': 'IT', 'WIPRO': 'IT', 'HCLTECH': 'IT', 'TECHM': 'IT', 'LTIM': 'IT', 'PERSISTENT': 'IT',

      // Oil & Gas
      'RELIANCE': 'Oil & Gas', 'ONGC': 'Oil & Gas', 'IOC': 'Oil & Gas', 'BPCL': 'Oil & Gas',

      // Automotive
      'MARUTI': 'Automotive', 'TATAMOTORS': 'Automotive', 'M&M': 'Automotive', 'EICHERMOT': 'Automotive',
      'HEROMOTOCO': 'Automotive',

      // FMCG
      'HINDUNILVR': 'FMCG', 'ITC': 'FMCG', 'NESTLEIND': 'FMCG', 'BRITANNIA': 'FMCG',

      // Metals & Mining
      'TATASTEEL': 'Metals', 'JSWSTEEL': 'Metals', 'HINDALCO': 'Metals', 'COALINDIA': 'Mining',

      // Telecom
      'BHARTIARTL': 'Telecom', 'IDEA': 'Telecom',

      // Infrastructure & Power
      'LT': 'Infrastructure', 'NTPC': 'Power',

      // Consumer Goods
      'TITAN': 'Consumer Goods', 'ASIANPAINT': 'Consumer Goods',

      // Pharma
      'SUNPHARMA': 'Pharma', 'DRREDDY': 'Pharma',

      // Cement
      'ULTRACEMCO': 'Cement', 'SHREECEM': 'Cement',

      // Adani Group
      'ADANIENT': 'Diversified', 'ADANIPORTS': 'Infrastructure'
    };
    return sectorMap[symbol] || 'Others';
  };

  // Ensure stocks is an array before mapping
  const stocksArray = Array.isArray(stocks) ? stocks : [];
  const sectors = ['all', ...Array.from(new Set(stocksArray.map(stock => getSector(stock.symbol))))];

  const filteredStocks = stocksArray
    .filter(stock => {
      const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filter === 'all' ||
        (filter === 'gainers' && stock.change > 0) ||
        (filter === 'losers' && stock.change < 0);

      const matchesSector = sectorFilter === 'all' || getSector(stock.symbol) === sectorFilter;

      return matchesSearch && matchesFilter && matchesSector;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price;
        case 'change':
          return b.changePercent - a.changePercent;
        case 'sentiment':
          return (b as any).sentiment?.score - (a as any).sentiment?.score || 0;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="min-h-screen main-bg">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Stock Market
          </h1>
          <p className="text-muted-foreground">
            Track and analyze Indian stocks with real-time sentiment analysis
          </p>
        </div>

        {/* Filters */}
        <Card className="minimal-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search stocks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 min-w-64"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={filter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={filter === 'gainers' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('gainers')}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Gainers
                    </Button>
                    <Button
                      variant={filter === 'losers' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('losers')}
                    >
                      <TrendingDown className="h-4 w-4 mr-1" />
                      Losers
                    </Button>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchStocksData}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Select value={sectorFilter} onValueChange={setSectorFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map(sector => (
                        <SelectItem key={sector} value={sector}>
                          {sector === 'all' ? 'All Sectors' : sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="change">Change %</SelectItem>
                      <SelectItem value="sentiment">Sentiment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Badge variant="secondary" className="self-start">
                  {filteredStocks.length} stocks found
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="minimal-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Stocks</p>
                  <p className="text-2xl font-bold">{stocksArray.length}</p>
                </div>
                <div className="text-muted-foreground">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="minimal-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gainers</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stocksArray.filter(s => s.change > 0).length}
                  </p>
                </div>
                <div className="text-green-600">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="minimal-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Losers</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stocksArray.filter(s => s.change < 0).length}
                  </p>
                </div>
                <div className="text-red-600">
                  <TrendingDown className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="minimal-card animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredStocks.length === 0 ? (
          <Card className="minimal-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No stocks found
              </h3>
              <p className="text-muted-foreground text-center">
                Try adjusting your search terms or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                isWatched={watchlist.includes(stock.symbol)}
                onToggleWatch={handleToggleWatch}
                sentiment={stock.sentiment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}