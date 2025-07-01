import yahooFinance from 'yahoo-finance2';

export interface SentimentData {
  label: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  sector?: string;
  weightage?: number;
  sentiment?: SentimentData;
}

export interface StockHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Nifty 50 stocks with their Yahoo Finance symbols and sector information
export const NIFTY_50_STOCKS = {
  // Banking & Financial Services (12 stocks)
  'HDFCBANK': { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', sector: 'Banking', weightage: 11.23 },
  'ICICIBANK': { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', sector: 'Banking', weightage: 7.89 },
  'SBIN': { symbol: 'SBIN.NS', name: 'State Bank of India', sector: 'Banking', weightage: 2.89 },
  'KOTAKBANK': { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank Ltd', sector: 'Banking', weightage: 3.45 },
  'AXISBANK': { symbol: 'AXISBANK.NS', name: 'Axis Bank Ltd', sector: 'Banking', weightage: 2.12 },
  'INDUSINDBK': { symbol: 'INDUSINDBK.NS', name: 'IndusInd Bank Ltd', sector: 'Banking', weightage: 0.89 },
  'BAJFINANCE': { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd', sector: 'Financial Services', weightage: 2.34 },
  'BAJAJFINSV': { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv Ltd', sector: 'Financial Services', weightage: 1.67 },
  'SBILIFE': { symbol: 'SBILIFE.NS', name: 'SBI Life Insurance Co Ltd', sector: 'Insurance', weightage: 1.23 },
  'HDFCLIFE': { symbol: 'HDFCLIFE.NS', name: 'HDFC Life Insurance Co Ltd', sector: 'Insurance', weightage: 1.12 },
  'ICICIPRULI': { symbol: 'ICICIPRULI.NS', name: 'ICICI Prudential Life Insurance Co Ltd', sector: 'Insurance', weightage: 0.89 },
  'POWERGRID': { symbol: 'POWERGRID.NS', name: 'Power Grid Corporation of India Ltd', sector: 'Power', weightage: 1.45 },

  // IT Sector (7 stocks)
  'TCS': { symbol: 'TCS.NS', name: 'Tata Consultancy Services Ltd', sector: 'IT', weightage: 4.56 },
  'INFY': { symbol: 'INFY.NS', name: 'Infosys Ltd', sector: 'IT', weightage: 3.23 },
  'WIPRO': { symbol: 'WIPRO.NS', name: 'Wipro Ltd', sector: 'IT', weightage: 1.34 },
  'HCLTECH': { symbol: 'HCLTECH.NS', name: 'HCL Technologies Ltd', sector: 'IT', weightage: 1.78 },
  'TECHM': { symbol: 'TECHM.NS', name: 'Tech Mahindra Ltd', sector: 'IT', weightage: 0.89 },
  'LTIM': { symbol: 'LTIM.NS', name: 'L&T Technology Services Ltd', sector: 'IT', weightage: 0.67 },
  'PERSISTENT': { symbol: 'PERSISTENT.NS', name: 'Persistent Systems Ltd', sector: 'IT', weightage: 0.45 },

  // Oil & Gas (4 stocks)
  'RELIANCE': { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd', sector: 'Oil & Gas', weightage: 10.23 },
  'ONGC': { symbol: 'ONGC.NS', name: 'Oil & Natural Gas Corporation Ltd', sector: 'Oil & Gas', weightage: 1.89 },
  'IOC': { symbol: 'IOC.NS', name: 'Indian Oil Corporation Ltd', sector: 'Oil & Gas', weightage: 1.23 },
  'BPCL': { symbol: 'BPCL.NS', name: 'Bharat Petroleum Corporation Ltd', sector: 'Oil & Gas', weightage: 0.89 },

  // Automotive (4 stocks)
  'MARUTI': { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India Ltd', sector: 'Automotive', weightage: 1.67 },
  'TATAMOTORS': { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd', sector: 'Automotive', weightage: 1.45 },
  'M&M': { symbol: 'M&M.NS', name: 'Mahindra & Mahindra Ltd', sector: 'Automotive', weightage: 1.23 },
  'EICHERMOT': { symbol: 'EICHERMOT.NS', name: 'Eicher Motors Ltd', sector: 'Automotive', weightage: 0.78 },

  // FMCG (4 stocks)
  'HINDUNILVR': { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd', sector: 'FMCG', weightage: 2.34 },
  'ITC': { symbol: 'ITC.NS', name: 'ITC Ltd', sector: 'FMCG', weightage: 3.45 },
  'NESTLEIND': { symbol: 'NESTLEIND.NS', name: 'Nestle India Ltd', sector: 'FMCG', weightage: 1.23 },
  'BRITANNIA': { symbol: 'BRITANNIA.NS', name: 'Britannia Industries Ltd', sector: 'FMCG', weightage: 0.89 },

  // Metals & Mining (4 stocks)
  'TATASTEEL': { symbol: 'TATASTEEL.NS', name: 'Tata Steel Ltd', sector: 'Metals', weightage: 1.45 },
  'JSWSTEEL': { symbol: 'JSWSTEEL.NS', name: 'JSW Steel Ltd', sector: 'Metals', weightage: 1.23 },
  'HINDALCO': { symbol: 'HINDALCO.NS', name: 'Hindalco Industries Ltd', sector: 'Metals', weightage: 1.12 },
  'COALINDIA': { symbol: 'COALINDIA.NS', name: 'Coal India Ltd', sector: 'Mining', weightage: 1.34 },

  // Telecom (2 stocks)
  'BHARTIARTL': { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd', sector: 'Telecom', weightage: 2.89 },
  'IDEA': { symbol: 'IDEA.NS', name: 'Vodafone Idea Ltd', sector: 'Telecom', weightage: 0.45 },

  // Infrastructure (2 stocks)
  'LT': { symbol: 'LT.NS', name: 'Larsen & Toubro Ltd', sector: 'Infrastructure', weightage: 2.12 },
  'NTPC': { symbol: 'NTPC.NS', name: 'NTPC Ltd', sector: 'Power', weightage: 1.67 },

  // Consumer Goods (2 stocks)
  'TITAN': { symbol: 'TITAN.NS', name: 'Titan Company Ltd', sector: 'Consumer Goods', weightage: 1.45 },
  'ASIANPAINT': { symbol: 'ASIANPAINT.NS', name: 'Asian Paints Ltd', sector: 'Consumer Goods', weightage: 1.23 },

  // Pharma (2 stocks)
  'SUNPHARMA': { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Industries Ltd', sector: 'Pharma', weightage: 1.34 },
  'DRREDDY': { symbol: 'DRREDDY.NS', name: 'Dr Reddy\'s Laboratories Ltd', sector: 'Pharma', weightage: 1.12 },

  // Cement (2 stocks)
  'ULTRACEMCO': { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement Ltd', sector: 'Cement', weightage: 1.45 },
  'SHREECEM': { symbol: 'SHREECEM.NS', name: 'Shree Cement Ltd', sector: 'Cement', weightage: 0.89 },

  // Others (3 stocks)
  'ADANIENT': { symbol: 'ADANIENT.NS', name: 'Adani Enterprises Ltd', sector: 'Diversified', weightage: 1.23 },
  'ADANIPORTS': { symbol: 'ADANIPORTS.NS', name: 'Adani Ports & Special Economic Zone Ltd', sector: 'Infrastructure', weightage: 1.12 },
  'HEROMOTOCO': { symbol: 'HEROMOTOCO.NS', name: 'Hero MotoCorp Ltd', sector: 'Automotive', weightage: 0.78 }
};

// Cache for stock data
const stockDataCache = new Map<string, { data: StockData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for multiple stocks data
let allStocksCache: { data: StockData[]; timestamp: number } | null = null;
const ALL_STOCKS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const getStockData = async (symbol: string): Promise<StockData | null> => {
  try {
    // Check cache first
    const cached = stockDataCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const stockInfo = NIFTY_50_STOCKS[symbol as keyof typeof NIFTY_50_STOCKS];
    if (!stockInfo) {
      console.warn(`Stock ${symbol} not found in Nifty 50`);
      return null;
    }

    const quote = await yahooFinance.quote(stockInfo.symbol);

    if (!quote) return null;

    const stockData: StockData = {
      symbol,
      name: stockInfo.name,
      price: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      volume: quote.regularMarketVolume || 0,
      marketCap: quote.marketCap,
      dayHigh: quote.regularMarketDayHigh || 0,
      dayLow: quote.regularMarketDayLow || 0,
      previousClose: quote.regularMarketPreviousClose || 0,
      sector: stockInfo.sector,
      weightage: stockInfo.weightage
    };

    // Cache the result
    stockDataCache.set(symbol, { data: stockData, timestamp: Date.now() });

    return stockData;
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return null;
  }
};

export const getStockHistory = async (symbol: string, period: string = '1mo'): Promise<StockHistory[]> => {
  try {
    const stockInfo = NIFTY_50_STOCKS[symbol as keyof typeof NIFTY_50_STOCKS];
    if (!stockInfo) {
      console.warn(`Stock ${symbol} not found in Nifty 50`);
      return [];
    }

    const history = await yahooFinance.historical(stockInfo.symbol, {
      period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      period2: new Date(),
      interval: '1d'
    });

    return history.map(item => ({
      date: item.date.toISOString().split('T')[0],
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume
    }));
  } catch (error) {
    console.error(`Error fetching stock history for ${symbol}:`, error);
    return [];
  }
};

export const getMultipleStocksData = async (symbols: string[]): Promise<StockData[]> => {
  try {
    // Check cache first
    if (allStocksCache && Date.now() - allStocksCache.timestamp < ALL_STOCKS_CACHE_DURATION) {
      return allStocksCache.data;
    }

    // Filter to only Nifty 50 stocks
    const validSymbols = symbols.filter(symbol => NIFTY_50_STOCKS[symbol as keyof typeof NIFTY_50_STOCKS]);

    // Fetch data in parallel with rate limiting
    const batchSize = 10;
    const results: StockData[] = [];

    for (let i = 0; i < validSymbols.length; i += batchSize) {
      const batch = validSymbols.slice(i, i + batchSize);
      const batchPromises = batch.map(symbol => getStockData(symbol));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(Boolean) as StockData[]);

      // Add small delay between batches to avoid rate limiting
      if (i + batchSize < validSymbols.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Cache the result
    allStocksCache = { data: results, timestamp: Date.now() };

    return results;
  } catch (error) {
    console.error('Error fetching multiple stocks data:', error);
    return [];
  }
};

export const getAllNifty50Stocks = async (): Promise<StockData[]> => {
  const symbols = Object.keys(NIFTY_50_STOCKS);
  return getMultipleStocksData(symbols);
};

export const getStocksBySector = async (sector: string): Promise<StockData[]> => {
  const sectorStocks = Object.entries(NIFTY_50_STOCKS)
    .filter(([_, info]) => info.sector === sector)
    .map(([symbol, _]) => symbol);

  return getMultipleStocksData(sectorStocks);
};

export const getTopGainers = async (limit: number = 10): Promise<StockData[]> => {
  const allStocks = await getAllNifty50Stocks();
  return allStocks
    .filter(stock => stock.change > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, limit);
};

export const getTopLosers = async (limit: number = 10): Promise<StockData[]> => {
  const allStocks = await getAllNifty50Stocks();
  return allStocks
    .filter(stock => stock.change < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, limit);
};

export const getMostActive = async (limit: number = 10): Promise<StockData[]> => {
  const allStocks = await getAllNifty50Stocks();
  return allStocks
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit);
};

// Clear cache function for manual cache management
export const clearStockCache = () => {
  stockDataCache.clear();
  allStocksCache = null;
};

// Get cache statistics
export const getCacheStats = () => {
  return {
    individualCacheSize: stockDataCache.size,
    allStocksCacheValid: allStocksCache !== null && Date.now() - allStocksCache.timestamp < ALL_STOCKS_CACHE_DURATION
  };
};