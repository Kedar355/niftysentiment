"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
  Users,
  Globe,
  Target,
  Zap
} from 'lucide-react';

interface MarketOverviewProps {
  data: {
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
  };
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ data }) => {
  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive':
        return 'sentiment-positive';
      case 'negative':
        return 'sentiment-negative';
      default:
        return 'sentiment-neutral';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) {
      return (num / 1e12).toFixed(2) + 'T';
    } else if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toLocaleString();
  };

  const gainerPercentage = (data.gainers / data.totalStocks) * 100;
  const loserPercentage = (data.losers / data.totalStocks) * 100;
  const unchangedPercentage = (data.unchanged / data.totalStocks) * 100;

  return (
    <div className="space-y-6">
      {/* Main Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="minimal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Market Sentiment
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.marketSentiment.score.toFixed(1)}/10
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={getSentimentColor(data.marketSentiment.label)}>
                {data.marketSentiment.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {(data.marketSentiment.confidence * 100).toFixed(0)}% confidence
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
              {data.avgChange > 0 ? '+' : ''}{data.avgChange.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.gainers} gainers, {data.losers} losers
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
              ₹{formatNumber(data.totalMarketCap)}
            </div>
            <p className="text-xs text-muted-foreground">
              across {data.totalStocks} stocks
            </p>
          </CardContent>
        </Card>

        <Card className="minimal-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Volume
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.totalVolume)}
            </div>
            <p className="text-xs text-muted-foreground">
              shares traded today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Market Distribution */}
      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Market Distribution</span>
          </CardTitle>
          <CardDescription>
            Distribution of stocks by performance today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.gainers}</div>
              <div className="text-sm text-muted-foreground">Gainers</div>
              <div className="text-xs text-muted-foreground">
                {gainerPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{data.losers}</div>
              <div className="text-sm text-muted-foreground">Losers</div>
              <div className="text-xs text-muted-foreground">
                {loserPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{data.unchanged}</div>
              <div className="text-sm text-muted-foreground">Unchanged</div>
              <div className="text-xs text-muted-foreground">
                {unchangedPercentage.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Gainers</span>
              </span>
              <span>{gainerPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={gainerPercentage} className="h-2" />

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Losers</span>
              </span>
              <span>{loserPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={loserPercentage} className="h-2" />

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Unchanged</span>
              </span>
              <span>{unchangedPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={unchangedPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Market Sentiment Details */}
      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Market Sentiment Analysis</span>
          </CardTitle>
          <CardDescription>
            AI-powered sentiment analysis of market conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Sentiment</span>
            <Badge className={getSentimentColor(data.marketSentiment.label)}>
              {data.marketSentiment.label}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Sentiment Score</span>
              <span className="font-medium">{data.marketSentiment.score.toFixed(1)}/10</span>
            </div>
            <Progress
              value={data.marketSentiment.score * 10}
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Confidence Level</span>
              <span className="font-medium">{(data.marketSentiment.confidence * 100).toFixed(0)}%</span>
            </div>
            <Progress
              value={data.marketSentiment.confidence * 100}
              className="h-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {data.avgChange > 0 ? '+' : ''}{data.avgChange.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground">Average Change</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {data.totalStocks}
              </div>
              <div className="text-xs text-muted-foreground">Total Stocks</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketOverview; 