"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import StockCard from '@/components/stock-card';
import MarketIndicesWidget from '@/components/market-indices-widget';
import MarketHeatmap from '@/components/market-heatmap';
import MarketMovers from '@/components/market-movers';
import PriceAlerts from '@/components/price-alerts';
import TechnicalScanner from '@/components/technical-scanner';
import PortfolioTracker from '@/components/portfolio-tracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StockCardSkeleton, MarketOverviewSkeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
  Bell,
  Plus,
  RefreshCw,
  Globe,
  Building2,
  Newspaper,
  Target,
  Users,
  Zap,
  Search,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { StockData } from '@/lib/stocks';
import { NewsItem } from '@/lib/news';
import { toast } from 'sonner';
import Link from 'next/link';

interface MarketOverview {
  totalStocks: number;
  gainers: number;
  losers: number;
  unchanged: number;
  avgChange: number;
  totalMarketCap: number;
  totalVolume: number;
  marketSentiment: {
    label: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
  };
}

interface SectorAnalysis {
  sector: string;
  stockCount: number;
  totalWeightage: number;
  avgChange: number;
  gainers: number;
  losers: number;
  neutral: number;
  totalVolume: number;
  avgPrice: number;
  sentiment: {
    label: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
  };
  topStocks: Array<{
    symbol: string;
    name: string;
    changePercent: number;
    price: number;
  }>;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
  const [sectorAnalysis, setSectorAnalysis] = useState<SectorAnalysis[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchDashboardData();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch all data in parallel for better performance
      const [overviewResponse, stocksResponse, sectorsResponse, newsResponse, watchlistResponse] = await Promise.allSettled([
        fetch('/api/market/overview'),
        fetch(`/api/stocks/all?filter=${selectedFilter}${selectedSector !== 'all' ? `&sector=${selectedSector}` : ''}`),
        fetch('/api/stocks/sectors'),
        fetch('/api/news?limit=10'),
        fetch('/api/watchlist', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      // Handle market overview
      if (overviewResponse.status === 'fulfilled' && overviewResponse.value.ok) {
        const overviewData = await overviewResponse.value.json();
        setMarketOverview(overviewData.marketOverview);
      }

      // Handle stocks data
      if (stocksResponse.status === 'fulfilled' && stocksResponse.value.ok) {
        const stocksData = await stocksResponse.value.json();
        setStocks(stocksData.stocks || []);
      }

      // Handle sector analysis
      if (sectorsResponse.status === 'fulfilled' && sectorsResponse.value.ok) {
        const sectorsData = await sectorsResponse.value.json();
        setSectorAnalysis(sectorsData.sectors || []);
      }

      // Handle news
      if (newsResponse.status === 'fulfilled' && newsResponse.value.ok) {
        const newsData = await newsResponse.value.json();
        setNews(newsData.news || []);
      }

      // Handle watchlist
      if (watchlistResponse.status === 'fulfilled' && watchlistResponse.value.ok) {
        const watchlistData = await watchlistResponse.value.json();
        setWatchlist(watchlistData.watchlist || []);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilter, selectedSector, user]);

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

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success('Data refreshed successfully');
  };

  // Memoized calculations for performance
  const watchedStocks = useMemo(() => 
    stocks.filter(stock => watchlist.includes(stock.symbol)), 
    [stocks, watchlist]
  );

  const marketStats = useMemo(() => {
    if (!marketOverview) return null;
    
    return {
      totalStocks: marketOverview.totalStocks,
      gainersPercent: (marketOverview.gainers / marketOverview.totalStocks) * 100,
      losersPercent: (marketOverview.losers / marketOverview.totalStocks) * 100,
      unchangedPercent: (marketOverview.unchanged / marketOverview.totalStocks) * 100
    };
  }, [marketOverview]);

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

  return (
    <div className="min-h-screen main-bg">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-muted-foreground">
                Nifty 50 Market Dashboard - Real-time insights and analysis
              </p>
              {lastUpdated && (
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <Zap className="h-4 w-4 mr-2" />
                Auto Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link href="/stocks/screener">
            <Card className="minimal-card hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Search className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold">Stock Screener</p>
                    <p className="text-sm text-muted-foreground">Advanced filtering</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/portfolio">
            <Card className="minimal-card hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <PieChart className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-semibold">Portfolio</p>
                    <p className="text-sm text-muted-foreground">Track holdings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/news">
            <Card className="minimal-card hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Newspaper className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-semibold">Market News</p>
                    <p className="text-sm text-muted-foreground">Latest updates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/performance">
            <Card className="minimal-card hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-semibold">Performance</p>
                    <p className="text-sm text-muted-foreground">App metrics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Market Overview Cards */}
        {isLoading ? (
          <MarketOverviewSkeleton />
        ) : marketOverview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="minimal-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Market Sentiment
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {marketOverview.marketSentiment.score.toFixed(1)}/10
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={`${marketOverview.marketSentiment.label === 'positive' ? 'sentiment-positive' :
                    marketOverview.marketSentiment.label === 'negative' ? 'sentiment-negative' : 'sentiment-neutral'
                    }`}>
                    {marketOverview.marketSentiment.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {(marketOverview.marketSentiment.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="minimal-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Nifty 50 Performance
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {marketOverview.avgChange > 0 ? '+' : ''}{marketOverview.avgChange.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {marketOverview.gainers} gainers, {marketOverview.losers} losers
                </p>
                {marketStats && (
                  <div className="mt-2">
                    <Progress value={marketStats.gainersPercent} className="h-1" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="minimal-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Market Cap
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{marketOverview.totalMarketCap.toLocaleString()}L
                </div>
                <p className="text-xs text-muted-foreground">
                  across {marketOverview.totalStocks} stocks
                </p>
              </CardContent>
            </Card>

            <Card className="minimal-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Watchlist
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {watchlist.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  stocks being tracked
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Market Indices Widget */}
        <div className="mb-8">
          <MarketIndicesWidget />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="movers">Movers</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MarketMovers stocks={stocks} isLoading={isLoading} />
              <Card className="minimal-card">
                <CardHeader>
                  <CardTitle>Sector Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {sectorAnalysis.slice(0, 6).map((sector) => (
                    <div key={sector.sector} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{sector.sector}</p>
                          <p className="text-sm text-muted-foreground">{sector.stockCount} stocks</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${sector.avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {sector.avgChange > 0 ? '+' : ''}{sector.avgChange.toFixed(2)}%
                        </p>
                        <Badge className={`${sector.sentiment.label === 'positive' ? 'sentiment-positive' :
                          sector.sentiment.label === 'negative' ? 'sentiment-negative' : 'sentiment-neutral'
                          }`}>
                          {sector.sentiment.label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stocks" className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter stocks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stocks</SelectItem>
                  <SelectItem value="gainers">Top Gainers</SelectItem>
                  <SelectItem value="losers">Top Losers</SelectItem>
                  <SelectItem value="active">Most Active</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectorAnalysis.map(sector => (
                    <SelectItem key={sector.sector} value={sector.sector}>
                      {sector.sector} ({sector.stockCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <StockCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stocks.map((stock) => (
                  <StockCard
                    key={stock.symbol}
                    stock={stock}
                    isWatched={watchlist.includes(stock.symbol)}
                    onToggleWatch={() => handleToggleWatch(stock.symbol)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-6">
            <MarketHeatmap stocks={stocks} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="movers" className="space-y-6">
            <MarketMovers stocks={stocks} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            <TechnicalScanner stocks={stocks} />
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <PortfolioTracker stocks={stocks} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <PriceAlerts watchlist={watchlist} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}