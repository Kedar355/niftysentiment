// Integration with multiple free stock APIs for enhanced data
import { stockCache, marketDataCache } from './cache';

export interface ExternalStockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
  dividend?: number;
  beta?: number;
  week52High?: number;
  week52Low?: number;
  avgVolume?: number;
  sharesOutstanding?: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  sma200: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  support: number;
  resistance: number;
}

export interface MarketIndices {
  nifty50: {
    value: number;
    change: number;
    changePercent: number;
  };
  sensex: {
    value: number;
    change: number;
    changePercent: number;
  };
  bankNifty: {
    value: number;
    change: number;
    changePercent: number;
  };
  niftyIT: {
    value: number;
    change: number;
    changePercent: number;
  };
}

// Alpha Vantage API integration (free tier: 5 calls/minute, 500 calls/day)
export class AlphaVantageAPI {
  private apiKey: string;
  private baseUrl = 'https://www.alphavantage.co/query';
  private rateLimiter = new Map<string, number>();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(params: Record<string, string>): Promise<any> {
    const now = Date.now();
    const lastCall = this.rateLimiter.get('last') || 0;
    
    // Rate limiting: 5 calls per minute
    if (now - lastCall < 12000) { // 12 seconds between calls
      await new Promise(resolve => setTimeout(resolve, 12000 - (now - lastCall)));
    }

    const url = new URL(this.baseUrl);
    Object.entries({ ...params, apikey: this.apiKey }).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    this.rateLimiter.set('last', Date.now());

    const response = await fetch(url.toString());
    return response.json();
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators | null> {
    const cacheKey = `tech_${symbol}`;
    const cached = stockCache.get(cacheKey);
    if (cached) return cached;

    try {
      // Get RSI
      const rsiData = await this.makeRequest({
        function: 'RSI',
        symbol: `${symbol}.BSE`,
        interval: 'daily',
        time_period: '14',
        series_type: 'close'
      });

      // Get MACD
      const macdData = await this.makeRequest({
        function: 'MACD',
        symbol: `${symbol}.BSE`,
        interval: 'daily',
        series_type: 'close'
      });

      // Get SMA
      const sma20Data = await this.makeRequest({
        function: 'SMA',
        symbol: `${symbol}.BSE`,
        interval: 'daily',
        time_period: '20',
        series_type: 'close'
      });

      // Process and combine data
      const indicators: TechnicalIndicators = {
        rsi: this.extractLatestValue(rsiData, 'RSI') || 50,
        macd: {
          macd: this.extractLatestValue(macdData, 'MACD') || 0,
          signal: this.extractLatestValue(macdData, 'MACD_Signal') || 0,
          histogram: this.extractLatestValue(macdData, 'MACD_Hist') || 0
        },
        sma20: this.extractLatestValue(sma20Data, 'SMA') || 0,
        sma50: 0, // Would need separate call
        sma200: 0, // Would need separate call
        bollinger: {
          upper: 0,
          middle: 0,
          lower: 0
        },
        support: 0,
        resistance: 0
      };

      stockCache.set(cacheKey, indicators, 15 * 60 * 1000); // 15 minutes
      return indicators;
    } catch (error) {
      console.error('Error fetching technical indicators:', error);
      return null;
    }
  }

  private extractLatestValue(data: any, key: string): number | null {
    try {
      const timeSeries = data[`Technical Analysis: ${key}`] || data[key];
      if (!timeSeries) return null;
      
      const dates = Object.keys(timeSeries).sort().reverse();
      const latestDate = dates[0];
      return parseFloat(timeSeries[latestDate][key]);
    } catch {
      return null;
    }
  }
}

// Finnhub API integration (free tier: 60 calls/minute)
export class FinnhubAPI {
  private apiKey: string;
  private baseUrl = 'https://finnhub.io/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCompanyProfile(symbol: string): Promise<any> {
    const cacheKey = `profile_${symbol}`;
    const cached = stockCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseUrl}/stock/profile2?symbol=${symbol}&token=${this.apiKey}`
      );
      const data = await response.json();
      
      stockCache.set(cacheKey, data, 24 * 60 * 60 * 1000); // 24 hours
      return data;
    } catch (error) {
      console.error('Error fetching company profile:', error);
      return null;
    }
  }

  async getEarnings(symbol: string): Promise<any> {
    const cacheKey = `earnings_${symbol}`;
    const cached = stockCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseUrl}/stock/earnings?symbol=${symbol}&token=${this.apiKey}`
      );
      const data = await response.json();
      
      stockCache.set(cacheKey, data, 6 * 60 * 60 * 1000); // 6 hours
      return data;
    } catch (error) {
      console.error('Error fetching earnings:', error);
      return null;
    }
  }
}

