"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Activity,
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
  Volume2,
  Clock,
  Zap
} from 'lucide-react';
import { StockData } from '@/lib/stocks';
import { toast } from 'sonner';

interface RealTimeUpdate {
  id: string;
  symbol: string;
  type: 'price' | 'volume' | 'news' | 'alert';
  message: string;
  timestamp: Date;
  data?: any;
}

interface RealTimeUpdatesProps {
  stocks: StockData[];
  watchlist: string[];
  onStockUpdate?: (symbol: string, data: Partial<StockData>) => void;
}

const RealTimeUpdates: React.FC<RealTimeUpdatesProps> = ({
  stocks,
  watchlist,
  onStockUpdate
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableSound, setEnableSound] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (enableNotifications) {
      requestNotificationPermission();
    }
    
    // Simulate real-time updates since we don't have actual WebSocket
    startSimulatedUpdates();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const startSimulatedUpdates = () => {
    setIsConnected(true);
    
    // Simulate price updates every 5-15 seconds
    const interval = setInterval(() => {
      if (watchlist.length > 0) {
        const randomStock = watchlist[Math.floor(Math.random() * watchlist.length)];
        const stock = stocks.find(s => s.symbol === randomStock);
        
        if (stock) {
          simulateStockUpdate(stock);
        }
      }
    }, Math.random() * 10000 + 5000); // 5-15 seconds

    return () => clearInterval(interval);
  };

  const simulateStockUpdate = (stock: StockData) => {
    const changePercent = (Math.random() - 0.5) * 2; // -1% to +1%
    const newPrice = stock.price * (1 + changePercent / 100);
    const priceChange = newPrice - stock.price;
    
    const update: RealTimeUpdate = {
      id: Date.now().toString(),
      symbol: stock.symbol,
      type: 'price',
      message: `${stock.symbol} ${priceChange >= 0 ? 'gained' : 'lost'} ${Math.abs(changePercent).toFixed(2)}%`,
      timestamp: new Date(),
      data: {
        price: newPrice,
        change: priceChange,
        changePercent: changePercent
      }
    };

    addUpdate(update);
    
    // Notify parent component of stock update
    if (onStockUpdate) {
      onStockUpdate(stock.symbol, {
        price: newPrice,
        change: priceChange,
        changePercent: changePercent
      });
    }

    // Show notification for significant changes
    if (Math.abs(changePercent) > 0.5) {
      showNotification(update);
    }

    // Play sound for alerts
    if (enableSound && Math.abs(changePercent) > 1) {
      playNotificationSound();
    }
  };

  const addUpdate = (update: RealTimeUpdate) => {
    setUpdates(prev => [update, ...prev.slice(0, 49)]); // Keep last 50 updates
    setUpdateCount(prev => prev + 1);
  };

  const showNotification = (update: RealTimeUpdate) => {
    if (!enableNotifications || Notification.permission !== 'granted') return;

    const notification = new Notification(`${update.symbol} Price Alert`, {
      body: update.message,
      icon: '/favicon.ico',
      tag: update.symbol // Prevent duplicate notifications
    });

    setTimeout(() => notification.close(), 5000);
  };

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'price':
        return <TrendingUp className="h-4 w-4" />;
      case 'volume':
        return <Volume2 className="h-4 w-4" />;
      case 'news':
        return <Activity className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getUpdateColor = (update: RealTimeUpdate) => {
    if (update.type === 'price' && update.data) {
      return update.data.change >= 0 ? 'text-green-600' : 'text-red-600';
    }
    return 'text-blue-600';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="minimal-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              Real-Time Updates
            </CardTitle>
            <CardDescription>
              Live market data and alerts for your watchlist
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Badge variant="outline">
              {updateCount} updates
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Settings */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="notifications"
                checked={enableNotifications}
                onCheckedChange={setEnableNotifications}
              />
              <Label htmlFor="notifications">Browser Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="sound"
                checked={enableSound}
                onCheckedChange={setEnableSound}
              />
              <Label htmlFor="sound">Sound Alerts</Label>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Watching {watchlist.length} stocks
            </p>
            <p className="text-xs text-muted-foreground">
              Updates every 5-15 seconds
            </p>
          </div>
        </div>

        {/* Updates Feed */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {updates.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No updates yet</p>
              <p className="text-sm text-muted-foreground">
                Add stocks to your watchlist to see real-time updates
              </p>
            </div>
          ) : (
            updates.map((update) => (
              <div
                key={update.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={getUpdateColor(update)}>
                    {getUpdateIcon(update.type)}
                  </div>
                  <div>
                    <p className="font-medium">{update.symbol}</p>
                    <p className="text-sm text-muted-foreground">{update.message}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTime(update.timestamp)}
                  </div>
                  {update.data && update.type === 'price' && (
                    <p className={`text-sm font-medium ${update.data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{update.data.price.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Connection Status:</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Live' : 'Disconnected'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeUpdates;