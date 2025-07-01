"use client"

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ExternalLink,
  Clock,
  Bookmark,
  BookmarkCheck,
  Filter,
  BarChart3,
  Newspaper
} from 'lucide-react';
import { NewsItem } from '@/lib/news';
import { getSentimentColor, getSentimentIcon } from '@/lib/sentiment';
import { toast } from 'sonner';

export default function NewsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [bookmarkedNews, setBookmarkedNews] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'sentiment'>('date');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchNews();
    }
  }, [user]);

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      setNews(data.news || data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to fetch news');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = (newsId: string) => {
    setBookmarkedNews(prev =>
      prev.includes(newsId)
        ? prev.filter(id => id !== newsId)
        : [...prev, newsId]
    );
  };

  const newsArray = Array.isArray(news) ? news : [];
  const categories = ['all', ...Array.from(new Set(newsArray.map(item => item.category).filter((cat): cat is string => Boolean(cat))))];
  const sources = ['all', ...Array.from(new Set(newsArray.map(item => item.source)))];

  if (loading || !user) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  const filteredNews = newsArray
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSentiment = selectedSentiment === 'all' ||
        item.sentiment?.label === selectedSentiment;

      const matchesCategory = selectedCategory === 'all' ||
        item.category === selectedCategory;

      const matchesSource = selectedSource === 'all' ||
        item.source === selectedSource;

      return matchesSearch && matchesSentiment && matchesCategory && matchesSource;
    })
    .sort((a, b) => {
      if (sortBy === 'sentiment') {
        return (b.sentiment?.score || 0) - (a.sentiment?.score || 0);
      }
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

  const bookmarkedNewsList = newsArray.filter(item => bookmarkedNews.includes(item.id));

  const NewsCard = ({ item }: { item: NewsItem }) => (
    <Card className="glass border-white/20 hover:bg-white/5 transition-colors group">
      {item.imageUrl && (
        <div className="aspect-video bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover rounded-t-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {item.source}
            </Badge>
            {item.category && (
              <Badge variant="outline" className="text-xs border-white/20">
                {item.category}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleBookmark(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
            >
              {bookmarkedNews.includes(item.id) ? (
                <BookmarkCheck className="h-4 w-4 text-blue-400" />
              ) : (
                <Bookmark className="h-4 w-4 text-gray-400" />
              )}
            </Button>
            {item.sentiment && (
              <Badge
                className={`${item.sentiment.label === 'positive' ? 'sentiment-positive' :
                  item.sentiment.label === 'negative' ? 'sentiment-negative' : 'sentiment-neutral'
                  } text-xs`}
              >
                {getSentimentIcon(item.sentiment.label)} {item.sentiment.score.toFixed(1)}
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-white text-lg leading-snug">
          {item.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 mb-4 line-clamp-3">
          {item.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(item.publishedAt).toLocaleDateString()} • {new Date(item.publishedAt).toLocaleTimeString()}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300 p-0 h-auto"
            onClick={() => window.open(item.url, '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Read more
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Market News & Analysis
          </h1>
          <p className="text-gray-300">
            Latest news with advanced sentiment analysis and real-time updates
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              All News
            </TabsTrigger>
            <TabsTrigger value="bookmarked" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Bookmarked ({bookmarkedNews.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Filters */}
            <Card className="glass border-white/20">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search news..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-w-64"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant={selectedSentiment === 'all' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedSentiment('all')}
                          className={selectedSentiment === 'all' ? 'bg-blue-500 hover:bg-blue-600' : 'border-white/20 text-white hover:bg-white/10'}
                        >
                          All
                        </Button>
                        <Button
                          variant={selectedSentiment === 'positive' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedSentiment('positive')}
                          className={selectedSentiment === 'positive' ? 'bg-green-500 hover:bg-green-600' : 'border-white/20 text-white hover:bg-white/10'}
                        >
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Positive
                        </Button>
                        <Button
                          variant={selectedSentiment === 'negative' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedSentiment('negative')}
                          className={selectedSentiment === 'negative' ? 'bg-red-500 hover:bg-red-600' : 'border-white/20 text-white hover:bg-white/10'}
                        >
                          <TrendingDown className="h-4 w-4 mr-1" />
                          Negative
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchNews}
                      disabled={isLoading}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10">
                        {categories.map(category => (
                          <SelectItem key={category} value={category} className="text-white">
                            {category === 'all' ? 'All Categories' : category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedSource} onValueChange={setSelectedSource}>
                      <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10">
                        {sources.map(source => (
                          <SelectItem key={source} value={source} className="text-white">
                            {source === 'all' ? 'All Sources' : source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10">
                        <SelectItem value="date" className="text-white">Latest First</SelectItem>
                        <SelectItem value="sentiment" className="text-white">Sentiment Score</SelectItem>
                      </SelectContent>
                    </Select>

                    <Badge variant="secondary" className="self-start">
                      {filteredNews.length} articles found
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>

            {filteredNews.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-400">No news found matching your criteria.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarked" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedNewsList.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>

            {bookmarkedNewsList.length === 0 && (
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No bookmarked news yet.</p>
                <p className="text-gray-500 text-sm">Click the bookmark icon on any news article to save it.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Positive News
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">
                    {news.filter(item => item.sentiment?.label === 'positive').length}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {((news.filter(item => item.sentiment?.label === 'positive').length / news.length) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                    Negative News
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-400">
                    {news.filter(item => item.sentiment?.label === 'negative').length}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {((news.filter(item => item.sentiment?.label === 'negative').length / news.length) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-yellow-400" />
                    Neutral News
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-400">
                    {news.filter(item => item.sentiment?.label === 'neutral').length}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {((news.filter(item => item.sentiment?.label === 'neutral').length / news.length) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}