// NSE/BSE API simulation (since direct APIs are restricted)
export class IndianMarketAPI {
  async getMarketIndices(): Promise<MarketIndices> {
    const cacheKey = 'market_indices';
    const cached = marketDataCache.get(cacheKey);
    if (cached) return cached;

    // Simulate real market data (in production, use actual NSE/BSE feeds)
    const indices: MarketIndices = {
      nifty50: {
        value: 19500 + Math.random() * 1000,
        change: (Math.random() - 0.5) * 200,
        changePercent: (Math.random() - 0.5) * 2
      },
      sensex: {
        value: 65000 + Math.random() * 3000,
        change: (Math.random() - 0.5) * 600,
        changePercent: (Math.random() - 0.5) * 2
      },
      bankNifty: {
        value: 44000 + Math.random() * 2000,
        change: (Math.random() - 0.5) * 400,
        changePercent: (Math.random() - 0.5) * 2.5
      },
      niftyIT: {
        value: 30000 + Math.random() * 1500,
        change: (Math.random() - 0.5) * 300,
        changePercent: (Math.random() - 0.5) * 3
      }
    };

    marketDataCache.set(cacheKey, indices, 1 * 60 * 1000); // 1 minute
    return indices;
  }

  async getAdvancedStockData(symbol: string): Promise<ExternalStockData | null> {
    const cacheKey = `advanced_${symbol}`;
    const cached = stockCache.get(cacheKey);
    if (cached) return cached;

    // Enhanced stock data simulation
    const basePrice = 1000 + Math.random() * 4000;
    const change = (Math.random() - 0.5) * 100;
    
    const data: ExternalStockData = {
      symbol,
      price: basePrice,
      change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: basePrice * Math.floor(Math.random() * 1000000000),
      pe: 15 + Math.random() * 20,
      eps: basePrice / (15 + Math.random() * 20),
      dividend: Math.random() * 5,
      beta: 0.5 + Math.random() * 1.5,
      week52High: basePrice * (1 + Math.random() * 0.3),
      week52Low: basePrice * (1 - Math.random() * 0.3),
      avgVolume: Math.floor(Math.random() * 5000000),
      sharesOutstanding: Math.floor(Math.random() * 1000000000)
    };

    stockCache.set(cacheKey, data, 2 * 60 * 1000); // 2 minutes
    return data;
  }
}

// Economic Calendar API
export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  date: string;
  time: string;
  impact: 'low' | 'medium' | 'high';
  forecast?: string;
  previous?: string;
  actual?: string;
  currency: string;
}

export class EconomicCalendarAPI {
  async getUpcomingEvents(): Promise<EconomicEvent[]> {
    const cacheKey = 'economic_events';
    const cached = marketDataCache.get(cacheKey);
    if (cached) return cached;

    // Simulate economic events
    const events: EconomicEvent[] = [
      {
        id: '1',
        title: 'RBI Interest Rate Decision',
        country: 'India',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        time: '10:00',
        impact: 'high',
        forecast: '6.50%',
        previous: '6.50%',
        currency: 'INR'
      },
      {
        id: '2',
        title: 'GDP Growth Rate',
        country: 'India',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        time: '17:30',
        impact: 'high',
        forecast: '6.2%',
        previous: '6.1%',
        currency: 'INR'
      },
      {
        id: '3',
        title: 'Inflation Rate',
        country: 'India',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        time: '17:30',
        impact: 'medium',
        forecast: '5.8%',
        previous: '5.9%',
        currency: 'INR'
      }
    ];

    marketDataCache.set(cacheKey, events, 60 * 60 * 1000); // 1 hour
    return events;
  }
}

// Initialize API instances
export const alphaVantageAPI = new AlphaVantageAPI(process.env.ALPHA_VANTAGE_API_KEY || '');
export const finnhubAPI = new FinnhubAPI(process.env.FINNHUB_API_KEY || '');
export const indianMarketAPI = new IndianMarketAPI();
export const economicCalendarAPI = new EconomicCalendarAPI();