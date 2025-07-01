// Advanced analytics and filtering system
import { StockData } from './stocks';
import { stockCache } from './cache';

export interface AdvancedFilters {
  priceRange?: { min: number; max: number };
  marketCapRange?: { min: number; max: number };
  volumeRange?: { min: number; max: number };
  changeRange?: { min: number; max: number };
  sectors?: string[];
  peRange?: { min: number; max: number };
  dividendYield?: { min: number; max: number };
  beta?: { min: number; max: number };
  sentiment?: ('positive' | 'negative' | 'neutral')[];
  technicalPattern?: string[];
  fundamentalScore?: { min: number; max: number };
}

export interface StockScreenerResult {
  stocks: StockData[];
  totalCount: number;
  filters: AdvancedFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface TechnicalPattern {
  name: string;
  description: string;
  bullish: boolean;
  confidence: number;
  timeframe: string;
}

export interface FundamentalAnalysis {
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  targetPrice?: number;
  stopLoss?: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export class AdvancedStockAnalytics {
  
  // Advanced stock screening with multiple filters
  async screenStocks(
    filters: AdvancedFilters,
    sortBy: string = 'changePercent',
    sortOrder: 'asc' | 'desc' = 'desc',
    page: number = 1,
    pageSize: number = 20
  ): Promise<StockScreenerResult> {
    
    const cacheKey = `screener_${JSON.stringify(filters)}_${sortBy}_${sortOrder}_${page}_${pageSize}`;
    const cached = stockCache.get(cacheKey);
    if (cached) return cached;

    try {
      // Get all stocks (this would come from your existing API)
      const allStocks = await this.getAllStocksWithEnhancedData();
      
      // Apply filters
      let filteredStocks = allStocks.filter(stock => this.matchesFilters(stock, filters));
      
      // Sort stocks
      filteredStocks = this.sortStocks(filteredStocks, sortBy, sortOrder);
      
      // Paginate
      const startIndex = (page - 1) * pageSize;
      const paginatedStocks = filteredStocks.slice(startIndex, startIndex + pageSize);
      
      const result: StockScreenerResult = {
        stocks: paginatedStocks,
        totalCount: filteredStocks.length,
        filters,
        sortBy,
        sortOrder,
        page,
        pageSize
      };

      stockCache.set(cacheKey, result, 2 * 60 * 1000); // 2 minutes
      return result;
      
    } catch (error) {
      console.error('Error in stock screening:', error);
      throw error;
    }
  }

  // Technical pattern recognition
  async detectTechnicalPatterns(symbol: string, timeframe: string = '1d'): Promise<TechnicalPattern[]> {
    const cacheKey = `patterns_${symbol}_${timeframe}`;
    const cached = stockCache.get(cacheKey);
    if (cached) return cached;

    // Simulate pattern detection (in production, use actual technical analysis)
    const patterns: TechnicalPattern[] = [
      {
        name: 'Bullish Engulfing',
        description: 'A bullish reversal pattern where a large green candle engulfs the previous red candle',
        bullish: true,
        confidence: 0.75,
        timeframe: '1d'
      },
      {
        name: 'Support Level',
        description: 'Price is approaching a strong support level',
        bullish: true,
        confidence: 0.65,
        timeframe: '1d'
      },
      {
        name: 'RSI Oversold',
        description: 'RSI indicates oversold conditions, potential bounce expected',
        bullish: true,
        confidence: 0.60,
        timeframe: '1d'
      }
    ];

    stockCache.set(cacheKey, patterns, 15 * 60 * 1000); // 15 minutes
    return patterns;
  }

  // Fundamental analysis scoring
  async getFundamentalAnalysis(symbol: string): Promise<FundamentalAnalysis> {
    const cacheKey = `fundamental_${symbol}`;
    const cached = stockCache.get(cacheKey);
    if (cached) return cached;

    // Simulate fundamental analysis (integrate with actual financial data)
    const analysis: FundamentalAnalysis = {
      score: 65 + Math.random() * 30, // 65-95 range
      strengths: [
        'Strong revenue growth',
        'Improving profit margins',
        'Low debt-to-equity ratio',
        'Consistent dividend payments'
      ],
      weaknesses: [
        'High P/E ratio compared to sector',
        'Declining market share in key segment'
      ],
      recommendation: 'buy',
      targetPrice: 1200 + Math.random() * 800,
      stopLoss: 800 + Math.random() * 200,
      riskLevel: 'medium'
    };

    stockCache.set(cacheKey, analysis, 24 * 60 * 60 * 1000); // 24 hours
    return analysis;
  }

  // Correlation analysis between stocks
  async getStockCorrelations(symbols: string[], period: number = 30): Promise<Record<string, Record<string, number>>> {
    const cacheKey = `correlations_${symbols.join(',')}_${period}`;
    const cached = stockCache.get(cacheKey);
    if (cached) return cached;

    // Simulate correlation matrix
    const correlations: Record<string, Record<string, number>> = {};
    
    symbols.forEach(symbol1 => {
      correlations[symbol1] = {};
      symbols.forEach(symbol2 => {
        if (symbol1 === symbol2) {
          correlations[symbol1][symbol2] = 1.0;
        } else {
          // Simulate correlation coefficient (-1 to 1)
          correlations[symbol1][symbol2] = (Math.random() - 0.5) * 2;
        }
      });
    });

    stockCache.set(cacheKey, correlations, 60 * 60 * 1000); // 1 hour
    return correlations;
  }

  // Portfolio optimization suggestions
  async getPortfolioOptimization(holdings: Array<{symbol: string, quantity: number}>): Promise<any> {
    const cacheKey = `portfolio_opt_${JSON.stringify(holdings)}`;
    const cached = stockCache.get(cacheKey);
    if (cached) return cached;

    // Simulate portfolio analysis
    const optimization = {
      currentValue: holdings.reduce((sum, holding) => sum + (holding.quantity * (1000 + Math.random() * 2000)), 0),
      riskScore: 45 + Math.random() * 40, // 45-85 range
      diversificationScore: 60 + Math.random() * 30, // 60-90 range
      suggestions: [
        {
          action: 'rebalance',
          description: 'Consider reducing exposure to IT sector (currently 35% of portfolio)',
          impact: 'Reduce risk by 8%'
        },
        {
          action: 'add',
          description: 'Add defensive stocks from FMCG sector',
          impact: 'Improve stability during market downturns'
        }
      ],
      recommendedAllocation: {
        'Banking': 25,
        'IT': 20,
        'FMCG': 15,
        'Automotive': 10,
        'Pharma': 10,
        'Others': 20
      }
    };

    stockCache.set(cacheKey, optimization, 30 * 60 * 1000); // 30 minutes
    return optimization;
  }

  // Helper methods
  private async getAllStocksWithEnhancedData(): Promise<StockData[]> {
    // This would integrate with your existing stock data API
    // For now, return mock data
    return [];
  }

  private matchesFilters(stock: StockData, filters: AdvancedFilters): boolean {
    // Price range filter
    if (filters.priceRange) {
      if (stock.price < filters.priceRange.min || stock.price > filters.priceRange.max) {
        return false;
      }
    }

    // Market cap filter
    if (filters.marketCapRange && stock.marketCap) {
      if (stock.marketCap < filters.marketCapRange.min || stock.marketCap > filters.marketCapRange.max) {
        return false;
      }
    }

    // Volume filter
    if (filters.volumeRange) {
      if (stock.volume < filters.volumeRange.min || stock.volume > filters.volumeRange.max) {
        return false;
      }
    }

    // Change percentage filter
    if (filters.changeRange) {
      if (stock.changePercent < filters.changeRange.min || stock.changePercent > filters.changeRange.max) {
        return false;
      }
    }

    // Sector filter
    if (filters.sectors && filters.sectors.length > 0) {
      if (!stock.sector || !filters.sectors.includes(stock.sector)) {
        return false;
      }
    }

    // Sentiment filter
    if (filters.sentiment && filters.sentiment.length > 0) {
      if (!stock.sentiment || !filters.sentiment.includes(stock.sentiment.label)) {
        return false;
      }
    }

    return true;
  }

  private sortStocks(stocks: StockData[], sortBy: string, sortOrder: 'asc' | 'desc'): StockData[] {
    return stocks.sort((a, b) => {
      let aValue: number, bValue: number;

      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'changePercent':
          aValue = a.changePercent;
          bValue = b.changePercent;
          break;
        case 'volume':
          aValue = a.volume;
          bValue = b.volume;
          break;
        case 'marketCap':
          aValue = a.marketCap || 0;
          bValue = b.marketCap || 0;
          break;
        case 'sentiment':
          aValue = a.sentiment?.score || 0;
          bValue = b.sentiment?.score || 0;
          break;
        default:
          aValue = a.changePercent;
          bValue = b.changePercent;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }
}

// Export singleton instance
export const stockAnalytics = new AdvancedStockAnalytics();