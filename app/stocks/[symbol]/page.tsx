"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import StockChart from '@/components/stock-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Star,
  StarOff,
  ArrowLeft,
  DollarSign,
  BarChart3,
  Activity,
  Calendar
} from 'lucide-react';
import { StockData, StockHistory } from '@/lib/stocks';
import { NewsItem } from '@/lib/news';
import { toast } from 'sonner';

export default function StockDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const symbol = params.symbol as string;

  const [stock, setStock] = useState<StockData | null>(null);
  const [history, setHistory] = useState<StockHistory[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isWatched, setIsWatched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('1mo');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && symbol) {
      fetchStockData();
      fetchStockHistory();
      fetchStockNews();
    }
  }, [user, symbol, period]);

  const fetchStockData = async () => {
    try {
      const response = await fetch(`/api/stocks/${symbol}`);
      const data = await response.json();
      setStock(data);

      if (user) {
        setIsWatched(user.watchlist?.includes(symbol) || false);
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      toast.error('Failed to fetch stock data');
    }
  };

  const fetchStockHistory = async () => {
    try {
      const response = await fetch(`/api/stocks/${symbol}/history?period=${period}`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching stock history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStockNews = async () => {
    try {
      const response = await fetch(`/api/news?symbol=${symbol}`);
      const data = await response.json();
      setNews(data.news || data || []);
    } catch (error) {
      console.error('Error fetching stock news:', error);
      setNews([]);
    }
  };

  const handleToggleWatch = async () => {
    try {
      const method = isWatched ? 'DELETE' : 'POST';
      const response = await fetch('/api/watchlist', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ symbol })
      });

      if (response.ok) {
        setIsWatched(!isWatched);
        toast.success(isWatched ? `Removed ${symbol} from watchlist` : `Added ${symbol} to watchlist`);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast.error('Failed to update watchlist');
    }
  };

  if (loading || !user || isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6">
          <Card className="glass border-white/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-semibold text-white mb-2">
                Stock not found
              </h3>
              <p className="text-gray-400 text-center mb-4">
                The stock symbol "{symbol}" was not found
              </p>
              <Button onClick={() => router.push('/stocks')}>
                Back to Stocks
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isPositive = stock.change >= 0;

  const sentiment = stock.sentiment || {
    label: stock.changePercent > 2 ? 'positive' :
      stock.changePercent < -2 ? 'negative' : 'neutral',
    score: Math.max(0, Math.min(10, 5 + stock.changePercent * 0.5)),
    confidence: 0.6 + Math.abs(stock.changePercent) * 0.05
  };

  const newsArray = Array.isArray(news) ? news : [];

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/stocks')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {stock.symbol}
              </h1>
              <p className="text-gray-300">{stock.name}</p>
            </div>
          </div>

          <Button
            variant={isWatched ? "default" : "outline"}
            onClick={handleToggleWatch}
            className={isWatched ? "bg-yellow-500 hover:bg-yellow-600" : "border-white/20 text-white hover:bg-white/10"}
          >
            {isWatched ? (
              <>
                <Star className="h-4 w-4 mr-2 fill-current" />
                Watching
              </>
            ) : (
              <>
                <StarOff className="h-4 w-4 mr-2" />
                Add to Watchlist
              </>
            )}
          </Button>
        </div>

        {/* Stock Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Current Price
              </CardTitle>
              <DollarSign className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ₹{stock.price.toFixed(2)}
              </div>
              <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Day Range
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ₹{stock.dayLow.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400">
                to ₹{stock.dayHigh.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Volume
              </CardTitle>
              <Activity className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {(stock.volume / 1000000).toFixed(2)}M
              </div>
              <p className="text-xs text-gray-400">
                shares traded
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-200">
                Sentiment
              </CardTitle>
              <Activity className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {sentiment.score.toFixed(1)}/10
              </div>
              <Badge className={`${sentiment.label === 'positive' ? 'sentiment-positive' :
                sentiment.label === 'negative' ? 'sentiment-negative' : 'sentiment-neutral'
                }`}>
                {sentiment.label}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Chart and Analysis */}
        <Tabs defaultValue="chart" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            <TabsTrigger value="chart" className="data-[state=active]:bg-blue-500/20">
              Price Chart
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-blue-500/20">
              News & Analysis
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-blue-500/20">
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-6">
            <div className="flex space-x-2 mb-4">
              {['1w', '1mo', '3mo', '1y'].map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className={period === p ? 'bg-blue-500 hover:bg-blue-600' : 'border-white/20 text-white hover:bg-white/10'}
                >
                  {p}
                </Button>
              ))}
            </div>
            <StockChart
              data={history}
              title={`${stock.symbol} Price History`}
              color={isPositive ? '#10B981' : '#EF4444'}
            />
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <div className="grid gap-6">
              {newsArray.length === 0 ? (
                <Card className="glass border-white/20">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      No news available
                    </h3>
                    <p className="text-gray-400 text-center">
                      No recent news found for {stock.symbol}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                newsArray.map((item) => (
                  <Card key={item.id} className="glass border-white/20">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-white mb-2 flex-1 mr-4">
                          {item.title}
                        </h3>
                        {item.sentiment && (
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={`${item.sentiment.label === 'positive' ? 'sentiment-positive' :
                              item.sentiment.label === 'negative' ? 'sentiment-negative' : 'sentiment-neutral'
                              }`}>
                              {item.sentiment.label}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              Score: {item.sentiment.score?.toFixed(1) || 'N/A'}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-300 mb-4 line-clamp-3">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{item.source}</span>
                          <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                          {item.category && (
                            <Badge variant="outline" className="text-xs border-white/20">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(item.url, '_blank')}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Read More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Stock Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Symbol</span>
                    <span className="text-white font-medium">{stock.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Company Name</span>
                    <span className="text-white font-medium">{stock.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Previous Close</span>
                    <span className="text-white font-medium">₹{stock.previousClose.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Day's Range</span>
                    <span className="text-white font-medium">
                      ₹{stock.dayLow.toFixed(2)} - ₹{stock.dayHigh.toFixed(2)}
                    </span>
                  </div>
                  {stock.marketCap && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Market Cap</span>
                      <span className="text-white font-medium">
                        ₹{(stock.marketCap / 1e9).toFixed(2)}B
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Sentiment Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Overall Sentiment</span>
                    <Badge className={`${sentiment.label === 'positive' ? 'sentiment-positive' :
                      sentiment.label === 'negative' ? 'sentiment-negative' : 'sentiment-neutral'
                      }`}>
                      {sentiment.label}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sentiment Score</span>
                    <span className="text-white font-medium">{sentiment.score.toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confidence</span>
                    <span className="text-white font-medium">{(sentiment.confidence * 100).toFixed(0)}%</span>
                  </div>

                  {/* Enhanced sentiment details if available */}
                  {(sentiment as any).trend && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trend</span>
                      <span className="text-white font-medium capitalize">{(sentiment as any).trend}</span>
                    </div>
                  )}

                  {(sentiment as any).strength && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Strength</span>
                      <span className="text-white font-medium capitalize">{(sentiment as any).strength}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Sentiment Strength</span>
                      <span className="text-white">{(sentiment.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${sentiment.label === 'positive' ? 'bg-green-400' :
                          sentiment.label === 'negative' ? 'bg-red-400' : 'bg-yellow-400'
                          }`}
                        style={{ width: `${(sentiment.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Detailed sentiment breakdown if available */}
                  {(sentiment as any).details && (
                    <div className="pt-4 border-t border-gray-700">
                      <h4 className="text-sm font-medium text-white mb-3">Detailed Breakdown</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Price Sentiment:</span>
                          <span className="text-white">{(sentiment as any).details.priceSentiment.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Volume Sentiment:</span>
                          <span className="text-white">{(sentiment as any).details.volumeSentiment.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Volatility Sentiment:</span>
                          <span className="text-white">{(sentiment as any).details.volatilitySentiment.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Momentum Sentiment:</span>
                          <span className="text-white">{(sentiment as any).details.momentumSentiment.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}