"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { MarketIndices, EconomicEvent } from '@/lib/external-apis';

const MarketIndicesWidget: React.FC = () => {
  const [indices, setIndices] = useState<MarketIndices | null>(null);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/market/indices');
      if (response.ok) {
        const data = await response.json();
        setIndices(data.indices);
        setEconomicEvents(data.economicEvents);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span className="text-sm font-medium">
          {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
        </span>
      </div>
    );
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="minimal-card">
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Market Indices */}
      <Card className="minimal-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Market Indices</CardTitle>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={fetchMarketData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {indices ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Nifty 50</p>
                <p className="text-xl font-bold">{indices.nifty50.value.toFixed(2)}</p>
                {formatChange(indices.nifty50.change, indices.nifty50.changePercent)}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Sensex</p>
                <p className="text-xl font-bold">{indices.sensex.value.toFixed(2)}</p>
                {formatChange(indices.sensex.change, indices.sensex.changePercent)}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Bank Nifty</p>
                <p className="text-xl font-bold">{indices.bankNifty.value.toFixed(2)}</p>
                {formatChange(indices.bankNifty.change, indices.bankNifty.changePercent)}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Nifty IT</p>
                <p className="text-xl font-bold">{indices.niftyIT.value.toFixed(2)}</p>
                {formatChange(indices.niftyIT.change, indices.niftyIT.changePercent)}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Failed to load market data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Economic Calendar */}
      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Economic Calendar
          </CardTitle>
          <CardDescription>Upcoming economic events that may impact the market</CardDescription>
        </CardHeader>
        <CardContent>
          {economicEvents.length > 0 ? (
            <div className="space-y-3">
              {economicEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <Badge className={getImpactColor(event.impact)}>
                        {event.impact}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </span>
                      <span>{event.country}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    {event.forecast && (
                      <div>
                        <span className="text-muted-foreground">Forecast: </span>
                        <span className="font-medium">{event.forecast}</span>
                      </div>
                    )}
                    {event.previous && (
                      <div>
                        <span className="text-muted-foreground">Previous: </span>
                        <span className="font-medium">{event.previous}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No upcoming events</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketIndicesWidget;