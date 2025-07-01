"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import StockCard from '@/components/stock-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Zap
} from 'lucide-react';
import { StockData } from '@/lib/stocks';
import { NewsItem } from '@/lib/news';
import { toast } from 'sonner';

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

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch market overview
      const overviewResponse = await fetch('/api/market/overview');
      const overviewData = await overviewResponse.json();
      setMarketOverview(overviewData.marketOverview);

      // Fetch stocks data with filter
      const stocksUrl = `/api/stocks/all?filter=${selectedFilter}${selectedSector !== 'all' ? `&sector=${selectedSector}` : ''}`;
      const stocksResponse = await fetch(stocksUrl);
      const stocksData = await stocksResponse.json();
      setStocks(stocksData.stocks || []);

      // Fetch sector analysis
      const sectorsResponse = await fetch('/api/stocks/sectors');
      const sectorsData = await sectorsResponse.json();
      setSectorAnalysis(sectorsData.sectors || []);

      // Fetch news
      const newsResponse = await fetch('/api/news?limit=10');
      const newsData = await newsResponse.json();
      setNews(newsData.news || []);

      // Fetch user watchlist
      const watchlistResponse = await fetch('/api/watchlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (watchlistResponse.ok) {
        const watchlistData = await watchlistResponse.json();
        setWatchlist(watchlistData.watchlist || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
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

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success('Data refreshed successfully');
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

  const watchedStocks = stocks.filter(stock => watchlist.includes(stock.symbol));

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

        {/* Market Overview Cards */}
        {marketOverview && (
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="stocks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="stocks">Nifty 50 Stocks</TabsTrigger>
            <TabsTrigger value="sectors">Sector Analysis</TabsTrigger>
            <TabsTrigger value="news">Market News</TabsTrigger>
            <TabsTrigger value="watchlist">My Watchlist</TabsTrigger>
          </TabsList>

          <TabsContent value="stocks" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="sectors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectorAnalysis.map((sector) => (
                <Card key={sector.sector} className="minimal-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{sector.sector}</span>
                      <Badge className={`${sector.sentiment.label === 'positive' ? 'sentiment-positive' :
                        sector.sentiment.label === 'negative' ? 'sentiment-negative' : 'sentiment-neutral'
                        }`}>
                        {sector.sentiment.label}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {sector.stockCount} stocks • {sector.totalWeightage.toFixed(1)}% weightage
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Performance</span>
                        <span className={sector.avgChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {sector.avgChange > 0 ? '+' : ''}{sector.avgChange.toFixed(2)}%
                        </span>
                      </div>
                      <Progress value={Math.abs(sector.avgChange) * 10} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-green-600 font-semibold">{sector.gainers}</div>
                        <div className="text-xs text-muted-foreground">Gainers</div>
                      </div>
                      <div>
                        <div className="text-red-600 font-semibold">{sector.losers}</div>
                        <div className="text-xs text-muted-foreground">Losers</div>
                      </div>
                      <div>
                        <div className="text-yellow-600 font-semibold">{sector.neutral}</div>
                        <div className="text-xs text-muted-foreground">Neutral</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Top Movers</div>
                      <div className="space-y-1">
                        {sector.topStocks.map((stock) => (
                          <div key={stock.symbol} className="flex justify-between text-xs">
                            <span>{stock.symbol}</span>
                            <span className={stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {news.map((item) => (
                <Card key={item.id} className="minimal-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {item.source} • {new Date(item.publishedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className={`ml-2 ${item.sentiment?.label === 'positive' ? 'sentiment-positive' :
                        item.sentiment?.label === 'negative' ? 'sentiment-negative' : 'sentiment-neutral'
                        }`}>
                        {item.sentiment?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {item.description}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="watchlist" className="space-y-6">
            {watchedStocks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {watchedStocks.map((stock) => (
                  <StockCard
                    key={stock.symbol}
                    stock={stock}
                    isWatched={true}
                    onToggleWatch={() => handleToggleWatch(stock.symbol)}
                  />
                ))}
              </div>
            ) : (
              <Card className="minimal-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No stocks in watchlist</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Add stocks to your watchlist to track them here
                  </p>
                  <Button onClick={() => router.push('/stocks')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Stocks
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}