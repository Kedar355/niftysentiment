"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StockData } from '@/lib/stocks';
import { TrendingUp, TrendingDown, Star, StarOff, Building2, Target, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { getSentimentIcon, getTrendIcon, getStrengthColor } from '@/lib/sentiment';

interface StockCardProps {
  stock: StockData;
  isWatched?: boolean;
  onToggleWatch?: (symbol: string) => void;
  sentiment?: {
    label: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
    trend?: 'bullish' | 'bearish' | 'sideways';
    strength?: 'strong' | 'moderate' | 'weak';
    details?: {
      priceSentiment: number;
      volumeSentiment: number;
      volatilitySentiment: number;
      momentumSentiment: number;
    };
  };
}

const StockCard: React.FC<StockCardProps> = ({
  stock,
  isWatched = false,
  onToggleWatch,
  sentiment
}) => {
  const isPositive = stock.change >= 0;

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
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toLocaleString();
  };

  const getSectorColor = (sector: string) => {
    const colors = {
      'Banking': 'bg-blue-100 text-blue-800',
      'IT': 'bg-purple-100 text-purple-800',
      'Oil & Gas': 'bg-orange-100 text-orange-800',
      'Automotive': 'bg-red-100 text-red-800',
      'FMCG': 'bg-green-100 text-green-800',
      'Metals': 'bg-gray-100 text-gray-800',
      'Telecom': 'bg-cyan-100 text-cyan-800',
      'Infrastructure': 'bg-yellow-100 text-yellow-800',
      'Consumer Goods': 'bg-pink-100 text-pink-800',
      'Pharma': 'bg-indigo-100 text-indigo-800',
      'Cement': 'bg-slate-100 text-slate-800',
      'Power': 'bg-emerald-100 text-emerald-800',
      'Financial Services': 'bg-blue-100 text-blue-800',
      'Insurance': 'bg-teal-100 text-teal-800',
      'Mining': 'bg-amber-100 text-amber-800',
      'Diversified': 'bg-violet-100 text-violet-800'
    };
    return colors[sector as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 10000000) {
      return `${(volume / 10000000).toFixed(1)}Cr`;
    } else if (volume >= 100000) {
      return `${(volume / 100000).toFixed(1)}L`;
    } else {
      return volume.toLocaleString();
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeBgColor = (change: number) => {
    return change >= 0 ? 'bg-green-50' : 'bg-red-50';
  };

  return (
    <Card className="stock-card group hover:shadow-lg transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-sm font-medium">
            {stock.symbol}
          </CardTitle>
          {sentiment && (
            <Badge className={getSentimentColor(sentiment.label)}>
              {sentiment.label}
            </Badge>
          )}
        </div>
        {onToggleWatch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleWatch(stock.symbol)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isWatched ? (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            ) : (
              <StarOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1 line-clamp-1">{stock.name}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {formatPrice(stock.price)}
              </span>
              <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'
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
            </div>
          </div>

          {/* Sector and Weightage */}
          {stock.sector && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Building2 className="h-3 w-3 text-muted-foreground" />
                <Badge variant="secondary" className={`text-xs ${getSectorColor(stock.sector)}`}>
                  {stock.sector}
                </Badge>
              </div>
              {stock.weightage && (
                <div className="flex items-center space-x-1">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {stock.weightage.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground">Volume</p>
              <p className="font-medium">{formatVolume(stock.volume)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Day Range</p>
              <p className="font-medium">
                ₹{stock.dayLow.toFixed(2)} - ₹{stock.dayHigh.toFixed(2)}
              </p>
            </div>
          </div>

          {stock.marketCap && (
            <div className="text-xs">
              <p className="text-muted-foreground">Market Cap</p>
              <p className="font-medium">{formatNumber(stock.marketCap)}</p>
            </div>
          )}

          {sentiment && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Sentiment Analysis</span>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${sentiment.label === 'positive' ? 'text-green-600' :
                    sentiment.label === 'negative' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                    {getSentimentIcon(sentiment.label)} {sentiment.score.toFixed(1)}/10
                  </span>
                  {sentiment.trend && (
                    <span className="text-xs text-muted-foreground">
                      {getTrendIcon(sentiment.trend)} {sentiment.trend}
                    </span>
                  )}
                </div>
              </div>

              {/* Sentiment Progress Bar */}
              <div className="w-full bg-muted rounded-full h-1.5 mb-2">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${sentiment.label === 'positive' ? 'bg-green-600' :
                    sentiment.label === 'negative' ? 'bg-red-600' : 'bg-yellow-600'
                    }`}
                  style={{ width: `${(sentiment.score / 10) * 100}%` }}
                />
              </div>

              {/* Strength and Confidence */}
              <div className="flex items-center justify-between text-xs">
                {sentiment.strength && (
                  <span className={`font-medium ${getStrengthColor(sentiment.strength)}`}>
                    {sentiment.strength} strength
                  </span>
                )}
                <span className="text-muted-foreground">
                  Confidence: {(sentiment.confidence * 100).toFixed(0)}%
                </span>
              </div>

              {/* Detailed Sentiment Metrics */}
              {sentiment.details && (
                <div className="mt-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-1 mb-2">
                    <BarChart3 className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Breakdown</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">{sentiment.details.priceSentiment.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume:</span>
                      <span className="font-medium">{sentiment.details.volumeSentiment.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volatility:</span>
                      <span className="font-medium">{sentiment.details.volatilitySentiment.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Momentum:</span>
                      <span className="font-medium">{sentiment.details.momentumSentiment.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full mt-3" asChild>
            <Link href={`/stocks/${stock.symbol}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockCard;